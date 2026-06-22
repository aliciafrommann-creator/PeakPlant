/**
 * Monetization configuration — the single place where tiers, gated features,
 * allowances, prices and cost guardrails live. Product code reads this; nothing
 * here is coupled to a billing provider, and nothing is hardcoded at a call site.
 *
 * STATUS: the whole track is OFF. `MONETIZATION_ENABLED` is false, so every gate
 * and allowance check returns "full access" and the app is completely functional
 * without any paywall, purchase, or limit. Turning this on is a post-beta,
 * human-approved step (see docs/MONETIZATION.md).
 *
 * Prices and limits below are HYPOTHESES, not final, and exist only as config.
 */

/** Master switch. While false: no gating, unlimited allowance, no paywall. */
export const MONETIZATION_ENABLED = false;

export type Tier = 'free' | 'plus';

/**
 * Capabilities that *may* be gated to Plus in the future. The emotional and
 * purchased-product core (scanning cards, owned content, couple space + invite,
 * memory CRUD, existing diary, basic saved ideas, basic planning, a genuinely
 * useful basic Discovery) is intentionally NOT in this list — it stays free
 * forever. Existing personal memories are never gated.
 */
export type GatedFeature =
  | 'ai_ask_peakplant'
  | 'ai_live_recommendations'
  | 'advanced_multi_stop_planning'
  | 'advanced_collections'
  | 'rich_couple_learning'
  | 'premium_recaps'
  | 'memory_export'
  | 'premium_rituals';

export const ALL_GATED_FEATURES: GatedFeature[] = [
  'ai_ask_peakplant',
  'ai_live_recommendations',
  'advanced_multi_stop_planning',
  'advanced_collections',
  'rich_couple_learning',
  'premium_recaps',
  'memory_export',
  'premium_rituals',
];

export interface TierConfig {
  /** Gated features this tier unlocks. */
  features: GatedFeature[];
  /** AI requests per billing cycle, per couple. 'unlimited' avoided on free. */
  aiRequestsPerCycle: number;
}

/** Hypothesis: ~3 free AI requests/couple/month; Plus gets a generous bucket. */
export const TIERS: Record<Tier, TierConfig> = {
  free: { features: [], aiRequestsPerCycle: 3 },
  plus: { features: [...ALL_GATED_FEATURES], aiRequestsPerCycle: 100 },
};

/** Allowance cycle length. Monthly per the current hypothesis. */
export type AllowanceCycle = 'monthly';
export const ALLOWANCE_CYCLE: AllowanceCycle = 'monthly';

export type BillingPeriod = 'month' | 'year';

/**
 * Pricing HYPOTHESES (PP monetization direction). One subscription per couple.
 * Not final; never charged while MONETIZATION_ENABLED is false. amountCents so
 * there's no float drift; provider product ids are filled in per-store later.
 */
export interface PriceHypothesis {
  id: string;
  label: string;
  amountCents: number;
  currency: string;
  period: BillingPeriod;
  /** Per couple (the preferred hypothesis), not per person. */
  scope: 'couple';
}

export const PRICE_HYPOTHESES: PriceHypothesis[] = [
  { id: 'couple_monthly', label: 'PeakPlant Plus (monthly)', amountCents: 499, currency: 'EUR', period: 'month', scope: 'couple' },
  { id: 'couple_yearly', label: 'PeakPlant Plus (yearly)', amountCents: 3999, currency: 'EUR', period: 'year', scope: 'couple' },
];

/**
 * Estimated variable cost per provider unit, in cents. Used only for internal
 * cost metering and the guardrail — never shown as a price. Rough placeholders;
 * refine with real provider invoices post-beta.
 */
export interface CostModel {
  /** Estimated cents per 1k tokens for an AI request. */
  aiCentsPer1kTokens: number;
  /** Estimated cents per external provider (places/weather/etc.) request. */
  providerRequestCents: number;
}

export const COST_MODEL: Record<string, CostModel> = {
  default: { aiCentsPer1kTokens: 1.5, providerRequestCents: 0.2 },
};

/**
 * Planning guardrail: variable AI + live-provider cost should stay below this
 * fraction of net Plus revenue. Enforced in reporting/alerts, not at runtime.
 */
export const COST_GUARDRAIL = { maxVariableCostRatio: 0.2 };
