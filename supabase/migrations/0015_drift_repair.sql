-- 0015 — Drift-Repair (Audit-Befunde M1 + M2). VOR 0016–0019 anwenden.
--
-- Live-Stand am 14.08.2026 (read-only verifiziert):
--   * `supabase_migrations.schema_migrations` endet bei 0013 — 0014 ist live
--     WIRKSAM (per pg_get_functiondef verifiziert), aber nicht getrackt.
--   * `public.subscribers` hat eine anon-INSERT-Policy (`allow_anon_insert`),
--     die es NICHT im Repo gibt: jeder Client konnte an der API-Validierung
--     und am Rate-Limit vorbei Zeilen einfügen (M1). Die Website schreibt
--     ausschließlich server-seitig über /api/waitlist mit service_role.
--   * `public.rls_auto_enable()` + Event-Trigger `ensure_rls` existieren live,
--     aber in keiner Repo-Migration (M2) — hier verbatim übernommen.
--   * `newsletter_sends` existiert weder live noch wird sie vom Code
--     beschrieben (der tote Schreibpfad wurde am 13.08. entfernt) —
--     Entscheidung: Tabelle wird NICHT angelegt.
--
-- Idempotent; mehrfach ausführen schadet nicht. Kein Datenverlust möglich:
-- es werden nur eine Policy entfernt (deren einziger Nutzer ein Angreifer
-- wäre), eine Funktion identisch nachgezogen und Tracking-Zeilen ergänzt.
-- Rollback der Policy (falls je nötig, eine Zeile):
--   create policy allow_anon_insert on public.subscribers
--     for insert to anon with check (true);

-- (a) M1: anon-INSERT auf subscribers schließen. Waitlist-Inserts laufen
--     ausschließlich über /api/waitlist (service_role, validiert, limitiert).
drop policy if exists allow_anon_insert on public.subscribers;

-- (b) M2: rls_auto_enable verbatim aus Prod (pg_get_functiondef, 14.08.2026),
--     damit Repo = Prod. Inhaltlich unverändert.
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

do $$ begin
  if not exists (select 1 from pg_event_trigger where evtname = 'ensure_rls') then
    create event trigger ensure_rls
      on ddl_command_end
      when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      execute function public.rls_auto_enable();
  end if;
end $$;

-- (c) M2: Migrations-Tracking reparieren. 0014 ist live wirksam, wurde aber
--     per SQL-Editor angewandt und nie getrackt — nachtragen, NICHT erneut
--     ausführen. Diese und die folgenden Editor-Migrationen tracken sich
--     selbst, damit der Drift nicht wieder entsteht.
insert into supabase_migrations.schema_migrations (version, name)
values
  ('20260703000000', '0014_join_and_delete_hardening'),
  ('20260814100000', '0015_drift_repair')
on conflict (version) do nothing;
