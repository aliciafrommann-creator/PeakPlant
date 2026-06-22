/**
 * Lightweight in-memory TTL cache.
 *
 * Used to reduce repeated AsyncStorage JSON parses for hot paths like
 * saved dates and memories (called on every focus/render). Not a substitute
 * for proper persistence — just a short-lived read cache with explicit
 * invalidation on writes.
 *
 * Defaults: 5 second TTL per entry, max 64 entries (LRU eviction).
 */

export interface CacheOptions {
  ttlMs?: number;
  maxEntries?: number;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache<T = unknown> {
  private entries = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  constructor({ ttlMs = 5_000, maxEntries = 64 }: CacheOptions = {}) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
  }

  get(key: string): T | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.entries.size >= this.maxEntries) {
      // Evict the oldest entry (first inserted key in insertion order).
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  invalidate(key: string): void {
    this.entries.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) this.entries.delete(key);
    }
  }

  clear(): void {
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }
}

/** Shared caches for hot repository paths. Invalidated on every write. */
export const savedDateCache = new MemoryCache<unknown[]>({ ttlMs: 5_000 });
export const memoryCache = new MemoryCache<unknown[]>({ ttlMs: 5_000 });
