# Decision Register

Single source of truth for product and architecture decisions. Adapted from a
governance model proven on a sister project — the point is that decisions are
explicit, traceable, and not silently re-invented.

**Build agents may implement DECIDED entries. They may not resolve OPEN
decisions by assumption — surface them instead.**

## Status taxonomy

- **DECIDED** — approved; follow it unless a later DECIDED entry supersedes it.
- **TO VALIDATE** — current hypothesis; must be tested with users/data/legal
  before it hardens into DECIDED.
- **OPEN** — no choice made yet; do not invent one.
- **DEFERRED** — intentionally postponed beyond current scope.
- **REJECTED** — explicitly excluded; conflicts with strategy, trust, or scope.

## Source-of-truth hierarchy

1. Latest DECIDED entry below.
2. The docs in this folder (PRODUCT, ARCHITECTURE, DATA_MODEL, DESIGN_SYSTEM,
   PRIVACY, SECURITY, AI_SAFETY).
3. Recorded Product Owner clarification.
4. Prototype / source material — never authoritative on its own.

AI-generated assumptions are never authoritative.

## Confirmed decisions

| ID | Domain | Decision | Status |
|----|--------|----------|--------|
| PP-001 | Product | PeakPlant is a private two-person couple diary built around physical Moment Cards. It is not a question game, social network, productivity tracker, or relationship-scoring app. | DECIDED |
| PP-002 | Social model | The **space** is the social unit — a small, private, invite-only group of people who share a diary. A couple is one space type; friends spaces use the identical model. There is no public profile, follower graph, or feed. | DECIDED |
| PP-019 | Spaces | A user can belong to **multiple spaces at once** (one couple space and several friends spaces). Everything — memories, card progress, suggestions — is scoped per space. Switching space switches the whole diary context. | DECIDED |
| PP-020 | Platform | PeakPlant grows into a **customizable platform**: optional capabilities (shared rhythm, rituals, moments-to-do-together, local places, challenges, communities, feed) are **feature flags** a user turns on/off. The core (collecting moments + physical products) always works and is never gated. Built additively on the existing skeleton, in small reviewed increments (per D-023-equivalent). | DECIDED |
| PP-021 | Shared rhythm | An opt-in weekly **streak** is a positive, collectible nudge to share more moments together — themed per space (couples collect 🌶️ chillis, friends collect 🌻 sunflowers). No daily pressure, no loss/threat framing, fully switch-off-able. | DECIDED |
| PP-022 | Revenue | "Moments to do together" can link to **local partner places**. Partner places may offer a small, transparent perk; participation never requires a purchase. This is the first revenue stream beyond product sales. Aggregate, privacy-safe — no per-user commercial profiling. | DECIDED |
| PP-023 | Quality | PeakPlant ships in small reviewed increments verified by `tsc` (typecheck), Vitest (pure-logic unit tests), and `expo export` (build). P0 invariants get explicit tests; checks are run for real, not assumed (see TESTING). | DECIDED |
| PP-003 | Behavioral design | No points, scores, ratings, completion %, loss countdowns, or fabricated peer activity. Progress copy is non-punitive. **Amended by PP-021:** a gentle, opt-in "shared rhythm" streak is allowed as a positive collectible, without loss/threat framing. | DECIDED |
| PP-004 | Iconography | No pink hearts, gamification visuals, or progress bars. Editorial, minimal, warm. | DECIDED |
| PP-005 | Cards | Each edition ships 20 Moment Cards. Couples pick any card in any order; ~12 moments over ~12 weeks is a gentle suggestion, never a rule. | DECIDED |
| PP-006 | Intimacy Collection | A separate 20-card Intimacy Collection is distributed randomly inside condom boxes, never required to complete the main experience. | DECIDED |
| PP-007 | Age policy | The Intimacy Collection and any explicit content are 18+ with adult self-attestation. Biometric age estimation and routine ID onboarding are excluded. | DECIDED |
| PP-008 | Architecture | Mobile client is Expo / React Native (Expo Router, typed routes). Next.js powers the web/shop surface. | DECIDED |
| PP-009 | Data plane | Supabase (Postgres, Auth, Realtime, Storage) in an **EU** region is the target backend. The MVP is local-first via AsyncStorage behind a repository interface. | DECIDED |
| PP-010 | Access pattern | The UI never talks to the backend directly — only through repository interfaces. Critical writes (unlocks, purchases) route through atomic server-side commands. | DECIDED |
| PP-011 | Privacy | Diary photos and notes are private to the two members, never public, never auto-shared, never used for analytics or model training. | DECIDED |
| PP-012 | Security | Deny-by-default RLS, least privilege, server-side AI calls, EU data region, and environment separation are designed from day one. | DECIDED |
| PP-013 | AI | AI is a personalization/assistance layer that serves the couple, never sales. It is server-side only, behind an internal abstraction, with a portable provider. | DECIDED |
| PP-014 | AI consent | Material personalization is opt-in and reversible; the user can see why something was suggested. Sensitive inference (clinical, sexual-health, relationship-risk scoring) is prohibited. See AI_SAFETY. | DECIDED |
| PP-015 | Growth | Physical cards, boxes, and per-card QR codes are the primary offline-to-app acquisition channel. QR codes carry signed routes with no personal data. | DECIDED |
| PP-016 | Revenue | Monetization is first-party shop sales of physical card sets / editions and digital packs. No advertising, no data resale. | DECIDED |
| PP-017 | Design | Mobile design tokens mirror the website exactly (colors, type weights 200–300, spacing scale). See DESIGN_SYSTEM. | DECIDED |
| PP-018 | Build | The MVP is small but built on an extensible skeleton (repository + AI abstraction) so later capabilities are additive, not rebuilds. | DECIDED |

## Open decision queue

| ID | Domain | Decision required | Status | Blocks |
|----|--------|-------------------|--------|--------|
| O-001 | Auth | Auth method for the Supabase phase: email OTP / magic link (likely P0) plus Apple & Google (P1) via account linking. | OPEN | Couple linking, store review |
| O-002 | Couple linking | Exact invite/redeem flow and token expiry that connects two members into one couple. | OPEN | Backend, onboarding |
| O-003 | Shop checkout | Hosted external checkout vs. integrated commerce for card-set sales; payment provider for the EU market. | OPEN | Shop scope, legal docs |
| O-004 | AI scope | Which concrete personalization the launch AI does (card suggestion, reflection prompts) and which provider/model, within the AI_SAFETY signal taxonomy. | OPEN | AI build, evaluation suite |
| O-005 | Realtime | Whether the shared diary uses Supabase Realtime at launch or refetch-on-focus only. | TO VALIDATE | Sync UX |
| O-006 | Retention | Concrete retention windows for photos, notes, audit logs, QR scans, and deleted-account grace period. | TO VALIDATE | Privacy/legal |
| O-007 | Legal | Confirm GDPR, consumer-rights (withdrawal/refund), and Austrian/German requirements before public launch and shop go-live. | OPEN | Public launch |

## Rejected and deferred

| ID | Choice | Status | Reason |
|----|--------|--------|--------|
| R-001 | Relationship scoring, leaderboards, ranking | REJECTED | Conflicts with the product thesis (no pressure, no scoring). Note: gentle opt-in streaks are now allowed (PP-021); competitive scoring/ranking is not. |
| R-002 | Public social feed / follower graph | REJECTED | PeakPlant is a private two-person diary. |
| R-003 | Using diary content for AI training or advertising | REJECTED | Trust is the product for an intimacy brand. |
| R-004 | Making a public share mandatory to unlock content | REJECTED | Coercive sharing undermines trust. |
| R-005 | Editions beyond 01 built before edition 01 ships | DEFERRED | Validate the first edition loop first. |

## Launch gates

- **Gate A — Backend & Trust:** RLS deny-by-default verified, deletion + restore
  rehearsed, EU region confirmed, EXIF strip + signed media access live.
- **Gate B — AI:** AI_SAFETY evaluation suite passes; crisis route and opt-out
  verified; no sensitive-signal use.
- **Gate C — Commerce:** EU consumer-rights flows (pre-contract info, withdrawal,
  refund, digital-content consent) implemented for the shop.
- **Gate D — Public launch:** independent security/privacy review and legal
  classification completed.
