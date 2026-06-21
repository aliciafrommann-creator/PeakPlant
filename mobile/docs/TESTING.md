# Testing & Build Verification

Distilled from the sister project's build-operations doc, scoped to PeakPlant's
current stage (local-first, pre-backend). The principle carried over: **small
reviewed increments with real tests; passing builds are necessary but not the
whole story.**

## What runs today

| Check | Command | Covers |
|-------|---------|--------|
| Type safety | `npm run typecheck` (`tsc --noEmit`, strict) | All app + lib code. |
| Unit / pure logic | `npm test` (Vitest) | Pure, framework-free modules. |
| Build | `npx expo export --platform ios` | The JS bundle actually builds. |

All three are green as of this commit (15 unit tests passing).

## Test pyramid (current → planned)

- **Pure domain (now, Vitest):** `lib/streaks.ts` (weekly-streak invariants:
  empty, consecutive, at-risk grace week, gap-break, same-week dedup) and
  `lib/together.ts` (space-type filtering, goal-affinity pick, data integrity:
  every linked place resolves, only partners carry a perk).
- **Component tests (planned):** React Native Testing Library for screen
  states (loading/empty/error) once flows stabilise.
- **Database / RLS tests:** pgTAP suite at `supabase/tests/rls_test.sql`
  (member sees space+memory; outsider/anon see nothing; outsider cannot insert).
  Run via `supabase test db` against a local/staging stack — not executed in the
  JS CI. Required green before broad real data (see SECURITY).
- **E2E (planned):** the core journey — scan → card → preserve moment →
  appears in the right space's diary.

## Rules carried from Doc 11

- Pure logic is tested directly; **P0 invariants get explicit cases** even at
  high line coverage.
- A test is never weakened/skipped just to make a build pass.
- Don't present an unverified result as done — the commands above are run and
  their real output reported.
- Tests live in the repo so a future CI (GitHub Actions) runs typecheck +
  unit + build on every PR. CI config is a backend-phase task.

## Conventions

- Test files: `lib/**/*.test.ts`, colocated with the module.
- Pure modules only in unit tests — no Expo/React Native imports (keeps the
  node test environment fast and dependency-free).
- Make logic testable by keeping it pure (`lib/streaks.ts`, `lib/together.ts`
  have no React/storage imports); screens stay thin.
