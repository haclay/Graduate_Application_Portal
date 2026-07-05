import type { ProgramDeadline } from "@/lib/programs/types";

export function normalizeGpa(
  gpa: number | null | undefined,
  gpaScale: number | null | undefined,
) {
  if (!gpa || !gpaScale) {
    return null;
  }

  if (gpaScale === 4) {
    return gpa;
  }

  if (gpaScale === 5) {
    return (gpa / 5) * 4;
  }

  if (gpaScale === 100) {
    return (gpa / 100) * 4;
  }

  return null;
}

export function hasText(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export function includesAny(value: string | null | undefined, keywords: string[]) {
  const normalized = value?.toLowerCase() ?? "";
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function findNearestDeadline(deadlines: ProgramDeadline[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDeadlines = deadlines
    .filter((deadline) => deadline.deadline_date)
    .map((deadline) => ({
      deadline,
      date: new Date(`${deadline.deadline_date}T00:00:00`),
    }))
    .filter(({ date }) => date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return futureDeadlines[0]?.deadline ?? deadlines[0] ?? null;
}

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}
