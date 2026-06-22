/**
 * Deterministic Date Discovery recommender (the curation-first MVP core).
 *
 * Pure (no RN/Expo/network imports) so it's unit-tested in node and reused as
 * the offline / fallback path behind the AI interface (`nullAI.recommendDates`).
 * It never invents venues or facts: it only filters and ranks the curated
 * `TOGETHER_MOMENTS` + `LOCAL_PLACES`, and every fact it emits is labelled with
 * its provenance. Partner places are NEVER ranked higher for being partners —
 * ranking is not for sale (PP-016).
 */

import {
  TOGETHER_MOMENTS,
  LOCAL_PLACES,
  goalCategory,
  type TogetherMoment,
  type LocalPlace,
  type PriceBand,
} from '../together';
import type { DateConstraints, DateRecommendation, RecommendationFact } from './types';

const PRICE_ORDER: Record<PriceBand, number> = { free: 0, '€': 1, '€€': 2, '€€€': 3 };

/** Signals the MVP recommender genuinely cannot use yet — surfaced honestly. */
const ALWAYS_UNUSED = ['live weather', 'your device location'];

const PRICE_LABEL: Record<PriceBand, string> = {
  free: 'free',
  '€': 'easy on the wallet',
  '€€': 'mid-range',
  '€€€': 'a treat',
};

function effectivePrice(moment: TogetherMoment, place?: LocalPlace): PriceBand {
  if (!place) return moment.priceBand;
  return PRICE_ORDER[place.priceBand] >= PRICE_ORDER[moment.priceBand]
    ? place.priceBand
    : moment.priceBand;
}

function passesHardFilters(
  moment: TogetherMoment,
  place: LocalPlace | undefined,
  c: DateConstraints,
): boolean {
  if (c.categories?.length && !c.categories.includes(moment.category)) return false;
  if (c.maxDurationMin != null && moment.avgDurationMin > c.maxDurationMin) return false;
  if (c.maxBudget && PRICE_ORDER[effectivePrice(moment, place)] > PRICE_ORDER[c.maxBudget]) {
    return false;
  }
  if (c.weather && c.weather !== 'any') {
    const fits = moment.weatherFit.includes(c.weather) || moment.weatherFit.includes('any');
    if (!fits) return false;
  }
  if (c.indoorOutdoor && c.indoorOutdoor !== 'flexible') {
    if (moment.indoorOutdoor !== c.indoorOutdoor && moment.indoorOutdoor !== 'flexible') {
      return false;
    }
  }
  return true;
}

interface Scored {
  moment: TogetherMoment;
  place?: LocalPlace;
  score: number;
  used: string[];
}

function evaluate(
  moment: TogetherMoment,
  place: LocalPlace | undefined,
  c: DateConstraints,
): Scored {
  let score = 0;
  const used: string[] = [];

  if (c.goals?.length) {
    const matched = c.goals.find((g) => goalCategory(g) === moment.category);
    if (matched) {
      score += 3;
      used.push(`your goal "${matched}"`);
    }
  }
  if (c.timeOfDay && moment.idealTimeOfDay.includes(c.timeOfDay)) {
    score += 2;
    used.push(`it's good in the ${c.timeOfDay}`);
  }
  if (c.weather && c.weather !== 'any' && moment.weatherFit.includes(c.weather)) {
    score += 2;
    used.push(`it suits ${c.weather} weather`);
  }
  if (
    c.indoorOutdoor &&
    c.indoorOutdoor !== 'flexible' &&
    moment.indoorOutdoor === c.indoorOutdoor
  ) {
    score += 2;
    used.push(c.indoorOutdoor === 'outdoor' ? 'you wanted to be outside' : 'you wanted to stay in');
  }
  if (c.energy && moment.energy === c.energy) {
    score += 1;
    used.push(`it matches your ${c.energy} energy`);
  }
  if (c.maxBudget && PRICE_ORDER[effectivePrice(moment, place)] <= PRICE_ORDER[c.maxBudget]) {
    used.push('it fits your budget');
  }
  // Gentle nudge from the user's own past, explicit choices. Bounded to +/-1 so
  // it can break ties and lift familiar flavours without overriding the
  // in-the-moment constraints above. Surfaced in "why" so it's never a secret.
  const affinity = c.categoryAffinity?.[moment.category];
  if (affinity && affinity > 0) {
    score += 1;
    used.push('it is like ideas you have saved before');
  } else if (affinity && affinity < 0) {
    score -= 1;
  }

  return { moment, place, score, used };
}

function buildFacts(moment: TogetherMoment, place?: LocalPlace): RecommendationFact[] {
  const price = effectivePrice(moment, place);
  const facts: RecommendationFact[] = [
    { label: 'how long', value: `about ${moment.avgDurationMin} min`, provenance: 'curated' },
    { label: 'budget', value: PRICE_LABEL[price], provenance: place?.provenance ?? 'curated' },
    { label: 'setting', value: moment.indoorOutdoor, provenance: 'curated' },
  ];
  if (place) {
    facts.push({
      label: 'where',
      value: `${place.name} · ${place.area}`,
      provenance: place.provenance,
    });
    if (place.perk) {
      facts.push({ label: 'partner perk', value: place.perk, provenance: 'curated' });
    }
  } else {
    facts.push({ label: 'where', value: 'anywhere that feels right', provenance: 'curated' });
  }
  return facts;
}

function signalsNotUsed(used: string[], c: DateConstraints): string[] {
  const notUsed = [...ALWAYS_UNUSED];
  if (!c.timeOfDay && !used.some((u) => u.includes('in the'))) notUsed.push('time of day');
  if (!c.weather) notUsed.push('weather');
  return notUsed;
}

function toRecommendation(s: Scored, c: DateConstraints, isAlternative: boolean): DateRecommendation {
  const why =
    s.used.length > 0
      ? `we suggested this because ${s.used.join(', ')}.`
      : 'a gentle one to start with — adjust anything and we’ll find another.';
  return {
    id: s.moment.id,
    momentId: s.moment.id,
    title: s.moment.title,
    concept: s.moment.idea,
    placeId: s.place?.id,
    place: s.place,
    why,
    signalsUsed: s.used,
    signalsNotUsed: signalsNotUsed(s.used, c),
    facts: buildFacts(s.moment, s.place),
    estDurationMin: s.moment.avgDurationMin,
    priceBand: effectivePrice(s.moment, s.place),
    indoorOutdoor: s.moment.indoorOutdoor,
    isAlternative,
    freshnessAt: s.place?.lastVerifiedAt ?? '2026-06-01',
  };
}

export interface RecommendOptions {
  moments?: TogetherMoment[];
  places?: LocalPlace[];
}

/**
 * Rank curated date ideas against a couple's situation. Returns a primary pick
 * plus (when available) one alternative of a different flavour. Empty array
 * means nothing matched — the caller shows the "over-constrained" state and
 * offers to loosen a filter. Stable ordering (deterministic tie-break by the
 * moment's catalog position) so the same inputs always give the same result.
 */
export function recommendDates(
  constraints: DateConstraints,
  options: RecommendOptions = {},
): DateRecommendation[] {
  const moments = options.moments ?? TOGETHER_MOMENTS;
  const places = options.places ?? LOCAL_PLACES;
  const placeFor = (id?: string) => (id ? places.find((p) => p.id === id) : undefined);

  const excluded = new Set(constraints.excludeIds ?? []);
  const eligible = moments
    .filter((m) => m.spaceTypes.includes(constraints.spaceType) && !excluded.has(m.id))
    .map((m) => ({ moment: m, place: placeFor(m.placeId), index: moments.indexOf(m) }))
    .filter(({ moment, place }) => passesHardFilters(moment, place, constraints));

  if (eligible.length === 0) return [];

  const scored = eligible
    .map(({ moment, place, index }) => ({ ...evaluate(moment, place, constraints), index }))
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.index - b.index));

  const top = scored[0];
  const alt =
    scored.find((s) => s.moment.id !== top.moment.id && s.moment.category !== top.moment.category) ??
    scored.find((s) => s.moment.id !== top.moment.id);

  const result = [toRecommendation(top, constraints, false)];
  if (alt) result.push(toRecommendation(alt, constraints, true));
  return result;
}
