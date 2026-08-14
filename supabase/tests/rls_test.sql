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
select plan(16);

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

-- ═══ P0-Härtung (Migrationen 0015–0019) ═════════════════════════════════════

-- ── 0015: anon kann subscribers nicht mehr direkt füllen (M1) ───────────────
select pg_temp.act_as_anon();
select throws_ok(
  $$ insert into public.subscribers (email, source, edition)
     values ('spam@test.dev','direct','edition_01') $$,
  '42501', null,
  'anon cannot insert into subscribers (0015 drift repair)'
);
reset role;

-- ── 0016: public_place_spots ist nicht mehr umschreibbar (H1) ───────────────
insert into public.public_place_spots (id, name, address, lat, lng, category, maps_url, source_id)
values ('spot-1','Cafe Echt','Teststr. 1', 48.0, 9.0, 'cafe', 'https://maps.example/a', 'src-1');

select pg_temp.act_as_anon();
-- Ohne UPDATE-Policy wirft RLS nicht — es werden schlicht 0 Zeilen erfasst.
update public.public_place_spots set maps_url = 'https://evil.example' where id = 'spot-1';
reset role;
select is(
  (select maps_url from public.public_place_spots where id = 'spot-1'),
  'https://maps.example/a',
  'anon update on public_place_spots changes nothing (0016, H1)'
);
select throws_ok(
  $$ insert into public.public_place_spots (id, name, address, lat, lng, category, maps_url, source_id)
     values ('spot-2','Phish','x', 0, 0, 'cafe', 'javascript:alert(1)', 'src-2') $$,
  '23514', null,
  'non-https maps_url is rejected by check constraint (0016)'
);

-- ── 0017: Rate-Limit-Tabelle und RPC sind für Clients unerreichbar (H2) ─────
select pg_temp.act_as_anon();
select throws_ok(
  $$ select * from public.api_rate_limits $$,
  '42501', null,
  'anon cannot read api_rate_limits (0017)'
);
select throws_ok(
  $$ select public.api_rate_hit('x', 60, 1) $$,
  '42501', null,
  'anon cannot execute api_rate_hit (0017)'
);
reset role;

-- ── 0018: couple-Cap + Code-Rotation (M6) ───────────────────────────────────
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
values
  ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555',
   'authenticated','authenticated','third@test.dev','', now(), now(), now(), '{}','{}', false);

-- user 2 tritt regulär bei — der Space ist danach voll und der Code rotiert.
select pg_temp.act_as('22222222-2222-2222-2222-222222222222');
select lives_ok(
  $$ select public.redeem_invite('PEAK-0001') $$,
  'second member can redeem the invite (0018)'
);
reset role;
select isnt(
  (select invite_code from public.spaces where id = '33333333-3333-3333-3333-333333333333'),
  'PEAK-0001',
  'invite code rotates once the couple space is full (0018, M6)'
);

-- Rotierten Code als GUC festhalten, solange wir noch privilegiert lesen —
-- als user 3 wäre `spaces` RLS-gesperrt und die Subquery ergäbe NULL.
select set_config('test.rotated_code', invite_code, false)
from public.spaces where id = '33333333-3333-3333-3333-333333333333';

-- user 3 scheitert: alter Code tot, neuer Code voll.
select pg_temp.act_as('55555555-5555-5555-5555-555555555555');
select throws_ok(
  $$ select public.redeem_invite('PEAK-0001') $$,
  'P0001', 'invalid invite code',
  'rotated-away code no longer works (0018, M6)'
);
select throws_ok(
  $$ select public.redeem_invite(current_setting('test.rotated_code')) $$,
  'P0001', 'space is full',
  'third member cannot join a full couple space (0018, M6)'
);
reset role;

-- ── 0019: Mess-Views geben Clients nichts her ───────────────────────────────
select pg_temp.act_as_anon();
select throws_ok(
  $$ select * from public.pp_metrics_north_star $$,
  '42501', null,
  'anon cannot read the metrics views (0019)'
);
reset role;

select * from finish();
rollback;
