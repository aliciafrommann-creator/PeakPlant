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

## Switching the app over — status

Implemented and gated by `isSupabaseConfigured` (no keys → unchanged local-first
behavior; keys → Supabase):

1. ✅ `lib/supabase/client.ts` reads env.
2. ✅ `supabaseSpaceRepository` / memory / card repos + `challenge_enrollments`.
3. ✅ Repo selector `lib/repositories/index.ts`; hooks use it.
4. ✅ Email-OTP auth (`lib/supabase/auth.ts` + `(auth)/sign-in.tsx`); entry gate
   routes by session + space membership; onboarding creates a real couple space.
5. ✅ Photo upload: private `memory-photos` bucket (migration `0003`) + member-
   scoped policies; client uploads via `lib/supabase/storage.ts` (EXIF stripped,
   downscaled), reads via signed URLs.
6. ✅ Account deletion: `delete_account()` RPC (`0003`) + in-app screen.
7. ✅ pgTAP RLS tests written (`supabase/tests/rls_test.sql`).
8. ⏳ Run migrations `0002` + `0003`; set env keys; run pgTAP; verify on device.

Each step is a small, reviewed increment — not one big switch.

## Go-live gate (per SECURITY launch gates)

EU region confirmed · RLS allow/deny tests green · deletion + restore rehearsed ·
EXIF strip + signed access live · independent security/privacy review.
