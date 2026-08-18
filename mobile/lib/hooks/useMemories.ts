import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { memoryRepository, cardRepository } from '../repositories';
import type { Memory } from '../types';

export function useMemories(spaceId?: string) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  /**
   * Zählmarke gegen den Wettlauf beim Space-Wechsel.
   *
   * Ohne sie: Wer von Space A auf B wechselt und dessen Antwort ist langsamer,
   * bekommt A's Momente unter B's Namen zu sehen, sobald A endlich eintrifft.
   * Es korrigiert sich beim nächsten Fokus von selbst — aber es sind private
   * Tagebuchinhalte unter der falschen Überschrift, und das ist kein
   * Schönheitsfehler (MANIFESTO §2).
   *
   * Nur die jeweils JÜNGSTE Anfrage darf schreiben.
   */
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const mine = ++requestId.current;
    if (!spaceId) {
      setMemories([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await memoryRepository.getAll(spaceId);
      if (mine !== requestId.current) return;
      // Clear any stale error — otherwise a once-offline load leaves the feed
      // stuck on the error state forever, hiding the real empty state (A1-16).
      setError(null);
      setMemories(data);
    } catch (e) {
      if (mine !== requestId.current) return;
      setError(e instanceof Error ? e : new Error('Failed to load memories'));
    } finally {
      if (mine === requestId.current) setLoading(false);
    }
  }, [spaceId]);

  /**
   * NUR beim Fokus laden — `useFocusEffect` feuert auch beim Einhängen, ein
   * zusätzliches `useEffect` verdoppelte also jeden Abruf. Und weil der
   * Startbildschirm diesen Hook zweimal hält (direkt und über
   * `useWeeklyChallenge`), liefen bei jedem Öffnen von Home VIER gleichzeitige
   * Abrufe. Jeder davon signiert die Foto-URLs einzeln über das Netz — bei
   * dreißig Fotos also rund hundertzwanzig Anfragen pro Tab-Tipp, für
   * dasselbe Ergebnis. Batterie, Datenvolumen und Kontingent.
   */
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
