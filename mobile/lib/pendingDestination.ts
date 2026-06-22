/**
 * Holds a deep-link destination across the authentication / onboarding gate.
 *
 * When someone opens a card link (or scans a card) before they're signed in or
 * before a space exists, we stash where they were trying to go, send them
 * through auth, then resume them at that destination instead of dumping them on
 * the home tab. Kept in module memory (process-lifetime) which is the right
 * scope: a cold-start universal link is captured on launch and consumed once
 * the session resolves, all within the same process.
 */

let pendingCardId: string | null = null;

export function setPendingCard(cardId: string): void {
  pendingCardId = cardId;
}

export function peekPendingCard(): string | null {
  return pendingCardId;
}

/** Returns the pending card id (if any) and clears it. */
export function consumePendingCard(): string | null {
  const id = pendingCardId;
  pendingCardId = null;
  return id;
}
