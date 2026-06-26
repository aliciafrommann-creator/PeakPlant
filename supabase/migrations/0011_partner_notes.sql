-- PeakPlant — dedicated partner notes.
--
-- A short love message one member leaves inside a space. Space-scoped under the
-- same RLS as memories (uses public.app_is_space_member from 0001): both members
-- read every note, only the author inserts/deletes their own. Additive only —
-- creates one new table and its policies; touches no existing table.

create table if not exists public.partner_notes (
  id          uuid primary key default gen_random_uuid(),
  space_id    uuid not null references public.spaces (id) on delete cascade,
  text        text not null check (char_length(text) between 1 and 280),
  author_id   uuid references public.profiles (id),
  author_name text,
  created_at  timestamptz not null default now()
);

create index if not exists partner_notes_space_created_idx
  on public.partner_notes (space_id, created_at desc);

alter table public.partner_notes enable row level security;

drop policy if exists "partner_notes: members read" on public.partner_notes;
create policy "partner_notes: members read"
  on public.partner_notes for select to authenticated
  using (public.app_is_space_member(space_id));

drop policy if exists "partner_notes: members insert" on public.partner_notes;
create policy "partner_notes: members insert"
  on public.partner_notes for insert to authenticated
  with check (public.app_is_space_member(space_id) and author_id = auth.uid());

drop policy if exists "partner_notes: author delete" on public.partner_notes;
create policy "partner_notes: author delete"
  on public.partner_notes for delete to authenticated
  using (public.app_is_space_member(space_id) and author_id = auth.uid());

grant select, insert, delete on public.partner_notes to authenticated;
