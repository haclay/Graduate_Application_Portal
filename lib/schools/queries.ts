import { createClient } from "@/lib/supabase/server";
import type { ProgramWithSchool } from "@/lib/programs/types";
import type { QueryResult, School, SchoolFilters } from "@/lib/schools/types";

function normalize(value?: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "读取学校数据失败，请稍后重试。";
}

export async function getSchools(
  filters: SchoolFilters = {},
): Promise<QueryResult<School[]>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("schools")
      .select("*")
      .eq("is_published", true)
      .order("country", { ascending: true })
      .order("name", { ascending: true });

    const searchQuery = normalize(filters.query);
    const country = normalize(filters.country);
    const city = normalize(filters.city);

    if (searchQuery) {
      query = query.or(
        `name.ilike.%${searchQuery}%,name_en.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,country.ilike.%${searchQuery}%`,
      );
    }

    if (country) {
      query = query.eq("country", country);
    }

    if (city) {
      query = query.eq("city", city);
    }

    const { data, error } = await query.returns<School[]>();

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: data ?? [], error: null };
  } catch (error) {
    return { data: [], error: getErrorMessage(error) };
  }
}

export async function getSchoolBySlug(
  slug: string,
): Promise<QueryResult<School | null>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle<School>();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: getErrorMessage(error) };
  }
}

export async function getProgramsBySchoolId(
  schoolId: string,
): Promise<QueryResult<ProgramWithSchool[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("programs")
      .select(
        "*, schools(id, name, name_en, slug, country, city)",
      )
      .eq("school_id", schoolId)
      .eq("is_published", true)
      .order("name", { ascending: true })
      .returns<ProgramWithSchool[]>();

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: data ?? [], error: null };
  } catch (error) {
    return { data: [], error: getErrorMessage(error) };
  }
}
