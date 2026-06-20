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
