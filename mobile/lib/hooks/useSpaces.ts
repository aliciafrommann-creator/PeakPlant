import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { spaceRepository } from '../repositories';
import { getActiveUser } from '../session';
import { useAppStore } from '../store';
import { getSpaceEmoji, getCollectibleEmoji } from '../spaceCustomization';
import { isSupabaseConfigured } from '../supabase/client';
import { signedAvatarUrl } from '../supabase/storage';
import type { Space } from '../types';

/** Resolve a displayable avatar URL from a stored path, or undefined. */
async function resolveAvatarUrl(avatarPath?: string): Promise<string | undefined> {
  if (!avatarPath) return undefined;
  // Configured: avatarPath is a storage path → short-lived signed URL.
  // Not configured: avatarPath is the picked local file URI → use it directly.
  if (!isSupabaseConfigured) return avatarPath;
  try {
    return await signedAvatarUrl(avatarPath);
  } catch {
    return undefined; // bucket missing (pre-0012) or signing failed → emoji fallback
  }
}

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
    const enriched = await Promise.all(
      data.map(async (s) => ({
        ...s,
        // Server value (spaces.emoji, migration 0012) is the source of truth so
        // both members see the same mark; local storage is a fallback for spaces
        // created before sync, or when Supabase isn't configured.
        emoji: s.emoji ?? (await getSpaceEmoji(s.id)),
        collectibleEmoji: await getCollectibleEmoji(s.id),
        avatarUrl: await resolveAvatarUrl(s.avatarPath),
      })),
    );
    setSpaces(enriched);
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
