import { useCallback, useMemo } from 'react';
import { currentWeeklyChallenge, completedCount } from '../weeklyChallenge';
import { progressFor } from '../challenges';
import { useChallenges } from './useChallenges';
import { useMemories } from './useMemories';

export function useWeeklyChallenge(spaceId?: string) {
  const { memories } = useMemories(spaceId);
  const { enrollments, join, enrollmentFor } = useChallenges(spaceId);

  const weekly = useMemo(() => currentWeeklyChallenge(), []);
  const enrollment = enrollmentFor(weekly.id);
  const memoryDates = useMemo(() => memories.map((m) => m.createdAt), [memories]);

  const progress = enrollment
    ? progressFor(weekly, enrollment.joinedAt, memoryDates)
    : null;

  const chillyCount = useMemo(
    () => completedCount(enrollments, memoryDates),
    [enrollments, memoryDates],
  );

  const accept = useCallback(() => join(weekly.id), [join, weekly.id]);

  return {
    weekly,
    enrolled: !!enrollment,
    progress,
    accept,
    chillyCount,
  };
}
