import { createSchoolSlug, normalizeWebsiteUrl } from "@/lib/import/universities";

export type QsTop500Row = {
  aliases: string[];
  city: string | null;
  country: string;
  name: string;
  name_en: string | null;
  qs_rank_2027: number | null;
  qs_url: string | null;
  rank_display: string | null;
  website_url: string | null;
};

export type ExistingQsSchool = {
  aliases: string[] | null;
  city: string | null;
  country: string;
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  verification_status: string | null;
  website_url: string | null;
};

export type QsMatchResult = {
  school: ExistingQsSchool | null;
  strategy: "domain" | "name" | "alias" | "country_name" | "new";
};

type MatchIndexes = {
  byAlias: Map<string, ExistingQsSchool>;
  byCountryName: Map<string, ExistingQsSchool>;
  byDomain: Map<string, ExistingQsSchool>;
  byName: Map<string, ExistingQsSchool>;
  slugs: Set<string>;
};

const ABBREVIATIONS = new Map<string, string>([
  ["ucl", "university college london"],
  ["mit", "massachusetts institute of technology"],
  ["caltech", "california institute of technology"],
  ["eth zurich", "swiss federal institute of technology zurich"],
  ["nus", "national university of singapore"],
  ["ntu", "nanyang technological university"],
]);

function compact(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeUniversityName(value: string | null | undefined) {
  const lower = compact(value ?? "").toLowerCase();

  if (!lower) {
    return "";
  }

  const abbreviation = ABBREVIATIONS.get(lower);
  const expanded = abbreviation ?? lower;

  return expanded
    .replace(/\([^)]*\)/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitAliases(value: string | null | undefined) {
  return (value ?? "")
    .split(";")
    .map((alias) => compact(alias))
    .filter(Boolean);
}

export function getWebsiteDomain(value: string | null | undefined) {
  const normalized = normalizeWebsiteUrl(value);

  if (!normalized) {
    return "";
  }

  try {
    const url = new URL(normalized.startsWith("http") ? normalized : `https://${normalized}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return normalized.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
  }
}

function addIndexValue(index: Map<string, ExistingQsSchool>, key: string, school: ExistingQsSchool) {
  if (key && !index.has(key)) {
    index.set(key, school);
  }
}

function getNameVariants(name: string | null | undefined, nameEn: string | null | undefined, aliases: string[] = []) {
  return [name, nameEn, ...aliases]
    .map((value) => normalizeUniversityName(value))
    .filter(Boolean);
}

export function addSchoolToQsMatchIndexes(indexes: MatchIndexes, school: ExistingQsSchool) {
  indexes.slugs.add(school.slug);

  const domain = getWebsiteDomain(school.website_url);
  addIndexValue(indexes.byDomain, domain, school);

  getNameVariants(school.name, school.name_en).forEach((name) => {
    addIndexValue(indexes.byName, name, school);
    addIndexValue(indexes.byCountryName, `${school.country.toLowerCase()}::${name}`, school);
  });

  (school.aliases ?? []).forEach((alias) => {
    const normalizedAlias = normalizeUniversityName(alias);
    addIndexValue(indexes.byAlias, normalizedAlias, school);
    addIndexValue(indexes.byCountryName, `${school.country.toLowerCase()}::${normalizedAlias}`, school);
  });
}

export function buildQsMatchIndexes(schools: ExistingQsSchool[]): MatchIndexes {
  const indexes: MatchIndexes = {
    byAlias: new Map(),
    byCountryName: new Map(),
    byDomain: new Map(),
    byName: new Map(),
    slugs: new Set(),
  };

  schools.forEach((school) => addSchoolToQsMatchIndexes(indexes, school));

  return indexes;
}

export function findQsSchoolMatch(row: QsTop500Row, indexes: MatchIndexes): QsMatchResult {
  const rowDomain = getWebsiteDomain(row.website_url);
  const domainMatch = rowDomain ? indexes.byDomain.get(rowDomain) : null;

  if (domainMatch) {
    return { school: domainMatch, strategy: "domain" };
  }

  const nameVariants = getNameVariants(row.name, row.name_en);

  for (const name of nameVariants) {
    const nameMatch = indexes.byName.get(name);

    if (nameMatch) {
      return { school: nameMatch, strategy: "name" };
    }
  }

  const aliasVariants = row.aliases.map((alias) => normalizeUniversityName(alias)).filter(Boolean);

  for (const alias of aliasVariants) {
    const aliasMatch = indexes.byName.get(alias) ?? indexes.byAlias.get(alias);

    if (aliasMatch) {
      return { school: aliasMatch, strategy: "alias" };
    }
  }

  const country = row.country.toLowerCase();
  for (const name of [...nameVariants, ...aliasVariants]) {
    const countryNameMatch = indexes.byCountryName.get(`${country}::${name}`);

    if (countryNameMatch) {
      return { school: countryNameMatch, strategy: "country_name" };
    }
  }

  return { school: null, strategy: "new" };
}

export function createUniqueSchoolSlug(name: string, country: string, existingSlugs: Set<string>, rank: number | null) {
  const baseSlug = createSchoolSlug(name, country) || `qs-school-${rank ?? Date.now()}`;

  if (!existingSlugs.has(baseSlug)) {
    existingSlugs.add(baseSlug);
    return baseSlug;
  }

  const suffix = rank ? `qs-2027-${rank}` : "qs-2027";
  let candidate = `${baseSlug}-${suffix}`;
  let counter = 2;

  while (existingSlugs.has(candidate)) {
    candidate = `${baseSlug}-${suffix}-${counter}`;
    counter += 1;
  }

  existingSlugs.add(candidate);
  return candidate;
}