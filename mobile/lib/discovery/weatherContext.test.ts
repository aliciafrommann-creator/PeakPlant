import { describe, it, expect } from 'vitest';
import { enrichWithLiveWeather } from './weatherContext';
import type { IWeatherProvider, LiveWeather, ProviderResult } from './providers/interface';
import type { DateConstraints } from './types';

function fakeProvider(result: ProviderResult<LiveWeather>, configured = true): IWeatherProvider {
  return {
    id: 'fake',
    configured: () => configured,
    getCurrent: async () => result,
  };
}

const sunny: LiveWeather = {
  condition: 'sunny',
  tempC: 20,
  outdoorFriendly: true,
  provenance: 'live',
  fetchedAt: '2026-06-22T12:00:00.000Z',
  sourceId: 'fake',
};

const base: DateConstraints = { spaceType: 'couple' };

describe('enrichWithLiveWeather', () => {
  it('applies live weather when none is set and coords are known', async () => {
    const out = await enrichWithLiveWeather(base, {
      provider: fakeProvider({ ok: true, data: sunny }),
      coords: { lat: 52.37, lng: 9.73 },
    });
    expect(out.usedLiveWeather).toBe(true);
    expect(out.constraints.weather).toBe('sunny');
    expect(out.weather?.sourceId).toBe('fake');
  });

  it('never invents weather without coordinates (no fixed-city fallback)', async () => {
    const out = await enrichWithLiveWeather(base, { provider: fakeProvider({ ok: true, data: sunny }) });
    expect(out.usedLiveWeather).toBe(false);
    expect(out.constraints.weather).toBeUndefined();
  });

  it('never overrides an explicit user choice', async () => {
    const out = await enrichWithLiveWeather(
      { ...base, weather: 'rain' },
      { provider: fakeProvider({ ok: true, data: sunny }) },
    );
    expect(out.usedLiveWeather).toBe(false);
    expect(out.constraints.weather).toBe('rain');
  });

  it('passes constraints through untouched on provider failure', async () => {
    const out = await enrichWithLiveWeather(base, { provider: fakeProvider({ ok: false, reason: 'network_error' }) });
    expect(out.usedLiveWeather).toBe(false);
    expect(out.constraints.weather).toBeUndefined();
  });

  it('ignores an unknown condition', async () => {
    const unknown: LiveWeather = { ...sunny, condition: 'unknown' };
    const out = await enrichWithLiveWeather(base, { provider: fakeProvider({ ok: true, data: unknown }) });
    expect(out.usedLiveWeather).toBe(false);
  });

  it('no-ops when the provider is not configured', async () => {
    const out = await enrichWithLiveWeather(base, { provider: fakeProvider({ ok: true, data: sunny }, false) });
    expect(out.usedLiveWeather).toBe(false);
  });
});
