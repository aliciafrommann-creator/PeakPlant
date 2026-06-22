-- Create a space and its owner membership atomically.
--
-- A direct insert followed by SELECT cannot return the new space under the
-- member-only spaces RLS policy until the membership exists. Keeping both
-- writes inside this SECURITY DEFINER function avoids partial spaces and
-- derives ownership from auth.uid() rather than a client-provided user id.

create or replace function public.create_space(
  p_type text,
  p_name text,
  p_owner_name text,
  p_invite_code text
)
returns public.spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  created_space public.spaces;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if p_type not in ('couple', 'friends') then
    raise exception 'invalid space type' using errcode = '22023';
  end if;

  if p_invite_code is null
     or p_invite_code !~ '^PEAK-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$' then
    raise exception 'invalid invite code format' using errcode = '22023';
  end if;

  -- Login normally creates the profile first. This makes space creation
  -- recover safely if that earlier best-effort profile write was interrupted.
  insert into public.profiles (id, name)
  values (uid, coalesce(trim(p_owner_name), ''))
  on conflict (id) do nothing;

  insert into public.spaces (type, name, invite_code)
  values (
    p_type,
    coalesce(nullif(trim(p_name), ''), case when p_type = 'couple' then 'Our space' else 'Friends' end),
    p_invite_code
  )
  returning * into created_space;

  insert into public.space_members (space_id, user_id, name, role)
  values (
    created_space.id,
    uid,
    coalesce(nullif(trim(p_owner_name), ''), (select name from public.profiles where id = uid), ''),
    'owner'
  );

  return created_space;
end;
$$;

revoke all on function public.create_space(text, text, text, text) from public;
grant execute on function public.create_space(text, text, text, text) to authenticated;
