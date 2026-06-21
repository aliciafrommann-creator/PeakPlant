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
