/**
 * Active billing provider. The rest of the app imports `billing` from here and
 * never references a concrete provider. Swap the export to a real adapter (e.g.
 * revenuecat) once it is built, configured, and human-approved post-beta.
 */
export { nullBilling as billing } from './null';
export type { IBillingProvider, PurchaseResult } from './interface';
