import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { noteRepository } from '../repositories';
import { getActiveUser } from '../session';
import type { PartnerNote } from '../types';

/**
 * Dedicated notes a couple leaves each other inside a space. Backed by
 * noteRepository — synced via Supabase when configured so a note really reaches
 * the partner's device; local otherwise. Reads degrade to empty on error (e.g.
 * before migration 0011 lands) so the home tab never breaks.
 */
export function useNotes(spaceId?: string) {
  const [notes, setNotes] = useState<PartnerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    let alive = true;
    getActiveUser().then((u) => {
      if (alive) setUserId(u?.id);
    });
    return () => {
      alive = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!spaceId) {
      setNotes([]);
      setLoading(false);
      return;
    }
    try {
      const data = await noteRepository.getAll(spaceId);
      setNotes(data);
    } catch {
      // Notes are non-critical to the home render; degrade to empty.
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const sendNote = useCallback(
    async (text: string) => {
      if (!spaceId) throw new Error('No active space');
      const user = await getActiveUser();
      const note = await noteRepository.create({
        spaceId,
        text: text.trim(),
        authorId: user?.id,
        authorName: user?.name,
      });
      setNotes((prev) => [note, ...prev]);
      return note;
    },
    [spaceId],
  );

  const deleteNote = useCallback(async (id: string) => {
    await noteRepository.remove(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const latestNote = notes[0] ?? null;
  const latestFromPartner = notes.find((n) => n.authorId && n.authorId !== userId) ?? null;

  return { notes, loading, latestNote, latestFromPartner, userId, sendNote, deleteNote };
}
