-- 0017 — H2: persistente Rate-Limit-Schicht für öffentliche Schreibrouten.
-- Nach 0015 anwenden.
--
-- /api/reserve konnte unauthentifiziert pro Aufruf eine Order-Zeile anlegen
-- und zwei Mails an beliebige Adressen auslösen (Mail-Bombing im Namen der
-- Domain); /api/checkout konnte Stripe-Sessions am Fließband erzeugen. Die
-- Website drosselt jetzt zweischichtig: in-memory pro Instanz plus dieser
-- persistente Zähler, den nur service_role über die RPC erreicht.
--
-- Kein Client-Zugriff: RLS ist aktiv und es gibt bewusst KEINE Policies —
-- anon/authenticated prallen ab, service_role umgeht RLS by design.
-- Idempotent; kein Bezug zu bestehenden Daten.

create table if not exists public.api_rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        integer     not null default 0
);

alter table public.api_rate_limits enable row level security;

revoke all on table public.api_rate_limits from anon, authenticated;

-- Atomarer Fenster-Zähler: true = innerhalb des Limits. Ein Aufruf pro
-- Request; das Fenster rollt, sobald es älter als p_window_seconds ist.
create or replace function public.api_rate_hit(
  p_key text,
  p_window_seconds integer,
  p_max integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.api_rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set count = case
          when r.window_start < now() - make_interval(secs => p_window_seconds)
          then 1 else r.count + 1 end,
        window_start = case
          when r.window_start < now() - make_interval(secs => p_window_seconds)
          then now() else r.window_start end
  returning count into v_count;
  return v_count <= p_max;
end;
$$;

-- Nur der Server darf zählen. anon/authenticated haben hier nichts verloren
-- (sonst könnte ein Client fremde Fenster vollzählen und Nutzer aussperren).
revoke all on function public.api_rate_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.api_rate_hit(text, integer, integer) to service_role;

insert into supabase_migrations.schema_migrations (version, name)
values ('20260814100200', '0017_rate_limits')
on conflict (version) do nothing;
