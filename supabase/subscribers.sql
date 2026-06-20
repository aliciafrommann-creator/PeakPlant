-- ════════════════════════════════════════════════════════════════════
-- peakplant — subscribers (ONE list: waitlist + monthly newsletter)
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query)
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null unique,            -- unique → duplicate signup returns 409
  status      text not null default 'active',  -- active | unsubscribed
  locale      text not null default 'en',      -- en | de  (for localised newsletter)
  source      text default 'homepage',         -- homepage | community | shop | digital-world
  edition     text default 'edition_01'
);

-- If the table already exists from the waitlist, add the new columns:
alter table public.subscribers add column if not exists status text not null default 'active';
alter table public.subscribers add column if not exists locale text not null default 'en';
alter table public.subscribers add column if not exists source text default 'homepage';
alter table public.subscribers add column if not exists edition text default 'edition_01';

create index if not exists subscribers_status_idx on public.subscribers (status);

-- The app writes via the service-role key (server only) and the monthly cron
-- reads via service-role. No client access needed → RLS on, no anon policy.
alter table public.subscribers enable row level security;

-- ── log of monthly newsletter sends ────────────────────────────────
create table if not exists public.newsletter_sends (
  id              uuid primary key default gen_random_uuid(),
  sent_at         timestamptz not null default now(),
  subject         text,
  recipient_count integer default 0,
  edition         text
);
alter table public.newsletter_sends enable row level security;
