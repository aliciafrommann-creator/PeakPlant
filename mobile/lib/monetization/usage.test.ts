import { describe, it, expect } from 'vitest';
import {
  freshAllowance,
  isNewCycle,
  resetIfNewCycle,
  checkAllowance,
  deductAllowance,
  remainingAllowance,
  isDuplicateRequest,
  estimateCostCents,
  buildUsageEvent,
  withinCostGuardrail,
  type AllowanceState,
} from './usage';
import { TIERS } from './config';

const now = new Date('2026-06-22T12:00:00Z');

describe('allowance cycle', () => {
  it('fresh allowance starts at zero, cycle pinned to start of month', () => {
    const a = freshAllowance(now);
    expect(a.used).toBe(0);
    expect(a.cycleStart).toBe('2026-06-01T00:00:00.000Z');
  });

  it('detects and resets on a new month', () => {
    const a: AllowanceState = { used: 3, cycleStart: '2026-05-01T00:00:00.000Z' };
    expect(isNewCycle(a, now)).toBe(true);
    expect(resetIfNewCycle(a, now).used).toBe(0);
  });

  it('does not reset within the same month', () => {
    const a: AllowanceState = { used: 2, cycleStart: '2026-06-01T00:00:00.000Z' };
    expect(isNewCycle(a, now)).toBe(false);
    expect(resetIfNewCycle(a, now)).toBe(a);
  });
});

describe('checkAllowance + deduction (monetization enabled)', () => {
  const opts = { monetizationEnabled: true };

  it('allows within the free bucket and reports remaining', () => {
    const state = freshAllowance(now);
    const d = checkAllowance({ state, tier: 'free', now, ...opts });
    expect(d.allowed).toBe(true);
    expect(d.limit).toBe(TIERS.free.aiRequestsPerCycle);
    expect(d.remaining).toBe(TIERS.free.aiRequestsPerCycle);
  });

  it('deducts each used request and blocks when the bucket is empty', () => {
    let state = freshAllowance(now);
    for (let i = 0; i < TIERS.free.aiRequestsPerCycle; i++) {
      const d = checkAllowance({ state, tier: 'free', now, ...opts });
      expect(d.allowed).toBe(true);
      state = deductAllowance(state, now);
    }
    const blocked = checkAllowance({ state, tier: 'free', now, ...opts });
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toBe('limit_reached');
    expect(blocked.remaining).toBe(0);
  });

  it('blocks a duplicate request key without consuming allowance', () => {
    const state = freshAllowance(now);
    const recentKeys = new Set(['req-1']);
    const d = checkAllowance({ state, tier: 'free', now, requestKey: 'req-1', recentKeys, ...opts });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe('duplicate');
    expect(isDuplicateRequest(recentKeys, 'req-1')).toBe(true);
  });

  it('resets the bucket at the start of a new cycle inside checkAllowance', () => {
    const stale: AllowanceState = { used: TIERS.free.aiRequestsPerCycle, cycleStart: '2026-05-01T00:00:00.000Z' };
    const d = checkAllowance({ state: stale, tier: 'free', now, ...opts });
    expect(d.allowed).toBe(true);
    expect(d.next.used).toBe(0);
  });

  it('Plus has a larger bucket than free', () => {
    expect(remainingAllowance(freshAllowance(now), 'plus', now, true)).toBeGreaterThan(
      remainingAllowance(freshAllowance(now), 'free', now, true),
    );
  });
});

describe('checkAllowance (monetization disabled)', () => {
  it('always allows, never deducts, reports unlimited', () => {
    const state: AllowanceState = { used: 999, cycleStart: '2026-06-01T00:00:00.000Z' };
    const d = checkAllowance({ state, tier: 'free', now, monetizationEnabled: false });
    expect(d.allowed).toBe(true);
    expect(d.remaining).toBe(Number.POSITIVE_INFINITY);
    expect(remainingAllowance(state, 'free', now, false)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('cost metering', () => {
  it('estimates cost from tokens and provider requests', () => {
    const cents = estimateCostCents({ estTokens: 2000, providerRequests: 5 });
    expect(cents).toBeGreaterThan(0);
  });

  it('enforces the variable-cost guardrail (<20% of net revenue)', () => {
    expect(withinCostGuardrail(100, 1000)).toBe(true); // 10%
    expect(withinCostGuardrail(300, 1000)).toBe(false); // 30%
    expect(withinCostGuardrail(0, 0)).toBe(true);
  });
});

describe('usage events carry NO private content', () => {
  const FORBIDDEN = ['note', 'text', 'prompt', 'answer', 'message', 'photo', 'reflection', 'content', 'body'];

  it('built event only contains safe metering fields', () => {
    const ev = buildUsageEvent({
      kind: 'ai_request',
      at: now,
      provider: 'claude-test',
      estTokens: 1200,
      latencyMs: 800,
      outcome: 'success',
      tier: 'free',
      remainingAllowance: 2,
    });
    const keys = Object.keys(ev);
    for (const f of FORBIDDEN) expect(keys).not.toContain(f);
    // sanity: it does have the safe fields
    expect(keys).toEqual(
      expect.arrayContaining(['kind', 'provider', 'estTokens', 'outcome', 'tier', 'remainingAllowance', 'estCostCents']),
    );
  });

  it('provider identifier is an id, and there is no slot to pass content through', () => {
    const ev = buildUsageEvent({
      kind: 'provider_request',
      at: now,
      provider: 'places:demo',
      providerRequests: 1,
      outcome: 'failure',
      tier: 'plus',
      remainingAllowance: Number.POSITIVE_INFINITY,
    });
    expect(ev.provider).toBe('places:demo');
    expect(JSON.stringify(ev)).not.toMatch(/secret|note|diary|reflection/i);
  });
});
