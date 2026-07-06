-- Purpose: Extend phase 5.6A AI recommendation storage for personalized analysis.
-- Usage: Run this file in Supabase SQL Editor after 007_add_ai_recommendations.sql.
-- Notes: This migration only adds columns. It does not modify schools data.

alter table public.ai_recommendation_runs
  add column if not exists user_profile_analysis jsonb,
  add column if not exists recommendation_plan jsonb,
  add column if not exists ai_summary text,
  add column if not exists disclaimer text;

alter table public.ai_school_recommendations
  add column if not exists next_steps text[],
  add column if not exists evidence_from_profile text[],
  add column if not exists evidence_from_school text[];