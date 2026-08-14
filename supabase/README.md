# Supabase (backend foundation)

This folder is the **backend foundation**: schema and deny-by-default RLS that
mirror the app's local-first domain. It is **not live yet** — the app still runs
fully on local storage. Going live is a human step (a real Supabase project +
credentials), tracked as O-001/O-002 in the Decision Register.

## What's here

- `migrations/0001_init.sql` — tables (`profiles`, `spaces`, `space_members`,
  `memories`, `card_activations`, `challenge_enrollments`), the
  `app_is_space_member()` security-definer helper, and space-scoped RLS on every
  personal table. No permissive default — access flows only through membership.
- `migrations/0002`–`0011` — forward migrations (invites, account/storage,
  discovery, planning, entitlements, atomic space create, public place feedback,
  partner notes).
- `migrations/0012_space_identity.sql` — **shared space identity**: adds
  `spaces.emoji` and `spaces.avatar_path`, a member-scoped **UPDATE** policy on
  `spaces` (previously missing — renames/emoji were silently denied by RLS), and
  a private member-scoped **`space-avatars`** storage bucket (separate from the
  private `memory-photos` bucket). See "Applying 0012" below.
- `migrations/0013_space_collectible.sql` — adds `spaces.collectible_emoji`
  (the mark a couple earns per completed challenge), shared across members. Reuses
  the UPDATE policy from 0012, so it is just one additive column. `supabase db push`.

> **Status:** `0012` and `0013` have been **applied to the production project**
> (`kmlqjmxkcnkfwsbptvuc`) and verified (columns + `spaces: members update`
> policy + `space-avatars` bucket with 4 member policies). Security advisors
> reported no new findings from these migrations.

## Applying 0012 (manual)

Run from the repo root once, against the linked project:

```
supabase db push   # applies 0012_space_identity.sql
```

This migration is **purely additive** and does not touch `orders`,
`subscribers`, `community_questions`, or `newsletter_sends`. It:

1. adds two nullable columns to `spaces` (`emoji`, `avatar_path`),
2. creates the `spaces: members update` RLS policy (members can rename / set
   emoji / set avatar of their own space),
3. creates the `space-avatars` bucket (`public = false`) + member read/insert/
   update/delete policies on `storage.objects`.

No bucket needs to be created by hand in the dashboard — the migration creates
it. Until 0012 is applied, the app falls back to **local-only** emoji (no
avatar); after it, emoji + avatar are shared across both members.

## Going live (human steps)

1. Create an **EU** Supabase project (Frankfurt/EU-Central). Record region.
2. `supabase link` this repo to the project.
3. `supabase db push` to apply `migrations/0001_init.sql`.
4. Put `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` into
   `mobile/.env` (see `mobile/.env.example`). The anon key is public; the
   **service-role key is never shipped in the app**.
5. Enable email OTP / magic-link auth (see `mobile/docs/BACKEND.md`).
6. Wire `lib/repositories/supabase.ts` to real queries and switch the hooks over
   (the next build increment — small and reviewed).

## Rules carried from the build-ops doc

- Applied migrations are **immutable**; fixes are new forward migrations.
- Local/CI rebuild from zero via migrations + seed.
- RLS gets allow **and** deny tests (pgTAP) before any real data — a backend-
  phase task, listed in `mobile/docs/TESTING.md`.

### 0014 — join & delete hardening (2026-08-12)

- `redeem_invite` heilt eine fehlende `profiles`-Zeile jetzt selbst (gleicher
  Ansatz wie `create_space`) — vorher scheiterte ein korrekter Beitritt mit der
  falschen Meldung „Code falsch", wenn `ensureProfile` nach dem OTP-Login
  fehlgeschlagen war (Audit A2-2.1).
- `delete_account` räumt jetzt BEIDE privaten Buckets (`memory-photos` UND
  `space-avatars`) — Avatar-Fotos überlebten vorher die endgültige
  Konto-Löschung (Audit A2-6.2).
- Anwenden: SQL-Editor → Datei-Inhalt einfügen → Run. Idempotent (CREATE OR
  REPLACE), mehrfach ausführen schadet nicht. Danach unter „Advisors" kurz auf
  neue Security-Hinweise schauen.
- **Status:** live wirksam seit 12.08. (per SQL-Editor angewandt), aber nie in
  `supabase_migrations.schema_migrations` getrackt — 0015 trägt das nach.

### 0015–0019 — P0-Härtung + Messung (2026-08-14, Freigabe „APPROVED: P0")

> **Status:** 0015–0019 sind am 14.08. per SQL-Editor **angewandt und live
> verifiziert** (Policies weg, RPC + Views da, redeem_invite gehärtet,
> Tracking konsistent bis 0019). Offen ist nur noch **0020** (unten).

Alle per SQL-Editor anwenden, **in dieser Reihenfolge**, jede idempotent.
Danach „Advisors" (Security) prüfen. Kein Touch von `orders`/`subscribers`/
`community_questions`/`newsletter_subscribers` über das Entfernen einer
fremden anon-Policy und rein lesende Views hinaus; kein Datenverlust möglich.

| Datei | Schließt | Inhalt |
|---|---|---|
| `0015_drift_repair.sql` | M1, M2 | anon-INSERT-Policy auf `subscribers` weg (Waitlist schreibt server-seitig mit service_role); `rls_auto_enable` verbatim ins Repo; Tracking von 0014/0015 nachgetragen. **Zuerst anwenden.** |
| `0016_public_spots_lockdown.sql` | H1 | UPDATE-Policy auf `public_place_spots` weg (jeder konnte jeden Pin inkl. `maps_url` umschreiben); https-Check-Constraint auf `maps_url`. |
| `0017_rate_limits.sql` | H2 | `api_rate_limits`-Tabelle + `api_rate_hit()`-RPC (nur service_role) — persistente Drossel für /api/reserve, /api/checkout, /api/waitlist, /api/questions. |
| `0018_invite_hardening_and_advisors.sql` | M6, M7 | `redeem_invite`: 10 Versuche/h/Nutzer, couple-Cap (genau 2), Code-Rotation sobald voll; EXECUTE für anon auf den drei RPCs entzogen. Braucht 0017. |
| `0019_metrics_views.sql` | — | Sechs `pp_metrics_*`-Views (Aktivierung, Wochen-Kohorten mit W4, North Star „aktive Spaces", Momente/Monat, Aktivierungen/Monat, Verkäufe/Monat). Nur SQL-Editor/service_role lesbar; Brücke physisch→digital bewusst nur als Trendvergleich (Orders sind nicht mit Spaces verknüpft — keine Scheinpräzision). |
| `0020_advisor_followups.sql` | M7 | Nacharbeit nach dem Advisors-Lauf vom 14.08.: `rls_auto_enable` als RPC dicht, `app_is_space_member` ohne anon-EXECUTE (⚠️ `authenticated` MUSS dort bleiben — RLS-Policies werten die Funktion mit den Rechten des anfragenden Nutzers aus, ein Revoke sperrt die ganze App aus). Nach 0018 anwenden. |

**Dashboard-Schritte dazu (einmalig, nicht per SQL machbar):**
1. ~~Leaked password protection aktivieren~~ — **am 14.08. versucht, geht
   nicht:** das Feature ist bei Supabase Pro-Plan-und-höher vorbehalten,
   PeakPlant läuft auf Free. Bewusste Entscheidung: offen lassen und beim
   Upgrade auf Pro nachholen (Advisor M7 bleibt bis dahin teiloffen).
   Ersatz auf Free: Authentication → Sign In / Providers → Email →
   **Minimum password length auf 10** setzen.
2. Nach dem Anwenden: Advisors → Security einmal durchsehen.

**App-Build-Schritt (M8):** `expo-secure-store` ist jetzt in
`mobile/package.json` und `mobile/lib/supabase/client.ts` verdrahtet
(Session verschlüsselt statt AsyncStorage, mit Einmal-Migration alter
Sessions). Vor TestFlight: `cd mobile && npm install`, dann EAS-Build —
ohne neuen nativen Build fällt der Adapter mit Warnung auf AsyncStorage
zurück.

---

## Runbook: Auskunft, Export und Löschung (DSGVO-Grundbetrieb, P1.4)

Manuell und dokumentiert — bewusst kein Selbstbedienungs-Export im Code
(das wäre Phase 4/5). Wichtig ist, dass der Weg existiert und reproduzierbar
ist, bevor echte Nutzerdaten da sind.

**Schritt 0 — Identität prüfen (nicht überspringen).** Anfragen nur von der
E-Mail-Adresse beantworten, die im Konto hinterlegt ist. Bei Zweifeln über die
App verifizieren lassen (Login), nie „auf Zuruf". Antwortfrist: ein Monat.

**Schritt 1 — Nutzer-ID finden.**
```sql
select id, email, created_at from auth.users where email = 'person@example.com';
```

**Schritt 2 — Auskunft/Export (App-Daten).** `:uid` durch die ID ersetzen.
```sql
-- Profil
select * from public.profiles where id = ':uid';
-- Mitgliedschaften und Spaces
select s.* from public.spaces s
  join public.space_members m on m.space_id = s.id where m.user_id = ':uid';
-- Momente, die diese Person angelegt hat (Fotos: photo_path, s. Schritt 3)
select * from public.memories where created_by = ':uid';
-- Notizen an die Partnerin/den Partner
select * from public.partner_notes where author_id = ':uid';
-- geplante/gespeicherte Dates, Präferenzen, Signale, Challenges
select * from public.saved_dates      where space_id in (select space_id from public.space_members where user_id = ':uid');
select * from public.date_preferences where space_id in (select space_id from public.space_members where user_id = ':uid');
select * from public.personalization_signals where space_id in (select space_id from public.space_members where user_id = ':uid');
select * from public.challenge_enrollments   where space_id in (select space_id from public.space_members where user_id = ':uid');
```
Ergebnisse als CSV/JSON exportieren (SQL-Editor → „Export").

**Schritt 3 — Fotos.** `memories.photo_path` zeigt in den privaten Bucket
`memory-photos`. Im Dashboard unter Storage die Pfade herunterladen und dem
Export beilegen. Nie öffentliche Links erzeugen — die Dateien bleiben privat.

**Geteilte Daten, ehrlich benennen:** Momente in einem Space gehören beiden
Mitgliedern. Beim Export wird mitgeliefert, was diese Person angelegt hat;
beim Löschen bleiben gemeinsame Momente der anderen Person erhalten, sofern
sie nicht selbst löscht. Das gehört so in die Antwort geschrieben (Umfang
und Formulierung: LEGAL REVIEW REQUIRED).

**Schritt 4 — Löschung (App).** Der saubere Weg ist die App selbst:
Profil → Konto löschen. Die `delete_account()`-RPC räumt Daten, beide privaten
Buckets und den `auth.users`-Eintrag (0004 + 0014). Nur wenn die Person keinen
Zugang mehr hat, ersatzweise im Dashboard unter Authentication den Nutzer
löschen und die Buckets prüfen.

**Schritt 5 — Website-Daten (getrennte Systeme, nicht vergessen).**
```sql
-- Newsletter/Waitlist: Abmeldung löscht die Zeile bereits, hier zur Kontrolle
select * from public.subscribers where email = 'person@example.com';
delete from public.subscribers where email = 'person@example.com';
-- Bestellungen: NICHT löschen, solange handels-/steuerrechtliche
-- Aufbewahrungsfristen laufen (LEGAL REVIEW REQUIRED). Auskunft ja, Löschung
-- erst nach Ablauf; danach:
select * from public.orders where email = 'person@example.com';
```

**Schritt 6 — dokumentieren.** Datum, Anfrage, was herausgegeben/gelöscht
wurde, kurz festhalten (eigene Notiz genügt, kein System nötig).

> Einmal vollständig gegen einen Test-Account durchspielen, bevor die ersten
> echten Nutzer da sind — das ist der Test dieses Runbooks.
