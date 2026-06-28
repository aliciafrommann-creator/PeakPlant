/**
 * A one-shot "you just did something lovely" flag, consumed by the Home feed to
 * show a small celebration toast. Set when a moment is preserved (or a place
 * marked done → memory), read once the user lands back on Home — closing the
 * create → feed loop with a little reward. Module-memory scope: it's set and
 * consumed within the same app session, like pendingDestination.
 */

export type RewardKind = 'moment' | 'challenge';

let pending: RewardKind | null = null;

export function setPendingReward(kind: RewardKind = 'moment'): void {
  pending = kind;
}

/** Returns the pending reward kind (if any) and clears it. */
export function consumePendingReward(): RewardKind | null {
  const k = pending;
  pending = null;
  return k;
}
