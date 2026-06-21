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

## Sensitive edition controls (Soft & Wild — Edition 02)

Edition 02 is flagged `sensitive: true`. The following controls are active:

### Implemented

- **Biometric / device-lock gate** (`lib/hooks/useBiometric.ts`): opening the
  Soft & Wild edition from the Grow tab requires Face ID, Touch ID, or the
  device passcode. If no biometric method is enrolled the user is allowed through
  (can't gate without an auth method). The session stays unlocked until the app
  is backgrounded, then re-locks.
- **Background privacy overlay** (`lib/hooks/usePrivacyOverlay.ts`,
  `components/ui/PrivacyScreen.tsx`): while the edition diary is open, moving
  the app to the background replaces the screen with a blank PeakPlant cover so
  intimate content never appears in the app-switcher thumbnail.
- **"Stays private" UX signals**: a "private · device only" badge on the
  edition card in the Grow tab, and a "this diary stays private on your device"
  note in the edition diary header.
- **"This stays private on your device"** note in the Preserve CTA on any card
  belonging to a sensitive edition (`app/card/[id].tsx`).

### Pending

- Hide memory photo / note from lock-screen and notification previews (requires
  a notification layer to exist first; set `content-available: 0` on iOS and
  `visibility: private` on Android when notifications are added).
- Avoid automatic iCloud / Google Photos backup of sensitive memory photos (set
  `NSPhotoLibraryUsageDescription` and guide users, or save to a non-backed-up
  location such as the app's `Documents` directory with appropriate
  `NSFileProtection` class).
- Per-member access visibility: show which space members can see this diary.
- 18+ self-attestation gate before first access to an intimate edition.

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
