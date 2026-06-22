import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localDateFeedbackRepository } from './local';

vi.mock('../storage', () => ({
  storage: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

import { storage } from '../storage';

const mockStorage = storage as unknown as { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };

describe('localDateFeedbackRepository', () => {
  beforeEach(() => {
    mockStorage.get.mockResolvedValue(null);
    mockStorage.set.mockResolvedValue(undefined);
  });

  it('saves a rating-only feedback entry and returns it with id + createdAt', async () => {
    const entry = await localDateFeedbackRepository.save({
      savedDateId: 'sd-1',
      spaceId: 'space-1',
      momentId: 'moment-42',
      rating: 4,
    });
    expect(entry.id).toMatch(/^fb-/);
    expect(entry.rating).toBe(4);
    expect(entry.tip).toBeUndefined();
    expect(entry.createdAt).toBeTruthy();
    expect(mockStorage.set).toHaveBeenCalledOnce();
  });

  it('saves a full entry with tip and preserves it', async () => {
    const entry = await localDateFeedbackRepository.save({
      savedDateId: 'sd-2',
      spaceId: 'space-1',
      momentId: 'moment-7',
      rating: 5,
      tip: 'bring a blanket — it gets cold after dark',
    });
    expect(entry.tip).toBe('bring a blanket — it gets cold after dark');
    expect(entry.rating).toBe(5);
  });

  it('filters getAll by spaceId', async () => {
    const stored = [
      { id: 'fb-1', savedDateId: 'sd-1', spaceId: 'space-A', momentId: 'm1', rating: 3, createdAt: '2026-06-01T00:00:00Z' },
      { id: 'fb-2', savedDateId: 'sd-2', spaceId: 'space-B', momentId: 'm2', rating: 5, createdAt: '2026-06-02T00:00:00Z' },
    ];
    mockStorage.get.mockResolvedValue(stored);
    const results = await localDateFeedbackRepository.getAll('space-A');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('fb-1');
  });

  it('getByMoment finds matching entry or null', async () => {
    const stored = [
      { id: 'fb-1', savedDateId: 'sd-1', spaceId: 'space-A', momentId: 'm1', rating: 4, createdAt: '2026-06-01T00:00:00Z' },
    ];
    mockStorage.get.mockResolvedValue(stored);
    const found = await localDateFeedbackRepository.getByMoment('space-A', 'm1');
    expect(found?.id).toBe('fb-1');
    const missing = await localDateFeedbackRepository.getByMoment('space-A', 'm99');
    expect(missing).toBeNull();
  });

  it('tip field never carries private diary content — only practical fields are stored', async () => {
    const entry = await localDateFeedbackRepository.save({
      savedDateId: 'sd-3',
      spaceId: 'space-1',
      momentId: 'moment-5',
      rating: 3,
      tip: 'good spot for a picnic',
    });
    const stored = mockStorage.set.mock.calls[0][1] as unknown[];
    const saved = (stored as typeof entry[])[0];
    const keys = Object.keys(saved);
    // These private-content field names must never appear in a feedback record.
    const forbidden = ['note', 'reflection', 'diary', 'prompt', 'answer', 'message'];
    for (const f of forbidden) expect(keys).not.toContain(f);
  });
});
