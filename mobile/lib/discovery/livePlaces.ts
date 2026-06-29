import { LOCAL_PLACES, type LocalPlace, type PriceBand, type Provenance } from '../together';
import type { PublicPlaceSpot } from '../types';
import type { GeoCoords, LivePlace } from './providers/interface';

export const DEFAULT_LIVE_PLACE_QUERY = 'romantic cafes parks museums viewpoints date spots';
export const DEFAULT_LIVE_PLACE_RADIUS_KM = 3;
export const MIN_LIVE_PLACE_RADIUS_KM = 0.5;
export const MAX_LIVE_PLACE_RADIUS_KM = 8;
export const DEFAULT_LIVE_PLACE_LIMIT = 6;
export const MAX_LIVE_PLACE_LIMIT = 8;
export const LIVE_PLACES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_MONTHLY_LIVE_PLACE_SEARCH_LIMIT = 6;

export interface PilotCity {
  id: string;
  label: string;
  coords: GeoCoords;
}

/**
 * Pilot cities are not static venue catalogs and they do NOT limit where the app
 * works — "find near me" uses the device location and works anywhere. They are
 * only convenient location seeds for live provider searches in the launch
 * regions, so a couple can try the map without granting location first.
 */
export const PILOT_CITIES: PilotCity[] = [
  { id: 'hannover', label: 'Hannover', coords: { lat: 52.3759, lng: 9.732 } },
  { id: 'stuttgart', label: 'Stuttgart', coords: { lat: 48.7758, lng: 9.1829 } },
  { id: 'munich', label: 'München', coords: { lat: 48.1351, lng: 11.582 } },
  { id: 'freiburg', label: 'Freiburg', coords: { lat: 47.999, lng: 7.8421 } },
  { id: 'konstanz', label: 'Konstanz', coords: { lat: 47.6779, lng: 9.1732 } },
];

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

export function livePlacesUsageKey(date = new Date(), scopeId = 'device'): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const safeScope = scopeId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'device';
  return `live-places:usage:${safeScope}:${year}-${month}`;
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

export function livePlaceUsageScope(spaceId?: string | null): string {
  return spaceId?.trim() || 'device';
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

export function publicSpotToLocalPlace(spot: PublicPlaceSpot): LocalPlace {
  return {
    id: spot.id,
    name: spot.name,
    category: spot.category ?? 'community spot',
    area: spot.address || 'shared anonymously',
    isPartner: false,
    priceBand: DEFAULT_LIVE_PRICE_BAND,
    accessibility: [],
    tags: ['community', spot.category ?? 'spot'],
    provenance: 'verified-live',
    lastVerifiedAt: spot.createdAt.slice(0, 10),
    lat: spot.lat,
    lng: spot.lng,
  };
}
