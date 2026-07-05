import type { ProgramDeadline } from "@/lib/programs/types";
import type { School } from "@/lib/schools/types";
import type {
  MatchingInput,
  MatchingProgram,
  MatchingResult,
  MatchingTier,
} from "@/lib/matching/types";
import {
  clampScore,
  findNearestDeadline,
  hasText,
  includesAny,
  normalizeGpa,
} from "@/lib/matching/utils";

const directionKeywords = [
  {
    label: "Computer Science",
    keywords: ["cs", "computer science", "computing", "software", "计算机"],
  },
  {
    label: "ECE",
    keywords: [
      "ece",
      "electrical and computer engineering",
      "electrical engineering",
      "computer engineering",
      "电子",
      "电气",
    ],
  },
  {
    label: "Data Science",
    keywords: [
      "data science",
      "data analytics",
      "ai",
      "artificial intelligence",
      "machine learning",
      "数据",
      "人工智能",
      "机器学习",
    ],
  },
  {
    label: "Business Analytics",
    keywords: [
      "business analytics",
      "management",
      "finance",
      "analytics",
      "商业分析",
      "管理",
      "金融",
    ],
  },
];

function getTier(score: number): MatchingTier {
  // MVP 初版规则：该分档只用于申请规划参考，不代表真实录取概率。
  // 后续可以加入项目难度、历史案例、学校偏好和人工审核。
  if (score >= 80) {
    return "safe";
  }

  if (score >= 65) {
    return "match";
  }

  if (score >= 50) {
    return "reach";
  }

  return "lottery";
}

function scoreGpa(
  profile: MatchingInput["profile"],
  reasons: string[],
  risks: string[],
  improvements: string[],
) {
  const normalizedGpa = normalizeGpa(profile.gpa, profile.gpa_scale);

  if (normalizedGpa === null) {
    risks.push("GPA 未填写，推荐结果可能不准确。");
    improvements.push("补充 GPA 和 GPA 满分制，提升推荐准确度。");
    return 0;
  }

  if (normalizedGpa >= 3.8) {
    reasons.push("你的 GPA 处于较有竞争力区间。");
    return 30;
  }

  if (normalizedGpa >= 3.6) {
    reasons.push("你的 GPA 对多数项目具有一定竞争力。");
    return 24;
  }

  if (normalizedGpa >= 3.3) {
    reasons.push("你的 GPA 具备基础竞争力。");
    improvements.push("在文书中突出课程表现、项目经历和成长趋势。");
    return 18;
  }

  if (normalizedGpa >= 3.0) {
    risks.push("GPA 竞争力一般，需要用经历和文书补强。");
    improvements.push("突出高阶课程、科研/实习项目和推荐信亮点。");
    return 10;
  }

  risks.push("GPA 偏低，申请该项目可能存在明显风险。");
  improvements.push("优先补强项目经历、推荐信和目标方向匹配度。");
  return 3;
}

function scoreLanguage(
  profile: MatchingInput["profile"],
  reasons: string[],
  risks: string[],
  improvements: string[],
) {
  const ieltsScore =
    profile.ielts === null || profile.ielts === undefined
      ? null
      : profile.ielts >= 7.5
        ? 15
        : profile.ielts >= 7
          ? 12
          : profile.ielts >= 6.5
            ? 8
            : -8;
  const toeflScore =
    profile.toefl === null || profile.toefl === undefined
      ? null
      : profile.toefl >= 105
        ? 15
        : profile.toefl >= 100
          ? 12
          : profile.toefl >= 90
            ? 8
            : -8;
  const bestScore = Math.max(ieltsScore ?? Number.NEGATIVE_INFINITY, toeflScore ?? Number.NEGATIVE_INFINITY);

  if (bestScore === Number.NEGATIVE_INFINITY) {
    risks.push("语言成绩未填写，请确认项目语言要求。");
    improvements.push("补充 IELTS 或 TOEFL 成绩。");
    return 0;
  }

  if (bestScore >= 12) {
    reasons.push("你的语言成绩对申请有正向支持。");
  } else if (bestScore >= 8) {
    reasons.push("你的语言成绩达到基础可用区间。");
  } else {
    risks.push("当前语言成绩可能低于部分项目要求。");
    improvements.push("继续提升语言成绩，并核对项目最低要求。");
  }

  return bestScore;
}

function getDirectionMatch(
  targetMajors: string[] | null,
  program: MatchingProgram,
) {
  const targets = targetMajors ?? [];
  const targetText = targets.join(" ").toLowerCase();
  const programText = [
    program.field,
    program.name,
    program.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!targetText.trim()) {
    return "missing" as const;
  }

  const targetGroups = directionKeywords.filter((group) =>
    group.keywords.some((keyword) => targetText.includes(keyword.toLowerCase())),
  );
  const programGroups = directionKeywords.filter((group) =>
    group.keywords.some((keyword) => programText.includes(keyword.toLowerCase())),
  );

  if (
    targetGroups.length > 0 &&
    programGroups.some((group) =>
      targetGroups.some((targetGroup) => targetGroup.label === group.label),
    )
  ) {
    return "high" as const;
  }

  if (
    targets.some((target) => programText.includes(target.toLowerCase())) ||
    targetGroups.length > 0 ||
    programGroups.length > 0
  ) {
    return "partial" as const;
  }

  return "low" as const;
}

function scoreDirection(
  profile: MatchingInput["profile"],
  program: MatchingProgram,
  reasons: string[],
  risks: string[],
  improvements: string[],
) {
  const match = getDirectionMatch(profile.target_majors, program);

  if (match === "high") {
    reasons.push("你的目标方向与该项目方向匹配。");
    return 20;
  }

  if (match === "partial") {
    reasons.push("你的目标方向与该项目有一定关联。");
    improvements.push("在 SOP 中突出与该项目方向相关的课程和经历。");
    return 10;
  }

  if (match === "missing") {
    risks.push("目标专业方向未填写，方向匹配度可能不准确。");
    improvements.push("补充目标专业方向，帮助系统判断项目匹配度。");
    return 0;
  }

  risks.push("目标方向与项目方向匹配度较低。");
  improvements.push("确认该项目是否真的符合你的长期方向。");
  return -10;
}

function scoreCountry(
  profile: MatchingInput["profile"],
  school: School | null,
  reasons: string[],
  risks: string[],
  improvements: string[],
) {
  const targets = profile.target_countries ?? [];

  if (targets.length === 0) {
    risks.push("目标国家未填写。");
    improvements.push("补充目标国家或地区，方便筛选更合适的项目。");
    return 0;
  }

  if (school && targets.some((country) => country.toLowerCase() === school.country.toLowerCase())) {
    reasons.push("该项目所在国家符合你的目标国家偏好。");
    return 10;
  }

  risks.push("该项目所在国家不在你的目标国家中。");
  improvements.push("确认你是否愿意把该国家纳入申请范围。");
  return -5;
}

function scoreExperiences(
  profile: MatchingInput["profile"],
  reasons: string[],
  improvements: string[],
) {
  let score = 0;
  const hasResearch = hasText(profile.research_experience);
  const hasInternship = hasText(profile.internship_experience);
  const hasProject = hasText(profile.project_experience);
  const hasCompetition = hasText(profile.competition_experience);
  const futureGoal = profile.future_goal ?? "";

  if (hasResearch) {
    score += 8;
    reasons.push("你的科研经历可以支持申请材料。");
  }

  if (hasInternship) {
    score += 8;
    reasons.push("你的实习经历可以体现实践能力。");
  }

  if (hasProject) {
    score += 6;
    reasons.push("你的项目经历可以帮助展示技术和执行能力。");
  }

  if (hasCompetition) {
    score += 4;
    reasons.push("你的竞赛经历可以作为补充亮点。");
  }

  if (includesAny(futureGoal, ["读博", "phd"]) && hasResearch) {
    score += 5;
    reasons.push("你的读博目标与科研经历有一定一致性。");
  }

  if (includesAny(futureGoal, ["就业", "work"]) && hasInternship) {
    score += 5;
    reasons.push("你的就业目标与实习经历有一定一致性。");
  }

  if (!hasResearch && !hasInternship && !hasProject && !hasCompetition) {
    improvements.push("完善科研、实习、项目或竞赛经历描述。");
  }

  return score;
}

function addRequirementRisks(
  profile: MatchingInput["profile"],
  program: MatchingProgram,
  risks: string[],
  improvements: string[],
) {
  const greGmatText = program.gre_gmat_requirements?.toLowerCase() ?? "";

  if (
    greGmatText.includes("required") &&
    !greGmatText.includes("not required") &&
    !profile.gre &&
    !profile.gmat
  ) {
    risks.push("GRE/GMAT 可能为必需，但你的 GRE/GMAT 未填写。");
    improvements.push("进一步核对官网 GRE/GMAT 要求，并补充成绩。");
  } else if (greGmatText.includes("optional")) {
    risks.push("GRE/GMAT 标注为 optional，可确认提交后是否有助于增强申请。");
  }

  if (hasText(program.prerequisites)) {
    risks.push("请确认你是否满足该项目先修课要求。");
    improvements.push("核对官网先修课，并在申请材料中说明相关课程或补充学习。");
  }
}

function ensureMinimumFeedback(
  reasons: string[],
  risks: string[],
  improvements: string[],
) {
  if (reasons.length < 2) {
    reasons.push("该项目已纳入当前学校与项目数据库，可作为初步规划候选。");
  }

  risks.push("当前数据为平台整理信息，最终请以官网为准。");

  if (improvements.length === 0) {
    improvements.push("进一步核对官网 DDL 和申请材料。");
  } else if (!improvements.some((item) => item.includes("官网"))) {
    improvements.push("进一步核对官网 DDL 和申请材料。");
  }
}

export function generateRecommendations({
  deadlines,
  profile,
  programs,
  schools,
}: MatchingInput): MatchingResult[] {
  return programs
    .map((program) => {
      const school = schools.find((item) => item.id === program.school_id) ?? null;
      const programDeadlines = deadlines.filter(
        (deadline) => deadline.program_id === program.id,
      );
      const reasons: string[] = [];
      const risks: string[] = [];
      const improvements: string[] = [];
      let score = 20;

      score += scoreGpa(profile, reasons, risks, improvements);
      score += scoreLanguage(profile, reasons, risks, improvements);
      score += scoreDirection(profile, program, reasons, risks, improvements);
      score += scoreCountry(profile, school, reasons, risks, improvements);
      score += scoreExperiences(profile, reasons, improvements);
      addRequirementRisks(profile, program, risks, improvements);
      ensureMinimumFeedback(reasons, risks, improvements);

      const finalScore = clampScore(score);

      return {
        improvements: improvements.slice(0, 4),
        nearestDeadline: findNearestDeadline(programDeadlines),
        program,
        reasons: reasons.slice(0, 4),
        risks: risks.slice(0, 4),
        school,
        score: finalScore,
        tier: getTier(finalScore),
      };
    })
    .sort((a, b) => b.score - a.score);
}
