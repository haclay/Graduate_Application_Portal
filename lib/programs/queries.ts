import type { ProgramFilters, ProgramWithRelations, ProgramWithSchool } from "@/lib/programs/types";
import type { QueryResult } from "@/lib/schools/types";
import { createClient } from "@/lib/supabase/server";

function normalize(value?: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "读取项目数据失败，请稍后重试。";
}

export async function getPrograms(filters: ProgramFilters = {}): Promise<QueryResult<ProgramWithSchool[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("programs")
      .select(
        "*, schools!inner(id, name, name_en, slug, country, city, qs_rank_2027, qs_rank_display, is_active, is_qs_top_500)",
      )
      .eq("is_published", true)
      .eq("schools.is_active", true)
      .eq("schools.is_qs_top_500", true)
      .order("name", { ascending: true });

    const searchQuery = normalize(filters.query);
    const field = normalize(filters.field);
    const degreeType = normalize(filters.degreeType);

    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,field.ilike.%${searchQuery}%,degree_type.ilike.%${searchQuery}%,faculty.ilike.%${searchQuery}%`,
      );
    }

    if (field) {
      query = query.eq("field", field);
    }

    if (degreeType) {
      query = query.eq("degree_type", degreeType);
    }

    const { data, error } = await query.returns<ProgramWithSchool[]>();

    if (error) {
      return { data: [], error: error.message };
    }

    const country = normalize(filters.country);
    const filteredData = country ? (data ?? []).filter((program) => program.schools?.country === country) : data ?? [];

    return { data: filteredData, error: null };
  } catch (error) {
    return { data: [], error: getErrorMessage(error) };
  }
}

export async function getProgramBySlug(slug: string): Promise<QueryResult<ProgramWithRelations | null>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("programs")
      .select(
        "*, schools!inner(id, name, name_en, slug, country, city, qs_rank_2027, qs_rank_display, is_active, is_qs_top_500), program_deadlines(*)",
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .eq("schools.is_active", true)
      .eq("schools.is_qs_top_500", true)
      .maybeSingle<ProgramWithRelations>();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: getErrorMessage(error) };
  }
}

export async function getProgramFilterOptions(): Promise<
  QueryResult<{
    countries: string[];
    degreeTypes: string[];
    fields: string[];
  }>
> {
  const programsResult = await getPrograms();

  if (programsResult.error) {
    return {
      data: { countries: [], degreeTypes: [], fields: [] },
      error: programsResult.error,
    };
  }

  const countries = new Set<string>();
  const degreeTypes = new Set<string>();
  const fields = new Set<string>();

  programsResult.data.forEach((program) => {
    if (program.schools?.country) {
      countries.add(program.schools.country);
    }

    if (program.degree_type) {
      degreeTypes.add(program.degree_type);
    }

    if (program.field) {
      fields.add(program.field);
    }
  });

  return {
    data: {
      countries: Array.from(countries).sort(),
      degreeTypes: Array.from(degreeTypes).sort(),
      fields: Array.from(fields).sort(),
    },
    error: null,
  };
}