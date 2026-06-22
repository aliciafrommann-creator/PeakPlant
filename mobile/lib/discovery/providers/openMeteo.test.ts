import { describe, it, expect } from 'vitest';
import {
  mapWmoCode,
  isOutdoorFriendly,
  toConstraintWeather,
  toLiveWeather,
  openMeteoWeather,
} from './openMeteo';

describe('mapWmoCode', () => {
  it('maps clear/mainly-clear to sunny', () => {
    expect(mapWmoCode(0)).toBe('sunny');
    expect(mapWmoCode(1)).toBe('sunny');
  });
  it('maps partly cloudy / overcast / fog to cloudy', () => {
    expect(mapWmoCode(2)).toBe('cloudy');
    expect(mapWmoCode(3)).toBe('cloudy');
    expect(mapWmoCode(45)).toBe('cloudy');
  });
  it('maps drizzle/rain/showers/thunder to rainy', () => {
    expect(mapWmoCode(51)).toBe('rainy');
    expect(mapWmoCode(65)).toBe('rainy');
    expect(mapWmoCode(80)).toBe('rainy');
    expect(mapWmoCode(95)).toBe('rainy');
  });
  it('maps snow to snowy', () => {
    expect(mapWmoCode(71)).toBe('snowy');
    expect(mapWmoCode(86)).toBe('snowy');
  });
  it('maps unknown codes to unknown', () => {
    expect(mapWmoCode(-1)).toBe('unknown');
    expect(mapWmoCode(999)).toBe('unknown');
  });
});

describe('isOutdoorFriendly', () => {
  it('is false in rain or snow', () => {
    expect(isOutdoorFriendly('rainy', 20)).toBe(false);
    expect(isOutdoorFriendly('snowy', 1)).toBe(false);
  });
  it('is false when bitterly cold', () => {
    expect(isOutdoorFriendly('sunny', 1)).toBe(false);
  });
  it('is true on a mild clear or cloudy day', () => {
    expect(isOutdoorFriendly('sunny', 18)).toBe(true);
    expect(isOutdoorFriendly('cloudy', 12)).toBe(true);
  });
});

describe('toConstraintWeather', () => {
  const base = { outdoorFriendly: true, provenance: 'live' as const, fetchedAt: '', sourceId: 'open-meteo' };
  it('maps rainy to rain', () => {
    expect(toConstraintWeather({ ...base, condition: 'rainy' })).toBe('rain');
  });
  it('maps snowy to cold', () => {
    expect(toConstraintWeather({ ...base, condition: 'snowy' })).toBe('cold');
  });
  it('treats a cold temperature as cold even under a clear sky', () => {
    expect(toConstraintWeather({ ...base, condition: 'sunny', tempC: 3 })).toBe('cold');
  });
  it('maps a warm clear sky to sunny', () => {
    expect(toConstraintWeather({ ...base, condition: 'sunny', tempC: 20 })).toBe('sunny');
  });
  it('falls back to any for mild cloudy', () => {
    expect(toConstraintWeather({ ...base, condition: 'cloudy', tempC: 15 })).toBe('any');
  });
});

describe('toLiveWeather', () => {
  it('builds a live reading from an Open-Meteo current block', () => {
    const w = toLiveWeather({ temperature_2m: 19, apparent_temperature: 18, weather_code: 0 }, new Date('2026-06-22T12:00:00Z'));
    expect(w.condition).toBe('sunny');
    expect(w.tempC).toBe(19);
    expect(w.outdoorFriendly).toBe(true);
    expect(w.provenance).toBe('live');
    expect(w.sourceId).toBe('open-meteo');
    expect(w.fetchedAt).toBe('2026-06-22T12:00:00.000Z');
  });
});

describe('openMeteoWeather provider', () => {
  it('needs no API key (always configured)', () => {
    expect(openMeteoWeather.configured()).toBe(true);
    expect(openMeteoWeather.id).toBe('open-meteo');
  });
});
