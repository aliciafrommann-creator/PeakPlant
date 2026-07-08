/**
 * A one-shot "you just did something lovely" flag, consumed by the Home feed to
 * show a small celebration toast. Set when a moment is preserved (or a place
 * marked done → memory), read once the user lands back on Home — closing the
 * create → feed loop with a little reward. Module-memory scope: it's set and
 * consumed within the same app session, like pendingDestination.
 */

export type RewardKind = 'moment' | 'challenge';

/** A reward older than this is stale — the moment has passed, don't celebrate. */
const REWARD_TTL_MS = 5 * 60 * 1000;

let pending: { kind: RewardKind; at: number } | null = null;

export function setPendingReward(kind: RewardKind = 'moment'): void {
  pending = { kind, at: Date.now() };
}

/**
 * Returns the pending reward kind (if any, and still fresh) and clears it.
 * The TTL guards the case where the moment was created from a non-Home origin
 * (challenge detail, map): Home may only gain focus much later — a "moment
 * kept ♥" toast hours afterwards would feel wrong, so it quietly expires.
 */
export function consumePendingReward(): RewardKind | null {
  const p = pending;
  pending = null;
  if (!p) return null;
  return Date.now() - p.at <= REWARD_TTL_MS ? p.kind : null;
}
