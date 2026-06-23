import { LOCAL_PLACES, type LocalPlace, type PriceBand, type Provenance } from '../together';
import type { GeoCoords, LivePlace } from './providers/interface';

export const DEFAULT_LIVE_PLACE_QUERY = 'romantic cafes parks museums viewpoints date spots';
export const DEFAULT_LIVE_PLACE_RADIUS_KM = 3;
export const MIN_LIVE_PLACE_RADIUS_KM = 0.5;
export const MAX_LIVE_PLACE_RADIUS_KM = 8;
export const DEFAULT_LIVE_PLACE_LIMIT = 6;
export const MAX_LIVE_PLACE_LIMIT = 8;
export const LIVE_PLACES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_MONTHLY_LIVE_PLACE_SEARCH_LIMIT = 12;

const DEFAULT_LIVE_PRICE_BAND: PriceBand = LOCAL_PLACES.find((place) => place.priceBand !== 'free')?.priceBand ?? 'free';

export function normalizeLivePlaceQuery(query?: string): string {
  const trimmed = (query ?? DEFAULT_LIVE_PLACE_QUERY).replace(/\s+/g, ' ').trim();
  return (trimmed || DEFAULT_LIVE_PLACE_QUERY).slice(0, 100);
}

export function clampLivePlaceRadiusKm(radiusKm?: number): number {
  if (!Number.isFinite(radiusKm)) return DEFAULT_LIVE_PLACE_RADIUS_KM;
  return Math.min(MAX_LIVE_PLACE_RADIUS_KM, Math.max(MIN_LIVE_PLACE_RADIUS_KM, Number(radiusKm)));
}

export function clampLivePlaceLimit(limit?: number): number {
  if (!Number.isFinite(limit)) return DEFAULT_LIVE_PLACE_LIMIT;
  return Math.min(MAX_LIVE_PLACE_LIMIT, Math.max(1, Math.round(Number(limit))));
}

export function locationBucket(coords: GeoCoords): string {
  return `${coords.lat.toFixed(2)},${coords.lng.toFixed(2)}`;
}

export function livePlaceCacheKey(query: string, near: GeoCoords, radiusKm: number): string {
  return `live-places:cache:${normalizeLivePlaceQuery(query).toLowerCase()}:${locationBucket(near)}:${clampLivePlaceRadiusKm(radiusKm).toFixed(1)}`;
}

export function livePlacesUsageKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `live-places:usage:${year}-${month}`;
}

export function normalizeMonthlyLivePlaceLimit(raw?: string | number | null): number {
  const value = typeof raw === 'number' ? raw : Number.parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_MONTHLY_LIVE_PLACE_SEARCH_LIMIT;
  return Math.min(500, Math.round(value));
}

export function livePlaceBudgetStatus(used: number, limit: number) {
  const safeUsed = Math.max(0, Math.round(used));
  const safeLimit = normalizeMonthlyLivePlaceLimit(limit);
  return {
    used: safeUsed,
    limit: safeLimit,
    remaining: Math.max(0, safeLimit - safeUsed),
    allowed: safeUsed < safeLimit,
  };
}

export function livePlaceIsCacheFresh(cachedAt: number, now = Date.now()): boolean {
  return Number.isFinite(cachedAt) && now - cachedAt < LIVE_PLACES_CACHE_TTL_MS;
}

export function livePlaceToLocalPlace(place: LivePlace): LocalPlace {
  const provenance: Provenance = place.provenance === 'live' ? 'verified-live' : 'needs-confirmation';
  return {
    id: place.id,
    name: place.name,
    category: place.category ?? 'place',
    area: place.address,
    isPartner: false,
    priceBand: DEFAULT_LIVE_PRICE_BAND,
    accessibility: [],
    tags: ['live', place.category ?? 'place', place.sourceId],
    provenance,
    lastVerifiedAt: place.fetchedAt.slice(0, 10),
    lat: place.lat,
    lng: place.lng,
  };
}
