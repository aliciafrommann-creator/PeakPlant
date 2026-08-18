# PeakPlant Mobile — Agent Notes

Expo SDK 51 / React Native 0.74 / expo-router v3 / TypeScript strict. The mobile
companion to the PeakPlant website (Next.js, parent directory). Read this before
building; it reflects the **current** codebase, not the initial scaffold.

> The product constitution lives in `../MANIFESTO.md` (wired via `CLAUDE.md`).
> This file is the *how*; the manifesto is the *why and the guardrails*. When
> they seem to conflict, the manifesto wins.

## Working agreement (every session)

1. **Branch, never main.** Work on a feature branch (`claude/<topic>`); ship via
   PR. Never push straight to `main`.
2. **Verify before push.** `npx tsc --noEmit`, `npx eslint`, `npx vitest run`
   must be green. Use the `verify-peakplant` skill. State honestly what could
   NOT be verified (the GUI can't run headless — see the `run-peakplant-mobile`
   skill). CI (`.github/workflows/ci.yml`) runs the same checks on every PR.
3. **Use the routines:** `.claude/skills/` holds `klarheit` (**vor jeder neuen
   oder geänderten Oberfläche** — die strukturellen Regeln aus dem Vergleich
   mit Instagram/Strava/BeReal, 18.08.2026), `feel-audit` (Handlungs-Hierarchie
   und Haptik, NACH `klarheit`), `verify-peakplant` (pre-push gate),
   `safe-supabase-migration` (any schema/RLS/bucket change), and
   `run-peakplant-mobile` (headless driver for the discovery/AI logic).
   Der mechanisierbare Teil von `klarheit` steht als Wächter in
   `lib/klarheit.test.ts` und scheitert in der CI — was dort NICHT steht, ist
   im Skill als Urteilsfrage begründet, nicht vergessen worden.
4. **Small, clean commits** with a clear message; don't change what you don't
   need to.
5. Commit footers include:
   `Co-Authored-By: Claude <noreply@anthropic.com>` and the session link.

## Security (non-negotiable — see MANIFESTO §2, §4)

- Only the **publishable/anon** Supabase key ships (in `eas.json` env /
  `EXPO_PUBLIC_*`). The `service_role` / `sb_secret` key is NEVER in the client
  or in git.
- Provider/AI keys (`ANTHROPIC_API_KEY`, place providers) live ONLY in Supabase
  Edge Function secrets — never in the mobile bundle.
- Supabase is a **production** DB. Migrations are **additive, forward-only**;
  applied files are immutable. Never touch `orders`, `subscribers`,
  `community_questions`, `newsletter_subscribers`. Apply to prod only with
  explicit human OK, then re-run `get_advisors` (security).
- No fake claims / no fake partner venues / no private data made public
  (MANIFESTO §1–2).

## Architecture

- **Local-first + Supabase.** `lib/repositories/interfaces.ts` defines
  contracts; `local.ts` (AsyncStorage) and `supabase.ts` implement them.
  `lib/repositories/index.ts` picks Supabase when `isSupabaseConfigured`
  (`EXPO_PUBLIC_SUPABASE_URL` + `_ANON_KEY` present), local otherwise. Screens/
  hooks import from `index.ts` — the data source swaps in one place.
- Supabase **is wired** and live. Migrations `0001`–`0013` are applied to prod
  (`kmlqjmxkcnkfwsbptvuc`). Schema/RLS mirror the local domain; deny-by-default,
  space-scoped via `app_is_space_member()`. See `supabase/README.md`.
- **Photos:** picked URIs live in the evictable cache — persist them first
  (`lib/photoStorage.ts`, local mode) or upload immediately (Supabase mode →
  `lib/supabase/storage.ts`, member-scoped buckets `memory-photos` /
  `space-avatars`, EXIF-stripped, read via short-lived signed URLs).
- **Space identity** (`spaces.emoji` / `avatar_path` / `collectible_emoji`) syncs
  server-side when configured; local storage is the fallback (`useSpaces`).
- Seed data in `lib/seed.ts`. The curated recommender pool is
  `lib/together.ts` (TOGETHER_MOMENTS) + `lib/discovery/curatedMoments.ts`; the
  browsable library is the generated `lib/discovery/ideaCatalog.ts` (~1275,
  distinct from the curated pool). Weekly challenges: `lib/challenges.ts`
  (`WEEKLY_CHALLENGES`, goal 1).

## Navigation (expo-router)

Tabs: **`home` (Together) · `discover` (Entdecken) · `editions` (Sammlung)** —
three, since 17.08.2026. Hidden but fully navigable: `moments`, `story`,
`community` (Places), `profile` (Me), `scan`, `grow`, `us`. Modals:
`space/new`, `space/edit`, `customize`, `note/compose`, `plus`. Auth flow:
`welcome` → `language` → `intro` (60–90s explainer) → `sign-in` (email OTP) →
`onboarding` → `invite`.

Ways into the hidden screens (each has exactly one door — don't add a second):
`moments` → the "all N moments, by month" link at the foot of the wall ·
`story` → "what grew between you", same place · `community` → the 🗺️ toggle on
Discover · `profile` → the person icon in the Home header · `scan` → the "scan
a card" link on Home.

### Entscheidung 021 — Startbildschirm, Reiter, Sammel-Wochen (Alicia, 17.08.2026)

Nach Alicias erstem Test auf einem echten Gerät: *„das Modell funktioniert,
aber die UX nicht"* — und, als Maßstab, *„das ist die landing page, das hooked
mich schon hier, kann ich dies und das machen, DAS IST MEIN SPACE."*

1. **Home ist die Momente-Wand.** Vorher ein Hub: Vorschlagskarte, die Frage
   „was wollt ihr zusammen machen?", drei weitere Antwortwege, Statistiken,
   Filmstreifen, Editionen, Notizen — **dreizehn** Abschnitts-Überschriften in
   Großbuchstaben, und die festgehaltenen Momente erst an dritter Stelle,
   begrenzt auf drei. Strava, Instagram und BeReal zeigen strukturell EIN
   Objekt, groß, wiederholt, mit der Haupthandlung außerhalb der Liste und
   ohne eine einzige Abschnitts-Überschrift auf dem Startbildschirm.
   Die vier Regeln, die den Bildschirm offen halten, stehen im Kopfkommentar
   von `app/(tabs)/home.tsx` — wer hier baut, liest sie zuerst.
2. **Fünf Reiter → drei.** `moments` und `story` lasen beide `useMemories`:
   zwei Reiter über denselben Daten. Für den einzigen real existierenden
   Nutzerzustand (eine Person, null Momente, kein Deck) waren **drei von fünf**
   Reitern leer. Nichts wurde gelöscht, nur umgehängt; beide Seiten haben
   seither einen `BackButton`, weil sie ohne Reiter-Leiste sonst Sackgassen
   wären.
3. **Kein Streak mehr.** `lib/streaks.ts` zählte aufeinanderfolgende Wochen und
   warnte über `atRisk`, wenn die laufende Woche noch leer war — etwas, das man
   verlieren kann, und damit ein Verstoß gegen MANIFESTO §3. Jetzt zählt
   `computeSharedWeeks()` verschiedene Wochen mit mindestens einem Moment; die
   Zahl kann nur steigen. Alicias Formel: **freischalten ja, verlieren nein.**
   Der Feature-Schlüssel heißt aus Kompatibilitätsgründen weiter `streaks`.

### Entscheidung 022 — Schriftleiter, Dichte, Kontrast (Alicia, 17.08.2026)

Alicias zweiter Befund: *„vlt ist auch alles etwas riesig im Vergleich zu
Strava."* Sie hatte recht, aber nicht so, wie es aussah.

1. **`constants/typography.ts` steuerte nichts.** Von neun Stufen hatten sechs
   **null** Verwendungen; `components/ui/Text.tsx`, ihr einziger Abnehmer, war
   selbst nirgends eingebunden (gelöscht). Und **alle 40** Stellen, die eine
   Stufe einbanden, überschrieben die Größe unmittelbar daneben wieder — man
   hätte jede Zahl ändern können, ohne dass sich ein Pixel bewegt. Daher kam
   das Auseinanderdriften: es gab keine Leiter, an der sich ein neuer
   Bildschirm festhalten konnte. Jetzt: **eine** Leiter, jede Stufe benutzt,
   `display · editorial · title · subtitle · cardTitle · body · callout ·
   caption · micro · label · mono`. **Ein `...Typography.x` mit einem
   `fontSize` daneben macht die Datei wieder zu Dekoration.**
2. **Die Verteilung war zweigipflig, nicht zu groß.** 67 % der Schrift lag bei
   ≤ 13 pt, 14 % ab 19 pt, fast nichts dazwischen: riesige Titel setzten den
   gefühlten Maßstab, winzige Etiketten saßen am unteren Ende einer sehr hohen
   Leiter. Korrektur deshalb als **Stauchung von beiden Seiten** — 15
   Bildschirmtitel von 28–40 auf 26 (durch Löschen ihrer Überschreibungen),
   und die Etiketten **hoch**: die kleinste Schrift der App war 7 pt, jetzt
   11 pt. Instagram und Strava setzen ihre kleinste bei 11–12 pt. Ergebnis:
   ab 19 pt von 14 % auf 8 %.
3. **Sperrung.** 157 Stellen standen bei ≥ 2 und sind jetzt bei 1.2. Das war
   die Ursache für aneinander klebende Knopftexte und abgeschnittene Etiketten.
4. **Abstände**, der größte Einzelposten: `lg` 24→20, `screen` 24→20, `xl`
   32→28, `xxl` 48→40, `xxxl` 64→48, neue Sprosse `ms: 12`. Der Rahmen um
   jeden Abschnitt kostete rund 68 pt, bevor Inhalt kam.
5. **Kontrast — ein eigener Fehler, kein Geschmack.** Gegen den Papierton
   gerechnet: `textSubtle` #857F76 = **3,51:1**, `textFaint` #A29C92 =
   **2,41:1**, beide unter den 4,5:1, die AA für kleinen Text verlangt, und
   **80 Stellen** kombinierten die leiseste Stufe mit ≤ 13 pt. Jetzt
   `textSubtle` #726D65 (4,55:1) und `textFaint` #908A81 (3,03:1, ausdrücklich
   nur für Großes und Nicht-Text). Neu `accentInk` #C04528 (4,51:1) für
   Akzent-Schrift; `accent` bleibt die Füllfarbe.
6. **Trefferflächen.** Neu `Layout.tapMin/control/cta`. Sechs Bedienelemente
   lagen bei 32–40 pt und stehen jetzt bei 44.

Eine bewusste Ausnahme: `app/(auth)/welcome.tsx` bleibt bei 52 pt. Ein
Bildschirm, ein Satz — dort ist „riesig" die Aussage. Der Kommentar dort sagt
es; wer eine zweite solche Ausnahme braucht, hat vermutlich keine.

### Entscheidung 023 — Die Einladung trägt einen Link (17.08.2026)

Harte Lage aus der Produktionsdatenbank: **vier Spaces, kein einziger mit einer
zweiten Person.** Der Beitritts-Backend ist in Ordnung (`redeem_invite`,
SECURITY DEFINER, Zeilensperre, Paar-Obergrenze zwei, Code-Rotation —
Migration 0018). Das Problem lag vollständig davor:

- Die Nachricht trug nur `PEAK-XXXXXX`. Abtippen, korrekt, in ein Feld **neun
  Bildschirme hinter der Anmeldung**.
- Es gab keinen `inviteLink`, keinen Beitritts-Deep-Link, kein `/j/` in den
  Intent-Filtern und keine Landeseite.

Jetzt eine durchgehende Kette, jedes Glied im Code:

1. `lib/links.ts` → `inviteLink(code)` = `${APP_BASE_URL}/j/PEAK-XXXXXX`.
2. `lib/qr.ts` → `parseJoinLink()` liest den Code aus Link, Deep-Link oder
   nacktem Code. **Bewusst streng:** nur unter `/j/`, nur das DB-Muster. Ein
   Beitritt lässt einen fremden Menschen in ein privates Tagebuch — das letzte
   Segment irgendeiner URL darf das nicht auslösen (MANIFESTO §2). Sieben
   Tests halten das fest.
3. `lib/pendingDestination.ts` → `setPendingJoinCode` / `peek` / `consume`.
   Der Code muss die Anmeldung überleben: Wer eingeladen wird, hat die App
   noch nicht.
4. `app/index.tsx` fängt den Kaltstart-Link ab. **Dabei ein bestehender
   Wettlauf repariert:** Link-Auswertung und Routen-Entscheidung lagen in zwei
   getrennten asynchronen Effekten ohne Reihenfolge — ein Kartenlink konnte
   auf dem Startbildschirm landen, weil `resumeHome()` vor `setPendingCard`
   lief. Ein Wettlauf, der nur manchmal verliert, sieht aus wie Zufall.
5. `app/(auth)/invite.tsx` startet direkt beim Beitreten, Feld ausgefüllt.
   Gelesen wird beim Rendern (`peek`), verbraucht im Effekt — ein Verbrauch im
   Render liefe unter StrictMode zweimal und verschluckte den Code.
6. `app.json` → `/j/` in den Android-Intent-Filtern (iOS deckt
   `applinks:peak-plant.com` bereits ab).
7. Website: `app/j/[code]/` — `noindex`, Code **nicht** im Titel und nicht in
   der OG-Vorschau (er stünde sonst in jeder Chat-Vorschau), `/j` in der
   Middleware-SKIP-Liste (eine Weiterleitung nach `/de/j/...` zerbräche den
   Universal Link). Ein kaputter Code ergibt eine ehrliche Erklärung, keinen
   404. Live gegengeprüft: 200, keine Weiterleitung, Code gerendert, noindex
   gesetzt, Titel ohne Code.
   Der Code wandert **nicht** an die Warteliste — die Quelle `invite-link`
   sagt schon, dass jemand wartet (MANIFESTO §2).

**Was das NICHT löst und was nur Alicia kann:** Die Landeseite sagt weiterhin
ehrlich, dass die App in geschlossener Beta ist. Solange die eingeladene Person
sie nicht installieren kann, bewegt keine dieser Änderungen die Zahl. Der
fehlende Schritt ist ein Installations-Link (TestFlight bzw. Play-Internal-
Testing) — `GET_THE_APP_URL` ist die eine Stelle, an der er einzutragen ist.

Offen und bewusst NICHT mitgemacht: die neun toten Zeilen im Sammlung-Reiter
und der fehlende Kamera-Aufnahmeweg in `memory/create`.

## Design system (current — editorial warm-stone, NOT the old scaffold)

- Tokens: `constants/colors.ts` (`Colors`, `Accents`, `Sections`),
  `constants/spacing.ts` (`Spacing`, `Radii`, `Shadows`, `Opacity`),
  `constants/typography.ts` (`Typography.editorial`/`display` = light
  Helvetica Neue / system sans, weight 300 — same voice as the website).
- Base is warm-stone paper (`#F3F1EC`); primary accent is sun-faded chili
  (`#CF4B2C`). One dominant accent per section, never a rainbow.
- CTAs use `Radii.pill`. Titles / idea / memory names use the light editorial
  sans (`Typography.editorial`) — never a serif, never bold shouting.
- **Interaction primitives (use them, don't reinvent):** `PressableScale`
  (spring + dim + haptic — the default tap), `FadeInImage` (photos),
  `AnimatedFill` (progress bars), `Skeleton`/`*Skeleton` (loading), `Toast`
  (celebration), `EmptyState`, `BackButton`. Haptics: `confirmSuccess` /
  `acknowledgeSelection` (`lib/haptics.ts`).
- German copy is natural, cute & easy, with correct umlauts (ä ö ü ß) — never
  ASCII transliteration ("Zuruck", "loschen").

## Prohibited (product principles — MANIFESTO §3)

Never build: streaks-as-pressure, points, leaderboards, relationship scores,
public profiles / followers / likes, pressured completion %, aggressive
notifications, automatic social sharing, generic AI chat surfaces.

## Code conventions

- TypeScript strict; zero tsc/eslint errors before push.
- Named exports for components (default export only for expo-router screens).
- No hard-coded secrets. `lib/mock-auth.ts` is unconfigured-mode only — never a
  production path.
- Pure logic (`lib/discovery/**`, `lib/ai/**`) has no RN imports and is unit-
  tested with Vitest; the `run-peakplant-mobile` skill drives it headless.

## Operator steps that live outside code (document, don't assume)

- `supabase db push` applies pending migrations; buckets are created by the
  migrations (no dashboard clicks).
- Login uses **email OTP** — the Supabase "Magic Link" / "Confirm signup" email
  template MUST include `{{ .Token }}`, or users hit a dead end.
- Universal links need server-side `apple-app-site-association` + `assetlinks.json`
  on peak-plant.com (app.json already declares the domains).
- `expo-secure-store` (session hardening, B1) is documented in
  `lib/supabase/client.ts` — install + wire before store submission.
- **Push (P2.1)** — die Frequenzregel ist eine getroffene Produktentscheidung
  (Alicia, 17.08.2026) und steht als geprüfte Logik in
  `lib/notifications/policy.ts`: höchstens **eine** Nachricht pro Space und
  Tag (kategorieübergreifend), **nichts zwischen 22 und 8 Uhr** (verschoben,
  nicht verworfen), **nur zwei Anlässe** (Partner beigetreten / neuer Moment),
  **nie Inhalt im Sperrbildschirm**. Wer eine weitere Push-Stelle baut, ruft
  `decideDelivery()` auf — eine zweite, halbe Regel woanders bedeutet zwei
  Wahrheiten, und eine davon schickt irgendwann nachts.
  `lib/notifications/index.ts` wählt den Provider selbst: mit nativem
  `expo-notifications` der echte, sonst der No-op — kein Schalter, den jemand
  vergessen kann. Die Push-Schlüssel entstehen beim ersten `eas build`
  (Expo fragt, ob es sie anlegen darf); Tabellen: Migration `0021`.

## Running

```
npm start        # Expo dev server (needs a device/simulator — no web build)
npx tsc --noEmit # types
npx eslint app components lib --ext .ts,.tsx
npx vitest run   # unit tests
```

### Entscheidung 026 — Eine offene Beispielkarte je Edition (Alicia, 18.08.2026)

Die Editionsseite zeigte Karten als nummerierte Umrisse. Wer kein Deck hat —
und das sind bis Oktober alle — sah zwölf Rechtecke und keinen einzigen Satz
davon, was auf einer Karte steht. Bei den neun angekündigten Editionen war das
buchstäblich alles: `cards: []`, also nicht einmal Umrisse. Der Satz „jede
Karte bringt einen geführten Abend in die App" stand da als Behauptung.

Jetzt hat **jede** Edition genau eine offen lesbare Karte:
- Editionen 01–03: eine der zwanzig echten (die erste Date-Karte). Neunzehn
  bleiben zu — Entscheidung 024 („der Kauf bringt mehr Inhalt") hält.
- Editionen 04–12: eine neu geschriebene Karte in `lib/content/samples.ts`,
  gleiche Struktur und gleicher Ton wie eine echte. Nummer 1 ist dafür
  freigehalten; erscheint die Edition, wandert die Karte unverändert in ihre
  Datei.

Vier Punkte:
1. Eine Beispielkarte ist **nie** in `SEED_CARDS`. Deck-Liste, Sammel-Zählung
   und Scanner arbeiten weiter nur mit echten Karten — sonst zählte eine
   Edition Karten, die niemand gekauft hat. (Test)
2. Die Kartenansicht **sagt**, dass es eine Beispielkarte ist, und sie sagt für
   angekündigte Editionen etwas anderes als für erschienene — „das gedruckte
   Deck bringt den Rest" wäre dort schlicht falsch. Der Text steht als reine
   Funktion `sampleNotice()` in `lib/content/samples.ts`, damit ein Test ihn
   halten kann. Der erste Anlauf hatte ihn direkt im JSX; man konnte den ganzen
   Block löschen, ohne dass ein Test rot wurde — und AGENTS.md behauptete
   trotzdem, er sei „gehalten". (Test)
3. **Eine Karte zählt nur, wenn sie gescannt wurde.** Das war der teuerste
   Fund des Gegenlesens, und zwar zweimal. Erst: Bei den Editionen 01–03 ist
   die Beispielkarte eine echte Deck-Karte, `activate()` gelingt — jeder ohne
   Deck konnte mit zwei Tipps „1 von 20 Karten geöffnet" erzeugen. Dann, in
   der Nacharbeit: Der Riegel hing an einem URL-Parameter, den nur zwei von
   sechs Aufrufern setzten — der Demo-Knopf im Scanner und der geteilte Link
   `peak-plant.com/c/card-01` setzten ihn nicht.

   Der Riegel sitzt deshalb jetzt an der SCHREIBSTELLE: `app/memory/create.tsx`
   hängt einen Moment nur dann an eine Karte, wenn `scanned=1` mitkommt — und
   das setzt ausschließlich die Kartenansicht, und dort nur, wenn sie nicht als
   Beispiel geöffnet wurde. Ein vergessener Parameter irgendwo kann die
   Sammlung nicht mehr aufblähen. (Test: drei Wächter in
   `lib/content/samples.test.ts`, Rot-Beweis für beide Richtungen geführt.)

4. **Die angekündigten Editionen sind wieder antippbar** — nach derselben
   Regel, die sie im PR davor zu einer Zeile gemacht hat. K3 sagt: Biete keine
   Handlung an, die niemand ausführen kann. Damals führte hinter jeder
   geplanten Edition eine leere Seite; jetzt liegt dort eine offen lesbare
   Karte. Ohne diesen Weg wären die neun Beispielkarten toter Code — die
   Editionsseite von `edition-04` war aus der App heraus nicht erreichbar.

Neu dafür in `lib/seed.ts`: `READABLE_CARDS`, `findCard()`, `isSampleCard()`,
`sampleCardFor()`. Alle Anzeige-Stellen lesen jetzt `findCard`; `SEED_CARDS`
bleibt die Deck-Wahrheit.

### Entscheidung 025 — Kontrast wird gerechnet, und die Frage lautet „worauf?" (18.08.2026)

Der erste Durchgang suchte nach einem FARBNAMEN (`textFaint`, dann
`placeholderTextColor`). Er fand neun Verdachtsfälle, davon drei echte Fehler,
und übersah die schwereren, weil die anders hießen. Zwei Gegenlese-Durchgänge
fanden danach 18 weitere Stellen im ersten und 6 im zweiten — alle in
Style-Blöcken, also im behaupteten Umfang:

- `permissionButtonText` im Scanner: `Colors.text` auf `backgroundDark` =
  **1,00:1**. Ohne Kameraerlaubnis wird die Kameraansicht nicht gerendert, der
  Grund ist dann flaches #1E1C1A — die Beschriftung „KAMERA ERLAUBEN" war
  unsichtbar. Sichtbar war nur der Rand des Knopfs.
- Elf Stellen mit `Accents.*` / `Sections.*` als 11–13-pt-Schrift, zwischen
  2,38:1 (Anrede in `note/compose`) und 4,28:1.
- Zwei Texte im dunklen Einladungs-Kasten, einer davon über einen Stil, der
  sich zwei verschiedene Untergründe teilte.
- Fünf Bedienelemente mit weißer kleiner Schrift auf `accent`: 4,47:1. (Beim
  ersten Zählen waren es „vier" — der fünfte, der schwebende Haupt-Knopf, trägt
  seine Füllung als Vorgabewert in den Props und nicht in einem Style-Block.)
- Und in der zweiten Runde: vier Etiketten hinter lokalen Konstanten
  (`TOGETHER` = apricot als 11-pt-Schrift = **2,35:1**, schlechter als alles
  aus Runde eins), ein Überschreibungs-Block ohne eigenes `fontSize`, und der
  Scanner — wo die erste Korrektur den Unsichtbarkeitsfehler nur in einen
  anderen Zustand verschoben hatte.

Daraus, verbindlich:

1. **Zwei Paletten.** `Accents`/`Sections` füllen, `AccentInks`/`SectionInks`
   schreiben (neu, ≥ 4,50:1 auf Papier, warm, creme, weiß und `Accents.cream`
   — auf `Colors.border` sind es 4,21–4,33, dort gehört keine kleine Schrift
   hin). Für dunkle Flächen `Colors.onDark` / `onDarkStrong`.
2. **Gerechnet, nicht geschätzt.** `lib/contrast.ts` — inklusive `composite()`
   für Deckkraft und `bestInk()` für Flächen, deren Farbe erst zur Laufzeit
   feststeht (Editions-Kopf, Kartenfläche: `lib/editionInk.ts`).
3. **Ein Wächter mit zwei Regeln**, beide ohne Kenntnis des Untergrunds
   prüfbar (`lib/palette.test.ts`): (A) Ein Akzent ist eine Füllung, keine
   Schrift — `Accents.*`/`Sections.*` unter 24 pt sind verboten, auch hinter
   einstufigen, großgeschriebenen, dateilokalen Konstanten wie
   `const TOGETHER = Sections.together` (Ketten, Kleinschreibung, Objektfelder
   und Importe gehen weiterhin durch — steht so im Dateikopf). (B) Jede
   andere Schriftfarbe muss auf dem Papierton bestehen oder eine erklärte
   Dunkel-Tinte sein. Größenordnung: gut tausend Style-Blöcke, knapp
   fünfhundert davon geprüft, eine Handvoll begründete Ausnahmen
   (`// kontrast-ok: <Grund>`). Bewusst gerundet — die genauen Zahlen standen
   hier zweimal falsch, beide Male durch den Commit, der sie aufschrieb.
   Was er NICHT kann, steht im Kopf der Datei — vor allem: ob eine helle
   Schrift auf der richtigen Fläche sitzt, bleibt Menschenarbeit.
4. Ein statischer Farbwert in einem Stil, dessen Farbe beim Rendern gesetzt
   wird, gehört gelöscht.
5. **Ein Bedienelement braucht Kontrast zu seiner Umgebung — als Rand wie als
   Füllung.** Entscheidend ist der schlechteste GERECHNETE Untergrund, nicht
   die Bauart. Der Knopf im Scanner hat das dreimal vorgeführt: Beschriftung
   unsichtbar (1,00:1) → Schleier drüber, Rand fällt auf 2,46:1 → dunkle
   Füllung „damit er von nichts mehr abhängt", gemessen **2,16:1**, also
   schlechter als der Rand davor. Erst die HELLE Füllung gegen den dunklen
   Schleier trägt (10,26:1). „Eine Füllung hängt von nichts ab" war eine
   plausible Begründung ohne Rechnung — genau die Sorte, die dieser Abschnitt
   verbieten soll. Halbdurchsichtige Streifen sind kein bekannter Untergrund:
   Der Scanner setzte helle Schrift über das LIVE-Kamerabild (1,07:1 über
   einer weißen Wand), und der Streifen auf der Momente-Wand ließ ein dunkles
   Foto mit 8 % durch. Entweder deckend, oder ein Schleier, dessen
   schlechtester Fall gerechnet ist.

Seed-Korrektur nebenbei: Edition 08 stand auf `ink: 'light'`, obwohl Dunkel
dort 5,20:1 statt 3,13:1 erreicht; Edition 09 hatte eine Farbe, auf der KEINE
der beiden Tinten reicht (4,28 / 3,80) und ist eine Nuance dunkler.

### Entscheidung 024 — Decks bleiben physisch, der Scan bringt mehr Inhalt (Alicia, 18.08.2026)

Ausgangsbefund beim Prüfen des Scan-Wegs: Alle 60 Kartentexte liegen im
App-Bundle (`lib/content/edition0{1,2,3}.ts`), und `app/card/[id].tsx` hat
**keinerlei Sperre** — `unlocked` ist nur ein Flag für die Feier-Animation,
`activate()` ist reine Sammel-Buchführung. Die Karten waren trotzdem
praktisch unerreichbar: es gab keinen Bildschirm, der sie zeigt. Nur QR-Scan,
ein `/c/`-Deep-Link und ein fest verdrahteter Demo-Knopf führten hinein.

**Alicias Entscheidung:** Die App ist ohne Deck vollwertig (Ideen, Orte,
Challenges, Notizen, Tagebuch). Editionen werden **physisch gekauft und
gescannt** — und der Mehrwert des Kaufs ist, dass die App dadurch **mehr
Inhalt** bekommt. Später darf „MAAAL" eine Edition auch digital sein.

Das trägt, weil eine Karte substanziell ist: `content.sections[]` mit
Anleitung („mach einen Moment daraus"), Gesprächsfragen und „haltet es fest".
Die gedruckte Karte trägt den Einzeiler, die App die geführte Erfahrung.

Gebaut:
- Der Sammlung-Reiter sagt jetzt, was stimmt: alles geht ohne Deck, die
  Edition ist die gedruckte Fassung. Vorher las er sich wie eine
  verschlossene Tür für alle, die bis Oktober kein Deck haben.
- `app/editions/[id].tsx` zeigt **das Deck**: geöffnete Karten sind wieder
  antippbar (vorher war eine gescannte Karte für immer verschwunden — die
  geführte Erfahrung war nach einmal Lesen weg), versiegelte zeigen als
  Umriss, was die gedruckte Ausgabe hinzufügt.

**Ehrlichkeitsgrenze (MANIFESTO §1), verbindlich:** `sealed` ist eine
Produktgrenze, keine Verschlüsselung. Die Texte liegen im Bundle; wer es
auspackt, sieht sie. Die Oberfläche sagt deshalb nie „geschützt" oder
„verschlüsselt" und zeigt bewusst **kein Schloss-Symbol** — nur, was stimmt:
die gedruckte Karte öffnet sie. Wer hier je „sicher" hinschreibt, macht aus
einer ehrlichen Produktgrenze eine Behauptung, die der Code nicht hält.

Offen: „Peaks sammeln" als Bindung (Alicias Idee vom 18.08.). Heute zählt die
App bereits drei Dinge — festgehaltene Momente, gesammelte Wochen, gemeinsame
Challenges — sie heißen nur nicht so. Wenn daraus ein Sammelstück wird, gilt
dieselbe Regel wie beim Streak: es darf nur steigen. „Locked in" als
Verlustangst wäre MANIFESTO §3; „etwas von euch wächst hier" ist erlaubt.
