/**
 * Monetization public surface (M0 foundation — fully disabled).
 *
 * Import from here, not the internal files. While MONETIZATION_ENABLED is false
 * every gate opens and allowances are unlimited, so wiring these calls in now is
 * safe and behavior-neutral. See docs/MONETIZATION.md.
 */

export {
  MONETIZATION_ENABLED,
  TIERS,
  ALL_GATED_FEATURES,
  PRICE_HYPOTHESES,
  COST_MODEL,
  COST_GUARDRAIL,
  ALLOWANCE_CYCLE,
  type Tier,
  type GatedFeature,
  type PriceHypothesis,
  type BillingPeriod,
} from './config';

export {
  freeEntitlement,
  resolveEntitlement,
  isPlus,
  hasFeature,
  entitlementForSpace,
  type EntitlementState,
  type EntitlementSource,
  type RestorationState,
  type ResolvedEntitlement,
} from './entitlements';

export {
  freshAllowance,
  isNewCycle,
  resetIfNewCycle,
  checkAllowance,
  deductAllowance,
  remainingAllowance,
  isDuplicateRequest,
  estimateCostCents,
  buildUsageEvent,
  withinCostGuardrail,
  type AllowanceState,
  type AllowanceDecision,
  type UsageEvent,
  type UsageKind,
  type UsageOutcome,
} from './usage';

export { billing, type IBillingProvider, type PurchaseResult } from './billing';
