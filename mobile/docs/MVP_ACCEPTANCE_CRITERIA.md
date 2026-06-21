# MVP Acceptance Criteria

The MVP is a polished, local-first foundation. No real backend required.

## Functional

- [x] App launches to Welcome (first run) or straight to the tabs (returning).
- [x] Onboarding lets a user select shared goals; selection persists.
- [x] Invite screen shows a mock couple code and enters the app.
- [x] Tab navigation: Us · Moments · Scan · Grow.
- [x] Spaces: a user can belong to multiple spaces (couple + friends); a switcher
      changes the active space and all space-scoped content (memories, card
      progress, suggestions) follows.
- [x] A new space can be created (couple or friends) or joined via invite code.
- [x] Customizable platform: a Customize screen toggles optional features on/off;
      the core diary always works regardless.
- [x] Shared rhythm (opt-in): a gentle weekly streak, themed per space
      (couples 🌶️, friends 🌻), shown as a positive collectible with no
      loss/threat framing; switch-off-able.
- [x] Moments to do together (opt-in): AI-suggested real-world ideas per space,
      with a list + detail; gated by the `missions` feature.
- [x] Local places (opt-in): Innsbruck places with partner perks highlighted;
      gated by `localShops`; participation never requires a purchase.
- [x] Quality: `tsc --noEmit`, `vitest run` (pure logic), and `expo export`
      (build) all pass.
- [x] Preserving a moment activates its card **for the active space only**.
- [x] **Us** shows a weekly suggestion, a space note, and the latest moment.
- [x] **Moments** lists seeded memories; opening one shows its detail.
- [x] **Grow** shows the Grow Together edition with 20 cards (discovered/sealed),
      shown as "N of 20 discovered" (no completion %).
- [x] **Scan** shows a scan frame placeholder and a "try demo card" entry.
- [x] Card detail explains how to use the card and offers "preserve this moment".
- [x] Create memory: optional photo (image picker) + note; saves locally.
- [x] A newly created memory appears in the diary and opens in detail.
- [x] Preserving a moment marks its card as discovered.

## Quality

- [x] TypeScript strict, `tsc --noEmit` exits 0.
- [x] No streaks, points, scores, or completion-pressure UI.
- [x] No pink-heart / gamification iconography.
- [x] Mock auth isolated; no diary content logged.
- [x] Loading and empty states for the diary.

## Out of scope (next phases)

- Real Supabase auth, couple linking, secure photo storage
- Real QR camera decoding (placeholder + demo entry for now)
- AI personalization, social export, additional editions
