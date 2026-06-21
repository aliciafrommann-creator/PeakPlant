-- Account deletion (Apple/GDPR) + private photo storage.

-- ── delete_account: erase the caller's account and data ──────────────────────
-- SECURITY DEFINER (runs as owner) so it can remove the auth user. Deletes
-- spaces the user is the sole member of (cascades their memories/activations/
-- enrollments), drops the user's memberships, detaches authored memories in
-- shared spaces, then removes the auth user (cascades the profile).
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- spaces where this user is the only member
  delete from public.spaces s
  where exists (select 1 from public.space_members m where m.space_id = s.id and m.user_id = uid)
    and (select count(*) from public.space_members m2 where m2.space_id = s.id) = 1;

  -- remaining memberships (shared spaces stay for the others)
  delete from public.space_members where user_id = uid;

  -- keep shared-space memories but detach authorship (FK would otherwise block)
  update public.memories set created_by = null where created_by = uid;

  -- finally remove the auth user; profiles cascades via its FK
  delete from auth.users where id = uid;
end;
$$;

grant execute on function public.delete_account() to authenticated;

-- ── private photo storage ────────────────────────────────────────────────────
-- One private bucket. Object paths are "<spaceId>/<file>", readable/writable
-- only by members of that space. Served via short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('memory-photos', 'memory-photos', false)
on conflict (id) do nothing;

create policy "memory-photos: members read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'memory-photos'
    and public.app_is_space_member((split_part(name, '/', 1))::uuid)
  );

create policy "memory-photos: members insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'memory-photos'
    and public.app_is_space_member((split_part(name, '/', 1))::uuid)
  );

create policy "memory-photos: members delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'memory-photos'
    and public.app_is_space_member((split_part(name, '/', 1))::uuid)
  );
