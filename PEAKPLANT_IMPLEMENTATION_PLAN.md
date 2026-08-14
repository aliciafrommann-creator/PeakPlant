# PeakPlant — Implementation Plan

> Stand: 14.08.2026. Grundlage: vollständiges Code-Audit (Website im Repo-Root,
> App unter `mobile/`, DB unter `supabase/`, Live-Projekt `kmlqjmxkcnkfwsbptvuc`
> nur lesend) sowie `PEAKPLANT_PRODUCT_STRATEGY.md`,
> `PEAKPLANT_PRODUCT_ROADMAP.md`, `PEAKPLANT_INFORMATION_ARCHITECTURE.md`,
> `PEAKPLANT_SECURITY_PRIVACY.md`. peak-plant.com war netzwerkgesperrt; der
> Live-Auftritt wurde ausschließlich über den Code beurteilt — Vercel-Env,
> Supabase-Auth-Konsole, Edge-Secrets und Mail-DNS sind Founder-Checks.
>
> **Grundregel dieses Plans: erweitern, nicht ersetzen.** Was heute trägt
> (Repository-Pattern mit lokalem Fallback, deny-by-default-RLS-Modell,
> `memories` als Moments-Kern, `spaces` als Spaces-Kern, deterministischer
> Recommender, Edge Function `discover` als einziger Key-Ort), wird
> unverändert weiterbenutzt. Jeder Schritt ist inkrementell, hat einen
> Rollback und verbietet ausdrücklich die Rewrites, die er NICHT braucht.
>
> Positionierung bleibt HYPOTHESE (Wunsch der Gründerin) — dieser Plan
> funktioniert für alle drei Positionierungs-Kandidaten aus der Strategie.
> Labels wie im Audit: TECHNICAL REQUIREMENT / PRODUCT DECISION /
> LEGAL REVIEW REQUIRED; Feature-Labels EXISTS AND WORKS etc.

---

## Teil 1 — CURRENT CODE (Ausgangszustand, belegt)

Kompaktes Ist-Bild; Details in den drei Inventaren und den vier
Strategie-Dokumenten.

### 1.1 App (`mobile/`) — der reifste Teil

| Baustein | Zustand | Beleg |
|---|---|---|
| Spaces (couple/friends, Multi-Space, Invite `PEAK-XXXXXX`) | EXISTS AND WORKS | `mobile/lib/types.ts:42-77`, `mobile/lib/repositories/supabase.ts:195-265`, `supabase/migrations/0001_init.sql` |
| Moments/Memories (Foto+Notiz, EXIF-Strip, Biometrie-Gate, freie Momente) | EXISTS AND WORKS | `mobile/app/(tabs)/moments.tsx`, `mobile/app/memory/create.tsx`, `mobile/lib/supabase/storage.ts` |
| Editionen 01/02 (je 20 Karten, In-App-Content) | EXISTS AND WORKS | `mobile/lib/seed.ts:66-235`, `mobile/lib/content/edition01.ts`, `edition02.ts` |
| Editionen 03–12 | UI ONLY (ehrlich `upcoming`, cardCount 0) | `mobile/lib/seed.ts` |
| QR-Scan (2 Payload-Familien) | EXISTS AND WORKS; Einmal-Token nur **gerätelokal** entwertet | `mobile/lib/qr.ts:17-19`, `mobile/lib/redeemedTokens.ts`, `mobile/app/(tabs)/scan.tsx` |
| Discover/Recommender (deterministisch, erklärt) | EXISTS AND WORKS | `mobile/lib/discovery/recommend.ts` |
| AI „Ask PeakPlant" (Krisen-Gate, Minimal-Kontext) | EXISTS AND WORKS; Live-Discover per Kill-Switch AUS | `mobile/lib/ai/askGateway.ts`, `mobile/lib/ai/safety.ts`, `mobile/lib/ai/index.ts:13` |
| Map/Places (Leaflet-WebView, Live-Orte via Edge Function) | EXISTS AND WORKS / Secret-abhängig | `mobile/app/(tabs)/community.tsx`, `mobile/lib/discovery/livePlaces.ts` |
| Challenges, Saved Dates, Partner-Notes, Story, Streak | EXISTS AND WORKS | s. App-Inventar |
| Rituale, Community-Feed, Events, Push | Flags `'soon'` / NOT IMPLEMENTED | `mobile/lib/features.ts`, `mobile/lib/notifications/index.ts` (Null-Provider) |
| Monetarisierung (Paywall-Scaffold, RevenueCat-Checkliste) | UI ONLY, bewusst AUS | `mobile/lib/monetization/config.ts:15`, `mobile/app/plus.tsx` |
| Journeys, Solo-/Family-Kontext | NOT IMPLEMENTED (DB-Constraint erzwingt couple/friends) | `supabase/migrations/0001_init.sql:21` |

326 Tests grün (36 Dateien, selbst ausgeführt). Session liegt in
AsyncStorage (unverschlüsselt, SecureStore-Adapter fertig auskommentiert in
`mobile/lib/supabase/client.ts`).

### 1.2 Website (Repo-Root, Next 14)

- Locale-Middleware, Sitemap, SEO-Gerüst: EXISTS AND WORKS (`middleware.ts`,
  `app/sitemap.ts`); JSON-LD trägt noch die alte Intimacy-Positionierung
  (`app/layout.tsx:10`).
- Shop: UI ONLY (bewusster Waitlist-Modus); kompletter Stripe-Strang
  BACKEND ONLY ohne UI-Aufrufer (`app/api/checkout`, `app/api/reserve`,
  `app/api/webhook/stripe`, `app/api/admin/invoice`).
- `/[locale]/01`: EXISTS BUT INCOMPLETE — als „exklusiv" verkauft, aber
  ungegated und in der Sitemap (`app/sitemap.ts:9`); `orders.access_token`
  wird erzeugt und gemailt, nie gelesen.
- Ehrlichkeits-Schulden: Ethics-Claims vs. eigener „Grenzen"-Block
  (`app/[locale]/ethics/page.tsx:57-113`), Versanddatum Oktober vs.
  Mitte August auf derselben Shop-Seite (`app/shop/page.tsx:135` vs. `:373`),
  /members-Copy (Code-Login versprochen, Passwort gebaut), toter
  „Vier Phasen"-Code auf /intimacy, Community-Seite im Präsens.

### 1.3 Datenbank (Live: eu-central-1, Postgres 17)

- RLS deny-by-default auf allen App-Tabellen über `app_is_space_member()`
  — EXISTS AND WORKS, live bestätigt. Zwei private Buckets mit
  member-scoped Policies. `delete_account` räumt live inkl. beider Buckets
  und `auth.users`.
- **Alle App-Tabellen: 0 Zeilen. `orders`: 0 Zeilen. 2 auth.users.**
  Das Produkt ist zu ~80 % gebaut und zu 0 % validiert.
- **Drift (M1/M2):** 0014 live wirksam, aber nicht in der Migrationstabelle;
  `subscribers` hat live eine anon-INSERT-Policy entgegen dem Repo-SQL und
  abweichende Spalten; `rls_auto_enable()` existiert live ohne
  Repo-Migration; `newsletter_sends` existiert live nicht.
- **Offene Sicherheitslücken:** H1 (`public_place_spots` UPDATE
  `using(true)` für alle), H2 (`/api/reserve` unauthentifiziert ohne Limit),
  H3 (`'dev-secret'`-HMAC-Fallback), M3–M8 (Details in
  `PEAKPLANT_SECURITY_PRIVACY.md` → Open Risks).

---

## Teil 2 — TARGET ARCHITECTURE (Soll, inkrementell erreichbar)

Kein Systemwechsel. Ziel-Architektur = Ist-Architektur plus Härtung plus
gezielte Aktivierung von bereits gebautem, plus wenige additive Bausteine.

### 2.1 Schichten (Soll)

```
Physisch    Edition 01/02 gedruckt (Copy vor Druck fixiert)
              │ QR (Kartenreferenz + Einmal-Token, ab Phase 3 SERVERSEITIG entwertet)
Mobile      Expo/React Native — unverändertes Repository-Pattern
              Tabs: Home · Moments · Discover(+Map-Umschalter) · Story · Collection
              Route community → places umbenannt; grow/us entfernt
              Session: SecureStore statt AsyncStorage
Website     Next 14/Vercel — eine Erzählung, eine Community-Route
              /members → Redirect /community (zwei Login-Zustände)
              /01 gegated ODER als /edition-01 öffentlich (Phase-0-Entscheidung)
              Kauf-UI → bestehendes /api/checkout
API         Next-Routen fail-closed (kein anon-Fallback, kein dev-secret),
              persistentes Rate-Limit auf allen schreibenden Public-Routen
Edge        discover: verify_jwt (Ist) + Schema-Validierung der constraints
              + Rate-Limit + Metering-Writes in ai_usage/ai_allowance
DB          RLS-Modell unverändert; Drift eingefroren; Migrationen wieder
              einzige Quelle der Wahrheit (0015+ nur nach Drift-Repair)
Messung     DB-Views auf memories/space_members/card_activations/orders —
              KEIN Tracking-SDK (North Star: aktive Spaces)
```

### 2.2 Was ausdrücklich UNVERÄNDERT bleibt (Anti-Rewrite-Liste)

1. **Repository-Pattern** (`mobile/lib/repositories/` mit lokalem Fallback)
   — trägt Supabase- und Offline-Modus; jede neue Datenquelle wird als
   Repository angebaut, nie daran vorbei.
2. **RLS-Modell** (`app_is_space_member()`, SECURITY-DEFINER-RPCs) — neue
   Tabellen folgen der 0001-Konvention (`to authenticated`, deny-by-default).
3. **`memories` als Moments-Kern, `spaces` als Spaces-Kern** — keine neuen
   Kern-Tabellen, keine Umbenennungen im Schema; Erweiterungen additiv.
4. **Deterministischer Recommender** als Baseline und dauerhafter Fallback;
   AI ist Re-Ranker kuratierter Kandidaten, nie Ersatz.
5. **Edge Function `discover`** als einziger Ort mit Modell-/Places-Keys.
6. **Feature-Flag-Disziplin** (`'soon'`-Zustände, Kill-Switches) und
   Provenance-Labels (ai/deterministic/fallback).
7. **Experience Library als TS-Konstanten im Bundle** — Library→DB erst
   Phase 5, falls Redaktion/Website es braucht.
8. Next-14-Websitegerüst, Locale-Middleware, Stripe-Webhook-Verarbeitung
   (fail-closed, signaturgeprüft — Vorbildcode).

### 2.3 Was NICHT gebaut wird (Zielbild schließt aus)

Feed von Paar-Momenten; Beziehungs-Scores; Dating/Matching; Solo-/
Family-Kontext (Family: LEGAL REVIEW REQUIRED vor jedem Wort);
Journeys als drittes Fortschrittssystem (höchstens Editions-Dramaturgie,
Phase 3, PRODUCT DECISION); Memory-Print-Pipeline (nur dokumentieren);
eigener Chat; Web-Version der App vor Phase 5; automatisch handelnde AI;
Tagebuch-Inhalte (Fotos/Notizen) in AI-Prompts; „~14.000 Ideen" in
jeder Form.

---

## Teil 3 — MIGRATION STEPS

Gegliedert nach Roadmap-Phasen. Jede Welle ist unabhängig deploybar;
innerhalb einer Welle sind Schritte nummeriert nach Priorität.
Format je Schritt: **Betroffen** (Dateien/Tabellen/APIs/Komponenten) ·
**Abhängigkeiten** · **Security** · **Risiken** · **Tests**.

**Globale Migrationsregeln (gelten für jeden Schritt):**
- Read-before-write: vor jeder Schema-/Policy-Änderung Live-Zustand lesen
  (`pg_policies`, `pg_proc`); Migrationen idempotent schreiben.
- Erst Schritt P0.2 (Drift-Repair), dann irgendeine neue Migration.
- Jede RLS-/Policy-Änderung bekommt pgTAP-Abdeckung in
  `supabase/tests/rls_test.sql`; App-Änderungen halten die 326 Vitest-Tests
  grün und erweitern sie.
- Kein Deploy einer Welle ohne den Founder-Check der jeweils gelisteten
  Env-/Secret-Punkte (aus dem Audit nicht prüfbar).

---

### Welle P0 — Ehrlichkeit + Härtung (Phase 0; ~1–2 Wochen; kein Feature-Neubau)

#### P0.1 Website-Ehrlichkeits-Sprint (nur Text/Copy + eine Config)

**Betroffen:**
- `app/shop/page.tsx:135,184,373` — Versanddatum vereinheitlichen
  (PRODUCT DECISION der Gründerin: welches Datum; danach EINE Konstante,
  z. B. in `lib/` zentral, statt drei Strings).
- `app/[locale]/ethics/page.tsx:57-113` — „Versprechen"-Block auf
  Belegbares kürzen (Blauer Engel / DHL GoGreen / Druckerei-Nennung raus,
  solange unbelegt; „Grenzen"-Block bleibt). LEGAL REVIEW REQUIRED parallel;
  der innere Widerspruch fällt unabhängig davon. DE-Text von
  „sechs reflexionskarten" (Kondom-Ära) auf die 20-Karten-Realität.
- `app/layout.tsx:10` — JSON-LD-Description von „premium intimacy brand"
  auf die aktuelle Erzählung.
- `app/[locale]/community/page.tsx` — Präsens-Versprechen (Live Talks,
  Journal-QR, Partner-Communities) streichen oder ins Futur.
- `app/members/` — Copy „sechsstelliger code, kein passwort" an den
  gebauten Passwort-Login angleichen.
- `app/[locale]/intimacy/page.tsx:67-97` — toter „Vier Phasen"-Code:
  PRODUCT DECISION zeigen oder entfernen; Empfehlung: entfernen und das
  Intro-Eyebrow anpassen (kein Versprechen einer nicht gezeigten Struktur).
- Global: „14.000" existiert nicht im Repo — sicherstellen, dass es auch in
  keine Copy/Karten/Mails einzieht; erlaubte Formulierung: „über 1.200
  durchsuchbare Ideen, davon ~110 handkuratiert".
- `SHOP_SETUP.md` auf Code-Stand bringen (beschreibt Kondom-Abos
  `STRIPE_PRICE_SUB_*` und ein /01-Gate, das nicht existiert; Code nutzt
  `STRIPE_PRICE_PACK_3/FOUNDERS/PACK_12`, `app/api/checkout/route.ts:10-14`).

**Abhängigkeiten:** Gründerinnen-Entscheidungen (Datum, Intimacy-Phasen,
Überraschungskarte s. P0.7); Rechts-Review Ethics.
**Security:** keine.
**Risiken:** minimal (Texte); einziges Risiko ist Weiterschieben der
Entscheidungen — dann bleibt die Site widersprüchlich.
**Tests:** Build grün (`next build`); manuelle Copy-Prüfung gegen die
Inventar-Liste „unbelegte Claims"; Lighthouse/Sitemap unverändert.

#### P0.2 DB-Drift einfrieren (M1/M2) — VOR jeder neuen Migration

**Betroffen:**
- Live-Migrationstabelle: 0014 als angewandt nachtragen (0014 ist live
  wirksam, per `pg_proc.prosrc` bestätigt — nicht erneut „anwenden",
  sondern **tracken**; die Datei `supabase/migrations/0014_join_and_delete_hardening.sql`
  bleibt unverändert).
- Neue Repo-Migration `0015_drift_repair.sql` (idempotent):
  (a) `drop policy if exists allow_anon_insert on public.subscribers;`
  (b) `rls_auto_enable()` aus Prod in die Migration heben (Live-Quelltext
  lesen, verbatim übernehmen), damit Repo = Prod;
  (c) `newsletter_sends`: PRODUCT DECISION — entweder Tabelle anlegen
  (Repo-SQL existiert) oder den toten Code-Pfad in
  `app/api/newsletter/send/route.ts` entfernen; Empfehlung: anlegen, der
  Code kommentiert das Fehlen bereits.
- `supabase/subscribers.sql` / `supabase/README.md`: Ist-Zustand
  dokumentieren (Spalten `status`/`locale` fehlen live; Sprache reist in
  `source`; Unsubscribe löscht).

**Abhängigkeiten:** Supabase-Zugriff mit Schreibrecht (Operator);
read-only-Audit endet hier.
**Security:** schließt M1 (anon kann `subscribers` an API-Validierung und
Rate-Limit vorbei füllen). Danach laufen Waitlist-Inserts ausschließlich
server-side über `app/api/waitlist/route.ts` (service_role) — verifizieren,
dass keine Client-Komponente direkt inserted (laut Audit tut keine das).
**Risiken:** Wird die anon-Policy entfernt, während doch irgendwo ein
Client-Insert existiert, bricht die Waitlist → vorher Grep über
`components/` nach direktem `subscribers`-Zugriff; Rollback = Policy
wiederherstellen (eine Zeile).
**Tests:** pgTAP: anon-INSERT auf `subscribers` schlägt fehl;
Waitlist-E2E über die API-Route (lokal); Migrationslauf zweimal
hintereinander (Idempotenz).

#### P0.3 H1 fixen — `public_place_spots` UPDATE-Policy entfernen

**Betroffen:**
- Neue Migration `0016_public_spots_lockdown.sql`:
  `drop policy if exists ... update ... on public.public_place_spots;`
  (Live-Namen vorher aus `pg_policies` lesen). INSERT/SELECT-Verhalten
  bleibt unverändert (anon lesbar per Design).
- Falls die App legitime Pin-Korrekturen braucht (heute: Audit fand keinen
  UI-Pfad, der fremde Pins editieren muss): SECURITY-DEFINER-RPC
  `update_place_spot` mit Validierung (insb. `maps_url` gegen
  Allowlist-Schema `https://`), nur `authenticated`, nur eigener Pin —
  sonst schlicht keine UPDATE-Fähigkeit.
- `mobile/app/(tabs)/community.tsx` / `mobile/lib/discovery/`:
  gegenprüfen, dass kein Client-UPDATE auf `public_place_spots` existiert
  (laut Inventar: keiner — dann ist der Fix rein serverseitig und die App
  unberührt).

**Abhängigkeiten:** P0.2 (Migrations-Tracking repariert).
**Security:** schließt den kritischsten Einzelbefund (Data Poisoning,
Phishing-`maps_url`, falsche Treffpunkte) und den zweiten
Prompt-Injektionspfad in `discover` (vergiftete Ortsnamen).
**Risiken:** sehr gering (Policy-Drop auf ungenutzter Schreibfähigkeit);
Rollback = Policy wiederherstellen.
**Tests:** pgTAP: UPDATE als anon und als authenticated schlägt fehl;
App-Regressionslauf (Places-Tab lädt, Pins rendern).

#### P0.4 H3 fixen — `'dev-secret'`-Fallback entfernen (fail-closed)

**Betroffen:** `app/api/waitlist/route.ts:24`,
`app/api/unsubscribe/route.ts:5`, `app/api/newsletter/send/route.ts:20` —
Muster `process.env.NEWSLETTER_SECRET ?? 'dev-secret'` ersetzen durch:
fehlt das Secret → Route antwortet 503/500 mit ehrlicher Meldung, kein
Token wird erzeugt/geprüft. Gemeinsame Helper-Funktion in `lib/`
(z. B. `lib/serverSecrets.ts`), damit das Muster nicht wieder einreißt.
**Abhängigkeiten:** Founder-Check via `/api/health?key=ADMIN_SECRET`, ob
`NEWSLETTER_SECRET` in Vercel gesetzt ist — **vor** Deploy, sonst bricht
fail-closed den Unsubscribe-Link in bereits versendeten Mails.
**Security:** schließt fremdgesteuertes Löschen beliebiger Abonnenten
(vorhersagbare HMAC-Tokens).
**Risiken:** Bereits versendete Mails tragen Tokens des alten Secrets —
wenn das Secret schon gesetzt war, ändert sich nichts; war es NICHT
gesetzt, werden Alt-Links ungültig (akzeptabel bei 3 Subscribern,
dokumentieren).
**Tests:** Unit-Test der Token-Erzeugung/-Prüfung (Secret gesetzt/fehlt);
Route-Test: fehlendes Secret → Fehlerstatus, kein DB-Zugriff.

#### P0.5 H2 fixen — Rate-Limit für `/api/reserve` und `/api/checkout`

**Betroffen:** `app/api/reserve/route.ts`, `app/api/checkout/route.ts`;
neue Tabelle `api_rate_limits` (Migration `0017_rate_limits.sql`:
key text, window_start timestamptz, count int; RLS: keine Client-Policy,
nur service_role) ODER Vercel KV/Upstash. **Empfehlung: DB-Tabelle** —
keine neue Dependency, persistent über Cold Starts, für die erwartete Last
(Beta) mehr als ausreichend; die bestehenden In-Memory-Limits in
waitlist/questions (M5) auf denselben Helper umziehen
(z. B. `lib/rateLimit.ts`).
**Abhängigkeiten:** P0.2. PRODUCT DECISION: `/api/reserve` zusätzlich
deaktivieren, solange kein UI-Aufrufer existiert (BACKEND ONLY ohne
Nutzer) — billigste Härtung; reaktivieren erst mit Phase 1.
**Security:** schließt Mail-Bombing Dritter im Namen der Domain,
DB-Spam, Stripe-Session-Spam.
**Risiken:** Zu strenge Limits blockieren echte Käufer → Limits großzügig
(z. B. 5/h/IP für reserve) und Logging der Treffer; Rollback trivial.
**Tests:** Route-Tests (Limit greift, Fenster rollt, persistent über
Prozess-Neustart simulierbar); pgTAP: `api_rate_limits` client-unlesbar.

#### P0.6 Restliche Härtung (M7, M8, anon-Fallbacks, Kleinigkeiten)

**Betroffen:**
- Migration `0018_advisors.sql`: `revoke execute on function
  create_space, redeem_invite, delete_account from anon;`
  (SECURITY-DEFINER-RPCs prüfen `auth.uid()`, aber EXECUTE für anon ist
  unnötige Fläche). Leaked-Password-Protection in der Supabase-Konsole
  aktivieren (Founder-Schritt, wegen Website-Passwort-Login).
- `mobile/lib/supabase/client.ts`: SecureStore-Adapter aktivieren (M8;
  Adapter liegt fertig kommentiert; `expo-secure-store` gemäß
  B1-Doku — dokumentierter Operator-/Build-Schritt vor TestFlight).
  Bestehende Sessions migrieren (einmalig AsyncStorage → SecureStore
  lesen/schreiben/löschen) — betrifft heute nur 2 Test-Accounts.
- anon-Key-Fallbacks entfernen (fail-closed) in
  `app/api/waitlist/route.ts:164`, `app/api/unsubscribe/route.ts:24`,
  `app/api/newsletter/send/route.ts:114`, `app/api/questions/route.ts:50`,
  `app/api/community/count/route.ts:10` — wo die Route wirklich nur
  öffentlich Lesbares liest (questions, count), ist anon korrekt und wird
  dann **explizit** anon (Kommentar), nicht als stiller Fallback.
- `ADMIN_SECRET`-Vergleich auf `timingSafeEqual`; E-Mail-Adressen aus
  `console.error` in waitlist/reserve entfernen.

**Abhängigkeiten:** P0.2; Founder-Checks (Supabase-Konsole, EAS-Build).
**Security:** reduziert Angriffsfläche und Log-PII; M8 schützt
Session-Token auf verlorenen/gerooteten Geräten.
**Risiken:** SecureStore-Umstieg kann bestehende Sessions invalidieren
(bei 2 Test-Accounts irrelevant, aber Migrationscode trotzdem testen —
er läuft später bei echten Nutzern nie wieder anders).
**Tests:** Vitest für den Storage-Adapter (Migration alt→neu);
pgTAP/SQL-Check: anon kann RPCs nicht EXECUTEn; Route-Tests fail-closed.

#### P0.7 /01-Entscheidung + Druckvorlagen-Freigabe (vor JEDEM Druckauftrag)

**Betroffen:** PRODUCT DECISION mit zwei sauberen Ausgängen:
- **Variante A (Gate):** `app/[locale]/01/page.tsx` liest `?token=` und
  prüft gegen `orders.access_token` (server-side, service_role;
  Cookie nach Erfolg, wie in SHOP_SETUP.md §4 beschrieben aber nie gebaut);
  `/[locale]/01` aus `app/sitemap.ts:9` entfernen; `noindex`.
- **Variante B (öffentlich):** Route zu `/edition-01` umbenennen
  (Redirect von /01), Exklusivitäts-Copy aus Success-Seite
  (`app/bestellen/success`), Mails und Einlegekarten-Vorlage
  (`app/admin/card/page.tsx:82` — „your world unlocks instantly" beschreibt
  eine nicht existierende Mechanik) streichen.
- Überraschungskarten-Versprechen: Mechanik klären oder von Karte/Website
  nehmen (Gewinnspiel-Charakter: LEGAL REVIEW REQUIRED).

**Abhängigkeiten:** Gründerinnen-Entscheidung; Variante A setzt
funktionierende Mail-Zustellung voraus (Founder-Check `/api/health`).
**Security:** Variante A macht das Marketing-Versprechen („gesicherter
digitaler Zugang") erstmals wahr; Token-Vergleich timing-safe.
**Risiken:** Gedrucktes ist nicht patchbar — dieser Schritt gated den
Druck, nicht umgekehrt. Bei Variante A: Token-Verlust der Käufer →
Re-Send-Pfad im Admin vorsehen.
**Tests:** Variante A: Route-Tests (gültig/ungültig/fehlend, Cookie);
Sitemap-Snapshot ohne /01. Variante B: Redirect-Test, grep auf
Exklusivitäts-Copy.

**Gate P0 → P1:** Alle Außen-Claims belegt oder gestrichen; Druckvorlage
freigegeben; Migrationstabelle konsistent (0014 getrackt, 0015–0018
angewandt); `/api/health`-Testmail grün.

---

### Welle P1 — MVP-Aktivierung (Phase 1; Kern-Loop beweisen, ~50–100 Paare)

#### P1.1 Kauf-Strang aktivieren (UI → bestehendes Backend)

**Betroffen:**
- `app/shop/page.tsx` (+ ggf. `components/`-CTA-Komponenten): Waitlist-CTAs
  der Kauf-Karten auf `POST /api/checkout` umstellen (Route existiert,
  BACKEND ONLY); Fehler-/Ladezustände; Erfolg → `/bestellen/success`.
- `app/api/checkout/route.ts`: Env-Namen bleiben
  (`STRIPE_PRICE_PACK_3/FOUNDERS/PACK_12`) — SHOP_SETUP.md wurde in P0.1
  angepasst, nicht der Code (Ist-Zustand gilt).
- `app/api/admin/invoice` + Admin-Seiten: Label-/QTY-Maps um
  `pack_3`/`pack_12` ergänzen (stale).
- `app/api/webhook/stripe/route.ts`: unverändert (fail-closed, gut);
  `customer.subscription.deleted` bleibt bewusst unbehandelt — es gibt
  kein Abo-Produkt mehr (Doku-Altlast, in P0.1 bereinigt).
- Alternative (PRODUCT DECISION): bewusst manuell per Rechnung starten
  (`/api/admin/invoice` EXISTS AND WORKS) und Checkout-UI auf Phase 1b
  schieben — für 50–100 Beta-Paare tragfähig.

**Abhängigkeiten:** Stripe-Price-IDs + Keys in Vercel (Founder);
Mail-Zustellung verifiziert; reale Druck-/Fulfilment-Stückkosten vor
Preisfestlegung (25–50 € ist Hypothese).
**Security:** Checkout hinter Rate-Limit (P0.5); keine neuen Datenflüsse —
`orders` bleibt server-only.
**Risiken:** Webhook-Fehlkonfiguration (Secret/Endpoint) → Bestellung ohne
Order-Zeile; vor Launch ein Stripe-Testmodus-Durchstich inkl. Webhook.
**Tests:** E2E im Stripe-Testmodus (Checkout → Webhook → Order-Zeile →
Mail); Admin-Invoice-Doppelklick-Guard-Regression; Route-Tests für
Fehlerpfade.

#### P1.2 Onboarding auf die „ersten 10 Minuten" zuspitzen (App)

**Betroffen:** `mobile/app/(auth)/` (OTP → Fork Space anlegen/Code
beitreten, existiert: `invite.tsx`), `mobile/app/index.tsx` /
`(tabs)/index` Leerzustände, Demo-Karten-Pfad (`mobile/app/card/`,
`mobile/lib/qr.ts` Demo-Karte), `mobile/app/memory/create.tsx`.
Kein neues Feature: der Pfad Auth → Space → erste Karte → erster
bewahrter Moment wird geführt (Reihenfolge, CTAs, Leerzustands-Texte);
Ende ist der erste Moment, nicht ein Dashboard.
**Abhängigkeiten:** keine (alle Bausteine EXISTS AND WORKS); Migration
0014-Verhalten (Invite-Self-Heal) ist live.
**Security:** keine neuen Flächen.
**Risiken:** Scope-Creep („wenn wir schon am Onboarding sind…") —
ausdrücklich nur Führung/Copy/Reihenfolge, keine neuen Screens-Familien.
**Tests:** Vitest für Navigations-/Zustandslogik; manueller Durchstich
beider Forks (anlegen/beitreten) auf Gerät; 326 Bestandstests grün.

#### P1.3 Mess-Schicht: DB-Views statt Tracking-SDK

**Betroffen:** Neue Migration `0019_metrics_views.sql` — reine Views
(security_invoker bzw. service_role-only, KEINE Client-Policies):
- `metrics_active_spaces` (North Star: ≥2 Member, ≥1 Memory in 28 Tagen),
- `metrics_activation` (% neuer Spaces mit 2 Membern + ≥1 Moment ≤7 Tage),
- `metrics_space_retention` (W4/M3-Fenster),
- `metrics_loop_depth` (Momente/Space/Monat; Karten- vs. freie Momente via
  `free-moment`-Sentinel),
- `metrics_physical_bridge` (% Orders mit ≥1 `card_activations` ≤30 Tage —
  braucht Verknüpfung Order↔Space nur approximativ über Zeitfenster/E-Mail;
  ehrlich als Näherung labeln, nicht als Messung ausgeben — Manifest §1),
- Guardrails (Streak-Abschaltquote sobald serverseitig sichtbar, sonst
  auslassen statt schätzen; Löschquote).
Abfrage per SQL/Dashboard durch die Gründerin; kein Client-Code.
**Abhängigkeiten:** P0.2 (Migrationsdisziplin).
**Security:** Views ohne Client-Zugriff; keine neuen Datenerhebungen —
bewusst datensparsam (kein Tracking-SDK, keine Events-Tabelle in P1).
**Risiken:** Falsche Metrik-Definitionen erzeugen falsche
Phase-Gates → Definitionen 1:1 aus `PEAKPLANT_PRODUCT_STRATEGY.md`
(Product Metrics) übernehmen und im View-Kommentar dokumentieren.
**Tests:** pgTAP: Views für anon/authenticated nicht lesbar;
SQL-Fixture-Tests der Fensterlogik (Seed-Daten → erwartete Zahlen).

#### P1.4 Betroffenen-Prozesse minimal (DSGVO-Grundbetrieb)

**Betroffen:** dokumentierter (zunächst manueller) Auskunfts-/Export-Pfad:
SQL-Vorlagen je Nutzer (profiles, memories inkl. Foto-Download via
signierte URLs, eigene partner_notes, saved_dates, Preferences/Signale)
als Runbook in `supabase/README.md`; `orders`/`subscribers` in den
Löschprozess einbeziehen (Runbook, da getrennte Systeme). Der
programmatische Export (RPC/Edge, JSON+Zip) ist Phase-4/5-Arbeit —
ARCHITECTURALLY POSSIBLE, jetzt nur Prozess.
**Abhängigkeiten:** LEGAL REVIEW REQUIRED (Umfang, Fristen, geteilte
Space-Daten) — der technische Pfad wartet darauf nicht, das Runbook
existiert vorher.
**Security:** Export nur nach Identitätsprüfung (dokumentierter Schritt).
**Risiken:** keine technischen; Rechtsrisiko liegt beim Nichtstun.
**Tests:** Runbook einmal vollständig gegen einen Test-Account ausführen.

**Gate P1 → P2:** Space-Retention W4 belegt; erste zahlende Käufer;
Physisch→Digital-Brücke messbar. Ohne Retention: Vorphase reparieren,
nicht weiterbauen.

---

### Welle P2 — Community verdienen (Phase 2; nach belegter Beta-Retention)

#### P2.1 Push-Notifications als Einladung (einziges echtes neues Feature)

**Betroffen:** `mobile/lib/notifications/` (heute Null-Provider — das
Provider-Interface bleibt, es kommt ein Expo-Notifications-Provider
daneben), Opt-in-Flow in `mobile/app/settings/`, Trigger-Punkte:
„Partner hat einen Moment bewahrt" (Hook an `useMemories`/Sync),
„Weekly Challenge startet" (lokal planbar). Serverseitig: für den
Partner-Moment-Push wird ein Push-Token-Speicher nötig — neue Tabelle
`push_tokens` (Migration `0020`: user_id, token, platform; RLS: nur
eigene Zeile) + Versand via Edge Function oder Supabase-Webhook auf
`memories`-INSERT.
**Abhängigkeiten:** Phase-1-Retention belegt; Expo-Push-Credentials
(Founder); PRODUCT DECISION Frequenz-Obergrenze.
**Security:** Push-Payload trägt NIE Inhalt des Moments (nur „ein Moment
wurde bewahrt") — Lockscreen ist eine öffentliche Fläche; Token-Tabelle
RLS-eng; Abmeldung granular (Manifest §3: keine Guilt-Trips, harte
Frequenz-Obergrenze, abschaltbar).
**Risiken:** Push ist der erste serverseitig getriggerte Fluss der App —
Fehlkonfiguration nervt Nutzer genau in der sensibelsten Phase;
Guardrail-Metrik Push-Opt-out-Rate von Tag 1.
**Tests:** Vitest für Trigger-/Frequenz-Logik; pgTAP für `push_tokens`;
Gerätetest iOS/Android; Payload-Snapshot-Test (kein Inhalt im Push).

#### P2.2 Community-Doppelstruktur der Website auflösen

**Betroffen:** `app/[locale]/community/page.tsx` (zwei Zustände:
ausgeloggt = ehrlicher Ist-Stand + „anmelden"/„auf die liste";
eingeloggt = heutige /members-Inhalte), `app/members/` → Redirect auf
`/community`, `app/login/` unverändert (reine Auth-Fläche);
Waitlist-Sprache auf EIN Versprechen vereinheitlichen („auf die liste";
„Inner Circle"/„Beta" werden `source`-Tags in `subscribers`, keine
eigenen Versprechen); `WHATSAPP_COMMUNITY_URL` setzen (Founder — Mechanik
inkl. JWT-Prüfung EXISTS AND WORKS).
**Abhängigkeiten:** P0.1 (Community-Copy bereits ins Futur);
Login/Session-Verhalten der Website (Supabase Auth) unverändert.
**Security:** Die eingeloggte Hälfte liefert den WhatsApp-Link weiterhin
nur nach JWT-Verifikation (Bestand halten).
**Risiken:** Redirect-/SEO-Pflege (/members war nie in der Nav —
geringes Risiko); Rollback: Redirect entfernen.
**Tests:** Route-Tests beider Zustände; Redirect-Test /members;
grep: kein „Inner Circle"-Versprechen mehr als eigenes Produkt.

#### P2.3 Invite-Härtung (M6) — vor wachsender Nutzerbasis

**Betroffen:** Migration `0021_invite_hardening.sql` +
`supabase/migrations/0002_redeem_invite.sql`-Nachfolger:
`redeem_invite` erweitert um (a) Member-Cap für `couple`-Spaces (max. 2),
(b) optionalen Code-Ablauf/Rotation nach Beitritt (PRODUCT DECISION im
Detail: Rotation automatisch vs. manuell), (c) serverseitigen
Versuchszähler (Tabelle oder `api_rate_limits`-Wiederverwendung).
Mobile: `mobile/lib/repositories/supabase.ts` (joinByCode-Fehlerpfade),
`mobile/app/(auth)/invite.tsx` (neue Fehlermeldungen), `mobile/lib/invite.ts`
unverändert (Format bleibt PEAK-XXXXXX, DB-Check-Constraint im Lockstep).
Beitritts-Benachrichtigung an bestehende Member (setzt P2.1 voraus, sonst
In-App-Hinweis auf Home).
**Abhängigkeiten:** P0.2; P2.1 optional für Push-Benachrichtigung.
**Security:** schließt den „stillen Dritten im couple-Space"
(Threat-Model Nr. 1: voller Zugriff auf Memories, Fotos, Standorte).
**Risiken:** Cap darf legitime Fälle nicht brechen (friends-Spaces ohne
Cap bzw. höheres Cap); bestehende Spaces backfillen (heute 0 produktive
Zeilen — jetzt ist der billigste Zeitpunkt dieses Fixes).
**Tests:** pgTAP: 3. Beitritt in couple-Space schlägt fehl; abgelaufener
Code schlägt fehl; Vitest: Fehler-UI; Bestandstests grün.

#### P2.4 Inhalte statt Code (Redaktion)

**Betroffen:** Edition-02-Verkauf (Shop-Karte, Content fertig);
friends-Content-Ausbau in der Experience Library (84 couple-only-Einträge —
Redaktions-, kein Technikproblem); Brief 01 schreiben
(`LETTER_BODY['01'] = []` auf der Website) und die drei Brief-Systeme
konsolidieren (der versendete Monatsbrief IST der Brief; `/letters`
archiviert ihn unter /journal; /01-Briefblock verweist dorthin — IA-Doku
§2.4). Optional Rituale-Flag `'soon'` → aktiv, wenn Beta-Feedback trägt
(`mobile/lib/features.ts`; Screen + lokales Repo existieren).
**Abhängigkeiten:** Redaktionszeit der Gründerin (Einzelperson-Risiko —
der wahre Engpass laut Strategie).
**Security/Risiken/Tests:** Content-Reviews gegen Manifest §1
(nichts versprechen); Build grün; keine Schema-Änderungen.

**Gate P2 → P3:** Community-Signale real (Wiederkehr ohne Einladung);
deterministische Recommender-Baseline steht.

---### Welle P3 — AI + Map + physische Skalierung (Phase 3)

#### P3.1 Serverseitige Einmal-Token-Entwertung (vor Skalierung des Kartenverkaufs)

**Betroffen:** Migration `0022_card_tokens.sql`: Tabelle
`card_activation_tokens` (token_hash PK, card_id, expires_at,
redeemed_by_space, redeemed_at; RLS: keine Client-Policy) +
SECURITY-DEFINER-RPC `redeem_card_token` (atomar: prüfen, entwerten,
`card_activations` schreiben). Mobile: `mobile/lib/qr.ts` (Auflösung
bleibt pure/lokal — nur der Redeem-Schritt ruft die RPC),
`mobile/lib/redeemedTokens.ts` bleibt als Offline-Cache/Fallback
(Repository-Pattern: Supabase-Modus nutzt Server, lokaler Modus wie
bisher). Druck-Seite: Token-Generierung beim Kartendruck
(`app/admin/card/page.tsx`) muss Tokens in die Tabelle schreiben
(gehasht) statt nur zu rendern.
**Abhängigkeiten:** PRODUCT DECISION, ob Edition-01-Erstauflage schon
Einmal-Token trägt (heute versprechen die Karten keinen „Unlock" mehr —
P0.7); zwingend BEVOR „1 Karte = 1 Aktivierung" irgendwo versprochen wird.
**Security:** verhindert Token-Replay über Geräte hinweg; Tokens nur
gehasht speichern; RPC rate-limitiert (Wiederverwendung P0.5-Helper
serverseitig bzw. Zähler in der RPC).
**Risiken:** Offline-Scan (Karte ohne Netz) — UX-Entscheidung:
Aktivierung queuen und bei Sync entwerten (Konfliktfall „schon
eingelöst" ehrlich anzeigen). Bestehende gedruckte Karten ohne
Server-Tokens bleiben als Kartenreferenz-Familie gültig (zwei
Payload-Familien existieren bereits — kein Bruch).
**Tests:** pgTAP: Doppel-Redeem schlägt fehl (Race per zwei parallelen
Calls testen); Vitest: qr.ts-Bestandstests unverändert grün + neue
Redeem-Pfad-Tests; Offline-Queue-Test.

#### P3.2 AI-Zaun: Metering + Rate-Limit + Schema-Validierung (M3/M4)

**Betroffen:** `supabase/functions/discover/index.ts`:
(a) `constraints` gegen explizites Schema validieren (Feld-Whitelist,
Größenlimit — heute beliebiges Client-JSON im Prompt),
(b) Schreibseite von `ai_usage`/`ai_allowance` implementieren (Tabellen
existieren live, dormant; Monats-Budget je Space, bei Überschreitung
deterministischer Fallback statt Fehler),
(c) Request-Rate-Limit je User.
Mobile: `mobile/lib/ai/askGateway.ts` — Budget-überschritten-Antwort
behandeln (Fallback-Label existiert bereits).
**Abhängigkeiten:** Secrets gesetzt (`ANTHROPIC_API_KEY`,
`GOOGLE_PLACES_API_KEY` — Founder-Check); P0.2.
**Security:** schließt Kosten-Angriff (jede OTP-registrierte Person kann
heute unbegrenzt Anthropic-/Google-Kosten treiben) und verkleinert die
Prompt-Injection-Fläche (mit P0.3 sind dann beide Injektionspfade zu);
sobald `ai_usage` beschrieben wird: in den `delete_account`-Pfad
aufnehmen (gleiche Migration).
**Risiken:** Zu enges Budget frustriert — Fallback ist deterministisch
und vollwertig (Kern-Loop hängt nicht an AI); Edge-Function-Deploy ist
versioniert (Rollback auf v2 möglich).
**Tests:** Function-Tests (Schema-Reject, Budget-Erschöpfung → Fallback,
Metering-Zeile geschrieben); pgTAP: ai_usage bleibt client-read-only;
App-Regressionslauf Ask-Flow.

#### P3.3 `liveRecommendations`-Schalter + A/B gegen Baseline

**Betroffen:** `mobile/lib/ai/index.ts:13` (Kill-Switch),
`mobile/lib/discovery/` (Pfad Client → `discover` existiert);
A/B-Zuweisung je Space (einfacher Hash, kein Experiment-Framework);
Auswertung über die P1.3-Views erweitert (Save-/Completion-Rate AI vs.
deterministisch).
**Abhängigkeiten:** P3.2 (nie ohne Zaun); Baseline-Daten aus P1/P2.
**Security:** unverändert Minimal-Kontext (Constraints + Kandidaten-IDs/
-Titel, NIE Tagebuch-Inhalt — AI Data Boundaries sind Verfassung);
`signalsUsed`/`signalsNotUsed`-Erklärbarkeit bleibt 100 %.
**Risiken:** Schlägt AI die Baseline nicht, geht der Schalter wieder aus
(explizites Erfolgskriterium der Roadmap — einplanen, nicht als
Scheitern behandeln).
**Tests:** Bestands-AI-Tests grün; A/B-Zuweisungs-Determinismus-Test;
Label-Snapshot (ai/deterministic/fallback sichtbar).

#### P3.4 Map of Moments (privat, opt-in) — nach Datenschutz-Prüfung

**Betroffen:** Migration `0023_memory_location.sql` — additiv:
Nullable-Spalten `place_lat/lng/label` auf `memories` ODER separate
Tabelle `memory_locations` (Empfehlung: Spalten auf `memories` —
gleiche RLS, kein Join, Datenklasse identisch space-privat);
`mobile/app/memory/create.tsx` (Opt-in pro Moment, Default AUS),
`mobile/app/(tabs)/community.tsx` → in P3 zugleich Umbenennung
`community` → `places` und Einhängen als Discover-Ansichts-Umschalter
(IA-Doku §1.3; Legacy-Redirects `grow`/`us` entfernen —
`mobile/app/(tabs)/grow.tsx`, `us.tsx`, `_layout.tsx:36-91`).
**Abhängigkeiten:** LEGAL REVIEW REQUIRED **vor** dem Bau (Geodaten an
intimen Momenten = sensibelste Standortklasse); PRODUCT DECISION Opt-in-UX.
**Security:** space-privat per bestehender memories-RLS (kein neuer
Policy-Bedarf bei Spaltenlösung — der größte Vorteil); NIE öffentlicher
Momente-Layer (Zielbild §2.3); Koordinaten nie in Logs; öffentliche
Schicht bleibt ausschließlich die anonyme Spot-Bewertung.
**Risiken:** Tab-/Routen-Umbenennung bricht Deep-Links → Redirects
belassen wie bei grow/us üblich, eine Release-Notiz; Migration additiv
und nullable = kein Backfill-Risiko.
**Tests:** pgTAP: memories-RLS unverändert dicht (mit neuen Spalten);
Vitest: Opt-in-Default AUS; Map rendert nur Space-eigene Momente;
Navigations-Regressionstests.

**Gate P3 → P4:** M3-Retention über Schwelle; AI schlägt Baseline oder
ist wieder aus.

---

### Welle P4 — Monetarisierung (Phase 4; nach bewiesener M3-Retention)

#### P4.1 PeakPlant+ aktivieren

**Betroffen:** `mobile/lib/monetization/config.ts:15`
(`MONETIZATION_ENABLED`), `mobile/app/plus.tsx` (existiert),
RevenueCat-Installation nach Repo-Checkliste; Verdrahtung
`entitlements` (Tabelle live, server-only-Writes — Webhook
RevenueCat → Supabase Edge Function → entitlements); Paywall-Grenze als
PRODUCT DECISION **mit Nutzungsdaten**, harte Regel: Kern-Loop
(Karte, Moment, Tagebuch) bleibt vollwertig gratis.
**Abhängigkeiten:** M3-Retention; App-Store-Review; Store-Compliance
(Restore, Kündigungs-Flows).
**Security:** Entitlement-Writes nur server-side (Ist-RLS trägt das
bereits); keine Zahlungsdaten in eigener DB.
**Risiken:** Guardrail: sinkt der North Star (aktive Spaces) nach
Paywall-Einführung, ist die Grenze falsch gezogen → Rollback-Schalter
ist derselbe Kill-Switch.
**Tests:** Sandbox-Käufe beider Stores; pgTAP entitlements;
Feature-Gate-Tests (Free-Pfad bleibt vollständig).

#### P4.2 Programmatischer Datenexport (Art. 20)

**Betroffen:** Edge Function `export_account` (RPC-gestützt): eigene
profiles-Zeile, Memories + Fotos (signierte URLs/Zip), eigene
partner_notes, saved_dates, Preferences/Signale — JSON + Medien;
ersetzt das P1.4-Runbook. Umfang geteilter Space-Daten gemäß
Rechts-Review.
**Abhängigkeiten:** LEGAL REVIEW (Format/Umfang) aus P1.4 abgeschlossen.
**Security:** Export nur für den authentifizierten Nutzer (verify_jwt);
Rate-Limit; Export-Link kurzlebig signiert.
**Risiken:** große Foto-Bestände → asynchron (Job + Mail-Link).
**Tests:** Function-Tests (Umfang exakt = RLS-Sichtbarkeit des Nutzers,
nie mehr); Lasttest mit vollem Album.

---

### Welle P5 — Skalierung (nur Stichworte; erst nach funktionierendem Geschäftsmodell)

Editionen 03+ (Engpass Redaktion), Geschenk-Mechanik, Host Pro/Events
falls P2/P3 sie bewiesen haben, Experience Library → Supabase-Tabelle
falls gebraucht (Repository-Pattern nimmt das ohne App-Umbau auf),
ggf. Web-App und weitere Lokalisierung. Kein Detail-Plan hier —
er würde auf unbewiesenen Annahmen stehen.

---

## Teil 4 — Querschnitt

### 4.1 Migrations-Sequenz (Soll-Nummerierung, alle idempotent)

| Nr. | Inhalt | Welle |
|---|---|---|
| (0014) | live wirksam — nur Tracking nachtragen | P0.2 |
| 0015 | Drift-Repair (subscribers-Policy, rls_auto_enable, newsletter_sends) | P0.2 |
| 0016 | public_place_spots Lockdown (H1) | P0.3 |
| 0017 | api_rate_limits (H2/M5) | P0.5 |
| 0018 | Advisors (anon-EXECUTE revoke) | P0.6 |
| 0019 | Metrics-Views | P1.3 |
| 0020 | push_tokens | P2.1 |
| 0021 | Invite-Härtung (M6) | P2.3 |
| 0022 | card_activation_tokens + redeem-RPC | P3.1 |
| 0023 | memory_locations (opt-in Geodaten) | P3.4 |

Regel: keine Migration überspringt eine niedrigere Nummer; jede bringt
pgTAP-Abdeckung mit; Security-Advisors nach jedem Anwenden gegenprüfen.

### 4.2 Test-Grundgerüst je Änderungstyp

- **RLS/Policy:** pgTAP in `supabase/tests/rls_test.sql` (positiv +
  negativ je Rolle anon/authenticated/member/non-member).
- **App-Logik:** Vitest (`mobile/`, heute 326 grün — Regressionspflicht);
  pure Funktionen (qr, invite, streaks, safety) bleiben exhaustiv getestet.
- **API-Routen:** Route-Tests für fail-closed-Pfade (fehlendes Secret,
  fehlender service_role-Key, Limit erreicht).
- **E2E-Durchstiche:** Stripe-Testmodus (P1.1), Onboarding auf Gerät
  (P1.2), Push auf Gerät (P2.1) — GUI läuft headless nicht
  (dokumentierte Grenze des Skills `run-peakplant-mobile`).

### 4.3 Founder-/Operator-Checks (aus dieser Umgebung nicht prüfbar)

Vercel-Env (`NEWSLETTER_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`,
Stripe-Keys/Price-IDs, `WHATSAPP_COMMUNITY_URL`) via
`/api/health?key=ADMIN_SECRET`; Supabase-Edge-Secrets
(`ANTHROPIC_API_KEY`, `GOOGLE_PLACES_API_KEY`); Supabase-Auth-Konsole
(OTP-Template `{{ .Token }}`, Raten, Leaked-Password-Protection);
Mail-DNS (SPF/DKIM/DMARC); AASA/assetlinks auf peak-plant.com für
Universal-Links `/c/`, `/i/`; EAS-Build mit SecureStore (B1).

### 4.4 Offene PRODUCT DECISIONS (blockieren jeweils genau einen Schritt)

Versanddatum (P0.1) · Intimacy-Phasen zeigen/entfernen (P0.1) ·
/01 Gate vs. öffentlich (P0.7) · Überraschungskarte (P0.7, LEGAL) ·
Checkout-UI vs. manuelle Rechnung (P1.1) · Invite-Rotation im Detail
(P2.3) · Einmal-Token auf Erstauflage (P3.1) · Opt-in-UX Geodaten
(P3.4) · Paywall-Grenze (P4.1). Positionierung bleibt bewusst offen —
kein Schritt dieses Plans erzwingt einen der drei Kandidaten.
