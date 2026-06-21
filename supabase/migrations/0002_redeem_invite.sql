-- redeem_invite: join a space by its invite code.
--
-- SECURITY DEFINER so a not-yet-member can join without being able to SELECT the
-- space under RLS (spaces are member-only readable). Adds the caller as a member
-- and returns the space. Idempotent (re-joining is a no-op).

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
