# Supabase (backend foundation)

This folder is the **backend foundation**: schema and deny-by-default RLS that
mirror the app's local-first domain. It is **not live yet** — the app still runs
fully on local storage. Going live is a human step (a real Supabase project +
credentials), tracked as O-001/O-002 in the Decision Register.

## What's here

- `migrations/0001_init.sql` — tables (`profiles`, `spaces`, `space_members`,
  `memories`, `card_activations`, `challenge_enrollments`), the
  `app_is_space_member()` security-definer helper, and space-scoped RLS on every
  personal table. No permissive default — access flows only through membership.

## Going live (human steps)

1. Create an **EU** Supabase project (Frankfurt/EU-Central). Record region.
2. `supabase link` this repo to the project.
3. `supabase db push` to apply `migrations/0001_init.sql`.
4. Put `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` into
   `mobile/.env` (see `mobile/.env.example`). The anon key is public; the
   **service-role key is never shipped in the app**.
5. Enable email OTP / magic-link auth (see `mobile/docs/BACKEND.md`).
6. Wire `lib/repositories/supabase.ts` to real queries and switch the hooks over
   (the next build increment — small and reviewed).

## Rules carried from the build-ops doc

- Applied migrations are **immutable**; fixes are new forward migrations.
- Local/CI rebuild from zero via migrations + seed.
- RLS gets allow **and** deny tests (pgTAP) before any real data — a backend-
  phase task, listed in `mobile/docs/TESTING.md`.
