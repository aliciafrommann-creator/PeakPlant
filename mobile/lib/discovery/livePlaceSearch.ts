import { storage } from '../storage';
import { placesProvider } from './providers';
import type { GeoCoords, LivePlace, ProviderResult } from './providers/interface';
import {
  DEFAULT_LIVE_PLACE_LIMIT,
  DEFAULT_LIVE_PLACE_RADIUS_KM,
  clampLivePlaceLimit,
  clampLivePlaceRadiusKm,
  livePlaceBudgetStatus,
  livePlaceCacheKey,
  livePlaceIsCacheFresh,
  livePlacesUsageKey,
  livePlaceUsageScope,
  normalizeLivePlaceQuery,
  normalizeMonthlyLivePlaceLimit,
} from './livePlaces';

interface LivePlaceCacheEntry {
  cachedAt: number;
  places: LivePlace[];
}

export type LivePlaceSearchFailure =
  | 'not_configured'
  | 'network_error'
  | 'rate_limited'
  | 'no_results'
  | 'monthly_limit'
  | 'storage_unavailable';

export type LivePlaceSearchResult =
  | {
      ok: true;
      places: LivePlace[];
      source: 'live' | 'cached';
      used: number;
      remaining: number;
      limit: number;
    }
  | {
      ok: false;
      reason: LivePlaceSearchFailure;
      used: number;
      remaining: number;
      limit: number;
    };

async function readUsed(scopeId?: string, date = new Date()): Promise<number> {
  const value = await storage.get<number>(livePlacesUsageKey(date, livePlaceUsageScope(scopeId)));
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

async function setUsed(used: number, scopeId?: string, date = new Date()): Promise<void> {
  await storage.set(livePlacesUsageKey(date, livePlaceUsageScope(scopeId)), Math.max(0, Math.round(used)));
}

function configuredMonthlyLimit(): number {
  return normalizeMonthlyLivePlaceLimit(process.env.EXPO_PUBLIC_LIVE_PLACES_MONTHLY_LIMIT);
}

export async function resetLivePlaceSearchUsage(scopeId?: string): Promise<void> {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  await storage.remove(livePlacesUsageKey(now, livePlaceUsageScope(scopeId)));
  await storage.remove(`live-places:usage:${year}-${month}`); // legacy pre-space-scope key
}

async function cachedPlaces(
  query: string,
  near: GeoCoords,
  radiusKm: number,
): Promise<LivePlace[] | null> {
  const entry = await storage.get<LivePlaceCacheEntry>(livePlaceCacheKey(query, near, radiusKm));
  if (!entry || !Array.isArray(entry.places)) return null;
  if (!livePlaceIsCacheFresh(entry.cachedAt)) return null;
  return entry.places.map((place) => ({ ...place, provenance: 'cached' as const }));
}

async function writeCache(
  query: string,
  near: GeoCoords,
  radiusKm: number,
  places: LivePlace[],
): Promise<void> {
  await storage.set<LivePlaceCacheEntry>(livePlaceCacheKey(query, near, radiusKm), {
    cachedAt: Date.now(),
    places,
  });
}

function failureFromProvider(result: ProviderResult<LivePlace[]>): Exclude<LivePlaceSearchFailure, 'monthly_limit' | 'storage_unavailable'> {
  return result.ok ? 'no_results' : result.reason;
}

/**
 * Cost-aware live place search. Cache hits do not count against the local
 * monthly budget. Fresh provider calls are user-triggered only and capped per
 * device/month before we touch a paid API.
 */
export async function searchLivePlacesNear({
  query,
  near,
  radiusKm = DEFAULT_LIVE_PLACE_RADIUS_KM,
  limit = DEFAULT_LIVE_PLACE_LIMIT,
  scopeId,
}: {
  query?: string;
  near: GeoCoords;
  radiusKm?: number;
  limit?: number;
  /** Budget scope; pass the current space id so allowance is per space/month. */
  scopeId?: string;
}): Promise<LivePlaceSearchResult> {
  const normalizedQuery = normalizeLivePlaceQuery(query);
  const safeRadius = clampLivePlaceRadiusKm(radiusKm);
  const safeLimit = clampLivePlaceLimit(limit);
  const monthlyLimit = configuredMonthlyLimit();

  let used: number;
  try {
    used = await readUsed(scopeId);
    const cached = await cachedPlaces(normalizedQuery, near, safeRadius);
    const status = livePlaceBudgetStatus(used, monthlyLimit);
    if (cached) {
      return { ok: true, places: cached.slice(0, safeLimit), source: 'cached', ...status };
    }
    if (!status.allowed) return { ok: false, reason: 'monthly_limit', ...status };
    await setUsed(used + 1, scopeId);
    used += 1;
  } catch {
    const status = livePlaceBudgetStatus(0, monthlyLimit);
    return { ok: false, reason: 'storage_unavailable', ...status };
  }

  const result = await placesProvider.search(normalizedQuery, near, safeRadius);
  const status = livePlaceBudgetStatus(used, monthlyLimit);

  if (!result.ok) {
    // User-visible allowance should buy useful returned places. If the provider
    // cannot return anything (not configured, rate-limited, network/no-results),
    // refund the visible allowance while internal provider-cost monitoring stays
    // separate from this local UX guardrail.
    try { await setUsed(used - 1, scopeId); } catch { /* non-fatal */ }
    const refunded = livePlaceBudgetStatus(used - 1, monthlyLimit);
    return { ok: false, reason: failureFromProvider(result), ...refunded };
  }

  const places = result.data.slice(0, safeLimit);
  try { await writeCache(normalizedQuery, near, safeRadius, places); } catch { /* cache miss next time */ }

  return {
    ok: true,
    places,
    source: 'live',
    ...status,
  };
}
