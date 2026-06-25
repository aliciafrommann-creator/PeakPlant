# PeakPlant — Product Reconstruction & Date Discovery Strategy

> Status: **strategy / proposal document**. No application code is changed by this file.
> Everything under "EXISTING" is reconstructed from the repository. Everything under
> **PROPOSAL** is a recommendation, not current functionality.
> Grounded in: `mobile/` (Expo app), `app/` (Next.js shop), `supabase/` (SQL),
> and `mobile/docs/` (decision register PP-001…PP-026, O-001…O-007, R-001…R-005).

---

## 0. Executive summary

PeakPlant is **not** "a card scanner with a diary." The repository reveals a deliberately
architected **private relationship platform**: a space-scoped diary at the core (couple or
friends), fed by physical card editions, with an *additive feature-flag platform* already
carrying four live optional layers (shared rhythm/streaks, moments-to-do-together,
live/provider places, challenges) and three more scaffolded (rituals, communities, feed).
Crucially for this brief, **Date Discovery already exists in embryonic form**: `lib/together.ts`
defines `TogetherMoment` activity ideas and `LocalPlace` venues (a curated Innsbruck set with
generic place intents), a deterministic goal→category recommender (`pickTogetherMoment`), and an AI
abstraction (`lib/ai/`) whose stub explicitly lists `location`, `time of day`, `weather` as
**`signalsNotUsed`** — i.e. an intended geo/temporal recommender that has not been built.

The single most important strategic finding: **Date Discovery is a sanctioned extension, not a
pivot.** Decision **PP-022** now treats partner venues as future verified relationships only;
current places are generic intents or live provider results. **PP-013/PP-014** already define a
server-side, opt-in, explainable AI. The smallest validating version of Date Discovery can be
built almost entirely by *enriching `together.ts` data and wiring the already-designed AI
interface* — no new product thesis required.

Recommended MVP approach (detail in §16): **curated-local + AI personalization** — extend the
existing curated places with structured fields (time, duration, budget, indoor/outdoor,
transport, coordinates), and use a server-side Claude Edge Function for progressive questioning,
ranking, and plain-language explanation. This validates desirability *without* taking on the cost,
privacy surface, and operational complexity of live Places/Events/transport APIs, while honoring
the hard rule "the AI must not invent venues" (because MVP venues are curated and verified).

---

## 1. Complete existing feature inventory

Legend — Status: **Live** (built & wired) · **Scaffolded** (code exists, not active) ·
**Placeholder** (UI shell only) · **Stub** (deterministic/throws) · **Planned** (docs/flag only).
Recommendation: **Keep / Improve / Merge / Reposition / Remove**.

### Core
| Feature | User value | Status | Key files | Backend dep | Recommendation |
|---|---|---|---|---|---|
| **Spaces (couple + friends, multi-membership, switcher)** | A private container per relationship/circle; one person, many circles (PP-002/019) | Live (local); Scaffolded (Supabase) | `lib/types.ts`, `lib/hooks/useSpaces.ts`, `components/.../SpaceSwitcher`, `app/space/new.tsx` | `spaces`, `space_members`, `redeem_invite` RPC | **Keep** (core unit everything scopes to) |
| **Editions library (Grow tab)** | Browse/own decks; roadmap of upcoming editions | Live | `app/(tabs)/grow.tsx`, `app/editions/[id].tsx`, `lib/seed.ts` (`SEED_EDITIONS`) | static catalog | **Keep / Improve** (transient "0 of N" during load) |
| **Moment cards (sealed→activated per space)** | The physical→digital bridge; per-space progress | Live | `app/card/[id].tsx`, `lib/content/edition01.ts`, `02.ts` | `card_activations` | **Keep** |
| **Diary memories (note + optional photo)** | Capture & revisit the shared story | Live | `app/(tabs)/moments.tsx`, `app/memory/create.tsx`, `app/memory/[id].tsx` | `memories`, `memory-photos` bucket | **Keep / Improve** (no edit/delete; silent save failure) |
| **QR scan → card** | Offline-to-app acquisition (PP-015) | **Placeholder** (camera wired, but demo-card path is the real entry; MVP defers real decoding) | `app/(tabs)/scan.tsx`, `lib/qr.ts` | none | **Keep / Improve** (finish real decode; add settings deep-link) |
| **Bilingual EN/DE** | German in-app experience | Scaffolded infra, ~0% content | `lib/hooks/useLanguage.ts`, `LocalizedText` in `types.ts` | none | **Improve** (infra unused; content English-only) |
| **Account & data (sign out, delete account)** | Trust/control (GDPR) | Live (delete via RPC) | `app/account.tsx`, `lib/supabase/auth.ts` | `delete_account` RPC | **Keep** (no busy spinner; sign-out error swallowed) |

### Platform layers (feature flags — `lib/features.ts`, toggled in `app/customize.tsx`)
| Flag | Feature | Value | Status / default | Files | Recommendation |
|---|---|---|---|---|---|
| `streaks` | **Shared rhythm** (weekly streak, themed 🌶️/🌻) | Gentle cadence without pressure (PP-021) | Live / **on** | `lib/streaks.ts`, `StreakBanner` | **Keep** |
| `missions` | **Moments to do together** | Real-world activity ideas, AI-suggested | Live / **on** | `app/together/*`, `lib/together.ts`, `lib/ai/` | **Reposition** → foundation of Date Discovery |
| `localShops` | **Local places** (Innsbruck) | Partner venues w/ perks; first revenue beyond product (PP-022) | Live / **on** | `lib/together.ts` (`LocalPlace`) | **Reposition** → Date Discovery venue layer |
| `challenges` | **Challenges** (finite, badge-not-score) | Light collectible goals (PP-024) | Live / **on** | `app/challenges/*`, `lib/challenges.ts` | **Keep but de-emphasize** (see §4) |
| `rituals` | Turn a loved moment into a recurring one | Long-term emotional value | Planned / off | flag only | **Improve later** (strong retention fit) |
| `communities` | Optional circles beyond private spaces | — | Planned / off | flag only | **Experiment / later** |
| `feed` | Finite private cross-space feed | — | Planned / off | flag only | **Experiment / later** |

### AI
| Capability | Status | Files | Note |
|---|---|---|---|
| Card suggestion (`suggestCard`) | **Stub** (`nullAI`, deterministic `GOAL_CARD_AFFINITY`) | `lib/ai/null.ts` | no network |
| Reflection prompt (`reflectionPrompt`) | **Stub** (returns `''`) | `lib/ai/null.ts` | "no reflection prompts in MVP" |
| Moment suggestion (`suggestMoment`) | **Stub** (wraps `pickTogetherMoment`) | `lib/ai/null.ts`, `lib/together.ts` | emits `signalsUsed`/`signalsNotUsed` |
| Anthropic provider (`anthropicAI`) | **Stub** (every method throws) | `lib/ai/anthropic.ts` | designed for server-side Edge Function; model only `claude-*` |

### Web/shop (separate `app/` Next.js backend — real & live)
Stripe checkout + webhook + pay-by-invoice; Resend transactional/newsletter email; Supabase REST
via **service-role key** (orders, subscribers, community questions); monthly newsletter Vercel cron;
Spotify embed. Tables `orders`/`subscribers`/`community_questions` (service-role only; community
questions is the only anon-accessible table). **This is the flywheel endpoint** the app links to
(`SHOP_URL`).

### Confirmed present / absent (so they cannot be assumed as product)
Present in this branch: curated map, OpenStreetMap display, optional foreground
location, Supabase-backed Google Places search, and optional AI sorting over
provider-returned places only. Still absent: background location, booking,
transport/routing, events/ticketing, public community ratings, full device QA,
and analytics SDK.

---

## 2. Complete existing user-flow inventory

For each: goal · entry · key screens · primary action · states present/missing · friction.

1. **First open / routing** — `app/index.tsx`. Local mode: `onboarded ? /(tabs)/us : /(auth)/welcome`. Backend mode: no user→`sign-in`; user+0 spaces→`onboarding`; user+spaces→`/(tabs)/us`. *Missing:* backend new users **skip** welcome+language; only spinner, no error UI (failures funnel to sign-in).
2. **Language selection** — `(auth)/language.tsx` → onboarding. Clean. *Friction:* never reached by backend users.
3. **Onboarding goals** — `(auth)/onboarding.tsx` (multi-select) → invite. *Friction:* "skip for now" saves identically to CONTINUE; no a11y on goal chips. These goal labels are the keys the AI affinity maps depend on.
4. **Invite partner** — `(auth)/invite.tsx`. **Broken:** SHARE LINK button has **no `onPress`** (dead); backend shows placeholder code `— — — —`; empty `catch` on space creation = silent failure. The screen's core promise (share a code) is non-functional at the moment it's shown.
5. **Email-OTP sign-in** — `(auth)/sign-in.tsx`. 2-stage; now accepts variable-length code. *Missing:* no resend, no email format check, no spinner.
6. **Create/join space** — `app/space/new.tsx`. *Missing:* join with bad code fails **silently** (no error element exists); no `PEAK-0000` format validation.
7. **Use before partner joins** — implicit; the diary works solo (local seed). Not explicitly designed/onboarded.
8. **Scan a card** — `(tabs)/scan.tsx` → `card/[id]`. Demo path is the real entry today. Good permission states; no OS-settings deep-link; no success haptic.
9. **Open a card / read sections** — `card/[id].tsx`. Warm, bilingual, consent-forward. Preserve CTA on `preserveHere` section.
10. **Preserve a moment** — `memory/create.tsx`. **Core flow.** Note required, photo optional. **Silent save failure** (`catch {_e}`), **no success confirmation**, no discard guard, footer hardcoded English. Highest-priority UX risk.
11. **View diary (list + detail + edition diary)** — `(tabs)/moments.tsx`, `memory/[id].tsx`, `editions/[id].tsx`. Best loading/empty handling is on `moments`. **No edit/delete of a memory anywhere.** Share is best-effort (swallowed).
12. **Collect editions / roadmap** — `(tabs)/grow.tsx`. Sensitive editions gated by biometric (`useBiometric`). Shop link as flywheel.
13. **Moments-to-do-together (proto-discovery)** — `app/together/index.tsx` + `[id].tsx`. AI-suggested + curated ideas + generic place intents/live provider search. *Friction addressed:* no hardcoded partner/place claims; live search must keep provider facts honest.
14. **Challenges** — `app/challenges/*`. Join/leave (one-tap, no confirm), badge on completion.
15. **Shared rhythm / streak** — surfaced on Us tab via `StreakBanner`.
16. **Customize platform** — `app/customize.tsx`. 7 toggles (4 on by default, 3 "SOON" placeholders, `localShops` has no visible consumer screen). Gateway to account.
17. **Manage privacy / sensitive edition** — biometric gate + background privacy overlay (`PrivacyScreen`) for Edition 02.
18. **Account deletion** — `account.tsx` → `delete_account` RPC (confirmed Alert).
19. **(Web) Buy an edition** — Stripe checkout in `app/` → order + access token + emails. Connected to the app only via the outbound shop link.

**Disconnected / duplicate / dead-end observations:**
- **Two parallel "things to do" subsystems** (`together` *missions* and `challenges`) with overlapping "optional things to do together" purpose, each its own stack — feels like separate tools.
- **Us tab largely duplicates Moments** (latest memory + space switcher) plus a **hardcoded static "THIS WEEK / Card 04" suggestion** that never changes and can point at unowned content.
- **SpaceSwitcher appears on both Us and Moments.**
- **Invite SHARE LINK is a dead button**; invite + space/new fail silently.
- **`localShops` toggle controls places but has no dedicated surface** — discoverability gap.
- The **web shop and the app share a Supabase project but are otherwise unconnected** — a purchased edition does not light up in the app (no entitlement bridge).

---

## 3. Current product architecture

- **Client:** Expo SDK 51 / React Native 0.74 / expo-router v3, TypeScript strict. Zustand for UI/session state (`onboarded`, `language`, `goals`, `activeSpaceId`, `features`); TanStack Query is mounted but **unused** (all data via hand-rolled `useState/useEffect` hooks).
- **Ports & adapters:** UI → repository **interfaces** (`lib/repositories/interfaces.ts`) → `local.ts` (AsyncStorage, **active**) or `supabase.ts` (**scaffolded**), selected by `isSupabaseConfigured` in `repositories/index.ts`. Identity resolves the same way (`lib/session.ts`: mock vs Supabase). AI uses the identical pattern (`lib/ai/index.ts` exports `nullAI` today, `anthropicAI` later).
- **Catalog is static in-app** (`SEED_CARDS`, `SEED_EDITIONS`, `together.ts` moments/places). Only per-space *activation* + *memories* + *challenge enrollments* are persisted.
- **Backend (Supabase, EU target, scaffolded):** 6 tables with **deny-by-default RLS** keyed on space membership via `app_is_space_member()` (SECURITY DEFINER to avoid recursive RLS); RPCs `redeem_invite`, `delete_account`; private `memory-photos` bucket with EXIF-stripped re-encode + 1-hour signed URLs. Migrations `0002–0004` **not yet run**. **No Edge Functions exist.**
- **Web (`app/`, live):** Next.js 14 with real server routes (Stripe/Resend/Supabase service-role), the only place with server-side business logic today.
- **Design system:** coherent tokens (`constants/colors|spacing|typography`), but the `ui/Button|Text|Surface` primitives are **effectively dead** — every screen rolls its own `StyleSheet`. Typography hardcodes colors instead of importing `Colors`; error red `#b42318` and ink `#FAF7F0` are untokenized.

---

## 4. Problems & disconnected experiences (ranked)

**Critical**
1. **Silent failure on the core action.** `memory/create.tsx` swallows save errors with no feedback; `storage.ts` swallows *all* read/write errors (a failed write looks like success). For an app whose promise is "preserve precious moments," this is the top risk. → Surface errors + success confirmation; stop blanket-swallowing in `storage.ts`.
2. **Invite flow is broken/misleading.** Dead SHARE LINK button; placeholder code shown as if shareable; silent space-creation failure. Partner connection is the activation moment — it must be flawless.
3. **No edit/delete of memories.** Users can create but never correct or remove diary content — a trust and GDPR-expectation gap.

**High**
4. **Two overlapping "to-do" subsystems** (missions vs challenges) + a duplicative Us tab make the app feel like separate tools rather than one loop. → Unify under a single **Discover/Together** pillar (this is the Date Discovery opportunity).
5. **Defaults contradict positioning.** 4/7 flags ship **on**; the "calm, opt-in" framing is false on first run. 3/7 are non-functional "SOON" placeholders cluttering Customize.
6. **Backend new-user flow skips welcome/language**; routing has no error state.
7. **Dead UI primitives + token drift** → inconsistent buttons, a11y, and styling per screen.
8. **DE content ~0%** despite a built bilingual system and a German launch market.

**Medium**
9. Hardcoded "INNSBRUCK"/Card 04/demo card leak through as if dynamic.
10. No loading spinners on async actions (sign-in, space/new, account) — only opacity.
11. TanStack Query dead weight; per-screen refetch with no shared cache.
12. Accessibility inconsistent (no input labels, no live regions; `MemoryListItem` has none while `MemoryCard` is fully annotated).
13. **Shop↔app entitlement gap** — buying an edition doesn't reflect in the app.

---

## 5. Proposed future product pillars (PROPOSAL)

The repo's own three-phase value already maps cleanly onto the brief's Inspiration → Experience →
Memory. Keep the diary as the gravitational core; organize everything else as the loop that feeds it.

1. **Discover (Inspiration).** "What could we do together?" — unifies today's *missions* + *local
   places* into **Date Discovery** (the new pillar, §9). Also surfaces card prompts as
   conversational inspiration.
2. **Together (Experience).** Light support *during* a shared activity/date/prompt — a saved plan,
   a mini-itinerary, a reflection prompt unlocked at the right moment. Challenges and streaks live
   here as gentle, optional texture (not their own destinations).
3. **Diary (Memory).** The existing space-scoped diary — capture, revisit, collect editions. The
   destination every loop returns to.

Cross-cutting, not a pillar: **Spaces** (the container) and **Trust/Privacy** (the substrate).
Physical editions remain the acquisition + revenue engine, connected via QR (into Discover/prompt)
and the shop flywheel (out of Diary).

> This **merges** the disconnected tools into one coherent relationship loop and gives Date
> Discovery a natural home rather than a fourth silo.

---

## 6. Primary & secondary product loops (PROPOSAL)

**Primary loop (the one to optimize):**
Discover an idea → refine together → choose it → (optionally plan) → experience it →
mark completed → preserve as a memory (note/photo, prompt) → diary grows → improves next
discovery. This is the brief's full loop and it reuses every existing primitive.

**Secondary loops:**
- **Card loop (existing):** physical card → scan → read → preserve → diary. QR can also drop into a
  *related date idea* (bridge to Discover).
- **Cadence loop:** preserve a moment → streak ticks / challenge progresses → gentle reason to
  return (already built; keep subordinate).
- **Edition/collection loop:** finish a deck → diary nudges shop → new physical edition → new
  prompts & discovery themes (flywheel; PP-016).
- **Ritual loop (planned):** a loved date/moment → "do this again" variation → recurring
  inspiration (strong long-term emotional value; pairs perfectly with Discovery feedback).

**Reasons to open regularly:** a fresh, *contextual* date idea (weather/time-aware) = short-term
utility; a growing shared story + collectible editions + rituals = long-term emotional value.

---

## 7. Proposed information architecture (PROPOSAL)

```
Space (active context, switchable)
├── Discover            ← NEW pillar (absorbs missions + local places)
│   ├── Quick ask (progressive Q&A)
│   ├── Recommendation(s) + why-this + actions
│   ├── Saved / shortlist (vote together)
│   └── Card-prompt inspiration
├── Together (Experience)
│   ├── Planned dates (chosen, upcoming)
│   ├── Active plan / itinerary
│   ├── Challenges (optional)            ← demoted from top-level
│   └── Streak / rhythm (optional)
├── Diary (Memory)
│   ├── Moments (list + detail, edit/delete)   ← fix gaps
│   ├── Editions (collection + roadmap + shop)
│   └── Scan (entry to card → prompt/idea)
└── Settings
    ├── Customize (real flags only; honest defaults)
    ├── Personalization & learned preferences   ← NEW (transparency)
    ├── Privacy & sensitive editions
    └── Account & data
```

Folds the duplicative **Us** tab into Discover/Together (its only unique content — a weekly
suggestion — becomes a real Discover output instead of hardcoded Card 04).

---

## 8. Recommended navigation (PROPOSAL)

Four tabs, functional names, with **Scan** as the central physical-bridge action:

`Discover · Together · (Scan) · Diary` + Settings via Diary/profile.

- Replaces today's abstract **Us / Moments / Scan / Grow**. "Diary" absorbs Moments+Grow+Scan-entry;
  "Discover" and "Together" give the loop a home.
- Keep tab bar minimal, 44pt targets, larger labels than today's 9px.
- Sensitive editions keep the biometric gate; Discover never surfaces sensitive content in previews.

---

## 9. Detailed Date Discovery concept (PROPOSAL)

**One-liner:** "Tell us roughly what you're in the mood for; we'll find a real, doable date near
you — and help you turn it into a memory."

**Design principles (inherited from the repo's own rules):**
- **AI suggests, never acts** (PP-013, AI_SAFETY): every booking/calendar/share step is an explicit
  user tap.
- **No fabrication** (AI_SAFETY): the AI may *reason and personalize* but venues, hours, prices,
  events, and availability must come from verified data. Each fact is labeled by **provenance**:
  `verified-live` · `estimated` · `ai-interpretation` · `needs-confirmation`.
- **Progressive questioning:** ask only what's needed; infer the rest from saved couple
  preferences, time of day, and past feedback. Default to one screen with smart defaults +
  "anything else?" rather than a long form.
- **Explainable** (PP-014): reuse the existing `signalsUsed`/`signalsNotUsed` contract to render
  "Why this?" in plain language.
- **Consent-scoped & space-scoped:** preferences are couple-level and member-level, inspectable and
  deletable; personalization is opt-in and reversible.

**Inputs (progressive, mostly inferred):** location (chosen or, only with explicit per-use opt-in,
device location), date/time window, duration, indoor/outdoor, category (food / art & culture /
sport & movement / nature / relax / adventure / learning / nightlife / creative / surprise),
atmosphere & energy, budget, max travel time, transport (walk/bike/transit/car), spontaneous vs
bookable, new vs familiar, accessibility needs, dietary needs, relationship mood/intention.
**Never infer** sensitive attributes (health, sexual, religious, political, financial) — AI_SAFETY
prohibits it.

**A recommendation card shows:** concept · why-it-fits (signals) · location · hours/event time ·
est. duration · est. cost · route + travel time + mode · weather relevance · booking requirement ·
a mini-itinerary (e.g. walk → coffee → viewpoint) · **one alternative** · **source freshness** ·
clear actions. Each datum carries a provenance chip.

**Actions:** choose this · adjust preferences · show another · save for later · share with partner ·
**vote together** · add to calendar · open route · open booking source · mark completed →
**add to shared diary** (pre-fills a memory; can unlock a relevant reflection prompt / link a card).

---

## 10. Date Discovery user flows (PROPOSAL)

**A. Quick ask → recommend (happy path, ≤4 taps to a result)**
Entry: Discover tab / Us-replacement card / card-prompt CTA / push (later) →
1 short prompt screen (mood + time window prefilled; "outdoors? budget? transport?") →
loading (skeleton + "checking what's open & the weather…") →
1 recommendation + alternative → action row.
States: **loading** (skeleton), **empty/over-constrained** ("nothing open in 3h within €40 nearby —
loosen travel time?"), **error/provider-down** (fall back to curated picks; never fabricate),
**offline** (show saved/curated only). Recovery: "adjust preferences" always present.

**B. Refine** — tap any chip (budget/time/category/transport) → re-rank in place. Infers and
remembers the change as a (reversible) signal.

**C. Decide together (async couples)** — save to a **shared shortlist**; partner gets a gentle
nudge (in-app today, push later); both vote; agreement promotes it to a **planned date**.

**D. Plan** — chosen date → optional calendar add (user-confirmed only, per SECURITY) + saved route;
appears under Together → Planned.

**E. Experience → preserve** — "mark completed" → pre-filled `memory/create` (card link optional;
reflection prompt optional) → saved to Diary → feedback (loved/not) feeds learning.

**F. From a card prompt** — a card's "try this" can offer "find a place for this" → flow A with the
card's category pre-set; completing links the memory to that card (existing `cardId` field).

**Privacy implications:** location only per-use & opt-in (no background location — SECURITY/PP);
votes/shortlists are space-scoped under RLS; AI calls are server-side, note/preference text
ephemeral; provenance labeling prevents the AI from implying false certainty.

---

## 11. Required external APIs & services (PROPOSAL)

Phased so the MVP needs **none of the heavy ones**.

| Need | MVP | Phase 2 | Phase 3 |
|---|---|---|---|
| Venues/places | **Curated `together.ts`** (verified, enriched) | Google/Mapbox Places or Foursquare (hours, coords) | + reviews/photos |
| Weather | — (curated picks are weather-tagged) | OpenWeather/Met.no (time-windowed) | — |
| Routing/transport | — (static area string) | Maps Directions + transit (OpenTripPlanner / Google) | live disruptions |
| Events | — | Eventbrite/Ticketmaster/local feeds | inventory/availability |
| Booking | deep-link only ("open booking source") | partner booking links | integrated availability |
| Web grounding | server-side **web search** for freshness (hours/temporary closures), results **cited** | — | — |
| AI | **Anthropic Claude** via Supabase **Edge Function** (server-side; key never on client) | structured tool-use over the APIs above | evals/monitoring |

All third-party calls run **server-side** (Edge Function) per PP-013/ARCHITECTURE — the client never
holds API keys. EU data plane + DPAs (PP-012). No ads, no data resale (PP-016).

---

## 12. AI architecture (PROPOSAL — extends `lib/ai/`)

Reuse the existing abstraction; add a discovery method and finally implement the server path.

```
IAIPersonalization (existing)         IDateDiscovery (NEW)
 ├ suggestCard()                        ├ nextQuestion(ctx, answersSoFar) → Question | null
 ├ reflectionPrompt()                   ├ recommend(ctx, constraints, candidates[]) → DateRec[]
 └ suggestMoment()                      └ explain(rec) → {signalsUsed, signalsNotUsed}
        │                                       │
   lib/ai/index.ts  →  nullAI (today)  |  anthropicAI (server, NEW)
                                              │
                              Supabase Edge Function `discover`
   deterministic authorize+constraints → minimal typed context (approved signals only)
   → retrieve candidates (curated MVP; APIs later) → Claude structured output (JSON schema)
   → post-validate (no fabricated venues; every fact carries provenance)
   → deterministic re-rank + plain-language explanation → curated fallback if validation fails
```

Key guarantees (all already mandated in AI_SAFETY): structured/validated output; untrusted data
(venue text, web results) separated from instructions (prompt-injection resistance); raw
note/preference text ephemeral; **AI outputs suggestions only**; crisis-text route suppresses
playful responses and surfaces local-help resources; versioned prompts/schemas/ranking with an eval
gate before any model/config change. Keep `nullAI` as the deterministic offline/fallback path.

---

## 13. Personalization & learning model (PROPOSAL)

**Two scopes:** `member` preferences (private to that person) and `couple` preferences (shared,
space-scoped). Always show which is which (PP-019 context).

**Explicit signals:** likes/dislikes, saved ideas, rejected recs, preferred categories, budget,
mobility, post-date feedback. **Behavioral signals:** opened/saved/selected/completed, repeatedly
ignored categories, typically accepted travel distance, typical available time windows.

**Hard limits (AI_SAFETY/PP-014):** never infer sensitive relationship/sexual/health/religious/
political/financial attributes; no "secret analysis" of one partner about the other; no durable
signal from free text without explicit confirmation.

**User controls (must-have, not optional):** a **"Learned preferences"** screen to *see* every
signal, *edit* it, *reset* recommendation history, *temporarily disable* personalization, and
distinguish personal vs couple preferences. Recommendations always explainable: *"We suggested this
because you both like outdoor activities, usually travel by transit, and have ~3 hours."* —
rendered from `signalsUsed`. This realizes the **consent/personalization-signals entity** already
anticipated in DATA_MODEL.md.

---

## 14. Privacy & consent model (PROPOSAL — consistent with existing docs)

- **Space-scoped by default:** all new tables carry `space_id` under deny-by-default RLS via
  `app_is_space_member()` (mirrors existing schema).
- **Location:** per-use, explicit opt-in; **no background location** (SECURITY/PP). Chosen-location
  is the default; device location is a one-tap, one-time grant.
- **AI:** server-side only; preference/note text ephemeral; opt-in & reversible; explainable;
  sensitive inferences prohibited and never stored.
- **Personalization signals** are their own inspectable/deletable entity; reset history supported.
- **Sensitive editions:** Discover must never surface sensitive content in previews/notifications;
  reuse biometric gate + privacy overlay.
- **Monetization integrity (PP-022/PP-016):** partner-place perks are transparent and **never
  required**; ranking is never sold; no ads, no data resale; partner reporting stays aggregate.
- **Age:** 18+ self-attestation for intimate content (PP-007); no biometric/ID age checks.
- **Calendar/booking:** entries user-confirmed; booking is a deep-link the user opens.

---

## 15. Data model changes (PROPOSAL)

**Enrich existing (`lib/together.ts` → promote to typed catalog):**
`LocalPlace` add `lat/lng`, `priceBand` (€/€€/€€€), `indoorOutdoor`, `openingHours`,
`avgDurationMin`, `accessibility`, `tags`, `provenance`, `lastVerifiedAt`. `TogetherMoment` add
`category` alignment, `energy`, `idealTimeOfDay`, `weatherFit`, `linkedCardIds`.

**New types (`lib/types.ts`):**
- `DatePreference { scope: 'member'|'couple', spaceId, userId?, categories[], budgetBand, transport[], maxTravelMin, indoorOutdoor, dietary[], accessibility[], updatedAt }`
- `DateConstraints` (per-request, ephemeral): location, timeWindow, durationMin, budget, transport, mood.
- `DateRecommendation { id, concept, why, placeId?, eventRef?, itinerary[], estCostBand, travel{mode,min,routeUrl}, weatherNote, booking{required,url?}, alternativeOf?, facts: {value, provenance}[], freshnessAt }`
- `SavedDate { id, spaceId, recSnapshot, status: 'idea'|'saved'|'planned'|'completed'|'dismissed', votes: {userId,vote}[], plannedFor?, calendarLinked?, memoryId?, createdBy, createdAt }`
- `DateFeedback { savedDateId, userId, rating, reason?, createdAt }`
- `PersonalizationSignal { id, spaceId, userId?, kind, value, source: 'explicit'|'behavioral', createdAt }` (inspectable/deletable).
- Extend `Memory` (already planned): `location?`, `photos[]`, `createdBy`, plus `sourceSavedDateId?` to close the loop.

**New Supabase migrations (`0005+`), all space-scoped RLS:** `date_preferences`,
`saved_dates` (+ `date_votes` or embedded), `date_feedback`, `personalization_signals`.
**New Edge Function:** `supabase/functions/discover` (the only place with provider keys).
Curated places/events can stay in-app for MVP, move to tables when APIs land.

---

## 16. MVP scope (PROPOSAL) — smallest version that validates demand

**Compare the four approaches:**
| Approach | Pros | Cons | Fit now |
|---|---|---|---|
| AI + web search only | freshest, low data-ops | fabrication risk, latency/cost, hard to guarantee "real" | medium |
| Structured Places/Events APIs only | factual | no personalization magic; integration + cost up front; weak in a single pilot city | low |
| **Hybrid (curated + AI personalization)** | factual *and* personal; cheap; honors "no fabrication"; reuses `together.ts` + `lib/ai` + PP-022 | city-bound; manual curation | **highest** |
| Curated + AI, no live APIs | simplest | no live hours/weather | high (fallback) |

**Recommended MVP = Hybrid, curation-first:** enrich the existing **Innsbruck** curated set with
structured fields; implement the `discover` Edge Function with **Claude reasoning + server-side web
search used only to *verify freshness* (hours/temporary closures), with citations**; progressive 1-screen
ask; one recommendation + one alternative; explainable "why this"; actions = choose / another /
save / share / open route (deep-link) / **mark completed → preserve to diary**; a basic
**Learned preferences** screen. Add live weather as the first API only if the pilot shows demand.

**In MVP:** Discover entry (replaces hardcoded Us suggestion), couple+member preferences, save +
shortlist + vote, completion→memory bridge, provenance labels, personalization controls, server-side
AI with deterministic `nullAI` fallback.
**Out of MVP:** live Places/Events/transport APIs, push notifications, calendar write, booking
integrations, multi-city, communities/feed/rituals.

**Validation metric:** % of recommendations that become a *saved* date, and % of saved dates that
become a *preserved memory* (the loop closing) — not screen time (AI_SAFETY).

---

## 17. Later-stage feature roadmap (PROPOSAL)

- **Beta:** live weather; Places API (real hours/coords/multi-city); push (value-first, sensitive-safe); calendar write; partner-place booking deep-links; rituals (re-do a loved date as a variation).
- **Later:** events/ticketing; transit routing with disruptions; richer itineraries; shop↔app **entitlement bridge** (a purchased edition unlocks/labels in-app); DE content parity; communities/feed (only after the private loop is validated, R-002 boundaries intact).
- **Experiment:** "surprise us" fully-inferred date; seasonal/themed collections that pair editions with date themes; reflection-prompt generation (currently stubbed).
- **Should-not-build (keep rejected):** relationship scoring/leaderboards (R-001), public social feed/followers (R-002), diary content for training/ads (R-003), coercive share-to-unlock (R-004), selling ranking/ads (PP-016).

---

## 18. Risks & assumptions

- **Desirability assumption:** couples want app-suggested dates enough to close the loop. *Mitigate:* curation-first MVP measures save→preserve before any API spend.
- **Fabrication risk:** AI inventing venues/hours/prices = trust death for an intimacy brand. *Mitigate:* curated verified data + provenance labels + post-validation + web-search citations; deterministic fallback.
- **Single-city cold start:** all places are Innsbruck. *Mitigate:* pilot there; gate Discover by available coverage; honest "not in your area yet."
- **Privacy/location creep:** *Mitigate:* per-use opt-in, no background location, server-side ephemeral text, inspectable signals.
- **Operational:** Edge Function + provider keys + EU DPAs are new surface (no functions exist today). *Mitigate:* one function, schema-validated, eval-gated (PP-023/AI_SAFETY).
- **Cost:** AI + (later) Places/transport calls. *Mitigate:* cache curated; rate-limit; APIs only after validation.
- **Foundation debt:** core has silent-failure/invite/edit-delete gaps (§4). *Assumption:* these are fixed *before* layering Discovery, or the loop leaks at "preserve."
- **Doc tensions to resolve:** Edition-02 "available" vs PP-026 "only edition-01 ships"; UX_GUIDELINES excludes missions/challenges that PLATFORM ships; test-count and "schema live" discrepancies.

---

## 19. Phased implementation plan (PROPOSAL)

**Phase 0 — Foundation fixes (pre-requisite).** Fix silent save failure + add success confirmation;
fix invite (real share, real code, surfaced errors); add memory edit/delete; stop `storage.ts`
blanket-swallowing; honest Customize defaults; remove dead "SOON" placeholders or label clearly.

**Phase 1 — Unify the loop.** Merge missions+places into a **Discover** surface; demote
challenges/streak under Together; replace the hardcoded Us "THIS WEEK" with a real (curated)
Discover output; new navigation (§8).

**Phase 2 — Date Discovery MVP (hybrid, curation-first).** Enrich `together.ts` data; `IDateDiscovery`
+ `discover` Edge Function (Claude + web-search freshness, citations, provenance); progressive ask;
recommend + alternative + actions; save/shortlist/vote; **completion→memory bridge**; Learned-
preferences screen; migrations `0005+`. Keep `nullAI` fallback.

**Phase 3 — Live signals.** Weather → Places API (hours/coords/multi-city) → push (value-first) →
calendar write → booking deep-links → rituals.

**Phase 4 — Scale & connect.** Events/transit; shop↔app entitlement bridge; DE parity; evals +
monitoring + kill switches (AI_SAFETY); broaden cities.

Each step ships behind a feature flag (PP-020), verified by `tsc` + Vitest + `expo export`
(PP-023), with P0 invariants tested (RLS allow/deny; no-fabrication validation; loop integrity).

---

## 20. Exact files likely to be affected

**Foundation (Phase 0):** `app/memory/create.tsx`, `app/memory/[id].tsx`, `app/(auth)/invite.tsx`,
`app/space/new.tsx`, `lib/storage.ts`, `lib/hooks/useMemories.ts`, `app/customize.tsx`,
`lib/features.ts`.

**Unify (Phase 1):** `app/(tabs)/_layout.tsx`, `app/(tabs)/us.tsx` (fold/replace),
`app/(tabs)/grow.tsx`, `app/together/*`, `app/challenges/*`, new `app/discover/*`,
`components/edition/*`.

**Discovery MVP (Phase 2):**
- New routes: `app/discover/index.tsx`, `app/discover/ask.tsx`, `app/discover/[recId].tsx`,
  `app/discover/saved.tsx`, `app/settings/preferences.tsx`.
- Logic: `lib/together.ts` (enrich) or new `lib/places.ts`; new `lib/discovery/*`;
  `lib/ai/index.ts`, `lib/ai/interface.ts`, `lib/ai/types.ts`, `lib/ai/anthropic.ts` (implement),
  `lib/ai/null.ts` (extend fallback); `lib/types.ts` (new entities); `lib/repositories/interfaces.ts`
  + `local.ts` + `supabase.ts` (saved dates, preferences, signals); `lib/config.ts` (no secrets).
- Backend: `supabase/migrations/0005_date_discovery.sql` (+ RLS), **new** `supabase/functions/discover/`
  (Edge Function — provider keys server-side), `supabase/tests/rls_test.sql` (extend).
- Config: `eas.json` / env for Edge Function secrets (never client).

**Later (Phases 3–4):** `app.json` (notification + location plugins when introduced),
new `lib/weather.ts` / `lib/routing.ts` / `lib/events.ts`, push handler, calendar helper,
shop↔app entitlement bridge touching `app/` (Next.js) + a new `entitlements` table/RPC,
`lib/content/edition0N.ts` (DE parity).

**Docs to update:** `PRODUCT.md`, `PLATFORM.md`, `AI_SAFETY.md`, `DATA_MODEL.md`, `PRIVACY.md`,
`DECISION_REGISTER.md` (new PP entries for Date Discovery, location opt-in, entitlement bridge).
```
