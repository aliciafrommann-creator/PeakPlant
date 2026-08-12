-- 0014 — join & delete hardening (additive, forward-only; idempotent via
-- CREATE OR REPLACE). Two bug fixes found in the 2026-08-11 audit:
--
-- 1) redeem_invite (audit A2-2.1): sign-in creates the profiles row only
--    best-effort. If it is missing (network hiccup right after OTP), the
--    space_members insert violated its FK to profiles and the app showed the
--    WRONG error ("code falsch") for a correct code — an unrecoverable dead
--    end. Fix: self-heal the profile row first (same pattern create_space
--    already uses in 0008).
--
-- 2) delete_account (audit A2-6.2): the space-avatars bucket arrived with
--    0012, but delete_account (0004) only cleans memory-photos — avatar
--    photos survived a "cannot be undone" account deletion. Fix: clean both
--    buckets.

create or replace function public.redeem_invite(code text)
returns public.spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.spaces;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select * into s from public.spaces where invite_code = code;
  if not found then
    raise exception 'invalid invite code';
  end if;

  -- Self-heal: the profile row can be missing if ensureProfile failed after
  -- OTP sign-in. Without it the FK below fails and the user is stuck.
  insert into public.profiles (id, name)
  values (uid, '')
  on conflict (id) do nothing;

  insert into public.space_members (space_id, user_id, name, role)
  values (
    s.id,
    uid,
    coalesce((select name from public.profiles where id = uid), ''),
    'member'
  )
  on conflict (space_id, user_id) do nothing;

  return s;
end;
$$;

grant execute on function public.redeem_invite(text) to authenticated;

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  sole_spaces uuid[];
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- spaces where this user is the only member
  select array_agg(s.id) into sole_spaces
  from public.spaces s
  where exists (select 1 from public.space_members m where m.space_id = s.id and m.user_id = uid)
    and (select count(*) from public.space_members m2 where m2.space_id = s.id) = 1;

  if sole_spaces is not null then
    -- delete their photos from BOTH private buckets, then the spaces
    -- (cascades memories etc.)
    delete from storage.objects
    where bucket_id in ('memory-photos', 'space-avatars')
      and (split_part(name, '/', 1))::uuid = any(sole_spaces);
    delete from public.spaces where id = any(sole_spaces);
  end if;

  -- remaining memberships (shared spaces stay for the others)
  delete from public.space_members where user_id = uid;
  -- keep shared-space memories but detach authorship
  update public.memories set created_by = null where created_by = uid;
  -- finally remove the auth user; profiles cascades via its FK
  delete from auth.users where id = uid;
end;
$$;

grant execute on function public.delete_account() to authenticated;
