import { useState, useEffect, useCallback } from 'react';
import { localMemoryRepository } from '../repositories/local';
import type { Memory } from '../types';
import { SEED_COUPLE } from '../seed';

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await localMemoryRepository.getAll(SEED_COUPLE.id);
      setMemories(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load memories'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createMemory = useCallback(
    async (data: { cardId: string; note: string; photoUri?: string }) => {
      const memory = await localMemoryRepository.create({
        ...data,
        coupleId: SEED_COUPLE.id,
      });
      setMemories((prev) => [memory, ...prev]);
      return memory;
    },
    []
  );

  const deleteMemory = useCallback(async (id: string) => {
    await localMemoryRepository.delete(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { memories, loading, error, createMemory, deleteMemory, refresh: load };
}
