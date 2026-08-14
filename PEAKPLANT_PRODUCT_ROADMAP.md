# PeakPlant — Product Roadmap

> Stand: 14.08.2026. Abgeleitet aus dem vollständigen Code-Audit (Website im
> Repo-Root, App unter `mobile/`, Live-DB `kmlqjmxkcnkfwsbptvuc` nur lesend)
> und aus `PEAKPLANT_PRODUCT_STRATEGY.md`. Grundregel der Roadmap: **Jede Phase
> muss etwas beweisen, bevor die nächste baut.** Kein Feature wird gebaut, das
> nicht auf einer belegten Erkenntnis der Vorphase steht — die Ausgangslage ist
> ein zu ~80 % gebautes, zu 0 % validiertes Produkt (0 Bestellungen,
> 3 Subscriber, 0 produktive App-Datensätze).
>
> Positionierung bleibt in allen Phasen HYPOTHESE (Wunsch der Gründerin):
> operiert wird als physisch-digitale Ritual-Marke; die Plattform-Hypothese
> wird in Phase 2/3 *gemessen*, nicht vorweggenommen.
>
> Zeitangaben sind Aufwands-Schätzungen, keine Termine. Labels wie im Audit:
> TECHNICAL REQUIREMENT / PRODUCT DECISION / LEGAL REVIEW REQUIRED.

---

## Phase 0 — Audit & Ehrlichkeit (jetzt; ~1–2 Wochen Arbeit)

**Ziel:** Außenkommunikation und Betrieb stimmen mit dem überein, was der Code
hält. Kein Neubau — Streichen, Korrigieren, Härten.

**Nutzerwert:** Wer heute auf die Website trifft oder als Erste:r kauft,
bekommt nur Versprechen, die eingelöst werden. Vertrauen ist das einzige
Kapital vor dem Launch.

**Features (fast alles ist Text, kein Code):**
- Versanddatum vereinheitlichen — „october 2026" vs. „ships mid-august" auf
  derselben Shop-Seite (`app/shop/page.tsx:135` vs. `:373`). PRODUCT DECISION
  der Gründerin, dann eine Quelle der Wahrheit.
- Ethics-Seite auf Belegbares kürzen (Blauer Engel / DHL GoGreen /
  Druckerei-Nennung widersprechen dem eigenen „Grenzen"-Block). LEGAL REVIEW
  REQUIRED parallel; der innere Widerspruch fällt unabhängig davon.
- /01-Entscheidung: Zugangs-Gate bauen (Token liegt live ungenutzt in
  `orders.access_token`) ODER Exklusivitäts-Copy aus Mails, Success-Seite und
  Einlegekarten-Druckvorlage streichen (`app/admin/card/page.tsx:82`) —
  **zwingend vor jedem Druckauftrag**, Gedrucktes ist nicht patchbar.
- /members-Copy fixen („sechsstelliger code, kein passwort" vs. gebautem
  Passwort-Login), Community-Seite ins Futur setzen (Live Talks, Journal-QR,
  Partner-Communities sind unbelegt), JSON-LD-Description von „premium
  intimacy brand" auf die aktuelle Erzählung heben (`app/layout.tsx:10`).
- „~14.000 Ideen" aus jeder Kommunikation streichen; ehrlich sagbar: „über
  1.200 durchsuchbare Ideen, davon ~110 handkuratiert".
- Überraschungskarten-Versprechen: Mechanik klären oder streichen
  (Gewinnspiel-Charakter: LEGAL REVIEW REQUIRED).

**Technische Arbeit (Operator-/Härtungsliste, alles dokumentierte Schritte):**
- Migration `0014_join_and_delete_hardening.sql` auf Prod anwenden (liegt im
  Repo, live fehlt sie — zwei gefixte Bugs sind live nicht wirksam).
  TECHNICAL REQUIREMENT.
- `NEWSLETTER_SECRET` in Prod setzen bzw. `'dev-secret'`-Fallback entfernen
  (sonst sind Abmelde-Token fälschbar). TECHNICAL REQUIREMENT.
- `expo-secure-store`-Härtung (B1) vor Store-Submission; Supabase-OTP-Template
  mit `{{ .Token }}` prüfen; Secrets-Check via `/api/health?testmail=`
  (Mail-Zustellung war aus dem Audit heraus nicht verifizierbar).
- SHOP_SETUP.md auf Code-Stand bringen (beschreibt noch Kondom-Abos und ein
  /01-Gate, das nicht existiert); Admin-Label/QTY-Maps um `pack_3`/`pack_12`
  ergänzen; toten Code der Intimacy-„Phasen" entscheiden (zeigen oder
  entfernen).

**Abhängigkeiten:** Gründerinnen-Entscheidungen (Datum, /01, Überraschungs-
karte, Positionierungs-Betriebsmodus); externes Rechts-Review für Ethics und
Gewinnspiel; Zugang zu Vercel/Supabase-Env (aus dem Audit nicht prüfbar).

**Erfolgsmetriken:** Null unbelegte Claims auf Website/Karte/Mails (Prüfung
gegen Inventar-Liste); Testmail über `/api/health` grün; Prod-Migrationsliste
endet bei 0014; Druckvorlage freigegeben.

**Ausdrücklich ausgeschlossen:** jedes neue Feature, jedes Redesign, jede
neue Dependency, Community-/Event-Bau, AI-Änderungen.

---

## Phase 1 — MVP: Kern-Loop beweisen (~8 Wochen Beta)

**Ziel:** Die eine Kernhypothese validieren: *Karte → gemeinsamer Moment →
Foto+Notiz → wachsendes Tagebuch → Wiederkommen* — mit 50–100 echten,
möglichst zahlenden Paaren. Das MVP ist überwiegend **kein neuer Code**,
sondern Druck + Vertrieb + Beobachtung.

**Nutzerwert:** Edition 01 physisch in der Hand (eigenständig wertvoll, ohne
App nutzbar); App als privates gemeinsames Gedächtnis (Space, Moments,
Story, Weekly Challenge — alles EXISTS AND WORKS).

**Features:**
- Edition 01 drucken (nach Phase-0-Copy-Freigabe) und verkaufen: entweder den
  existierenden Stripe-Strang (`/api/checkout` — BACKEND ONLY) mit UI
  verdrahten oder bewusst manuell per Rechnung (`/api/admin/invoice` existiert).
- Onboarding auf „erste 10 Minuten" zuspitzen: Space anlegen/beitreten →
  Demo-/erste Karte → ersten Moment bewahren (alle drei Bausteine existieren;
  nur der Pfad wird geführt).
- Beta-Zugang über die bestehende `/beta`-Waitlist.

**Technische Arbeit:**
- Kauf-UI → `/api/checkout` (oder dokumentierter manueller Prozess); Webhook
  genügt für Phase 1.
- Minimale Auswertungsschicht für die Product Metrics: DB-Views/Abfragen auf
  `memories`, `space_members`, `card_activations`, `orders` — **kein
  Tracking-SDK** (bewusst datensparsam; heute misst die App nichts).
- /01-Gate umsetzen, falls in Phase 0 so entschieden.

**Abhängigkeiten:** Phase 0 vollständig (v. a. Druckfreigabe, Migration 0014,
Mail-Zustellung); reale Druck-/Fulfilment-Stückkosten vor Preisfestlegung
(25–50 € ist Hypothese); App-Store-/TestFlight-Weg inkl. B1-Härtung.

**Erfolgsmetriken (space-zentriert, DB-seitig messbar):**
- Aktivierung: % neuer Spaces mit 2 Mitgliedern UND ≥1 Moment binnen 7 Tagen.
- Space-Retention W4 (≥1 Moment im Fenster) — die eigentliche Beweismetrik.
- Physisch→Digital-Brücke: % verkaufter Decks mit ≥1 Karten-Aktivierung
  binnen 30 Tagen.
- Bestellungen > 0; Waitlist→Kauf-Conversion.
- Guardrails: Streak-Abschaltquote, Löschquote.

**Ausdrücklich ausgeschlossen:** Community-Features und Events (auch keine
„coming soon"-Flächen nach außen), AI in Discover/Home (bleibt
deterministisch), Push (frühestens Ende Beta), Journeys, Solo-/Family-Kontext,
Monetarisierungs-Schalter/RevenueCat, Memory-Print, Library→DB, Web-App.

---

## Phase 2 — Community: verdienen, nicht bauen (nach belegter Beta-Retention)

**Ziel:** Die Community-Hypothese (und damit den Kern der Plattform-
Positionierungs-Hypothese) mit den **billigsten echten Mitteln** testen —
manuell, ohne neuen Produkt-Code für Feed/Events.

**Nutzerwert:** Wer mehr will als das private Tagebuch, bekommt echte
Anschlussmöglichkeiten: eine lebendige WhatsApp-Gruppe, reale Deck-Abende,
Nachschub (Edition 02), sanfte Einladungen statt Stille.

**Features:**
- WhatsApp-Community aktivieren: `WHATSAPP_COMMUNITY_URL` setzen — die
  komplette Mechanik (`/members`, JWT-geprüfte API) existiert bereits.
- 2–3 **manuell** gehostete Deck-Abende (Format „Edition auf dem Tisch");
  Erkenntnisse dokumentieren, bevor je ein Event-Feature entsteht.
- Edition 02 „Soft & Wild" verkaufen (Content fertig, Biometrie-Gate fertig);
  friends-Content ausbauen (heute paar-lastig: 84 couple-only-Einträge) —
  Engpass ist Redaktion, nicht Technik.
- Push-Notifications als *Einladung* bauen (heute Null-Provider — das einzige
  echte neue Feature dieser Phase): „Partner hat einen Moment bewahrt",
  „Weekly Challenge startet". Manifest-§3-Regeln hart: keine Guilt-Trips,
  Frequenz-Obergrenze, granular abschaltbar.
- Optional: Rituale-Flag von `'soon'` auf aktiv (Screen + lokales Repo
  existieren), wenn Beta-Feedback es trägt.

**Technische Arbeit:** Push-Provider (Expo Notifications) + Opt-in-Flows;
Env-Var-Pflege; Redaktions-Pipeline für Briefe/Content (die leeren
`LETTER_BODY['01']`-Arrays sind ein Redaktions-, kein Technik-Problem).

**Abhängigkeiten:** Phase-1-Retention belegt (ohne sie ist Community-Aufbau
Fassade); genügend Beta-Nutzer in erreichbarer Nähe für Deck-Abende;
Gründerinnen-Zeit als Host.

**Erfolgsmetriken:** Wiederkehr ohne Einzel-Einladung (organische
WhatsApp-Aktivität); Deck-Abend-Auslastung und Wiederkommer-Quote;
Edition-02-Wiederkaufsrate bestehender Käufer; Push-Opt-out-Rate als
Guardrail (< definierter Schwelle, sonst Frequenz senken).

**Ausdrücklich ausgeschlossen:** In-App-Feed, öffentliche Profile,
Event-System im Code, Partner-/Ambassador-Programme, „Social platform"-
Außenclaim (bleibt Hypothese, bis diese Phase Daten liefert).

---

## Phase 3 — AI + Map (nach deterministischer Baseline)

**Ziel:** Entdeckung persönlicher und örtlicher machen, ohne die zwei
Verfassungsgrenzen zu reißen: AI ist Kurator (nie Therapeut, nie
Tagebuch-Leser), Moments bleiben privat.

**Nutzerwert:** Bessere „eine gute Idee statt 1.000 Optionen"-Treffer; die
eigene Geschichte wird räumlich sichtbar („Map of Moments") — privat, für
den Space.

**Features:**
- `liveRecommendations`-Kill-Switch aktivieren: Claude re-rankt kuratierte
  Kandidaten (Edge Function `discover` ist deployed und ACTIVE, erfindet nie
  Venues) — erst nachdem der deterministische Recommender Baseline-Daten
  geliefert hat, sonst ist „AI-personalisiert" eine leere Behauptung.
- **Map of Moments statt Maps-Klon:** bewahrte Momente optional (opt-in pro
  Moment) auf der privaten Space-Karte verorten; öffentliche Schicht bleibt
  ausschließlich die anonyme Spot-Bewertung. Kein globaler Momente-Layer.
- Spot-Dichte in 1–2 Pilotstädten gezielt aufbauen (der einzige echte
  Daten-Netzwerkeffekt im Ist-Code).
- Journeys **nur** als Dramaturgie innerhalb einer Edition (3 Akte,
  Abschluss-Moment), falls Phase-1/2-Daten Bedarf zeigen — kein drittes
  Fortschrittssystem neben Deck-Fortschritt und Challenge-Badges.
- Events produktisieren, **falls** Phase 2 sie manuell bewiesen hat (sonst
  entfällt der Punkt ersatzlos).

**Technische Arbeit:** Serverseitige Einmal-Token-Entwertung (heute nur
gerätelokal, `qr.ts:17-19`) — TECHNICAL REQUIREMENT **vor** Skalierung des
physischen Verkaufs; Karten-Layer für verortete Momente (Migration nötig,
additiv); A/B-Fähigkeit deterministisch vs. AI-Re-Ranking; Places-Budget-
Überwachung (Budget+Cache existieren).

**Abhängigkeiten:** Baseline-Daten aus Phase 1/2; Supabase-Secrets
`ANTHROPIC_API_KEY` / `GOOGLE_PLACES_API_KEY` gesetzt und budgetiert;
Datenschutz-Prüfung der Standort-Speicherung VOR dem Bau (LEGAL REVIEW
REQUIRED für Geodaten an Momenten).

**Erfolgsmetriken:** Save-/Completion-Rate AI vs. deterministisch (das
AI-Feature muss sich gegen die Baseline beweisen, sonst fliegt es wieder
raus); Opt-in-Quote Momente-Verortung; Spot-Tipps pro Pilotstadt;
Erklärbarkeits-Abdeckung bleibt 100 % (`signalsUsed`).

**Ausdrücklich ausgeschlossen:** Tagebuch-Inhalte (Fotos, Notizen) in
AI-Prompts; Beziehungs-Deutung, Stimmungs-Scores; öffentliche/geteilte
Momente-Karten; Chat-Therapeut; automatische Buchungen.

---

## Phase 4 — Monetarisierung (nach bewiesener M3-Retention)

**Ziel:** Wiederkehrenden Umsatz auf ein Produkt setzen, das nachweislich
gehalten wird — nicht vorher. „Ein Abo auf ein unbenutztes Tagebuch ist
unverkäuflich."

**Nutzerwert:** Der Kern-Loop (Karte, Moment, Tagebuch) bleibt **vollwertig
gratis** — ein bezahltes Erinnerungs-Gedächtnis wäre erpresserisch und
markenwidrig. Plus bündelt Mehr-Wert: zusätzliche digitale Editionen,
AI-Komfort, Multi-Space-Komfort, später Print-Vorteile.

**Features:**
- PeakPlant+ (Preis-Hypothese 4,99–6,99 €/Monat; final mit echten Daten):
  Paywall-Screen existiert (`plus.tsx`), `MONETIZATION_ENABLED` einschalten.
- Paywall-Grenze als PRODUCT DECISION **mit Nutzungsdaten** aus Phase 1–3,
  nicht am Reißbrett.
- Memory-Print: **weiterhin nur dokumentieren, nicht bauen** (Brief-Vorgabe,
  geteilt) — sinnvoll erst, wenn Spaces volle Alben haben; dann als „Ernte"
  der Moments spezifizieren.

**Technische Arbeit:** RevenueCat installieren (Checkliste existiert im
Repo), `entitlements`/`ai_allowance`/`ai_usage` verdrahten (Tabellen liegen
live bereit, unbenutzt), Store-Compliance (Restore, Familienfreigabe,
Kündigungs-Flows).

**Abhängigkeiten:** M3-Space-Retention über definierter Schwelle; genug
aktive Spaces für aussagekräftige Conversion-Messung; App-Store-Review.

**Erfolgsmetriken:** Free→Plus-Conversion; Plus-Churn; ARPU; **Guardrail:**
North Star (aktive Spaces) darf durch die Paywall nicht sinken — tut er es,
ist die Grenze falsch gezogen.

**Ausdrücklich ausgeschlossen:** Bezahlschranke vor Moments/Tagebuch/Kern-
Loop; Werbung; Datenverkauf (bricht Manifest §2 endgültig); Print-Pipeline;
Dark Patterns (Countdown-Angebote, Kündigungs-Hürden).

---

## Phase 5 — Skalierung (nach funktionierendem Geschäftsmodell)

**Ziel:** Das Bewiesene vervielfachen — mehr Editionen, mehr Städte, mehr
Kanäle — und **erst jetzt** die Positionierungs-Frage (Ritual-Marke vs.
Plattform) mit echten Daten entscheiden.

**Nutzerwert:** Nachschub (Editionen 03+ aus der ehrlich gelabelten
Roadmap), Geschenk-Flows (Deck schenken inkl. App-Einstieg für Beschenkte),
ggf. Host-Formate und lokale Tiefe in mehr Städten.

**Features:**
- Editionen 03+ (Redaktion ist der Engpass — Redaktionskapazität ist die
  eigentliche Skalierungs-Investition, nicht Server).
- Geschenk-Mechanik als wichtigster Wachstumskanal (Geschenk-Viralität ist
  der glaubwürdigste „Netzwerkeffekt" des Produkts).
- Host Pro / Ticket-Events, **falls** Phase 2/3 Events getragen haben.
- Partnerschaften (Orte, Marken) — erst jetzt existiert Reichweite als
  Verhandlungsmasse.
- Experience Library → Supabase-Tabelle, **falls** Website/Redaktion/weitere
  Produkte sie brauchen (heute liegt sie komplett im App-Bundle);
  Wachstum der Library nur durch handgeschriebene Families/kuratierte
  Momente, nie durch weitere kombinatorische Achsen.
- Ggf. Web-Version der App, Lokalisierung über DE/EN hinaus.

**Technische Arbeit:** Fulfilment-Skalierung (Logistik-Partner, Admin-
Ausbau), Library-Server-Repräsentation, Observability/Support-Werkzeuge,
Internationalisierung.

**Abhängigkeiten:** alle vorigen Phasen; belegte Unit Economics des
physischen Produkts; Redaktions-Team über die Gründerin hinaus
(Einzelperson-Risiko aus dem Strategy-Dokument).

**Erfolgsmetriken:** North-Star-Wachstum (aktive Spaces) bei stabilen
Guardrails; Geschenk-Quote (% Käufe als Geschenk, Einlöse-Quote der
Beschenkten); Deckungsbeitrag pro Edition; Wiederkaufsrate über Editionen.

**Ausdrücklich ausgeschlossen (dauerhaft, alle Phasen):** Feed von
Paar-Momenten; Beziehungs-Scores und Kompatibilitäts-Metriken; Dating-/
Matching-Funktionen; automatisch handelnde AI; erfundene Zahlen in der
Außenkommunikation. Diese Liste ist Verfassung (Manifest §1–§3), nicht
Phasen-Priorisierung.

---

## Querschnitt: Was jede Phase gates

| Übergang | Beweis, der vorliegen muss |
|---|---|
| 0 → 1 | Alle Außen-Claims belegt oder gestrichen; Druckvorlage freigegeben; Operator-Liste grün |
| 1 → 2 | Space-Retention W4 belegt; erste zahlende Käufer; Physisch→Digital-Brücke messbar |
| 2 → 3 | Community-Signale real (Wiederkehr ohne Einladung); deterministische Recommender-Baseline steht |
| 3 → 4 | M3-Retention über Schwelle; AI schlägt Baseline oder ist wieder aus |
| 4 → 5 | Free→Plus-Conversion + physische Unit Economics tragen |

Wird ein Gate nicht erreicht, wird die Phase nicht „trotzdem" begonnen —
dann ist die richtige Arbeit, die Vorphase zu reparieren oder die Hypothese
ehrlich zu verwerfen.
