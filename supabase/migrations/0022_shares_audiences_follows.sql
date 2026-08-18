-- 0022 — Freigaben, Publika, Folgen. Nach 0021 anwenden.
--
-- WOFÜR: Die App kennt heute genau zwei Sichtbarkeiten — privat für einen
-- Space (RLS, space-scoped) oder vollständig öffentlich und anonym
-- (public_place_feedback, dessen Tabelle bewusst keine Spalte für Space oder
-- Person hat). Alles dazwischen — eine Aktivität mit einem gewählten Publikum
-- teilen, ein Feed, später Abende — hat bisher keinen Ort im Schema. Diese
-- Migration schafft ihn, und zwar VOR jeder Oberfläche: erst der Graph, dann
-- das Bauen (Entscheidung Alicia, 18.08.2026).
--
-- DIE ENTSCHEIDENDE FORM: Ein Moment wird NIE geteilt.
--
-- Naheliegend wäre eine Spalte `visibility` auf `memories`. Das ist die falsche
-- Bewegung, aus drei Gründen:
--   1. Ein einziger fehlerhafter UPDATE macht dann ein Tagebuch öffentlich.
--   2. Dasselbe Bild kann nicht an zwei Publika hängen.
--   3. Zurücknehmen wird ein Rückbau statt eines Löschens.
-- Stattdessen zeigt eine eigene, widerrufliche Zeile auf ihn: die Freigabe.
-- Löscht man sie, verschwindet das Sichtbare; der Moment bleibt unberührt.
-- `memories` wird von dieser Migration NICHT angefasst.
--
-- DIE GRENZE ALS SPALTENLISTE, NICHT ALS FILTER (MANIFESTO §2):
-- Was sichtbar werden darf, sind Titel und Bild — nicht die Notiz, nicht der
-- Space, nicht wer ihr seid. Das steht nicht in einer Filterfunktion, die man
-- vergessen kann, sondern in `public_shares`: die Ansicht hat diese Spalten
-- schlicht nicht. Was nicht existiert, kann nicht durchrutschen. Genauso ist
-- public_place_feedback gebaut, und genau deshalb hält es.
--
-- FOLGEN ZEIGT NIE AUF EINEN MENSCHEN:
-- `follows` hat keine Spalte für eine gefolgte Person, und `audiences.kind`
-- kennt kein 'person'. Damit sind öffentliche Profile und Follower nicht
-- verboten, sondern NICHT AUSDRÜCKBAR — der Unterschied zwischen einer Regel
-- und einer Bauweise. Das setzt Alicias eigene Entscheidung vom 17.08. um
-- („Die kleinste Einheit ist ein Abend, kein Mensch"), die sie mit Sicherheit
-- für Frauen begründet hat: kein durchblätterbares Raster, keine Fläche zum
-- Nachstellen.
--
-- WARUM NUR ORT UND THEMA, NOCH KEIN KREIS:
-- Ein Publikum füllt sich nur, wenn sein Anker schon existiert, bevor jemand
-- etwas hineinlegt. Ein Ort existiert (Strava-Segmente, Komoot, Nextdoor), ein
-- Thema existiert (Letterboxd hängt alles an DEM Film, nie an einer Person).
-- Ein Kreis existiert erst, wenn der soziale Graph da ist — bei heute zwei
-- Konten und keinem einzigen Paar wäre er per Konstruktion leer. `kind` ist
-- deshalb als CHECK formuliert, den eine spätere Migration erweitern kann,
-- wenn es Kreise zu füllen gibt.
--
-- Idempotent, additiv, rührt keine bestehende Tabelle an. Verändert das
-- Verhalten der App NICHT: solange keine Oberfläche schreibt, bleibt alles
-- leer, und die App läuft unverändert weiter, auch ohne diese Migration.

-- ---------------------------------------------------------------------------
-- PUBLIKUM — der Anker, an dem etwas hängen kann.
-- ---------------------------------------------------------------------------
create table if not exists public.audiences (
  id          uuid primary key default gen_random_uuid(),
  -- KEIN 'person'. Siehe Kopfkommentar — das ist die eigentliche Zusage.
  kind        text not null check (kind in ('place', 'theme')),
  -- Der natürliche Schlüssel des Ankers: eine Orts-Id oder ein Themen-Kürzel
  -- (z. B. die Wochen-Challenge). Zusammen mit `kind` eindeutig, damit
  -- derselbe Ort nicht zweimal entsteht.
  anchor      text not null,
  title       text not null,
  created_at  timestamptz not null default now(),
  unique (kind, anchor)
);

create index if not exists audiences_kind_idx on public.audiences (kind);

alter table public.audiences enable row level security;

-- Anker sind für alle Angemeldeten lesbar — das ist ihr Sinn: ein Ort und ein
-- Thema gehören niemandem. Angelegt werden sie serverseitig (service_role),
-- damit niemand die Liste mit erfundenen Ankern flutet.
drop policy if exists "audiences: readable by signed-in" on public.audiences;
create policy "audiences: readable by signed-in" on public.audiences
  for select to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- FREIGABE — der widerrufliche Akt. Zeigt auf einen Moment, gehört einem Space.
-- ---------------------------------------------------------------------------
create table if not exists public.shares (
  id          uuid primary key default gen_random_uuid(),
  -- Stirbt der Moment, stirbt die Freigabe. Nie umgekehrt.
  memory_id   uuid not null references public.memories(id) on delete cascade,
  audience_id uuid not null references public.audiences(id) on delete cascade,
  -- Nur für die Rechteprüfung (wer darf widerrufen). Verlässt die Datenbank
  -- nie: `public_shares` hat diese Spalte nicht.
  space_id    uuid not null references public.spaces(id) on delete cascade,
  -- Wer sie angelegt hat. `set null` statt `cascade`: wird ein Konto gelöscht,
  -- verschwindet der Name, nicht das Geteilte — dieselbe Regel wie bei
  -- geteilten Momenten in 0014, und dieselbe, die die App inzwischen zusagt.
  created_by  uuid references auth.users(id) on delete set null,
  -- WAS DIE GRENZE ÜBERQUEREN DARF — und sonst nichts.
  title       text not null check (length(title) between 1 and 120),
  photo_path  text,
  created_at  timestamptz not null default now(),
  -- Zweimal dasselbe an dasselbe Publikum ist ein Versehen, kein Wunsch.
  unique (memory_id, audience_id)
);

create index if not exists shares_audience_idx on public.shares (audience_id, created_at desc);
create index if not exists shares_space_idx on public.shares (space_id);

alter table public.shares enable row level security;

-- Schreibpfad vollständig: ohne eigene INSERT- und DELETE-Policy würde RLS
-- beides still verwerfen (genau der Fehler, der schon einmal jede
-- Space-Umbenennung gefressen hat).
drop policy if exists "shares: members read own space" on public.shares;
create policy "shares: members read own space" on public.shares
  for select to authenticated
  using (public.app_is_space_member(space_id));

drop policy if exists "shares: members create for own space" on public.shares;
create policy "shares: members create for own space" on public.shares
  for insert to authenticated
  with check (public.app_is_space_member(space_id) and created_by = auth.uid());

-- Widerrufen darf jedes Mitglied des Space, nicht nur wer sie angelegt hat:
-- ein geteiltes Tagebuch gehört beiden. Wer sich unwohl fühlt, soll es
-- zurücknehmen können, ohne den anderen Menschen fragen zu müssen.
drop policy if exists "shares: members revoke own space" on public.shares;
create policy "shares: members revoke own space" on public.shares
  for delete to authenticated
  using (public.app_is_space_member(space_id));

-- Bewusst KEINE UPDATE-Policy: eine Freigabe wird widerrufen und neu gemacht,
-- nicht umgeschrieben. Damit gibt es keinen Pfad, auf dem sich ein bereits
-- sichtbarer Eintrag unter der Hand in etwas anderes verwandelt.

-- ---------------------------------------------------------------------------
-- DIE ANSICHT, DIE ANDERE LESEN — die Grenze aus dem Kopfkommentar.
-- ---------------------------------------------------------------------------
-- Weder space_id noch created_by noch memory_id. Nicht gefiltert: nicht
-- vorhanden. RLS ist zeilen-, nicht spaltenweise — deshalb ist eine Ansicht
-- mit security_invoker = off (Standard) hier die richtige Form: sie liest an
-- der Space-RLS vorbei und gibt exakt die Spalten heraus, die herausdürfen.
drop view if exists public.public_shares;
create view public.public_shares as
  select
    s.id,
    s.audience_id,
    s.title,
    s.photo_path,
    s.created_at
  from public.shares s;

comment on view public.public_shares is
  'Die einzige Ansicht auf Freigaben, die andere lesen. Trägt bewusst weder '
  'space_id noch created_by noch memory_id — die Datenschutzgrenze ist die '
  'Spaltenliste, kein Filter (MANIFESTO §2). Wer hier eine Spalte ergänzt, '
  'ändert eine Zusage.';

revoke all on public.public_shares from anon;
grant select on public.public_shares to authenticated;

-- ---------------------------------------------------------------------------
-- FOLGEN — zeigt auf ein Publikum. Es gibt keine Spalte für einen Menschen.
-- ---------------------------------------------------------------------------
create table if not exists public.follows (
  user_id     uuid not null references auth.users(id) on delete cascade,
  audience_id uuid not null references public.audiences(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, audience_id)
);

create index if not exists follows_audience_idx on public.follows (audience_id);

alter table public.follows enable row level security;

-- Nur die eigenen Zeilen — und zwar auch beim Lesen. Wem jemand folgt, ist
-- nichts, das ein anderer Mensch aus der Datenbank ziehen können soll; sonst
-- entstünde über Umwege doch wieder ein sozialer Graph.
drop policy if exists "follows: own rows" on public.follows;
create policy "follows: own rows" on public.follows
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Der Feed ist KEINE Tabelle.
-- ---------------------------------------------------------------------------
-- Er ist die Abfrage „public_shares, deren audience_id ich folge", nach Zeit
-- sortiert. Absichtlich nicht materialisiert: ein gespeicherter Feed kann von
-- der Wahrheit abweichen, und ein Widerruf müsste ihn nachträglich aufräumen.
-- So wirkt ein Widerruf sofort und überall, weil es nichts nachzuräumen gibt.
