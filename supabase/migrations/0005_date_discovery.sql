-- PeakPlant — Date Discovery tables.
--
-- Additive only: does not touch website tables (orders, subscribers,
-- community_questions, newsletter_sends). All personal tables use deny-by-default
-- RLS scoped to space membership via the existing app_is_space_member() helper.
--
-- Tables:
--   saved_dates          — date ideas saved to a space's shortlist
--   date_preferences     — explicit budget/style preferences per space or member
--   personalization_signals — inspectable signals that influence Discover picks
--   date_feedback        — post-date thumbs up/down (feeds future ranking)

-- ── saved_dates ──────────────────────────────────────────────────────────────
create table public.saved_dates (
  id               uuid primary key default gen_random_uuid(),
  space_id         uuid not null references public.spaces (id) on delete cascade,
  moment_id        text not null,
  title            text not null,
  concept          text not null default '',
  price_band       text not null default '€',
  est_duration_min integer not null default 60,
  status           text not null default 'saved'
                     check (status in ('idea', 'saved', 'planned', 'completed', 'dismissed')),
  saved_at         timestamptz not null default now(),
  planned_for      timestamptz,
  completed_at     timestamptz,
  memory_id        uuid references public.memories (id) on delete set null,
  created_by       uuid references public.profiles (id)
);
create index saved_dates_space_idx on public.saved_dates (space_id, saved_at desc);

alter table public.saved_dates enable row level security;

create policy "members can manage their space saved_dates"
  on public.saved_dates
  for all
  using (app_is_space_member(space_id))
  with check (app_is_space_member(space_id));

-- ── date_preferences ─────────────────────────────────────────────────────────
-- Explicit preferences (budget, indoor/outdoor, transport, etc.) set via the
-- Personalization screen. scope = 'couple' applies to the whole space;
-- scope = 'member' is personal (user_id required).
create table public.date_preferences (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid not null references public.spaces (id) on delete cascade,
  user_id         uuid references public.profiles (id) on delete cascade,
  scope           text not null check (scope in ('couple', 'member')),
  categories      text[] not null default '{}',
  budget_band     text,
  indoor_outdoor  text check (indoor_outdoor in ('indoor', 'outdoor', 'flexible')),
  max_travel_min  integer,
  dietary         text[] not null default '{}',
  accessibility   text[] not null default '{}',
  updated_at      timestamptz not null default now(),
  unique (space_id, user_id, scope)
);

alter table public.date_preferences enable row level security;

create policy "members can manage their space date_preferences"
  on public.date_preferences
  for all
  using (app_is_space_member(space_id))
  with check (app_is_space_member(space_id));

-- ── personalization_signals ───────────────────────────────────────────────────
-- Each row is one inspectable signal the recommender can use. The Personalization
-- screen reads, explains, and offers to delete these. source = 'explicit' are
-- signals the user consciously set; 'behavioral' are derived from actions
-- (saved, completed, feedback) — never from note text or sensitive inferences.
create table public.personalization_signals (
  id         uuid primary key default gen_random_uuid(),
  space_id   uuid not null references public.spaces (id) on delete cascade,
  user_id    uuid references public.profiles (id) on delete cascade,
  kind       text not null,   -- e.g. 'goal', 'preferred_category', 'typical_duration'
  value      text not null,
  source     text not null check (source in ('explicit', 'behavioral')),
  created_at timestamptz not null default now()
);
create index personalization_signals_space_idx on public.personalization_signals (space_id);

alter table public.personalization_signals enable row level security;

create policy "members can manage their space personalization_signals"
  on public.personalization_signals
  for all
  using (app_is_space_member(space_id))
  with check (app_is_space_member(space_id));

-- ── date_feedback ─────────────────────────────────────────────────────────────
-- Post-date thumbs-up / thumbs-down. Feeds ranking improvements over time.
-- Never used for ad targeting or resale (PP-016).
create table public.date_feedback (
  id            uuid primary key default gen_random_uuid(),
  space_id      uuid not null references public.spaces (id) on delete cascade,
  saved_date_id uuid references public.saved_dates (id) on delete set null,
  user_id       uuid references public.profiles (id) on delete set null,
  rating        smallint not null check (rating in (-1, 1)),  -- -1 = not for us; 1 = loved it
  reason        text,
  created_at    timestamptz not null default now()
);
create index date_feedback_space_idx on public.date_feedback (space_id, created_at desc);

alter table public.date_feedback enable row level security;

create policy "members can manage their space date_feedback"
  on public.date_feedback
  for all
  using (app_is_space_member(space_id))
  with check (app_is_space_member(space_id));
