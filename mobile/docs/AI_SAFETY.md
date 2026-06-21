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

## MVP status

No live AI is wired in the MVP. When added, it lands behind `lib/ai/`
(interface + provider stub, mirroring the repository pattern) and must satisfy
this policy before shipping.
