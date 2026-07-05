import type { StudentProfile } from "@/lib/profile/types";

const requiredFields = [
  "undergraduate_school",
  "undergraduate_major",
  "gpa",
  "gpa_scale",
  "target_countries",
  "target_majors",
  "future_goal",
  "planned_entry_year",
] satisfies Array<keyof StudentProfile>;

function hasValue(value: StudentProfile[keyof StudentProfile] | undefined) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
}

export function calculateProfileCompletion(
  profile: Partial<StudentProfile> | null | undefined,
) {
  if (!profile) {
    return {
      completedFields: 0,
      totalFields: requiredFields.length,
      percentage: 0,
    };
  }

  const completedFields = requiredFields.filter((field) =>
    hasValue(profile[field]),
  ).length;

  return {
    completedFields,
    totalFields: requiredFields.length,
    percentage: Math.round((completedFields / requiredFields.length) * 100),
  };
}