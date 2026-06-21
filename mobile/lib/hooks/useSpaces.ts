import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { localSpaceRepository } from '../repositories/local';
import { getMockUser } from '../mock-auth';
import { useAppStore } from '../store';
import type { Space } from '../types';

/**
 * Loads the spaces the current (mock) user belongs to and tracks which one is
 * active. A user can be in several spaces at once (one couple, many friends).
 */
export function useSpaces() {
  const user = getMockUser();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const activeSpaceId = useAppStore((s) => s.activeSpaceId);
  const setActiveSpace = useAppStore((s) => s.setActiveSpace);

  const load = useCallback(async () => {
    const data = await localSpaceRepository.getAllForUser(user.id);
    setSpaces(data);
    setLoading(false);
    // Default the active space to the first one if nothing valid is selected.
    if (data.length > 0 && !data.some((s) => s.id === activeSpaceId)) {
      setActiveSpace(data[0].id);
    }
  }, [user.id, activeSpaceId, setActiveSpace]);

  useEffect(() => {
    void load();
  }, [load]);

  // Refresh when a screen regains focus (e.g. after creating/joining a space).
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const activeSpace = spaces.find((s) => s.id === activeSpaceId) ?? spaces[0] ?? null;

  return { spaces, activeSpace, loading, setActiveSpace, refresh: load };
}
