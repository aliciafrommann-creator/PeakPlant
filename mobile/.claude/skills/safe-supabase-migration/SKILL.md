---
name: safe-supabase-migration
description: The safe routine for any PeakPlant Supabase schema/RLS/storage change — read state first, additive-only forward migrations, forbidden tables, prod apply only with explicit human OK, advisors check after, document in supabase/README. Use whenever a task involves creating/altering tables, RLS policies, storage buckets, or applying migrations to the production project.
---

# Safe Supabase migration (PeakPlant)

The Supabase project (`kmlqjmxkcnkfwsbptvuc`) is **production** — real users,
real orders. This routine is MANIFESTO §4 made executable. Skipping a step here
has already caused real bugs (a missing UPDATE policy silently ate every space
rename).

## Hard rules (no exceptions)

1. **Never touch** `orders`, `subscribers`, `community_questions`,
   `newsletter_subscribers` — not even "harmless" ALTERs.
2. **Additive & forward-only.** Applied migration files are immutable;
   corrections are NEW numbered migrations (`supabase/migrations/00NN_*.sql`).
3. **Prod apply only with explicit human OK** in the conversation. Writing the
   migration file is always fine; `apply_migration` against prod is not, until
   the user says so.
4. Never reference or output the `service_role` / `sb_secret` key.

## The routine

1. **Read state first**: `list_tables` (verbose for the affected tables) and,
   for policies, query `pg_policies`. Confirm what actually exists — don't
   assume the local SQL files match prod.
2. **Write the migration file** under `supabase/migrations/` with the next
   number. Idempotent style (`add column if not exists`,
   `drop policy if exists` + `create policy`), with a header comment explaining
   the why.
3. **Remember the write-path check**: a table with RLS enabled and only
   SELECT/INSERT policies silently rejects UPDATE/DELETE. If the app updates a
   row, there must be a member-scoped UPDATE policy
   (`using/with check public.app_is_space_member(...)`).
4. **Storage buckets** are created IN the migration
   (`insert into storage.buckets ... on conflict do nothing`) with member-scoped
   `storage.objects` policies keyed on `split_part(name,'/',1)::uuid` — never a
   public bucket for private photos, never manual dashboard clicks.
5. **Apply** (with human OK): `apply_migration(project_id, name, sql)`.
6. **Verify**: re-query the columns/policies/buckets you created, then run
   `get_advisors(type: security)` and confirm the migration introduced **no new
   findings** (pre-existing ones are documented — don't panic-fix unrelated
   warnings).
7. **Document**: update `supabase/README.md` — what the migration does, whether
   it's applied to prod, and any operator step.
8. **Client fallback**: the app must stay functional when the migration is NOT
   yet applied (local fallback, graceful catch) — never crash on a missing
   column/bucket.

## Quick reference

- Membership helper: `public.app_is_space_member(space_id)` (SECURITY DEFINER).
- Existing private buckets: `memory-photos`, `space-avatars` (paths
  `<spaceId>/<file>`, signed URLs, EXIF stripped client-side).
- Migrations 0001–0013 are applied to prod. Check `list_migrations` before
  assuming.
