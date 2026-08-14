-- 0016 — H1: `public_place_spots` schreibgeschützt machen. Nach 0015 anwenden.
--
-- Live-Policy (verifiziert 14.08.2026, aus Migration 0010):
--   "clients can refresh anonymized place spots" — UPDATE für {public} mit
--   using(true) with check(true). Damit konnte JEDER Client (anon reicht)
--   Name, Adresse, Koordinaten und maps_url JEDES öffentlichen Pins
--   umschreiben: Phishing-Link hinter einem vertrauten Ortsnamen, falsche
--   Treffpunkte, plus ein Injektionspfad in den discover-Prompt (vergiftete
--   Ortsnamen). Der einzige App-Schreibpfad (saveSpot) nutzt seit diesem
--   Commit insert-only mit ignoreDuplicates — ein legitimer UPDATE-Fall
--   existiert nicht.
--
-- INSERT (anonymes Teilen neuer Spots) und SELECT (öffentliche Karte)
-- bleiben unverändert. Idempotent. Rollback = Policy wiederherstellen.

drop policy if exists "clients can refresh anonymized place spots" on public.public_place_spots;

-- Härtung des verbleibenden INSERT-Pfads: maps_url muss https sein, damit
-- kein javascript:/http:-Link als "Ort" eingeschleust werden kann.
-- Tabelle hat live 0 Zeilen — sofortige Validierung ist gefahrlos.
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'public_place_spots_maps_url_https'
      and conrelid = 'public.public_place_spots'::regclass
  ) then
    alter table public.public_place_spots
      add constraint public_place_spots_maps_url_https
      check (maps_url is null or maps_url ~ '^https://');
  end if;
end $$;

insert into supabase_migrations.schema_migrations (version, name)
values ('20260814100100', '0016_public_spots_lockdown')
on conflict (version) do nothing;
