-- Purpose:
--   Add data expansion metadata for MyGrad phase 5.5A.
--   These fields prepare schools, programs, and program_deadlines for future
--   API import, CSV import, and human verification workflows.
--
-- How to use:
--   1. Open your Supabase project dashboard.
--   2. Go to SQL Editor.
--   3. Run this file after 004_add_onboarding_fields.sql.
--
-- Notes:
--   - This migration does not import data, call external APIs, or run crawlers.
--   - Existing public SELECT policies for published schools/programs/deadlines remain active.
--   - import_jobs records are private: users can only read records they created.

alter table public.schools
  add column if not exists external_source text,
  add column if not exists external_id text,
  add column if not exists verification_status text default 'unverified',
  add column if not exists data_quality_score integer default 0,
  add column if not exists imported_at timestamptz,
  add column if not exists notes text;

alter table public.programs
  add column if not exists external_source text,
  add column if not exists external_id text,
  add column if not exists verification_status text default 'unverified',
  add column if not exists data_quality_score integer default 0,
  add column if not exists imported_at timestamptz,
  add column if not exists notes text;

alter table public.program_deadlines
  add column if not exists verification_status text default 'unverified',
  add column if not exists data_quality_score integer default 0,
  add column if not exists notes text;

alter table public.schools
  drop constraint if exists schools_data_quality_score_range,
  add constraint schools_data_quality_score_range
    check (data_quality_score >= 0 and data_quality_score <= 100);

alter table public.programs
  drop constraint if exists programs_data_quality_score_range,
  add constraint programs_data_quality_score_range
    check (data_quality_score >= 0 and data_quality_score <= 100);

alter table public.program_deadlines
  drop constraint if exists program_deadlines_data_quality_score_range,
  add constraint program_deadlines_data_quality_score_range
    check (data_quality_score >= 0 and data_quality_score <= 100);

create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  source text,
  status text default 'pending',
  started_at timestamptz,
  finished_at timestamptz,
  total_count integer default 0,
  success_count integer default 0,
  error_count integer default 0,
  error_message text,
  created_by uuid references auth.users(id)
);

alter table public.schools enable row level security;
alter table public.programs enable row level security;
alter table public.program_deadlines enable row level security;
alter table public.import_jobs enable row level security;

-- Keep public read access for published reference data.
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

-- Import job history is private to the user who created the job.
drop policy if exists "Users can view own import jobs" on public.import_jobs;
create policy "Users can view own import jobs"
on public.import_jobs
for select
to authenticated
using (auth.uid() = created_by);

create index if not exists schools_external_source_id_idx
on public.schools(external_source, external_id);

create index if not exists programs_external_source_id_idx
on public.programs(external_source, external_id);

create index if not exists schools_verification_status_idx
on public.schools(verification_status);

create index if not exists programs_verification_status_idx
on public.programs(verification_status);

create index if not exists program_deadlines_verification_status_idx
on public.program_deadlines(verification_status);

create index if not exists import_jobs_created_by_idx
on public.import_jobs(created_by);

create index if not exists import_jobs_status_idx
on public.import_jobs(status);
