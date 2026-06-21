# Data Model

Types live in `lib/types.ts`. The MVP persists `Memory` and `MomentCard` via
AsyncStorage; the rest are modelled for the Supabase phase.

## Entities

### Space
`id`, `type` (`couple` | `friends`), `name`, `inviteCode`, `createdAt` — the
shared container people preserve moments in. A couple is just one kind of space;
friends spaces use the identical model. This is the unit everything else is
scoped to.

### SpaceMember
`id`, `spaceId`, `userId`, `name`, `role` (`owner` | `member`), `joinedAt` — the
join between a user and a space. A single user can hold many memberships, so one
person can belong to a couple space **and** several friends spaces at once.

### User
`id`, `name` — a single person. Membership lives in `SpaceMember`, not on the
user. Auth is mocked in the MVP.

### CardActivation
A card's progress is **per space**: each space discovers cards independently.
In the MVP this is stored as `spaceId → cardId[]`; in the Supabase phase it
becomes a `CardActivation` row (`spaceId`, `cardId`, `activatedAt`).

### Edition
`id`, `name`, `subtitle`, `description`, `cards[]`, `coverImage?` — a seasonal
set. Launch edition: `edition-01` "Grow Together".

### MomentCard
`id`, `number`, `prompt`, `type` (`question` | `action`), `edition`,
`status` (`sealed` | `activated`). `status` is **derived per space** from
CardActivation — the same card can be activated in one space and sealed in
another.

### Memory
`id`, `cardId`, `spaceId`, `note`, `photoUri?`, `createdAt`, `updatedAt`.
The unit of the diary — a preserved moment tied to a card, owned by one space.

## Future entities (Supabase phase)

- **IntimacyCard** — the separate condom-box collection per edition
- **MemoryPhoto** — multiple photos per memory (1–2), with order
- **SpaceInvitation** — invite token, expiry, accepted state

A production `Memory` will also carry optional `location`, `createdBy`, and a
`photos[]` array rather than a single `photoUri`.

## Modelling conventions (Supabase phase)

- **Space-scoped by default.** Every personal-domain table carries `spaceId`
  and is governed by deny-by-default RLS keyed on space membership — a row is
  visible only to members of its space (see SECURITY).
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
