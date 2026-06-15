-- ════════════════════════════════════════════════════════════════════
-- peakplant — orders table
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query)
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.orders (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),

  -- stripe
  stripe_session_id       text unique,
  stripe_payment_intent   text,
  stripe_subscription_id  text,

  -- customer
  email                   text not null,
  product                 text not null,          -- 'founders' | 'subscription'
  edition_slug            text not null default 'edition-01',

  -- shipping
  shipping_name           text,
  shipping_address_line1  text,
  shipping_address_line2  text,
  shipping_city           text,
  shipping_postal_code    text,
  shipping_country        text,

  -- payment
  amount_total_cents      integer,
  currency                text default 'eur',
  payment_status          text not null default 'paid',     -- paid | invoice | refunded

  -- digital access
  access_token            text unique not null,

  -- invoicing (for reserve / pay-by-invoice orders)
  stripe_invoice_id       text,
  invoice_sent_at         timestamptz,

  -- fulfilment
  status                  text not null default 'pending',  -- pending | forwarded | cancelled
  supplier_forwarded_at   timestamptz
);

-- If the table already exists from an earlier version, add the new columns:
alter table public.orders add column if not exists payment_status    text not null default 'paid';
alter table public.orders add column if not exists stripe_invoice_id text;
alter table public.orders add column if not exists invoice_sent_at   timestamptz;

-- fast lookups for the digital-world gate
create index if not exists orders_access_token_idx on public.orders (access_token);
create index if not exists orders_email_idx         on public.orders (email);
create index if not exists orders_status_idx        on public.orders (status);

-- ── Row Level Security ──────────────────────────────────────────────
-- The app talks to this table ONLY through the service-role key on the
-- server (webhook, admin, access routes). The anon key must NOT read
-- orders (they contain addresses). So: enable RLS and add no anon policy.
alter table public.orders enable row level security;

-- service_role bypasses RLS automatically — no policy needed for it.
-- (Deliberately no policies for anon/authenticated = no client access.)
