# PeakPlant Mobile — Docs Index

Start with the **Decision Register** — it is the source of truth and tells you
what is DECIDED vs. OPEN before you build.

| Doc | Purpose |
|-----|---------|
| [DECISION_REGISTER](./DECISION_REGISTER.md) | Governance, confirmed decisions, open queue, launch gates. |
| [PRODUCT](./PRODUCT.md) | Concept, editions, cards, Intimacy Collection. |
| [ARCHITECTURE](./ARCHITECTURE.md) | App layers, repository pattern, Supabase-phase targets. |
| [DATA_MODEL](./DATA_MODEL.md) | Entities and Supabase-phase modelling conventions. |
| [DESIGN_SYSTEM](./DESIGN_SYSTEM.md) | Colors, type, spacing, components, rules. |
| [AI_SAFETY](./AI_SAFETY.md) | AI personalization policy, sensitive text, crisis route, authority boundary. |
| [SECURITY](./SECURITY.md) | RLS, media privacy, age gating, retention, incident response. |
| [PRIVACY](./PRIVACY.md) | User-facing privacy principles. |
| [MVP_ACCEPTANCE_CRITERIA](./MVP_ACCEPTANCE_CRITERIA.md) | What the MVP must do. |

**Rule for build agents:** implement DECIDED entries; never resolve an OPEN
decision by assumption — surface it to the Product Owner.
