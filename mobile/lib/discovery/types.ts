import type { SpaceType } from '../types';
import type {
  Provenance,
  PriceBand,
  IndoorOutdoor,
  TimeOfDay,
  Weather,
  Energy,
  MomentCategory,
  LocalPlace,
} from '../together';

/**
 * Per-request, ephemeral inputs describing a couple's current situation. None of
 * this is stored as a durable profile (AI_SAFETY) — it lives only for the length
 * of one recommendation request. Everything is optional: the recommender works
 * with as little as a space type.
 */
export interface DateConstraints {
  spaceType: SpaceType;
  /** Explicit onboarding goals — used for gentle personalization, never inferred. */
  goals?: string[];
  timeOfDay?: TimeOfDay;
  /** 'flexible' (or omitted) = no preference. */
  indoorOutdoor?: IndoorOutdoor;
  maxDurationMin?: number;
  maxBudget?: PriceBand;
  weather?: Weather;
  categories?: MomentCategory[];
  energy?: Energy;
  /** Moment ids to skip — powers "show another" without repeating a pick. */
  excludeIds?: string[];
}

/** One labelled fact on a recommendation card, with its honesty label. */
export interface RecommendationFact {
  label: string;
  value: string;
  provenance: Provenance;
}

/**
 * A single date idea, ranked and explained. `signalsUsed`/`signalsNotUsed`
 * realize the explainability contract (PP-014): the UI renders them as
 * "why this?" so the user always understands the recommendation.
 */
export interface DateRecommendation {
  id: string;
  momentId: string;
  title: string;
  concept: string;
  placeId?: string;
  place?: LocalPlace;
  why: string;
  signalsUsed: string[];
  signalsNotUsed: string[];
  facts: RecommendationFact[];
  estDurationMin: number;
  priceBand: PriceBand;
  indoorOutdoor: IndoorOutdoor;
  /** True for the "or instead…" second pick. */
  isAlternative?: boolean;
  /** ISO date the underlying curated data was last verified. */
  freshnessAt: string;
}
