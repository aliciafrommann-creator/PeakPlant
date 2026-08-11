# PeakPlant App — Design-Nordstern

> Adaptiert aus Alicias Master-Brief (11.08.2026, inkl. ChatGPT-Referenz-Mock
> „Alicia & Jonas"-Home). Dieses Dokument ist die **verbindliche Richtung** für
> jede Design-/Produktarbeit an der App. Wo der Brief dem `../MANIFESTO.md`
> widerspricht, gewinnt das Manifest — die Abweichungen sind unten explizit.

## Die Produktidee (der Kern, immer wieder vorlesen)

**PeakPlant ist ein System, das echte Beziehungsmomente in eine lebendige
digitale Erinnerung verwandelt.** Kein „Paar-App mit Fragen". Ein privates
soziales Netzwerk für zwei Menschen, das mit der Zeit wertvoller wird, weil es
ihre gemeinsame Geschichte enthält.

Der geschlossene Loop:

```
PHYSISCH   Karte → gemeinsames Erlebnis → QR
DIGITAL    Moment → Foto + Notiz → Timeline → Collection → Story
NÄCHSTER   Empfehlung → neue Karte → neues Erlebnis
```

**Nordstern-Metrik:** *Meaningful Moments pro Paar pro Monat* — nie DAU.
Das Ziel ist nicht Zeit in der App, sondern zwei Menschen raus aus dem Handy
und in einen Moment — und danach ein schöner Ort, ihn zu behalten.
**Die UI verschwindet, wenn der Moment beginnt.**

## Qualitätslatte (Referenzen für Craft, nie zum Kopieren)

Strava (Fortschritt/History) · Instagram (müheloses Festhalten, visuelle
Hierarchie) · Spotify (Personalisierung, saisonale Welten) · Apple (Ruhe,
Motion, Restraint). Übersetzt, nie kopiert: „12 km gelaufen" → „12 Momente
zusammen geschaffen".

## Visual North Star

**Ein privater digitaler Garten für zwei.** Warm + editorial + intim + premium
+ natürlich + ruhig. Kinfolk × Aesop × Apple — mit der Produktklarheit von
Strava. NIEMALS: pink-lila Couple-App, Herzen überall, Cartoon-Paare,
Confetti-Gamification, SaaS-Dashboard.

- **Farbe:** bestehende Tokens (`constants/colors.ts`) — warm stone Basis,
  Farbe kommuniziert Edition/Zustand/Stimmung, nie Dekoration. Hero-Karten:
  warme dunkle Tints + Kategorie-Bloom (siehe Home `heroTint`).
- **Typografie — ENTSCHIEDEN (11.08., Alicia):** geometrisch modern-clean,
  „am liebsten Futura, mit etwas Abstand". Umgesetzt: **Futura auf iOS**
  (systemseitig, Medium-Schnitt), System-Sans auf Android, leicht positives
  Letter-Spacing statt enger Setzung — Website nutzt denselben Futura-Stack.
  Serif (aus dem Referenz-Mock) ist damit vom Tisch. Android-Parität später
  optional über gebundeltes Jost (freies Futura-Pendant).
- **Fotografie:** echt, warm, unperfekt — Hände, Kochen, Spaziergänge, chaotische
  Tische. Nie Influencer-Paare. Die App hat (noch) keine Lifestyle-Assets:
  Momente zeigen die ECHTEN Fotos des Paars; Vorschlags-Karten nutzen bis dahin
  warme Tints + Bloom statt Fake-Fotos (Manifest §1: nichts Erfundenes).
- **Physisches Produkt sichtbar:** Karten-Artwork, Papier-Texturen, die Karte
  als Objekt (Schatten, Tiefe) — die App ist das digitale Gegenstück des Decks.

## Informationsarchitektur (Ziel vs. heute)

Ziel-Navigation aus dem Brief: **HOME · MOMENTS · DISCOVER · STORY · COLLECTION**

| Ziel | Heute | Migrationsweg |
|---|---|---|
| HOME | home | ✅ Umbau läuft (Greeting, Today's Moment, Your Story, Coming Up) |
| MOMENTS | Feed lebt in home | später eigener Tab: der editoriale Zwei-Personen-Feed |
| DISCOVER | discover | ✅ bleibt; Places-Funktionen wandern perspektivisch hierher (finden) |
| STORY | — | neu: Timeline · Karte · Kalender · poetische Stats (aus community-Map + Profil-Statistik) |
| COLLECTION | editions | umbenennen + Karten-Grid (erledigt sichtbar, offene subtil) |
| profile | profile | wird Header-Avatar → Einstellungen (kein eigener Tab im Zielbild) |

Nicht big-bang umbauen — Screen für Screen, jede Stufe grün verifiziert.

## Die 8 Kern-Screens (Reihenfolge der Umsetzung)

1. **Home** ← IN ARBEIT: Greeting („GUTEN ABEND / name"), Today's-Moment-Hero
   (eine Idee, große Typo, ein Pfeil), Your Story (Momente/Dates/Orte/Karten —
   nur echte Zahlen), Recent Memory, Coming Up (nächster Plan), Weekly-Hub.
2. **QR-Magie (Scan → Karte):** „IHR HABT DIESEN MOMENT GEMACHT." — Karten-
   Artwork erscheint, botanische Mikro-Animation, dann Capture. Apple-Motion,
   kein Confetti.
3. **Capture:** < 30 Sekunden. Foto groß, eine Frage („wie wollt ihr euch daran
   erinnern?"), optional Ort/Datum, FESTHALTEN.
4. **Digitale Karte:** Karte als Objekt (Papier, Schatten), Prompt groß,
   „Habt ihr das zusammen erlebt?" → Moment / für später.
5. **Moments-Feed:** editorial, ein Moment = eine Geschichte (Foto, Titel,
   Karte, Ort, Zeile). Nur ihr zwei. Keine Likes, keine Follower.
6. **Our Story:** Timeline / Karte / Kalender / poetische Stats („euer
   Lieblingsmonat war der Juli"). Emotional, nie klinisch.
7. **Discover:** „WAS MACHEN WIR?" — heute abend / am wochenende / 10 minuten /
   raus / drinnen / was neues. Editoriale Karten.
8. **Collection:** Editionen als sammelbare Welten; 20/20 → „das habt ihr
   zusammen wachsen lassen." Dann Edition 02.

## Retention (der ehrliche Loop)

App → Inspiration → echte Handlung → gemeinsames Erlebnis → Erinnerung →
emotionale Belohnung → Wiederkommen. Getragen von: Vorfreude (Coming Up),
Memory-Resurfacing („vor einem Jahr wart ihr hier"), Meilensteine („euer
50. Moment"), unfertige Collections, saisonale Editionen, Jahrestage.

**Notifications = kleine Geschenke**, nie Vorwürfe. Manifest §3 bleibt hart:
keine Streak-Peitsche, keine Loss-Aversion, kein „du warst heute nicht da".

## Wo der Brief dem Manifest widerspricht (Entscheidungen)

1. **„relationship streak" auf Home** → NEIN als Druck-Zahl. Erlaubt ist die
   warme Tatsache („✦ 3 Momente diese Woche") — existiert bereits.
2. **„reactions" im Moments-Feed** → ok als privates ♥ zwischen zwei Menschen,
   nie Zähler, nie öffentlich.
3. **Memory-Engine/AI-Reflexionen** („ihr liebt es, draußen zu sein") → nur aus
   echten Daten, immer als Beobachtung, nie als Bewertung; AI bleibt Begleiter,
   nie Protagonist (bestehende ask-Gateway-Ehrlichkeitsregeln gelten).
4. **Community-Layer** → strikt getrennt vom privaten Space (heute schon so:
   anonyme Orts-Tipps). Kein Instagram-Umbau.
5. **Fake-Content in Mockups** → in der App niemals; Beispiel-Inhalte nur in
   klar markierten Demo-/Seed-Kontexten (Dev-only, siehe Audit A1-22).

## Assets, die Alicia liefert/erzeugt (Higgsfield/Midjourney, siehe Brief)

10–15 Bildwelten: Kochen editorial · Hände am Küchentisch · Sonnenuntergang ·
Zugreise · Picknick · Wohnung am Abend · Bergwanderung · Kaffee · Regentag ·
Herbst · Winter · physische Karten · Sunflower-Edition · botanische Texturen.
→ landen in `mobile/assets/moments/` und ersetzen die Tints in Hero/Discover.
