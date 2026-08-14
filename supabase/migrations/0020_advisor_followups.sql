-- 0020 — Advisor-Nacharbeit nach 0015–0019 (Security-Lints 0028/0029).
-- Nach 0018 anwenden. Idempotent.
--
-- Die Advisors flaggen jede via PostgREST erreichbare SECURITY-DEFINER-
-- Funktion. Einordnung (14.08.2026):
--   * create_space / redeem_invite / delete_account für `authenticated`:
--     GEWOLLT — das ist die API der App; die Funktionen prüfen auth.uid().
--   * rls_auto_enable: reine Event-Trigger-Funktion. Ein direkter Aufruf
--     scheitert zwar ohnehin („event trigger functions can only be called
--     as event triggers"), aber EXECUTE für Clients ist unnötige Fläche.
--   * app_is_space_member: wird INNERHALB der RLS-Policies ausgewertet und
--     läuft dabei mit den Rechten des anfragenden Nutzers.
--
-- ⚠️  NIEMALS `authenticated` auf app_is_space_member revoken: RLS-Policies
--     brauchen EXECUTE für die abfragende Rolle — ohne sie schlägt JEDE
--     Space-Abfrage der App mit „permission denied" fehl. Nur anon fliegt
--     (anon hat keine Policy, die die Funktion referenziert).

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

revoke execute on function public.app_is_space_member(uuid) from public, anon;
grant execute on function public.app_is_space_member(uuid) to authenticated, service_role;

insert into supabase_migrations.schema_migrations (version, name)
values ('20260814100500', '0020_advisor_followups')
on conflict (version) do nothing;
