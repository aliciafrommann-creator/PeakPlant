-- PeakPlant — initial schema + deny-by-default RLS.
--
-- Maps the local-first domain (spaces, members, memories, card activations,
-- challenge enrollments) to Postgres. Every personal table has RLS enabled and
-- NO permissive policy by default — access is granted only through the explicit
-- space-membership policies below (SECURITY: deny-by-default, space-scoped).
--
-- Apply with the Supabase CLI:  supabase db push   (or via migrations).
-- This file is immutable once applied to a real project; corrections are new
-- forward migrations (see docs/TESTING + the sister project's build rules).

-- ── helper: is the current user a member of a space? ────────────────────────
-- SECURITY DEFINER so it can read space_members without tripping that table's
-- own RLS (prevents recursive policy evaluation). Locked search_path.
create or replace function public.app_is_space_member(target_space uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.space_members m
    where m.space_id = target_space
      and m.user_id = auth.uid()
  );
$$;

-- ── profiles (1:1 with auth.users) ──────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text not null default '',
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select to authenticated
  using (id = auth.uid());
create policy "profiles: insert own"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ── spaces ──────────────────────────────────────────────────────────────────
create table public.spaces (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('couple', 'friends')),
  name        text not null,
  invite_code text not null unique,
  created_at  timestamptz not null default now()
);
alter table public.spaces enable row level security;

-- Members can read their spaces. Any authenticated user may create a space; the
-- creating client must immediately insert its own membership row (the invite/
-- linking flow is hardened via RPC in a later migration — see docs/BACKEND).
create policy "spaces: members read"
  on public.spaces for select to authenticated
  using (public.app_is_space_member(id));
create policy "spaces: authenticated create"
  on public.spaces for insert to authenticated
  with check (true);

-- ── space_members ────────────────────────────────────────────────────────────
create table public.space_members (
  id        uuid primary key default gen_random_uuid(),
  space_id  uuid not null references public.spaces (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  name      text not null default '',
  role      text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  unique (space_id, user_id)
);
alter table public.space_members enable row level security;

create policy "space_members: read same space"
  on public.space_members for select to authenticated
  using (public.app_is_space_member(space_id));
-- A user may add only themselves (join). Inviting others is done via RPC later.
create policy "space_members: add self"
  on public.space_members for insert to authenticated
  with check (user_id = auth.uid());
create policy "space_members: leave self"
  on public.space_members for delete to authenticated
  using (user_id = auth.uid());

-- ── memories (the diary) ─────────────────────────────────────────────────────
create table public.memories (
  id          uuid primary key default gen_random_uuid(),
  space_id    uuid not null references public.spaces (id) on delete cascade,
  card_id     text not null,
  note        text not null default '',
  photo_path  text,                       -- private storage path; never a public URL
  created_by  uuid references public.profiles (id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.memories enable row level security;

create policy "memories: members read"
  on public.memories for select to authenticated
  using (public.app_is_space_member(space_id));
create policy "memories: members insert"
  on public.memories for insert to authenticated
  with check (public.app_is_space_member(space_id) and created_by = auth.uid());
create policy "memories: members update"
  on public.memories for update to authenticated
  using (public.app_is_space_member(space_id))
  with check (public.app_is_space_member(space_id));
create policy "memories: members delete"
  on public.memories for delete to authenticated
  using (public.app_is_space_member(space_id));

create index memories_space_created_idx on public.memories (space_id, created_at desc);

-- ── card_activations (per-space card progress) ───────────────────────────────
create table public.card_activations (
  space_id      uuid not null references public.spaces (id) on delete cascade,
  card_id       text not null,
  activated_at  timestamptz not null default now(),
  primary key (space_id, card_id)
);
alter table public.card_activations enable row level security;

create policy "card_activations: members read"
  on public.card_activations for select to authenticated
  using (public.app_is_space_member(space_id));
create policy "card_activations: members write"
  on public.card_activations for insert to authenticated
  with check (public.app_is_space_member(space_id));

-- ── challenge_enrollments ────────────────────────────────────────────────────
create table public.challenge_enrollments (
  id           uuid primary key default gen_random_uuid(),
  space_id     uuid not null references public.spaces (id) on delete cascade,
  challenge_id text not null,
  joined_at    timestamptz not null default now(),
  unique (space_id, challenge_id)
);
alter table public.challenge_enrollments enable row level security;

create policy "challenge_enrollments: members read"
  on public.challenge_enrollments for select to authenticated
  using (public.app_is_space_member(space_id));
create policy "challenge_enrollments: members write"
  on public.challenge_enrollments for insert to authenticated
  with check (public.app_is_space_member(space_id));
create policy "challenge_enrollments: members delete"
  on public.challenge_enrollments for delete to authenticated
  using (public.app_is_space_member(space_id));

-- Editions, cards, together-moments, and local places are static catalog data
-- shipped with the app (and later a read-only public table). They are not
-- personal data, so they are not modelled here.
