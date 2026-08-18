-- 0024 — Ein Space für eine Person („solo").
--
-- WARUM: Bis heute kannte `spaces.type` genau zwei Werte, und beide meinen
-- mehr als einen Menschen. In der Produktionsdatenbank hat aber KEIN einziger
-- Space eine zweite Person. Wer die App allein benutzt, sitzt damit in einem
-- Raum, dessen Typ etwas behauptet, das nicht stimmt — und bekommt Inhalte,
-- die „ihr beide" voraussetzen (MANIFESTO §1).
--
-- ENTSCHEIDUNG (Alicia hat „voll solo" als eigenen Punkt gesetzt, 18.08.2026):
-- `solo` wird ein echter dritter Typ, den man beim Anlegen wählt — nicht etwas,
-- das die App aus der Mitgliederzahl errät. Der Unterschied ist wichtig: Ein
-- Paar-Space, in dem die zweite Person noch nicht beigetreten ist, SOLL
-- Paar-Inhalte zeigen; diese Person wartet, sie ist nicht allein unterwegs.
-- Aus der Mitgliederzahl geraten hieße, ihr die Inhalte in dem Moment
-- wegzuziehen, in dem sie jemanden einlädt.
--
-- Ein Solo-Space ist kein Käfig: `open_space()` macht ihn zu einem Paar- oder
-- Freundes-Space, ohne dass ein einziger Moment verloren geht. Der Weg geht
-- bewusst nur in diese Richtung — zurück würde eine bereits beigetretene
-- Person aussperren (MANIFESTO §3: einladen, nie verlieren).
--
-- Read-before-write: `spaces` hat den CHECK aus 0001, `create_space` aus 0008,
-- `redeem_invite` aus 0018, die UPDATE-Policy aus 0012. Alle vier werden hier
-- angefasst; nichts wird gelöscht.

-- ── 1) Der Typ darf jetzt drei Werte haben ───────────────────────────────────
alter table public.spaces drop constraint if exists spaces_type_check;
alter table public.spaces
  add constraint spaces_type_check check (type in ('couple', 'friends', 'solo'));

-- ── 2) Anlegen: solo erlaubt, mit eigenem Vorgabenamen ───────────────────────
create or replace function public.create_space(
  p_type text,
  p_name text,
  p_owner_name text,
  p_invite_code text
)
returns public.spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  created_space public.spaces;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if p_type not in ('couple', 'friends', 'solo') then
    raise exception 'invalid space type' using errcode = '22023';
  end if;

  -- Der Code entsteht auch für einen Solo-Space. Beitreten kann damit niemand
  -- (siehe redeem_invite unten) — aber wenn der Space später geöffnet wird,
  -- ist er sofort teilbar, ohne zweite Migration und ohne Sonderweg.
  if p_invite_code is null
     or p_invite_code !~ '^PEAK-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$' then
    raise exception 'invalid invite code format' using errcode = '22023';
  end if;

  insert into public.profiles (id, name)
  values (uid, coalesce(trim(p_owner_name), ''))
  on conflict (id) do nothing;

  insert into public.spaces (type, name, invite_code)
  values (
    p_type,
    coalesce(
      nullif(trim(p_name), ''),
      case p_type when 'couple' then 'Our space'
                  when 'solo'   then 'My space'
                  else 'Friends' end
    ),
    p_invite_code
  )
  returning * into created_space;

  insert into public.space_members (space_id, user_id, name, role)
  values (
    created_space.id,
    uid,
    coalesce(nullif(trim(p_owner_name), ''), (select name from public.profiles where id = uid), ''),
    'owner'
  );

  return created_space;
end;
$$;

-- ── 3) Beitreten: in einen Solo-Space kommt niemand ──────────────────────────
-- Ohne diese Zeile wäre „solo" nur ein Etikett: Ein weitergegebener Code würde
-- eine fremde Person in ein Tagebuch lassen, das ausdrücklich für eine Person
-- angelegt wurde (MANIFESTO §2). Bestehende Mitglieder — also die eine Person
-- selbst — dürfen weiter, sonst sperrt der eigene Code den eigenen Space.
create or replace function public.redeem_invite(code text)
returns public.spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  s public.spaces;
  already_member boolean;
  member_count integer;
  new_code text;
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if not public.api_rate_hit('redeem_invite:' || uid::text, 3600, 10) then
    raise exception 'too many attempts';
  end if;

  select * into s from public.spaces where invite_code = code for update;
  if not found then
    raise exception 'invalid invite code';
  end if;

  select exists (
    select 1 from public.space_members where space_id = s.id and user_id = uid
  ) into already_member;

  select count(*) into member_count
  from public.space_members where space_id = s.id;

  if not already_member and s.type = 'solo' then
    raise exception 'space is solo';
  end if;

  if not already_member and s.type = 'couple' and member_count >= 2 then
    raise exception 'space is full';
  end if;

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

-- ── 4) Öffnen: solo → couple | friends, ohne Verlust ─────────────────────────
create or replace function public.open_space(p_space_id uuid, p_type text)
returns public.spaces
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  s public.spaces;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if p_type not in ('couple', 'friends') then
    raise exception 'invalid space type' using errcode = '22023';
  end if;

  select * into s from public.spaces where id = p_space_id for update;
  if not found then
    raise exception 'space not found';
  end if;

  if not exists (
    select 1 from public.space_members
    where space_id = s.id and user_id = uid and role = 'owner'
  ) then
    raise exception 'not the owner' using errcode = '42501';
  end if;

  -- Nur aus solo heraus. Ein Paar-Space „zurück auf solo" zu setzen, würde die
  -- zweite Person aus einem gemeinsamen Tagebuch aussperren.
  if s.type <> 'solo' then
    raise exception 'space is already shared' using errcode = '22023';
  end if;

  update public.spaces set type = p_type where id = s.id
  returning * into s;

  return s;
end;
$$;

revoke all on function public.open_space(uuid, text) from public;
revoke all on function public.open_space(uuid, text) from anon;
grant execute on function public.open_space(uuid, text) to authenticated, service_role;

-- ── 5) `type` und `invite_code` gehören nicht dem Client ─────────────────────
-- Die UPDATE-Policy aus 0012 („Mitglieder dürfen ihren Space ändern") war für
-- Name, Emoji und Avatar gedacht — sie erlaubt aber JEDE Spalte. Damit könnte
-- ein Client den Typ selbst umschreiben und die Regeln aus 3) und 4) umgehen.
-- Spaltenrechte sind hier das schärfere und einfachere Mittel als eine zweite
-- Policy: die vier gemeinten Spalten bleiben schreibbar, die zwei
-- sicherheitsrelevanten nur noch über die Funktionen oben. Der Client schreibt
-- heute genau `name`, `emoji`, `avatar_path`, `collectible_emoji`
-- (lib/repositories/supabase.ts) — nachgesehen, nicht angenommen.
revoke update on public.spaces from authenticated;
-- `anon` ebenso: Heute adressiert keine Policy die Rolle, also folgenlos —
-- aber „type und invite_code gehören nicht dem Client" halb umzusetzen wäre
-- eine Aussage, die der Code nicht hält.
revoke update on public.spaces from anon;
grant update (name, emoji, avatar_path, collectible_emoji) on public.spaces to authenticated;

-- ACHTUNG FÜR SPÄTERE MIGRATIONEN: Ein Spaltengrant deckt keine KÜNFTIGEN
-- Spalten ab. Wer `spaces` eine vom Client beschreibbare Spalte gibt, muss den
-- Grant hier nachziehen — sonst scheitert das Schreiben stumm mit 403.
