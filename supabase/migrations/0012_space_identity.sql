-- Space identity: a shared emoji + avatar photo so BOTH members see the same
-- "this is our place". Additive and forward-only.
--
-- Why this also adds an UPDATE policy: until now `spaces` had only SELECT and
-- INSERT policies (migration 0001). With RLS on and no UPDATE policy, every
-- `update spaces ...` was silently denied — so renames never persisted to the
-- server either. This migration makes name/emoji/avatar genuinely shared.

-- ── 1) identity columns ──────────────────────────────────────────────────────
alter table public.spaces add column if not exists emoji       text;
alter table public.spaces add column if not exists avatar_path text;

-- ── 2) members may update their space's mutable identity fields ───────────────
drop policy if exists "spaces: members update" on public.spaces;
create policy "spaces: members update"
  on public.spaces for update to authenticated
  using (public.app_is_space_member(id))
  with check (public.app_is_space_member(id));

-- ── 3) shared, member-scoped avatar bucket ───────────────────────────────────
-- Separate from the private 'memory-photos' bucket (0003): a space avatar is a
-- shared identity image, not a private memory. Paths are "<spaceId>/<file>";
-- only members of that space can read/write. Served via short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('space-avatars', 'space-avatars', false)
on conflict (id) do nothing;

drop policy if exists "space-avatars: members read" on storage.objects;
create policy "space-avatars: members read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'space-avatars'
    and public.app_is_space_member((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "space-avatars: members insert" on storage.objects;
create policy "space-avatars: members insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'space-avatars'
    and public.app_is_space_member((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "space-avatars: members update" on storage.objects;
create policy "space-avatars: members update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'space-avatars'
    and public.app_is_space_member((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "space-avatars: members delete" on storage.objects;
create policy "space-avatars: members delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'space-avatars'
    and public.app_is_space_member((split_part(name, '/', 1))::uuid)
  );
