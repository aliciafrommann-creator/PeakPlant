-- PeakPlant — saved date planning: notes, cancelled state, free-text plan time.
--
-- Additive / forward-ready. Touches ONLY public.saved_dates (a PeakPlant app
-- table). Does NOT touch website tables (orders, subscribers,
-- community_questions, newsletter_sends). RLS is unchanged (already deny-by-
-- default via app_is_space_member).
--
-- Apply this BEFORE enabling backend mode (EXPO_PUBLIC_SUPABASE_*). It is not
-- yet applied to the live project — backend mode is dormant in the first beta,
-- which runs local-first on AsyncStorage.
--
-- Changes:
--   1. planning_notes  — optional free-text logistics for a plan.
--   2. status check     — allow 'cancelled' (a plan called off).
--   3. planned_for      — relax from timestamptz to text. The app stores a
--      human, free-text "when" (e.g. "this Saturday") by design; a structured
--      date/time picker is a documented later step. The column is empty in the
--      beta project, so the type change is non-destructive.

alter table public.saved_dates
  add column if not exists planning_notes text;

alter table public.saved_dates
  drop constraint if exists saved_dates_status_check;

alter table public.saved_dates
  add constraint saved_dates_status_check
  check (status in ('idea', 'saved', 'planned', 'cancelled', 'completed', 'dismissed'));

alter table public.saved_dates
  alter column planned_for type text using planned_for::text;
