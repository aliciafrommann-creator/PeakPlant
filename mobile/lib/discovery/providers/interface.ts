/**
 * Live-data provider interfaces for the Date Discovery layer.
 *
 * All providers follow the same pattern:
 *  - configured() — returns true only if the required env var(s) are present
 *  - request() — returns results with honest provenance labels
 *
 * Beta status: ALL providers below are in their null (disabled) form. The
 * interfaces are fixed so real adapters can be swapped in without touching
 * discovery/recommend.ts or any UI code.
 *
 * Ranking integrity (PP-016): providers supply raw data only. The recommender
 * scores items; no provider may influence ranking position for commercial reasons.
 */

/** A single venue / point of interest from a live places provider. */
export interface LivePlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** 'live' = from a real API this request; 'cached' = stale but validated. */
  provenance: 'live' | 'cached';
  /** ISO timestamp of the last successful fetch from this source. */
  fetchedAt: string;
  /** The provider that returned this result (for transparency). */
  sourceId: string;
}

/** A date-relevant local event. */
export interface LiveEvent {
  id: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  venueId?: string;
  url?: string;
  provenance: 'live' | 'cached';
  fetchedAt: string;
  sourceId: string;
}

/** Current or forecast weather conditions. */
export interface LiveWeather {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'unknown';
  tempC?: number;
  feelsLikeC?: number;
  /** Whether outdoor activities are recommended. */
  outdoorFriendly: boolean;
  provenance: 'live' | 'cached';
  fetchedAt: string;
  sourceId: string;
}

export interface GeoCoords {
  lat: number;
  lng: number;
}

/** Result wrapper: the provider either returns data or an honest failure. */
export type ProviderResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'not_configured' | 'network_error' | 'rate_limited' | 'no_results' };

export interface IPlacesProvider {
  readonly id: string;
  configured(): boolean;
  search(query: string, near?: GeoCoords, radiusKm?: number): Promise<ProviderResult<LivePlace[]>>;
}

export interface IEventsProvider {
  readonly id: string;
  configured(): boolean;
  getUpcoming(near?: GeoCoords, radiusKm?: number): Promise<ProviderResult<LiveEvent[]>>;
}

export interface IWeatherProvider {
  readonly id: string;
  configured(): boolean;
  getCurrent(coords: GeoCoords): Promise<ProviderResult<LiveWeather>>;
}
