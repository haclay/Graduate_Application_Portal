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
  source_url: string;
  verification_status: string;
  website_url: string | null;
};

function normalizeKey(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function getExternalId(university: HipoUniversity, slug: string) {
  return university.domains?.[0]?.trim() || slug;
}

function toImportableSchool(
  university: HipoUniversity,
  country: string,
  sourceUrl: string,
  importedAt: string,
): ImportableSchool | null {
  const name = normalizeUniversityName(university.name ?? "");

  if (!name) {
    return null;
  }

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
    source_url: sourceUrl,
    verification_status: "unverified",
    website_url: websiteUrl,
  };
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
}) {
  const admin = createAdminClient();
  await admin.from("import_jobs").insert({
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
    const response = await fetch(sourceUrl, {
      headers: { accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`University data source returned ${response.status}.`);
    }

    const universities = (await response.json()) as HipoUniversity[];
    const importedAt = new Date().toISOString();
    const admin = createAdminClient();

    const { data: existingSchools, error: existingError } = await admin
      .from("schools")
      .select("id,name,slug,website_url,verification_status")
      .returns<ExistingSchool[]>();

    if (existingError) {
      throw new Error(existingError.message);
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
      const school = toImportableSchool(university, country, sourceUrl, importedAt);

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
    let errorCount = invalidCount;
    let errorMessage: string | null = invalidCount > 0 ? `${invalidCount} invalid rows skipped.` : null;

    if (importableSchools.length > 0) {
      const { error: insertError } = await admin.from("schools").insert(importableSchools);

      if (insertError) {
        errorCount += importableSchools.length;
        errorMessage = insertError.message;
      } else {
        insertedCount = importableSchools.length;
      }
    }

    const finishedAt = new Date().toISOString();
    await recordImportJob({
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
      insertedCount,
      skippedDuplicateCount,
      sourceUrl,
      totalCount: universities.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import error.";
    const finishedAt = new Date().toISOString();

    try {
      await recordImportJob({
        country,
        createdBy: user.id,
        errorCount: 1,
        errorMessage: message,
        finishedAt,
        startedAt,
        status: "failed",
        successCount: 0,
        totalCount: 0,
      });
    } catch {
      // Do not hide the original import failure if import job logging is unavailable.
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
