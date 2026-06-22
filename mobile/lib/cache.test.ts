import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryCache } from './cache';

describe('MemoryCache', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('stores and retrieves a value within the TTL', () => {
    const cache = new MemoryCache<number>({ ttlMs: 1000 });
    cache.set('a', 42);
    expect(cache.get('a')).toBe(42);
  });

  it('returns null after the TTL expires', () => {
    const cache = new MemoryCache<number>({ ttlMs: 1000 });
    cache.set('a', 42);
    vi.advanceTimersByTime(1001);
    expect(cache.get('a')).toBeNull();
  });

  it('returns null for missing keys', () => {
    const cache = new MemoryCache<number>();
    expect(cache.get('missing')).toBeNull();
  });

  it('invalidate removes a single key', () => {
    const cache = new MemoryCache<number>();
    cache.set('x', 1);
    cache.set('y', 2);
    cache.invalidate('x');
    expect(cache.get('x')).toBeNull();
    expect(cache.get('y')).toBe(2);
  });

  it('invalidatePrefix removes matching keys', () => {
    const cache = new MemoryCache<number>();
    cache.set('space-1:saved', 1);
    cache.set('space-1:memories', 2);
    cache.set('space-2:saved', 3);
    cache.invalidatePrefix('space-1:');
    expect(cache.get('space-1:saved')).toBeNull();
    expect(cache.get('space-1:memories')).toBeNull();
    expect(cache.get('space-2:saved')).toBe(3);
  });

  it('evicts the oldest entry when maxEntries is reached', () => {
    const cache = new MemoryCache<number>({ maxEntries: 3 });
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4);  // should evict 'a'
    expect(cache.get('a')).toBeNull();
    expect(cache.get('d')).toBe(4);
    expect(cache.size).toBe(3);
  });

  it('clear empties all entries', () => {
    const cache = new MemoryCache<number>();
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get('a')).toBeNull();
  });

  it('overwrites a key without growing beyond maxEntries', () => {
    const cache = new MemoryCache<number>({ maxEntries: 2 });
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('a', 99);  // overwrite, not a new entry
    expect(cache.size).toBeLessThanOrEqual(2);
    expect(cache.get('a')).toBe(99);
  });
});
