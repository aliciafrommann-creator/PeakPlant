import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [error, setError] = useState(false);
  /** Nur die jüngste Anfrage darf schreiben — siehe useMemories. */
  const requestId = useRef(0);
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
    const mine = ++requestId.current;
    if (!spaceId) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setError(false);
    try {
      const data = await noteRepository.getAll(spaceId);
      if (mine !== requestId.current) return;
      setNotes(data);
    } catch {
      // Leer bleiben, damit der Startbildschirm nie bricht — ABER sagen, dass
      // es ein Fehler war. Vorher war beides ununterscheidbar: „noch nichts
      // geschrieben" erschien auch dann, wenn die Notiz der anderen Person
      // nur nicht geladen werden konnte. In einer Paar-App ist das die
      // teuerste Scheinnull von allen (MANIFESTO §1).
      if (mine !== requestId.current) return;
      setNotes([]);
      setError(true);
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

  return { notes, loading, error, latestNote, latestFromPartner, userId, sendNote, deleteNote };
}
