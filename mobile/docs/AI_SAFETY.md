# AI Personalization & Safety

PeakPlant will use AI to make moments feel personal — suggesting a fitting card,
shaping a gentle reflection prompt. Because the context is intimacy and a shared
diary, the safety bar is higher than for an ordinary app. These rules are
binding (see DECISION_REGISTER PP-013, PP-014).

## Objective

AI optimizes for **meaningful, voluntary connection between two people** and
user-rated fit. It must never optimize for screen time, compulsion, purchases,
shame, or dependency.

## Transparency & control

- AI involvement is legible. Every AI suggestion can show, in plain language,
  which signals it used, which it did not, and which were optional.
- Material personalization is **opt-in** and reversible at any time. The app is
  fully usable with personalization off.
- The user can inspect, correct, and delete the signals AI holds about them, and
  exclude any signal from future personalization.

## Signal taxonomy

Only an explicit, approved set of signals may influence personalization (e.g.
chosen goals, which cards a couple has preserved, edition, coarse cadence).

**Prohibited inferences:** clinical or mental-health status, sexual-health
status, relationship-risk or compatibility scoring, and any protected-trait
profiling. PeakPlant never produces a "secret analysis" of one partner about the
other.

## Sensitive free text

Diary notes are vulnerable, personal writing.

- Raw note text is **ephemeral** when sent to a model — processed for the
  immediate task, not logged, not stored as a durable profile.
- Interpretation is tentative; no durable personalization signal is created from
  free text without explicit user confirmation.
- Diary content is never used for analytics, ranking, or model training.

## Crisis / critical-safety route

If text credibly signals immediate danger (self-harm, abuse, coercion), the app
**suppresses any playful/gamified response** and surfaces a neutral, local-help
resource path. PeakPlant does not diagnose, score risk, contact third parties
automatically, or use that input for future personalization.

## AI authority boundary

The model has **no authority** to take real-world actions. It cannot publish,
share to a partner, send notifications, unlock content, make purchases, or modify
canonical state. Any such action requires an explicit user tap. AI output is a
suggestion, never a command.

## Pipeline (server-side only)

```
deterministic authorization + constraints
  → minimal typed context (approved signals only)
  → model call (server-side, behind provider abstraction)
  → structured output + post-validation
  → deterministic ranking + factual explanation
  → curated fallback if validation fails
```

- All model calls happen server-side. The client never holds provider keys.
- The provider sits behind an internal interface so it is portable.
- Untrusted data (diary text, card content) is separated from instructions to
  resist prompt injection; output is schema-validated before use.

## Release governance

- Prompts, schemas, ranking, fallbacks, provider/model, and explanations are
  versioned. A model or material config change is a new AI release.
- Release requires an evaluation pass: zero prohibited/unsafe outputs on the test
  set, deterministic constraint compliance, and documented fairness/explanation
  checks.
- Production monitoring covers fallbacks, unsafe-output reports, crisis routing,
  excluded-signal use, latency, and cost — each with a kill switch.

## Date Discovery rules (PP-029/PP-030)

Discovery adds a second AI surface — `IDateDiscovery` — with its own safety
constraints on top of the above:

- **No fabrication.** Every fact on a recommendation card carries a provenance
  label (`curated`, `estimated`, `ai-interpretation`, `needs-confirmation`). The
  AI may reason and personalize over curated data but must never invent venue
  names, opening hours, prices, or availability. The recommender returns an empty
  list when over-constrained rather than fabricating.
- **Constraints are ephemeral.** `DateConstraints` lives for one request; it is
  never stored as a durable profile (PP-030).
- **Partner places not ranked higher.** Ranking is by signal match only — being
  a partner place carries zero ranking weight (PP-016).
- **Provenance `verified-live` is prohibited** in the MVP. That label may only
  be used once a live API call in the same request has confirmed the fact.
- **The `discover` Edge Function** is the only component that may hold provider
  keys. The mobile client falls back to the deterministic `nullDiscovery`
  recommender when the function is unavailable.
- **No sensitive discovery inferences.** The Discovery AI must not infer or store
  relationship status, health/dietary needs beyond explicit user input, or
  intimacy attributes from any behavioral signal.

## MVP status

The deterministic `nullDiscovery` recommender (`lib/discovery/recommend.ts`) is
live and tested. The `discover` Edge Function stub (`supabase/functions/discover/`)
returns HTTP 501 until deployed — clients fall back to `nullDiscovery`. When the
live AI is wired, it must satisfy this full policy before shipping (PP-023).
