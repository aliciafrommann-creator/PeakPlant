# PeakPlant Monetization — M0 Foundation

Status: **implemented but fully disabled.** `MONETIZATION_ENABLED = false`
(`lib/monetization/config.ts`). With the switch off there is no paywall, no
purchase, no limit, and no behavior change — the app is completely functional.
This document is the contract for turning it on later, which is a **post-beta,
human-approved** step gated on real-device review, current app-store products,
and real usage data.

Nothing here charges money. The billing adapter in use is `nullBilling`, which
always reports "not configured" and returns honest failures for purchase/restore.

---

## 1. Free vs Plus boundaries

**Always free (never gated, never behind a paywall):**
- Scanning and using purchased physical cards; access to owned card/edition content.
- Couple Space + partner invitation.
- Memory create / view / edit / delete; access to all existing Diary entries.
- Basic saved ideas; basic planning.
- A genuinely useful **basic** Discovery experience (the deterministic curated
  recommender + filters + the experience layer).

> Existing personal memories are **never** placed behind a paywall.

**Candidate Plus features** (`GatedFeature` in config; all currently open):
`ai_ask_peakplant`, `ai_live_recommendations`, `advanced_multi_stop_planning`,
`advanced_collections`, `rich_couple_learning`, `premium_recaps`,
`memory_export`, `premium_rituals`.

The deterministic recommender stays free; only **live / deeply personalized** AI
recommendations and the conversational "Ask PeakPlant" are gated. Prefer
deterministic logic wherever AI is unnecessary (keeps variable cost near zero).

## 2. Entitlement model (`lib/monetization/entitlements.ts`)

- **Couple-level**: an `EntitlementState` is keyed by `spaceId`, never by a
  member. The preferred hypothesis is one subscription per couple.
- Fields: `tier` (free/plus), `source` (free/purchase/promo/trial),
  `startsAt`, `expiresAt`, `lastVerifiedAt`, `restoration`.
- `resolveEntitlement(state, { now, monetizationEnabled, offline })` →
  `ResolvedEntitlement`. Expired/ not-yet-started non-free entitlements degrade
  to free; the `offline` flag is carried through so cached state still grants
  access on a no-network launch (**offline-safe**).
- `isPlus` / `hasFeature` open everything when monetization is disabled.
- **Partner disconnect**: removing a member never touches the space's
  entitlement; the remaining partner keeps access (tested).

## 3. AI allowance + cost metering (`lib/monetization/usage.ts`)

- Per-couple, per-month bucket. `checkAllowance` is the **shared decision** used
  by the optimistic client and the authoritative server boundary. It resets on a
  new cycle, blocks duplicate request keys, and reports
  `ok | limit_reached | duplicate` plus the next state to persist.
- `deductAllowance` is called only after a successful request.
- **Usage events** (`buildUsageEvent`) record counts, provider id, est. tokens,
  provider-request count, latency, outcome, tier, remaining allowance, and
  est. cost. **By construction there is no field for private content** — diary
  text, reflections, prompt answers, partner messages, photos and intimate
  prompt content can't be threaded through (enforced by a test).
- `estimateCostCents` + `withinCostGuardrail` implement the planning guardrail:
  variable AI + live-provider cost should stay **< 20% of net Plus revenue**.

## 4. Provider adapter (`lib/monetization/billing/`)

- Product logic depends only on `IBillingProvider`. No file imports RevenueCat,
  Apple, Google, or Stripe. Swap the export in `billing/index.ts` to a real
  adapter when one is built + approved.
- `nullBilling` (active): not configured, never charges, returns honest
  failures, treats every space as free.

## 5. Server-side enforcement boundary

The client check is **optimistic only**. The authoritative gate is server-side:
a future Edge Function (`supabase/functions/ai-gate`) must, for each AI/live
request: resolve the couple's entitlement, run the **same** `checkAllowance`
logic against `ai_allowance`, enforce the idempotency unique index on
`ai_usage(request_key)`, deduct on success, and write a privacy-safe `ai_usage`
row. Rate-limit model: per-couple cycle bucket + per-request idempotency +
provider-level concurrency caps. Never trust a client-reported allowance.

## 6. Database changes (migration `0007_entitlements.sql`, DORMANT)

New tables (additive, RLS deny-by-default, space-scoped; website tables
untouched): `entitlements`, `ai_allowance`, `ai_usage`. Reads are member-scoped;
writes are server-only (billing webhook / enforcement boundary). **Not applied**
to the live project — apply only when enabling backend billing.

## 7. Feature flags

`MONETIZATION_ENABLED` (config const) is the master switch. While false:
gates open, allowance unlimited, no paywall. This is independent of the existing
UX feature flags in `lib/features.ts`.

## 8. Environment variables (future, not required for beta)

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_BILLING_PROVIDER` | Selects the adapter (e.g. `revenuecat`) |
| `EXPO_PUBLIC_REVENUECAT_KEY` | RevenueCat **public** SDK key (client) |
| `REVENUECAT_WEBHOOK_SECRET` | Server-only: verify webhook signatures |
| `BILLING_SERVICE_ROLE` | Server-only: write entitlements/usage |

Secrets are server-only and never shipped in the client bundle.

## 9. Required future webhooks

- Billing provider → `entitlements` upsert on purchase/renew/cancel/refund/
  grace-period (provider-agnostic mapping to `EntitlementState`).
- Periodic (or lazy) allowance reset is handled by `cycle_start` logic, so no
  cron is strictly required.

## 10. Pricing hypotheses (config only — not final, never charged)

- €4.99 / couple / month · €39.99 / couple / year.
- ~3 free AI requests / couple / month; optional AI credit packs later.

## 11. What is implemented vs disabled

Implemented now (M0): typed entitlement + allowance + usage/cost model, provider
adapter interface + null adapter, config-driven tiers/limits/prices, cost
guardrail, dormant DB migration, full test suite (25 tests).

Disabled / not implemented (post-beta): visible paywall, real purchases,
RevenueCat production config, Apple/Google products, trials, promo campaigns,
unlimited-AI claims, the server enforcement Edge Function.

## 12. External & human dependencies (post-beta gate)

App-store product setup, billing-provider account + keys, legal/tax review for
EU subscriptions, real-device purchase/restore testing, and human sign-off on
final prices before any of section 11's "disabled" items is enabled.
