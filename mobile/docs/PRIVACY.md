# Privacy

Privacy is a core product requirement, not a feature. For an intimacy brand,
trust *is* the product.

## Principles

- A diary is **private** to the members of its space (a couple, or a friends group).
- Photos and notes are **never public** and **never auto-shared**.
- Diary content is **never** sent to product analytics or used for training.
- **Deletion** is always possible; invite tokens can expire.
- A member must hold a valid invitation to join a couple.
- Neither partner receives secret analysis about the other.

## MVP status

- All data is stored **on-device** (AsyncStorage). Nothing leaves the phone.
- No network calls carry memory content.
- Mock auth is isolated in `lib/mock-auth.ts` and never imported in app screens.

## Supabase phase requirements

- Row-Level Security (deny-by-default): a row is readable only by members of its
  `spaceId`.
- Private storage bucket for photos; EXIF/GPS stripped and re-encoded;
  non-enumerable media paths; short-lived signed URLs.
- EU data region; vendors bound by DPA and an exit plan.
- Explicit, revocable opt-in before any AI personalization; raw diary text is
  processed ephemerally and never stored as a durable profile (see AI_SAFETY).
- No private notes/photos used for recommendations, analytics, or model training.
- 18+ self-attestation for the Intimacy Collection / explicit content.
- Self-service export, correction, and account deletion (active-system erasure
  within 30 days after a grace period).

See **SECURITY.md** for the implementation-facing controls (RLS, atomic writes,
audit, incident response) and **AI_SAFETY.md** for the AI policy.
