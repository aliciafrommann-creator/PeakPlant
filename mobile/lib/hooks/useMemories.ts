import { useState, useEffect, useCallback } from 'react';
import { memoryRepository, cardRepository } from '../repositories';
import type { Memory } from '../types';

export function useMemories(spaceId?: string) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!spaceId) {
      setMemories([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await memoryRepository.getAll(spaceId);
      setMemories(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load memories'));
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const createMemory = useCallback(
    async (data: { cardId: string; note: string; photoUri?: string }) => {
      if (!spaceId) throw new Error('No active space');
      const memory = await memoryRepository.create({ ...data, spaceId });
      // A preserved moment discovers its card — for this space only.
      await cardRepository.activate(data.cardId, spaceId).catch(() => undefined);
      setMemories((prev) => [memory, ...prev]);
      return memory;
    },
    [spaceId],
  );

  const deleteMemory = useCallback(async (id: string) => {
    await memoryRepository.delete(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { memories, loading, error, createMemory, deleteMemory, refresh: load };
}
