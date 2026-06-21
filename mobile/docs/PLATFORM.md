# Platform & Roadmap

PeakPlant is becoming a **customizable platform** (PP-020): a calm diary at its
core, with optional capabilities each user can switch on or off. Nothing beyond
the core is required, and the core — collecting moments together + buying
physical card sets/products — always works.

This is built **additively, in small reviewed increments**, never as one giant
generation. Each capability is a feature flag (`lib/features.ts`) plus its own
data/UI, so turning it off removes it cleanly and adding the next one doesn't
rebuild what exists.

## Feature flags (`lib/features.ts`)

| Flag | Status | What it is |
|------|--------|-----------|
| `streaks` | **live** | Shared rhythm — opt-in weekly streak, themed per space (🌶️/🌻). |
| `rituals` | soon | Turn a loved moment into something recurring. |
| `missions` | **live** | Small real-world things to do together, suggested by AI. |
| `localShops` | **live** | Nearby + partner places to share a moment in (revenue). |
| `challenges` | **live** | Finite, no-pressure challenges for a space. |
| `communities` | soon | Optional circles beyond private spaces. |
| `feed` | soon | A finite, private feed across your spaces. |

Users manage these on the **Customize** screen. `soon` items are shown as a
visible roadmap (disabled) so the direction is honest and legible.

## Build phases

Adapted from the sister project's build sequence, scoped to PeakPlant's
private-spaces model (no public network, no business portal until much later).

1. **Core (done).** Spaces (couple + friends, multi-membership), cards, diary,
   per-space card progress, AI card suggestion, accessibility, security/AI docs.
2. **Shared rhythm (done).** Opt-in themed streaks; feature-flag backbone;
   Customize screen.
3. **Rituals.** A loved moment → a gentle recurring prompt for the space.
4. **Moments to do together + local places (done).** AI-suggested real-world
   moments tied to optional **local partner places** (Innsbruck pilot) — the
   first revenue stream beyond product sales. No purchase ever required to
   participate; partner places carry a small, transparent perk.
5. **Challenges (done).** Finite, badge-not-score challenges a space can opt
   into; progress counts moments preserved after joining.
6. **Communities & feed.** Optional, finite, private-first — only after the
   private loop is validated.
7. **Backend (foundation started).** Supabase (EU): SQL migrations + deny-by-
   default RLS + auth/space-linking design are in `supabase/`. Going live needs
   a real Supabase project + credentials (human O-item). See SECURITY,
   ARCHITECTURE, and supabase/README.
8. **Testing & release.** Unit tests (done: streaks, together, challenges),
   RLS/concurrency tests (backend phase), CI, then store release.

## Revenue model (staged)

- **Now / always:** first-party shop — physical card sets, editions, future
  physical collectibles. The product is **physical**, not digital.
- **Phase 4+:** local partner places (a fixed, transparent model — never selling
  ranking, never requiring a purchase to participate), and AI-suggested shared
  moments that bring people into real-world places.
- **Excluded for now:** advertising, data resale, competitive scoring, public
  marketplace.

## Guardrails carried into every phase

- Opt-in and reversible; the core never gated (PP-020).
- No pressure mechanics: streaks are collectible nudges, not threats (PP-021).
- Private by default; cross-space and cross-app sharing is user-initiated and
  per-item, never automatic (PRIVACY, SECURITY).
- AI stays server-side, explainable, and within the approved signal taxonomy
  (AI_SAFETY).
