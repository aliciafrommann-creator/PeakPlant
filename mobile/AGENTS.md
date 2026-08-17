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
3. **Use the routines:** `.claude/skills/` holds `verify-peakplant` (pre-push
   gate), `safe-supabase-migration` (any schema/RLS/bucket change),
   `feel-audit` (before polishing/redesigning any screen), and
   `run-peakplant-mobile` (headless driver for the discovery/AI logic).
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

Offen und bewusst NICHT mitgemacht (eigene Runden, damit sie einzeln beurteilbar
bleiben): der Größen-/Dichte-Durchgang, die Kontrast-Korrektur (zwei Grautöne
erreichen auf dem Papierton nur 2,4 bzw. 3,5:1), die neun toten Zeilen im
Sammlung-Reiter, und der fehlende Kamera-Aufnahmeweg in `memory/create`.

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
