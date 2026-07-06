-- Purpose: Add AI school recommendation run/result tables for phase 5.6A.
-- Usage: Run this file in Supabase SQL Editor after the existing migrations.
-- Notes: AI recommendations are user-owned. Users can read their own runs/results
-- and create their own runs. Recommendation rows are inserted by the authenticated
-- server route for the current user; service role clients also bypass RLS.

create table if not exists public.ai_recommendation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_snapshot jsonb,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text
);

create table if not exists public.ai_school_recommendations (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.ai_recommendation_runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  tier text not null check (tier in ('lottery', 'reach', 'match', 'safe')),
  recommended_major text,
  recommended_program_keywords text[],
  ai_reason text,
  ai_risks text,
  next_steps text[],
  fit_score integer check (fit_score between 0 and 100),
  created_at timestamptz not null default now()
);

alter table public.ai_recommendation_runs enable row level security;
alter table public.ai_school_recommendations enable row level security;

create policy "ai recommendation runs select own"
  on public.ai_recommendation_runs
  for select
  using (auth.uid() = user_id);

create policy "ai recommendation runs insert own"
  on public.ai_recommendation_runs
  for insert
  with check (auth.uid() = user_id);

create policy "ai recommendation runs update own"
  on public.ai_recommendation_runs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ai school recommendations select own"
  on public.ai_school_recommendations
  for select
  using (auth.uid() = user_id);

create policy "ai school recommendations insert own"
  on public.ai_school_recommendations
  for insert
  with check (auth.uid() = user_id);