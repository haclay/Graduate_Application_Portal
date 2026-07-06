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
  qs_rank_2027: number | null;
  qs_rank_display: string | null;
  ranking_year: number | null;
  ranking_source: string | null;
  ranking_source_url: string | null;
  is_qs_top_500: boolean | null;
  is_active: boolean | null;
  aliases: string[] | null;
  us_news_rank: string | null;
  the_rank: string | null;
  strong_subjects: string[] | null;
  popular_programs: string[] | null;
  school_type: string | null;
  student_faculty_ratio: string | null;
  international_student_ratio: string | null;
  estimated_annual_cost: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SchoolFilters = {
  city?: string;
  country?: string;
  query?: string;
  schoolType?: string;
};

export type QueryResult<T> = {
  data: T;
  error: string | null;
};