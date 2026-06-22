import { describe, it, expect } from 'vitest';
import {
  freeEntitlement,
  resolveEntitlement,
  isPlus,
  hasFeature,
  entitlementForSpace,
  type EntitlementState,
} from './entitlements';

const now = new Date('2026-06-22T12:00:00Z');

function plus(over: Partial<EntitlementState> = {}): EntitlementState {
  return {
    spaceId: 'space-1',
    tier: 'plus',
    source: 'purchase',
    startsAt: '2026-06-01T00:00:00Z',
    expiresAt: '2026-12-01T00:00:00Z',
    restoration: 'restored',
    ...over,
  };
}

describe('resolveEntitlement', () => {
  it('resolves an active purchase as Plus', () => {
    const r = resolveEntitlement(plus(), { now, monetizationEnabled: true });
    expect(r.tier).toBe('plus');
    expect(r.active).toBe(true);
    expect(r.expired).toBe(false);
  });

  it('degrades an expired entitlement to free and flags it expired', () => {
    const r = resolveEntitlement(plus({ expiresAt: '2026-05-01T00:00:00Z' }), { now, monetizationEnabled: true });
    expect(r.tier).toBe('free');
    expect(r.active).toBe(false);
    expect(r.expired).toBe(true);
  });

  it('does not activate an entitlement that has not started yet', () => {
    const r = resolveEntitlement(plus({ startsAt: '2026-07-01T00:00:00Z' }), { now, monetizationEnabled: true });
    expect(r.active).toBe(false);
    expect(r.tier).toBe('free');
  });

  it('treats a promotional entitlement with no expiry as active Plus', () => {
    const r = resolveEntitlement(
      plus({ source: 'promo', expiresAt: undefined }),
      { now, monetizationEnabled: true },
    );
    expect(r.active).toBe(true);
    expect(r.source).toBe('promo');
    expect(r.tier).toBe('plus');
  });

  it('carries an offline flag through resolution (offline-safe)', () => {
    const r = resolveEntitlement(plus(), { now, monetizationEnabled: true, offline: true });
    expect(r.offline).toBe(true);
    expect(r.active).toBe(true); // cached state still grants access
  });

  it('a free entitlement is never expired', () => {
    const r = resolveEntitlement(freeEntitlement('space-1'), { now, monetizationEnabled: true });
    expect(r.tier).toBe('free');
    expect(r.expired).toBe(false);
  });
});

describe('isPlus / hasFeature gating', () => {
  it('free has no gated features when monetization is enabled', () => {
    const r = resolveEntitlement(freeEntitlement('space-1'), { now, monetizationEnabled: true });
    expect(isPlus(r, true)).toBe(false);
    expect(hasFeature(r, 'ai_ask_peakplant', true)).toBe(false);
  });

  it('Plus unlocks gated features when monetization is enabled', () => {
    const r = resolveEntitlement(plus(), { now, monetizationEnabled: true });
    expect(isPlus(r, true)).toBe(true);
    expect(hasFeature(r, 'memory_export', true)).toBe(true);
  });

  it('with monetization DISABLED, everyone has full access', () => {
    const r = resolveEntitlement(freeEntitlement('space-1'), { now, monetizationEnabled: false });
    expect(isPlus(r, false)).toBe(true);
    expect(hasFeature(r, 'ai_ask_peakplant', false)).toBe(true);
    expect(hasFeature(r, 'premium_rituals', false)).toBe(true);
  });
});

describe('couple-level entitlement', () => {
  it('belongs to a space regardless of which member purchased it', () => {
    const states: EntitlementState[] = [plus({ spaceId: 'space-A' })];
    // Whoever is asking, the space-A entitlement is the same couple-level record.
    expect(entitlementForSpace(states, 'space-A').tier).toBe('plus');
  });

  it('a space with no record is free (e.g. after a partner disconnect)', () => {
    // Partner disconnect removes a member, never the space's entitlement; a space
    // that simply never bought is free.
    const states: EntitlementState[] = [plus({ spaceId: 'space-A' })];
    const r = resolveEntitlement(entitlementForSpace(states, 'space-B'), { now, monetizationEnabled: true });
    expect(r.tier).toBe('free');
  });

  it('keeps the space entitlement intact across a partner disconnect', () => {
    // The entitlement is keyed only by spaceId — no purchaser/member id — so
    // removing a member cannot strip the remaining partner's access.
    const states: EntitlementState[] = [plus({ spaceId: 'space-A' })];
    const r = resolveEntitlement(entitlementForSpace(states, 'space-A'), { now, monetizationEnabled: true });
    expect(r.active).toBe(true);
  });
});
