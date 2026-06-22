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

### TogetherMoment (catalog, in-app)
Enriched activity ideas: `id`, `title`, `idea`, `category`, `spaceTypes`,
`priceBand`, `indoorOutdoor`, `avgDurationMin`, `energy`, `idealTimeOfDay`,
`weatherFit`, `linkedCardIds`, `placeId?`. Static catalog in `lib/together.ts`.

### LocalPlace (catalog, in-app)
Enriched partner venues: `id`, `name`, `area`, `priceBand`, `indoorOutdoor`,
`accessibility[]`, `tags[]`, `provenance`, `lastVerifiedAt`, `lat?`, `lng?`,
`isPartner`, `perk?`. Static catalog in `lib/together.ts`.

### DateConstraints (ephemeral, never stored)
Per-request struct that shapes Discovery picks: `spaceType`, `goals[]`,
`timeOfDay`, `indoorOutdoor`, `maxDurationMin`, `maxBudget`, `weather`,
`categories[]`, `energy`, `excludeIds[]`. Lives only for the duration of one
recommend call — never persisted as a profile (PP-030).

### DateRecommendation (transient)
The recommender's output: `id`, `momentId`, `title`, `concept`, `placeId?`,
`place?`, `why`, `signalsUsed[]`, `signalsNotUsed[]`, `facts[]` (each with
a `provenance` label), `estDurationMin`, `priceBand`, `indoorOutdoor`,
`isAlternative?`, `freshnessAt`. Never stored; only a snapshot is kept if saved.

### SavedDate (persisted, space-scoped)
`id`, `spaceId`, `momentId`, `title`, `concept`, `priceBand`, `estDurationMin`,
`status` (`idea` | `saved` | `planned` | `completed` | `dismissed`), `savedAt`,
`plannedFor?`, `completedAt?`, `memoryId?`. The `memoryId` field closes the
Discover→experience→Diary loop when a completed date becomes a memory.
Migration: `0005_date_discovery.sql`. Repository: `ISavedDateRepository`.

### DatePreferences (persisted, space-scoped)
Explicit preferences a couple sets: `spaceId`, `userId?`, `scope` (`couple` |
`member`), `categories[]`, `budgetBand?`, `indoorOutdoor?`, `maxTravelMin?`,
`dietary[]`, `accessibility[]`. Inspectable and deletable via the Personalization
screen. Migration: `0005_date_discovery.sql`.

### PersonalizationSignal (persisted, space-scoped)
One inspectable signal: `spaceId`, `userId?`, `kind`, `value`, `source`
(`explicit` | `behavioral`), `createdAt`. Shown in full on the Personalization
screen; any row can be deleted by the user. Sensitive inferences are never stored
(PP-014). Migration: `0005_date_discovery.sql`.

### DateFeedback (persisted, space-scoped)
Post-date rating: `spaceId`, `savedDateId?`, `userId?`, `rating` (−1 or +1),
`reason?`, `createdAt`. Feeds ranking improvements; never used for ads or resale.
Migration: `0005_date_discovery.sql`.

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
