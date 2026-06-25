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
- ✅ **Completion → diary close-the-loop**: DONE → PRESERVE → private memory
  → `memoryId` written back to the saved date → optional public star rating +
  tip (HOW WAS IT? screen, strictly separate from private diary note).
- ✅ **Calendar export**: CALENDAR button on planned items → ICS via native
  share sheet (no `expo-calendar` permission required).
- ✅ **Ask PeakPlant**: conversational idea-finding UI. The `discover` Edge
  Function is **deployed** (verify_jwt on): it sends a pool of curated candidates
  to Claude, which only reorders them and writes a warm "why" — the on-device
  `mergeAiRanking` validator and the function both drop any id not in the pool,
  so no venue/price/fact is ever invented. Activates once the `ANTHROPIC_API_KEY`
  Edge Function secret is set; until then (and on any error) it degrades silently
  to the curated recommender. Source label always shown ("personalized by
  PeakPlant AI · facts stay curated" vs "curated · verified by PeakPlant").
- ✅ **Spaces**: create couple/friends space, join by code, space switcher,
  per-space scoping of memories/cards/suggestions. Atomic space creation via
  `create_space` RPC (migration 0008, **applied to the live project 2026-06-22**).
- ✅ **Challenges**: finite, badge-not-score, join/leave, progress.
- ✅ **Full EN/DE localization** across all central flows + runtime switch.
- ✅ **Privacy boundaries**: `lib/privacy/boundaries.ts` enforces content
  contracts at write time (tip length, link structure, no private-content
  wiring). Tested with 17 assertions.
- ✅ **Analytics scaffold**: exhaustive `AnalyticsEvent` union (no private
  content allowed in any event). Active provider: nullAnalytics (no-op).
- ✅ **Notifications scaffold**: `NotificationCategory`, `NotificationPayload`,
  `INotificationProvider`. Active provider: nullNotifications (no-op).
- ✅ **Performance**: 5 s in-memory TTL cache for local repository `getAll`
  reads (savedDates, memories) with write-time invalidation.
- ✅ **AI safety**: deterministic EN/DE crisis route (`lib/ai/safety.ts`)
  runs before any Ask PeakPlant response — suppresses recommendations and
  shows neutral help (112 + Telefonseelsorge). Per-surface AI kill switches,
  all OFF for beta. Input never stored/echoed.
- ✅ **Rituals**: moments a couple loved, turned into something they return to
  (private, space-scoped, behind the `rituals` flag). Create/revisit/let-go.
- ✅ **Ratings loop**: post-completion feedback (stars + practical tip) is
  surfaced back on the idea detail screen as the couple's OWN history
  ("YOUR SPACE TRIED THIS") — honest, never a fabricated community average.

## 2. Supabase-backed (🟡 built + migrated live, needs device verification 🔑)

- Auth (email OTP) + session gate; repos behind `isSupabaseConfigured`.
- Memories, spaces, members, card activations, challenge enrollments, saved
  dates adapters; invite-code join via `redeem_invite` RPC.
- Photo upload → private bucket (EXIF-stripped, signed URLs).
- Account deletion / sign-out via RPC.
- Deny-by-default RLS applied to the live EU project; pgTAP suite written.
- **Migrations 0005–0008 applied to the live project `kmlqjmxkcnkfwsbptvuc`
  on 2026-06-22** (date discovery, saved-date planning, entitlements,
  `create_space`). All additive; website tables (`orders`, `subscribers`,
  `newsletter_subscribers`, `community_questions`) untouched. Security advisor:
  the 7 new tables are RLS-enabled and member-scoped; the only finding tied to
  these migrations is the intentional, self-guarding `create_space` SECURITY
  DEFINER function (same pattern as `redeem_invite` / `delete_account`).
- Public client keys (URL + publishable anon key) are wired into `eas.json`
  preview/production build profiles. The `service_role` key is never shipped.

## 3. Local-only by design (🔵)

- Single-use **token redemption** ledger (`redeemedTokens`) — device-scoped for
  the beta. Reinstall clears it. Server ledger is post-beta (see QR_FORMAT).
- **Pending deep-link destination** is process-memory scoped (correct for a
  cold-start universal link).
- In no-Supabase mode, all repositories use AsyncStorage with seed data.

## 4. Deterministic / curated (🔵 — must stay labeled in UI)

- Discovery recommendations are deterministic-first over curated local content.
  The UI labels them "curated · checked <date>".
- "Local places" now uses generic place intents plus user-triggered live search;
  it does **not** claim partner venues or perks without real agreements. The
  Places tab supports foreground
  location once, Supabase Edge Function, Google Places key server-side only,
  24h device cache, and a conservative per-device monthly guardrail.
- Time-of-day context is the **device clock**; **weather is live** (Open-Meteo,
  Innsbruck) and folded into the recommender.

## 5. Stubbed / not built (🔴)

- 🟡 Server-side AI recommendation: the `discover` Edge Function is deployed and
  the gateway calls it. Remaining 🔑: set the `ANTHROPIC_API_KEY` Edge Function
  secret to turn it on (without it, it 501s and the client uses the curated
  recommender). On-device verification of the live AI path still pending.
- 🟡 Live **weather** is wired: Open-Meteo (no API key) via the `weatherProvider`
  swap. The Ask flow and the Discover tab fold the live condition into the
  recommendation constraints (a manual weather chip always wins; silent no-op on
  failure). On-device verification of the live fetch is pending.
- 🟡 Live **places** are wired behind a user tap: `expo-location` foreground
  permission, device cache, local monthly guardrail, Supabase `discover`
  `mode: live_places`, Google Places server secret, and optional Anthropic
  ranking that can only sort provider-returned places. On-device verification
  with real keys is pending.
- 🔴 Events, routing, transit, and booking are still absent.
- 🟡 Anonymous public place tips and public map pins are built as explicit opt-in
  sharing and need migrations `0009_public_place_feedback.sql` +
  `0010_public_place_spots_and_saved_snapshot.sql` applied before cross-device
  sharing.
- 🔵 Live Places map view is built with CARTO/OpenStreetMap tiles and a connection-safe
  list fallback. Live provider places are added as a layer when the user asks;
  clustering is not built.
- 🔴 **Cross-space community**: ratings/reviews/tips aggregated across couples,
  plus moderation. (Per-space feedback IS captured and surfaced to the owning
  couple; a shared community average needs a backend + moderation — post-beta.)
- 🔴 Push notifications (null provider + full type system in place;
  `expo-notifications` integration is post-beta native-module work).
- 🔴 Real analytics provider (`AnalyticsEvent` union + null provider in place;
  wire a privacy-reviewed vendor post-beta with GDPR consent flow).
- 🔴 Token **signing** (PP1 tokens are forgeable — fine for "open a prompt you
  own", not for value; see QR_FORMAT post-beta hardening).

---

## 6. Required environment variables

| Variable | Where | Purpose | Beta required? |
|----------|-------|---------|----------------|
| `EXPO_PUBLIC_SUPABASE_URL` | client (`.env` / `eas.json`) | Supabase project URL (public) | Only for backend mode |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | client (`.env` / `eas.json`) | Supabase **publishable** key (public) | Only for backend mode |
| `ANTHROPIC_API_KEY` | **Edge Function secret only** | Ask PeakPlant AI (`discover`) | Only for live AI; never in client |
| `ANTHROPIC_MODEL` | Edge Function secret (optional) | override the default model | No (defaults to Haiku) |
| Provider keys (places/weather/etc.) | **Edge Function secret only** | live data instead of curated | No (post-beta) |

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
2. 🔑 Backend mode is now provisioned: migrations 0005–0008 are applied live and
   the public keys are wired in `eas.json`. Remaining: a device test of the live
   auth/upload/delete path against the migrated project (the pgTAP RLS suite is
   written; run it against the live project before public testers).
   Apply `0009_public_place_feedback.sql` and
   `0010_public_place_spots_and_saved_snapshot.sql` before expecting anonymous
   place tips/map pins to sync across devices.
3. 🔑 `app.json`: bundle id, version, camera usage strings (EN/DE), associated
   domains/intent filters if using HTTPS card links. (Bundle ids, version,
   camera strings, and EAS project id are already set; HTTPS associated domains
   are still TODO if printing HTTPS card links.)

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
  adapter (null), config-driven tiers/limits/price hypotheses, and the DB
  migration (`0007`, **applied live 2026-06-22** — tables exist but the feature
  stays fully disabled in code). Turning it on — paywall, real purchases,
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
- ✅ `vitest run` — 260/260 across 28 files (including planned-date calendar
  export and curated map helpers; added AI ranking merge: 10;
  Open-Meteo weather: 15; weather enrichment: 5).
  - QR parse/resolve (20) · recommendations (18) · learning (10) · experience (11)
  - status machine (9) · share/links (11) · feedback repository (5) · ratings (8)
  - calendar ICS (7) · providers contract (7) · privacy boundaries (17)
  - analytics contract (8) · notifications contract (7) · cache (8)
  - AI safety/crisis (11) · AI ranking merge (10) · rituals repository (6)
  - weather provider (15) · weather enrichment (5)
  - monetization entitlements (12) + usage (13) · spaceCreation (4) · challenges (6)
- ✅ `expo export --platform ios` — bundle builds.
- ✅ Migrations 0005–0008 applied live; the 7 new tables verified RLS-enabled
  with member-scoped policies (read-only check on the live project — the
  seeding pgTAP suite belongs on a Supabase branch, not production).
- ✅ `discover` Edge Function deployed (verify_jwt on).
- ⚠️ No linter configured (not a regression; see §9).
- 🔴 No on-device run yet — the gating release blocker.
