/**
 * Null provider implementations — all return `not_configured`.
 *
 * These are the active providers for the beta. They are honest: they never
 * return invented data and the reason field tells the caller exactly why.
 *
 * To swap in a real provider, implement the matching interface in e.g.
 * providers/google.ts and swap the export in providers/index.ts.
 * No changes to the recommender or UI required.
 */

import type {
  IPlacesProvider,
  IEventsProvider,
  IWeatherProvider,
  ProviderResult,
  LivePlace,
  LiveEvent,
  LiveWeather,
  GeoCoords,
} from './interface';

const NOT_CONFIGURED: ProviderResult<never> = { ok: false, reason: 'not_configured' };

export const nullPlacesProvider: IPlacesProvider = {
  id: 'null:places',
  configured() { return false; },
  async search(_query: string, _near?: GeoCoords): Promise<ProviderResult<LivePlace[]>> {
    return NOT_CONFIGURED;
  },
};

export const nullEventsProvider: IEventsProvider = {
  id: 'null:events',
  configured() { return false; },
  async getUpcoming(_near?: GeoCoords): Promise<ProviderResult<LiveEvent[]>> {
    return NOT_CONFIGURED;
  },
};

export const nullWeatherProvider: IWeatherProvider = {
  id: 'null:weather',
  configured() { return false; },
  async getCurrent(_coords: GeoCoords): Promise<ProviderResult<LiveWeather>> {
    return NOT_CONFIGURED;
  },
};
