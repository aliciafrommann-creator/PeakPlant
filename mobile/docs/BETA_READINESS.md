# PeakPlant — Beta Readiness Report

Checkpoint for the **first real beta** (Milestone A of the Date Discovery
roadmap). This is the honest state of the app at this commit. It complements
`LAUNCH_READINESS.md` (broader launch gap analysis) and `QR_FORMAT.md` (the
printing contract); it does not duplicate them.

Legend: ✅ works & verified (tsc / vitest / `expo export`) · 🟡 built, needs
on-device verification · 🔵 deterministic / curated / local-only by design ·
🔴 stubbed or not built · 🔑 needs external config (keys/legal/devices).

**Do not call this build production-ready.** It has been verified by typecheck,
unit tests, and a production export — **not** on a physical iPhone or Android
device. On-device QA (below) is a release blocker.

---

## 1. What works end to end

- ✅ **QR → card → diary loop** (local mode): scan a card QR (real camera) →
  resolver validates structure & card → card prompt opens → "preserve this
  moment" → memory created (note + optional photo + visibility) → appears in
  Moments → edit → delete → list refreshes.
- ✅ **Real QR scanning** with `expo-camera`; no demo card masquerading as
  production. Reusable card references vs single-use activation tokens, with
  honest per-outcome copy (malformed / unknown / expired / used) + retry.
- ✅ **Deep-link resume**: a card link captured before the auth/onboarding gate
  is resumed afterward instead of dropping the user on the home tab.
- ✅ **Discovery MVP**: Discover tab, deterministic recommendations, mood/filter
  chips, "show another", clear filters, save an idea, **plan an idea** (PLAN IT
  sheet → status `planned` + `plannedFor`), saved-ideas screen.
- ✅ **Spaces**: create couple/friends space, join by code, space switcher,
  per-space scoping of memories/cards/suggestions.
- ✅ **Challenges**: finite, badge-not-score, join/leave, progress.
- ✅ **Full EN/DE localization** across all central flows + runtime switch.

## 2. Supabase-backed (🟡 built, needs device verification + keys 🔑)

- Auth (email OTP) + session gate; repos behind `isSupabaseConfigured`.
- Memories, spaces, members, card activations, challenge enrollments, saved
  dates adapters; invite-code join via `redeem_invite` RPC.
- Photo upload → private bucket (EXIF-stripped, signed URLs).
- Account deletion / sign-out via RPC.
- Deny-by-default RLS applied to the live EU project; pgTAP suite written.

## 3. Local-only by design (🔵)

- Single-use **token redemption** ledger (`redeemedTokens`) — device-scoped for
  the beta. Reinstall clears it. Server ledger is post-beta (see QR_FORMAT).
- **Pending deep-link destination** is process-memory scoped (correct for a
  cold-start universal link).
- In no-Supabase mode, all repositories use AsyncStorage with seed data.

## 4. Deterministic / curated (🔵 — must stay labeled in UI)

- Discovery recommendations are a deterministic `nullDiscovery` over curated
  local content. The UI labels them "curated · checked <date>". **No live data.**
- "Local places" (Innsbruck) and partner perks are curated, not live.
- Time-of-day context is the **device clock only** — no location/weather.

## 5. Stubbed / not built (🔴)

- 🔴 Server-side AI recommendation (Edge Function returns 501; abstraction ready).
- 🔴 Live providers: places, events, maps, routing, transit, weather, booking.
- 🔴 "Ask PeakPlant" conversational flow.
- 🔴 Map view / location search / radius / clustering.
- 🔴 Community: ratings, reviews, tips, contributions, moderation.
- 🔴 Rituals UI (feature flag exists).
- 🔴 Calendar write, native share of plans, push notifications, analytics.
- 🔴 Token **signing** (PP1 tokens are forgeable — fine for "open a prompt you
  own", not for value; see QR_FORMAT post-beta hardening).

---

## 6. Required environment variables

| Variable | Purpose | Beta required? |
|----------|---------|----------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL (publishable) | Only for backend mode |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase **publishable** key (public) | Only for backend mode |

Local-first mode needs **none** — the app runs fully on AsyncStorage seed data.
Never ship the `service_role` / `sb_secret` key in the client.

For HTTPS card links in print, configure associated domains (iOS) / intent
filters (Android) in `app.json` before the print run.

---

## 7. Known bugs / limitations

- Token redemption is device-local (reinstall re-enables a single-use card).
- No on-device verification yet for camera, deep links, photo upload, OTP.
- Lint: no linter is configured in `package.json` (only `typecheck` + `test`).

## 8. Release blockers (must fix before beta ships)

1. 🔑 On-device QA on a real iPhone **and** Android device (checklist below).
2. 🔑 Decide beta mode: local-first (no keys) vs Supabase (keys + run migrations
   + pgTAP RLS suite + device test of auth/upload/delete).
3. 🔑 `app.json`: bundle id, version, camera usage strings (EN/DE), associated
   domains/intent filters if using HTTPS card links.

## 9. Should-fix before beta

- Add a configured linter (eslint) and wire `lint` into the script set.
- Print a small batch of **real** test cards (both QR families) and scan them.
- Confirm EN/DE copy with a native speaker (umlaut-safe ASCII is used in code).

## 10. Post-beta (safe to defer)

- Everything in §5 (live data, AI, map, community, rituals, calendar, share,
  notifications, analytics) — this is Milestone B.
- Server-signed tokens + server redemption ledger.
- **Monetization** (PeakPlant Plus). The M0 foundation is built but fully
  disabled (`MONETIZATION_ENABLED = false`): typed couple-level entitlements,
  AI allowance + privacy-safe cost metering, a provider-independent billing
  adapter (null), config-driven tiers/limits/price hypotheses, and a dormant DB
  migration (`0007`, not applied). Turning it on — paywall, real purchases,
  store products, trials — is gated on human approval. See `MONETIZATION.md`.

---

## 11. Manual QA checklist (run on device)

**Onboarding & account**
- [ ] First launch → welcome → language → onboarding goals → invite → Discover.
- [ ] Returning launch goes straight to Discover.
- [ ] (Backend) sign in via OTP; sign out; delete account.
- [ ] Create couple space; create friends space; join by code; switch spaces.

**QR & card-to-diary**
- [ ] Scan a real **card reference** QR → correct card opens.
- [ ] Scan the same card again → opens again (reusable).
- [ ] Scan a **PP1 activation token** → card opens; scan again → "already
      unlocked".
- [ ] Scan an expired token → "expired".
- [ ] Scan an unknown card id → "edition isn't out yet".
- [ ] Scan a non-PeakPlant QR → "doesn't look like a PeakPlant card" → Try again.
- [ ] Deny camera permission → guidance + Open Settings; grant → scanner works.
- [ ] Open a card universal link while signed out → after auth, lands on card.
- [ ] Preserve a moment (note + photo + visibility) → appears in Moments →
      edit → delete → list refreshes.

**Discovery**
- [ ] Toggle chips; "show another"; "clear filters"; empty state appears when
      over-constrained.
- [ ] Save an idea → appears in Saved.
- [ ] PLAN IT on a saved idea → status shows planned with the date text.
- [ ] Switch language mid-flow; all of the above remain coherent in DE.

**Resilience**
- [ ] Airplane mode: local mode fully usable; backend mode degrades gracefully.
- [ ] Background the app on a sensitive edition → re-lock on return.

---

## 12. TestFlight (iOS) — exact steps

Full detail in `IOS_TESTFLIGHT.md`. Summary:
1. `app.json`: set `ios.bundleIdentifier`, `version`, `ios.buildNumber`, camera
   `NSCameraUsageDescription` (EN/DE).
2. `eas build --platform ios --profile preview` (or production).
3. Upload to App Store Connect (EAS Submit or Transporter).
4. App Store Connect → TestFlight → add internal testers → enable build.
5. Testers install TestFlight → accept → install → run §11 checklist.

## 13. Android closed testing — exact steps

1. `app.json`: set `android.package`, `versionCode`, camera permission.
2. `eas build --platform android --profile preview` (AAB).
3. Play Console → create app → Closed testing → create a track → upload AAB.
4. Add testers (email list or Google Group); share the opt-in link.
5. Testers opt in, install from Play, run §11 checklist.

---

## 14. Verification at this checkpoint

- ✅ `tsc --noEmit` — 0 errors.
- ✅ `vitest run` — 71/71 across 7 files (incl. 20 QR parse/resolve tests).
- ✅ `expo export --platform ios` — bundle builds (3.5 MB hbc).
- ⚠️ No linter configured (not a regression).
- 🔴 No on-device run yet — the gating release blocker.
