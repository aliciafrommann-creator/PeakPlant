import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from '../storage';
import { localSpaceRepository } from './local';
import type { Space } from '../types';

// vi.mock is hoisted above the imports by vitest, so the storage import resolves
// to this mock.
vi.mock('../storage', () => ({
  storage: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockStorage = storage as unknown as {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
};

const SPACE: Space = {
  id: 'space-1',
  type: 'couple',
  name: 'Our place',
  inviteCode: 'PEAK-ABC234',
  createdAt: '2026-01-01T00:00:00Z',
};

describe('localSpaceRepository.update', () => {
  beforeEach(() => {
    mockStorage.get.mockReset().mockResolvedValue([SPACE]);
    mockStorage.set.mockReset().mockResolvedValue(undefined);
  });

  it('renames a space and persists it', async () => {
    const updated = await localSpaceRepository.update('space-1', { name: '  Sunny days  ' });
    expect(updated.name).toBe('Sunny days');
    const saved = mockStorage.set.mock.calls[0][1] as Space[];
    expect(saved[0].name).toBe('Sunny days');
  });

  it('keeps the old name when the new one is blank', async () => {
    const updated = await localSpaceRepository.update('space-1', { name: '   ' });
    expect(updated.name).toBe('Our place');
  });

  it('sets the shared emoji', async () => {
    const updated = await localSpaceRepository.update('space-1', { emoji: '🌻' });
    expect(updated.emoji).toBe('🌻');
    expect(updated.name).toBe('Our place'); // untouched
  });

  it('sets the avatar path', async () => {
    const updated = await localSpaceRepository.update('space-1', { avatarPath: 'space-1/a.jpg' });
    expect(updated.avatarPath).toBe('space-1/a.jpg');
  });

  it('sets the collectible emoji', async () => {
    const updated = await localSpaceRepository.update('space-1', { collectibleEmoji: '🏆' });
    expect(updated.collectibleEmoji).toBe('🏆');
  });

  it('updates name, emoji and collectible together without dropping any', async () => {
    const updated = await localSpaceRepository.update('space-1', {
      name: 'Us',
      emoji: '🌙',
      collectibleEmoji: '🌶️',
    });
    expect(updated.name).toBe('Us');
    expect(updated.emoji).toBe('🌙');
    expect(updated.collectibleEmoji).toBe('🌶️');
  });

  it('throws for an unknown space', async () => {
    await expect(localSpaceRepository.update('nope', { name: 'x' })).rejects.toThrow();
  });
});
