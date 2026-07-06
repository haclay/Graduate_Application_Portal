import { NextResponse } from "next/server";

import {
  buildAiPrompt,
  buildProfileSnapshot,
  buildSchoolPayload,
  requestAiMatching,
  validateAiMatchingResponse,
} from "@/lib/ai-matching/openai";
import { AI_TIER_ORDER } from "@/lib/ai-matching/types";
import type { StudentProfile } from "@/lib/profile/types";
import type { School } from "@/lib/schools/types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_AI_CANDIDATE_SCHOOLS = 70;

const MESSAGES = {
  loginRequired: "\u8bf7\u5148\u767b\u5f55\u540e\u4f7f\u7528 AI \u9009\u6821\u63a8\u8350\u3002",
  apiKeyMissing: "AI \u529f\u80fd\u5c1a\u672a\u914d\u7f6e\uff0c\u8bf7\u8054\u7cfb\u7ba1\u7406\u5458\u3002",
  profileRequired: "\u8bf7\u5148\u586b\u5199\u5b66\u751f\u80cc\u666f\u6863\u6848\u3002",
  noSchools: "\u6682\u65e0\u53ef\u7528\u4e8e AI \u63a8\u8350\u7684 active QS \u5b66\u6821\u6570\u636e\u3002",
  createRunFailed: "\u65e0\u6cd5\u521b\u5efa AI \u63a8\u8350\u8bb0\u5f55\u3002",
  genericFailed: "AI \u63a8\u8350\u751f\u6210\u5931\u8d25\u3002",
  jsonIncomplete: "AI \u8fd4\u56de JSON \u4e0d\u5b8c\u6574\uff0c\u53ef\u80fd\u8f93\u51fa\u8fc7\u957f\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002",
  outsideCandidates: "AI \u63a8\u8350\u4e86\u5019\u9009\u5217\u8868\u4e4b\u5916\u7684\u5b66\u6821\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002",
  timeout: "AI \u751f\u6210\u65f6\u95f4\u8f83\u957f\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002",
  fieldsMissing: "AI \u8fd4\u56de\u5b57\u6bb5\u7f3a\u5931\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002",
};

type RecommendationInsert = {
  ai_reason: string | null;
  fit_score: number;
  recommended_major: string | null;
  run_id: string;
  school_id: string;
  tier: string;
  user_id: string;
};

type InsertedRecommendation = {
  ai_reason: string | null;
  ai_risks: string | null;
  evidence_from_profile: string[] | null;
  evidence_from_school: string[] | null;
  fit_score: number | null;
  id: string;
  next_steps: string[] | null;
  recommended_major: string | null;
  recommended_program_keywords: string[] | null;
  run_id: string;
  school_id: string;
  tier: string;
};

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: MESSAGES.loginRequired }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: MESSAGES.apiKeyMissing }, { status: 503 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<StudentProfile>();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profile) {
    return NextResponse.json({ error: MESSAGES.profileRequired }, { status: 400 });
  }

  const { data: schools, error: schoolsError } = await supabase
    .from("schools")
    .select(
      "id, name, name_en, slug, country, city, qs_rank_2027, qs_rank_display, us_news_rank, the_rank, strong_subjects, popular_programs, school_type, student_faculty_ratio, international_student_ratio, estimated_annual_cost, is_active, is_qs_top_500, is_published",
    )
    .eq("is_active", true)
    .eq("is_qs_top_500", true)
    .eq("is_published", true)
    .order("qs_rank_2027", { ascending: true, nullsFirst: false })
    .limit(150)
    .returns<School[]>();

  if (schoolsError) {
    return NextResponse.json({ error: schoolsError.message }, { status: 500 });
  }

  const schoolList = schools ?? [];
  if (schoolList.length === 0) {
    return NextResponse.json({ error: MESSAGES.noSchools }, { status: 400 });
  }

  const profileSnapshot = buildProfileSnapshot(profile);
  const candidateSchools = selectCandidateSchools(profileSnapshot, schoolList);
  const { data: run, error: runError } = await supabase
    .from("ai_recommendation_runs")
    .insert({
      user_id: user.id,
      profile_snapshot: profileSnapshot,
      status: "pending",
    })
    .select("id")
    .single<{ id: string }>();

  if (runError || !run) {
    return NextResponse.json({ error: runError?.message ?? MESSAGES.createRunFailed }, { status: 500 });
  }

  try {
    const aiResponse = await generateValidatedAiResponse({
      profileSnapshot,
      schools: candidateSchools,
    });

    const rows: RecommendationInsert[] = AI_TIER_ORDER.flatMap((tier) =>
      aiResponse.tiers[tier].map((item) => ({
        run_id: run.id,
        user_id: user.id,
        school_id: item.school_id,
        tier,
        recommended_major: item.recommended_major || null,
        ai_reason: "AI generated this recommendation from the user's background and school direction data.",
        fit_score: item.fit_score,
      })),
    );

    const { data: recommendations, error: insertError } = await supabase
      .from("ai_school_recommendations")
      .insert(rows)
      .select(
        "id, run_id, school_id, tier, recommended_major, recommended_program_keywords, ai_reason, ai_risks, next_steps, evidence_from_profile, evidence_from_school, fit_score",
      )
      .returns<InsertedRecommendation[]>();

    if (insertError) {
      throw new Error(insertError.message);
    }

    const { error: completeError } = await supabase
      .from("ai_recommendation_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        error_message: null,
        user_profile_analysis: aiResponse.user_profile_analysis,
        recommendation_plan: aiResponse.recommendation_plan,
        ai_summary: aiResponse.user_profile_analysis.overall_summary,
        disclaimer: aiResponse.disclaimer,
      })
      .eq("id", run.id)
      .eq("user_id", user.id);

    if (completeError) {
      throw new Error(completeError.message);
    }

    return NextResponse.json({
      run_id: run.id,
      user_profile_analysis: aiResponse.user_profile_analysis,
      recommendation_plan: aiResponse.recommendation_plan,
      disclaimer: aiResponse.disclaimer,
      recommendations: recommendations ?? [],
    });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : MESSAGES.genericFailed;
    const publicMessage = toPublicAiError(rawMessage);
    await supabase
      .from("ai_recommendation_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: publicMessage,
      })
      .eq("id", run.id)
      .eq("user_id", user.id);

    return NextResponse.json({ error: publicMessage, run_id: run.id }, { status: 500 });
  }
}

async function generateValidatedAiResponse({
  profileSnapshot,
  schools,
}: {
  profileSnapshot: ReturnType<typeof buildProfileSnapshot>;
  schools: School[];
}) {
  let validationFeedback: string | undefined;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const rawResponse = await requestAiMatching(
        buildAiPrompt({
          profileSnapshot,
          schools: buildSchoolPayload(schools),
          validationFeedback,
        }),
      );
      return validateAiMatchingResponse(rawResponse, schools);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI_OUTPUT_INVALID";
      if (!shouldRetryAiResponse(message) || attempt === 1) {
        throw error;
      }
      validationFeedback = message;
    }
  }

  throw new Error("AI_JSON_INCOMPLETE");
}

function shouldRetryAiResponse(message: string) {
  return [
    "AI_JSON_INCOMPLETE",
    "AI_OUTPUT_NOT_OBJECT",
    "AI_TIERS_MISSING",
    "AI_RECOMMENDED_OUTSIDE_CANDIDATES",
    "AI_MISSING_REQUIRED_FIELDS",
    "AI_PROFILE_ANALYSIS_MISSING",
    "OPENAI_EMPTY_RESPONSE",
  ].some((code) => message.includes(code));
}

function toPublicAiError(message: string) {
  if (message.includes("OPENAI_API_KEY_MISSING")) {
    return MESSAGES.apiKeyMissing;
  }
  if (message.includes("AI_TIMEOUT")) {
    return MESSAGES.timeout;
  }
  if (message.includes("AI_JSON_INCOMPLETE") || message.includes("AI_OUTPUT_NOT_OBJECT")) {
    return MESSAGES.jsonIncomplete;
  }
  if (message.includes("AI_RECOMMENDED_OUTSIDE_CANDIDATES")) {
    return MESSAGES.outsideCandidates;
  }
  if (message.includes("AI_TIERS_MISSING") || message.includes("AI_MISSING_REQUIRED_FIELDS") || message.includes("AI_PROFILE_ANALYSIS_MISSING")) {
    return MESSAGES.fieldsMissing;
  }
  if (message.includes("OPENAI_API_ERROR")) {
    return `OpenAI API ${MESSAGES.genericFailed}`;
  }
  return message || MESSAGES.genericFailed;
}

function selectCandidateSchools(profileSnapshot: ReturnType<typeof buildProfileSnapshot>, schools: School[]) {
  const targetCountries = toStringArray(profileSnapshot.target_countries ?? profileSnapshot.preferred_countries).map(normalizeToken);
  const targetMajors = toStringArray(profileSnapshot.target_majors ?? profileSnapshot.preferred_programs).flatMap(expandMajorKeywords).map(normalizeToken);
  const hasTargets = targetCountries.length > 0 || targetMajors.length > 0;

  if (!hasTargets) {
    return schools.slice(0, MAX_AI_CANDIDATE_SCHOOLS);
  }

  const scored = schools.map((school) => ({ school, score: scoreSchool(school, targetCountries, targetMajors) }));
  const bands = [
    { cap: 15, maxRank: 30, minRank: 1 },
    { cap: 25, maxRank: 80, minRank: 31 },
    { cap: 30, maxRank: 150, minRank: 81 },
  ];

  const selected: School[] = [];
  for (const band of bands) {
    const bandItems = scored
      .filter(({ school }) => {
        const rank = school.qs_rank_2027 ?? 999;
        return rank >= band.minRank && rank <= band.maxRank;
      })
      .sort((a, b) => b.score - a.score || (a.school.qs_rank_2027 ?? 999) - (b.school.qs_rank_2027 ?? 999))
      .slice(0, band.cap)
      .map(({ school }) => school);
    selected.push(...bandItems);
  }

  const selectedIds = new Set(selected.map((school) => school.id));
  for (const school of schools) {
    if (selected.length >= MAX_AI_CANDIDATE_SCHOOLS) {
      break;
    }
    if (!selectedIds.has(school.id)) {
      selected.push(school);
      selectedIds.add(school.id);
    }
  }

  return selected.slice(0, MAX_AI_CANDIDATE_SCHOOLS);
}

function scoreSchool(school: School, targetCountries: string[], targetMajors: string[]) {
  const rank = school.qs_rank_2027 ?? 999;
  let score = Math.max(0, 160 - rank);
  if (targetCountries.length && targetCountries.includes(normalizeToken(school.country))) {
    score += 70;
  }

  const schoolKeywords = [school.name, school.country, school.city, ...(school.strong_subjects ?? []), ...(school.popular_programs ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (targetMajors.length && targetMajors.some((keyword) => schoolKeywords.includes(keyword))) {
    score += 90;
  }

  return score;
}

function expandMajorKeywords(value: string) {
  const normalized = normalizeToken(value);
  const map: Record<string, string[]> = {
    "computer science": ["computer science", "computing", "software", "cs"],
    cs: ["computer science", "computing", "software", "cs"],
    "data science": ["data science", "data analytics", "statistics", "machine learning", "ai"],
    "artificial intelligence": ["artificial intelligence", "machine learning", "ai", "data science"],
    ece: ["electrical", "computer engineering", "engineering"],
    "electrical and computer engineering": ["electrical", "computer engineering", "engineering"],
    "business analytics": ["business analytics", "management", "analytics", "finance"],
    finance: ["finance", "business", "economics"],
    "engineering management": ["engineering management", "management", "engineering"],
  };

  return map[normalized] ?? [normalized];
}

function toStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeToken(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
