-- Purpose:
--   Add QS World University Rankings 2027 metadata fields to schools.
--   This supports importing a curated QS 2027 Top 500 CSV, marking matched
--   schools as active Top 500 records, and keeping non-Top-500 schools inactive
--   without deleting historical data.
--
-- How to use:
--   1. Open your Supabase project dashboard.
--   2. Go to SQL Editor.
--   3. Run this file after 005_add_data_expansion_metadata.sql.
--
-- Notes:
--   - This migration only adds columns and indexes if they do not already exist.
--   - Existing schools, programs, applications, and RLS policies are preserved.

alter table public.schools
  add column if not exists qs_rank_2027 integer,
  add column if not exists qs_rank_display text,
  add column if not exists ranking_year integer,
  add column if not exists ranking_source text,
  add column if not exists ranking_source_url text,
  add column if not exists is_qs_top_500 boolean default false,
  add column if not exists is_active boolean default true,
  add column if not exists aliases text[];

create index if not exists schools_qs_rank_2027_idx
on public.schools(qs_rank_2027);

create index if not exists schools_is_qs_top_500_idx
on public.schools(is_qs_top_500);

create index if not exists schools_is_active_idx
on public.schools(is_active);