# PeakPlant Mobile — Docs Index

Start with the **Decision Register** — it is the source of truth and tells you
what is DECIDED vs. OPEN before you build.

| Doc | Purpose |
|-----|---------|
| [DECISION_REGISTER](./DECISION_REGISTER.md) | Governance, confirmed decisions, open queue, launch gates. |
| [PRODUCT](./PRODUCT.md) | Concept, editions, cards, Intimacy Collection. |
| [PLATFORM](./PLATFORM.md) | Customizable feature flags, build phases, staged revenue model. |
| [TESTING](./TESTING.md) | Test stack, what's verified, pyramid, and conventions. |
| [BACKEND](./BACKEND.md) | Supabase auth, space-linking, RLS matrix, go-live steps. |
| [LAUNCH_READINESS](./LAUNCH_READINESS.md) | What's done, gaps to pilot/launch, what needs a human. |
| [STORE_LISTING](./STORE_LISTING.md) | App Store / Play metadata, privacy answers, checklist. |
| [ARCHITECTURE](./ARCHITECTURE.md) | App layers, repository pattern, Supabase-phase targets. |
| [DATA_MODEL](./DATA_MODEL.md) | Entities and Supabase-phase modelling conventions. |
| [DESIGN_SYSTEM](./DESIGN_SYSTEM.md) | Colors, type, spacing, components, rules. |
| [UX_GUIDELINES](./UX_GUIDELINES.md) | Experience principles, state/recovery, accessibility, motion, voice, definition of done. |
| [AI_SAFETY](./AI_SAFETY.md) | AI personalization policy, sensitive text, crisis route, authority boundary. |
| [SECURITY](./SECURITY.md) | RLS, media privacy, age gating, retention, incident response. |
| [PRIVACY](./PRIVACY.md) | User-facing privacy principles. |
| [MVP_ACCEPTANCE_CRITERIA](./MVP_ACCEPTANCE_CRITERIA.md) | What the MVP must do. |

**Rule for build agents:** implement DECIDED entries; never resolve an OPEN
decision by assumption — surface it to the Product Owner.
