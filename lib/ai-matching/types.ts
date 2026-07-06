import type { MatchingTier } from "@/lib/matching/types";
import type { School } from "@/lib/schools/types";

export type AiMatchingTier = Exclude<MatchingTier, "lottery">;

export type AiSchoolCandidate = Pick<
  School,
  | "id"
  | "name"
  | "name_en"
  | "slug"
  | "country"
  | "city"
  | "qs_rank_2027"
  | "qs_rank_display"
  | "us_news_rank"
  | "the_rank"
  | "strong_subjects"
  | "popular_programs"
  | "school_type"
  | "student_faculty_ratio"
  | "international_student_ratio"
  | "estimated_annual_cost"
>;

export type UserProfileAnalysis = {
  academic_strengths: string[];
  academic_weaknesses: string[];
  application_risks: string[];
  improvement_suggestions: string[];
  internship_strengths: string[];
  language_test_analysis: string[];
  overall_summary: string;
  project_strengths: string[];
  recommended_strategy: string;
  research_strengths: string[];
  target_direction_summary: string;
};

export type RecommendationPlan = {
  match_actual: number;
  match_target: number;
  quantity_note: string;
  reach_actual: number;
  reach_target: number;
  safe_actual: number;
  safe_target: number;
  strategy_summary: string;
};

export type AiMatchingResponseItem = {
  city: string | null;
  country: string;
  fit_score: number;
  qs_rank_2027: number | null;
  recommended_major: string;
  school_id: string;
  school_name: string;
  tier: AiMatchingTier;
};

export type AiMatchingResponse = {
  disclaimer: string;
  recommendation_plan: RecommendationPlan;
  tiers: Record<AiMatchingTier, AiMatchingResponseItem[]>;
  user_profile_analysis: UserProfileAnalysis;
};

export type AiRecommendationItem = {
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
  school: AiSchoolCandidate | null;
  school_id: string;
  tier: MatchingTier;
};

export type AiRecommendationRun = {
  ai_summary: string | null;
  completed_at: string | null;
  created_at: string;
  disclaimer: string | null;
  error_message: string | null;
  id: string;
  profile_snapshot: Record<string, unknown> | null;
  recommendation_plan: RecommendationPlan | null;
  status: "pending" | "completed" | "failed";
  user_id: string;
  user_profile_analysis: UserProfileAnalysis | null;
};

export const AI_TIER_ORDER: AiMatchingTier[] = ["reach", "match", "safe"];

export const AI_TIER_LABELS: Record<AiMatchingTier, string> = {
  reach: "\u51b2\u523a",
  match: "\u5339\u914d",
  safe: "\u4fdd\u5e95",
};

export const AI_TIER_QUANTITY_RULES: Record<AiMatchingTier, { max: number; min: number; target: number }> = {
  reach: { max: 6, min: 4, target: 5 },
  match: { max: 12, min: 8, target: 10 },
  safe: { max: 4, min: 2, target: 3 },
};

export const AI_DYNAMIC_QUANTITY_NOTE =
  "\u5404\u6863\u4f4d\u6570\u91cf\u7531 AI \u6839\u636e\u4f60\u7684\u80cc\u666f\u548c\u5019\u9009\u5b66\u6821\u60c5\u51b5\u52a8\u6001\u751f\u6210\uff0c\u4ec5\u4f9b\u89c4\u5212\u53c2\u8003\u3002";

export const AI_RECOMMENDATION_DISCLAIMER =
  "AI \u63a8\u8350\u4ec5\u4f9b\u7533\u8bf7\u89c4\u5212\u53c2\u8003\uff0c\u4e0d\u4ee3\u8868\u5f55\u53d6\u6982\u7387\u3002\u6700\u7ec8\u7533\u8bf7\u8981\u6c42\u8bf7\u4ee5\u5b66\u6821\u5b98\u7f51\u4e3a\u51c6\u3002";
