# Architecture

## Overview

Local-first Expo app. The UI never talks to a backend directly — it goes through
a **repository interface**, so the data source can be swapped from local storage
to Supabase without touching screens.

```
screens (app/) → hooks (lib/hooks) → repository interface (lib/repositories/interfaces.ts)
                                          ├── local.ts     (AsyncStorage — active)
                                          └── supabase.ts  (stubs — future)
```

## Layers

- **app/** — expo-router file-based routes. An `(auth)` stack (welcome,
  onboarding, invite), a `(tabs)` group (us, moments, scan, grow), and detail
  routes presented as modals/pushes (`card/[id]`, `memory/create`, `memory/[id]`).
- **lib/store.ts** — Zustand store for app/session state (onboarding completion,
  selected goals), hydrated from AsyncStorage on launch.
- **lib/hooks/** — thin hooks (`useMemories`, `useEdition`, `useCouple`) that read
  through the repositories and expose loading/error/data.
- **lib/repositories/** — `interfaces.ts` are the contracts; `local.ts` persists
  to AsyncStorage and falls back to seed data; `supabase.ts` are typed stubs.
- **lib/storage.ts** — namespaced AsyncStorage wrapper.
- **lib/mock-auth.ts** — clearly-labelled mock; never imported in production paths.
- **constants/** — design tokens mirrored from the website.

## State management

- Server/persistent data: repositories + hooks (TanStack Query is wired in the
  provider for future remote fetching).
- Local UI/session state: Zustand (`useAppStore`).

## Swapping in Supabase

1. `npm install @supabase/supabase-js`
2. Fill `.env` from `.env.example`
3. Implement `supabaseMemoryRepository` / `supabaseCardRepository`
4. Point hooks at the Supabase repositories
5. Replace `getMockSession()` with real auth + couple linking
