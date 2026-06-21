-- Harden delete_account: also remove stored photos for spaces being deleted,
-- so a deleted account/space leaves no orphaned files in the private bucket.

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
    -- delete their photos from storage, then the spaces (cascades memories etc.)
    delete from storage.objects
    where bucket_id = 'memory-photos'
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
