# Data Model

Types live in `lib/types.ts`. The MVP persists `Memory` and `MomentCard` via
AsyncStorage; the rest are modelled for the Supabase phase.

## Entities

### Couple
`id`, `name`, `inviteCode`, `createdAt` — the shared space two members belong to.

### User
`id`, `name`, `coupleId` — a single member. Auth is mocked in the MVP.

### Edition
`id`, `name`, `subtitle`, `description`, `cards[]`, `coverImage?` — a seasonal
set. Launch edition: `edition-01` "Grow Together".

### MomentCard
`id`, `number`, `prompt`, `type` (`question` | `action`), `edition`,
`status` (`sealed` | `activated`). A card becomes `activated` when a memory is
preserved for it.

### Memory
`id`, `cardId`, `coupleId`, `note`, `photoUri?`, `createdAt`, `updatedAt`.
The unit of the diary — a preserved moment tied to a card.

## Future entities (Supabase phase)

- **CoupleMember** — join between User and Couple with role/joinedAt
- **IntimacyCard** — the separate condom-box collection per edition
- **CardActivation** — who activated which card, when
- **MemoryPhoto** — multiple photos per memory (1–2), with order
- **PartnerInvitation** — invite token, expiry, accepted state

A production `Memory` will also carry optional `location`, `createdBy`, and a
`photos[]` array rather than a single `photoUri`.

## Modelling conventions (Supabase phase)

- **Couple-scoped by default.** Every personal-domain table carries `coupleId`
  and is governed by deny-by-default RLS keyed on couple membership (see
  SECURITY).
- **Append-oriented activity vs. domain tables.** Activity/analytics-style events
  are append-only; financially or behaviorally distinct objects (entitlements,
  purchases) use dedicated domain tables with atomic writes — never overwriting a
  source record.
- **Consent & personalization signals** are their own entity: which signals the
  couple has opted into, inspectable and deletable (see AI_SAFETY). Sensitive
  inferences are never stored.
- **Age attestation** is recorded as a simple boolean/timestamp for 18+ gating,
  not derived from any biometric or document data.
- **Media** rows store EXIF-stripped paths in a private bucket, served via signed
  URLs; raw provider URLs are never persisted as public links.
