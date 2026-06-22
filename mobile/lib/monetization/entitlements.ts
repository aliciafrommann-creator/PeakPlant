/**
 * Couple-level entitlement model (pure, provider-independent).
 *
 * An entitlement belongs to a *space* (the couple), not a person — the preferred
 * "one subscription per couple" hypothesis. Resolution is offline-safe: it works
 * entirely from cached state + a clock, so a launch with no network still yields
 * a correct, conservative answer. No billing provider is referenced here.
 *
 * When MONETIZATION_ENABLED is false, resolution reports full access and every
 * gate opens — the app is completely functional with monetization disabled.
 */

import {
  MONETIZATION_ENABLED,
  TIERS,
  type Tier,
  type GatedFeature,
} from './config';

/** Where a non-free entitlement came from. */
export type EntitlementSource = 'free' | 'purchase' | 'promo' | 'trial';

/** State of an attempt to restore purchases (Apple/Google/etc.), provider-agnostic. */
export type RestorationState = 'idle' | 'restoring' | 'restored' | 'failed';

/**
 * The stored, durable entitlement record for a space. This is what a repository
 * persists and what a billing webhook would update server-side.
 */
export interface EntitlementState {
  spaceId: string;
  tier: Tier;
  source: EntitlementSource;
  /** When the entitlement began (ISO). */
  startsAt?: string;
  /** When it lapses (ISO). Undefined = no expiry (e.g. free, or lifetime promo). */
  expiresAt?: string;
  /** Last time this was confirmed against the provider/server (ISO). */
  lastVerifiedAt?: string;
  restoration: RestorationState;
}

/** The neutral, always-valid free entitlement for a space. */
export function freeEntitlement(spaceId: string): EntitlementState {
  return { spaceId, tier: 'free', source: 'free', restoration: 'idle' };
}

/** The resolved, effective view the rest of the app should use. */
export interface ResolvedEntitlement {
  spaceId: string;
  /** Effective tier after applying expiry + the master switch. */
  tier: Tier;
  source: EntitlementSource;
  /** A paid/promo/trial entitlement is currently active. */
  active: boolean;
  /** There was a non-free entitlement, but it has lapsed. */
  expired: boolean;
  /** Resolved purely from cached state (no fresh verification available). */
  offline: boolean;
}

export interface ResolveOptions {
  now?: Date;
  /** Override the master switch (tests). Defaults to MONETIZATION_ENABLED. */
  monetizationEnabled?: boolean;
  /** Treat as offline (no fresh verification this session). */
  offline?: boolean;
}

/**
 * Resolve durable state into the effective entitlement. Expired non-free
 * entitlements degrade to free. With monetization disabled, callers should treat
 * access as unrestricted (see hasFeature / allowance helpers) — tier still
 * reflects the stored record for display/debugging.
 */
export function resolveEntitlement(
  state: EntitlementState,
  opts: ResolveOptions = {},
): ResolvedEntitlement {
  const now = opts.now ?? new Date();
  const offline = opts.offline ?? false;

  const hasExpiry = !!state.expiresAt;
  const expired = hasExpiry && new Date(state.expiresAt as string).getTime() < now.getTime();
  const notStarted = !!state.startsAt && new Date(state.startsAt).getTime() > now.getTime();

  const effectiveActive = state.tier !== 'free' && !expired && !notStarted;
  const tier: Tier = effectiveActive ? state.tier : 'free';

  return {
    spaceId: state.spaceId,
    tier,
    source: effectiveActive ? state.source : 'free',
    active: effectiveActive,
    expired: state.tier !== 'free' && expired,
    offline,
  };
}

/** Is this couple effectively on Plus right now? */
export function isPlus(resolved: ResolvedEntitlement, monetizationEnabled = MONETIZATION_ENABLED): boolean {
  if (!monetizationEnabled) return true; // disabled → everyone has full access
  return resolved.tier === 'plus';
}

/**
 * Can this couple use a gated feature? With monetization disabled, always true.
 * Otherwise, the feature must be in the effective tier's feature set.
 */
export function hasFeature(
  resolved: ResolvedEntitlement,
  feature: GatedFeature,
  monetizationEnabled = MONETIZATION_ENABLED,
): boolean {
  if (!monetizationEnabled) return true;
  return TIERS[resolved.tier].features.includes(feature);
}

/** Pick a space's entitlement from a set, independent of which member bought it. */
export function entitlementForSpace(
  states: EntitlementState[],
  spaceId: string,
): EntitlementState {
  return states.find((s) => s.spaceId === spaceId) ?? freeEntitlement(spaceId);
}
