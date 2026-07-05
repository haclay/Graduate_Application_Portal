import type { School } from "@/lib/schools/types";

export type ProgramDeadline = {
  id: string;
  program_id: string;
  round_name: string | null;
  deadline_date: string | null;
  intake_term: string | null;
  notes: string | null;
  source_url: string | null;
  last_verified_at: string | null;
  is_published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Program = {
  id: string;
  school_id: string;
  name: string;
  slug: string;
  degree_type: string | null;
  faculty: string | null;
  duration: string | null;
  program_level: string | null;
  field: string | null;
  description: string | null;
  language_requirements: string | null;
  gre_gmat_requirements: string | null;
  gpa_preference: string | null;
  prerequisites: string | null;
  application_materials: string[] | null;
  recommendation_letters_count: number | null;
  tuition: string | null;
  scholarship_info: string | null;
  curriculum_summary: string | null;
  career_outcomes: string | null;
  suitable_for: string | null;
  not_suitable_for: string | null;
  official_url: string | null;
  source_url: string | null;
  last_verified_at: string | null;
  is_published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ProgramWithSchool = Program & {
  schools: Pick<School, "id" | "name" | "name_en" | "slug" | "country" | "city"> | null;
};

export type ProgramWithRelations = ProgramWithSchool & {
  program_deadlines: ProgramDeadline[] | null;
};

export type ProgramFilters = {
  country?: string;
  degreeType?: string;
  field?: string;
  query?: string;
};
