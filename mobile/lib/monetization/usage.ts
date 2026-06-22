/**
 * AI allowance + privacy-safe usage/cost metering (pure).
 *
 * This is the shared decision logic for both the optimistic client check and the
 * authoritative server-side enforcement boundary (an Edge Function would import
 * the same `checkAllowance`). It deducts per-couple AI allowance, resets it each
 * cycle, blocks duplicate requests, and builds usage events that — by
 * construction — can never carry private content.
 *
 * PRIVACY: usage/cost events record counts, ids, sizes, latency and money only.
 * Diary text, reflections, prompt answers, partner messages, photos, and any
 * intimate prompt content must NEVER be passed here. The event type below has no
 * field that could hold them.
 */

import {
  MONETIZATION_ENABLED,
  TIERS,
  COST_MODEL,
  COST_GUARDRAIL,
  type Tier,
} from './config';

// ── Allowance ────────────────────────────────────────────────────────────────

/** Per-couple AI allowance counter, with the start of the current cycle. */
export interface AllowanceState {
  used: number;
  /** ISO timestamp marking the start of the current monthly cycle. */
  cycleStart: string;
}

export function freshAllowance(now: Date): AllowanceState {
  return { used: 0, cycleStart: startOfMonth(now).toISOString() };
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

/** True when `now` falls in a later month than the recorded cycle start. */
export function isNewCycle(state: AllowanceState, now: Date): boolean {
  return startOfMonth(now).getTime() > startOfMonth(new Date(state.cycleStart)).getTime();
}

/** Reset the counter when a new cycle has begun; otherwise return as-is. */
export function resetIfNewCycle(state: AllowanceState, now: Date): AllowanceState {
  return isNewCycle(state, now) ? freshAllowance(now) : state;
}

export interface AllowanceDecision {
  allowed: boolean;
  remaining: number;
  limit: number;
  reason: 'ok' | 'limit_reached' | 'duplicate';
  /** The (possibly reset) allowance state the caller should persist. */
  next: AllowanceState;
}

export interface CheckAllowanceInput {
  state: AllowanceState;
  tier: Tier;
  now: Date;
  /** Idempotency key of this request; if seen recently it's a duplicate. */
  requestKey?: string;
  /** Recently-served request keys (caller-held window). */
  recentKeys?: ReadonlySet<string>;
  monetizationEnabled?: boolean;
}

/**
 * The single allowance gate. Resets the cycle if due, blocks duplicates, then
 * checks the remaining bucket. With monetization disabled it always allows and
 * never deducts. Pure: returns the decision and the next state to persist.
 */
export function checkAllowance(input: CheckAllowanceInput): AllowanceDecision {
  const enabled = input.monetizationEnabled ?? MONETIZATION_ENABLED;
  const limit = TIERS[input.tier].aiRequestsPerCycle;
  const reset = resetIfNewCycle(input.state, input.now);

  if (!enabled) {
    // Disabled: unlimited, no deduction.
    return { allowed: true, remaining: Number.POSITIVE_INFINITY, limit, reason: 'ok', next: reset };
  }

  if (input.requestKey && input.recentKeys?.has(input.requestKey)) {
    return { allowed: false, remaining: Math.max(0, limit - reset.used), limit, reason: 'duplicate', next: reset };
  }

  const remaining = Math.max(0, limit - reset.used);
  if (remaining <= 0) {
    return { allowed: false, remaining: 0, limit, reason: 'limit_reached', next: reset };
  }
  return { allowed: true, remaining, limit, reason: 'ok', next: reset };
}

/** Record one consumed request against the allowance (call only after success). */
export function deductAllowance(state: AllowanceState, now: Date): AllowanceState {
  const reset = resetIfNewCycle(state, now);
  return { ...reset, used: reset.used + 1 };
}

/** Remaining requests this cycle (Infinity when monetization is disabled). */
export function remainingAllowance(
  state: AllowanceState,
  tier: Tier,
  now: Date,
  monetizationEnabled = MONETIZATION_ENABLED,
): number {
  if (!monetizationEnabled) return Number.POSITIVE_INFINITY;
  const reset = resetIfNewCycle(state, now);
  return Math.max(0, TIERS[tier].aiRequestsPerCycle - reset.used);
}

// ── Duplicate protection ─────────────────────────────────────────────────────

export function isDuplicateRequest(recentKeys: ReadonlySet<string>, requestKey: string): boolean {
  return recentKeys.has(requestKey);
}

// ── Privacy-safe usage + cost events ─────────────────────────────────────────

export type UsageKind = 'ai_request' | 'provider_request';
export type UsageOutcome = 'success' | 'failure';

/**
 * A metering event. NOTE: there is deliberately NO field for prompt text,
 * answers, notes, messages, or images. Only counts, ids, sizes, latency, money.
 */
export interface UsageEvent {
  kind: UsageKind;
  at: string;
  /** Model/provider identifier, e.g. 'claude-...' or 'places:foo'. Not content. */
  provider: string;
  /** Estimated tokens (AI) or undefined for non-token providers. */
  estTokens?: number;
  /** Number of external provider calls this event represents. */
  providerRequests?: number;
  latencyMs?: number;
  outcome: UsageOutcome;
  tier: Tier;
  /** Remaining allowance after this event (Infinity allowed when disabled). */
  remainingAllowance: number;
  /** Estimated variable cost in cents (computed, never user-facing). */
  estCostCents: number;
}

/** Whitelisted, content-free inputs to build a usage event. */
export interface BuildUsageInput {
  kind: UsageKind;
  at: Date;
  provider: string;
  estTokens?: number;
  providerRequests?: number;
  latencyMs?: number;
  outcome: UsageOutcome;
  tier: Tier;
  remainingAllowance: number;
  costModelKey?: string;
}

/** Estimate variable cost in cents from tokens / provider-request counts. */
export function estimateCostCents(input: {
  estTokens?: number;
  providerRequests?: number;
  costModelKey?: string;
}): number {
  const model = COST_MODEL[input.costModelKey ?? 'default'] ?? COST_MODEL.default;
  const tokenCost = ((input.estTokens ?? 0) / 1000) * model.aiCentsPer1kTokens;
  const providerCost = (input.providerRequests ?? 0) * model.providerRequestCents;
  return Math.round((tokenCost + providerCost) * 1000) / 1000;
}

/**
 * Build a usage event from only the safe fields. Because the input type has no
 * content slot, private text can't be threaded through even by mistake.
 */
export function buildUsageEvent(input: BuildUsageInput): UsageEvent {
  return {
    kind: input.kind,
    at: input.at.toISOString(),
    provider: input.provider,
    estTokens: input.estTokens,
    providerRequests: input.providerRequests,
    latencyMs: input.latencyMs,
    outcome: input.outcome,
    tier: input.tier,
    remainingAllowance: input.remainingAllowance,
    estCostCents: estimateCostCents(input),
  };
}

// ── Cost guardrail ───────────────────────────────────────────────────────────

/** Is variable cost within the configured fraction of net Plus revenue? */
export function withinCostGuardrail(variableCostCents: number, netRevenueCents: number): boolean {
  if (netRevenueCents <= 0) return variableCostCents <= 0;
  return variableCostCents / netRevenueCents <= COST_GUARDRAIL.maxVariableCostRatio;
}
