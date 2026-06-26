import { describe, expect, it } from 'vitest';
import {
  clampLivePlaceLimit,
  clampLivePlaceRadiusKm,
  livePlaceBudgetStatus,
  livePlaceCacheKey,
  livePlaceIsCacheFresh,
  livePlaceToLocalPlace,
  livePlacesUsageKey,
  normalizeLivePlaceQuery,
  normalizeMonthlyLivePlaceLimit,
} from './livePlaces';
import type { LivePlace } from './providers/interface';

describe('live places guardrails', () => {
  it('normalizes empty or very long queries', () => {
    expect(normalizeLivePlaceQuery('   ')).toContain('romantic');
    expect(normalizeLivePlaceQuery('x'.repeat(200))).toHaveLength(100);
  });

  it('clamps radius and result count to small beta-safe values', () => {
    expect(clampLivePlaceRadiusKm(100)).toBe(8);
    expect(clampLivePlaceRadiusKm(0.1)).toBe(0.5);
    expect(clampLivePlaceLimit(99)).toBe(8);
    expect(clampLivePlaceLimit(0)).toBe(1);
  });

  it('builds a stable cache key from rounded location, query and radius', () => {
    const a = livePlaceCacheKey('Cute Cafe', { lat: 47.2681, lng: 11.3931 }, 3);
    const b = livePlaceCacheKey('cute cafe', { lat: 47.2679, lng: 11.3929 }, 3.01);
    expect(a).toBe(b);
  });

  it('resets usage keys by calendar month', () => {
    expect(livePlacesUsageKey(new Date('2026-06-23T12:00:00Z'), 'space-1')).toBe('live-places:usage:space-1:2026-06');
    expect(livePlacesUsageKey(new Date('2026-07-01T12:00:00Z'), 'space-1')).toBe('live-places:usage:space-1:2026-07');
    expect(livePlacesUsageKey(new Date('2026-07-01T12:00:00Z'))).toBe('live-places:usage:device:2026-07');
  });

  it('keeps the monthly limit conservative and finite', () => {
    expect(normalizeMonthlyLivePlaceLimit(undefined)).toBe(6);
    expect(normalizeMonthlyLivePlaceLimit('5')).toBe(5);
    expect(normalizeMonthlyLivePlaceLimit('5000')).toBe(500);
  });

  it('reports remaining budget without going negative', () => {
    expect(livePlaceBudgetStatus(3, 5)).toMatchObject({ allowed: true, remaining: 2 });
    expect(livePlaceBudgetStatus(6, 5)).toMatchObject({ allowed: false, remaining: 0 });
  });

  it('treats cached places as fresh for 24 hours only', () => {
    const now = Date.parse('2026-06-23T12:00:00Z');
    expect(livePlaceIsCacheFresh(now - 23 * 60 * 60 * 1000, now)).toBe(true);
    expect(livePlaceIsCacheFresh(now - 25 * 60 * 60 * 1000, now)).toBe(false);
  });

  it('converts provider places into honest LocalPlace cards', () => {
    const live: LivePlace = {
      id: 'google:abc',
      name: 'Tiny Garden',
      address: 'Somewhere 1, Innsbruck',
      lat: 47.27,
      lng: 11.39,
      category: 'park',
      provenance: 'live',
      fetchedAt: '2026-06-23T10:00:00.000Z',
      sourceId: 'google-places-text-search',
      aiWhy: 'quiet and close by',
    };
    expect(livePlaceToLocalPlace(live)).toMatchObject({
      id: 'google:abc',
      name: 'Tiny Garden',
      category: 'park',
      provenance: 'verified-live',
      lastVerifiedAt: '2026-06-23',
      lat: 47.27,
      lng: 11.39,
    });
  });
});
