/**
 * Billing provider adapter contract.
 *
 * Product logic depends ONLY on this interface — never on RevenueCat, Apple,
 * Google, or Stripe directly. A concrete adapter wraps one provider and maps it
 * to our provider-independent `EntitlementState`. Swapping providers, or running
 * with none, changes only which adapter is exported from ./index.
 *
 * Entitlements are couple-level: every method is keyed by spaceId.
 */

import type { EntitlementState } from '../entitlements';
import type { PriceHypothesis } from '../config';

export interface PurchaseResult {
  success: boolean;
  /** The resulting entitlement on success. */
  entitlement?: EntitlementState;
  /** Stable, non-sensitive error code for the UI (e.g. 'cancelled', 'network'). */
  error?: string;
}

export interface IBillingProvider {
  /** Stable id, e.g. 'null', 'revenuecat'. */
  readonly id: string;
  /** True once the provider has the keys/SDK it needs. */
  isConfigured(): boolean;
  /** Available products to display (maps to PriceHypothesis shape). */
  getOfferings(): Promise<PriceHypothesis[]>;
  /** Begin a purchase for a couple. Never charges while monetization is off. */
  purchase(productId: string, spaceId: string): Promise<PurchaseResult>;
  /** Restore previously-purchased entitlements for a couple. */
  restore(spaceId: string): Promise<PurchaseResult>;
  /** Best-known active entitlement for a couple, or null if none/unknown. */
  getActiveEntitlement(spaceId: string): Promise<EntitlementState | null>;
}
