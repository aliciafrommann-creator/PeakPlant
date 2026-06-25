import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { storage } from '../storage';

export interface PartnerNote {
  id: string;
  spaceId: string;
  text: string;
  createdAt: string;
}

const NOTES_KEY = 'partnerNotes';

function newId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useNotes(spaceId?: string) {
  const [notes, setNotes] = useState<PartnerNote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!spaceId) {
      setNotes([]);
      setLoading(false);
      return;
    }
    const all = (await storage.get<PartnerNote[]>(NOTES_KEY)) ?? [];
    setNotes(all.filter((n) => n.spaceId === spaceId));
    setLoading(false);
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
      const note: PartnerNote = {
        id: newId(),
        spaceId,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };
      const all = (await storage.get<PartnerNote[]>(NOTES_KEY)) ?? [];
      await storage.set(NOTES_KEY, [note, ...all]);
      setNotes((prev) => [note, ...prev]);
      return note;
    },
    [spaceId],
  );

  const deleteNote = useCallback(async (id: string) => {
    const all = (await storage.get<PartnerNote[]>(NOTES_KEY)) ?? [];
    const next = all.filter((n) => n.id !== id);
    await storage.set(NOTES_KEY, next);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const latestNote = notes[0] ?? null;

  return { notes, loading, latestNote, sendNote, deleteNote };
}
