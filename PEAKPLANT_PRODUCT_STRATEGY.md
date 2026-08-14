# PeakPlant — Product Strategy

> Stand: 13.08.2026. Grundlage: vollständiges Code-Audit von Website (Repo-Root),
> App (`mobile/`), Datenbank (`supabase/` + Live-Projekt `kmlqjmxkcnkfwsbptvuc`,
> nur lesend) und Doku (MANIFESTO.md, BRAND.md, AGENTS.md). peak-plant.com war
> netzwerkgesperrt; der Live-Auftritt wurde ausschließlich über den Code
> beurteilt. Dieses Dokument nickt nichts ab: wo Gründerideen dem Ist-Zustand,
> dem Manifest oder der kommerziellen Logik widersprechen, steht es hier.
> **Die Positionierung ist durchgehend als HYPOTHESE behandelt, nicht als
> Beschluss** — auf ausdrücklichen Wunsch der Gründerin.

---

## Executive Summary

PeakPlant ist heute — belegt durch Code und Live-Datenbank — ein **privates
Momente-Tagebuch für Paare und Freundeskreise mit physischem Kartenprodukt und
Entdeckungs-Schicht**. Die App ist überraschend reif (326 Tests grün, RLS auf
allen Tabellen, ehrliche Provenance-Labels, durchdachte Privacy), die Website
trägt drei Erzählungen übereinander (Kartenset, Intimacy-Erbe, Community), und
**nichts davon ist am Markt validiert**: 0 Bestellungen, 3 Newsletter-Abonnenten,
0 produktive App-Datensätze, 2 Test-Accounts.

Die strategische Kernaussage dieses Dokuments: **Der Wedge ist das physische
Kartenset mit App-Tagebuch — nicht die Plattform.** Die Hypothese „social
platform for meaningful connection in real life" ist heute um Größenordnungen
größer als die Realität und würde als Außenbehauptung Manifest §1 (Ehrlichkeit
vor Eindruck) verletzen. Sie bleibt als *Phase-2/3-Hypothese* legitim und wird
hier mit Alternativen und Trade-offs offen gehalten (siehe *Strategic Thesis*),
aber nicht in Stein gemeißelt.

Empfehlung in einem Satz: **Erst einen einzigen Loop beweisen (Karte → Moment →
Tagebuch → Wiederkommen) mit echten zahlenden Paaren, dann Community, dann
Plattform-Fragen** — und bis dahin jede Außenkommunikation auf das
zurückschneiden, was der Code hält.

---

## Current Product Audit

Kurzfassung der drei Inventar-Berichte (Details dort; Klassifikations-Labels
gemäß Audit-Standard):

**App (`mobile/`) — der stärkste Teil des Produkts:**

| Feature | Status | Beleg |
|---|---|---|
| Spaces (couple/friends, Multi-Space, Invite-Codes) | EXISTS AND WORKS | `lib/types.ts:42-77`, `supabase.ts:195-265`, RLS 0001 |
| Moments/Memories (Foto+Notiz, Biometrie-Gate, EXIF-Strip) | EXISTS AND WORKS | `app/(tabs)/moments.tsx`, `lib/supabase/storage.ts` |
| Editionen (2 echte Decks à 20 Karten; 10 Roadmap-Platzhalter) | EXISTS AND WORKS / UI ONLY | `lib/seed.ts:66-235` |
| QR-Scan (Kamera, 2 Payload-Familien) | EXISTS AND WORKS; Einmal-Token nur gerätelokal entwertet | `lib/qr.ts`, `lib/redeemedTokens.ts` |
| Challenges (5 Saison + 8 Wochen) | EXISTS AND WORKS | `lib/challenges.ts` |
| Discover/Recommender (deterministisch, erklärt, Live-Wetter) | EXISTS AND WORKS | `lib/discovery/recommend.ts` |
| AI (Ask PeakPlant mit Krisen-Routing; Discover-AI per Kill-Switch AUS) | teilaktiv, bewusst | `lib/ai/index.ts:13`, `safety.ts:96-104` |
| Map/Places (Leaflet, Live-Orte via Edge Function) | EXISTS AND WORKS / Secret-abhängig | `app/(tabs)/community.tsx` |
| Saved Dates, Partner-Notizen, Story-Tab, Streak (sanft) | EXISTS AND WORKS | s. App-Inventar |
| Rituale, Date-Feedback-Sync, Community-Feed, Events, Push | Flags `'soon'` / NOT IMPLEMENTED | `lib/features.ts`, `lib/notifications/index.ts` |
| Monetarisierung (Paywall-Scaffold, RevenueCat vorbereitet) | UI ONLY, bewusst AUS | `monetization/config.ts:15` |
| Journeys, Solo-Kontext, Family-Kontext | NOT IMPLEMENTED (DB erzwingt couple/friends) | `0001_init.sql:21` |

**Website — funktional solide, erzählerisch gespalten:** Waitlist-Funnel
EXISTS AND WORKS (eine Tabelle, vier sprachliche Versprechen), Shop UI ONLY
(bewusster Waitlist-Modus, kompletter Stripe-Strang BACKEND ONLY ohne
UI-Einstieg), /01 als „exklusiver" Sneak Peek **ohne Gate und öffentlich in der
Sitemap** (Gate: NOT IMPLEMENTED, `access_token` wird nie gelesen),
Ethics-Seite mit unbelegten Zertifikats-Claims im Widerspruch zur eigenen
„Grenzen"-Sektion, Versanddatum Oktober vs. Mitte August auf derselben
Shop-Seite, /members-Copy verspricht einen Code-Login, gebaut ist Passwort.

**Experience Library:** 1.275 generierte + 108 kuratierte Einträge = 1.383;
davon ~143 redaktionell eigenständig. **Die kolportierte Zahl „~14.000 Ideen"
ist um Faktor ~10 falsch und existiert nirgends im Repo.** Struktur, Provenance
und Recommender sind gut — weiterverwenden, nicht neu bauen.

**Der wichtigste Audit-Befund ist keiner der Bugs, sondern die Asymmetrie:
Das Produkt ist zu ~80 % gebaut und zu 0 % validiert.**

---

## Current vs Future State

| Dimension | Current State (belegt) | Future State (Hypothese des Briefs) | Lücke |
|---|---|---|---|
| Kontexte | couple, friends (DB-erzwungen) | with yourself / with someone / with friends / with community | 2 von 4 existieren; Solo & Community NOT IMPLEMENTED |
| Loop | discover→choose→experience→capture→remember | + share→connect | share/connect bewusst nicht gebaut (nur anonyme Spot-Tipps) |
| Karten | 2 Decks à 20, QR additiv | Editionen als Journeys | Journey-Konzept existiert nicht |
| Community | Feature-Flags `'soon'`, WhatsApp-Link, 3 Subscriber | lebendige IRL-Community, Events | NOT IMPLEMENTED |
| Umsatz | 0 € (0 Bestellungen) | Physisch + Abo + Events + Host Pro | alles offen |
| Nutzer | 2 Test-Accounts, 0 Zeilen in App-Tabellen | aktive Spaces | alles offen |

Die Lücke ist normal für Pre-Launch. Gefährlich wird sie nur, wenn die
Außenkommunikation den Future State als Present State verkauft — genau das tut
die Website heute an mehreren Stellen (Community-Seite, /01-Exklusivität,
Ethics-Claims). Erste Pflicht: Gegenwart und Zukunft sprachlich trennen.

---

## Strategic Thesis

**These (Arbeits-Hypothese, nicht Beschluss):** PeakPlant gewinnt als
**physisch-digitale Ritual-Marke**: Ein schönes, eigenständig wertvolles
Kartenprodukt schafft den Anlass; die App macht aus dem Anlass ein wachsendes,
privates Gedächtnis. Der Wert liegt im *Bemerken* („Deine Beziehung ist nichts
zum Optimieren. Sie ist etwas zum Bemerken.", MANIFESTO), nicht im Vernetzen.

**Positionierungs-Kandidaten mit Trade-offs (bewusst offen):**

1. **„Ritual-Marke für Paare & Freundeskreise" (physisch-digital).**
   Deckt den Ist-Code zu ~95 %. Klarster Kaufgrund (Produkt in der Hand),
   ehrlich ab Tag 1, geschenk-tauglich. Trade-off: kleinerer erzählbarer
   Horizont, kein Plattform-Multiple, Wachstum an physische Logistik gekoppelt.
2. **„Social platform for meaningful connection in real life" (Gründerinnen-
   Hypothese).** Größter Horizont, passt zu Events/Host-Pro-Monetarisierung.
   Trade-off: heute zu 0 % belegt (keine Profile, kein Feed, Community `'soon'`,
   3 Subscriber); als Behauptung sofort Manifest-§1-Risiko; zieht das Produkt in
   Feed-/Netzwerk-Mechaniken, die Manifest §3 explizit ablehnt. Nur als
   *verdiente* Evolution nach bewiesenem Kern-Loop vertretbar.
3. **„Editorial Intimacy Brand" (Erbe von Philosophy/Intimacy/Journal).**
   Geringste Beweislast, starke Texte existieren schon. Trade-off: schwächste
   Monetarisierung, erklärt weder App noch Karten-Mechanik, hält die
   Kondom-Ära-Altlasten am Leben.

**Empfehlung:** Mit Kandidat 1 *operieren*, Kandidat 2 als benannte Hypothese
in der Schublade *messen* (Community-Signale in Phase 2), Kandidat 3 als
Content-Schicht *einbetten* statt als Identität. Keine finale Festlegung in
diesem Dokument — aber jede Website-Zeile muss zum jeweils gewählten Betrieb
passen (JSON-LD sagt heute noch „premium intimacy brand", `app/layout.tsx:10`).

---

## Target Users

Belegbar sind heute null zahlende Nutzer; alles Folgende ist Hypothese mit
Prioritäts-Reihenfolge:

1. **Paare 25–45 im Alltagstrott** (Primär): wollen bewusste gemeinsame Zeit
   ohne „Beziehungsarbeit"-Schwere. Kaufanlass: sich selbst oder als Geschenk.
   Der gesamte Ist-Code (couple-Space, Edition 01/02, Date-Discovery) zielt
   hierauf.
2. **Enge Freundeskreise** (Sekundär): friends-Space existiert vollständig;
   Content ist aber überwiegend paar-gefärbt (84 couple-only-Einträge, Edition
   02 sensitiv). Braucht eigene Content-Pflege, keinen Umbau.
3. **Schenkende** (Kanal, nicht Persona): kaufen das physische Produkt für 1.
   Wichtig für Preispunkt 25–50 €, stellt keine App-Anforderungen.
4. **Hosts/Community-Builder** (Phase-2-Hypothese für Events/Host Pro): heute
   ohne jedes Produkt-Gegenstück. Nicht adressieren, bevor 1. trägt.

Explizit NICHT Zielgruppe (heute): Singles/Dating (siehe Risks), Familien mit
Kindern (LEGAL REVIEW REQUIRED wegen Minderjährigen + intimer Editionen),
Therapie-Kontexte (AI ist Kurator, nie Therapeut; Krisen-Routing existiert
genau deshalb).

---

## Jobs To Be Done

1. **„Mach uns einen Anlass"** — Wenn der Abend frei ist und uns nichts
   einfällt, gib uns *eine* gute, machbare Idee statt 1.000 Optionen.
   (Discover/Today's Moment — EXISTS AND WORKS, deterministisch.)
2. **„Hilf uns, wirklich zu reden"** — Gib uns eine Frage, die tiefer geht als
   Alltag, ohne Therapie-Gefühl. (Karten/Editionen — Kern des physischen
   Produkts.)
3. **„Bewahre das für uns"** — Wenn ein Moment gut war, lass ihn nicht in der
   Camera Roll versinken; leg ihn in *unser* Gedächtnis. (Moments — der
   emotionale Kern der App.)
4. **„Zeig mir, was zwischen uns wächst"** — Mach sichtbar, was schon da ist,
   ohne zu bewerten. (Story-Tab, „N von 20 bewahrt".)
5. **„Gib mir ein Geschenk, das nicht peinlich ist"** — schön, sinnvoll, nicht
   ratgeberhaft. (Physisches Produkt + Verpackung.)
6. *(Hypothese, unbelegt)* „Lass uns Menschen treffen, die das auch wollen" —
   der Community-Job. Erst validieren (WhatsApp-Gruppe, Beta), bevor dafür
   gebaut wird.

---

## Product Architecture

Ist-Architektur (behalten — sie ist gut):

- **Client:** Expo/React Native, Repositories mit lokalem Fallback
  (`lib/repositories/`), Feature-Flags mit ehrlichem `'soon'`-Zustand,
  Kill-Switches für AI (`liveRecommendations: false`).
- **Backend:** Supabase (Auth E-Mail-OTP, Postgres mit RLS auf allen Tabellen,
  Storage mit signierten Kurzzeit-URLs, Edge Function `discover` als einziger
  Ort mit API-Keys). Website: Next 14 auf Vercel, gleiche DB, getrennte
  Tabellenwelt (`subscribers`, `orders`, `community_questions`).
- **Content:** Experience Library als TS-Konstanten im App-Bundle; Editionen
  als Code-Content (`lib/content/edition01/02.ts`).

Architektur-Entscheidungen, die die Strategie erzwingt (nicht in diesem Audit
umsetzen, nur benennen):

1. **Server-seitige Einmal-Token-Entwertung** vor physischer Skalierung
   (heute gerätelokal, `qr.ts:17-19`) — TECHNICAL REQUIREMENT, sobald Karten
   verkauft werden, die „Unlock" versprechen.
2. **Migration 0014 auf Prod anwenden** (liegt im Repo, live fehlt sie; zwei
   gefixte Bugs sind live nicht wirksam) — TECHNICAL REQUIREMENT.
3. **Experience Library serverfähig machen** (Supabase-Tabelle) *nur wenn*
   Website/Redaktion sie braucht — heute NOT IMPLEMENTED, ARCHITECTURALLY
   POSSIBLE, keine Dringlichkeit.
4. `/01`-Gate: entweder bauen (Token existiert live in `orders.access_token`,
   ARCHITECTURALLY POSSIBLE) oder Exklusivitäts-Copy streichen — Entscheidung
   VOR dem Druck der Einlegekarte.

---

## Information Architecture

Kurzfassung; das vollständige Soll steht in
`PEAKPLANT_INFORMATION_ARCHITECTURE.md`.

- **App-Ist:** sichtbar Home(Together) · Moments · Discover · Story ·
  Collection; versteckt Places-Karte („community"), Profile, Scan. Das ist
  näher am richtigen Zustand als die Brief-Navigation.
- **Brief-Navigation (Home/Discover/Spaces/Journeys/Moments/Map/Community/
  Profile) wird NICHT übernommen:** 8 Top-Level-Ziele verletzen Manifest §5
  (eine klare Handlung), „Spaces" ist Kontext-Wechsler statt Ziel, „Journeys"
  existiert nicht, „Community" wäre ein leerer Tab mit `'soon'`-Flags.
- **Website:** Die Doppelstruktur Marketing-„Community" vs. /members wird
  aufgelöst (eine Community-Route mit Logged-in/out-Zuständen), /01 wird
  gegatet oder umbenannt, die Nav folgt der gewählten Erzählung statt drei
  gleichzeitig.

---

## Core User Journey

Der Loop des Briefs — discover → choose → experience → capture → remember →
share → connect — wird **bewusst gekürzt betrieben**:

1. **discover** (App Discover / Karte ziehen aus dem physischen Deck) —
   EXISTS AND WORKS.
2. **choose** (Save for us / Date planen / Karte aktivieren) — EXISTS AND
   WORKS inkl. Kalender-Export.
3. **experience** — findet offline statt; die App tritt zurück (Feature, kein
   Bug).
4. **capture** (Foto + Notiz, „PRESERVE THIS MOMENT") — EXISTS AND WORKS.
5. **remember** (Monats-Album, Story-Tab, Jahres-Rückblick als späterer
   Ausbau) — EXISTS AND WORKS.
6. **share** — heute NUR anonym (Spot-Tipp ohne Identität). Vollwertiges
   Teilen von Momenten nach außen widerspricht Manifest §2/§3 („kein
   automatisches Social-Sharing") und bleibt bewusst draußen; maximal ein
   manueller Memory-Export (Print, Phase 4+).
7. **connect** — Phase-2-Hypothese (Events, Host-Formate), nicht Kern-Loop.

**Der validierbare Kern-Loop ist 1–5.** Er ist vollständig gebaut und von
niemandem benutzt. Alles Weitere wartet darauf, dass dieser Loop mit echten
Paaren Retention zeigt.

Onboarding-Gefühl (Soll): „wir haben einen gemeinsamen Ort angelegt" — nicht
„ich habe eine App installiert". Die ersten 10 Minuten müssen enthalten:
Space anlegen ODER per Code beitreten → erste Karte (Demo-Karte existiert) →
einen ersten Moment bewahren. Alles drei existiert im Code; das Onboarding
muss nur darauf zulaufen.

---

## Spaces

Der stärkste Baustein. `couple | friends`, Multi-Space, Invite-Codes
`PEAK-XXXXXX`, RLS space-scoped, Space-Identität (Emoji/Avatar). **Behalten,
nichts umbauen.**

Entscheidungen:
- **Solo-Space („with yourself"): NICHT jetzt.** Die DB lehnt ihn ab
  (Check-Constraint `0001_init.sql:21`), der Content ist dyadisch, das
  Markenversprechen heißt „grow *together*". Faktisch funktioniert die App vor
  dem Partner-Join ohnehin allein — das reicht als stiller Solo-Modus.
  ARCHITECTURALLY POSSIBLE, aber PRODUCT DECISION mit Marken-Kosten; erst
  prüfen, wenn echte Nachfrage messbar ist.
- **Family: nicht versprechen.** Minderjährige + intime Editionen + Foto-
  Tagebuch = LEGAL REVIEW REQUIRED, bevor das Wort in irgendeine Copy wandert.
- Die vier Brief-Kontexte werden damit ehrlich so betrieben: **with someone ✓,
  with friends ✓, with yourself = impliziter Vor-Join-Zustand (nicht als
  Feature verkauft), with community = Hypothese Phase 2.**

## Journeys

**Existiert nicht im Code — und sollte als DRITTE Sammellogik auch nicht
entstehen.** Es gibt bereits Deck-Fortschritt (Editionen) und Challenge-Badges;
ein drittes konkurrierendes Fortschrittssystem wäre Verwirrung, nicht Wert
(gleiche Einschätzung im App-Inventar).

**Empfohlene Deutung der Brief-Idee „Editionen können zu Journeys werden":**
Journey = **dramaturgische Ordnung INNERHALB einer Edition** (z. B. Edition 01
in 3 Akten mit optionaler Reihenfolge und einem Abschluss-Moment), kein neues
Objekt. Das ist auf dem Editions-/`card_activations`-Unterbau ARCHITECTURALLY
POSSIBLE, reine Content+UI-Arbeit, keine Migration. PRODUCT DECISION für
Phase 2/3 — nicht MVP.

## Cards

Das physische Produkt ist der Wedge. Regeln (deckungsgleich mit Brief und
Code-Realität):

- **Karten bleiben eigenständig wertvoll**: Frage + Gestaltung funktionieren
  ohne jede App. QR ist Zusatzwert (Moment bewahren), nie Abhängigkeit. Der
  Code hält das bereits (freie Momente ohne Karte via `free-moment`-Sentinel;
  Scan optional).
- Edition 01 „Grow Together" (20 Karten) und 02 „Soft & Wild" (sensitiv,
  Biometrie-gegatet) sind fertig; Editionen 03–12 bleiben ehrlich gelabelte
  Roadmap (`status: 'upcoming'`).
- **Vor dem ersten Druck:** Einlegekarten-Copy korrigieren („your world
  unlocks instantly" beschreibt eine nicht existierende Mechanik,
  `app/admin/card/page.tsx:82`) und Überraschungskarten-Mechanik entweder
  bauen oder von Karte/Website nehmen (Gewinnspiel-Charakter: LEGAL REVIEW
  REQUIRED). Gedrucktes ist nicht patchbar.
- Einmal-Token serverseitig entwerten, bevor „1 Karte = 1 Aktivierung"
  irgendwo versprochen wird (TECHNICAL REQUIREMENT).

## Moments

Der emotionale Kern und das Retention-Organ: Foto + Notiz, privat für den
Space, EXIF-gestrippt, Biometrie für Sensibles, Monats-Album, Story-Tab mit
nur gezählten (nie erfundenen) Beobachtungen. **EXISTS AND WORKS — hier nichts
Neues bauen, sondern den Weg dorthin verkürzen** (Onboarding endet im ersten
bewahrten Moment). Später: Jahres-Rückblick und Memory-Print als *Ernte* der
Moments (Print: nur dokumentiert, nicht bauen — s. Business Model).

## Community

Ehrlicher Ist-Zustand: **NOT IMPLEMENTED** (Flags `'soon'`, kein Feed, keine
Profile; einziges Live-Element sind anonyme Spot-Bewertungen mit 0 Zeilen;
Website-„Inner Circle" ist ein Waitlist-Eintrag; /members liefert einen
WhatsApp-Link, sobald die Env-Var gesetzt ist).

Strategie: **Community wird verdient, nicht gebaut.** Phase 2 validiert mit
dem billigsten echten Werkzeug (WhatsApp-Gruppe + 1–2 gehostete Treffen),
bevor irgendein Feed, Event-System oder Partner-Programm entsteht. Die
Website-Community-Seite wird bis dahin ins Futur gesetzt oder gekürzt
(Präsens-Versprechen wie „Live Talks", Journal-QR sind heute Dashboard-
Theater — Manifest-§1-Verstoß).

Wichtig für die Marke: Wenn Community kommt, dann **IRL-first und anonym-
öffentlich** (Spot-Tipps, Treffen), nie als Feed von Paar-Inhalten — Moments
bleiben privat, das ist das Versprechen von Manifest §2.

## Events

Heute: `nullEventsProvider`, kein Screen, keine Daten — NOT IMPLEMENTED.
Events sind der plausibelste Weg von Kandidat-1-Positionierung zu
Kandidat-2-Hypothese: „Deck-Abend" als Format (Host lädt, Edition liegt auf
dem Tisch) wäre markenkonform, physisch-first und monetarisierbar (Ticket
oder Host Pro). **Aber:** erst manuell veranstalten (Phase 2, ohne Code),
dann produktisieren (Phase 3+). Kein Event-Feature vor dem ersten manuell
vollen Raum.

## Map

Ist: Leaflet-Karte mit Kategorie-Pins, Live-Orte über Edge Function (Google
Places, Key serverseitig, Budget + Cache), eigene Orte bewusst listen-only
ohne Koordinaten. **Die Brief-Idee „Map of Moments statt Maps-Klon" ist
richtig und fast schon da:** Der Unterschied zu Google Maps ist nicht
Ortssuche, sondern *unsere Orte + unsere Momente dort*. Ausbau (Phase 3):
bewahrte Momente optional auf der privaten Space-Karte verorten
(space-privat, nie öffentlich; opt-in pro Moment). Öffentliche Schicht bleibt
die anonyme Spot-Bewertung. Kein globaler „alle Nutzer sehen alles"-Layer —
das wäre der Maps-/Social-Klon, den niemand braucht und der Privacy-Kern
bricht.

## AI

Governance-Zustand heute (gut und bewusst): Discover/Home laufen
deterministisch (`nullDiscovery` trotz deployter Edge Function), AI nur auf
„Ask PeakPlant" mit Kill-Switch, deterministischem Krisen-Routing und
Kandidaten-Re-Ranking, das **nie Venues erfindet**.

Regeln (fortschreiben, nicht neu erfinden):
1. **AI ist Kurator, nie Therapeut.** Sie ordnet kuratierte Kandidaten, sie
   deutet keine Beziehung. Beziehungs-Diagnosen, Stimmungs-Scores,
   „eure Beziehung ist zu 73 % gesund" sind verboten (Manifest §1+§3).
2. **Minimal-Kontext:** Die AI sieht Constraints (Wetter, Budget, Energie,
   Kategorie-Affinität aus explizitem Verhalten), nie den Tagebuch-Inhalt.
   Moments/Notizen/Fotos gehen nicht in Prompts. Wenn das je aufgeweicht
   werden soll: eigene Entscheidung + Datenschutz-Review vorher.
3. **Erklärbarkeit bleibt** (`signalsUsed`/`signalsNotUsed`) — auch wenn AI
   re-rankt.
4. Aktivierung der Live-Recommendations ist ein Phase-3-Schalter, nachdem der
   deterministische Recommender mit echten Nutzern Baseline-Daten geliefert
   hat. Vorher ist „AI-personalisiert" eine leere Behauptung.

## Physical Product

Das Kartenset ist Kaufgrund, Geschenk-Kanal und Marken-Anker. Offene
Ehrlichkeits-Baustellen vor Launch (aus dem Website-Inventar):
Versanddatum vereinheitlichen (Oktober vs. Mitte August auf derselben Seite —
PRODUCT DECISION, dann eine Quelle der Wahrheit), Ethics-Seite auf belegbare
Aussagen kürzen (Blauer Engel/DHL GoGreen/Druckerei-Nennung ohne Beleg:
LEGAL REVIEW REQUIRED + Manifest-§1-Verstoß), Überraschungskarte klären.
Fulfilment-Backend (Stripe Checkout, Rechnung, Forward, Admin) existiert
BACKEND ONLY und braucht vor Aktivierung nur UI-Verdrahtung + Stale-Label-
Pflege (`pack_3`/`pack_12` fehlen im Admin-Mapping).

## Business Model

Optionen (Brief) mit ehrlicher Einordnung — Zahlen sind Hypothesen, nichts
davon ist validiert:

| Quelle | Preis-Hypothese | Einordnung |
|---|---|---|
| Physische Editionen | 25–50 € | **Primär, Phase 1.** Einziges Modell mit greifbarem Kaufgrund heute. Marge hängt an Druck/Fulfilment — vor Preisfestlegung reale Stückkosten erheben. |
| PeakPlant+ (App-Abo) | 4,99–6,99 €/M | Phase 4. Scaffold existiert (`entitlements`, Paywall, RevenueCat-Checkliste). Braucht vorher bewiesene Retention; ein Abo auf ein unbenutztes Tagebuch ist unverkäuflich. |
| Events/Tickets | — | Phase 2 manuell testen, Phase 3+ produktisieren. |
| Host Pro | — | Nachgelagert zu Events; heute reine Idee. |
| Memory-Print | — | **Nur dokumentieren, nicht bauen** (Brief-Vorgabe, geteilt): natürlicher „Ernte"-Umsatz auf Moments, aber erst sinnvoll, wenn Spaces volle Alben haben. |
| Partnerschaften (Orte, Marken) | — | Frühestens Phase 5; vorher fehlt jede Reichweite als Verhandlungsmasse. |

Kernaussage: **Ein Geschäftsmodell nach dem anderen beweisen.** Phase 1 lebt
ausschließlich vom physischen Verkauf; alles andere sind dokumentierte
Optionen.

## Network Effects

Ehrlich: **PeakPlant hat heute keine Netzwerkeffekte und braucht für den Kern
auch keine.** Der Space-Effekt ist ein *Paar-Lock-in* (gemeinsames Tagebuch =
gemeinsame Wechselkosten), kein Netzwerk. Denkbare echte Effekte, in
Reihenfolge der Glaubwürdigkeit: (1) Geschenk-Viralität (ein Deck schenkt das
nächste), (2) Invite-Mechanik friends-Spaces, (3) anonyme Spot-Dichte pro
Stadt (je mehr Tipps, desto besser die Map — der einzige klassische
Daten-Netzwerkeffekt im Ist-Code), (4) Events/Hosts (Hypothese). Eine
Plattform-Story auf (4) zu bauen, bevor (1) je stattgefunden hat, wäre
Wunschdenken.

## Retention

Retention-Organe im Ist-Code, in Wirkreihenfolge: der wachsende
Moments-Bestand (Verlust-Aversion, ehrlichster Halte-Grund), Weekly Challenge
(ISO-Wochen-Rotation als sanfter Wiederkehr-Anlass), Streak als „shared
rhythm" (abschaltbar, nie Peitsche — Manifest-konform), Monatsfragen,
Editionen als physischer Nachschub. **Fehlend und in Phase 2 wichtig:
Push-Notifications** (heute Null-Provider) — als *Einladung* (Partner hat
einen Moment bewahrt; Weekly Challenge startet), unter Manifest-§3-Regeln
(keine Guilt-Trips, harte Frequenz-Obergrenze, granular abschaltbar).
Gemessen wird Retention pro **Space**, nicht pro Device (M1/M3-Space-
Retention, siehe Product Metrics).

## Monetization

Sequenz (Begründung in Business Model): **Phase 1 physisch → Phase 4 App-Abo
(PeakPlant+) → danach Events/Host Pro/Print.** Für PeakPlant+ gilt: Free
bleibt vollwertig für den Kern-Loop (Karte, Moment, Tagebuch — ein bezahltes
Erinnerungs-Gedächtnis wäre erpresserisch und markenwidrig); Plus bündelt
Mehr-Wert (zusätzliche Editionen digital, AI-Komfort, Print-Rabatte,
Multi-Space-Komfort). Paywall-Grenze ist eine PRODUCT DECISION in Phase 4 —
mit echten Nutzungsdaten, nicht jetzt am Reißbrett.

## MVP

**Das kleinste Produkt, das die Kernhypothese validiert, ist NICHT mehr
Software** — es ist: *Edition 01 physisch in den Händen von ~50–100 echten
Paaren, App im Beta-Zugang, 8 Wochen Beobachtung.*

Scope (fast alles existiert):
- Physisch: Edition 01 drucken (nach Copy-Fixes), einfacher Verkauf (der
  existierende Stripe-Strang UI-verdrahtet ODER manuell per Rechnung —
  BACKEND ONLY → aktivieren).
- App: Ist-Stand + Migration 0014 + `expo-secure-store`-Härtung (B1) + OTP-
  Template — die dokumentierten Operator-Schritte, kein neues Feature.
- Website: Ehrlichkeits-Bereinigung (Datum, Ethics, /01, /members-Copy) —
  Streichungen, kaum Neubau.
- Messung: die Product-Metrics-Basisereignisse (heute misst die App nichts).

Explizit NICHT im MVP: Community-Features, Events, AI-Discover, Solo/Family,
Journeys, Monetarisierungs-Schalter, Push (grenzwertig — frühestens Ende
Beta), Print.

## Phase 2

(Details in `PEAKPLANT_PRODUCT_ROADMAP.md`.) Community *verdienen*: WhatsApp
+ 2–3 manuell gehostete Deck-Abende, Push-Einladungen, Edition-02-Verkauf,
friends-Content-Ausbau. Erfolgskriterium: Menschen kommen wieder, ohne dass
wir sie einzeln einladen.

## Phase 3

AI + Map: Live-Recommendations-Schalter (nach Baseline), Moments-auf-
Space-Karte (privat, opt-in), Spot-Dichte in 1–2 Pilotstädten, Journeys als
Editions-Dramaturgie (falls Phase-1/2-Daten den Bedarf zeigen), Events
produktisieren falls manuell bewiesen.

## Explicitly Not Building

1. **Feed von Paar-Momenten / Social-Sharing von Moments** — bricht Manifest
   §2/§3; Moments bleiben privat.
2. **Beziehungs-Scores, Kompatibilitäts-Metriken, „Gesundheits"-Dashboards** —
   „nichts zum Optimieren".
3. **Dating-/Matching-Funktionen jeder Art** — anderes Produkt, anderes
   Risiko (siehe Risks).
4. **Solo- und Family-Kontext** (bis echte Nachfrage + für Family ein
   Rechts-Review vorliegt).
5. **Journeys als drittes Fortschrittssystem** neben Editionen und Challenges.
6. **Memory-Print-Pipeline** (nur dokumentiert, Brief-konform).
7. **Kombinatorisches Aufblasen der Experience Library**, um große Zahlen zu
   behaupten — „14.000 Ideen" wird aus jeder Kommunikation gestrichen;
   ehrlich sagbar: „über 1.200 durchsuchbare Ideen, davon ~110 handkuratiert".
8. **Automatisch handelnde AI** (Buchungen, Nachrichten im Namen der Nutzer,
   Beziehungs-Interpretation).
9. **Eigener Chat** — es gibt WhatsApp; Partner-Notizen decken den In-App-Fall.
10. **Web-Version der App** vor Phase 5.

## North Star Metric

**Vorschlag: „Aktive Spaces" = Spaces mit ≥2 Mitgliedern, die in den letzten
28 Tagen ≥1 Moment bewahrt haben.**

Begründung: (a) Es misst genau das Kernversprechen — *gemeinsam* bemerken und
bewahren; ein Space mit einem Mitglied oder ohne Momente ist kein gelebtes
Produkt. (b) Es ist nicht durch Engagement-Theater steigerbar (DAU/Sessions
würden Streak-Druck und Notification-Spam belohnen — genau was Manifest §3
verbietet; deshalb ausdrücklich NICHT DAU). (c) Es verbindet physisch und
digital: jede verkaufte Edition, jede Challenge, jeder Push zahlt nur ein,
wenn daraus ein bewahrter gemeinsamer Moment wird. Zweitmetrik fürs Geschäft:
verkaufte Editionen. Die North-Star-Definition ist mit heutigem Schema messbar
(`memories` + `space_members`), braucht aber eine Ereignis-/Auswertungsschicht
(heute existiert keinerlei Produkt-Analytik — bewusst datensparsam; die
Auswertung kann DB-seitig ohne Tracking-SDK erfolgen).

## Product Metrics

Minimal-Set, alles space-zentriert, alles ohne Dritt-Tracker (DB-Abfragen
genügen):

- **Aktivierung:** % neuer Spaces, die binnen 7 Tagen 2 Mitglieder UND ≥1
  Moment erreichen (die „ersten 10 Minuten"-Metrik).
- **Retention:** Space-Retention W4 / M3 (≥1 Moment im Fenster).
- **Loop-Tiefe:** Momente pro aktivem Space und Monat; Anteil Karten-Momente
  vs. freie Momente (misst, ob das physische Produkt trägt).
- **Physisch→Digital:** % verkaufter Decks mit ≥1 Scan/Aktivierung binnen 30
  Tagen (DIE Brückenmetrik des Geschäftsmodells).
- **Commerce:** Bestellungen, Beta-Conversion Waitlist→Kauf, Wiederkauf
  Edition 02.
- **Guardrail-Metriken:** Anteil Spaces mit abgeschaltetem Streak (Ehrlichkeit
  über Druck), Push-Opt-out-Rate, Löschquote.

## Risks

1. **Validierungs-Risiko (größtes):** 100 % gebaut auf 0 % Evidenz. Gegenmittel:
   MVP wie oben, keine weitere Feature-Arbeit vor Beta-Daten.
2. **Ehrlichkeits-Schulden auf der Website** (Ethics-Claims, /01-Exklusivität,
   Datum, /members-Copy, Community-Präsens): Marken- und teils Abmahn-Risiko
   (LEGAL REVIEW REQUIRED für Ethics + Überraschungskarte). Billigster Fix des
   ganzen Audits: streichen.
3. **Dating-Nähe:** Ja, sie ist gefährlich — „Date-Ideen + Karte + Fragen" wird
   im App-Store-Umfeld schnell als Dating-/Pärchen-Spielerei einsortiert.
   Abgrenzung: PeakPlant beginnt NACH dem Kennenlernen (bestehende Beziehung/
   Freundschaft), keine Fremd-Profile, kein Matching. Diese Abgrenzung gehört
   aktiv in Store-Listing und Website-Copy.
4. **Plattform-Verfrühung:** Kandidat-2-Positionierung vor bewiesenem Kern
   erzeugt leere Community-Flächen und bricht §1. Gegenmittel: dieses Dokument.
5. **Operative Abhängigkeiten:** unverifizierte Mail-Zustellung, ungesetzte
   Secrets (Places, WhatsApp, Spotify), Migration 0014, `dev-secret`-Fallback
   beim Unsubscribe-Token (jeder könnte jeden austragen — TECHNICAL
   REQUIREMENT). Alles dokumentierte Operator-Schritte, keine Architektur.
6. **Einzelperson-Risiko:** Redaktion (Karten, kuratierte Momente, Briefe) ist
   der wahre Engpass, nicht Technik — die leeren `LETTER_BODY['01']`-Arrays
   zeigen es bereits.
7. **Sensible Daten:** Edition 02 + Fotos = intimste Datenklasse. Die
   Schutzmechanik ist gut (Biometrie, RLS, EXIF-Strip, signierte URLs), aber
   jede künftige Cloud-/AI-Erweiterung muss gegen Manifest §2 geprüft werden.

## Competitive Differentiation

Umfeld: Fragenkarten-Decks (schön, aber ohne Gedächtnis), Paar-Apps mit
Quiz/Score-Logik (Gamification, oft Dating-nah), private Foto-Apps (Gedächtnis
ohne Anlass), Event-Plattformen (Verbindung ohne Intimität). **PeakPlants
Differenzierung ist die geschlossene Schleife Anlass→Erlebnis→Gedächtnis in
einem einzigen, privaten Raum — plus die Ehrlichkeits-Haltung als Produkt-
eigenschaft** (Provenance-Labels, keine Scores, „bemerken statt optimieren").
Verteidigbar ist das nicht durch Technik (kopierbar), sondern durch: (a) die
redaktionelle Qualität der Editionen, (b) den wachsenden privaten
Moments-Bestand pro Paar (Wechselkosten), (c) Markenvertrauen — welches genau
deshalb nie durch Fake-Claims riskiert werden darf.

## Brand Alignment

Prüfstein bleibt MANIFESTO.md; diese Strategie verschärft ihn an drei Stellen:
Außenzahlen nur belegt (Library-Zahl!), Zukunft nur im Futur (Community,
Editionen 03–12 sind Vorbild: ehrlich als `upcoming` gelabelt), North Star
misst Bemerken statt Benutzen. Visuell gilt BRAND.md (Chili in App/Karten,
monochrom-warmes Website-Chrome, eine Akzentfarbe pro Fläche).

**Produktprinzipien (aus den Brief-Kandidaten entwickelt, teils verworfen):**
1. **Die Karte funktioniert ohne die App.** (Brief-Kandidat, bestätigt.)
2. **Privat ist der Default; öffentlich ist aktiv, anonym und minimal.**
   (Manifest §2, geschärft.)
3. **Einladen, nie drängen — Retention durch Bedeutung, nicht durch Schuld.**
   (Manifest §3; ersetzt jeden Brief-Kandidaten in Richtung „Engagement".)
4. **Nichts behaupten, was der Code nicht hält — Zahlen nur belegt.**
   (Manifest §1, erweitert um Außenzahlen.)
5. **AI kuratiert Vorschläge, sie deutet keine Menschen.** (Brief-Kandidat
   „AI als Kurator, nie Therapeut", bestätigt und präzisiert: kein
   Tagebuch-Inhalt in Prompts.)
6. **Ein Fortschrittssystem pro Objekt** — Editionen sammeln, Challenges
   feiern; kein drittes. (Neu; verwirft implizit den Journeys-Kandidaten.)
7. **Erst manuell beweisen, dann bauen.** (Neu; gilt für Community, Events,
   Partnerschaften.)
8. **Jeder Screen hat eine klare Handlung in PeakPlant-Verben.** (Manifest §5.)

## Technical Implications

Keine Umbauten nötig — die Architektur trägt jede der drei Positionierungen.
Konkrete Folgen der Strategie (Reihenfolge = Priorität):
1. Operator-/Härtungsliste vor Beta: Migration 0014, secure-store (B1),
   OTP-Template, `NEWSLETTER_SECRET` setzen/Fallback entfernen, Secrets
   prüfen (`/api/health` existiert dafür).
2. Entscheidung /01: Gate bauen (Token live vorhanden) oder Copy entschärfen —
   vor Karten-Druck.
3. Kauf-Strang aktivieren: UI→`/api/checkout` verdrahten, Admin-Labels
   aktualisieren, Webhook genügt für Phase 1.
4. Minimale Auswertungsschicht für die Product Metrics (DB-Views reichen;
   kein Tracking-SDK).
5. Server-Token-Entwertung vor Skalierung des physischen Verkaufs.
6. Aufschieben, bis gebraucht: Library→DB, Push-Provider, RevenueCat,
   Live-AI-Schalter.

## Recommended Next Steps

1. **Ehrlichkeits-Sprint Website (1–2 Tage):** Versanddatum vereinheitlichen
   (PRODUCT DECISION der Gründerin), Ethics-Seite auf Belegbares kürzen,
   /members-Copy fixen, Community-Seite ins Futur, JSON-LD-Description
   aktualisieren, „14.000" nirgendwo verwenden. (LEGAL REVIEW REQUIRED
   parallel für Ethics + Überraschungskarte.)
2. **/01-Entscheidung + Einlegekarte korrigieren — vor jedem Druckauftrag.**
3. **Operator-Liste abarbeiten** (Migration 0014, Secrets, B1, OTP-Template,
   Testmail über `/api/health`).
4. **MVP-Beta starten** (Abschnitt MVP): Edition 01 drucken, 50–100 Paare,
   8 Wochen, Metriken aus Product Metrics beobachten.
5. **Positionierung als Experiment führen:** Kandidat 1 operativ fahren,
   Community-Hypothese in Phase 2 manuell testen, Entscheidung erst mit
   Beta-Daten — ausdrücklich keine Festlegung heute.
6. Danach: Roadmap-Phasen gemäß `PEAKPLANT_PRODUCT_ROADMAP.md`.

---

## Wo ich widerspreche

Der bestellte Konflikt-Abschnitt — Punkte, an denen dieses Dokument
Gründer-Ideen aus Brief/Website ausdrücklich NICHT folgt:

1. **„~14.000 Ideen":** falsch um Faktor ~10 (1.383 real, ~143 redaktionell).
   Die Zahl existiert nirgends im Repo und darf in keiner Kommunikation
   auftauchen. Das ist kein Marketing-Detail, sondern der Testfall für
   Manifest §1.
2. **„Social platform for meaningful connection IRL" als heutige
   Positionierung:** Der Code ist ein privates Tagebuch ohne jede
   Plattform-Mechanik; die Behauptung wäre größer als die Realität. Als
   Hypothese für Phase 2/3 in Ordnung — als Ist-Beschreibung nicht.
3. **Journeys als eigenes Konzept:** drittes Fortschrittssystem = Verwirrung.
   Wenn überhaupt, dann als Dramaturgie innerhalb bestehender Editionen.
4. **Die Brief-Navigation (8 Top-Level-Punkte):** verletzt Manifest §5 und
   enthält zwei Ziele ohne Substanz (Journeys, Community). Gegenvorschlag in
   `PEAKPLANT_INFORMATION_ARCHITECTURE.md`.
5. **„Vier Kontexte" als Bau-Auftrag:** with yourself und with community sind
   heute nicht implementiert und werden nicht auf Verdacht gebaut; Solo wäre
   zudem markenstrategisch fragwürdig („grow *together*").
6. **Community-Marketing im Präsens** (Live Talks, Journal-QR, Partner-
   Communities) bei 3 Subscribern und 0 Events: Dashboard-Theater. Kürzen
   oder als Absicht kennzeichnen.
7. **Exklusivitäts-Versprechen /01** ohne Gate — entweder Mechanik bauen oder
   das Versprechen streichen; ein gedruckter Fake-Claim ist irreversibel.
