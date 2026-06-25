-- PeakPlant — anonymized public place feedback.
--
-- This is deliberately separate from private diary memories and private
-- per-space date_feedback. Rows contain no space_id, user_id, diary text,
-- partner/member data, plan notes, or photo references.
--
-- A user must explicitly opt in from the feedback screen before a row is
-- written here. The app only sends a place id, a 1–5 rating, an optional
-- practical tip, and a timestamp.

create table if not exists public.public_place_feedback (
  id         uuid primary key default gen_random_uuid(),
  place_id   text not null,
  rating     smallint not null check (rating between 1 and 5),
  tip        text check (char_length(tip) <= 280),
  created_at timestamptz not null default now()
);

create index if not exists public_place_feedback_place_idx
  on public.public_place_feedback (place_id, created_at desc);

alter table public.public_place_feedback enable row level security;

drop policy if exists "public can read anonymized place feedback"
  on public.public_place_feedback;
create policy "public can read anonymized place feedback"
  on public.public_place_feedback
  for select
  using (true);

drop policy if exists "clients can insert anonymized place feedback"
  on public.public_place_feedback;
create policy "clients can insert anonymized place feedback"
  on public.public_place_feedback
  for insert
  with check (true);

grant select, insert on public.public_place_feedback to anon, authenticated;
