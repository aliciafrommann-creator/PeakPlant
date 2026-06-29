import type { SpaceType } from '../types';
import type {
  TogetherMoment,
  MomentCategory,
  PriceBand,
  IndoorOutdoor,
  TimeOfDay,
  Weather,
  Energy,
} from '../together';

/**
 * Curated depth for the Date Discovery recommender.
 *
 * These are hand-written, genuinely distinct ideas — NOT the combinatorial
 * browse library (lib/discovery/ideaCatalog.ts). They feed the "surprise me"
 * recommender and the Ask candidate pool, which both carry a `curated`
 * provenance label, so quality matters more than count. The recommender never
 * invents venues or facts; these only add real ideas to filter and rank.
 *
 * Together with the eight originals in together.ts this gives the recommender a
 * pool of ~110 — deep enough that "show another" stays fresh and Ask has room
 * to match — while staying small enough to remain truly curated.
 */

const BOTH: SpaceType[] = ['couple', 'friends'];
const COUPLE: SpaceType[] = ['couple'];
const FRIENDS: SpaceType[] = ['friends'];

type Opt = {
  spaceTypes?: SpaceType[];
  priceBand?: PriceBand;
  indoorOutdoor?: IndoorOutdoor;
  avgDurationMin?: number;
  energy?: Energy;
  idealTimeOfDay?: TimeOfDay[];
  weatherFit?: Weather[];
};

/** Terse factory with warm defaults so each idea reads as one line. */
function m(
  id: string,
  title: string,
  idea: string,
  category: MomentCategory,
  o: Opt = {},
): TogetherMoment {
  return {
    id,
    title,
    idea,
    category,
    spaceTypes: o.spaceTypes ?? BOTH,
    priceBand: o.priceBand ?? '€',
    indoorOutdoor: o.indoorOutdoor ?? 'flexible',
    avgDurationMin: o.avgDurationMin ?? 90,
    energy: o.energy ?? 'medium',
    idealTimeOfDay: o.idealTimeOfDay ?? ['afternoon', 'evening'],
    weatherFit: o.weatherFit ?? ['any'],
    linkedCardIds: [],
  };
}

// Common metadata bundles to keep entries readable.
const IN_EVE: Opt = { indoorOutdoor: 'indoor', idealTimeOfDay: ['evening'], weatherFit: ['any', 'rain', 'cold'] };
const OUT_DAY: Opt = { indoorOutdoor: 'outdoor', idealTimeOfDay: ['morning', 'afternoon'], weatherFit: ['sunny'], priceBand: 'free' };
const LOW_EVE: Opt = { indoorOutdoor: 'indoor', idealTimeOfDay: ['evening'], energy: 'low', weatherFit: ['any', 'rain', 'cold'] };

export const CURATED_MOMENTS: TogetherMoment[] = [
  // ── FOOD ───────────────────────────────────────────────────────────────
  m('cm-f1', 'a country you’ve never cooked', 'pick a cuisine new to you both and make one dish from scratch.', 'food', { ...IN_EVE, priceBand: '€€', avgDurationMin: 150 }),
  m('cm-f2', 'build-your-own night', 'tacos, pizzas or ramen bowls — lay out the parts and each build your own.', 'food', { ...IN_EVE, priceBand: '€€', avgDurationMin: 90 }),
  m('cm-f3', 'a strict €10 dinner', 'two courses, ten euros, no compromises on joy. see how good cheap can be.', 'food', { ...IN_EVE, priceBand: '€', avgDurationMin: 90 }),
  m('cm-f4', 'blind snack taste test', 'grab odd supermarket snacks, blindfold, rate each one out of ten.', 'food', { ...IN_EVE, priceBand: '€', avgDurationMin: 45, energy: 'low' }),
  m('cm-f5', 'breakfast in bed, together', 'no getting up properly — assemble something lovely and eat it under the covers.', 'food', { indoorOutdoor: 'indoor', idealTimeOfDay: ['morning'], energy: 'low', priceBand: '€', avgDurationMin: 60, weatherFit: ['any', 'rain', 'cold'] }),
  m('cm-f6', 'a grandparent’s recipe', 'cook something one of your families always made — from memory if you can.', 'food', { ...IN_EVE, priceBand: '€€', avgDurationMin: 120 }),
  m('cm-f7', 'cheese, honey & cheap wine', 'a small board, a bottle that cost almost nothing, a long evening.', 'food', { ...LOW_EVE, priceBand: '€€', avgDurationMin: 90, spaceTypes: COUPLE }),
  m('cm-f8', 'one mystery ingredient', 'each pick a secret ingredient; both dishes must use both. chaos, deliciously.', 'food', { ...IN_EVE, priceBand: '€€', avgDurationMin: 120 }),
  m('cm-f9', 'corner-shop picnic', 'ten minutes, one small shop, build the best picnic you can from it.', 'food', { indoorOutdoor: 'outdoor', idealTimeOfDay: ['afternoon'], priceBand: '€', avgDurationMin: 90, weatherFit: ['sunny'] }),
  m('cm-f10', 'a three-stop crawl', 'starter at one place, main at another, dessert at a third. walk between.', 'food', { indoorOutdoor: 'flexible', idealTimeOfDay: ['evening'], priceBand: '€€', avgDurationMin: 150 }),
  m('cm-f11', 'dumpling-folding session', 'make a big batch together — half will look terrible, all will taste great.', 'food', { ...IN_EVE, priceBand: '€', avgDurationMin: 120 }),
  m('cm-f12', 'dessert first', 'flip the order: pudding, then the proper meal. rules are made up anyway.', 'food', { ...IN_EVE, priceBand: '€', avgDurationMin: 90 }),
  m('cm-f13', 'a spicy-food dare', 'cook it hotter than usual, milk on standby, no backing out.', 'food', { ...IN_EVE, priceBand: '€', avgDurationMin: 75, spaceTypes: COUPLE }),
  m('cm-f14', 'plate it like a restaurant', 'cook something simple, then plate it absurdly fancy and "review" it.', 'food', { ...IN_EVE, priceBand: '€', avgDurationMin: 90 }),
  m('cm-f15', 'an all-green feast', 'everything you cook has to be green. it’s sillier and better than it sounds.', 'food', { ...IN_EVE, priceBand: '€€', avgDurationMin: 100 }),
  m('cm-f16', 'a slow tea ceremony', 'good tea, no phones, pour for each other and actually slow down.', 'food', { ...LOW_EVE, priceBand: '€', avgDurationMin: 45 }),
  m('cm-f17', 'market haul, then improvise', 'buy whatever looks best at the market, figure out lunch on the way home.', 'food', { indoorOutdoor: 'flexible', idealTimeOfDay: ['morning', 'afternoon'], priceBand: '€€', avgDurationMin: 150, weatherFit: ['sunny', 'any'] }),
  m('cm-f18', 'cocktails from one bottle', 'one spirit (or none), whatever’s in the cupboard, invent two drinks.', 'food', { ...IN_EVE, priceBand: '€€', avgDurationMin: 60 }),
  m('cm-f19', 'a film-themed snack spread', 'pick a film, match every snack to it, dim the lights.', 'food', { ...LOW_EVE, priceBand: '€', avgDurationMin: 150 }),
  m('cm-f20', 'midnight breakfast', 'pancakes and eggs at 11pm in pyjamas, for no reason at all.', 'food', { ...IN_EVE, priceBand: '€', avgDurationMin: 60, energy: 'low' }),

  // ── OUTDOORS ─────────────────────────────────────────────────────────────
  m('cm-o1', 'before the city wakes', 'a sunrise walk while it’s still quiet — almost no one else out.', 'outdoors', { ...OUT_DAY, idealTimeOfDay: ['morning'], avgDurationMin: 75, energy: 'low' }),
  m('cm-o2', 'the highest free view', 'find the best viewpoint that costs nothing and just sit with it.', 'outdoors', { ...OUT_DAY, avgDurationMin: 120 }),
  m('cm-o3', 'barefoot in the grass', 'shoes off in a park for an hour. surprisingly hard to feel bad doing it.', 'outdoors', { ...OUT_DAY, avgDurationMin: 60, energy: 'low' }),
  m('cm-o4', 'cloud-watching', 'a blanket, the sky, and naming the shapes you see. nothing else.', 'outdoors', { ...OUT_DAY, avgDurationMin: 60, energy: 'low' }),
  m('cm-o5', 'cycle somewhere new', 'pick a direction you’ve never ridden and follow it until it gets interesting.', 'outdoors', { ...OUT_DAY, avgDurationMin: 150, energy: 'high' }),
  m('cm-o6', 'skip stones', 'find the nearest water and see who can get the most skips. petty competitive bliss.', 'outdoors', { ...OUT_DAY, avgDurationMin: 45 }),
  m('cm-o7', 'a coin-flip walk', 'heads left, tails right, at every corner. let the city decide the date.', 'outdoors', { indoorOutdoor: 'outdoor', idealTimeOfDay: ['afternoon'], priceBand: 'free', avgDurationMin: 120, weatherFit: ['sunny', 'cold'] }),
  m('cm-o8', 'name five plants', 'on any green walk, identify five things growing. an app counts as cheating (do it anyway).', 'outdoors', { ...OUT_DAY, avgDurationMin: 75, energy: 'low' }),
  m('cm-o9', 'a cold outdoor swim', 'lake, sea or lido — get in, scream a bit, feel completely alive after.', 'outdoors', { indoorOutdoor: 'outdoor', idealTimeOfDay: ['morning', 'afternoon'], priceBand: 'free', avgDurationMin: 90, energy: 'high', weatherFit: ['sunny'] }),
  m('cm-o10', 'golden-hour photo walk', 'one hour before sunset, ten photos each, best one wins bragging rights.', 'outdoors', { indoorOutdoor: 'outdoor', idealTimeOfDay: ['evening'], priceBand: 'free', avgDurationMin: 75, weatherFit: ['sunny'] }),
  m('cm-o11', 'walk past phone signal', 'hike far enough that the bars drop. talk like there’s nothing else to check.', 'outdoors', { ...OUT_DAY, avgDurationMin: 180, energy: 'high' }),
  m('cm-o12', 'plant and revisit', 'plant something — a tree, a bulb, a balcony pot — and agree to come back to it.', 'outdoors', { indoorOutdoor: 'outdoor', idealTimeOfDay: ['morning', 'afternoon'], priceBand: '€', avgDurationMin: 90, weatherFit: ['sunny', 'any'] }),
  m('cm-o13', 'a question per block', 'walk and ask each other one real question every street. no small talk allowed.', 'outdoors', { indoorOutdoor: 'outdoor', idealTimeOfDay: ['afternoon', 'evening'], priceBand: 'free', avgDurationMin: 90, energy: 'low', weatherFit: ['sunny', 'cold'], spaceTypes: COUPLE }),
  m('cm-o14', 'a sunset picnic dinner', 'carry dinner somewhere with a view and eat it as the light goes.', 'outdoors', { indoorOutdoor: 'outdoor', idealTimeOfDay: ['evening'], priceBand: '€', avgDurationMin: 120, energy: 'low', weatherFit: ['sunny'] }),
  m('cm-o15', 'the part of town you skip', 'explore the neighbourhood you always mean to and never do.', 'outdoors', { ...OUT_DAY, avgDurationMin: 120 }),
  m('cm-o16', 'a botanical slow loop', 'a garden or park, walked at half speed, noticing more than usual.', 'outdoors', { ...OUT_DAY, avgDurationMin: 90, energy: 'low' }),
  m('cm-o17', 'collect something', 'leaves, shells, odd stones — bring home a small pocketful from the walk.', 'outdoors', { ...OUT_DAY, avgDurationMin: 75, energy: 'low' }),
  m('cm-o18', 'a run you’ll both moan about', 'a short run together you’ll resent for ten minutes and love after.', 'outdoors', { indoorOutdoor: 'outdoor', idealTimeOfDay: ['morning'], priceBand: 'free', avgDurationMin: 45, energy: 'high', weatherFit: ['sunny', 'cold'] }),
  m('cm-o19', 'a weekly outdoor market', 'wander a market with no shopping list and one snack budget.', 'outdoors', { indoorOutdoor: 'outdoor', idealTimeOfDay: ['morning'], priceBand: '€', avgDurationMin: 90, weatherFit: ['sunny', 'any'] }),
  m('cm-o20', 'watch a storm safely', 'when the weather turns, find a dry spot and watch it roll through.', 'outdoors', { indoorOutdoor: 'flexible', idealTimeOfDay: ['afternoon', 'evening'], priceBand: 'free', avgDurationMin: 60, energy: 'low', weatherFit: ['rain'] }),

  // ── CREATE ───────────────────────────────────────────────────────────────
  m('cm-c1', 'paint each other badly', 'portraits, ten minutes each, the worse the funnier. keep them.', 'create', { ...IN_EVE, priceBand: '€', avgDurationMin: 60 }),
  m('cm-c2', 'two-line poems, swapped', 'write two lines each about the other, trade, read them out.', 'create', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 30, spaceTypes: COUPLE }),
  m('cm-c3', 'a playlist of your story', 'build a shared playlist — one song per chapter of you two.', 'create', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 60, spaceTypes: COUPLE }),
  m('cm-c4', 'a clay evening', 'air-dry clay at the kitchen table, make each other something small.', 'create', { ...IN_EVE, priceBand: '€', avgDurationMin: 90 }),
  m('cm-c5', 'flat-pack without fighting', 'build something together as calmly as humanly possible. it’s a test, lovingly.', 'create', { ...IN_EVE, priceBand: '€€', avgDurationMin: 90 }),
  m('cm-c6', 'a vision board for the year', 'cut, stick and dream out loud about the next twelve months.', 'create', { ...LOW_EVE, priceBand: '€', avgDurationMin: 90 }),
  m('cm-c7', 'ten ordinary-beautiful photos', 'photograph ten lovely small things at home you usually walk past.', 'create', { indoorOutdoor: 'indoor', idealTimeOfDay: ['afternoon', 'evening'], priceBand: 'free', avgDurationMin: 45, energy: 'low', weatherFit: ['any', 'rain', 'cold'] }),
  m('cm-c8', 'a magic trick each', 'learn one trick each from a video and perform them with full drama.', 'create', { ...IN_EVE, priceBand: 'free', avgDurationMin: 60 }),
  m('cm-c9', 'design your dream home', 'sketch the place you’d live someday — rooms, garden, the silly details.', 'create', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 60, spaceTypes: COUPLE }),
  m('cm-c10', 'a zine about your week', 'fold one sheet into a tiny magazine about the last seven days.', 'create', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 60 }),
  m('cm-c11', 'draw your day as a comic', 'each turn today into a four-panel strip and compare.', 'create', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 45 }),
  m('cm-c12', 'a letter to future-you', 'hand-write a postcard to open in a year, then hide it well.', 'create', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 30, spaceTypes: COUPLE }),
  m('cm-c13', 'tallest thing on the shelf', 'build the tallest free-standing structure from what’s already in the room.', 'create', { ...IN_EVE, priceBand: 'free', avgDurationMin: 45 }),
  m('cm-c14', 'a one-minute time capsule', 'record a voice memo to your future selves and diary the date to replay it.', 'create', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 30, spaceTypes: COUPLE }),
  m('cm-c15', 'redo one corner', 'pick one corner of a room and restyle it together tonight.', 'create', { ...IN_EVE, priceBand: '€', avgDurationMin: 90 }),
  m('cm-c16', 'make bracelets', 'thread something for each other to wear until it falls apart.', 'create', { ...LOW_EVE, priceBand: '€', avgDurationMin: 60 }),
  m('cm-c17', 'a watercolour-and-wine night', 'cheap paints, one glass each, paint the same thing and compare.', 'create', { ...IN_EVE, priceBand: '€', avgDurationMin: 90 }),
  m('cm-c18', 'write a chorus together', 'no instruments needed — invent a four-line chorus about your day.', 'create', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 45 }),
  m('cm-c19', 'press today’s flowers', 'if you picked anything on a walk, press it between heavy books.', 'create', { indoorOutdoor: 'indoor', idealTimeOfDay: ['afternoon', 'evening'], priceBand: 'free', avgDurationMin: 30, energy: 'low', weatherFit: ['any'] }),
  m('cm-c20', 'a tiny stop-motion', 'animate something daft on a phone, thirty frames, big laughs.', 'create', { ...IN_EVE, priceBand: 'free', avgDurationMin: 60 }),

  // ── CALM ─────────────────────────────────────────────────────────────────
  m('cm-k1', 'phones in a drawer', 'one full hour, both phones away, just the two of you and the room.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 60, spaceTypes: COUPLE }),
  m('cm-k2', 'read aloud, taking turns', 'one book, a chapter each, the other just listens.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 45 }),
  m('cm-k3', 'breathe together', 'a ten-minute guided breathing session, side by side.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 20 }),
  m('cm-k4', 'three gratitudes each', 'name three small good things from today and why they mattered.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 20, spaceTypes: COUPLE }),
  m('cm-k5', 'a full album, eyes closed', 'lie down, play one album start to finish, say nothing until it ends.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 45 }),
  m('cm-k6', 'trade a childhood memory', 'each tell one story from being small, and just listen to the other.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 45, spaceTypes: COUPLE }),
  m('cm-k7', 'a bath-then-tea ritual', 'a long soak, then tea and quiet — a proper wind-down.', 'calm', { ...LOW_EVE, priceBand: '€', avgDurationMin: 75, spaceTypes: COUPLE }),
  m('cm-k8', 'letters, read in silence', 'write each other a letter, swap, read without speaking.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 45, spaceTypes: COUPLE }),
  m('cm-k9', 'talk until you’re done', 'no plan, no timer — just talk until the conversation naturally ends.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 60, spaceTypes: COUPLE }),
  m('cm-k10', 'a ten-minute massage each', 'hands or shoulders, ten minutes each, no phones nearby.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 30, spaceTypes: COUPLE }),
  m('cm-k11', 'watch the rain', 'tea, a window, the rain. permission to do absolutely nothing.', 'calm', { indoorOutdoor: 'indoor', idealTimeOfDay: ['afternoon', 'evening'], priceBand: 'free', avgDurationMin: 45, energy: 'low', weatherFit: ['rain'] }),
  m('cm-k12', 'a screen-free evening', 'nothing with a screen after 8pm. see what the evening becomes.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 120 }),
  m('cm-k13', 'gentle yoga side by side', 'follow a short, easy flow together — wobbling allowed.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 30 }),
  m('cm-k14', 'café people-watching', 'sit, order something slow, and quietly invent lives for strangers.', 'calm', { indoorOutdoor: 'flexible', idealTimeOfDay: ['afternoon'], priceBand: '€', avgDurationMin: 60, energy: 'low', weatherFit: ['any'] }),
  m('cm-k15', 'highs and lows of the year', 'walk back through the year together — the best bits and the hard ones.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 60, spaceTypes: COUPLE }),
  m('cm-k16', 'an unapologetic nap', 'an afternoon nap together, guilt-free, curtains drawn.', 'calm', { indoorOutdoor: 'indoor', idealTimeOfDay: ['afternoon'], priceBand: 'free', avgDurationMin: 60, energy: 'low', weatherFit: ['any', 'rain', 'cold'], spaceTypes: COUPLE }),
  m('cm-k17', 'journal in the same room', 'light a candle, write separately in the same quiet space.', 'calm', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 30 }),
  m('cm-k18', 'a slow morning, no plans', 'coffee, no alarm, nowhere to be. protect the whole morning.', 'calm', { indoorOutdoor: 'indoor', idealTimeOfDay: ['morning'], priceBand: '€', avgDurationMin: 120, energy: 'low', weatherFit: ['any', 'rain', 'cold'], spaceTypes: COUPLE }),
  m('cm-k19', 'a quiet drive + playlist', 'drive nowhere in particular with a good playlist and the windows down.', 'calm', { indoorOutdoor: 'flexible', idealTimeOfDay: ['evening'], priceBand: '€', avgDurationMin: 75, energy: 'low', weatherFit: ['any', 'sunny'] }),
  m('cm-k20', 'name what you’re thankful for', 'a slow walk, naming things you’re grateful for, one each at a time.', 'calm', { indoorOutdoor: 'outdoor', idealTimeOfDay: ['morning', 'afternoon'], priceBand: 'free', avgDurationMin: 45, energy: 'low', weatherFit: ['sunny', 'cold'] }),

  // ── PLAY ─────────────────────────────────────────────────────────────────
  m('cm-p1', 'best-of-five tournament', 'pick a game, best of five, the loser owes the winner something small.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 90 }),
  m('cm-p2', 'a quiz you wrote', 'each secretly write ten questions for the other, then quiz away.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 60 }),
  m('cm-p3', 'truth or dare, gentle', 'the kind, curious version — questions you’ve never actually asked.', 'play', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 45, spaceTypes: COUPLE }),
  m('cm-p4', 'blanket fort + cartoons', 'build the fort properly, then watch the cartoons you grew up on.', 'play', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 120 }),
  m('cm-p5', 'a home scavenger hunt', 'set each other a list of things to find/photograph around the place.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 45 }),
  m('cm-p6', 'learn a silly dance', 'follow a dance video until you both nearly get it. film the attempt.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 45, energy: 'high' }),
  m('cm-p7', 'co-op you’re both bad at', 'a video game neither of you can play, failing together loudly.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 90 }),
  m('cm-p8', 'a "would you rather" dinner', 'over food, trade increasingly ridiculous would-you-rathers.', 'play', { ...IN_EVE, priceBand: '€', avgDurationMin: 60 }),
  m('cm-p9', 'mini indoor olympics', 'sock-slides, paper-ball tosses, balloon keepie-uppies. medals optional.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 45, energy: 'high' }),
  m('cm-p10', 'charades, inside jokes only', 'every clue has to be something only you two would get.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 45, spaceTypes: COUPLE }),
  m('cm-p11', 'a dress-up theme night', 'pick a theme, raid the wardrobe, commit fully to the bit.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 90 }),
  m('cm-p12', 'karaoke for two', 'no stage, no shame — take turns belting your guilty favourites.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 60, energy: 'high' }),
  m('cm-p13', 'name a cocktail after each other', 'invent two drinks, name them after one another, rate the worse one.', 'play', { ...IN_EVE, priceBand: '€€', avgDurationMin: 60, spaceTypes: COUPLE }),
  m('cm-p14', 'cards, loser does dishes', 'a quick card-game ladder; the loser handles the washing up.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 45 }),
  m('cm-p15', 'hide and seek (yes, really)', 'turn the lights low and play one round. it’s sillier and better than you think.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 30, energy: 'high' }),
  m('cm-p16', 'a drawing-guess game', 'one draws, one guesses, against the clock. terrible art encouraged.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 45 }),
  m('cm-p17', 'guess the year of the song', 'shuffle a playlist, guess each track’s release year, keep score.', 'play', { ...IN_EVE, priceBand: 'free', avgDurationMin: 45 }),
  m('cm-p18', 'two truths and a lie, hard mode', 'only obscure facts about yourselves allowed. surprisingly revealing.', 'play', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 30 }),
  m('cm-p19', 'a "favourite ever" speed round', 'rapid-fire favourites — film, meal, day, smell — no thinking too long.', 'play', { ...LOW_EVE, priceBand: 'free', avgDurationMin: 30, spaceTypes: COUPLE }),
  m('cm-p20', 'ultimate snack + game night', 'the best snacks you can assemble and a stack of games. friends welcome.', 'play', { ...IN_EVE, priceBand: '€', avgDurationMin: 150, spaceTypes: FRIENDS }),
];
