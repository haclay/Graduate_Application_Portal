import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  addSchoolToQsMatchIndexes,
  buildQsMatchIndexes,
  createUniqueSchoolSlug,
  findQsSchoolMatch,
  splitAliases,
  type ExistingQsSchool,
  type QsTop500Row,
} from "@/lib/import/qsMatching";

export const dynamic = "force-dynamic";

const REQUIRED_HEADERS = [
  "qs_rank_2027",
  "rank_display",
  "name",
  "name_en",
  "country",
  "city",
  "website_url",
  "qs_url",
  "aliases",
];

function parseCsv(text: string) {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.trim().length > 0)) {
    rows.push(row);
  }

  return rows;
}

function clean(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function parseRank(value: string | undefined) {
  const normalized = value?.replace(/[^0-9]/g, "") ?? "";
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseQsCsv(text: string) {
  const csvRows = parseCsv(text);
  const errors: string[] = [];

  if (csvRows.length === 0) {
    return { errors: ["CSV 文件为空。"], rows: [] as QsTop500Row[] };
  }

  const headers = csvRows[0].map((header) => header.trim().toLowerCase());
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    return {
      errors: [`CSV 缺少字段：${missingHeaders.join(", ")}`],
      rows: [] as QsTop500Row[],
    };
  }

  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  const getValue = (row: string[], header: string) => clean(row[headerIndex.get(header) ?? -1]);
  const rows: QsTop500Row[] = [];

  csvRows.slice(1).forEach((row, rowIndex) => {
    const name = getValue(row, "name");
    const country = getValue(row, "country");

    if (!name || !country) {
      errors.push(`第 ${rowIndex + 2} 行缺少 name 或 country。`);
      return;
    }

    rows.push({
      aliases: splitAliases(getValue(row, "aliases")),
      city: getValue(row, "city"),
      country,
      name,
      name_en: getValue(row, "name_en"),
      qs_rank_2027: parseRank(getValue(row, "qs_rank_2027") ?? undefined),
      qs_url: getValue(row, "qs_url"),
      rank_display: getValue(row, "rank_display"),
      website_url: getValue(row, "website_url"),
    });
  });

  return { errors, rows };
}

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "QS Top 500 导入失败，请稍后重试。";
}

function toRankingUpdate(row: QsTop500Row) {
  return {
    aliases: row.aliases.length > 0 ? row.aliases : null,
    imported_at: new Date().toISOString(),
    is_active: true,
    is_qs_top_500: true,
    qs_rank_2027: row.qs_rank_2027,
    qs_rank_display: row.rank_display,
    ranking_source: "QS World University Rankings",
    ranking_source_url: row.qs_url,
    ranking_year: 2027,
  };
}

function toNewSchoolInsert(row: QsTop500Row, slug: string) {
  return {
    ...toRankingUpdate(row),
    city: row.city,
    country: row.country,
    data_quality_score: 70,
    external_id: row.qs_url ?? row.name,
    external_source: "qs_world_university_rankings",
    is_published: true,
    name: row.name,
    name_en: row.name_en ?? row.name,
    slug,
    source_url: row.qs_url ?? row.website_url,
    verification_status: "unverified",
    website_url: row.website_url,
  };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const mode = String(formData.get("mode") ?? "preview");
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请上传 QS Top 500 CSV 文件。" }, { status: 400 });
    }

    const csvText = await file.text();
    const parsed = parseQsCsv(csvText);

    if (mode === "preview") {
      return NextResponse.json({
        errors: parsed.errors.slice(0, 20),
        previewRows: parsed.rows.slice(0, 10),
        totalRows: parsed.rows.length,
      });
    }

    if (mode !== "import") {
      return NextResponse.json({ error: "Unsupported import mode." }, { status: 400 });
    }

    if (parsed.rows.length === 0) {
      return NextResponse.json({ error: parsed.errors[0] ?? "CSV 没有可导入的数据。" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: existingSchools, error: existingError } = await admin
      .from("schools")
      .select("id,name,name_en,slug,country,city,website_url,verification_status,aliases")
      .returns<ExistingQsSchool[]>();

    if (existingError) {
      throw new Error(existingError.message);
    }

    const indexes = buildQsMatchIndexes(existingSchools ?? []);
    const resetResult = await admin.from("schools").update({ is_qs_top_500: false }).not("id", "is", null);

    if (resetResult.error) {
      throw new Error(resetResult.error.message);
    }

    let matchedUpdatedCount = 0;
    let insertedCount = 0;
    let unmatchedCount = 0;
    const errors = [...parsed.errors];

    for (const row of parsed.rows) {
      const match = findQsSchoolMatch(row, indexes);

      if (match.school) {
        const { error } = await admin.from("schools").update(toRankingUpdate(row)).eq("id", match.school.id);

        if (error) {
          errors.push(`${row.name}: ${error.message}`);
          continue;
        }

        matchedUpdatedCount += 1;
        continue;
      }

      unmatchedCount += 1;
      const slug = createUniqueSchoolSlug(row.name, row.country, indexes.slugs, row.qs_rank_2027);
      const { data: insertedSchool, error } = await admin
        .from("schools")
        .insert(toNewSchoolInsert(row, slug))
        .select("id,name,name_en,slug,country,city,website_url,verification_status,aliases")
        .single<ExistingQsSchool>();

      if (error) {
        errors.push(`${row.name}: ${error.message}`);
        continue;
      }

      insertedCount += 1;
      if (insertedSchool) {
        addSchoolToQsMatchIndexes(indexes, insertedSchool);
      }
    }

    const inactiveResult = await admin
      .from("schools")
      .update({ is_active: false })
      .eq("is_qs_top_500", false)
      .eq("is_active", true)
      .select("id");

    if (inactiveResult.error) {
      errors.push(`标记 inactive 失败：${inactiveResult.error.message}`);
    }

    return NextResponse.json({
      errors: errors.slice(0, 50),
      inactiveCount: inactiveResult.data?.length ?? 0,
      insertedCount,
      matchedUpdatedCount,
      totalRows: parsed.rows.length,
      unmatchedCount,
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}