import { describe, it, expect } from 'vitest';
import {
  SAVED_DATE_TRANSITIONS,
  canTransition,
  nextStatuses,
  isTerminal,
  transitionEffect,
} from './status';
import type { SavedDateStatus } from '../types';

const ALL: SavedDateStatus[] = ['idea', 'saved', 'planned', 'cancelled', 'completed', 'dismissed'];

describe('saved date status machine', () => {
  it('defines transitions for every status', () => {
    for (const s of ALL) expect(SAVED_DATE_TRANSITIONS[s]).toBeDefined();
  });

  it('only completed is terminal', () => {
    expect(isTerminal('completed')).toBe(true);
    for (const s of ALL.filter((x) => x !== 'completed')) expect(isTerminal(s)).toBe(false);
  });

  it('allows the core happy path: saved -> planned -> completed', () => {
    expect(canTransition('saved', 'planned')).toBe(true);
    expect(canTransition('planned', 'completed')).toBe(true);
  });

  it('allows un-planning and cancelling a plan', () => {
    expect(canTransition('planned', 'saved')).toBe(true);
    expect(canTransition('planned', 'cancelled')).toBe(true);
    expect(canTransition('cancelled', 'planned')).toBe(true);
  });

  it('allows restoring a dismissed idea to the shortlist', () => {
    expect(canTransition('dismissed', 'saved')).toBe(true);
  });

  it('forbids resurrecting a completed date or skipping straight to completed from idea', () => {
    expect(nextStatuses('completed')).toEqual([]);
    expect(canTransition('completed', 'saved')).toBe(false);
    expect(canTransition('idea', 'completed')).toBe(false);
  });

  it('never lists a status as its own successor', () => {
    for (const s of ALL) expect(SAVED_DATE_TRANSITIONS[s]).not.toContain(s);
  });
});

describe('transitionEffect', () => {
  it('stamps completion only when entering completed', () => {
    expect(transitionEffect('completed').setCompletedAt).toBe(true);
    expect(transitionEffect('planned').setCompletedAt).toBe(false);
  });

  it('clears plannedFor when leaving an active plan', () => {
    expect(transitionEffect('saved').clearPlannedFor).toBe(true);
    expect(transitionEffect('cancelled').clearPlannedFor).toBe(true);
    expect(transitionEffect('dismissed').clearPlannedFor).toBe(true);
    expect(transitionEffect('planned').clearPlannedFor).toBe(false);
    expect(transitionEffect('completed').clearPlannedFor).toBe(false);
  });
});
