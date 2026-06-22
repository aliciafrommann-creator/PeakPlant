---
name: run-peakplant-mobile
description: Run, drive, smoke-test, and verify the PeakPlant Expo/React Native mobile app — especially the Discover date-recommendation and "Ask PeakPlant" AI flows (Open-Meteo live weather, the discover Edge Function, the curated/AI merge). Use when asked to run, launch, screenshot, smoke-test, or verify the PeakPlant mobile app or its discovery/AI logic.
---

# Run PeakPlant mobile

PeakPlant is an Expo SDK 51 / React Native 0.74 app (expo-router). Its full UI
surface is a phone — an iOS simulator, an Android emulator, or an EAS dev-client
build. **That GUI cannot be launched in a headless Linux container** (no
simulator, the app has no web build configured, and native modules — camera,
local-auth, image-picker — don't run on web).

What *is* drivable in any container is the layer the discovery/AI changes live
in: pure TypeScript modules with no React Native runtime imports
(`lib/discovery/**`, `lib/ai/**`). The committed driver
(`.claude/skills/run-peakplant-mobile/driver.ts`) imports those real modules and
drives them with real curated data — the WMO weather mapping, the live
Open-Meteo fetch, `enrichWithLiveWeather`, the curated `rankedCandidates` pool,
and the `mergeAiRanking` anti-fabrication invariant — printing observable output.

All paths below are relative to `mobile/` (the unit root).

## Prerequisites

- Node 22+ (`node --version` → v22.x). No `apt-get` packages needed for the driver.
- `esbuild` — ships transitively with the Expo/vitest toolchain; after install
  it is at `node_modules/.bin/esbuild`. (If ever missing: `npm i -D esbuild`.)

## Setup

```bash
npm install
```

## Run — agent path (the driver, works headless)

This is the primary path. It drives the real discovery/AI modules and prints
what they actually do:

```bash
node_modules/.bin/esbuild .claude/skills/run-peakplant-mobile/driver.ts \
  --bundle --platform=node --format=esm | node --input-type=module
```

Expected output (verified in a headless container — note the live fetch fails
honestly here because outbound egress is blocked; on a machine with egress to
`api.open-meteo.com` section 2 prints a live reading instead):

```
==== 1. Open-Meteo WMO mapping (openMeteo.ts) ================
  wmo=0   -> condition=sunny    outdoorFriendly(@8C)=true  constraintWeather=sunny
  wmo=61  -> condition=rainy    outdoorFriendly(@8C)=false constraintWeather=rain
  wmo=71  -> condition=snowy    outdoorFriendly(@8C)=false constraintWeather=cold
  wmo=999 -> condition=unknown  outdoorFriendly(@8C)=false constraintWeather=any
==== 2. Real openMeteoWeather.getCurrent(INNSBRUCK) ==========
  honest failure -> reason="network_error" (degrades to "no weather signal")
==== 3. enrichWithLiveWeather (weatherContext.ts) ============
  no user pref + sunny provider  -> usedLiveWeather=true weather=sunny
  user picked 'rain' + sunny prov-> usedLiveWeather=false weather=rain (user wins)
==== 4. rankedCandidates curated pool (recommend.ts) =========
  ... -> 6 candidates: [tm-2] walk with no plan, [tm-4] watch the light change, ...
==== 5. mergeAiRanking anti-fabrication (aiRecommend.ts) =====
  fabricated id present in output? no (correct — model cannot invent ideas)
  any why over AI_WHY_MAX? no (correct — capped)
```

The driver is the harness: edit `driver.ts` to add scenarios; the same
`esbuild | node` one-liner reruns it. No separate test runner is involved
(`npm test` / vitest is a sanity check, not this path).

## Run — on-device path (the real GUI + live network surface)

**Not runnable in a headless container** — requires a phone/simulator. These are
the requirements (not executed here, so not pasted as verified commands):

1. A handle: `npm run ios` (Mac + Xcode simulator), `npm run android`
   (emulator), or an EAS dev-client build (`eas build --profile development`)
   on a physical device.
2. Network egress to `api.open-meteo.com` (live weather),
   `kmlqjmxkcnkfwsbptvuc.supabase.co` (auth + the `discover` Edge Function),
   and server-side `api.anthropic.com` (the AI call).
3. A signed-in Supabase session (JWT) — `supabase.functions.invoke('discover')`
   is JWT-gated (`verify_jwt: true`), so an anonymous session gets the curated
   fallback, not the AI path.

To capture the deliverables: open **Discover** and confirm the ranking reflects
live weather; open **Ask PeakPlant**, send a prompt, and confirm a result
labeled **"personalized by PeakPlant AI"** (vs. "curated · verified by
PeakPlant" when the AI path is unavailable). Screenshot both.

## Run — discover Edge Function locally (optional, untried here)

To exercise the function's 501-no-key fallback and id-validation without billing
Anthropic, on a machine with `deno`, the `supabase` CLI, and egress to
`deno.land` (the function imports `https://deno.land/std@0.168.0/http/server.ts`):

```
supabase functions serve discover --no-verify-jwt
# then POST to http://localhost:54321/functions/v1/discover
```

With no `ANTHROPIC_API_KEY` set it returns 501 (client then falls back to
curated). **Not run in this container** — no `deno`/`supabase` CLI and `deno.land`
is egress-blocked.

## Gotchas

- **`expo start --web` will not boot this app.** `react-dom`,
  `react-native-web`, and `@expo/metro-runtime` are not dependencies. Don't try
  to "just run it in a browser" — install them and it still hard-fails on the
  native-only camera / local-auth / image-picker modules.
- **The live weather fetch never throws.** `openMeteoWeather.getCurrent` returns
  `{ ok:false, reason:'network_error' }` on any failure; `enrichWithLiveWeather`
  then no-ops. So in a blocked/offline env the driver's section 2 *should* say
  `network_error` — that's the contract working, not a driver bug.
- **`enrichWithLiveWeather` never overrides a user's explicit weather chip** —
  if `constraints.weather` is already set, it returns `usedLiveWeather=false`
  untouched. Driver section 3 demonstrates this; don't "fix" it.
- **The AI can't introduce ideas.** `mergeAiRanking` (and the server) drop any
  pick id not in the curated candidate pool, and cap each `why` at
  `AI_WHY_MAX` (280). The driver feeds a fabricated id + an over-length `why`
  to prove both; both must come back dropped/capped.
- **esbuild is transitive, not a direct dep.** The `node_modules/.bin/esbuild`
  binary is present after `npm install`, but it's not in `package.json`.

## Troubleshooting

- `esbuild: command not found` → `npm install` (or `npm i -D esbuild`).
- Driver prints a live reading in section 2 instead of `network_error` → you
  have egress to `api.open-meteo.com`; that's expected on an unrestricted host.
- `Cannot find module '../../../lib/...'` → you ran the one-liner from somewhere
  other than `mobile/`; `cd` to the unit root first.
