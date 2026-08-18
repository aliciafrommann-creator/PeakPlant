-- 0023 — Die öffentliche Projektion als eigene Tabelle statt als Ansicht.
-- Korrektur zu 0022 (angewandt, deshalb nicht editiert, sondern vorwärts).
--
-- WARUM: 0022 löste die Datenschutzgrenze mit einer Ansicht `public_shares`,
-- die bewusst an der Zeilen-Sicherheit vorbeiliest (SECURITY DEFINER) und nur
-- die unbedenklichen Spalten herausgibt. Das funktioniert — aber der
-- Security-Advisor meldet es zu Recht als ERROR: eine Definer-Ansicht ist eine
-- Umgehung, und eine Umgehung muss man jedes Mal neu prüfen. Eine Zusage, die
-- an einer Ausnahme hängt, ist schwächer als eine, die keine braucht.
--
-- DIE BESSERE FORM: zwei Tabellen statt einer Tabelle mit einer Ausnahme.
--
--   shares       — bleibt privat. Trägt space_id, created_by, memory_id.
--                  Nur Mitglieder des Space sehen und widerrufen sie.
--   share_cards  — die öffentliche Projektion. Trägt NUR, was sichtbar sein
--                  darf. Kein Zeiger auf den Space, keine Identität, kein
--                  Moment. Für Angemeldete lesbar — mit einer ganz normalen
--                  Policy, ohne Umgehung.
--
-- Geschrieben wird `share_cards` ausschließlich von einem Trigger auf
-- `shares`. Es gibt bewusst KEINE INSERT-, UPDATE- oder DELETE-Policy: niemand
-- kann eine öffentliche Karte erfinden, nachträglich verändern oder eine
-- fremde löschen. Das Löschen erledigt der Fremdschlüssel beim Widerruf.
--
-- Damit ist die Grenze doppelt gesichert: die Spalten existieren nicht, UND
-- der Schreibweg ist keiner, den ein Client hat.

drop view if exists public.public_shares;

create table if not exists public.share_cards (
  -- Eigene Id. `share_id` zeigt zurück, damit ein Widerruf kaskadiert — und
  -- ist harmlos: `shares` ist RLS-geschützt, mit der Id allein kommt niemand
  -- an den Space oder den Moment.
  id          uuid primary key default gen_random_uuid(),
  share_id    uuid not null unique references public.shares(id) on delete cascade,
  audience_id uuid not null references public.audiences(id) on delete cascade,
  -- WAS DIE GRENZE ÜBERQUEREN DARF — und sonst nichts.
  title       text not null,
  photo_path  text,
  created_at  timestamptz not null default now()
);

create index if not exists share_cards_audience_idx
  on public.share_cards (audience_id, created_at desc);

alter table public.share_cards enable row level security;

-- Lesen: alle Angemeldeten. Das ist der Sinn eines Orts- oder Themen-Publikums.
-- Welche Karten jemand SIEHT, entscheidet die Abfrage (wem folge ich) — nicht
-- die Sicherheit. Ein Ort gehört niemandem.
drop policy if exists "share_cards: readable by signed-in" on public.share_cards;
create policy "share_cards: readable by signed-in" on public.share_cards
  for select to authenticated
  using (true);

-- Bewusst KEINE Schreib-Policies. Der einzige Schreibweg ist der Trigger unten.

create or replace function public.share_card_from_share()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.share_cards (share_id, audience_id, title, photo_path, created_at)
  values (new.id, new.audience_id, new.title, new.photo_path, new.created_at);
  return new;
end;
$$;

-- Nicht für Clients aufrufbar: es ist ein Trigger, keine Schnittstelle.
revoke all on function public.share_card_from_share() from public, anon, authenticated;

drop trigger if exists share_cards_insert on public.shares;
create trigger share_cards_insert
  after insert on public.shares
  for each row execute function public.share_card_from_share();

-- Bestandszeilen nachziehen (0022 ist frisch, in aller Regel null Zeilen —
-- aber die Migration soll auch dann stimmen, wenn zwischendurch etwas entstand).
insert into public.share_cards (share_id, audience_id, title, photo_path, created_at)
select s.id, s.audience_id, s.title, s.photo_path, s.created_at
from public.shares s
where not exists (select 1 from public.share_cards c where c.share_id = s.id);

comment on table public.share_cards is
  'Die öffentliche Projektion einer Freigabe. Traegt bewusst weder space_id '
  'noch created_by noch memory_id — die Datenschutzgrenze ist die Spaltenliste '
  '(MANIFESTO §2). Geschrieben nur vom Trigger auf shares; es gibt keine '
  'Schreib-Policy. Wer hier eine Spalte ergaenzt, aendert eine Zusage.';
