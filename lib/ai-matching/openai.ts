import type { StudentProfile } from "@/lib/profile/types";
import type { School } from "@/lib/schools/types";
import {
  AI_DYNAMIC_QUANTITY_NOTE,
  AI_RECOMMENDATION_DISCLAIMER,
  AI_TIER_ORDER,
  AI_TIER_QUANTITY_RULES,
} from "@/lib/ai-matching/types";
import type {
  AiMatchingResponse,
  AiMatchingResponseItem,
  AiMatchingTier,
  RecommendationPlan,
  UserProfileAnalysis,
} from "@/lib/ai-matching/types";

const MAX_PROFILE_TEXT_LENGTH = 1200;
const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_TIMEOUT_MS = 75_000;

export function buildProfileSnapshot(profile: StudentProfile) {
  const extra = profile as unknown as Record<string, unknown>;

  return {
    full_name: profile.full_name,
    nickname: profile.nickname,
    undergraduate_country: profile.undergraduate_country,
    undergraduate_school: profile.undergraduate_school,
    undergraduate_major: profile.undergraduate_major,
    current_year: profile.current_year,
    gpa: profile.gpa,
    gpa_scale: profile.gpa_scale,
    ielts: profile.ielts,
    toefl: profile.toefl,
    gre: profile.gre,
    gmat: profile.gmat,
    test_scores: profile.test_scores,
    target_countries: profile.target_countries,
    target_majors: profile.target_majors,
    research_experience: truncateText(profile.research_experience),
    internship_experience: truncateText(profile.internship_experience),
    project_experience: truncateText(profile.project_experience),
    competition_experience: truncateText(profile.competition_experience),
    future_goal: truncateText(profile.future_goal),
    budget_range: profile.budget_range,
    planned_entry_year: profile.planned_entry_year,
    publications: extra.publications ?? null,
    awards: extra.awards ?? null,
    skills: extra.skills ?? null,
    other_background: extra.other_background ?? null,
    preferred_budget: extra.preferred_budget ?? profile.budget_range ?? null,
    preferred_school_type: extra.preferred_school_type ?? null,
    preferred_countries: extra.preferred_countries ?? profile.target_countries ?? null,
    preferred_programs: extra.preferred_programs ?? profile.target_majors ?? null,
    profile_extra: extra.profile_extra ?? null,
    experiences: extra.experiences ?? null,
  };
}

export function buildSchoolPayload(schools: School[]) {
  return schools.slice(0, 70).map((school) => ({
    id: school.id,
    name: school.name,
    country: school.country,
    city: school.city,
    qs_rank_2027: school.qs_rank_2027,
    us_news_rank: school.us_news_rank,
    the_rank: school.the_rank,
    strong_subjects: school.strong_subjects,
    popular_programs: school.popular_programs,
    school_type: school.school_type,
    estimated_annual_cost: school.estimated_annual_cost,
  }));
}

export function buildAiSystemPrompt() {
  return [
    "You are MyGrad's graduate application planning AI assistant. Generate personalized graduate school recommendations from the user's full profile and the provided school database.",
    "Before recommending schools, read every available user field: undergraduate school, country/region, major, year, GPA, GPA scale, language tests, GRE/GMAT/Duolingo, target countries, target majors, research, internships, projects, competitions, publications, awards, skills, and additional background.",
    "First produce user_profile_analysis with overall_summary, target_direction_summary, academic_strengths, academic_weaknesses, research_strengths, internship_strengths, project_strengths, language_test_analysis, application_risks, improvement_suggestions, and recommended_strategy.",
    "When recommending schools, use the candidate school data: QS 2027 rank, country/city, US News rank, THE rank, strong_subjects, popular_programs, school_type, and estimated_annual_cost when available. Do not rely only on GPA or rank.",
    "Only use three tiers: reach, match, safe. Do not recommend schools outside candidate_schools. Do not invent admission probabilities, official requirements, deadlines, or program details.",
    "Quantity targets are guidance, not hard limits: reach target 5 acceptable 4-6; match target 10 acceptable 8-12; safe target 3 acceptable 2-4.",
    "Each school may appear only once across all tiers. fit_score is an integer from 0 to 100 and is a planning fit score, not an admission probability.",
    "Each recommendation item must only include school_id, school_name, country, city, qs_rank_2027, tier, recommended_major, and fit_score.",
    "Keep user profile analysis compact: overall_summary max 120 Chinese characters, recommended_strategy max 150 Chinese characters, each strengths/risks/suggestions array max 5 items.",
    "Return strict JSON only. Do not output markdown or explanatory text outside JSON.",
  ].join("\n");
}

export function buildAiPrompt({
  profileSnapshot,
  schools,
  validationFeedback,
}: {
  profileSnapshot: ReturnType<typeof buildProfileSnapshot>;
  schools: ReturnType<typeof buildSchoolPayload>;
  validationFeedback?: string;
}) {
  return [
    "Return strict JSON for the given student_profile and candidate_schools.",
    "Every recommendation item should use school_id from candidate_schools. If school_id is unavailable, school_name must exactly match one candidate school name.",
    validationFeedback ? `Previous output failed server validation: ${validationFeedback}. Fix only that issue and keep the schema.` : null,
    "Output schema example:",
    JSON.stringify(outputSchemaExample),
    "student_profile:",
    JSON.stringify(profileSnapshot),
    "candidate_schools:",
    JSON.stringify(schools),
  ]
    .filter(Boolean)
    .join("\n\n");
}

const outputSchemaExample = {
  user_profile_analysis: {
    overall_summary: "string",
    target_direction_summary: "string",
    academic_strengths: ["string"],
    academic_weaknesses: ["string"],
    research_strengths: ["string"],
    internship_strengths: ["string"],
    project_strengths: ["string"],
    language_test_analysis: ["string"],
    application_risks: ["string"],
    improvement_suggestions: ["string"],
    recommended_strategy: "string",
  },
  recommendation_plan: {
    reach_target: 5,
    match_target: 10,
    safe_target: 3,
    reach_actual: 0,
    match_actual: 0,
    safe_actual: 0,
    strategy_summary: "string",
    quantity_note: AI_DYNAMIC_QUANTITY_NOTE,
  },
  tiers: {
    reach: [recommendationExample("reach")],
    match: [recommendationExample("match")],
    safe: [recommendationExample("safe")],
  },
  disclaimer: AI_RECOMMENDATION_DISCLAIMER,
};

function recommendationExample(tier: AiMatchingTier): AiMatchingResponseItem {
  return {
    school_id: "string",
    school_name: "string",
    country: "string",
    city: "string | null",
    qs_rank_2027: 0,
    tier,
    recommended_major: "string",
    fit_score: 0,
  };
}

export async function requestAiMatching(prompt: string): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY_MISSING");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildAiSystemPrompt() },
          { role: "user", content: prompt },
        ],
        max_tokens: 3500,
        response_format: { type: "json_object" },
        temperature: 0.15,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OPENAI_API_ERROR:${response.status}:${errorText.slice(0, 500)}`);
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OPENAI_EMPTY_RESPONSE");
    }

    try {
      return JSON.parse(content) as unknown;
    } catch {
      throw new Error("AI_JSON_INCOMPLETE");
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("AI_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function validateAiMatchingResponse(raw: unknown, candidateSchools: School[]): AiMatchingResponse {
  const value = asRecord(raw, "AI_OUTPUT_NOT_OBJECT");
  const candidateById = new Map(candidateSchools.map((school) => [school.id, school]));
  const candidateByName = new Map(candidateSchools.map((school) => [normalizeName(school.name), school]));
  const usedSchoolIds = new Set<string>();

  const userProfileAnalysis = normalizeUserProfileAnalysis(value.user_profile_analysis);
  const tiersRecord = asRecord(value.tiers, "AI_TIERS_MISSING");
  const tiers = {} as AiMatchingResponse["tiers"];
  const invalidReasons: string[] = [];

  for (const tier of AI_TIER_ORDER) {
    const rawItems = tiersRecord[tier];
    if (!Array.isArray(rawItems)) {
      throw new Error("AI_TIERS_MISSING");
    }

    tiers[tier] = [];
    for (const rawItem of rawItems) {
      const result = normalizeRecommendationItem(rawItem, tier, candidateById, candidateByName, usedSchoolIds);
      if (result.item) {
        tiers[tier].push(result.item);
      } else if (result.invalidReason) {
        invalidReasons.push(result.invalidReason);
      }
    }
  }

  const validCount = AI_TIER_ORDER.reduce((sum, tier) => sum + tiers[tier].length, 0);
  if (validCount < 5) {
    throw new Error("AI_MISSING_REQUIRED_FIELDS");
  }
  if (invalidReasons.length >= 5) {
    throw new Error(`AI_RECOMMENDED_OUTSIDE_CANDIDATES:${invalidReasons.slice(0, 3).join(";")}`);
  }

  return {
    user_profile_analysis: userProfileAnalysis,
    recommendation_plan: normalizeRecommendationPlan(value.recommendation_plan, tiers),
    tiers,
    disclaimer: AI_RECOMMENDATION_DISCLAIMER,
  };
}

function normalizeUserProfileAnalysis(raw: unknown): UserProfileAnalysis {
  const value = asRecord(raw, "AI_PROFILE_ANALYSIS_MISSING");

  return {
    overall_summary: limitText(pickString(value.overall_summary) || fallbackText("overall_summary"), 180),
    target_direction_summary: limitText(pickString(value.target_direction_summary) || fallbackText("target_direction_summary"), 220),
    academic_strengths: limitArray(asStringArrayLoose(value.academic_strengths), 5),
    academic_weaknesses: limitArray(asStringArrayLoose(value.academic_weaknesses), 5),
    research_strengths: limitArray(asStringArrayLoose(value.research_strengths), 5),
    internship_strengths: limitArray(asStringArrayLoose(value.internship_strengths), 5),
    project_strengths: limitArray(asStringArrayLoose(value.project_strengths), 5),
    language_test_analysis: limitArray(asStringArrayLoose(value.language_test_analysis), 5),
    application_risks: limitArray(asStringArrayLoose(value.application_risks), 5),
    improvement_suggestions: limitArray(asStringArrayLoose(value.improvement_suggestions), 5),
    recommended_strategy: limitText(pickString(value.recommended_strategy) || fallbackText("recommended_strategy"), 240),
  };
}

function normalizeRecommendationPlan(raw: unknown, tiers: AiMatchingResponse["tiers"]): RecommendationPlan {
  const value = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};

  return {
    reach_target: AI_TIER_QUANTITY_RULES.reach.target,
    match_target: AI_TIER_QUANTITY_RULES.match.target,
    safe_target: AI_TIER_QUANTITY_RULES.safe.target,
    reach_actual: tiers.reach.length,
    match_actual: tiers.match.length,
    safe_actual: tiers.safe.length,
    strategy_summary: limitText(pickString(value.strategy_summary) || fallbackText("strategy_summary"), 280),
    quantity_note: pickString(value.quantity_note) || AI_DYNAMIC_QUANTITY_NOTE,
  };
}

function normalizeRecommendationItem(
  raw: unknown,
  tier: AiMatchingTier,
  candidateById: Map<string, School>,
  candidateByName: Map<string, School>,
  usedSchoolIds: Set<string>,
): { invalidReason?: string; item?: AiMatchingResponseItem } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { invalidReason: "item_not_object" };
  }

  const value = raw as Record<string, unknown>;
  const schoolIdInput = pickString(value.school_id ?? value.schoolId);
  const schoolNameInput = pickString(value.school_name ?? value.schoolName ?? value.name);
  const school = (schoolIdInput ? candidateById.get(schoolIdInput) : undefined) ?? (schoolNameInput ? candidateByName.get(normalizeName(schoolNameInput)) : undefined);

  if (!school) {
    return { invalidReason: schoolNameInput || schoolIdInput || "unknown_school" };
  }

  if (usedSchoolIds.has(school.id)) {
    return { invalidReason: `duplicate:${school.name}` };
  }
  usedSchoolIds.add(school.id);

  const fitScore = parseScore(value.fit_score ?? value.fitScore ?? value.score);
  if (fitScore === null) {
    return { invalidReason: `missing_score:${school.name}` };
  }

  return {
    item: {
      school_id: school.id,
      school_name: school.name,
      country: school.country,
      city: school.city,
      qs_rank_2027: school.qs_rank_2027,
      tier,
      recommended_major: pickString(value.recommended_major ?? value.recommendedMajor ?? value.major) || "Direction to be confirmed",
      fit_score: fitScore,
    },
  };
}

function asRecord(value: unknown, errorMessage: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(errorMessage);
  }
  return value as Record<string, unknown>;
}

function asStringArrayLoose(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => pickString(item)).filter((item): item is string => Boolean(item));
}

function pickString(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function parseScore(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampScore(value);
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? clampScore(parsed) : null;
  }
  return null;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function limitArray<T>(values: T[], max: number) {
  return values.slice(0, max);
}

function limitText(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

function fallbackText(field: string) {
  return `AI did not provide ${field}; please regenerate if this section is important.`;
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value: string | null) {
  if (!value) {
    return null;
  }
  return value.length > MAX_PROFILE_TEXT_LENGTH ? `${value.slice(0, MAX_PROFILE_TEXT_LENGTH)}...` : value;
}
