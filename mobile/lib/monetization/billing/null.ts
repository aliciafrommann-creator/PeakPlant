/**
 * The no-op billing adapter — the active provider until a real one is wired and
 * approved post-beta. It never charges, never contacts a store, and reports
 * "not configured". With monetization disabled this is all the app needs:
 * everyone has full access regardless of what this returns.
 */

import type { IBillingProvider, PurchaseResult } from './interface';
import { PRICE_HYPOTHESES } from '../config';
import { freeEntitlement, type EntitlementState } from '../entitlements';

export const nullBilling: IBillingProvider = {
  id: 'null',
  isConfigured() {
    return false;
  },
  async getOfferings() {
    // Surface the hypotheses so a future, hidden dev preview can render them —
    // never charged here.
    return PRICE_HYPOTHESES;
  },
  async purchase(_productId: string, _spaceId: string): Promise<PurchaseResult> {
    // No real purchases yet (M0). Honest failure, not a fake success.
    return { success: false, error: 'billing_disabled' };
  },
  async restore(_spaceId: string): Promise<PurchaseResult> {
    return { success: false, error: 'billing_disabled' };
  },
  async getActiveEntitlement(spaceId: string): Promise<EntitlementState | null> {
    // Offline-safe default: a space with no provider record is simply free.
    return freeEntitlement(spaceId);
  },
};
