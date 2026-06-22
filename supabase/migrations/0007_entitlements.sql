-- PeakPlant — monetization M0: couple entitlements + privacy-safe usage metering.
--
-- Additive / forward-ready. Touches ONLY new PeakPlant tables. Does NOT touch
-- website tables (orders, subscribers, community_questions, newsletter_sends).
-- RLS is deny-by-default and scoped to space membership via app_is_space_member.
--
-- DORMANT: not applied to the live project. Monetization is fully disabled
-- (MONETIZATION_ENABLED = false) and the beta runs local-first. Apply this only
-- when enabling backend billing, after human approval (see docs/MONETIZATION.md).
--
-- PRIVACY: ai_usage stores counts, ids, sizes, latency, money and outcome ONLY.
-- It must never store diary text, reflections, prompt answers, partner messages,
-- photos, or any intimate prompt content. There is no column that could.

-- ── entitlements (one row per couple/space) ──────────────────────────────────
create table public.entitlements (
  space_id        uuid primary key references public.spaces (id) on delete cascade,
  tier            text not null default 'free' check (tier in ('free', 'plus')),
  source          text not null default 'free' check (source in ('free', 'purchase', 'promo', 'trial')),
  starts_at       timestamptz,
  expires_at      timestamptz,
  last_verified_at timestamptz,
  -- Opaque, non-sensitive provider reference (e.g. RevenueCat app_user_id).
  provider        text,
  provider_ref    text,
  updated_at      timestamptz not null default now()
);

alter table public.entitlements enable row level security;

-- Members may READ their couple's entitlement. Writes come from the server
-- (service role / billing webhook), never the client, so no client write policy.
create policy "members can read their space entitlement"
  on public.entitlements
  for select
  using (app_is_space_member(space_id));

-- ── ai_allowance (per-couple, per-cycle counter) ─────────────────────────────
create table public.ai_allowance (
  space_id     uuid not null references public.spaces (id) on delete cascade,
  cycle_start  date not null,
  used         integer not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (space_id, cycle_start)
);

alter table public.ai_allowance enable row level security;

create policy "members can read their space allowance"
  on public.ai_allowance
  for select
  using (app_is_space_member(space_id));
-- Deductions are authoritative on the server (the enforcement boundary), so
-- there is intentionally no client INSERT/UPDATE policy.

-- ── ai_usage (privacy-safe metering / cost) ──────────────────────────────────
create table public.ai_usage (
  id              uuid primary key default gen_random_uuid(),
  space_id        uuid not null references public.spaces (id) on delete cascade,
  kind            text not null check (kind in ('ai_request', 'provider_request')),
  provider        text not null,                 -- model/provider id, NOT content
  est_tokens      integer,
  provider_requests integer,
  latency_ms      integer,
  outcome         text not null check (outcome in ('success', 'failure')),
  tier            text not null check (tier in ('free', 'plus')),
  est_cost_cents  numeric(10,3) not null default 0,
  request_key     text,                          -- idempotency / duplicate guard
  created_at      timestamptz not null default now()
);
create index ai_usage_space_idx on public.ai_usage (space_id, created_at desc);
-- Duplicate-request protection at the DB layer for a cycle's keys.
create unique index ai_usage_request_key_uidx
  on public.ai_usage (space_id, request_key)
  where request_key is not null;

alter table public.ai_usage enable row level security;

-- Usage rows are written by the server enforcement boundary. Members may read
-- their own couple's aggregate usage (e.g. "X of N requests left this month").
create policy "members can read their space usage"
  on public.ai_usage
  for select
  using (app_is_space_member(space_id));
