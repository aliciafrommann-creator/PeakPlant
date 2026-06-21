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

## Supabase-phase targets

These are the architecture commitments for the backend phase (see
DECISION_REGISTER, SECURITY, AI_SAFETY). They shape the repository
implementations rather than the screens.

- **EU data plane.** Dedicated EU Supabase projects for staging and production,
  with separate secrets per environment (local · preview · staging · production).
- **Atomic critical writes.** Preserving a moment, unlocking an Intimacy card,
  and purchases run as atomic server-side commands (Postgres transactions / RPC),
  never as multi-step client writes. The client never grants entitlements.
- **Repository, plus an AI abstraction.** A second interface, `lib/ai/`, mirrors
  the repository pattern: an interface plus a provider stub. All model calls are
  server-side; the client holds no provider keys.
- **Offline outbox.** Auth material in SecureStore; cached read models, drafts,
  and a mutation outbox in local storage. Mutations queue offline and finalize
  only after server acceptance.
- **Realtime with fallback.** If the shared diary uses Supabase Realtime, every
  subscription has a refetch-on-focus fallback so state is never stuck (O-005).
- **First-party analytics only.** No autocapture, no session replay. Diary
  content is never sent to analytics or error reporting; error payloads are
  sanitized.
