# Backend: Auth, Space-Linking & RLS

Design for the Supabase phase. The schema + RLS live in `supabase/migrations/`.
This doc covers how auth and space-linking work and how the app switches over.
Status: **foundation laid, not live** (needs a real EU Supabase project — O-001).

## Auth (A-06-12 equivalent)

- **P0:** email **OTP / magic link** via Supabase Auth. No passwords.
- **P1:** Apple & Google sign-in, linked to one canonical account (no duplicate
  profiles).
- Sessions persist via AsyncStorage; refresh only while the app is active.
- On first sign-in, create the user's `profiles` row.
- `lib/mock-auth.ts` is replaced by a real session; it is never imported in app
  screens (already isolated).

## Space-linking (couples & friends)

A space is created, then others **join by invite code**.

1. Creator inserts a `spaces` row + their own `space_members` row (owner).
2. The invite code (or a deep link carrying it) is shared.
3. A joiner calls a **`redeem_invite(code)` RPC** (security definer) that
   validates the code and inserts their `space_members` row atomically.
   - RPC is used (not a raw client insert) so joining can't be forged and so
     expiry / member caps are enforced server-side. (Migration `0002` adds it;
     `0001` ships the self-join policy as the interim.)
4. A user can hold many memberships → many spaces at once (PP-019).

Couple caps (exactly two) and friends caps are enforced in the RPC.

## RLS matrix (from `0001_init.sql`)

| Table | read | write |
|-------|------|-------|
| profiles | own row | own row |
| spaces | members | authenticated create; (join via members) |
| space_members | same-space members | add/remove **self** only |
| memories | space members | space members; `created_by = auth.uid()` |
| card_activations | space members | space members |
| challenge_enrollments | space members | space members |

Everything is **deny-by-default**: no row is reachable without a matching
membership policy. `app_is_space_member()` is `security definer` to avoid
recursive RLS on `space_members`.

## Media (memories' photos)

- Private storage bucket; objects keyed by `space_id/…` and reachable only via
  short-lived **signed URLs** to space members.
- **EXIF/GPS stripped** + re-encoded before storage (SECURITY).
- `memories.photo_path` stores the private path, never a public URL.

## Switching the app over (next increment)

1. `npm i @supabase/supabase-js` (done) → `lib/supabase/client.ts` reads env.
2. Implement `supabaseSpaceRepository` / memory / card repos against the schema.
3. Point the hooks at the Supabase repos; replace mock auth with the session.
4. Add pgTAP RLS tests (allow + deny per role) before any real data (TESTING).

Each step is a small, reviewed increment — not one big switch.

## Go-live gate (per SECURITY launch gates)

EU region confirmed · RLS allow/deny tests green · deletion + restore rehearsed ·
EXIF strip + signed access live · independent security/privacy review.
