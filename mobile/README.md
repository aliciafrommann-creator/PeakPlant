# PeakPlant Mobile

The mobile companion to [PeakPlant](https://peak-plant.com) — a physical +
digital intimacy and relationship brand for couples.

Every physical card invites a real shared moment. Through a QR code, the couple
preserves that moment — a photo and a short note — in a private, shared diary
that grows over time.

> collect moments. grow together.

## Stack

- Expo SDK 51 · expo-router 3 · React Native 0.74 · TypeScript (strict)
- TanStack Query · Zustand (local UI state) · React Hook Form + Zod
- expo-camera · expo-image-picker · AsyncStorage (local-first)

## Getting started

```bash
cd mobile
npm install
npm start          # Expo dev server — scan the QR with Expo Go
# or: npm run ios / npm run android / npm run web
```

The app is **local-first**: it runs fully on seed data with no backend or
credentials required. All memories are stored on-device via AsyncStorage.

## Demo flow

1. Welcome → Onboarding (choose goals) → Invite partner (mock code)
2. **Us** — shared home: this-week suggestion, partner note, latest moment
3. **Moments** — the shared diary
4. **Scan** — QR scanner placeholder + "try demo card"
5. **Grow** — Grow Together edition, 20 Moment Cards (discovered / sealed)
6. Open a card → "preserve this moment" → add photo + note → saved to the diary

## Project structure

```
app/            expo-router screens (auth stack + tab group + detail modals)
components/      ui primitives, memory + edition components
constants/       colors, typography, spacing (mirrors the website tokens)
lib/            types, seed data, storage, repositories, hooks, store
docs/           product, architecture, design system, data model, privacy
```

## Going to production

This is the MVP foundation. To launch publicly you still need:

- A Supabase project (wire `lib/repositories/supabase.ts`, replace mock auth)
- Real authentication + secure photo storage
- Apple Developer + Google Play accounts, store privacy declarations
- A decision on the later AI personalization provider

See `docs/ARCHITECTURE.md` and `AGENTS.md` for conventions and the
non-negotiable product principles (no streaks, scores, or relationship ratings).
