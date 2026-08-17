-- 0021 — Push-Token-Speicher (P2.1). Nach 0020 anwenden.
--
-- Für „ein Moment wurde bewahrt" und „dein Mensch ist beigetreten" muss der
-- Server das Gerät des ANDEREN Menschen erreichen — dafür braucht es einen
-- Token pro Gerät. Mehr nicht: kein Name, kein Space, kein Inhalt.
--
-- Datenschutz (MANIFESTO §2): Die Zeile gehört dem Konto, dem sie gehört, und
-- niemandem sonst — auch nicht dem Partner im selben Space. Wer welches Gerät
-- benutzt, ist nichts, das ein anderer Mensch aus der Datenbank lesen können
-- soll. Der Versand läuft ausschließlich server-seitig (service_role umgeht
-- RLS by design), die App liest ihre Token nie zurück.
--
-- Idempotent, additiv, rührt keine bestehende Tabelle an.

create table if not exists public.push_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  token       text not null,
  platform    text not null check (platform in ('ios', 'android')),
  created_at  timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (token)
);

create index if not exists push_tokens_user_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

-- Nur die eigene Zeile, und auch die nur schreibend/löschend. Es gibt bewusst
-- KEINE Policy, die fremde Token sichtbar macht.
do $$ begin
  if not exists (select 1 from pg_policies where tablename='push_tokens' and policyname='push_tokens: own rows') then
    create policy "push_tokens: own rows" on public.push_tokens
      for all to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

-- Konto-Löschung: die Zeilen hängen per ON DELETE CASCADE an auth.users und
-- verschwinden mit dem Konto. delete_account() braucht dafür keine Änderung.

-- Zustellprotokoll — die Grundlage der Frequenz-Obergrenze aus
-- mobile/lib/notifications/policy.ts (höchstens eine Nachricht pro Space und
-- Tag). Bewusst OHNE Inhalt: nur Kategorie und Zeitpunkt, damit auch dieses
-- Protokoll nichts über das Paar verrät.
create table if not exists public.push_deliveries (
  id          uuid primary key default gen_random_uuid(),
  space_id    uuid not null references public.spaces(id) on delete cascade,
  category    text not null,
  delivered_at timestamptz not null default now()
);

create index if not exists push_deliveries_space_day_idx
  on public.push_deliveries (space_id, delivered_at desc);

alter table public.push_deliveries enable row level security;
revoke all on table public.push_deliveries from anon, authenticated;

insert into supabase_migrations.schema_migrations (version, name)
values ('20260817120000', '0021_push_tokens')
on conflict (version) do nothing;
