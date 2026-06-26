import type { SpaceType } from '../types';
import type {
  PriceBand,
  IndoorOutdoor,
  TimeOfDay,
  Weather,
  Energy,
} from '../together';

/**
 * The browsable date-idea library — a large, deterministic catalog the couple
 * can scroll and filter, distinct from the "surprise me" generator on the main
 * Discover tab (which ranks the small curated TOGETHER_MOMENTS pool with rich
 * "why" explanations).
 *
 * Every entry is a real, doable idea. The catalog is generated from curated
 * "families" — each a well-written template with honest metadata — expanded
 * across a pool of natural variants. This keeps ~1000 ideas readable and
 * genuinely varied rather than padded, while staying fully offline and
 * deterministic (same order every render, no fabrication of venues/prices).
 */

/** A richer category set than the recommender's 5 — the library spans more. */
export type IdeaCategory =
  | 'food'
  | 'outdoors'
  | 'create'
  | 'calm'
  | 'play'
  | 'culture'
  | 'adventure'
  | 'learn'
  | 'home'
  | 'wellness';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'any';

export interface DateIdea {
  id: string;
  title: string;
  idea: string;
  category: IdeaCategory;
  spaceTypes: SpaceType[];
  priceBand: PriceBand;
  indoorOutdoor: IndoorOutdoor;
  avgDurationMin: number;
  energy: Energy;
  idealTimeOfDay: TimeOfDay[];
  weatherFit: Weather[];
  season: Season[];
  tags: string[];
}

/** Emoji shown per category in the library list. */
export const CATEGORY_EMOJI: Record<IdeaCategory, string> = {
  food: '🍽️',
  outdoors: '🌤️',
  create: '🎨',
  calm: '🌙',
  play: '🎲',
  culture: '🎭',
  adventure: '🧭',
  learn: '📚',
  home: '🏡',
  wellness: '🌿',
};

export const CATEGORY_LABEL: Record<IdeaCategory, { en: string; de: string }> = {
  food: { en: 'food & drink', de: 'Essen & Trinken' },
  outdoors: { en: 'outdoors', de: 'Draußen' },
  create: { en: 'make something', de: 'Kreativ' },
  calm: { en: 'calm', de: 'Ruhig' },
  play: { en: 'playful', de: 'Verspielt' },
  culture: { en: 'culture', de: 'Kultur' },
  adventure: { en: 'adventure', de: 'Abenteuer' },
  learn: { en: 'learn together', de: 'Lernen' },
  home: { en: 'at home', de: 'Zuhause' },
  wellness: { en: 'wellness', de: 'Wellness' },
};

type Family = {
  /** Title template, `{x}` is replaced by the variant. */
  title: string;
  /** Idea sentence template, `{x}` is replaced by the variant. */
  idea: string;
  category: IdeaCategory;
  spaceTypes: SpaceType[];
  priceBand: PriceBand;
  indoorOutdoor: IndoorOutdoor;
  avgDurationMin: number;
  energy: Energy;
  idealTimeOfDay: TimeOfDay[];
  weatherFit: Weather[];
  season: Season[];
  tags: string[];
  variants: string[];
};

const BOTH: SpaceType[] = ['couple', 'friends'];
const COUPLE: SpaceType[] = ['couple'];
const ALL_TIMES: TimeOfDay[] = ['morning', 'afternoon', 'evening'];
const ALL_SEASONS: Season[] = ['any'];

// Shared variant pools (kept here so several families can reuse them).
const CUISINES = [
  'Italian', 'Thai', 'Mexican', 'Japanese', 'Indian', 'Greek', 'Vietnamese',
  'Korean', 'Spanish', 'Lebanese', 'Ethiopian', 'French', 'Turkish', 'Moroccan',
  'Persian', 'Georgian', 'Peruvian', 'Polish', 'Portuguese', 'Caribbean',
];
const BAKES = [
  'sourdough bread', 'cinnamon rolls', 'a layer cake', 'fresh pasta', 'dumplings',
  'croissants', 'focaccia', 'cookies from scratch', 'a fruit tart', 'bagels',
  'macarons', 'a pizza from the base up', 'pretzels', 'brownies', 'scones',
];
const WALK_THEMES = [
  'the oldest streets in town', 'every mural you can find', 'a river from end to end',
  'the fanciest neighbourhood', 'a route you have never taken', 'all the bookshops',
  'the botanical garden', 'a sunrise loop', 'a sunset ridge', 'the harbour',
  'a forest trail', 'the cemetery’s quiet old corners', 'a hilltop for the view',
  'a new district at dusk', 'the longest staircase you can find',
];

const FAMILIES: Family[] = [
  // ── FOOD ──────────────────────────────────────────────────────────────
  {
    title: 'cook a {x} feast', idea: 'pick a {x} recipe neither of you has tried and make it together from scratch.',
    category: 'food', spaceTypes: BOTH, priceBand: '€€', indoorOutdoor: 'indoor', avgDurationMin: 150,
    energy: 'medium', idealTimeOfDay: ['afternoon', 'evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['cooking', 'food', 'home'], variants: CUISINES,
  },
  {
    title: 'bake {x} together', idea: 'bake {x} side by side — flour everywhere, no rush, taste as you go.',
    category: 'food', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'indoor', avgDurationMin: 120,
    energy: 'medium', idealTimeOfDay: ['morning', 'afternoon'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['baking', 'food', 'home'], variants: BAKES,
  },
  {
    title: 'find the best {x} in town', idea: 'make it a tiny quest: try three places and crown the best {x}.',
    category: 'food', spaceTypes: BOTH, priceBand: '€€', indoorOutdoor: 'flexible', avgDurationMin: 120,
    energy: 'medium', idealTimeOfDay: ['afternoon', 'evening'], weatherFit: ['any'],
    season: ALL_SEASONS, tags: ['food', 'tasting', 'quest'],
    variants: ['espresso', 'gelato', 'ramen', 'tacos', 'cheesecake', 'burger', 'dumplings', 'hot chocolate', 'croissant', 'pizza slice', 'matcha', 'falafel'],
  },
  {
    title: 'a {x} tasting at home', idea: 'lay out a small {x} tasting flight and score each one together.',
    category: 'food', spaceTypes: BOTH, priceBand: '€€', indoorOutdoor: 'indoor', avgDurationMin: 90,
    energy: 'low', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['tasting', 'food', 'home'],
    variants: ['cheese', 'chocolate', 'tea', 'olive oil', 'honey', 'wine', 'craft beer', 'coffee', 'hot sauce', 'fruit'],
  },
  {
    title: 'breakfast for dinner {x}', idea: 'flip the day: breakfast {x} at 8pm, in pyjamas, no rush.',
    category: 'food', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'indoor', avgDurationMin: 75,
    energy: 'low', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['food', 'home', 'cosy'],
    variants: ['with fluffy pancakes', 'with a big shakshuka', 'with waffles and fruit', 'with a full fry-up'],
  },

  // ── OUTDOORS ──────────────────────────────────────────────────────────
  {
    title: 'walk {x}', idea: 'no destination but the walk itself: explore {x} and stop wherever you like.',
    category: 'outdoors', spaceTypes: BOTH, priceBand: 'free', indoorOutdoor: 'outdoor', avgDurationMin: 90,
    energy: 'medium', idealTimeOfDay: ALL_TIMES, weatherFit: ['sunny', 'cold'],
    season: ALL_SEASONS, tags: ['walk', 'outdoors', 'explore'], variants: WALK_THEMES,
  },
  {
    title: 'a picnic with {x}', idea: 'pack a blanket and {x}, find a patch of grass and stay a while.',
    category: 'outdoors', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'outdoor', avgDurationMin: 120,
    energy: 'low', idealTimeOfDay: ['afternoon'], weatherFit: ['sunny'],
    season: ['spring', 'summer'], tags: ['picnic', 'outdoors', 'relaxed'],
    variants: ['a basket of cheese and bread', 'a thermos and pastries', 'street food to share', 'fruit and lemonade', 'leftovers and a good book'],
  },
  {
    title: 'go {x}', idea: 'get out and move together: {x} for an afternoon.',
    category: 'adventure', spaceTypes: BOTH, priceBand: '€€', indoorOutdoor: 'outdoor', avgDurationMin: 180,
    energy: 'high', idealTimeOfDay: ['morning', 'afternoon'], weatherFit: ['sunny'],
    season: ['spring', 'summer', 'autumn'], tags: ['active', 'outdoors', 'adventure'],
    variants: ['kayaking', 'paddleboarding', 'rock climbing', 'mountain biking', 'horse riding', 'wild swimming', 'bouldering outdoors', 'a via ferrata', 'canyoning', 'stand-up paddling at dawn'],
  },
  {
    title: 'chase the {x}', idea: 'plan around the light: be in the right spot for the {x} and just watch.',
    category: 'calm', spaceTypes: BOTH, priceBand: 'free', indoorOutdoor: 'outdoor', avgDurationMin: 90,
    energy: 'low', idealTimeOfDay: ['morning', 'evening'], weatherFit: ['sunny', 'cold'],
    season: ALL_SEASONS, tags: ['sky', 'calm', 'awe'],
    variants: ['sunrise', 'sunset', 'first stars', 'full moon', 'golden hour', 'blue hour', 'meteor shower'],
  },
  {
    title: 'a day trip to {x}', idea: 'pick {x} you have never properly explored and make a whole day of it.',
    category: 'adventure', spaceTypes: BOTH, priceBand: '€€', indoorOutdoor: 'outdoor', avgDurationMin: 360,
    energy: 'medium', idealTimeOfDay: ['morning'], weatherFit: ['sunny', 'cold'],
    season: ALL_SEASONS, tags: ['day trip', 'adventure', 'explore'],
    variants: ['the next town over', 'a lake', 'a small village', 'a national park', 'a coastal town', 'a vineyard region', 'a mountain hut', 'an island', 'a thermal spring', 'a castle ruin'],
  },

  // ── CREATE ────────────────────────────────────────────────────────────
  {
    title: 'try a {x} class', idea: 'book a beginner {x} class and be hopeless at it together — that is the fun.',
    category: 'create', spaceTypes: BOTH, priceBand: '€€', indoorOutdoor: 'indoor', avgDurationMin: 120,
    energy: 'medium', idealTimeOfDay: ['afternoon', 'evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['class', 'create', 'learn'],
    variants: ['pottery', 'life drawing', 'dance', 'cocktail-making', 'glass-blowing', 'printmaking', 'candle-making', 'jewellery-making', 'screen-printing', 'woodworking', 'calligraphy', 'flower-arranging'],
  },
  {
    title: 'a {x} night', idea: 'clear the table and make {x} together — keep whatever you end up with.',
    category: 'create', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'indoor', avgDurationMin: 120,
    energy: 'medium', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['create', 'home', 'crafty'],
    variants: ['watercolour painting', 'collage from old magazines', 'shared-playlist cover art', 'tiny-zine making', 'clay figures', 'origami', 'vision-board making', 'hand-lettered postcards'],
  },
  {
    title: 'write {x} to each other', idea: 'sit apart for twenty minutes, write {x}, then read them out loud.',
    category: 'calm', spaceTypes: COUPLE, priceBand: 'free', indoorOutdoor: 'indoor', avgDurationMin: 45,
    energy: 'low', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['intimate', 'words', 'calm'],
    variants: ['a letter for a year from now', 'a list of small thank-yous', 'a favourite memory in detail', 'a short poem', 'a letter to open on a hard day'],
  },

  // ── CULTURE ───────────────────────────────────────────────────────────
  {
    title: 'visit {x}', idea: 'go slowly through {x}: pick one favourite each and tell the other why.',
    category: 'culture', spaceTypes: BOTH, priceBand: '€€', indoorOutdoor: 'indoor', avgDurationMin: 120,
    energy: 'low', idealTimeOfDay: ['afternoon'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['culture', 'museum', 'slow'],
    variants: ['an art gallery', 'a natural history museum', 'a science centre', 'a small local museum', 'a photography exhibition', 'a sculpture garden', 'a design museum', 'a botanical glasshouse', 'an aquarium', 'a planetarium'],
  },
  {
    title: 'see {x} live', idea: 'get tickets to {x} — even a small show you know nothing about.',
    category: 'culture', spaceTypes: BOTH, priceBand: '€€', indoorOutdoor: 'indoor', avgDurationMin: 150,
    energy: 'low', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['culture', 'live', 'night out'],
    variants: ['a jazz set', 'a comedy night', 'an open-mic', 'a small gig', 'the theatre', 'a poetry reading', 'a classical concert', 'an indie film at an old cinema', 'a dance performance'],
  },
  {
    title: 'a themed night: {x}', idea: 'pick {x}: dress the part, match the food, the music, the whole mood.',
    category: 'play', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'indoor', avgDurationMin: 150,
    energy: 'medium', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['themed', 'play', 'home'],
    variants: ['a country you both want to visit', 'a decade — 70s, 80s or 90s', 'a favourite film', 'a murder-mystery', 'Eurovision', 'a black-tie dinner at home', 'a tiki night'],
  },

  // ── PLAY ──────────────────────────────────────────────────────────────
  {
    title: 'a {x} tournament', idea: 'best of five at {x} — loser makes the snacks.',
    category: 'play', spaceTypes: BOTH, priceBand: 'free', indoorOutdoor: 'indoor', avgDurationMin: 90,
    energy: 'medium', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['games', 'play', 'home'],
    variants: ['board games', 'card games', 'video games', 'darts', 'table tennis', 'chess', 'home-made quiz', 'mini-golf', 'bowling', 'pool'],
  },
  {
    title: 'go {x}', idea: 'an hour of pure play: {x} and laugh more than you plan to.',
    category: 'play', spaceTypes: BOTH, priceBand: '€€', indoorOutdoor: 'indoor', avgDurationMin: 90,
    energy: 'high', idealTimeOfDay: ['afternoon', 'evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['play', 'active', 'fun'],
    variants: ['to an escape room', 'roller skating', 'to an arcade', 'go-karting', 'to a trampoline park', 'indoor climbing', 'to a board-game café', 'laser tag', 'axe-throwing'],
  },

  // ── CALM / WELLNESS ───────────────────────────────────────────────────
  {
    title: 'a slow {x} morning', idea: 'no alarm, no plans — just {x} and a long unhurried start to the day.',
    category: 'calm', spaceTypes: COUPLE, priceBand: '€', indoorOutdoor: 'indoor', avgDurationMin: 120,
    energy: 'low', idealTimeOfDay: ['morning'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['calm', 'cosy', 'home'],
    variants: ['coffee in bed', 'pastries and the papers', 'a big breakfast', 'a long shared playlist'],
  },
  {
    title: '{x} as a reset', idea: 'switch off the noise and do {x} together — phones in another room.',
    category: 'wellness', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'indoor', avgDurationMin: 90,
    energy: 'low', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['wellness', 'calm', 'restorative'],
    variants: ['a guided stretch', 'a sauna session', 'face masks and tea', 'a long bath and a record', 'some breathwork', 'a gentle yoga flow', 'a digital-detox evening'],
  },
  {
    title: 'stargaze with {x}', idea: 'get away from the lights with {x} and find three constellations.',
    category: 'calm', spaceTypes: BOTH, priceBand: 'free', indoorOutdoor: 'outdoor', avgDurationMin: 90,
    energy: 'low', idealTimeOfDay: ['evening'], weatherFit: ['cold', 'any'],
    season: ['autumn', 'winter'], tags: ['stars', 'calm', 'awe'],
    variants: ['a flask of tea', 'blankets and a star map app', 'hot chocolate', 'a playlist and a thermos'],
  },

  // ── LEARN ─────────────────────────────────────────────────────────────
  {
    title: 'learn {x} together', idea: 'spend an evening on the very basics of {x} — total beginners, side by side.',
    category: 'learn', spaceTypes: BOTH, priceBand: 'free', indoorOutdoor: 'indoor', avgDurationMin: 90,
    energy: 'low', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['learn', 'home', 'growth'],
    variants: ['a card trick', 'ten phrases in a new language', 'the night sky', 'to fold five origami animals', 'basic chess openings', 'a simple song on an instrument', 'how to read tarot for fun', 'to whistle with two fingers', 'the basics of astrology', 'a magic coin trick'],
  },
  {
    title: 'a documentary {x} night', idea: 'pick {x}, make a theme of the snacks, and talk about it after.',
    category: 'home', spaceTypes: BOTH, priceBand: 'free', indoorOutdoor: 'indoor', avgDurationMin: 120,
    energy: 'low', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['home', 'cosy', 'learn'],
    variants: ['about the deep ocean', 'about space', 'about food around the world', 'about a band you love', 'about a strange unsolved mystery', 'about wild animals', 'about a city you want to visit'],
  },

  // ── HOME ──────────────────────────────────────────────────────────────
  {
    title: '{x} — a cosy night in', idea: 'build the nest: blankets, low light and {x} — nowhere to be.',
    category: 'home', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'indoor', avgDurationMin: 150,
    energy: 'low', idealTimeOfDay: ['evening'], weatherFit: ['rain', 'cold', 'any'],
    season: ['autumn', 'winter'], tags: ['cosy', 'home', 'calm'],
    variants: ['a film marathon', 'a whole season of a show', 'a fondue', 'a puzzle and a record', 'homemade pizza and a comedy', 'a blanket fort and old cartoons'],
  },
  {
    title: 'plan {x} together', idea: 'pour something nice and dream it out: {x}, no budget limits yet.',
    category: 'calm', spaceTypes: BOTH, priceBand: 'free', indoorOutdoor: 'indoor', avgDurationMin: 60,
    energy: 'low', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['planning', 'dream', 'home'],
    variants: ['your next trip', 'a bucket list for the year', 'a someday road trip', 'the perfect lazy Sunday', 'a small home project', 'a garden or balcony'],
  },
  {
    title: 'tackle a home project: {x}', idea: 'pick one small thing — {x} — and finish it together this evening.',
    category: 'create', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'indoor', avgDurationMin: 120,
    energy: 'medium', idealTimeOfDay: ['afternoon', 'evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['home', 'create', 'together'],
    variants: ['plant a herb garden', 'frame your favourite photos', 'rearrange a room', 'build a gallery wall', 'make a time capsule', 'restore something old', 'cook and freeze a week of meals'],
  },

  // ── SEASONAL ──────────────────────────────────────────────────────────
  {
    title: 'a summer {x}', idea: 'make the most of the warm light: {x} while it lasts.',
    category: 'outdoors', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'outdoor', avgDurationMin: 150,
    energy: 'medium', idealTimeOfDay: ['afternoon', 'evening'], weatherFit: ['sunny'],
    season: ['summer'], tags: ['summer', 'outdoors', 'seasonal'],
    variants: ['evening swim and ice cream', 'rooftop sunset drinks', 'open-air cinema', 'berry-picking afternoon', 'lake day', 'BBQ in the park', 'late-night bike ride'],
  },
  {
    title: 'an autumn {x}', idea: 'lean into the season: {x} with the leaves turning.',
    category: 'outdoors', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'flexible', avgDurationMin: 150,
    energy: 'medium', idealTimeOfDay: ['afternoon'], weatherFit: ['cold', 'any'],
    season: ['autumn'], tags: ['autumn', 'seasonal', 'cosy'],
    variants: ['forest walk and a flask of soup', 'pumpkin carving', 'apple-picking afternoon', 'foggy-morning hike', 'cosy café crawl', 'leaf-collecting wander'],
  },
  {
    title: 'a winter {x}', idea: 'embrace the cold (or hide from it): {x} together.',
    category: 'outdoors', spaceTypes: BOTH, priceBand: '€€', indoorOutdoor: 'flexible', avgDurationMin: 150,
    energy: 'medium', idealTimeOfDay: ['afternoon', 'evening'], weatherFit: ['cold'],
    season: ['winter'], tags: ['winter', 'seasonal'],
    variants: ['ice skating and mulled wine', 'snowy walk and hot chocolate', 'Christmas market', 'sledging afternoon', 'spa day', 'snowball fight then soup', 'candle-lit dinner in'],
  },
  {
    title: 'a spring {x}', idea: 'welcome the new light: {x} as everything comes back to life.',
    category: 'outdoors', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'outdoor', avgDurationMin: 120,
    energy: 'medium', idealTimeOfDay: ['morning', 'afternoon'], weatherFit: ['sunny'],
    season: ['spring'], tags: ['spring', 'seasonal', 'fresh'],
    variants: ['blossom-spotting walk', 'garden centre wander', 'first picnic of the year', 'bike ride through the park', 'planting afternoon', 'farmers’ market morning'],
  },

  // ── ADVENTURE / SPONTANEOUS ───────────────────────────────────────────
  {
    title: 'be a tourist in {x}', idea: 'pretend you just arrived: {x} as if you have never seen your own city.',
    category: 'adventure', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'flexible', avgDurationMin: 180,
    energy: 'medium', idealTimeOfDay: ['morning', 'afternoon'], weatherFit: ['any', 'sunny'],
    season: ALL_SEASONS, tags: ['explore', 'adventure', 'local'],
    variants: ['your own neighbourhood', 'the part of town you avoid', 'the tourist spots you skip', 'a free walking tour', 'the open-top bus you’d never take', 'every photo-worthy corner'],
  },
  {
    title: 'let a coin flip decide: {x}', idea: 'let chance lead the way: {x} and follow heads-or-tails at every fork.',
    category: 'adventure', spaceTypes: BOTH, priceBand: '€', indoorOutdoor: 'outdoor', avgDurationMin: 150,
    energy: 'medium', idealTimeOfDay: ['afternoon'], weatherFit: ['sunny', 'cold'],
    season: ALL_SEASONS, tags: ['spontaneous', 'adventure', 'play'],
    variants: ['wander the city', 'a random bus to the end of the line', 'a drive with no destination', 'a walk into the unknown', 'a train to a surprise town'],
  },
  {
    title: 'a {x} scavenger hunt', idea: 'set each other a {x} list and race to photograph them all.',
    category: 'play', spaceTypes: BOTH, priceBand: 'free', indoorOutdoor: 'outdoor', avgDurationMin: 120,
    energy: 'high', idealTimeOfDay: ['afternoon'], weatherFit: ['sunny', 'any'],
    season: ALL_SEASONS, tags: ['play', 'explore', 'active'],
    variants: ['photo', 'colour-themed', 'alphabet', 'tiny-details', 'street-art', 'reflection-and-shadow'],
  },

  // ── INTIMATE / CONNECTION (couple) ────────────────────────────────────
  {
    title: 'trade {x}', idea: 'take turns and really listen: {x}, no fixing, just hearing each other.',
    category: 'calm', spaceTypes: COUPLE, priceBand: 'free', indoorOutdoor: 'flexible', avgDurationMin: 45,
    energy: 'low', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'],
    season: ALL_SEASONS, tags: ['intimate', 'connection', 'calm'],
    variants: ['a childhood fear', 'a proud moment', 'a dream you have never said out loud', 'a small regret', 'the story of a scar', 'a turning point', 'a hope for next year'],
  },
  {
    title: 'recreate your {x}', idea: 'go back to where it started: recreate {x} as closely as you can.',
    category: 'calm', spaceTypes: COUPLE, priceBand: '€€', indoorOutdoor: 'flexible', avgDurationMin: 120,
    energy: 'low', idealTimeOfDay: ['afternoon', 'evening'], weatherFit: ['any', 'sunny'],
    season: ALL_SEASONS, tags: ['intimate', 'nostalgia', 'couple'],
    variants: ['first date', 'first coffee together', 'the night you met', 'an early trip', 'your favourite ordinary day'],
  },
];

/**
 * A second, category-level axis that deepens the catalog without padding: each
 * twist adds a real angle to the idea (a constraint, a companion, a way to make
 * it special) and an editorial "· tag" so every combined title stays distinct
 * and reads naturally. The first twist is always the clean, un-tagged version.
 */
type Twist = { tag: string; extra: string };
const NONE: Twist = { tag: '', extra: '' };

const TWISTS_BY_CATEGORY: Record<IdeaCategory, Twist[]> = {
  food: [
    NONE,
    { tag: 'on a tiny budget', extra: 'see how good you can make it for almost nothing.' },
    { tag: 'to impress', extra: 'go all out — the good plates, a candle, the works.' },
    { tag: 'with a playlist to match', extra: 'build a soundtrack that fits the mood before you start.' },
    { tag: 'and rate it after', extra: 'score it out of ten each and compare notes.' },
  ],
  outdoors: [
    NONE,
    { tag: 'at first light', extra: 'set an early alarm and have it almost to yourselves.' },
    { tag: 'with a flask and snacks', extra: 'pack something warm to share halfway through.' },
    { tag: 'phones away', extra: 'no photos, no map — just be there for it.' },
    { tag: 'the long way', extra: 'take the slower route on purpose and let it stretch out.' },
  ],
  create: [
    NONE,
    { tag: 'no perfectionism', extra: 'the rule is finish it, not nail it.' },
    { tag: 'swap halfway', extra: 'trade pieces midway and finish each other’s.' },
    { tag: 'keep it forever', extra: 'whatever you make, it goes on a shelf — proudly.' },
  ],
  calm: [
    NONE,
    { tag: 'candle-lit', extra: 'kill the overhead lights and keep it soft.' },
    { tag: 'no screens', extra: 'leave every phone in another room first.' },
    { tag: 'before bed', extra: 'let it be the last thing you do before sleep.' },
  ],
  play: [
    NONE,
    { tag: 'loser cooks', extra: 'stakes make it better — winner picks the prize.' },
    { tag: 'best of seven', extra: 'make it a proper series, not one round.' },
    { tag: 'with a silly trophy', extra: 'find something daft to award the champion.' },
    { tag: 'teams or solo', extra: 'rope others in, or keep it just the two of you.' },
  ],
  culture: [
    NONE,
    { tag: 'pick one favourite each', extra: 'at the end, show each other your single best find.' },
    { tag: 'go in blind', extra: 'read nothing beforehand — let it surprise you.' },
    { tag: 'then talk it out over food', extra: 'find somewhere after to unpack what you saw.' },
  ],
  adventure: [
    NONE,
    { tag: 'no plan past the start', extra: 'decide nothing in advance but the first step.' },
    { tag: 'document it', extra: 'one disposable-camera’s worth of photos, that’s it.' },
    { tag: 'say yes to detours', extra: 'whatever looks interesting, you have to follow it.' },
  ],
  learn: [
    NONE,
    { tag: 'teach it back', extra: 'at the end, each explain it to the other from scratch.' },
    { tag: 'just 30 minutes', extra: 'keep it short and light — curiosity, not a course.' },
    { tag: 'make it a weekly thing', extra: 'if you like it, agree to come back to it.' },
  ],
  home: [
    NONE,
    { tag: 'full blanket-fort mode', extra: 'build the nest properly before you start.' },
    { tag: 'themed snacks only', extra: 'match everything you eat to the mood.' },
    { tag: 'no clock', extra: 'agree there’s nowhere to be after.' },
  ],
  wellness: [
    NONE,
    { tag: 'phones in a drawer', extra: 'fully unplug for the whole thing.' },
    { tag: 'make it a ritual', extra: 'if it lands, keep it as a regular reset.' },
    { tag: 'tea and quiet after', extra: 'leave time to just sit together afterwards.' },
  ],
};

/** Fix "a apple" → "an apple" for our vowel-initial variants. Safe for the
 *  controlled vocabulary here (no "a university"/"a one-off" style words). */
function fixArticles(s: string): string {
  return s.replace(/\b([Aa]) ([aeiouAEIOU])/g, (_m, a, v) => `${a}n ${v}`);
}

/** Build the full catalog deterministically. Stable order across renders. */
function buildCatalog(): DateIdea[] {
  const out: DateIdea[] = [];
  const seen = new Set<string>();
  FAMILIES.forEach((fam, fi) => {
    const twists = TWISTS_BY_CATEGORY[fam.category] ?? [NONE];
    fam.variants.forEach((variant, vi) => {
      const baseTitle = fixArticles(fam.title.replace('{x}', variant));
      const baseIdea = fixArticles(fam.idea.replace('{x}', variant));
      twists.forEach((tw, ti) => {
        const title = tw.tag ? `${baseTitle} · ${tw.tag}` : baseTitle;
        const key = title.toLowerCase();
        if (seen.has(key)) return; // never two identical titles
        seen.add(key);
        out.push({
          id: `idea-${fi}-${vi}-${ti}`,
          title,
          idea: tw.extra ? `${baseIdea} ${tw.extra}` : baseIdea,
          category: fam.category,
          spaceTypes: fam.spaceTypes,
          priceBand: fam.priceBand,
          indoorOutdoor: fam.indoorOutdoor,
          avgDurationMin: fam.avgDurationMin,
          energy: fam.energy,
          idealTimeOfDay: fam.idealTimeOfDay,
          weatherFit: fam.weatherFit,
          season: fam.season,
          tags: fam.tags,
        });
      });
    });
  });
  return out;
}

export const IDEA_CATALOG: DateIdea[] = buildCatalog();

export function ideaById(id: string): DateIdea | undefined {
  return IDEA_CATALOG.find((i) => i.id === id);
}

// ── Filtering ───────────────────────────────────────────────────────────

export interface IdeaFilter {
  spaceType?: SpaceType;
  timeOfDay?: TimeOfDay;
  maxBudget?: PriceBand;
  energy?: Energy;
  indoorOutdoor?: IndoorOutdoor;
  category?: IdeaCategory;
  season?: Season;
  /** Free-text search across title, idea and tags. */
  query?: string;
}

const PRICE_ORDER: PriceBand[] = ['free', '€', '€€', '€€€'];

function withinBudget(idea: PriceBand, max: PriceBand): boolean {
  return PRICE_ORDER.indexOf(idea) <= PRICE_ORDER.indexOf(max);
}

/** Apply a filter to the catalog. Empty filter returns the full catalog. */
export function filterIdeas(filter: IdeaFilter): DateIdea[] {
  const q = filter.query?.trim().toLowerCase();
  return IDEA_CATALOG.filter((idea) => {
    if (filter.spaceType && !idea.spaceTypes.includes(filter.spaceType)) return false;
    if (filter.timeOfDay && !idea.idealTimeOfDay.includes(filter.timeOfDay)) return false;
    if (filter.maxBudget && !withinBudget(idea.priceBand, filter.maxBudget)) return false;
    if (filter.energy && idea.energy !== filter.energy) return false;
    if (
      filter.indoorOutdoor &&
      filter.indoorOutdoor !== 'flexible' &&
      idea.indoorOutdoor !== filter.indoorOutdoor &&
      idea.indoorOutdoor !== 'flexible'
    ) {
      return false;
    }
    if (filter.category && idea.category !== filter.category) return false;
    if (filter.season && filter.season !== 'any' && !idea.season.includes('any') && !idea.season.includes(filter.season)) return false;
    if (q) {
      const hay = `${idea.title} ${idea.idea} ${idea.tags.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Count active facets — used to show "N filters" in the UI. */
export function activeFilterCount(filter: IdeaFilter): number {
  let n = 0;
  if (filter.spaceType) n++;
  if (filter.timeOfDay) n++;
  if (filter.maxBudget) n++;
  if (filter.energy) n++;
  if (filter.indoorOutdoor) n++;
  if (filter.category) n++;
  if (filter.season) n++;
  if (filter.query?.trim()) n++;
  return n;
}
