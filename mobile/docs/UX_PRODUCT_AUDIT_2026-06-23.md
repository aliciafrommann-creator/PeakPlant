# PeakPlant UX & Product Loop Audit — 2026-06-23

This audit uses the latest Claude branch through commit `0f3fc63`, merged only
into the isolated local branch `codex/ux-product-loop`. Nothing here is deployed
or merged to `main`.

## Honest verdict

PeakPlant now has a strong, distinctive emotional foundation. It is calmer and
more intimate than Instagram or Strava, which is the right product choice.
Before this patch, however, the core date loop still felt fragmented:

`recommendation -> detail -> preserve a memory`

That skipped the real-life middle. The intended loop is now explicit:

`discover -> save -> plan -> calendar -> experience -> memory -> feedback -> rediscover`

The app is materially smoother after this patch, but it should not yet be called
Instagram-level polished until the complete loop has passed repeated on-device
tests with two real accounts.

## Psychological model

PeakPlant should create return motivation without turning a relationship into a
scoreboard. The strongest principles in the current product are:

- **Low pressure:** optional actions and gentle language protect autonomy.
- **Immediate acknowledgement:** saves, filters, plans, and completions now
  produce visible state changes and best-effort haptics.
- **Shared identity:** memories, editions, and private ratings belong to the
  couple/friends space rather than an individual performance profile.
- **Anticipation:** planning and a real calendar handoff create a reason to come
  back before the experience.
- **Meaningful closure:** completing an idea flows into a private memory and
  then an optional practical rating.
- **Recognition over novelty addiction:** a place can later surface what this
  device's space previously enjoyed, without fabricating community popularity.

The app should keep avoiding infinite-scroll pressure, public streak comparison,
relationship scores, or guilt-based notifications.

## Highest-impact findings

### Fixed in this patch

1. The main `Community` tab was a coming-soon dead end. It is now a useful
   `Places / Orte` surface with an OpenStreetMap view, curated Innsbruck places,
   directions, linked ideas, and the device's own private feedback.
2. Idea detail jumped directly to memory creation. It now gives one clear
   status-aware path: plan, open plan, preserve, or view the resulting memory.
3. Saving and planning were separate screens without a handoff. Opening planning
   from an idea now takes the user directly to that idea's planning sheet.
4. Calendar export used the export day rather than the planned day. Planning now
   stores a validated calendar date and shares a real `.ics` file where the
   platform supports file sharing.
5. Saved cards exposed too many equal-weight actions. Actions are now ordered by
   status: the next meaningful action is primary; share/remove are tertiary.
6. Feedback copy implied future public display without a consent step. The beta
   UI now states that feedback is private and device-local.
7. German users saw English tab labels. Main tab labels now follow the selected
   language.

### Still intentionally not faked

- The map contains curated PeakPlant places plus optional live provider places
  only after a user tap. It still does not claim live availability/open hours.
- There is no background GPS tracking, booking, transit, or routing provider.
- Feedback is local to the current device and space-scoped; it is not a
  cross-device or public community rating.
- Public community recommendations require a backend, moderation, reporting,
  consent, and deletion controls.
- AI is available through the deployed Supabase `discover` function when its
  Anthropic secret is present. Curated fallback remains the resilience path.
- Monetization infrastructure exists, but charging remains disabled until store
  products and RevenueCat are deliberately enabled.

## Product recommendations after beta

1. Run five paired usability sessions using the exact loop above and measure
   completion, confusion, and abandonment at each transition.
2. Move feedback to a Supabase repository before presenting it as shared between
   partners or devices.
3. Add moderated public place tips only as a separate opt-in publishing action.
4. Add a real places provider server-side if PeakPlant expands beyond Innsbruck;
   never ship provider secrets in the app.
5. Add privacy-safe funnel analytics only after consent:
   `idea_opened`, `idea_saved`, `date_planned`, `calendar_shared`,
   `date_completed`, `memory_created`, `feedback_saved`.
6. Keep the visual system editorial and warm; spend polish effort on loading,
   transition, empty, success, and error states rather than adding more features.

## Verification

- TypeScript: clean.
- ESLint: zero errors; five pre-existing warnings outside this patch remain.
- Vitest: 260/260 passing across 28 files.
- Android production export: successful (1,110 modules).
- Physical Android/iOS interaction QA: still required before release.
