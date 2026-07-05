-- Purpose:
--   Create the student_profiles table used by MyGrad phase 2.
--   This table stores one private graduate-application background profile per authenticated user.
--
-- How to use:
--   1. Open your Supabase project dashboard.
--   2. Go to SQL Editor.
--   3. Paste and run this file once.
--   4. Confirm Row Level Security is enabled on public.student_profiles.
--
-- Notes:
--   - DELETE is intentionally not opened in the first version.
--   - Users can only select, insert, and update their own profile.

create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  nickname text,
  undergraduate_school text,
  undergraduate_country text,
  undergraduate_major text,
  current_year text,
  gpa numeric,
  gpa_scale numeric,
  ielts numeric,
  toefl integer,
  gre integer,
  gmat integer,
  research_experience text,
  internship_experience text,
  project_experience text,
  competition_experience text,
  target_countries text[],
  target_majors text[],
  future_goal text,
  budget_range text,
  planned_entry_year integer,
  profile_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.student_profiles enable row level security;

drop policy if exists "Users can view own student profile" on public.student_profiles;
create policy "Users can view own student profile"
on public.student_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own student profile" on public.student_profiles;
create policy "Users can insert own student profile"
on public.student_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own student profile" on public.student_profiles;
create policy "Users can update own student profile"
on public.student_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.update_student_profiles_updated_at()
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

drop trigger if exists update_student_profiles_updated_at
on public.student_profiles;

create trigger update_student_profiles_updated_at
before update on public.student_profiles
for each row
execute function public.update_student_profiles_updated_at();
