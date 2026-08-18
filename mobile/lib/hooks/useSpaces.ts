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
  /**
   * Ob das Laden fehlgeschlagen ist.
   *
   * Vorher hatte dieser Hook KEIN try/catch und gab kein `error` zurück.
   * `spaceRepository.getAllForUser()` wirft bei jedem Supabase-Fehler; die
   * Ablehnung verschwand in `void load()`, `loading` blieb für immer `true`
   * und `activeSpace` blieb `null`. Für alle 20 aufrufenden Bildschirme sahen
   * damit „lädt noch", „Laden fehlgeschlagen" und „du hast keinen Space"
   * exakt gleich aus — und weil kein einziger Aufrufer `loading` überhaupt
   * ausliest, blieb davon nur der letzte Fall übrig: Wer offline im Zug die
   * App öffnete, bekam überall gesagt, er habe nie einen Space angelegt.
   *
   * Das war die gemeinsame Wurzel mehrerer Fehlanzeigen quer durch die App.
   */
  const [error, setError] = useState(false);
  const activeSpaceId = useAppStore((s) => s.activeSpaceId);
  const setActiveSpace = useAppStore((s) => s.setActiveSpace);

  const load = useCallback(async () => {
    setError(false);
    try {
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
        collectibleEmoji: s.collectibleEmoji ?? (await getCollectibleEmoji(s.id)),
        avatarUrl: await resolveAvatarUrl(s.avatarPath),
      })),
    );
    setSpaces(enriched);
    setLoading(false);
    // Default the active space to the first one if nothing valid is selected.
    if (data.length > 0 && !data.some((s) => s.id === activeSpaceId)) {
      setActiveSpace(data[0].id);
    }
    } catch {
      // Bestehende Spaces NICHT wegwerfen: ein kurzer Netzaussetzer soll den
      // Bildschirm nicht leerräumen. Nur sagen, dass es gerade nicht ging.
      setError(true);
      setLoading(false);
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

  return { spaces, activeSpace, loading, error, setActiveSpace, refresh: load };
}
