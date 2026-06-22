import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localRitualRepository } from './local';

vi.mock('../storage', () => ({
  storage: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

import { storage } from '../storage';
const mockStorage = storage as unknown as { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };

describe('localRitualRepository', () => {
  beforeEach(() => {
    mockStorage.get.mockResolvedValue(null);
    mockStorage.set.mockResolvedValue(undefined);
  });

  it('creates a ritual with id + createdAt', async () => {
    const r = await localRitualRepository.create({
      spaceId: 'space-1',
      title: 'Sunday walk',
      cadence: 'weekly',
    });
    expect(r.id).toMatch(/^ritual-/);
    expect(r.title).toBe('Sunday walk');
    expect(r.cadence).toBe('weekly');
    expect(r.createdAt).toBeTruthy();
  });

  it('filters getAll by spaceId and sorts newest first', async () => {
    const stored = [
      { id: 'r1', spaceId: 'A', title: 'old', cadence: 'whenever', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'r2', spaceId: 'A', title: 'new', cadence: 'monthly', createdAt: '2026-06-01T00:00:00Z' },
      { id: 'r3', spaceId: 'B', title: 'other space', cadence: 'weekly', createdAt: '2026-03-01T00:00:00Z' },
    ];
    mockStorage.get.mockResolvedValue(stored);
    const results = await localRitualRepository.getAll('A');
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('r2'); // newest first
    expect(results[1].id).toBe('r1');
  });

  it('updates lastRevisitedAt', async () => {
    const stored = [{ id: 'r1', spaceId: 'A', title: 'walk', cadence: 'weekly', createdAt: '2026-01-01T00:00:00Z' }];
    mockStorage.get.mockResolvedValue(stored);
    const updated = await localRitualRepository.update('r1', { lastRevisitedAt: '2026-06-22T00:00:00Z' });
    expect(updated.lastRevisitedAt).toBe('2026-06-22T00:00:00Z');
  });

  it('throws when updating a missing ritual', async () => {
    mockStorage.get.mockResolvedValue([]);
    await expect(localRitualRepository.update('nope', { title: 'x' })).rejects.toThrow();
  });

  it('removes a ritual', async () => {
    const stored = [
      { id: 'r1', spaceId: 'A', title: 'a', cadence: 'weekly', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'r2', spaceId: 'A', title: 'b', cadence: 'weekly', createdAt: '2026-02-01T00:00:00Z' },
    ];
    mockStorage.get.mockResolvedValue(stored);
    await localRitualRepository.remove('r1');
    const savedArg = mockStorage.set.mock.calls[0][1] as { id: string }[];
    expect(savedArg.find((r) => r.id === 'r1')).toBeUndefined();
    expect(savedArg).toHaveLength(1);
  });
});
