export type School = {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  country: string;
  region: string | null;
  city: string | null;
  description: string | null;
  website_url: string | null;
  ranking_summary: string | null;
  tuition_range: string | null;
  living_cost_range: string | null;
  strengths: string[] | null;
  logo_url: string | null;
  source_url: string | null;
  last_verified_at: string | null;
  is_published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SchoolFilters = {
  city?: string;
  country?: string;
  query?: string;
};

export type QueryResult<T> = {
  data: T;
  error: string | null;
};
