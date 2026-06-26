import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localNoteRepository } from './local';

vi.mock('../storage', () => ({
  storage: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

import { storage } from '../storage';
const mockStorage = storage as unknown as { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };

describe('localNoteRepository', () => {
  beforeEach(() => {
    mockStorage.get.mockReset().mockResolvedValue(null);
    mockStorage.set.mockReset().mockResolvedValue(undefined);
  });

  it('creates a note with id + createdAt and keeps author info', async () => {
    const n = await localNoteRepository.create({
      spaceId: 'space-1',
      text: 'thinking of you',
      authorId: 'user-01',
      authorName: 'Alicia',
    });
    expect(n.id).toMatch(/^note-/);
    expect(n.text).toBe('thinking of you');
    expect(n.authorId).toBe('user-01');
    expect(n.authorName).toBe('Alicia');
    expect(n.createdAt).toBeTruthy();
  });

  it('prepends the newest note when saving', async () => {
    const existing = [
      { id: 'n1', spaceId: 'A', text: 'old', createdAt: '2026-01-01T00:00:00Z' },
    ];
    mockStorage.get.mockResolvedValue(existing);
    await localNoteRepository.create({ spaceId: 'A', text: 'new' });
    const savedArg = mockStorage.set.mock.calls[0][1] as { text: string }[];
    expect(savedArg[0].text).toBe('new'); // newest first
    expect(savedArg[1].text).toBe('old');
  });

  it('filters getAll by spaceId and sorts newest first', async () => {
    const stored = [
      { id: 'n1', spaceId: 'A', text: 'old', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'n2', spaceId: 'A', text: 'new', createdAt: '2026-06-01T00:00:00Z' },
      { id: 'n3', spaceId: 'B', text: 'other space', createdAt: '2026-03-01T00:00:00Z' },
    ];
    mockStorage.get.mockResolvedValue(stored);
    const results = await localNoteRepository.getAll('A');
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('n2');
    expect(results[1].id).toBe('n1');
  });

  it('removes a note', async () => {
    const stored = [
      { id: 'n1', spaceId: 'A', text: 'a', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'n2', spaceId: 'A', text: 'b', createdAt: '2026-02-01T00:00:00Z' },
    ];
    mockStorage.get.mockResolvedValue(stored);
    await localNoteRepository.remove('n1');
    const savedArg = mockStorage.set.mock.calls[0][1] as { id: string }[];
    expect(savedArg.find((n) => n.id === 'n1')).toBeUndefined();
    expect(savedArg).toHaveLength(1);
  });
});
