# UX Guidelines

The craft layer that turns PeakPlant from a working app into a professional one.
The mechanics (cards, diary) live in PRODUCT; the look lives in DESIGN_SYSTEM.
This doc defines how the app *behaves* — principles, states, accessibility,
motion, and microcopy.

## UX north star

A couple should be able to open a card, understand the invitation, preserve a
moment without friction, and find it again later — calmly, privately, with no
pressure and no scoring.

## Experience principles

- **One clear next step.** Every screen has one dominant action; secondary
  actions stay visible without competing.
- **Warm, never coercive.** No guilt, urgency traps, streak threats, or loss
  framing. Reset/empty language is neutral (PP-003).
- **Private by default.** Photos, notes, and any sharing are off/private until
  the couple actively chooses otherwise.
- **AI is legible.** Any suggestion names the signals it used and offers a way to
  change or disable them (see AI_SAFETY).
- **Critical actions are explicit.** Deleting a moment, deleting an account, or
  unlocking 18+ content requires clear confirmation and canonical status — never
  inferred from an animation.
- **Graceful reduction.** The core loop stays coherent without photo access, push
  permission, network, or an AI provider. Each is additive, never required.
- **Finite surfaces.** Bounded lists, purposeful sections. No infinite-scroll,
  no engagement-maximizing feed. (PeakPlant is a diary, not a feed.)
- **Calm responsiveness.** Acknowledge input immediately, preserve drafts, and
  communicate waiting without panic.
- **Accessible from the first build.** Contrast, touch targets, screen-reader
  semantics, dynamic type, focus order, and reduced motion are requirements, not
  polish.

## Layout rules

- 4 pt spacing grid; 24 pt standard screen padding (`Spacing.screen`); 24–32 pt
  between major sections.
- One primary action per screen, in the natural thumb zone where practical.
- Lists are finite/paginated — never infinite scroll.
- Destructive actions use a distinct style and an explicit confirmation.
- Important status shows inline and persists until resolved; a toast is never the
  only confirmation.
- Bottom sheets are for short choices only. Long forms and critical actions use
  full screens or dialogs.

## State & recovery

Every screen must design these states, not just the happy path:

| State | Required behavior |
|-------|-------------------|
| Loading | Acknowledge immediately (skeleton/quiet indicator); no indefinite spinner; timeout → retry or safe exit. |
| Empty | Explain why it's empty and offer one useful next action (e.g. "scan a card to begin"). Never fabricate content. |
| Offline | Persistent offline banner; allow loaded content + safe drafts; label pending sync. |
| Pending sync | Show local timestamp ("saved on this phone"); do not confirm server-only results until accepted. |
| AI unavailable | Fall back to a deterministic suggestion or hide the widget; never fabricate a personalized explanation. |
| Permission denied | Continue without photo/push; do not repeatedly pressure. |
| Session expired | Re-authenticate and return to the intended destination with drafts preserved. |
| Duplicate action | Return the existing result; never create duplicate moments, unlocks, or purchases. |
| Not found | Neutral message + a clear way back. |
| Provider outage | Keep core data intact; degrade non-critical features; communicate without jargon. |

## Accessibility (release requirements)

- **Contrast:** normal text meets WCAG AA 4.5:1; large text/essential icons meet
  AA. Verify the warm-grey muted tokens against their real backgrounds.
- **Touch targets:** interactive controls ≥ 44×44 pt; primary buttons ≥ 48 pt
  high (PeakPlant `Button` is 52).
- **Dynamic type:** core flows survive 200% text scaling without clipping or
  hidden actions.
- **Screen readers:** every control has a role, label, state, and hint where
  useful; decorative images are ignored. (`accessibilityRole`/`accessibilityLabel`
  on `Button`, `MomentCardItem`, `MemoryCard`, FAB, and back buttons.)
- **Focus order:** follows visual/task order; dialogs trap focus and return it on
  close.
- **Color independence:** status/selection never rely on color alone (the
  suggested-card cue is a border + text label, not just gold).
- **Forms:** labels stay visible; errors are specific and announced; input is
  preserved.
- **Language:** plain English at ~B1–B2 for core actions; legal detail can link
  out.

## Motion & haptics

- Transitions 150–250 ms; a success may extend to ~400 ms if it doesn't delay the
  next action.
- Completion uses a subtle expansion/check/soft pulse. **No confetti, slot-machine
  effects, or escalating celebration** (consistent with PP-003/PP-004).
- Haptics confirm save/preserve and successful unlock; they supplement visual
  feedback and are never the only confirmation.
- **Reduced Motion** removes non-essential animation and replaces animated
  progress with static state changes.
- Optimistic UI only for low-risk reversible actions (e.g. selecting a goal
  chip). Deletion, account deletion, purchases, and 18+ unlocks stay pessimistic
  (confirm against the server).

## Content design (voice)

Warm, direct, specific, lowercase, non-judgmental. No moral superiority, no
performance language, no false intimacy, no hype.

| Moment | Use | Avoid |
|--------|-----|-------|
| Empty diary | "no moments yet. scan a card to begin." | "You haven't completed anything!" |
| Preserve | "preserve this moment" | "Save your progress / +1" |
| Offline save | "saved on this phone. we'll sync when you're back online." | "Upload failed." |
| Suggestion | "fits your goal: deeper conversations" | "Our AI knows what you need." |
| Cadence | "twelve moments over twelve weeks — a gentle rhythm, not a rule." | "You're behind. Catch up!" |
| Delete | "delete this moment? this can't be undone." | "Are you sure???" |
| 18+ gate | "this collection is for adults (18+)." | clinical or shaming framing |

## Privacy UX

- Explain the benefit before each optional permission request.
- Push permission requested only after the couple has felt value (preserved a
  moment), never on launch.
- Photo and note are optional and private by default; sharing anything is an
  explicit, user-initiated choice (and in PeakPlant, sharing is only ever within
  the couple).
- "Why this suggestion?" names the actual signals used and offers controls.

## UX definition of done

A screen or component is done only when:

- its purpose and primary action are unambiguous;
- loading, empty, error, offline, denied, and duplicate states are designed;
- copy is final enough to test and respects the voice above;
- accessibility labels, focus, scaling, contrast, and reduced motion are handled;
- it uses approved design tokens and carries no hidden domain logic;
- critical state is confirmed from the server, not inferred from animation;
- it traces back to a PRODUCT requirement or a DECISION_REGISTER entry.

## What PeakPlant deliberately does NOT take from the sister app

No infinite feed, communities, events, missions, challenges, leaderboards,
vouchers, business portal, or discovery map. PeakPlant is a private two-person
diary — the UX craft transfers; the participation-network surfaces do not.
