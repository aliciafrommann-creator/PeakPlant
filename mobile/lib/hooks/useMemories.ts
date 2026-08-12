import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
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
      // Clear any stale error — otherwise a once-offline load leaves the feed
      // stuck on the error state forever, hiding the real empty state (A1-16).
      setError(null);
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

  // Keep the list in sync after edits/deletes made on the detail screen.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const createMemory = useCallback(
    async (data: { cardId?: string; note: string; photoUri?: string }) => {
      if (!spaceId) throw new Error('No active space');
      const memory = await memoryRepository.create({ ...data, spaceId });
      // Only a real scanned card counts toward the collection — free moments
      // (challenge, discover, places) must not inflate "N von 20 bewahrt" (§1).
      if (data.cardId) {
        await cardRepository.activate(data.cardId, spaceId).catch(() => undefined);
      }
      setMemories((prev) => [memory, ...prev]);
      return memory;
    },
    [spaceId],
  );

  const updateMemory = useCallback(
    async (id: string, updates: { note?: string; photoUri?: string }) => {
      const updated = await memoryRepository.update(id, updates);
      setMemories((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    },
    [],
  );

  const deleteMemory = useCallback(async (id: string) => {
    await memoryRepository.delete(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { memories, loading, error, createMemory, updateMemory, deleteMemory, refresh: load };
}
