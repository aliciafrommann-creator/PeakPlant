/**
 * The lifecycle state machine for a saved date idea.
 *
 * Pure (no I/O) so the allowed-transition rules are unit-tested and reused by
 * both the local and Supabase repositories' callers. A saved date never
 * auto-advances (PP guardrail) — every move is an explicit user action, and the
 * machine only says which moves are legal from a given state.
 *
 * Our local-first model uses a deliberately small vocabulary. The fuller
 * partner-driven states from the strategy doc (suggested / viewed / accepted /
 * declined) require two-person messaging and arrive with the backend social
 * layer; `dismissed` is today's "declined" and `cancelled` is "called off after
 * planning". This file is the single source of truth for what's reachable now.
 */

import type { SavedDateStatus } from '../types';

/** From each state, the states a user may explicitly move to. */
export const SAVED_DATE_TRANSITIONS: Record<SavedDateStatus, SavedDateStatus[]> = {
  idea: ['saved', 'dismissed'],
  saved: ['planned', 'completed', 'dismissed'],
  planned: ['completed', 'cancelled', 'saved'],
  cancelled: ['planned', 'saved', 'dismissed'],
  completed: [], // terminal: a lived moment isn't un-lived
  dismissed: ['saved'], // can be brought back to the shortlist
};

/** States from which there is nowhere left to go. */
export function isTerminal(status: SavedDateStatus): boolean {
  return SAVED_DATE_TRANSITIONS[status].length === 0;
}

/** Is moving from `from` to `to` a legal, explicit transition? */
export function canTransition(from: SavedDateStatus, to: SavedDateStatus): boolean {
  return SAVED_DATE_TRANSITIONS[from].includes(to);
}

/** The legal next states from `from` (in declaration order). */
export function nextStatuses(from: SavedDateStatus): SavedDateStatus[] {
  return SAVED_DATE_TRANSITIONS[from];
}

/** Fields a transition should clear/keep, so callers don't leave stale data. */
export interface TransitionEffect {
  /** Drop the planned-for text (e.g. when un-planning or cancelling). */
  clearPlannedFor: boolean;
  /** Stamp completedAt (only when entering `completed`). */
  setCompletedAt: boolean;
}

/**
 * The side data a transition implies. Keeps `plannedFor` only while a plan is
 * live (planned), and stamps completion exactly once.
 */
export function transitionEffect(to: SavedDateStatus): TransitionEffect {
  return {
    clearPlannedFor: to === 'saved' || to === 'cancelled' || to === 'dismissed',
    setCompletedAt: to === 'completed',
  };
}
