# PeakPlant Mobile — Agent Notes

This is an Expo ~51 / expo-router ~3 project. It is the mobile companion to the
PeakPlant website (Next.js, in the parent directory) and must preserve that
brand's visual identity.

## Product philosophy

PeakPlant turns a physical card moment into a private, shared couple diary:
physical card → real shared moment → QR scan → photo + note → growing diary.

Core promise: **collect moments. grow together.**

Build for presence, not performance. Memories over metrics. Invitation over
obligation. Real life before screen time. The product helps couples *notice*
what is already growing between them — it does not measure or rate a
relationship.

## Design rules

DO:
- Large, light-weight typography (fontWeight '200'–'300' for headings)
- Generous whitespace; near-black `#1A1A1A` on warm off-whites
- Warm gold `#C9A96E` as a subtle accent only
- Lowercase for emotional/brand copy; UPPERCASE wide-spaced for labels
- Sharp or minimal radius (0–4px), editorial/print feel

DO NOT:
- Bright gradients, startup blue/purple
- Pink hearts or cutesy icons
- Gamification visuals (streaks, badges, stars, fire)
- Progress bars framed as completion pressure
- Social-feed layouts, crowded interfaces

## Prohibited patterns (product principles)

Never implement: streaks, points, leaderboards, relationship scores, public
profiles, pressured completion, aggressive notifications, automatic social
sharing. Collection is shown as a neutral fact ("3 of 20 discovered"), never as
a completion percentage.

## Privacy

The diary is private to the two connected couple members. Photos and notes are
never public, never auto-shared, and never sent to analytics. Deletion is
always possible.

## Code conventions

- TypeScript strict mode; no unresolved errors
- Named exports for components (default export only for expo-router screens)
- No hard-coded secrets; mock services isolated behind interfaces

## Architecture
- Local-first with AsyncStorage via `lib/storage.ts`
- Repository pattern: `lib/repositories/interfaces.ts` defines contracts
- `lib/repositories/local.ts` implements them locally
- `lib/repositories/supabase.ts` has stubs — not wired
- Seed data in `lib/seed.ts`
- Mock auth in `lib/mock-auth.ts` — never import in production paths

## Navigation
expo-router file-based routing:
- `app/(auth)/` — welcome, onboarding, invite
- `app/(tabs)/` — us, moments, scan, grow
- `app/memory/create.tsx` — modal
- `app/memory/[id].tsx` — detail
- `app/card/[id].tsx` — card detail

## Design tokens
See `constants/colors.ts`, `constants/typography.ts`, `constants/spacing.ts`.

## Adding Supabase
1. Install `@supabase/supabase-js`
2. Add env vars in `.env` (see `.env.example`)
3. Wire `supabase.ts` repository implementations
4. Replace `getMockSession()` with real auth

## Running
```
npm start   # Expo dev server
```
