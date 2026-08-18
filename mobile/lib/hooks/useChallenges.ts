import { useCallback, useEffect, useState } from 'react';
import {
  getEnrollments,
  joinChallenge,
  leaveChallenge,
  type Enrollment,
} from '../challenges';

export function useChallenges(spaceId?: string) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!spaceId) {
      setEnrollments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getEnrollments(spaceId);
      setEnrollments(data);
    } catch {
      // `getEnrollments` wirft im Supabase-Modus. Ohne dieses catch blieb
      // `loading` für immer true und die Ablehnung verschwand ungesehen —
      // offline tat „Woche annehmen" auf dem Startbildschirm schlicht nichts,
      // ohne Meldung und ohne Haptik.
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const join = useCallback(
    async (challengeId: string) => {
      if (!spaceId) return;
      await joinChallenge(spaceId, challengeId);
      await load();
    },
    [spaceId, load],
  );

  const leave = useCallback(
    async (challengeId: string) => {
      if (!spaceId) return;
      await leaveChallenge(spaceId, challengeId);
      await load();
    },
    [spaceId, load],
  );

  const enrollmentFor = useCallback(
    (challengeId: string) => enrollments.find((e) => e.challengeId === challengeId),
    [enrollments],
  );

  return { enrollments, loading, join, leave, enrollmentFor, refresh: load };
}
