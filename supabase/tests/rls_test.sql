-- pgTAP RLS tests for PeakPlant (allow/deny per role).
--
-- NOT executed in CI here. Run against a local Supabase stack:
--   supabase start && supabase test db
-- or paste into the SQL editor on a NON-production/staging project.
--
-- Verifies that space membership is the gate: a member sees their space's data,
-- a non-member sees nothing, and the anon role sees nothing.

begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

-- ── seed two users, one space, one membership, one memory ───────────────────
-- (run as the privileged migration role; bypasses RLS for setup)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'authenticated','authenticated','member@test.dev','', now(), now(), now(), '{}','{}', false),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'authenticated','authenticated','outsider@test.dev','', now(), now(), now(), '{}','{}', false);

insert into public.profiles (id, name) values
  ('11111111-1111-1111-1111-111111111111','Member'),
  ('22222222-2222-2222-2222-222222222222','Outsider');

insert into public.spaces (id, type, name, invite_code)
values ('33333333-3333-3333-3333-333333333333','couple','Test Space','PEAK-0001');

insert into public.space_members (space_id, user_id, name, role)
values ('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','Member','owner');

insert into public.memories (id, space_id, card_id, note, created_by)
values ('44444444-4444-4444-4444-444444444444','33333333-3333-3333-3333-333333333333','card-01','secret','11111111-1111-1111-1111-111111111111');

-- helper to act as a given user under the authenticated role
create or replace function pg_temp.act_as(uid text) returns void language plpgsql as $$
begin
  perform set_config('role','authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role','authenticated')::text, true);
end; $$;

create or replace function pg_temp.act_as_anon() returns void language plpgsql as $$
begin
  perform set_config('role','anon', true);
  perform set_config('request.jwt.claims', '', true);
end; $$;

-- ── member can see their space + memory ─────────────────────────────────────
select pg_temp.act_as('11111111-1111-1111-1111-111111111111');
select is( (select count(*)::int from public.spaces),   1, 'member sees their space');
select is( (select count(*)::int from public.memories), 1, 'member sees their memory');
select is( (select count(*)::int from public.space_members), 1, 'member sees membership');
reset role;

-- ── outsider sees nothing ───────────────────────────────────────────────────
select pg_temp.act_as('22222222-2222-2222-2222-222222222222');
select is( (select count(*)::int from public.spaces),   0, 'outsider sees no space');
select is( (select count(*)::int from public.memories), 0, 'outsider sees no memory');
reset role;

-- ── anon sees nothing ───────────────────────────────────────────────────────
select pg_temp.act_as_anon();
select is( (select count(*)::int from public.spaces),   0, 'anon sees no space');
select is( (select count(*)::int from public.memories), 0, 'anon sees no memory');
reset role;

-- ── outsider cannot insert a memory into a space they are not in ────────────
select pg_temp.act_as('22222222-2222-2222-2222-222222222222');
select throws_ok(
  $$ insert into public.memories (space_id, card_id, note, created_by)
     values ('33333333-3333-3333-3333-333333333333','card-02','intrusion','22222222-2222-2222-2222-222222222222') $$,
  '42501',
  'new row violates row-level security policy for table "memories"',
  'outsider cannot insert into a space they are not a member of'
);
reset role;

select * from finish();
rollback;
