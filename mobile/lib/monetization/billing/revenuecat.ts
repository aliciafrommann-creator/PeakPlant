/**
 * RevenueCat billing adapter — implements IBillingProvider for Apple IAP +
 * Google Play Billing via the react-native-purchases SDK.
 *
 * ACTIVATION CHECKLIST (keep disabled until all steps are done):
 *  1. yarn add react-native-purchases  (+ add "react-native-purchases" to app.json plugins)
 *  2. Create RevenueCat project → get iOS + Android API keys
 *  3. Create "plus" Entitlement in RevenueCat dashboard
 *  4. Configure products in App Store Connect + Google Play Console
 *     (7-day free trial + monthly €4.99 + yearly €39.99 per couple)
 *  5. Set in eas.json preview/production env:
 *       EXPO_PUBLIC_BILLING_PROVIDER=revenuecat
 *       EXPO_PUBLIC_REVENUECAT_KEY=<your_public_sdk_key>
 *  6. In billing/index.ts: change import to use revenuecatBilling when env='revenuecat'
 *
 * Until then, billing/index.ts exports nullBilling and this file is never called.
 */

import type { IBillingProvider, PurchaseResult } from './interface';
import type { EntitlementState } from '../entitlements';
import { freeEntitlement } from '../entitlements';
import { PRICE_HYPOTHESES } from '../config';

const API_KEY = process.env['EXPO_PUBLIC_REVENUECAT_KEY'] ?? '';
let configured = false;

function ensureConfigured(): void {
  if (!configured && API_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Purchases = require('react-native-purchases').default;
    Purchases.configure({ apiKey: API_KEY });
    configured = true;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCustomerInfo(info: any, spaceId: string): EntitlementState {
  const plusEnt = info?.entitlements?.active?.['plus'];
  if (!plusEnt) return freeEntitlement(spaceId);
  return {
    spaceId,
    tier: 'plus',
    source: String(plusEnt.periodType).toUpperCase() === 'TRIAL' ? 'trial' : 'purchase',
    startsAt: plusEnt.originalPurchaseDateMillis
      ? new Date(plusEnt.originalPurchaseDateMillis as number).toISOString()
      : undefined,
    expiresAt: plusEnt.expirationDateMillis
      ? new Date(plusEnt.expirationDateMillis as number).toISOString()
      : undefined,
    lastVerifiedAt: new Date().toISOString(),
    restoration: 'idle',
  };
}

export const revenuecatBilling: IBillingProvider = {
  id: 'revenuecat',

  isConfigured() {
    return !!API_KEY;
  },

  async getOfferings() {
    if (!this.isConfigured()) return PRICE_HYPOTHESES;
    ensureConfigured();
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Purchases = require('react-native-purchases').default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const offerings: any = await Purchases.getOfferings();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pkgs: any[] = offerings?.current?.availablePackages ?? [];
      if (pkgs.length === 0) return PRICE_HYPOTHESES;
      return pkgs.map((pkg) => ({
        id: String(pkg.identifier),
        label: String(pkg.product?.title ?? pkg.identifier),
        amountCents: Math.round((pkg.product?.price ?? 0) * 100),
        currency: String(pkg.product?.currencyCode ?? 'EUR'),
        period: String(pkg.packageType ?? '').toUpperCase().includes('ANNUAL')
          ? ('year' as const)
          : ('month' as const),
        scope: 'couple' as const,
      }));
    } catch {
      return PRICE_HYPOTHESES;
    }
  },

  async purchase(productId, spaceId): Promise<PurchaseResult> {
    if (!this.isConfigured()) return { success: false, error: 'billing_disabled' };
    ensureConfigured();
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Purchases = require('react-native-purchases').default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const offerings: any = await Purchases.getOfferings();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pkg = (offerings?.current?.availablePackages ?? []).find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.identifier === productId,
      );
      if (!pkg) return { success: false, error: 'product_not_found' };
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return { success: true, entitlement: mapCustomerInfo(customerInfo, spaceId) };
    } catch (e: unknown) {
      const cancelled = (e as { userCancelled?: boolean })?.userCancelled === true;
      return { success: false, error: cancelled ? 'cancelled' : 'purchase_failed' };
    }
  },

  async restore(spaceId): Promise<PurchaseResult> {
    if (!this.isConfigured()) return { success: false, error: 'billing_disabled' };
    ensureConfigured();
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Purchases = require('react-native-purchases').default;
      const customerInfo = await Purchases.restorePurchases();
      return { success: true, entitlement: mapCustomerInfo(customerInfo, spaceId) };
    } catch {
      return { success: false, error: 'restore_failed' };
    }
  },

  async getActiveEntitlement(spaceId): Promise<EntitlementState | null> {
    if (!this.isConfigured()) return freeEntitlement(spaceId);
    ensureConfigured();
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Purchases = require('react-native-purchases').default;
      const customerInfo = await Purchases.getCustomerInfo();
      return mapCustomerInfo(customerInfo, spaceId);
    } catch {
      return null;
    }
  },
};
