import { NextResponse } from "next/server";

import {
  createSchoolSlug,
  getUniversityImportSourceUrl,
  isSupportedImportCountry,
  normalizeUniversityName,
  normalizeWebsiteUrl,
  UNIVERSITY_IMPORT_SOURCE,
  type HipoUniversity,
} from "@/lib/import/universities";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ExistingSchool = {
  id: string;
  name: string;
  slug: string;
  verification_status: string | null;
  website_url: string | null;
};

type ImportableSchool = {
  country: string;
  data_quality_score: number;
  external_id: string | null;
  external_source: string;
  imported_at: string;
  is_published: boolean;
  name: string;
  name_en: string;
  region: string | null;
  slug: string;
  source_url: string | null;
  verification_status: string;
  website_url: string | null;
};

type FailedImportRow = {
  name: string;
  reason: string;
};

function normalizeKey(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function getExternalId(university: HipoUniversity, slug: string) {
  return university.domains?.[0]?.trim() || university.name?.trim() || slug;
}

function toImportableSchool(
  university: HipoUniversity,
  fallbackCountry: string,
  importedAt: string,
): ImportableSchool | null {
  const name = normalizeUniversityName(university.name ?? "");

  if (!name) {
    return null;
  }

  const country = university.country?.trim() || fallbackCountry;
  const slug = createSchoolSlug(name, country);
  const websiteUrl = normalizeWebsiteUrl(university.web_pages?.[0]);

  return {
    country,
    data_quality_score: 40,
    external_id: getExternalId(university, slug),
    external_source: UNIVERSITY_IMPORT_SOURCE,
    imported_at: importedAt,
    is_published: true,
    name,
    name_en: name,
    region: university["state-province"] ?? null,
    slug,
    source_url: websiteUrl,
    verification_status: "unverified",
    website_url: websiteUrl,
  };
}

function getSchemaHelpMessage(message: string) {
  const lowerMessage = message.toLowerCase();
  const missingMetadata =
    lowerMessage.includes("external_source") ||
    lowerMessage.includes("external_id") ||
    lowerMessage.includes("verification_status") ||
    lowerMessage.includes("data_quality_score") ||
    lowerMessage.includes("imported_at") ||
    lowerMessage.includes("import_jobs");

  if (!missingMetadata) {
    return message;
  }

  return `${message}。请先在 Supabase SQL Editor 运行 supabase/migrations/005_add_data_expansion_metadata.sql。`;
}

function getErrorCauseMessage(error: Error) {
  const cause = error.cause;

  if (!cause || typeof cause !== "object") {
    return null;
  }

  const code = "code" in cause && typeof cause.code === "string" ? cause.code : null;
  const message = "message" in cause && typeof cause.message === "string" ? cause.message : null;

  if (code && message) {
    return `${code}: ${message}`;
  }

  return code ?? message;
}

function getResponseErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Unknown import error.";
  }

  if (error.message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    return "缺少 SUPABASE_SERVICE_ROLE_KEY，请在 .env.local 中配置服务端 key。";
  }

  const causeMessage = getErrorCauseMessage(error);
  const message = causeMessage ? `${error.message}: ${causeMessage}` : error.message;

  return getSchemaHelpMessage(message);
}

async function recordImportJob({
  country,
  createdBy,
  errorCount,
  errorMessage,
  finishedAt,
  startedAt,
  status,
  successCount,
  totalCount,
}: {
  country: string;
  createdBy: string;
  errorCount: number;
  errorMessage: string | null;
  finishedAt: string;
  startedAt: string;
  status: string;
  successCount: number;
  totalCount: number;
}): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("import_jobs").insert({
      created_by: createdBy,
      error_count: errorCount,
      error_message: errorMessage,
      finished_at: finishedAt,
      source: `${UNIVERSITY_IMPORT_SOURCE}:${country}`,
      started_at: startedAt,
      status,
      success_count: successCount,
      total_count: totalCount,
    });

    return error ? getSchemaHelpMessage(error.message) : null;
  } catch (error) {
    return getResponseErrorMessage(error);
  }
}

async function fetchUniversities(sourceUrl: string) {
  const response = await fetch(sourceUrl, {
    headers: { accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Hipo Labs API returned ${response.status}: ${response.statusText}`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error("Hipo Labs API returned an unexpected response shape.");
  }

  return payload as HipoUniversity[];
}

async function insertSchoolsOneByOne(admin: ReturnType<typeof createAdminClient>, schools: ImportableSchool[]) {
  let insertedCount = 0;
  const failedRows: FailedImportRow[] = [];

  for (const school of schools) {
    const { error } = await admin.from("schools").insert(school);

    if (error) {
      failedRows.push({
        name: school.name,
        reason: getSchemaHelpMessage(error.message),
      });
      continue;
    }

    insertedCount += 1;
  }

  return { failedRows, insertedCount };
}

async function logFailedImportJob({
  country,
  createdBy,
  message,
  startedAt,
}: {
  country: string;
  createdBy: string;
  message: string;
  startedAt: string;
}) {
  const finishedAt = new Date().toISOString();
  await recordImportJob({
    country,
    createdBy,
    errorCount: 1,
    errorMessage: message,
    finishedAt,
    startedAt,
    status: "failed",
    successCount: 0,
    totalCount: 0,
  });
}

export async function POST(request: Request) {
  const startedAt = new Date().toISOString();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let country = "";

  try {
    const body = (await request.json()) as { country?: string };
    country = body.country?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isSupportedImportCountry(country)) {
    return NextResponse.json({ error: "Unsupported country." }, { status: 400 });
  }

  const sourceUrl = getUniversityImportSourceUrl(country);

  try {
    const universities = await fetchUniversities(sourceUrl);
    const importedAt = new Date().toISOString();
    const admin = createAdminClient();

    const { data: existingSchools, error: existingError } = await admin
      .from("schools")
      .select("id,name,slug,website_url,verification_status")
      .returns<ExistingSchool[]>();

    if (existingError) {
      throw new Error(getSchemaHelpMessage(existingError.message));
    }

    const existingSlugs = new Set((existingSchools ?? []).map((school) => normalizeKey(school.slug)));
    const existingNames = new Set((existingSchools ?? []).map((school) => normalizeKey(school.name)));
    const existingWebsites = new Set(
      (existingSchools ?? [])
        .map((school) => normalizeWebsiteUrl(school.website_url))
        .filter((value): value is string => Boolean(value))
        .map((value) => normalizeKey(value)),
    );

    const seenSlugs = new Set<string>();
    const seenNames = new Set<string>();
    const seenWebsites = new Set<string>();
    const importableSchools: ImportableSchool[] = [];
    let skippedDuplicateCount = 0;
    let invalidCount = 0;

    for (const university of universities) {
      const school = toImportableSchool(university, country, importedAt);

      if (!school) {
        invalidCount += 1;
        continue;
      }

      const slugKey = normalizeKey(school.slug);
      const nameKey = normalizeKey(school.name);
      const websiteKey = normalizeKey(school.website_url);
      const duplicate =
        existingSlugs.has(slugKey) ||
        existingNames.has(nameKey) ||
        (websiteKey.length > 0 && existingWebsites.has(websiteKey)) ||
        seenSlugs.has(slugKey) ||
        seenNames.has(nameKey) ||
        (websiteKey.length > 0 && seenWebsites.has(websiteKey));

      if (duplicate) {
        skippedDuplicateCount += 1;
        continue;
      }

      seenSlugs.add(slugKey);
      seenNames.add(nameKey);
      if (websiteKey) {
        seenWebsites.add(websiteKey);
      }
      importableSchools.push(school);
    }

    let insertedCount = 0;
    const failedRows: FailedImportRow[] = [];

    if (importableSchools.length > 0) {
      const insertResult = await insertSchoolsOneByOne(admin, importableSchools);
      insertedCount = insertResult.insertedCount;
      failedRows.push(...insertResult.failedRows);
    }

    const errorCount = invalidCount + failedRows.length;
    const errorMessage =
      errorCount > 0
        ? [invalidCount > 0 ? `${invalidCount} invalid rows skipped.` : null, failedRows[0]?.reason ?? null]
            .filter(Boolean)
            .join(" ")
        : null;
    const finishedAt = new Date().toISOString();
    const importJobError = await recordImportJob({
      country,
      createdBy: user.id,
      errorCount,
      errorMessage,
      finishedAt,
      startedAt,
      status: errorCount > 0 ? "completed_with_errors" : "completed",
      successCount: insertedCount,
      totalCount: universities.length,
    });

    return NextResponse.json({
      country,
      errorCount,
      failedRows: failedRows.slice(0, 10),
      importJobError,
      insertedCount,
      skippedDuplicateCount,
      sourceUrl,
      totalCount: universities.length,
    });
  } catch (error) {
    const message = getResponseErrorMessage(error);
    await logFailedImportJob({ country, createdBy: user.id, message, startedAt });

    return NextResponse.json({ error: message, failedRows: [{ name: country, reason: message }] }, { status: 500 });
  }
}
