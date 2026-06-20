# Privacy

Privacy is a core product requirement, not a feature. For an intimacy brand,
trust *is* the product.

## Principles

- The diary is **private** to the two connected couple members.
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

- Row-Level Security: a row is readable only by members of its `coupleId`.
- Private storage bucket for photos; non-enumerable media paths; signed URLs.
- Explicit, revocable opt-in before any AI personalization.
- No private notes/photos used for recommendations without consent.
