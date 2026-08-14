# PeakPlant — Information Architecture (App + Website)

> Stand: 14.08.2026. Grundlage: Code-Audit von App (`mobile/`) und Website
> (Repo-Root); peak-plant.com war netzwerkgesperrt, beurteilt wurde der Code.
> Leitplanken: MANIFESTO §5 („eine klare Handlung pro Screen"), §1
> (nichts versprechen, was der Code nicht hält) und die bewusst offene
> Positionierung (Hypothese, kein Beschluss — die hier empfohlene IA
> funktioniert für alle drei Positionierungs-Kandidaten aus
> `PEAKPLANT_PRODUCT_STRATEGY.md`).
>
> Dieses Dokument ist eine Empfehlung, kein Umbau-Auftrag. Es beschreibt das
> Soll und begründet jede Abweichung vom Ist und vom Brief.

---

## Teil 1 — App

### 1.1 Ist-Zustand (Code, nicht Doku)

`app/(tabs)/_layout.tsx:36-91`:

- **Sichtbare Tabs (5):** Home („Together") · Moments · Discover · Story ·
  Collection (Route `editions`)
- **Versteckt, aber navigierbar:** `community` (in Wahrheit die Orte-Karte),
  `profile`, `scan`; `grow` und `us` sind Legacy-Redirects.
- `mobile/AGENTS.md:66-68` beschreibt eine andere (veraltete) Tab-Struktur —
  der Code gilt.

### 1.2 Prüfung der Brief-Navigation — NICHT übernehmen

Vorschlag des Briefs: Home / Discover / Spaces / Journeys / Moments / Map /
Community / Profile — **8 Top-Level-Ziele**. Ablehnung im Einzelnen:

| Brief-Item | Urteil | Begründung |
|---|---|---|
| Home | behalten | deckt sich mit Ist („Together") |
| Discover | behalten | deckt sich mit Ist |
| Spaces | **kein Tab** | Ein Space ist der *Kontext*, in dem man ist, kein Ort, den man besucht. Multi-Space existiert (Code: Space-Switcher-Pattern) — das gehört als Umschalter in den Header von Home, nicht in die Tab-Leiste. Ein „Spaces"-Tab wäre meist ein Ein-Eintrag-Bildschirm. |
| Journeys | **kein Tab** | NOT IMPLEMENTED — es gibt kein Journeys-Konzept im Code, und die Strategie verwirft es als drittes Fortschrittssystem. Ein Tab auf ein Nicht-Feature ist die härteste Form von Manifest-§1-Verstoß. |
| Moments | behalten | deckt sich mit Ist; der emotionale Kern |
| Map | **kein eigener Tab** | Die Karte ist ein *Modus des Entdeckens*, kein eigenes Ziel; als Unterfläche von Discover (heute schon so erreichbar) bleibt der Loop discover→choose an einem Ort. Ein Map-Tab würde mit Discover ums selbe Bedürfnis konkurrieren („wohin heute?") — genau die Mehrdeutigkeit, die §5 verbietet. |
| Community | **noch kein Tab** | Feed/Events sind `'soon'`-Flags ohne Implementierung (`lib/features.ts:70-87`). Ein leerer Community-Tab wäre Dashboard-Theater. Erst wenn Phase 2 manuell Substanz bewiesen hat UND ein Feature existiert, verdient es Sichtbarkeit. |
| Profile | **kein Tab** | Einstellungen/Profil sind seltene Handlungen — Avatar-Zugang im Header genügt (heute schon versteckte Route). Ein Tab-Platz ist zu teuer dafür. |

8 Tabs verletzen zudem jede Plattform-Konvention (iOS-Empfehlung ≤5) und
verteilen die Aufmerksamkeit, die der eine Kern-Loop braucht.

### 1.3 Empfohlene App-IA (nah am Ist — der Ist-Zustand ist fast richtig)

**Tab-Leiste (5, unverändert in der Reihenfolge):**

1. **Home (Together)** — der Puls des Space: Today's Moment, Weekly
   Challenge, Streak-Banner (abschaltbar), Partner-Notizen. Im Header:
   Space-Switcher (couple/friends) und Profil-Avatar. Primäraktion des
   leeren Zustands: „START TOGETHER" (Space anlegen/beitreten).
2. **Moments** — Monats-Album, Biometrie-Gate, freier Moment ohne Karte.
   Primäraktion: „PRESERVE THIS MOMENT".
3. **Discover** — Ideen-Bibliothek + Recommender + **Karte als Ansichts-
   Umschalter (Liste ⇄ Map)** statt verstecktem Pseudo-„community"-Tab.
   Saved Dates als Unterbereich (idea→saved→planned→completed bleibt an
   einem Ort).
4. **Story** — die gezählten, nie erfundenen Beobachtungen; später
   Jahres-Rückblick.
5. **Collection** — Editionen/Decks, Fortschritt „N von 20 bewahrt",
   Roadmap-Editionen ehrlich als `upcoming`.

**Aktionen statt Ziele:** Scan bleibt kein Tab, sondern eine prominente
Aktion (Kamera-Button auf Home/Collection + Universal-Links `/c/`, `/i/`).
Man „geht" nicht zum Scannen — man scannt eine Karte, die man in der Hand
hält.

**Konkrete Abweichungen vom Ist (klein, alle begründet):**
- Route `community` → `places` umbenennen und als Map-Ansicht in Discover
  einhängen. Der heutige Name lügt doppelt: er verspricht Community (nicht
  implementiert) und versteckt eine gute Karte hinter falschem Etikett.
  Der Name „community" wird frei für das echte Feature, wenn es je kommt.
- Legacy-Redirects `grow`/`us` entfernen (toter Code, kein Nutzerpfad).
- `profile` bleibt Header-Ziel; Rituale erscheinen erst mit aktiviertem Flag.

**Reserviert (nicht bauen, nur Platz denken):** Sollte Phase 2/3 Community
oder Events beweisen, ersetzt EIN neues Ziel im Zweifel „Story" als Tab
(Story kann in Moments aufgehen) — es wird nie ein sechster Tab angebaut.

### 1.4 Onboarding-Pfad (IA-relevant)

Onboarding endet nicht auf einem Dashboard, sondern im vollzogenen Loop:
Auth (OTP) → Space anlegen ODER Code beitreten (expliziter Fork, existiert:
`app/(auth)/invite.tsx`) → erste Karte (Demo-Karte existiert) → erster
bewahrter Moment → Home. Gefühl: „wir haben einen gemeinsamen Ort angelegt",
nicht „ich habe eine App installiert".

---

## Teil 2 — Website

### 2.1 Ist-Zustand

- **Nav (`lib/translations.ts`, NavBar):** Intimacy · Philosophy ·
  Values(/ethics) · Shop · Community + persistenter Waitlist-CTA +
  Sprachwechsel.
- **Nicht in der Nav:** /about, /journal (nur Footer), /letters, /beta,
  /login, /members, /01 (öffentlich UND in der Sitemap, obwohl als
  „exklusiv" verkauft).
- **Drei Erzählungen übereinander:** Kartenset (Homepage/Shop), Intimacy-Erbe
  (JSON-LD „premium intimacy brand", Intimacy/Philosophy/Ethics),
  Community/IRL (Community-Seite, /members). Vier sprachliche Versprechen
  („Warteliste", „Inner Circle", „Beta-Liste", „sag mir bescheid") münden in
  dieselbe `subscribers`-Tabelle.

### 2.2 Empfohlene Website-IA

Prinzip: **Die Nav erzählt genau eine Geschichte** — das Produkt und die
Menschen dahinter. Nebenflächen existieren weiter, aber als Unterbau, nicht
als gleichrangige Nav-Ziele.

**Hauptnavigation (5 + Login):**

| Nav-Punkt | Route | Inhalt |
|---|---|---|
| das set | `/[locale]` (Anker) bzw. `/shop` | Produkt-Story, Editionen, Kauf/Waitlist |
| warum | `/[locale]/philosophy` | Philosophy als Haupttext; Intimacy-Inhalte als Kapitel hierunter konsolidieren |
| journal | `/journal` | Essays + Briefe (Letters hier einhängen, s. 2.4) |
| über uns | `/[locale]/about` | Gründerinnen-Story — gehört in die Nav: bei einer Vertrauens-Marke ist „wer macht das?" eine Hauptfrage, kein Footer-Thema |
| community | `/[locale]/community` | EINE Route mit zwei Zuständen (s. 2.3) |
| login → | `/login` | dezent rechts, wie App-Konventionen |

Der persistente Waitlist-CTA bleibt; die Sprache wird auf EIN Versprechen
vereinheitlicht (Empfehlung: „auf die liste" — ehrlich, unaufgeregt; „Inner
Circle" und „Beta" werden Quell-Tags im Backend, keine eigenen Versprechen).

**Aus der Nav entfernt, mit Begründung:**
- **Intimacy als eigener Punkt:** stärkster Text der Site, aber als
  Nav-Gleichrangiger hält er die dritte Erzählung (Intimacy-Brand-Erbe) am
  Leben und enthält toten Code (nie gerenderte „Vier Phasen"). Als Kapitel
  unter „warum" bleibt der Text erhalten, ohne die Marke zu spalten.
- **Values/Ethics:** bleibt als Seite erreichbar (Footer), kommt aber erst
  zurück in die Nav, wenn die Claims belegt sind (Phase 0). Eine Werte-Seite
  mit unbelegten Siegeln in der Hauptnavigation ist das Gegenteil ihres
  Zwecks.

### 2.3 Die Community-Doppelstruktur auflösen (Kernvorschlag)

**Problem (Ist):** Zwei „Communities" mit verschiedener Mechanik —
`/[locale]/community` (Marketing; „Inner Circle beitreten" = Waitlist-
Eintrag; unbelegte Präsens-Versprechen) und `/login`+`/members` (echter
Account, WhatsApp-Link, Briefe). Die Nav zeigt nur die alte; die neue ist
fast unauffindbar. Zwei Flächen behaupten dasselbe Wort und halten
Verschiedenes.

**Vorschlag: EINE Route `/[locale]/community` mit zwei ehrlichen Zuständen.**

- **Ausgeloggt:** Was die Community heute WIRKLICH ist (WhatsApp-Gruppe,
  Monatsbrief, kommende Deck-Abende als klar gekennzeichnete Absicht im
  Futur) + zwei Aktionen: „anmelden" (→ /login) und „auf die liste".
  Alle unbelegten Präsens-Versprechen (Live Talks, Journal-QR,
  Partner-Communities) werden gestrichen oder ins Futur gesetzt (Phase 0).
- **Eingeloggt:** die heutigen /members-Inhalte — WhatsApp-Zugang, Briefe,
  Kacheln. `/members` wird Redirect auf `/community` (Link-Stabilität),
  `/login` bleibt eigenständig (Auth-Fläche, kein Inhalt).

**Begründung:** (a) Ein Wort, eine Fläche, ein Wahrheitszustand — die
Marketing-Seite kann nicht mehr Dinge versprechen, die der Mitgliederbereich
nicht hält, weil es dieselbe Seite ist. (b) Der Weg Besucher→Mitglied wird
ein einziger Klickpfad statt zweier Parallelwelten. (c) Es ist die billigste
Lösung: Inhalte existieren beidseitig, es fehlt nur die Zusammenführung und
ein Redirect. (d) Sie ist positionierungs-neutral: Wächst die Community
(Phase 2), wächst die eingeloggte Hälfte; wird die Hypothese verworfen,
bleibt eine ehrliche kleine Seite.

### 2.4 Weitere Konsolidierungen

- **Drei Brief-Systeme → eins:** `/letters`-Archiv, die hardcodierten
  „briefe" auf /01 und der real versendete Monatsbrief
  (`/api/newsletter/send`) erzeugen drei verschiedene Inhalte unter einem
  Begriff. Soll: Der versendete Monatsbrief IST der Brief; `/letters`
  archiviert genau ihn (unter /journal einhängen); der /01-Briefblock
  verweist dorthin statt eigenen Text zu halten. Brief 01 bekommt vor
  Verlinkung echten Text (heute `LETTER_BODY['01'] = []`).
- **/01:** Entweder Gate (Token existiert live in `orders.access_token`,
  wird heute nie gelesen) + Raus aus der Sitemap — oder ehrlich als
  öffentliche Editions-Seite `/edition-01` führen, ohne Exklusivitäts-Copy
  in Mails und auf der Druckkarte. Entscheidung ist Phase 0; die IA
  funktioniert mit beiden, nicht aber mit dem Ist (öffentlich + „exklusiv").
- **Fragen-Duplikat:** die 10 Growing Questions sind zweimal wortgleich
  hardcodiert (Homepage + /01) — eine Quelle, zwei Verwender.
- **Footer:** eine Footer-Welt statt zwei (SiteFooter vs. Shop-Dark-Footer);
  Footer trägt: about, ethics/values, journal, beta, Rechtliches, Sprache.
- **Rechtliches** (Impressum, Datenschutz, AGB) bleibt Footer-only; DE-only
  ist ein bekannter Zustand (LEGAL REVIEW REQUIRED, ob EN-Pflichtseiten
  nötig sind — keine Rechtsberatung hier).

### 2.5 Sitemap Soll (kompakt)

```
/                       Home (eine Erzählung: Set + App + Menschen)
/shop                   Produkt/Kauf bzw. Waitlist-Modus
/[locale]/philosophy    warum (inkl. Intimacy-Kapitel)
/journal                Essays + Brief-Archiv (letters)
/[locale]/about         über uns
/[locale]/community     EINE Community-Fläche (aus/eingeloggt)
/login                  Auth (signup/reset)
/beta                   Beta-Zugang (bleibt, vorbildlich ehrliche Copy)
/edition-01 | /01+Gate  je nach Phase-0-Entscheidung
Footer: /ethics, Rechtliches, /unsubscribe
Redirects: /members → /community; /bestellen → /shop (existiert)
```

---

## Teil 3 — Ein Satz zur Kohärenz App ↔ Website

App und Website erzählen denselben Loop in derselben Reihenfolge: **Anlass
(Karte/Discover) → Erlebnis → bewahrter Moment → wachsendes Gedächtnis** —
die Website verkauft den Einstieg in diesen Loop, die App lebt ihn, und
„Community" ist auf beiden Flächen genau so groß, wie sie wirklich ist.
Jede IA-Änderung, die diesen Satz bricht (ein Journeys-Tab, ein leerer
Community-Tab, eine „exklusive" öffentliche Seite), ist abzulehnen —
unabhängig davon, welcher Positionierungs-Kandidat am Ende gewinnt.
