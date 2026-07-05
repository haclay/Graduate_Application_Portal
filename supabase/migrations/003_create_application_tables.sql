-- Purpose:
--   Create private application tracking and task management tables for MyGrad phase 5.
--
-- How to use:
--   1. Open your Supabase project dashboard.
--   2. Go to SQL Editor.
--   3. Run this file after 001_create_student_profiles.sql and 002_create_school_program_tables.sql.
--
-- Notes:
--   - Each user can only select, insert, update, and delete their own applications and tasks.
--   - Deleting an application cascades to its tasks.
--   - DDL and requirements are planning references; final details should be checked on official websites.

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  status text not null default 'not_started',
  priority text default 'medium',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, program_id),
  constraint applications_status_check check (
    status in (
      'not_started',
      'preparing',
      'documents_ready',
      'submitted',
      'interview',
      'accepted',
      'rejected',
      'waitlisted',
      'withdrawn'
    )
  ),
  constraint applications_priority_check check (
    priority in ('low', 'medium', 'high')
  )
);

create table if not exists public.application_tasks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  task_type text,
  due_date date,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint application_tasks_type_check check (
    task_type in (
      'cv',
      'sop',
      'transcript',
      'recommendation',
      'language_score',
      'application_form',
      'fee',
      'other'
    )
  )
);

alter table public.applications enable row level security;
alter table public.application_tasks enable row level security;

drop policy if exists "Users can view own applications" on public.applications;
create policy "Users can view own applications"
on public.applications
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own applications" on public.applications;
create policy "Users can insert own applications"
on public.applications
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own applications" on public.applications;
create policy "Users can update own applications"
on public.applications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own applications" on public.applications;
create policy "Users can delete own applications"
on public.applications
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view own application tasks" on public.application_tasks;
create policy "Users can view own application tasks"
on public.application_tasks
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own application tasks" on public.application_tasks;
create policy "Users can insert own application tasks"
on public.application_tasks
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own application tasks" on public.application_tasks;
create policy "Users can update own application tasks"
on public.application_tasks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own application tasks" on public.application_tasks;
create policy "Users can delete own application tasks"
on public.application_tasks
for delete
using (auth.uid() = user_id);

create or replace function public.update_application_tracking_updated_at()
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

drop trigger if exists update_applications_updated_at on public.applications;
create trigger update_applications_updated_at
before update on public.applications
for each row
execute function public.update_application_tracking_updated_at();

drop trigger if exists update_application_tasks_updated_at on public.application_tasks;
create trigger update_application_tasks_updated_at
before update on public.application_tasks
for each row
execute function public.update_application_tracking_updated_at();

create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_program_id_idx on public.applications(program_id);
create index if not exists applications_status_idx on public.applications(status);
create index if not exists application_tasks_user_id_idx on public.application_tasks(user_id);
create index if not exists application_tasks_application_id_idx on public.application_tasks(application_id);
create index if not exists application_tasks_due_date_idx on public.application_tasks(due_date);
