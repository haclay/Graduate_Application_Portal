-- Purpose:
--   Add onboarding-specific fields to student_profiles.
--   The original phase 2 profile already contains the core personal, school, GPA,
--   target country, and target major fields used by onboarding.
--
-- How to use:
--   1. Open Supabase Dashboard.
--   2. Go to SQL Editor.
--   3. Run this file after 001_create_student_profiles.sql.
--
-- Notes:
--   - Existing IELTS, TOEFL, GRE, and GMAT columns are intentionally kept.
--   - test_scores stores the newer flexible onboarding scores array.
--   - RLS policies are not changed.

alter table public.student_profiles
add column if not exists test_scores jsonb not null default '[]'::jsonb;

alter table public.student_profiles
drop constraint if exists student_profiles_test_scores_is_array;

alter table public.student_profiles
add constraint student_profiles_test_scores_is_array
check (jsonb_typeof(test_scores) = 'array');

comment on column public.student_profiles.test_scores is
  'Flexible onboarding test scores, e.g. [{"type":"IELTS","score":"7.0"}].';
