# Security & Trust

For an intimacy brand, trust *is* the product. This is the implementation-facing
companion to PRIVACY.md. See DECISION_REGISTER PP-007, PP-011, PP-012.

## Trust principles

Private-by-default · deny-by-default · least-privilege · explicit-audience ·
purpose-limited. Designed in from the first migration, not bolted on.

## Row-Level Security

- Every personal-domain table uses **deny-by-default** RLS from the first
  migration. No table is readable without an explicit policy.
- The core rule: a row is readable/writable only by members of its `spaceId`.
- Critical writes — preserving a moment, unlocking an Intimacy card, a purchase —
  execute as **atomic** server-side commands, never as multi-step client writes.
- Privileged/admin access uses named accounts with MFA, scoped permissions, and
  an immutable audit trail. Routine browsing of user data is prohibited;
  break-glass access is ticketed, time-limited, and audited.

## Media (couple photos)

- Stored in **private** buckets — never public URLs.
- **EXIF/GPS stripped** and images re-encoded before storage.
- Served only via short-lived **signed URLs** to authorized space members.
- Media paths are non-enumerable.

## Age & identity

- Intimacy Collection / explicit content gated to **18+** via adult
  self-attestation. No biometric age estimation, no routine government-ID
  onboarding.

## Location & device permissions

- No background or continuous location. If location is ever attached to a memory,
  it is opt-in, per-action, and never a prerequisite.
- The MVP does not upload contacts or read the calendar. Sharing uses the OS
  share sheet; any calendar entry is user-confirmed.

## Data rights & retention

- Self-service export, correction, and **account deletion**, with erasure from
  active systems within 30 days after a short grace period (windows tracked in
  O-006).
- A retention schedule is the default for photos, notes, audit logs, and QR
  scans; extensions require a documented purpose, basis, owner, and expiry.
- Invite/couple-link tokens can expire and be revoked.

## Offline & sync integrity

- Auth material in SecureStore; cached read models, drafts, and a mutation
  outbox in encrypted-at-rest local storage.
- Writes may queue offline, but unlocks and purchases finalize only after server
  acceptance (atomic). The client never grants entitlements on its own.

## Analytics & observability

- First-party, explicit analytics only. **No autocapture, no session replay.**
- Diary content (notes, photos) is never sent to analytics or error reporting;
  crash/error payloads are sanitized.

## QR & growth

- QR codes carry signed routes (edition/campaign) with **no personal data**.
- Scan attribution is measured without identifying the scanner.

## Vendors

Each third party requires a defined purpose, a DPA, an EU/approved region,
retention terms, and an exit plan. Diary content stays within the EU data plane.

## Incident response

Severity levels, named on-call ownership, evidence preservation, user protection
first, and GDPR 72-hour breach assessment.

## Launch gates (security)

- RLS deny-by-default verified with tests.
- Deletion and restore rehearsed.
- EXIF strip + signed media access live.
- Independent security/privacy review before public launch (PP launch Gate A/D).

## MVP status

All data is on-device (AsyncStorage); nothing leaves the phone, no network calls
carry memory content, and mock auth (`lib/mock-auth.ts`) is isolated and never
imported in app screens. The controls above are requirements for the Supabase
phase.
