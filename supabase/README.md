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
- `migrations/0002`–`0011` — forward migrations (invites, account/storage,
  discovery, planning, entitlements, atomic space create, public place feedback,
  partner notes).
- `migrations/0012_space_identity.sql` — **shared space identity**: adds
  `spaces.emoji` and `spaces.avatar_path`, a member-scoped **UPDATE** policy on
  `spaces` (previously missing — renames/emoji were silently denied by RLS), and
  a private member-scoped **`space-avatars`** storage bucket (separate from the
  private `memory-photos` bucket). See "Applying 0012" below.
- `migrations/0013_space_collectible.sql` — adds `spaces.collectible_emoji`
  (the mark a couple earns per completed challenge), shared across members. Reuses
  the UPDATE policy from 0012, so it is just one additive column. `supabase db push`.

## Applying 0012 (manual)

Run from the repo root once, against the linked project:

```
supabase db push   # applies 0012_space_identity.sql
```

This migration is **purely additive** and does not touch `orders`,
`subscribers`, `community_questions`, or `newsletter_sends`. It:

1. adds two nullable columns to `spaces` (`emoji`, `avatar_path`),
2. creates the `spaces: members update` RLS policy (members can rename / set
   emoji / set avatar of their own space),
3. creates the `space-avatars` bucket (`public = false`) + member read/insert/
   update/delete policies on `storage.objects`.

No bucket needs to be created by hand in the dashboard — the migration creates
it. Until 0012 is applied, the app falls back to **local-only** emoji (no
avatar); after it, emoji + avatar are shared across both members.

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
