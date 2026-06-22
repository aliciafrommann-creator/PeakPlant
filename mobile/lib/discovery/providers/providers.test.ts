import { describe, it, expect } from 'vitest';
import { nullPlacesProvider, nullEventsProvider, nullWeatherProvider } from './null';
import type { IPlacesProvider, IEventsProvider, IWeatherProvider } from './interface';

describe('null providers satisfy the interface contract', () => {
  it('nullPlacesProvider is not configured', () => {
    const p: IPlacesProvider = nullPlacesProvider;
    expect(p.id).toContain('null');
    expect(p.configured()).toBe(false);
  });

  it('nullPlacesProvider.search returns not_configured honestly', async () => {
    const result = await nullPlacesProvider.search('park');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_configured');
  });

  it('nullEventsProvider is not configured', () => {
    const p: IEventsProvider = nullEventsProvider;
    expect(p.configured()).toBe(false);
  });

  it('nullEventsProvider.getUpcoming returns not_configured honestly', async () => {
    const result = await nullEventsProvider.getUpcoming();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_configured');
  });

  it('nullWeatherProvider is not configured', () => {
    const p: IWeatherProvider = nullWeatherProvider;
    expect(p.configured()).toBe(false);
  });

  it('nullWeatherProvider.getCurrent returns not_configured honestly', async () => {
    const result = await nullWeatherProvider.getCurrent({ lat: 47.27, lng: 11.39 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_configured');
  });

  it('a configured() provider that returns not_configured would be a contract violation', () => {
    // This test documents the contract: configured() = true MUST mean
    // the provider can attempt a real call. It is NOT a runtime test of
    // real providers — just a statement that the two fields are coupled.
    const alwaysConfigured: IPlacesProvider = {
      id: 'test',
      configured: () => true,
      search: async () => ({ ok: false, reason: 'not_configured' }),
    };
    // A caller is allowed to trust that configured() = true means real data may come back.
    expect(alwaysConfigured.configured()).toBe(true);
  });
});
