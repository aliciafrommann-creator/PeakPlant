---
name: verify-peakplant
description: The pre-push verification routine for the PeakPlant mobile app — runs TypeScript, ESLint and the Vitest suite and reports honestly. Use before committing/pushing, when asked to "verify", "run the checks", "is it green", or as the gate before opening a PR. Also covers the headless-only limits (the GUI can't be verified here).
---

# Verify PeakPlant (pre-push routine)

Working root: `mobile/` (all commands run there). This is the standing gate from
MANIFESTO §7 — nothing is "done" until these are green, and anything that can't
be checked here is named as **unverified**, not sold as working.

## The three checks (in order)

```bash
cd mobile

# 1) Types — must print nothing and exit 0.
npx tsc --noEmit

# 2) Lint — 0 errors required. A small number of PRE-EXISTING warnings from
#    older files may remain; do not let NEW errors/warnings through.
npx eslint app components lib --ext .ts,.tsx

# 3) Unit tests — all must pass.
npx vitest run
```

Report the result plainly: `tsc 0 · eslint 0 · vitest N/N`. If something fails,
say exactly what and where — never push red.

## What these checks do and do NOT cover

- **Covered:** type safety, lint, and all pure logic — the recommender,
  discovery/AI merge, catalogs, repositories, date/relative-time, challenges,
  place-map HTML contract, etc. (`lib/**`).
- **NOT covered:** the actual GUI — animations, image fade-in, spring/press
  feel, layout on real screens, WebView map tiles, the auth/OTP round-trip,
  camera / image-picker / local-auth (native-only). These need an EAS build on a
  device/simulator. Say so honestly; do not claim "smooth / self-explanatory"
  from a headless run.
- To exercise the discovery/AI logic headlessly (weather mapping, ranked
  candidates, anti-fabrication), use the `run-peakplant-mobile` skill's driver.

## Before opening a PR

- On a `claude/<topic>` branch, never `main`.
- Green on all three checks.
- Migrations: additive only; never touched `orders` / `subscribers` /
  `community_questions` / `newsletter_subscribers`; prod apply only with human OK
  (MANIFESTO §4).
- No `service_role` key, no fake claims, no private data made public
  (MANIFESTO §1–2).

## Gotchas

- Run from `mobile/`. If `tsc` prints its help text or eslint says "no files
  matching", you're in the wrong directory — `cd mobile` first.
- The `_e`-style unused-catch and a few `import/first` warnings in older test
  files are pre-existing; leaving them is fine, but don't add new ones.
