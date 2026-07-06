import type { School } from "@/lib/schools/types";

export function formatOptional(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

export function formatRank(value: string | number | null | undefined) {
  const text = formatOptional(value);
  if (!text) {
    return null;
  }

  return text.startsWith("#") || text.startsWith("=") ? text : `#${text}`;
}

export function formatQsRank(school: Pick<School, "qs_rank_2027" | "qs_rank_display">) {
  return formatOptional(school.qs_rank_display) ?? (school.qs_rank_2027 ? `#${school.qs_rank_2027}` : null);
}

export function visibleList(values: string[] | null | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}
