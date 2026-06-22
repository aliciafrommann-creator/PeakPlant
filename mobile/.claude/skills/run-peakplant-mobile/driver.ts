/**
 * PeakPlant mobile — discovery/AI direct-invocation driver.
 *
 * The full app is React Native (Expo SDK 51) and its real surface is a
 * device/simulator. This driver reaches the layer the discovery + AI PRs
 * actually touch — pure TS modules with no React Native runtime imports — and
 * drives them with real curated data, printing observable output.
 *
 * Run it (from mobile/):
 *   node_modules/.bin/esbuild .claude/skills/run-peakplant-mobile/driver.ts \
 *     --bundle --platform=node --format=esm | node --input-type=module
 *
 * What it exercises (the b7e83e1..HEAD changes):
 *   - openMeteo.ts        WMO mapping, constraint mapping, the live fetch
 *   - weatherContext.ts   enrichWithLiveWeather (user-wins / applied / no-op)
 *   - recommend.ts        rankedCandidates curated pool
 *   - aiRecommend.ts      mergeAiRanking anti-fabrication + why override
 *
 * It does NOT (cannot, headless + egress-blocked) drive the GUI, the deployed
 * Edge Function, or the live Anthropic call. See SKILL.md "On-device path".
 */

import {
  mapWmoCode,
  isOutdoorFriendly,
  toConstraintWeather,
  toLiveWeather,
  openMeteoWeather,
  INNSBRUCK,
} from '../../../lib/discovery/providers/openMeteo';
import { enrichWithLiveWeather } from '../../../lib/discovery/weatherContext';
import { rankedCandidates } from '../../../lib/discovery/recommend';
import { mergeAiRanking, AI_WHY_MAX, type AiPick } from '../../../lib/ai/aiRecommend';
import type { IWeatherProvider, LiveWeather, ProviderResult } from '../../../lib/discovery/providers/interface';
import type { DateConstraints } from '../../../lib/discovery/types';

const hr = (t: string) => console.log(`\n${'='.repeat(4)} ${t} ${'='.repeat(Math.max(0, 56 - t.length))}`);

function fakeProvider(result: ProviderResult<LiveWeather>): IWeatherProvider {
  return { id: 'fake', configured: () => true, getCurrent: async () => result };
}

async function main() {
  console.log('PeakPlant discovery/AI driver — driving real modules with real data\n');

  // 1. WMO weather-code mapping (pure) ------------------------------------
  hr('1. Open-Meteo WMO mapping (openMeteo.ts)');
  const codes = [0, 2, 45, 61, 71, 95, 999];
  for (const code of codes) {
    const cond = mapWmoCode(code);
    const live = toLiveWeather({ temperature_2m: 8, apparent_temperature: 6, weather_code: code });
    console.log(
      `  wmo=${String(code).padEnd(3)} -> condition=${cond.padEnd(8)} ` +
        `outdoorFriendly(@8C)=${String(isOutdoorFriendly(cond, 8)).padEnd(5)} ` +
        `constraintWeather=${toConstraintWeather(live)}`,
    );
  }

  // 2. The real live provider against Innsbruck ---------------------------
  hr('2. Real openMeteoWeather.getCurrent(INNSBRUCK)');
  console.log(`  configured()=${openMeteoWeather.configured()}  coords=${JSON.stringify(INNSBRUCK)}`);
  const live = await openMeteoWeather.getCurrent(INNSBRUCK);
  if (live.ok) {
    console.log(`  LIVE: ${live.data.condition} ${live.data.tempC}C (feels ${live.data.feelsLikeC}C) ` +
      `outdoorFriendly=${live.data.outdoorFriendly} src=${live.data.sourceId}`);
  } else {
    console.log(`  honest failure -> reason="${live.reason}" (degrades to "no weather signal")`);
  }

  // 3. enrichWithLiveWeather contract -------------------------------------
  hr('3. enrichWithLiveWeather (weatherContext.ts)');
  const base: DateConstraints = { spaceType: 'couple' };
  const sunny: LiveWeather = {
    condition: 'sunny', tempC: 21, outdoorFriendly: true,
    provenance: 'live', fetchedAt: new Date().toISOString(), sourceId: 'fake',
  };
  const applied = await enrichWithLiveWeather(base, { provider: fakeProvider({ ok: true, data: sunny }) });
  console.log(`  no user pref + sunny provider  -> usedLiveWeather=${applied.usedLiveWeather} weather=${applied.constraints.weather}`);
  const userWins = await enrichWithLiveWeather({ ...base, weather: 'rain' }, { provider: fakeProvider({ ok: true, data: sunny }) });
  console.log(`  user picked 'rain' + sunny prov-> usedLiveWeather=${userWins.usedLiveWeather} weather=${userWins.constraints.weather} (user wins)`);
  const realProv = await enrichWithLiveWeather(base);
  console.log(`  real provider (this env)       -> usedLiveWeather=${realProv.usedLiveWeather} weather=${realProv.constraints.weather ?? '(none)'}`);

  // 4. Curated candidate pool ---------------------------------------------
  hr('4. rankedCandidates curated pool (recommend.ts)');
  const constraints: DateConstraints = { spaceType: 'couple', timeOfDay: 'evening', weather: applied.constraints.weather };
  const pool = rankedCandidates(constraints, 6);
  console.log(`  constraints=${JSON.stringify(constraints)} -> ${pool.length} candidates:`);
  pool.forEach((c, i) =>
    console.log(`    ${i + 1}. [${c.momentId}] ${c.title}  (${c.facts.length} curated facts, why="${c.why.slice(0, 40)}...")`),
  );

  // 5. AI merge: anti-fabrication + why override --------------------------
  hr('5. mergeAiRanking anti-fabrication (aiRecommend.ts)');
  if (pool.length >= 2) {
    const picks: AiPick[] = [
      { momentId: pool[1].momentId, why: 'Reordered to #1 by the model with a warm, personalized line.', signalsUsed: ['evening mood'] },
      { momentId: pool[0].momentId, why: '   ' /* whitespace -> should fall back to curated why */ },
      { momentId: 'fabricated-venue-the-model-invented', why: 'A place that does not exist in the catalog.' },
      { momentId: pool[1].momentId, why: 'duplicate id -> should be deduped' },
    ];
    // Distinct id so the length-cap path is genuinely exercised (not deduped away).
    const longWhy = { momentId: pool[2].momentId, why: 'x'.repeat(AI_WHY_MAX + 50) };
    const merged = mergeAiRanking(pool, [...picks, longWhy], 4);
    console.log(`  fed ${picks.length + 1} picks (1 fabricated id, 1 dup, 1 whitespace why, 1 over-length why); AI_WHY_MAX=${AI_WHY_MAX}`);
    console.log(`  -> ${merged.length} merged results (fabricated id dropped, deduped):`);
    merged.forEach((m, i) =>
      console.log(`    ${i + 1}. [${m.momentId}] ${m.title}  why.len=${m.why.length}  facts=${m.facts.length}  alt=${m.isAlternative ?? false}`),
    );
    const fabricated = merged.find((m) => m.momentId === 'fabricated-venue-the-model-invented');
    console.log(`  fabricated id present in output? ${fabricated ? 'YES (BUG)' : 'no (correct — model cannot invent ideas)'}`);
    const overLen = merged.find((m) => m.why.length > AI_WHY_MAX);
    console.log(`  any why over AI_WHY_MAX? ${overLen ? 'YES (BUG)' : 'no (correct — capped)'}`);
  } else {
    console.log('  (need >=2 candidates to demo reorder; pool too small for these constraints)');
  }

  console.log('\nDONE — drove openMeteo, weatherContext, recommend, aiRecommend end to end.');
}

main().catch((e) => {
  console.error('DRIVER ERROR:', e);
  process.exit(1);
});
