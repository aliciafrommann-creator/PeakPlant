-- 0018 — M6 (Invite-Härtung) + M7 (Advisor-Punkte). Nach 0017 anwenden
-- (redeem_invite nutzt api_rate_hit aus 0017).
--
-- M6, Ausgangslage: redeem_invite kannte weder ein Mitglieder-Limit noch ein
-- Versuchslimit, und ein einmal geteilter Code blieb ewig gültig. Ein
-- geleakter Code machte damit einen stillen Dritten im couple-Space möglich —
-- mit vollem Lesezugriff auf das gemeinsame Tagebuch.
--
-- Neu (Signatur und Rückgabetyp unverändert, App-kompatibel):
--   1. Versuchslimit: max. 10 Einlöseversuche pro Nutzer pro Stunde
--      (serverseitig, über api_rate_hit — Clients können es nicht umgehen).
--   2. couple-Cap: ein couple-Space hält genau zwei Menschen; ein dritter
--      Beitrittsversuch scheitert mit 'space is full'.
--   3. Code-Rotation: sobald der couple-Space voll ist, wird der Invite-Code
--      neu gewürfelt — der alte Code ist tot, sobald er seinen Job getan hat.
--      (Format wie App/0008: PEAK- + 6 Zeichen ohne I/O/0/1.)
--   Beitritts-Benachrichtigung (Push) ist bewusst NICHT hier — Push existiert
--   nicht und ist außerhalb von P0.
--
-- M7 (Security-Advisors): EXECUTE für anon auf den SECURITY-DEFINER-RPCs
-- entziehen. Die Funktionen prüfen auth.uid() selbst, aber anon-EXECUTE ist
-- unnötige Angriffsfläche. (Zweiter Advisor-Punkt — Leaked-Password-
-- Protection aktivieren — ist ein Dashboard-Schritt: Authentication →
-- Settings → Passwords, siehe supabase/README.)
--
-- Idempotent. Rollback: Funktion aus 0002 wiederherstellen.

create or replace function public.redeem_invite(code text)
returns public.spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.spaces;
  uid uuid := auth.uid();
  member_count integer;
  already_member boolean;
  new_code text;
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- M6.1: Versuchslimit pro Nutzer (10/Stunde). Bremst das Durchprobieren
  -- von Codes serverseitig, wo es kein Client umgehen kann.
  if not public.api_rate_hit('redeem_invite:' || uid::text, 3600, 10) then
    raise exception 'too many attempts';
  end if;

  -- FOR UPDATE: zwei gleichzeitige Beitritte dürfen das couple-Cap nicht
  -- durch ein Race unterlaufen.
  select * into s from public.spaces where invite_code = code for update;
  if not found then
    raise exception 'invalid invite code';
  end if;

  select exists (
    select 1 from public.space_members where space_id = s.id and user_id = uid
  ) into already_member;

  select count(*) into member_count
  from public.space_members where space_id = s.id;

  -- M6.2: couple heißt zwei. (Wiederbeitritt eines bestehenden Mitglieds
  -- bleibt erlaubt — der Insert unten ist dann ein No-op.)
  if not already_member and s.type = 'couple' and member_count >= 2 then
    raise exception 'space is full';
  end if;

  -- Self-heal: the profile row can be missing if ensureProfile failed after
  -- OTP sign-in. Without it the FK below fails and the user is stuck.
  insert into public.profiles (id, name)
  values (uid, '')
  on conflict (id) do nothing;

  insert into public.space_members (space_id, user_id, name, role)
  values (
    s.id,
    uid,
    coalesce((select name from public.profiles where id = uid), ''),
    'member'
  )
  on conflict (space_id, user_id) do nothing;

  -- M6.3: Code-Rotation, sobald der couple-Space voll ist.
  if s.type = 'couple' then
    select count(*) into member_count
    from public.space_members where space_id = s.id;
    if member_count >= 2 then
      loop
        new_code := 'PEAK-';
        for i in 1..6 loop
          new_code := new_code || substr(alphabet, 1 + floor(random() * 32)::integer, 1);
        end loop;
        exit when not exists (select 1 from public.spaces where invite_code = new_code);
      end loop;
      update public.spaces set invite_code = new_code where id = s.id;
      s.invite_code := new_code;
    end if;
  end if;

  return s;
end;
$$;

-- M7: anon braucht keinen EXECUTE auf den RPCs — alle drei setzen einen
-- eingeloggten Nutzer voraus.
revoke execute on function public.redeem_invite(text) from public, anon;
grant execute on function public.redeem_invite(text) to authenticated, service_role;

revoke execute on function public.create_space(text, text, text, text) from public, anon;
grant execute on function public.create_space(text, text, text, text) to authenticated, service_role;

revoke execute on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated, service_role;

insert into supabase_migrations.schema_migrations (version, name)
values ('20260814100300', '0018_invite_hardening_and_advisors')
on conflict (version) do nothing;
