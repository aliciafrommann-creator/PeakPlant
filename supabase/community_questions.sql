-- ════════════════════════════════════════════════════════════════════
-- peakplant — community_questions (the anonymous wall in the digital world)
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query)
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.community_questions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  text        text not null
);

create index if not exists community_questions_created_idx
  on public.community_questions (created_at desc);

-- This wall is public: anyone in the digital world can read it and add to it.
-- So we DO allow anon read + insert (unlike orders/subscribers).
alter table public.community_questions enable row level security;

drop policy if exists "anon can read questions"   on public.community_questions;
drop policy if exists "anon can add questions"     on public.community_questions;

create policy "anon can read questions"
  on public.community_questions for select
  to anon using (true);

create policy "anon can add questions"
  on public.community_questions for insert
  to anon with check (char_length(text) between 3 and 200);
