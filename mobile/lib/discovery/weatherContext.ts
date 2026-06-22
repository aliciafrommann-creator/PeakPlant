/**
 * Enrich a recommendation request with live weather (the one live signal that
 * needs no API key, via Open-Meteo).
 *
 * Honesty: this only fills `weather` when the caller has not set it explicitly —
 * an in-the-moment user choice always wins over the sensor. On any provider
 * failure the constraints pass through untouched (no guessed weather), so the
 * recommender simply runs without a weather signal.
 *
 * The provider is injected so this is unit-tested without a network call.
 */

import type { DateConstraints } from './types';
import { openMeteoWeather, toConstraintWeather, INNSBRUCK } from './providers/openMeteo';
import type { IWeatherProvider, LiveWeather, GeoCoords } from './providers/interface';

export interface WeatherEnrichment {
  constraints: DateConstraints;
  /** The live reading, when one was fetched (for honest UI labels). */
  weather?: LiveWeather;
  /** True only if a live reading was applied to the constraints. */
  usedLiveWeather: boolean;
}

export async function enrichWithLiveWeather(
  constraints: DateConstraints,
  options: { provider?: IWeatherProvider; coords?: GeoCoords } = {},
): Promise<WeatherEnrichment> {
  // Respect an explicit choice; never override the user.
  if (constraints.weather) {
    return { constraints, usedLiveWeather: false };
  }

  const provider = options.provider ?? openMeteoWeather;
  if (!provider.configured()) {
    return { constraints, usedLiveWeather: false };
  }

  const result = await provider.getCurrent(options.coords ?? INNSBRUCK);
  if (!result.ok || result.data.condition === 'unknown') {
    return { constraints, usedLiveWeather: false };
  }

  return {
    constraints: { ...constraints, weather: toConstraintWeather(result.data) },
    weather: result.data,
    usedLiveWeather: true,
  };
}
