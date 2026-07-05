export const UNIVERSITY_IMPORT_COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Singapore",
  "Hong Kong",
  "Germany",
  "France",
  "Netherlands",
  "Switzerland",
  "Japan",
  "South Korea",
  "Malaysia",
  "New Zealand",
  "Ireland",
  "Belgium",
  "Italy",
  "Saudi Arabia",
  "China",
] as const;

export const UNIVERSITY_IMPORT_SOURCE = "hipo_university_domains";
export const UNIVERSITY_IMPORT_BASE_URL = "https://universities.hipolabs.com/search";

export type UniversityImportCountry = (typeof UNIVERSITY_IMPORT_COUNTRIES)[number];

export type HipoUniversity = {
  alpha_two_code?: string;
  country?: string;
  domains?: string[];
  name?: string;
  "state-province"?: string | null;
  web_pages?: string[];
};

export function isSupportedImportCountry(country: string): country is UniversityImportCountry {
  return UNIVERSITY_IMPORT_COUNTRIES.includes(country as UniversityImportCountry);
}

export function getUniversityImportSourceUrl(country: string) {
  const url = new URL(UNIVERSITY_IMPORT_BASE_URL);
  url.searchParams.set("country", country);
  return url.toString();
}

export function normalizeUniversityName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeWebsiteUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/$/, "");
}

export function createSchoolSlug(name: string, country: string) {
  const source = `${name}-${country}`;

  return source
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
