import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { spaceRepository } from '../repositories';
import { getActiveUser } from '../session';
import { useAppStore } from '../store';
import type { Space } from '../types';

/**
 * Loads the spaces the current user belongs to and tracks which one is active.
 * A user can be in several spaces at once (one couple, many friends).
 */
export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const activeSpaceId = useAppStore((s) => s.activeSpaceId);
  const setActiveSpace = useAppStore((s) => s.setActiveSpace);

  const load = useCallback(async () => {
    const user = await getActiveUser();
    if (!user) {
      setSpaces([]);
      setLoading(false);
      return;
    }
    const data = await spaceRepository.getAllForUser(user.id);
    setSpaces(data);
    setLoading(false);
    // Default the active space to the first one if nothing valid is selected.
    if (data.length > 0 && !data.some((s) => s.id === activeSpaceId)) {
      setActiveSpace(data[0].id);
    }
  }, [activeSpaceId, setActiveSpace]);

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
