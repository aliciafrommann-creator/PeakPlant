-- 0025 — Tageskarten: ein Foto und eine Notiz, einmal am Tag, je Person.
--
-- ENTSCHEIDUNG (Alicia, 19.08.2026): „in Freundesgruppen und bei Partner-
-- Spaces jede Person ein Foto und eine Notiz am Tag … man klickt das Foto,
-- Anzeige dreht sich um, man sieht die Notiz." Auf die Rückfrage, ob das die
-- bestehende Momente-Wand mit Tageslimit sei: EIGENSTÄNDIG, wie BeReal.
--
-- Deshalb eine eigene Tabelle und nicht ein Feld auf `memories`. Ein Moment
-- hängt an einer Karte oder Idee und darf beliebig oft entstehen; eine
-- Tageskarte hängt an einem TAG und einer PERSON. Zwei verschiedene Dinge in
-- einer Tabelle hätten am Ende zwei Bedeutungen für dieselbe Zeile.
--
-- DIE REGEL STEHT IN DER DATENBANK, nicht in der Oberfläche: `unique
-- (space_id, author_id, day)`. Wer sich darauf verlässt, dass ein Bildschirm
-- das verhindert, hat die Regel nicht — er hat eine Gewohnheit.
--
-- `day` ist ein DATE ohne Zeitzone und wird vom Client in ORTSZEIT gesetzt.
-- Wer abends um 23 Uhr etwas ablegt, legt es an DIESEM Abend ab. Würde der
-- Server `current_date` (UTC) setzen, entstünden für europäische Abende zwei
-- Karten an einem Tag — ein Fehler, der sich nachträglich nicht mehr
-- reparieren lässt, weil dann echte Inhalte daran hängen.
--
-- Idempotent. Nach dem Anwenden `get_advisors` (security) gegenprüfen.

create table if not exists public.dailies (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default '',
  day date not null,
  note text not null default '',
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dailies_note_len check (char_length(note) <= 240),
  constraint dailies_one_per_person_per_day unique (space_id, author_id, day)
);

create index if not exists dailies_space_day_idx
  on public.dailies (space_id, day desc);

alter table public.dailies enable row level security;

-- LESEN: alle Mitglieder des Space. Eine Tageskarte ist für die Menschen im
-- Space gedacht — und für sonst niemanden (MANIFESTO §2).
drop policy if exists "members read dailies" on public.dailies;
create policy "members read dailies"
  on public.dailies
  for select
  to authenticated
  using (public.app_is_space_member(space_id));

-- SCHREIBEN: nur die eigene Karte, nur im eigenen Space. `author_id` wird
-- gegen `auth.uid()` geprüft — ohne das könnte ein Mitglied eine Karte im
-- Namen eines anderen ablegen.
drop policy if exists "members write own daily" on public.dailies;
create policy "members write own daily"
  on public.dailies
  for insert
  to authenticated
  with check (author_id = auth.uid() and public.app_is_space_member(space_id));

drop policy if exists "authors update own daily" on public.dailies;
create policy "authors update own daily"
  on public.dailies
  for update
  to authenticated
  using (author_id = auth.uid() and public.app_is_space_member(space_id))
  with check (author_id = auth.uid() and public.app_is_space_member(space_id));

drop policy if exists "authors delete own daily" on public.dailies;
create policy "authors delete own daily"
  on public.dailies
  for delete
  to authenticated
  using (author_id = auth.uid());

-- `updated_at` mitführen, damit ein Ersetzen sichtbar bleibt.
create or replace function public.dailies_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists dailies_touch_trg on public.dailies;
create trigger dailies_touch_trg
  before update on public.dailies
  for each row execute function public.dailies_touch();

insert into supabase_migrations.schema_migrations (version, name)
values ('20260819160000', '0025_dailies')
on conflict (version) do nothing;
