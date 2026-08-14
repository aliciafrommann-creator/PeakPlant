# PeakPlant — Security & Privacy

> Stand: 13.08.2026. Grundlage: Repo `/home/user/PeakPlant` (Website im Root,
> App unter `mobile/`, DB unter `supabase/`), Live-Projekt
> `kmlqjmxkcnkfwsbptvuc` (nur lesend geprüft) und die Repo-Doku (MANIFESTO.md,
> BRAND.md, AGENTS.md, README, SHOP_SETUP.md).
>
> **Grenzen dieses Dokuments:** peak-plant.com ist aus der Audit-Umgebung
> netzwerkgesperrt — Live-Verhalten der Website wurde ausschließlich über den
> Code beurteilt. Vercel-Env-Variablen, Supabase-Auth-Konfiguration (OTP-Raten,
> Mail-Templates), Edge-Function-Secrets und Mail-DNS (SPF/DKIM/DMARC) waren
> nicht einsehbar. Dieses Dokument beschreibt den **Ist-Zustand und die
> Soll-Leitplanken** — es ist **keine Compliance-Bescheinigung** und keine
> Rechtsberatung. Punkte sind durchgehend markiert als
> **TECHNICAL REQUIREMENT** (muss technisch gebaut/geändert werden),
> **PRODUCT DECISION** (Gründerin muss entscheiden) oder
> **LEGAL REVIEW REQUIRED** (juristisch prüfen lassen).
> Feature-Zustände nutzen die Audit-Labels (EXISTS AND WORKS, EXISTS BUT
> INCOMPLETE, UI ONLY, MOCK DATA, BACKEND ONLY, NOT IMPLEMENTED,
> ARCHITECTURALLY POSSIBLE, REQUIRES MAJOR REWORK).

---

## Security Principles

1. **Deny by default.** Jede Tabelle hat RLS; ohne explizite Policy gibt es
   keinen Zugriff. Ist-Zustand: eingehalten im Kern
   (`supabase/migrations/0001_init.sql`, live bestätigt) — **EXISTS AND
   WORKS**, mit dokumentierten Ausnahmen (siehe Open Risks H1/M1).
2. **Least Privilege für Schlüssel.** Die Mobile-App hält ausschließlich den
   anon/publishable Key (`mobile/lib/supabase/client.ts`,
   `mobile/.env.example`); `service_role` existiert nur in Server-Routen der
   Website; `ANTHROPIC_API_KEY` / `GOOGLE_PLACES_API_KEY` nur als
   Edge-Function-Secrets. Verstoß gegen das Prinzip: mehrere API-Routen fallen
   bei fehlendem service_role-Key **still auf den anon-Key zurück**
   (`?? NEXT_PUBLIC_SUPABASE_ANON_KEY` in `app/api/waitlist/route.ts:164`,
   `app/api/unsubscribe/route.ts:24`, `app/api/newsletter/send/route.ts:114`,
   `app/api/questions/route.ts:50`, `app/api/community/count/route.ts:10`).
   Soll: **fail-closed** statt Fallback. TECHNICAL REQUIREMENT.
3. **Fail closed, nie fail open.** Positiv umgesetzt: Stripe-Webhook prüft die
   Signatur und bricht bei Fehlern ab; Order-Insert ist fail-closed
   (`app/api/webhook/stripe`). Negativ: `'dev-secret'`-Fallback für das
   Unsubscribe-HMAC (`app/api/waitlist/route.ts:24`,
   `app/api/unsubscribe/route.ts:5`, `app/api/newsletter/send/route.ts:20`)
   ist fail-open. TECHNICAL REQUIREMENT (Open Risks H3).
4. **Server entscheidet, Client behauptet nur.** Sicherheitsrelevante Regeln
   (Mitgliedschaft, Entitlements-Writes, Kontolöschung) laufen über RLS bzw.
   SECURITY-DEFINER-RPCs, nicht über Client-Logik. Bekannte Lücke:
   QR-Einmal-Token werden bislang nur **gerätelokal** entwertet
   (`mobile/lib/redeemedTokens.ts`, dokumentiert in `mobile/lib/qr.ts:17-19`)
   — serverseitige Entwertung ist Post-Beta-Schritt. TECHNICAL REQUIREMENT
   vor breitem Rollout.
5. **Migrationen sind die Quelle der Wahrheit.** Prinzip aktuell verletzt:
   Prod-Drift bei `subscribers`, 0014 per SQL-Editor angewandt aber nicht in
   der Migrationstabelle, `rls_auto_enable()` live ohne Repo-Migration (Open
   Risks M2). Drift einfrieren, bevor weitere Migrationen kommen. TECHNICAL
   REQUIREMENT.
6. **Ehrlichkeit vor Eindruck.** Sicherheits- und Privacy-Aussagen in App,
   Website und Mails dürfen nur behaupten, was der Code hält (Beispiel-Verstoß:
   der als „gesicherter digitaler Zugang" verkaufte /01-Bereich ist ungegated
   und in der Sitemap — Website-Inventar). PRODUCT DECISION + TECHNICAL
   REQUIREMENT.

## Privacy Principles

1. **Datenminimierung.** Es wird nur erhoben, was ein konkretes Feature jetzt
   braucht. Gute Ist-Beispiele: Profil enthält nur einen Namen; die anonyme
   Fragen-Wand und das Orts-Feedback speichern keine Identität; eigene Orte in
   der App bleiben bewusst lokal und ohne Koordinaten
   (`mobile/lib/customPlaces.ts:1-7`); Roh-Konversationstext wird weder
   gespeichert noch ans Modell gesendet (`mobile/lib/ai/askGateway.ts`,
   Header-Kontrakt).
2. **Privacy by default.** Intime Inhalte (Memories, Fotos, Partner-Notes,
   geplante Dates) sind standardmäßig PRIVATE bzw. space-privat; nichts davon
   ist öffentlich sichtbar oder auffindbar. Öffentliche Flächen sind explizit
   und anonym (siehe Private-Shared-Public Model).
3. **Kein Dauertracking.** Es gibt keinen Background-Location-Zugriff, keine
   Bewegungsprofile, kein Ad-Tracking im Code. Standort wird nur
   zweckgebunden pro Aktion verwendet (siehe Location Architecture) und muss
   widerruflich bleiben (OS-Permission + In-App-Verzicht). PRODUCT DECISION:
   dies als bindende Produktregel festschreiben.
4. **Zweckbindung für AI.** Das Modell erhält Minimal-Kontext (strukturierte
   Constraints + kuratierte Kandidaten-IDs/-Titel), nie Rohnotizen, nie Fotos,
   nie exakte Nutzerkoordinaten als Profil (siehe AI Data Boundaries).
5. **EU-Residency wo steuerbar.** Supabase-Projekt in eu-central-1 (live
   bestätigt). Ausnahmen: Google Places (US) für Live-Orte, Anthropic (US) für
   Ranking — siehe Third-Party Services; LEGAL REVIEW REQUIRED.
6. **Löschbarkeit ist gebaut, Portabilität nicht.** `delete_account` löscht
   live inklusive beider Storage-Buckets und `auth.users` (EXISTS AND WORKS);
   ein Daten-Export ist NOT IMPLEMENTED (siehe Data Export).

## Data Classification

| Klasse | Inhalt | Tabellen / Orte | Sensitivität | Beleg |
|---|---|---|---|---|
| **PRIVAT (eigene Person)** | Profilname; Auth-Identität (E-Mail); Session | `profiles` (nur eigene Zeile lesbar), Supabase Auth | mittel | `supabase/migrations/0001_init.sql` |
| **SPACE-GETEILT (intim)** | Memories inkl. Fotos, Partner-Notes (Liebesbotschaften), geplante Dates mit **lat/lng, Adresse, Datum**, Vorlieben, Verhaltenssignale, Feedback | `memories` (+ Bucket `memory-photos`), `partner_notes`, `saved_dates`, `date_preferences`, `personalization_signals`, `date_feedback`, `spaces`, `space_members`, `card_activations`, `challenge_enrollments` | **hoch** — intime Beziehungsdaten + Standort + „wann sind wir wo" | 0001, 0005, 0006, 0010, 0011 |
| **SPACE-GETEILT (abrechnungsnah)** | Entitlements, AI-Budget/-Nutzung | `entitlements`, `ai_allowance`, `ai_usage` (SELECT für Member, Writes server-only; Schreibseite dormant) | niedrig | 0007 |
| **ÖFFENTLICH (anonym)** | Orts-Pins, anonyme 1–5-Bewertungen + Tipps (Freitext 280), anonyme Fragen-Wand | `public_place_spots`, `public_place_feedback`, `community_questions` | niedrig als Schema, **Freitext kann PII enthalten** | 0009, 0010, `supabase/community_questions.sql` |
| **SERVER-ONLY** | Bestellungen mit **Postadressen**, Stripe-Referenzen, `access_token`; Newsletter-/Waitlist-Adressen | `orders`, `subscribers`, `newsletter_subscribers`, `newsletter_sends` (RLS ohne Client-Policy, nur service_role) | hoch (PII + Zahlungsbezug) | `supabase/orders.sql`, `supabase/subscribers.sql` |
| **GERÄTELOKAL** | Session-Token (derzeit AsyncStorage — Open Risks M8), lokale Foto-Kopien, eingelöste QR-Token, eigene Orte | AsyncStorage / Dateisystem des Geräts | mittel–hoch (Session) | `mobile/lib/supabase/client.ts`, `mobile/lib/photoStorage.ts`, `mobile/lib/redeemedTokens.ts`, `mobile/lib/customPlaces.ts` |

## Data Flow

**Mobile-App (Hauptfluss):**
App (anon key + User-JWT) → Supabase PostgREST (RLS) → Postgres (eu-central-1).
Fotos: App re-encodiert (EXIF/GPS-Strip) → privater Bucket
`memory-photos/<spaceId>/…` → Lesen nur über signierte URLs (TTL 1h)
(`mobile/lib/supabase/storage.ts`).

**AI-Fluss:** App → Edge Function `discover` (verify_jwt=true, deployed v2)
→ Anthropic (Ranking, tool_choice erzwungen) bzw. → Google Places (Live-Orte).
Client hält nie einen Modell-/Places-Key. Details unter AI Data Flow.

**Website:** Browser → Next.js-API-Routen (Vercel) → Supabase (service_role
für `orders`/`subscribers`; anon für öffentliche Lesezugriffe) → Brevo/Mail
für Transaktions- und Newsletter-Mails; Stripe für Checkout/Webhook/Invoice.

**Grundsatz:** Es gibt keinen Fluss, der intime Space-Daten (Memories, Notes,
saved_dates) an Dritte gibt — Ausnahme Standortkoordinaten an Google Places
für die Live-Suche (zweckgebunden, siehe Location Architecture).

## Authentication

- **App:** Supabase Auth per E-Mail-OTP; Registrierung ist offen (jede
  Mail-Adresse kann ein Konto anlegen). Kein Passwort in der App.
- **Website `/login`:** E-Mail+Passwort gegen Supabase Auth inkl.
  signup/confirm/reset (`app/login/page.tsx`) — EXISTS AND WORKS laut
  Website-Inventar; Redirect-URL-Konfiguration ist Operator-Schritt.
- **Session-Speicherung Mobile:** derzeit **AsyncStorage, unverschlüsselt** —
  dokumentiertes TODO inkl. fertigem SecureStore-Adapter in
  `mobile/lib/supabase/client.ts`. Vor echtem Beta-Betrieb auf
  SecureStore/Keychain umstellen. TECHNICAL REQUIREMENT (Open Risks M8).
- **Leaked-Password-Protection** ist im Projekt deaktiviert (Advisor-WARN);
  bei reinem OTP-Login gering relevant, mit Website-Passwort-Login aber
  aktivieren. TECHNICAL REQUIREMENT (klein).
- **Admin-Zugänge Website:** `ADMIN_SECRET`-Query-Vergleich per `===` (nicht
  timing-safe; praktisch vernachlässigbar, trotzdem `timingSafeEqual`
  verwenden). Newsletter-Versand über `NEWSLETTER_SECRET`/`CRON_SECRET` —
  aktuell mit `'dev-secret'`-Fallback (Open Risks H3).
- **OTP-/Auth-Raten und Mail-Templates** liegen in der Supabase-Konsole und
  waren nicht prüfbar — Founder-Check nötig.

## Authorization

- **Kernmechanik:** Space-Mitgliedschaft über `app_is_space_member()`
  (SECURITY DEFINER), von allen space-Policies genutzt; nur `authenticated`
  (0001-Konvention). Deny-by-default trägt — live per pg_policies bestätigt.
  **EXISTS AND WORKS.**
- **Rollen:** `space_members.role`; Space-Update-Policy seit 0012. Es gibt
  keine Admin-/Moderationsrolle in der App (siehe Abuse & Moderation).
- **Server-only-Writes:** `entitlements`, `ai_allowance`, `ai_usage` sind für
  Member nur lesbar; `orders`/`subscribers` haben gar keine Client-Policy.
- **RPCs:** `create_space`, `redeem_invite`, `delete_account` sind SECURITY
  DEFINER und prüfen `auth.uid()`; sie sind aber für `anon` EXECUTE-bar
  (Advisor-WARN) — EXECUTE für `anon` revoken. TECHNICAL REQUIREMENT
  (Open Risks M7).
- **Bekannte Autorisierungslücken:**
  - `public_place_spots` UPDATE `using(true) with check(true)` für
    anon+authenticated (`supabase/migrations/0010_…sql:41-45`, live
    bestätigt) — jede Person kann jeden öffentlichen Pin umschreiben.
    **Kritischster Einzelbefund** (Open Risks H1). TECHNICAL REQUIREMENT.
  - `redeem_invite` prüft weder Ablauf noch Mitgliederzahl noch Space-Typ
    (Open Risks M6). TECHNICAL REQUIREMENT + PRODUCT DECISION.
  - Einige 0005er-Policies gelten für Rolle `{public}` statt
    `to authenticated` — faktisch dicht, aber inkonsistent; angleichen.
  - Jedes Space-Mitglied darf Memories des anderen editieren/löschen —
    Design, aber bei Trennungsszenarien relevant. PRODUCT DECISION.

## Database Security

- **RLS überall aktiv**, deny-by-default-Kern verifiziert (EXISTS AND WORKS).
  pgTAP-RLS-Tests existieren (`supabase/tests/rls_test.sql`), wurden im Audit
  nicht gegen Prod ausgeführt (read-only-Auftrag) — regelmäßig laufen lassen.
  TECHNICAL REQUIREMENT (Prozess).
- **Migrations-Disziplin gebrochen (M2):** Live-Migrationstabelle hat 13
  Einträge mit gemischten Namen; **0014 ist live wirksam** (per
  `pg_proc.prosrc` bestätigt: redeem_invite-Self-Heal + delete_account räumt
  beide Buckets), steht aber **nicht** in der Migrationstabelle;
  `newsletter_sends` existiert live nicht; `rls_auto_enable()` existiert live
  ohne Repo-Migration. Hinweis Widerspruch Doku↔Prod: `supabase/README.md`
  und das App-Inventar beschreiben 0014 als ausstehend — der geprüfte
  Ist-Zustand (Funktionsquelltext live) gilt: **angewandt, aber untracked.**
  Drift einfrieren und Migrationstabelle reparieren, bevor irgendeine weitere
  Migration kommt. TECHNICAL REQUIREMENT.
- **Prod-Drift `subscribers` (M1):** live existiert `allow_anon_insert`
  (check true) entgegen `supabase/subscribers.sql` („kein anon-Zugriff");
  Spalten `status`/`locale` fehlen live. Jede Person mit anon-Key kann die
  Liste an API-Validierung und Rate-Limit vorbei füllen. Policy entfernen,
  Inserts nur noch server-side. TECHNICAL REQUIREMENT.
- **Secrets-Hygiene:** service_role nur server-side; anon-Fallbacks
  entfernen (Security Principles Nr. 2); `'dev-secret'`-Fallback entfernen
  (H3). E-Mail-Adressen tauchen in Fehler-Logs auf
  (waitlist/reserve `console.error`) — Logging minimieren. TECHNICAL
  REQUIREMENT (klein).

## Private-Shared-Public Model

Explizite Sichtbarkeitsstufen. **Regel: intime Inhalte sind default
PRIVATE**; jede öffentlichere Stufe ist ein expliziter, benannter Schritt.

| Stufe | Bedeutung | Ist-Zustand |
|---|---|---|
| **private** | nur die eigene Person / das eigene Gerät | `profiles` (eigene Zeile), lokale Foto-Kopien, eigene Orte, Session |
| **space** | genau die Mitglieder eines Space (couple/friends) | Memories, Fotos, partner_notes, saved_dates, Preferences, Signale, Challenges — RLS-erzwungen, EXISTS AND WORKS |
| **friends** | über den zweiten Space-Typ `friends` abgebildet; keine separate Sichtbarkeitsschicht | vorhanden als Space-Typ; keine feinere Abstufung — ARCHITECTURALLY POSSIBLE |
| **event** | zeitlich begrenzte geteilte Kontexte (z. B. Community-Events) | NOT IMPLEMENTED — nur Konzept; bei Bau: eigene Tabellen + eigene RLS, kein Aufweichen der space-Policies |
| **community** | angemeldete Nutzer untereinander (nicht-anonym) | NOT IMPLEMENTED — es gibt bewusst keine öffentlichen Profile/Handles |
| **public** | anonym, für alle (auch ohne Login) lesbar | Orts-Pins, Orts-Feedback, Fragen-Wand — anon lesbar per Design |

Leitplanke für alles Neue: eine Sichtbarkeitsstufe wird nie implizit
erweitert; jeder Wechsel von space → friends/event/community/public ist eine
eigene Nutzeraktion mit klarem UI-Hinweis. PRODUCT DECISION (als Regel
festschreiben), TECHNICAL REQUIREMENT (bei jedem neuen Feature per RLS
erzwingen, nie nur per UI).

## Location Architecture

- **Grundsatz:** Standort ist **zweckgebunden und widerruflich** — pro
  Suchvorgang bzw. pro gespeichertem Date, nie als Dauertracking. Es gibt
  keinen Background-Location-Code in der App.
- **Gespeicherte Standorte:** `saved_dates` enthält `place_lat/lng`, Adresse,
  `planned_for`, `planning_notes` (0005/0006/0010) — das ist die sensibelste
  Standortdatenklasse („wo sind wir wann"), space-privat per RLS.
- **Live-Orte:** Pilotstädte + Radius (`mobile/lib/discovery/livePlaces.ts`);
  die Suche geht Client → Edge Function `discover` → Google Places
  (`mobile/lib/discovery/providers/supabasePlaces.ts`; Key nur serverseitig).
  Dabei verlassen **Nutzerkoordinaten die EU** Richtung Google (US) —
  LEGAL REVIEW REQUIRED (AVV, Drittlandtransfer, Datenschutzerklärung).
- **Eigene Orte:** bewusst lokal, listen-only, ohne Koordinaten/Pins
  (`mobile/lib/customPlaces.ts:1-7`) — gutes Minimierungs-Beispiel.
- **Fotos:** GPS-EXIF wird beim Upload entfernt (Re-Encoding,
  `mobile/lib/supabase/storage.ts`) — EXISTS AND WORKS.
- **Risiken:** Invite-Code-Kompromittierung legt künftige Aufenthaltsorte
  eines Paares offen (M6); die offene Pin-UPDATE-Policy erlaubt es, fremde
  Paare an attacker-gewählte Orte zu lenken (H1). Beides vor Launch fixen.
  TECHNICAL REQUIREMENT.
- **Soll-Regeln:** (a) Koordinaten nie in Logs; (b) Genauigkeit reduzieren,
  wo grob reicht (Live-Suche braucht keine Meter-Präzision) — TECHNICAL
  REQUIREMENT (klein); (c) Lösch-/Widerrufspfad: saved_dates sind einzeln
  löschbar, `delete_account` räumt alles.

## AI Data Flow

Es gibt genau **einen aktiven AI-Pfad**: die Edge Function `discover`
(deployed, v2, verify_jwt=true). Der direkte Anthropic-Client in der App ist
ein bewusst nicht verdrahteter Stub (`mobile/lib/ai/anthropic.ts` — „NOT
wired in the MVP"; Fallback `nullAI`).

**Feature 1 — „Ask PeakPlant" / AI-Ranking kuratierter Date-Ideen**
(`mobile/lib/ai/askGateway.ts` → `discover` → Anthropic):
- **INPUT:** strukturierte `DateConstraints` (Budget, Energie, Zeit u. ä.)
  plus pro Kandidat nur `momentId`, `title`, `concept` aus dem kuratierten
  Pool (max. 6). Explizit **nicht**: Rohtext der Nutzereingabe, Notizen,
  Fotos, Namen, Koordinaten.
- **WHY:** Reihenfolge + kurze „why"-Begründung personalisieren; Fakten
  (Preise, Orte, Öffnungszeiten) bleiben clientseitig kuratiert und werden
  nach dem Ranking re-attached.
- **WHERE:** Edge Function (Supabase, EU) ruft Anthropic (US) — LEGAL REVIEW
  REQUIRED (Drittland, AVV).
- **STORAGE:** keine Speicherung von Prompt/Antwort in eigenen Tabellen;
  `ai_usage`/`ai_allowance` existieren, werden aber **nicht beschrieben**
  (Metering-Schreibseite NOT IMPLEMENTED — Open Risks M3).
- **ACCESS:** nur authentifizierte Nutzer (verify_jwt); Ergebnis nur an den
  anfragenden Client; Source-Label immer sichtbar („personalized by PeakPlant
  AI · facts stay curated" vs. „curated").
- **RETENTION:** eigene Seite: keine; Anbieterseite (Anthropic-Log-Retention)
  vertraglich klären — LEGAL REVIEW REQUIRED.
- **DELETION:** nichts zu löschen auf eigener Seite, solange nichts
  gespeichert wird; sobald Metering aktiviert wird, muss `ai_usage` in den
  `delete_account`-Pfad. TECHNICAL REQUIREMENT (bei Aktivierung).

**Feature 2 — Live-Orte-Ranking (`rank_live_places` in
`supabase/functions/discover/index.ts`):**
- **INPUT:** Google-Places-Kandidaten (Name, Kategorie) + Constraints;
  Suchkoordinaten gehen an Google, nicht an Anthropic.
- **WHY:** Auswahl/Begründung der Orts-Treffer.
- **WHERE/STORAGE/ACCESS/RETENTION/DELETION:** wie Feature 1.
- **Besonderes Risiko:** community-editierbare Ortsnamen fließen in den
  Prompt — mit H1 (jeder kann Pins umschreiben) ein Injektionspfad. H1 fixen
  entschärft dies. TECHNICAL REQUIREMENT.

**Vorgelagerte deterministische Sicherung:** Crisis-Gate
(`mobile/lib/ai/safety.ts`) läuft **vor** jedem AI-/spielerischen Output,
rein lokal und offline-fähig (EN+DE-Muster für self_harm/abuse/coercion);
bei Treffer werden spielerische/AI-Ausgaben unterdrückt und Hilfsressourcen
gezeigt. Es diagnostiziert nicht, speichert nichts, kontaktiert niemanden.
**EXISTS AND WORKS** (getestet, `safety.test.ts`).

## AI Data Boundaries

Bindende Grenzen (heute im Code verankert, künftig nicht aufweichen):

1. **Nie ans Modell:** Rohnotizen/Memories, Fotos, Partner-Notes, Namen,
   E-Mail-Adressen, exakte gespeicherte Standorte, Space-Historie.
   (Kontrakt im Header von `askGateway.ts` und `anthropic.ts`.)
2. **Nie vom Modell:** erfundene Fakten in die UI. Erzwungen durch
   tool_choice, Filterung der Picks gegen Kandidaten-IDs (ID-Whitelist) und
   Kappung der „why"-Texte auf 240 Zeichen — der Schaden einer Injection ist
   architektonisch auf Text im „why"-Feld begrenzt.
3. **Kein Profil aus Konversation:** Roh-Chattext wird nicht als
   Personalisierungs-Signal gespeichert; Signale sind strukturiert
   (`personalization_signals`, space-privat).
4. **Client hält keine Modell-Keys.** ANTHROPIC_API_KEY nur als
   Edge-Function-Secret (ob gesetzt: hier nicht prüfbar — Founder-Check).
5. **Offene Verstöße gegen die Grenzen:** `body.constraints` geht als
   beliebiges, ungefiltertes Client-JSON unbegrenzter Größe in den Prompt
   (M4) — Felder whitelisten und Größe begrenzen. Kein Rate-Limit/Metering
   auf `discover` (M3). Beides TECHNICAL REQUIREMENT.
6. **Transparenz:** Quelle jeder Empfehlung wird immer gelabelt (ai /
   deterministic / fallback) — beibehalten; relevant auch für den AI Act
   (Transparenzpflichten), siehe AI Act Considerations.

## Image & File Security

- **Private Buckets:** `memory-photos` und `space-avatars`, beide
  `public=false`, member-scoped Policies auf `storage.objects`, Pfadschema
  `<spaceId>/…` — live bestätigt. **EXISTS AND WORKS.**
- **Upload-Pipeline:** Fotos werden re-encodiert (EXIF/GPS-Strip) und
  verkleinert (`mobile/lib/supabase/storage.ts`). **EXISTS AND WORKS.**
- **Reads:** ausschließlich signierte URLs mit TTL 1h. Restrisiko: eine
  weitergeleitete signierte URL ist bis zu 1h für Dritte offen — TTL ggf.
  senken; PRODUCT DECISION (Komfort vs. Fenster).
- **Löschung:** `delete_account` räumt live beide Buckets (0014-Funktionsstand
  live verifiziert). Sensible Editionen zusätzlich hinter Biometrie-Gate +
  App-Switcher-Verdeckung (`app/(tabs)/moments.tsx`).
- **Offen:** kein serverseitiger Malware-/Typen-Scan der Uploads (durch
  Re-Encoding weitgehend entschärft); keine Inhaltsmoderation für Fotos
  (space-privat — vertretbar, siehe Abuse & Moderation).

## Third-Party Services

| Dienst | Zweck | Daten | Region | Status |
|---|---|---|---|---|
| Supabase | DB, Auth, Storage, Edge Functions | alle App-Daten | eu-central-1 | AVV/SCC prüfen — LEGAL REVIEW REQUIRED |
| Anthropic | AI-Ranking (`discover`) | Constraints + Kandidaten-Titel, keine PII by design | US | Drittlandtransfer, Log-Retention — LEGAL REVIEW REQUIRED |
| Google Places | Live-Orte | **Suchkoordinaten**, Kategorien | US | Drittlandtransfer — LEGAL REVIEW REQUIRED |
| Stripe | Checkout, Webhook, Invoice | Zahlungs-/Kontaktdaten | — | Webhook signaturgeprüft (gut); AVV — LEGAL REVIEW REQUIRED |
| Brevo (+ ggf. Resend) | Transaktions-/Newsletter-Mails | E-Mail-Adressen | — | SPF/DKIM/DMARC hier nicht prüfbar — Founder-Check; AVV — LEGAL REVIEW REQUIRED |
| Vercel | Website-Hosting, Logs | Request-Daten; E-Mails in Error-Logs (minimieren) | — | Env-Vars nicht prüfbar; AVV — LEGAL REVIEW REQUIRED |
| Open-Meteo | Wetterkontext Discover | grobe Koordinaten | — | keine Accounts/PII; kurz prüfen |
| Leaflet/OSM-Tiles (WebView) | Karte | Tile-Requests (IP, Kartenausschnitt) | — | Tile-Provider und dessen Policy benennen — LEGAL REVIEW REQUIRED (klein) |

Grundsatz: pro Dienst gilt Minimal-Payload (siehe AI Data Boundaries /
Location Architecture); neue Dienste nur mit dokumentierter Zweckbindung.

## Abuse & Moderation

Ist-Zustand: **Es gibt keinerlei Moderations-Tooling** — kein Melden, kein
Blockieren, keine Admin-Sicht, keine Wortfilter für öffentliche Flächen.

- **Öffentliche Freitexte** (Fragen-Wand 3–200 Zeichen, Orts-Tipps 280
  Zeichen) sind unmoderiert öffentlich lesbar; anon-INSERT bei
  `public_place_feedback` ohne Limit. Vor nennenswertem Traffic: Melde-Flag +
  einfacher Review-Pfad (auch nur per SQL/Interntool) + Limits. TECHNICAL
  REQUIREMENT (minimal) + PRODUCT DECISION (Moderationsrichtlinie).
- **Orts-Pins:** aktuell von jedem umschreibbar (H1) — das ist zugleich das
  größte Missbrauchsszenario (Phishing-`maps_url`, falsche Treffpunkte).
- **Intime Space-Inhalte:** bewusst unmoderiert (privat) — vertretbar;
  Missbrauch innerhalb eines Space (z. B. nach Trennung) wird über
  Leave/Löschen adressiert; „Mitglied entfernen"/Space-Sperre existiert nicht.
  PRODUCT DECISION.
- **Fake-Accounts:** Registrierung offen per Mail-OTP; kein Proof-of-Human.
  Solange es keine öffentlichen Profile gibt, ist die Fläche klein — bei
  jedem Community-Ausbau neu bewerten. PRODUCT DECISION.
- **Impersonation:** keine öffentlichen Handles/Profile (Fläche klein);
  `partner_notes.author_name` ist freier Client-Text, `author_id` aber
  erzwungen — Anzeige perspektivisch aus `profiles` ableiten. TECHNICAL
  REQUIREMENT (klein).

## Threat Model

Fokus auf die Community-/Beziehungs-Spezifika (Belege im Daten/Security-
Inventar, hier konsolidiert):

1. **Stalking / Standort-Exposition (höchstes Schadenspotenzial):**
   `saved_dates` = „wo + wann". Angriffswege: kompromittierter Invite-Code
   (M6 — Codes verfallen nie, kein Member-Cap, kein Beitritts-Hinweis auf
   DB-Ebene: stiller Beitritt einer dritten Person in einen couple-Space mit
   vollem Zugriff auf Memories, Fotos, Standorte, Notes); Session-Diebstahl
   via unverschlüsseltem AsyncStorage (M8). Zusätzlich H1: Angreifer kann
   fremde Paare per manipuliertem Pin an gewählte Orte lenken.
2. **Belästigung / Data Poisoning öffentlicher Flächen:** H1
   (Pins umschreibbar inkl. `maps_url` → Phishing), unmoderierte Freitexte,
   anon-INSERT ohne Limit.
3. **Intime Inhalte:** Kernschutz solide (RLS, private Buckets, signierte
   URLs, EXIF-Strip, Biometrie-Gate). Restrisiken: 1h-Fenster geteilter
   signierter URLs; geteilte Memories überleben die Account-Löschung des
   Autors (nur Autorschaft detached) — dokumentieren/kommunizieren, PRODUCT
   DECISION; Trennungs-Szenario (Ex-Partner bleibt Space-Mitglied) — PRODUCT
   DECISION (Remove-Member/Freeze).
4. **Fake-Accounts / Impersonation:** kleine Fläche (keine öffentlichen
   Profile); `author_name` frei wählbar (s. o.); Absender-Spoofing der
   Mail-Domain (SPF/DKIM/DMARC) hier nicht prüfbar — Founder-Check.
5. **Scraping:** öffentliche Tabellen sind bewusst anon-lesbar, ohne
   PII-Schema, aber ohne Harvesting-Limit; `subscribers` ist nicht lesbar
   (aber anon-beschreibbar, M1).
6. **Prompt Injection:** zwei Pfade — ungefilterte `constraints` (M4) und
   vergiftete Ortsnamen via H1. Architektur begrenzt den Schaden auf
   „why"-Text (ID-Whitelist, Tool-Zwang, Längenkappung, deterministisches
   Crisis-Gate); Kosten-/Nonsense-Risiko bleibt bis M3/M4 gefixt sind.
7. **Ressourcen-/Kosten-Angriffe:** `discover` ohne Rate-Limit und ohne
   Metering (M3 — jede per Mail-OTP registrierte Person kann Anthropic-/
   Google-Kosten unbegrenzt treiben); `/api/reserve` unauthentifiziert ohne
   Limit → Mail-Bombing Dritter im Namen von alicia@peak-plant.com,
   DB-Spam (H2); `/api/checkout` ohne Limit (Stripe-Session-Spam).
8. **Lösch-Angriff auf Abonnenten:** bei ungesetztem `NEWSLETTER_SECRET`
   sind Unsubscribe-Tokens vorhersagbar → beliebige Adressen per GET aus
   `subscribers` löschbar (H3).

## Rate Limiting

Ist-Zustand: **unzureichend.**

- Vorhanden, aber nur in-memory pro Serverless-Instanz (weg bei Cold Start,
  per IP-Rotation trivial umgehbar): waitlist 3/10min, questions 1/h (M5).
- **Gar kein Limit:** `/api/reserve` (H2), `/api/checkout`, Edge Function
  `discover` (M3), `public_place_feedback`-Inserts, `redeem_invite`-Versuche
  (kein serverseitiges Brute-Force-Limit; Code-Raum PEAK-XXXXXX mit
  32er-Alphabet ≈ 1,1 Mrd. ist gegen blindes Raten ok, ersetzt aber kein
  Limit).
- **Soll:** zentrales, persistentes Limit (z. B. Upstash/Vercel KV o. ä.) für
  alle schreibenden öffentlichen Routen; Limit + Monats-Metering für
  `discover` (die Tabellen `ai_allowance`/`ai_usage` existieren dafür
  bereits — nur die Schreibseite fehlt); Versuchszähler für Invite-Redeem.
  Alles TECHNICAL REQUIREMENT. Die kostenbewusste Client-Budgetierung der
  Live-Suche (`livePlaceSearch.ts`) ist gut, ersetzt aber kein Server-Limit.

## Data Retention

Es gibt **keine definierte Retention-Policy** — heute gilt faktisch
„unbegrenzt bis Löschung". Zu entscheiden (PRODUCT DECISION, teils LEGAL
REVIEW REQUIRED):

- `orders` (Postadressen, Stripe-Refs): Aufbewahrung nach Abwicklung;
  handels-/steuerrechtliche Fristen vs. Minimierung — LEGAL REVIEW REQUIRED.
- `subscribers`: Unsubscribe **löscht** derzeit (statt zu flaggen) — gut für
  Minimierung; Nachweisbarkeit des Opt-in/Opt-out prüfen — LEGAL REVIEW
  REQUIRED.
- `personalization_signals` / `date_feedback`: Verfallsfenster definieren
  (z. B. 12 Monate) statt ewiger Verhaltenshistorie. PRODUCT DECISION +
  TECHNICAL REQUIREMENT.
- Anonyme öffentliche Inhalte (Fragen-Wand, Tipps): Ablauf/Archivierung
  definieren. PRODUCT DECISION.
- Logs (Vercel/Supabase/Edge): Retention prüfen, E-Mails aus Error-Logs
  entfernen. TECHNICAL REQUIREMENT (klein).
- Signierte-URL-TTL (1h) ist die einzige technisch erzwungene Frist.

## Data Deletion

- **Konto-Löschung: EXISTS AND WORKS.** `delete_account` (SECURITY DEFINER)
  löscht live die Datenzeilen, **beide Storage-Buckets** und den
  `auth.users`-Eintrag (0014-Funktionsstand live per `pg_proc.prosrc`
  bestätigt).
- **Einzel-Löschung:** Memories/Notes/saved_dates sind löschbar;
  partner_notes nur durch den Autor (0011).
- **Bekannte Lücken/Entscheidungen:**
  - Geteilte Memories überleben die Account-Löschung des Autors (Autorschaft
    wird nur detached) — bewusstes Design, aber gegenüber Nutzern
    dokumentieren. PRODUCT DECISION.
  - Server-only-Daten (`orders`, `subscribers`) sind **nicht** an
    `delete_account` gekoppelt (getrennte Systeme Website/App) — Prozess für
    Betroffenenanfragen definieren. TECHNICAL REQUIREMENT + LEGAL REVIEW
    REQUIRED.
  - Unsubscribe-Löschpfad ist derzeit über H3 angreifbar (fremdgesteuertes
    Löschen) — fixen.
  - Sobald `ai_usage` beschrieben wird: in den Löschpfad aufnehmen.

## Data Export

**NOT IMPLEMENTED.** Es existiert nur Löschung, kein Export — weder in der
App noch als Server-Funktion (Daten/Security-Inventar, bestätigt).

- DSGVO-Datenportabilität (Art. 20) verlangt einen Export in gängigem Format;
  Umfang/Format/Frist — LEGAL REVIEW REQUIRED.
- Bau-Empfehlung: serverseitiger Export (RPC oder Edge Function) je Nutzer:
  eigene `profiles`-Zeile, Memories (+ Foto-Download), partner_notes (eigene),
  saved_dates, Preferences/Signale des Space, als JSON + Medien-Zip.
  ARCHITECTURALLY POSSIBLE (RLS-Modell gibt die Abgrenzung bereits her).
  TECHNICAL REQUIREMENT vor Launch (mindestens ein manueller, dokumentierter
  Prozess für Betroffenenanfragen).
- Knifflig (PRODUCT DECISION + LEGAL REVIEW REQUIRED): Export **geteilter**
  Space-Daten berührt die andere Person (deren Notes/Fotos) — Umfang klären.

## GDPR Considerations

Keine Compliance-Behauptung — Aufgabenliste mit Zuordnung:

- **Rechtsgrundlagen & Informationspflichten** (Privacy Policy je Datenfluss,
  inkl. Google/Anthropic-Transfers, Mail-Provider): LEGAL REVIEW REQUIRED.
- **AVV/SCC mit allen Auftragsverarbeitern** (Tabelle unter Third-Party
  Services): LEGAL REVIEW REQUIRED.
- **Drittlandtransfers** (Google Places: Nutzerkoordinaten; Anthropic:
  Constraints): LEGAL REVIEW REQUIRED; technisch flankieren durch
  Minimal-Payload (bereits Design) und ggf. Koordinaten-Vergröberung
  (TECHNICAL REQUIREMENT, klein).
- **Betroffenenrechte:** Löschung gebaut (gut), Export fehlt (siehe Data
  Export), Auskunftsprozess (auch für `orders`/`subscribers`) fehlt:
  TECHNICAL REQUIREMENT + Prozess.
- **Besondere Kategorien (Art. 9):** Memories/Partner-Notes können
  Intimleben/Gesundheit berühren; Edition 02 ist explizit sensitiv. Ob und
  wie Art.-9-Anforderungen greifen: LEGAL REVIEW REQUIRED. Technisch ist die
  hohe Schutzstufe (space-privat, Biometrie-Gate) schon richtig.
- **Double-Opt-In / Nachweis** für Newsletter/Waitlist: derzeit kein DOI im
  Code erkennbar — LEGAL REVIEW REQUIRED + ggf. TECHNICAL REQUIREMENT.
- **Datenschutz-Folgenabschätzung (DSFA):** wegen Standort + intimer Daten
  wahrscheinlich angezeigt — LEGAL REVIEW REQUIRED.
- **Verzeichnis von Verarbeitungstätigkeiten, Meldeprozess bei
  Datenpannen:** LEGAL REVIEW REQUIRED (Prozess), Grundlage liefert dieses
  Dokument.
- **Minderjährige:** Altersgrenze/Prüfung ist nicht definiert — PRODUCT
  DECISION + LEGAL REVIEW REQUIRED.

## AI Act Considerations

Keine Rechtsberatung — Einordnung als Prüfliste:

- **Rollen-/Risikoeinstufung** (PeakPlant als Deployer eines GPAI-Modells;
  Empfehlungsfunktion mutmaßlich minimal-/begrenztes Risiko, keine
  Hochrisiko-Kategorie erkennbar): LEGAL REVIEW REQUIRED.
- **Transparenzpflichten:** Nutzer sehen heute schon, wann AI im Spiel ist
  (Source-Labels im `askGateway`) — beibehalten und in der UI konsistent
  halten. TECHNICAL REQUIREMENT (Bestand sichern).
- **Kein automatisiertes Entscheiden über Menschen:** die AI ordnet nur
  kuratierte Date-Ideen — keine rechtlich/erheblich wirkenden Entscheidungen.
  Diese Grenze als Produktregel festschreiben (analog MANIFESTO-Prinzip
  „Der Mensch entscheidet"). PRODUCT DECISION.
- **Schutzmechanismen dokumentieren:** deterministisches Crisis-Gate,
  ID-Whitelist, Tool-Zwang, Fallback-Verhalten — dieses Dokument + AI_SAFETY-
  Notizen im Code sind der Anfang; für AI-Act-Dokumentationspflichten
  formalisieren: LEGAL REVIEW REQUIRED.
- **KI-Kompetenz (Art. 4)** für die Betreiberseite: organisatorisch klären —
  LEGAL REVIEW REQUIRED (Prozess).

## Open Risks

Priorisierte Reihenfolge: **H1 → H3 → H2 → M1/M2 → M3/M5 → M6/M8** (Rest
danach).

**HOCH**
- **H1 — Öffentliche Orts-Pins von jedem umschreibbar (Data Poisoning).**
  UPDATE-Policy `using(true) with check(true)` für anon+authenticated auf
  `public_place_spots` (Migration 0010, live bestätigt): Name, Adresse,
  Koordinaten, `maps_url` jedes Pins änderbar → Phishing-Link / falscher
  Treffpunkt; zusätzlich Injektionspfad in den `discover`-Prompt. TECHNICAL
  REQUIREMENT.
- **H2 — `/api/reserve` unauthentifiziert, ohne Rate-Limit.** Pro Aufruf
  Order-Zeile + zwei Mails an beliebige Adressen → Mail-Bombing im Namen der
  Domain, DB-Spam. `/api/checkout` ebenfalls ohne Limit. TECHNICAL
  REQUIREMENT.
- **H3 — `'dev-secret'`-Fallback für Unsubscribe-HMAC.** Bei ungesetztem
  `NEWSLETTER_SECRET` sind Tokens vorhersagbar → fremdgesteuertes Löschen
  beliebiger Abonnenten. Ob gesetzt: nur via `/api/health?key=ADMIN_SECRET`
  prüfbar (Founder-Schritt). Fail-closed bauen. TECHNICAL REQUIREMENT.

**MITTEL**
- **M1 — Prod-Drift `subscribers`:** live anon-INSERT-Policy entgegen
  Repo-SQL; Spalten fehlen. — **M2 — Migrations-Tracking gebrochen:** 0014
  live wirksam aber untracked; `newsletter_sends` fehlt live;
  `rls_auto_enable()` ohne Repo-Migration. — **M3 — `discover` ohne
  Rate-Limit/Metering** (ai_usage/ai_allowance dormant; Kosten unbegrenzt
  treibbar). — **M4 — ungefilterte `constraints` im Prompt.** — **M5 —
  Rate-Limits nur in-memory.** — **M6 — Invite-Codes ohne Ablauf/Cap/
  Versuchslimit** (stiller Dritter im couple-Space). — **M7 — Advisors:**
  SECURITY-DEFINER-RPCs für anon EXECUTE-bar; Leaked-Password-Protection
  aus. — **M8 — Session in AsyncStorage statt SecureStore.**

**NIEDRIG**
- `{public}`-statt-`authenticated`-Policies (0005er, faktisch dicht);
  gegenseitiges Editieren/Löschen von Memories (PRODUCT DECISION);
  `ADMIN_SECRET` nicht timing-safe; E-Mails in Error-Logs;
  `public_place_feedback` anon-INSERT ohne Limit, Tipps unmoderiert.

**Positiv verifiziert (halten!):** deny-by-default-RLS-Kern; `delete_account`
inkl. Buckets + auth.users; private Buckets + signierte URLs + EXIF-Strip;
signaturgeprüfter, fail-closed Stripe-Webhook; WhatsApp-Link nur nach
JWT-Verifikation; EU-Region; deterministisches Crisis-Gate; Minimal-Payload
ans Modell; 326 grüne Tests in der App.

**Nicht prüfbare Punkte (Founder-Checks):** Vercel-Env
(`NEWSLETTER_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` — via `/api/health`),
Edge-Function-Secrets (`ANTHROPIC_API_KEY`, `GOOGLE_PLACES_API_KEY`),
Supabase-Auth-Konfiguration, Mail-DNS, Live-Verhalten von peak-plant.com.

## Required Security Work Before Launch

Alles TECHNICAL REQUIREMENT, Reihenfolge = Priorität:

1. **H1 fixen:** UPDATE-Policy auf `public_place_spots` entfernen; Änderungen
   an Pins nur noch server-seitig (RPC/Edge) mit Validierung, insbesondere
   `maps_url`.
2. **H3 fixen:** `'dev-secret'`-Fallbacks entfernen (fail-closed, Route
   antwortet bei fehlendem Secret mit Fehler); Founder prüft parallel via
   `/api/health`, ob die Secrets in Vercel gesetzt sind.
3. **H2 fixen:** `/api/reserve` und `/api/checkout` mit persistentem
   Rate-Limit (+ ggf. Turnstile/Captcha für reserve) versehen; Mail-Versand
   an fremde Adressen drosseln.
4. **Drift einfrieren (M1/M2):** anon-INSERT-Policy auf `subscribers`
   entfernen; Migrationstabelle mit dem tatsächlichen Live-Stand abgleichen
   (0014 nachtragen, `rls_auto_enable` in eine Repo-Migration heben,
   `newsletter_sends` entscheiden); erst danach neue Migrationen.
5. **AI-Zaun (M3/M4):** Rate-Limit + Metering-Writes (`ai_usage`/
   `ai_allowance`) in `discover`; `constraints` schema-validieren
   (Whitelist + Größenlimit).
6. **Zentrales Rate-Limiting (M5)** für alle schreibenden öffentlichen
   Routen statt In-Memory-Maps.
7. **Invite-Härtung (M6):** Code-Rotation/Invalidierung nach Beitritt,
   Member-Cap für `couple`-Spaces, serverseitiges Versuchslimit,
   Beitritts-Benachrichtigung. (Cap/Rotation zugleich PRODUCT DECISION im
   Detail.)
8. **Session in SecureStore (M8)** — Adapter liegt fertig kommentiert in
   `mobile/lib/supabase/client.ts`.
9. **Advisors abarbeiten (M7):** EXECUTE für `anon` auf den
   SECURITY-DEFINER-RPCs revoken; Leaked-Password-Protection aktivieren.
10. **Anon-Key-Fallbacks in API-Routen entfernen** (fail-closed);
    E-Mail-Adressen aus Error-Logs nehmen.
11. **Betroffenen-Prozesse minimal aufsetzen:** dokumentierter (auch
    manueller) Export- und Auskunftspfad; `orders`/`subscribers` in den
    Löschprozess einbeziehen.
12. **QR-Einmal-Token serverseitig entwerten** (dokumentierter
    Post-Beta-Schritt — vor breitem physischen Kartenverkauf).
13. **/01-Zugangs-Gate** bauen oder das Exklusivitäts-Versprechen aus Mails/
    Karten streichen (Konsistenz Sicherheit ↔ Marketing; Details im
    Website-Inventar).

## Legal Review Required

Gesammelt aus den Abschnitten oben — für eine Anwältin/einen Anwalt, keine
Rechtsberatung durch dieses Dokument:

1. Datenschutzerklärung(en) für Website + App: alle Flüsse, insbesondere
   Google Places (Nutzerkoordinaten, US) und Anthropic (US) inkl.
   Drittlandtransfer-Mechanismus (SCC/DPF) und Anbieter-Retention.
2. AVVs mit Supabase, Vercel, Stripe, Brevo/Resend, Google, Anthropic;
   Karten-Tile-Provider benennen.
3. Art.-9-Frage (intime Inhalte, Edition 02) und daraus folgende
   Anforderungen; DSFA-Pflicht wegen Standort + Intimdaten.
4. Betroffenenrechte-Prozesse: Auskunft, Portabilität (Format/Umfang,
   inkl. der Frage geteilter Space-Daten), Fristen; Löschumfang bei
   geteilten Memories.
5. Aufbewahrungsfristen `orders` (Handels-/Steuerrecht) vs. Minimierung;
   Opt-in-Nachweis und ggf. Double-Opt-In für Newsletter/Waitlist.
6. Altersgrenze/Jugendschutz für eine Intimitäts-nahe App.
7. AI Act: Rollen- und Risikoeinstufung, Transparenz- und
   Dokumentationspflichten für die `discover`-Funktion; Crisis-Gate-Wortlaut
   und Hilfe-Ressourcen (Haftungsfragen).
8. Impressums-/Fernabsatzpflichten des Shops (sobald Checkout live geht) —
   außerhalb des Security-Scopes, aber im selben Review erledigen.
