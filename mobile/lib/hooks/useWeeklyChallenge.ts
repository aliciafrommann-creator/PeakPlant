import { useCallback, useMemo } from 'react';
import {
  currentWeeklyChallenge,
  completedCount,
  weeklyProgressFor,
  inSameIsoWeek,
  isoWeekKey,
} from '../weeklyChallenge';
import type { SpaceType } from '../types';
import { useChallenges } from './useChallenges';
import { useMemories } from './useMemories';

export function useWeeklyChallenge(spaceId?: string, spaceType?: SpaceType) {
  /**
   * `error` wird bewusst mitgelesen: Fortschritt und Sammelzahl werden aus den
   * Momenten abgeleitet. Schlägt deren Laden fehl, ist `memories` leer — und
   * „0 von N geschafft" wäre dann eine Scheinzahl (MANIFESTO §1, Regel K5).
   * Aufrufer sollen unterscheiden können zwischen „noch nichts" und „wir
   * wissen es gerade nicht".
   */
  const { memories, error: memoriesError } = useMemories(spaceId);
  const { enrollments, join, enrollmentFor } = useChallenges(spaceId);

  // Recomputed per render with the week key as dep, so a session spanning
  // Sunday→Monday picks up the new week without a remount (audit A4-09).
  const weekKey = isoWeekKey(new Date());
  const weekly = useMemo(
    () => currentWeeklyChallenge(spaceType),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekKey, spaceType],
  );

  // An enrollment only counts for THIS week — one from a previous rotation
  // cycle would otherwise show the challenge as instantly "done" (A4-06).
  const rawEnrollment = enrollmentFor(weekly.id);
  const enrollment =
    rawEnrollment && inSameIsoWeek(rawEnrollment.joinedAt, new Date()) ? rawEnrollment : undefined;

  const memoryDates = useMemo(() => memories.map((m) => m.createdAt), [memories]);

  const progress = enrollment
    ? weeklyProgressFor(weekly, enrollment.joinedAt, memoryDates)
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
    /** true = die Zahlen oben beruhen auf unvollständigen Daten. */
    countsUnknown: !!memoriesError,
  };
}
