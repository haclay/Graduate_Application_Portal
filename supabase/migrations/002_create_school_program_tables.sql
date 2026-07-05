-- Purpose:
--   Create public school and graduate program database tables for MyGrad phase 3.
--   These tables store published school, program, and deadline reference data.
--
-- How to use:
--   1. Open your Supabase project dashboard.
--   2. Go to SQL Editor.
--   3. Run this file after 001_create_student_profiles.sql.
--   4. Then run supabase/seed/001_seed_schools_programs.sql to insert MVP sample data.
--
-- Notes:
--   - Public users can only SELECT rows where is_published = true.
--   - Frontend INSERT / UPDATE / DELETE permissions are intentionally not opened.
--   - Information is for reference only. Final requirements should be verified on official websites.

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  slug text not null unique,
  country text not null,
  region text,
  city text,
  description text,
  website_url text,
  ranking_summary text,
  tuition_range text,
  living_cost_range text,
  strengths text[],
  logo_url text,
  source_url text,
  last_verified_at date,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  slug text not null unique,
  degree_type text,
  faculty text,
  duration text,
  program_level text default 'Master',
  field text,
  description text,
  language_requirements text,
  gre_gmat_requirements text,
  gpa_preference text,
  prerequisites text,
  application_materials text[],
  recommendation_letters_count integer,
  tuition text,
  scholarship_info text,
  curriculum_summary text,
  career_outcomes text,
  suitable_for text,
  not_suitable_for text,
  official_url text,
  source_url text,
  last_verified_at date,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.program_deadlines (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  round_name text,
  deadline_date date,
  intake_term text,
  notes text,
  source_url text,
  last_verified_at date,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.schools enable row level security;
alter table public.programs enable row level security;
alter table public.program_deadlines enable row level security;

drop policy if exists "Anyone can view published schools" on public.schools;
create policy "Anyone can view published schools"
on public.schools
for select
using (is_published = true);

drop policy if exists "Anyone can view published programs" on public.programs;
create policy "Anyone can view published programs"
on public.programs
for select
using (is_published = true);

drop policy if exists "Anyone can view published program deadlines" on public.program_deadlines;
create policy "Anyone can view published program deadlines"
on public.program_deadlines
for select
using (is_published = true);

create or replace function public.update_reference_data_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_schools_updated_at on public.schools;
create trigger update_schools_updated_at
before update on public.schools
for each row
execute function public.update_reference_data_updated_at();

drop trigger if exists update_programs_updated_at on public.programs;
create trigger update_programs_updated_at
before update on public.programs
for each row
execute function public.update_reference_data_updated_at();

drop trigger if exists update_program_deadlines_updated_at on public.program_deadlines;
create trigger update_program_deadlines_updated_at
before update on public.program_deadlines
for each row
execute function public.update_reference_data_updated_at();

create index if not exists schools_country_idx on public.schools(country);
create index if not exists schools_city_idx on public.schools(city);
create index if not exists schools_slug_idx on public.schools(slug);
create index if not exists programs_school_id_idx on public.programs(school_id);
create index if not exists programs_field_idx on public.programs(field);
create index if not exists programs_degree_type_idx on public.programs(degree_type);
create index if not exists programs_slug_idx on public.programs(slug);
create index if not exists program_deadlines_program_id_idx on public.program_deadlines(program_id);
