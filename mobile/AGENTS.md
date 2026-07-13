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
   skill).
3. **Small, clean commits** with a clear message; don't change what you don't
   need to.
4. Commit footers include:
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

Tabs: `home` (Together), `discover`, `editions`, `community` (Places), `profile`
(Me). Hidden routes: `scan`, `moments`, `grow`, `us`. Modals: `space/new`,
`space/edit`, `customize`, `note/compose`, `plus`. Auth flow: `welcome` →
`language` → `intro` (60–90s explainer) → `sign-in` (email OTP) → `onboarding` →
`invite`.

## Design system (current — editorial warm-stone, NOT the old scaffold)

- Tokens: `constants/colors.ts` (`Colors`, `Accents`, `Sections`),
  `constants/spacing.ts` (`Spacing`, `Radii`, `Shadows`, `Opacity`),
  `constants/typography.ts` (`Typography.editorial` = platform serif).
- Base is warm-stone paper (`#F3F1EC`); primary accent is sun-faded chili
  (`#CF4B2C`). One dominant accent per section, never a rainbow.
- CTAs use `Radii.pill`. Editorial serif for titles / idea / memory names.
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

## Running

```
npm start        # Expo dev server (needs a device/simulator — no web build)
npx tsc --noEmit # types
npx eslint app components lib --ext .ts,.tsx
npx vitest run   # unit tests
```
