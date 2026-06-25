# Product

## Concept

PeakPlant creates physical moment cards for couples, connected to a shared
digital diary. Each card invites a couple to consciously experience and preserve
a real moment together.

physical card → shared experience → QR scan → photo and note → growing diary

PeakPlant is not a question game, social network, productivity tracker, or
relationship-scoring app. The cards are starting points for memories that remain
visible long after the conversation or experience has ended.

**Core promise:** collect moments. grow together.

## Product loop (Discover · Together · Diary)

The app is organized as one relationship loop across three pillars:

1. **Discover** — "what could we do together?" — curated date ideas plus live
   provider-backed places or generic place intents, surfaced by a deterministic recommender and (later) a
   server-side AI. Replaces the former static Us tab. Every suggestion is
   explained ("why this?"), filterable, and honest about what signals were or
   were not used.
2. **Together** — light support during and between experiences: saved ideas,
   challenges, and the shared rhythm streak. Nothing required; everything opt-in.
3. **Diary** — the destination the loop returns to: the private space-scoped diary
   of notes and photos, growing with every preserved moment.

Each pillar feeds the next: a Discover idea becomes a Together plan; completing
it pre-fills a Diary memory; a growing diary improves the next Discover pick.

## Spaces

A **space** is the private container a small group shares a diary in. A couple is
the original space type; **friends spaces** use the exact same model — same
cards, same diary, same preserve-a-moment loop, just more people.

One person can be in **several spaces at once**: a couple space with their
partner and, say, a friends space with their Saturday crew. Everything is scoped
to the active space — its memories, its card progress, its suggestions — and a
switcher moves between them. Each space's diary is private to that space's
members; nothing is ever shared across spaces or made public.

> One model, many circles: the people you grow with aren't only a partner.

## Launch edition — Grow Together (Sunflower)

The first edition uses flowers, roots, and growth as symbols for relationships
that develop through shared attention and experiences.

Physical box:
- 20 Moment Cards (this edition's deck; decks range 15–20 cards)
- sunflower seeds / seed paper
- one small edition-specific extra
- a QR code on every card

Couples preserve roughly twelve moments over about twelve weeks, choosing any of
the 20 cards in any order. The twelve-week rhythm is a gentle suggestion, never
a completion rule.

## Two ways to grow (later phase)

Each edition will later gain an additional **Intimacy Collection** — 20 separate
cards distributed randomly inside PeakPlant condom boxes. These are *not* part of
the 20 standard Moment Cards and are never required to complete the main
experience.

> Every edition has two ways to grow: moments you choose and cards you discover.

## Editions roadmap

The **Grow** tab is the editions library. Opening an *available* edition shows
its diary; you scan the QR of the card you finished to preserve that moment
(note + photo), then can share it to other apps. *Upcoming* editions are shown
on the roadmap but not yet openable.

**An edition is a deck of 15–20 cards.** Edition 01 ships with 20; the exact
count of later editions is set as their cards are assigned and QR codes
generated, one edition at a time. In the data model this is `cardCount`
(`0` = deck not finalized yet) and `DECK_SIZE_RANGE` in `mobile/lib/seed.ts`.

**Thematic editions:**
01 Grow Together 🌻 *(available)* · 02 Soft & Wild 🌹 *(available, intimate)* ·
03 Love Languages 💬 · 04 In Presence 🌿 · 05 Far Away ✈️ · 06 Lovemaxing ✨ ·
07 Self Worth 🪞 · 08 Wild Cards 🎲 · 09 Hideout 🏕️

**Life-stage editions** (for a specific season of a relationship):
10 Just Started 🌱 *(dating / the beginning)* · 11 After Hours 🌙 *(busy couples)* ·
12 After Bedtime 🧸 *(parents)*

These are all **couples** editions (catalog: `mobile/lib/seed.ts → SEED_EDITIONS`).
Names/symbols/order are easy to adjust before any of these ship.

### Card structure inside an edition

Every edition splits its deck into three groups, with edition-specific labels
(`Edition.groupLabels`):

- **5 dates** — a shared activity (Grow Dates / Intimacy Dates)
- **5 acts** — a small, low-effort gesture (Small Acts of Growth / Small Sparks)
- **10 questions** — a reflective prompt (Growing Questions / Closer Questions)

After scanning, a card shows a flexible set of **sections** (`CardContent.sections`)
— typically *Before you begin / a "try this" block / Talk about it / Keep the
moment / Come back later*. Section content is authored per card in
`mobile/lib/content/edition0N.ts`; the renderer (`app/card/[id].tsx`) lays out
heading + paragraph + bullets + footer and attaches the "preserve" CTA to the
section flagged `preserveHere`.

### Bilingual (EN / DE)

The **physical card is English-first** (short printed `prompt`). The **in-app
experience is bilingual** — the user picks EN or DE at first launch
(`app/(auth)/language.tsx`, persisted in `store.language`). Text uses
`LocalizedText` (`string | { en, de }`); `useLanguage().l()` / `loc()` resolve
it. Today most card content is English-only; German is added per-field over time
without code changes.

### Soft & Wild — the intimate edition (sensitive)

Edition 02 follows the principle **intimacy without pressure, desire without
performance, curiosity with consent**. It is flagged `sensitive: true`, which
the UI uses for quieter privacy treatment (a "stays private on your device" note
on the preserve CTA today). Still **TODO** for a full intimate-content pass:
hide intimate previews in notifications / lock screen, biometric or device-lock
gating, avoid automatic cloud previews, never use private images for AI without
explicit consent, and per-member access visibility. Tracked in `docs/PRIVACY.md`.

## The flywheel: finish one, get the next

Editions are consumable physical sets. When a couple has collected an edition's
moments, the app gently points them back to the shop for a new one — there's
always a next edition for the next season. This is surfaced as a "get your next
edition" link at the end of an edition's diary and a quiet "get more editions"
link in the library. The shop URL lives in `lib/config.ts` (`SHOP_URL`). The
app never gates the diary behind a purchase; the link is an invitation, not a
wall.

## Friends: a space, not a product line (PP-026)

Friends use the same app — a **friends space** with the same diary and the same
couples-neutral editions (e.g. Grow Together, In Presence). PeakPlant does **not**
ship a separate friends *product line* at launch: the brand is couples/intimacy,
and a second SKU line would dilute it and double production + marketing. A
friends sub-brand is backlog, revisited once the couples line proves out.
