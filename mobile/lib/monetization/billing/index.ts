/**
 * Active billing provider. The rest of the app imports `billing` from here and
 * never references a concrete provider.
 *
 * To enable RevenueCat (see lib/monetization/billing/revenuecat.ts for checklist):
 *   1. yarn add react-native-purchases  +  add plugin to app.json
 *   2. Set EXPO_PUBLIC_BILLING_PROVIDER=revenuecat in eas.json env blocks
 *   3. Set MONETIZATION_ENABLED=true in lib/monetization/config.ts
 *   4. Replace the nullBilling export below with revenuecatBilling
 *   5. New EAS build (native module needs compilation)
 */
export { nullBilling as billing } from './null';
export type { IBillingProvider, PurchaseResult } from './interface';
