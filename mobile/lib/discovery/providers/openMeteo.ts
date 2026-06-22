/**
 * Open-Meteo weather provider.
 *
 * Open-Meteo is free and needs NO API key (https://open-meteo.com), so this
 * provider is always `configured()`. It is the one live data source we can ship
 * without a secret. It supplies raw conditions only — it never influences ranking
 * position (PP-016); the recommender decides what to do with the weather.
 *
 * The HTTP call lives in `getCurrent`; the mapping is pure + unit-tested. On any
 * failure it returns an honest `network_error`, so callers degrade to "no weather
 * signal" rather than guessing.
 */

import type { Weather } from '../../together';
import type { GeoCoords, IWeatherProvider, LiveWeather, ProviderResult } from './interface';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const SOURCE_ID = 'open-meteo';

/** Innsbruck — the home region of the curated catalog. Used when no GPS is available. */
export const INNSBRUCK: GeoCoords = { lat: 47.2692, lng: 11.4041 };

type Condition = LiveWeather['condition'];

/**
 * Map a WMO weather code (Open-Meteo `weather_code`) to a coarse condition.
 * Codes: 0 clear; 1-3 mainly clear→overcast; 45/48 fog; 51-67 drizzle/rain;
 * 71-77 snow; 80-82 rain showers; 85/86 snow showers; 95-99 thunderstorm.
 */
export function mapWmoCode(code: number): Condition {
  if (code === 0 || code === 1) return 'sunny';
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'rainy';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snowy';
  return 'unknown';
}

/** Outdoor-friendly when it's not raining/snowing and not bitterly cold. */
export function isOutdoorFriendly(condition: Condition, tempC?: number): boolean {
  if (condition === 'rainy' || condition === 'snowy') return false;
  if (typeof tempC === 'number' && tempC <= 2) return false;
  return condition === 'sunny' || condition === 'cloudy';
}

/**
 * Reduce the rich live condition to the recommender's coarse `Weather` constraint
 * (`'sunny' | 'rain' | 'cold' | 'any'`). Cold temperatures win over a clear sky,
 * because "is it cold out?" matters more than the cloud cover for choosing a date.
 */
export function toConstraintWeather(live: LiveWeather): Weather {
  if (live.condition === 'rainy') return 'rain';
  if (live.condition === 'snowy') return 'cold';
  if (typeof live.tempC === 'number' && live.tempC <= 6) return 'cold';
  if (live.condition === 'sunny') return 'sunny';
  return 'any';
}

interface OpenMeteoCurrent {
  temperature_2m?: number;
  apparent_temperature?: number;
  weather_code?: number;
}

/** Build a LiveWeather from a parsed Open-Meteo `current` block. */
export function toLiveWeather(current: OpenMeteoCurrent, now = new Date()): LiveWeather {
  const condition = mapWmoCode(current.weather_code ?? -1);
  return {
    condition,
    tempC: current.temperature_2m,
    feelsLikeC: current.apparent_temperature,
    outdoorFriendly: isOutdoorFriendly(condition, current.temperature_2m),
    provenance: 'live',
    fetchedAt: now.toISOString(),
    sourceId: SOURCE_ID,
  };
}

export const openMeteoWeather: IWeatherProvider = {
  id: SOURCE_ID,
  configured() {
    return true; // no API key required
  },
  async getCurrent(coords: GeoCoords): Promise<ProviderResult<LiveWeather>> {
    const url =
      `${OPEN_METEO_URL}?latitude=${coords.lat}&longitude=${coords.lng}` +
      `&current=temperature_2m,apparent_temperature,weather_code`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) return { ok: false, reason: 'network_error' };
      const data = (await resp.json()) as { current?: OpenMeteoCurrent };
      if (!data.current || typeof data.current.weather_code !== 'number') {
        return { ok: false, reason: 'no_results' };
      }
      return { ok: true, data: toLiveWeather(data.current) };
    } catch {
      return { ok: false, reason: 'network_error' };
    }
  },
};
