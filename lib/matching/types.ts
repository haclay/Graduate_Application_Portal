import type { Program, ProgramDeadline } from "@/lib/programs/types";
import type { School } from "@/lib/schools/types";
import type { StudentProfile } from "@/lib/profile/types";

export type MatchingTier = "lottery" | "reach" | "match" | "safe";

export type MatchingProgram = Program;

export type MatchingInput = {
  deadlines: ProgramDeadline[];
  profile: StudentProfile;
  programs: MatchingProgram[];
  schools: School[];
};

export type MatchingResult = {
  improvements: string[];
  nearestDeadline: ProgramDeadline | null;
  program: MatchingProgram;
  reasons: string[];
  risks: string[];
  school: School | null;
  score: number;
  tier: MatchingTier;
};

export const tierLabels: Record<MatchingTier, string> = {
  lottery: "彩票",
  reach: "冲刺",
  match: "匹配",
  safe: "稳妥",
};

export const tierOrder: MatchingTier[] = ["safe", "match", "reach", "lottery"];
