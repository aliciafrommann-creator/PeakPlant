/**
 * PeakPlant — Date Discovery Edge Function.
 *
 * Contract (AI_SAFETY):
 *   Mobile client (authenticated; JWT verified by the Supabase gateway)
 *     → sends structured constraints + a pool of CURATED candidate ideas
 *       (momentId, title, concept only — no prices, venues or facts)
 *     → this function asks Claude ONLY to reorder the candidates and write a
 *       warm one-sentence "why" per pick (forced structured tool output)
 *     → server validates every returned id against the candidate pool (the model
 *       cannot introduce an idea that was not sent) and returns { picks }.
 *   The client (lib/ai/aiRecommend.ts) re-attaches all curated facts/prices/
 *   places. Net result: the model never invents a venue, price or opening hour.
 *
 * Secrets: ANTHROPIC_API_KEY lives ONLY here (Edge Function secret), never in the
 * mobile client. Optional ANTHROPIC_MODEL overrides the default model.
 *
 * If ANTHROPIC_API_KEY is absent the function returns 501 so the client falls
 * back to the deterministic curated recommender — the app always works.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const GOOGLE_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const MAX_CANDIDATES = 8;
const MAX_PICKS = 4;
const MAX_LIVE_PLACES = 8;
const DEFAULT_LIVE_PLACE_RADIUS_KM = 3;
const MAX_LIVE_PLACE_RADIUS_KM = 8;

interface Candidate {
  momentId: string;
  title: string;
  concept: string;
}

interface Pick {
  momentId: string;
  why?: string;
  signalsUsed?: string[];
}

interface GeoCoords {
  lat: number;
  lng: number;
}

interface LivePlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category?: string;
  mapsUrl?: string;
  aiWhy?: string;
  signalsUsed?: string[];
  provenance: 'live';
  fetchedAt: string;
  sourceId: string;
}

interface PlacePick {
  placeId: string;
  why?: string;
  signalsUsed?: string[];
}

interface GoogleTextPlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  primaryType?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/** Keep only well-formed candidates, capped. */
function cleanCandidates(input: unknown): Candidate[] {
  if (!Array.isArray(input)) return [];
  const out: Candidate[] = [];
  for (const c of input) {
    if (
      c &&
      typeof c.momentId === 'string' &&
      typeof c.title === 'string' &&
      typeof c.concept === 'string'
    ) {
      out.push({
        momentId: c.momentId,
        title: c.title.slice(0, 120),
        concept: c.concept.slice(0, 280),
      });
    }
    if (out.length >= MAX_CANDIDATES) break;
  }
  return out;
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? input as Record<string, unknown> : {};
}

function cleanCoords(input: unknown): GeoCoords | null {
  const record = asRecord(input);
  const lat = Number(record.lat);
  const lng = Number(record.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function cleanLivePlaceQuery(input: unknown): string {
  const raw = typeof input === 'string'
    ? input
    : 'romantic cafes parks museums viewpoints date spots';
  const clean = raw.replace(/\s+/g, ' ').trim();
  return (clean || 'romantic cafes parks museums viewpoints date spots').slice(0, 100);
}

function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}

function googlePlacesToLivePlaces(input: unknown, fetchedAt: string): LivePlace[] {
  const places = Array.isArray((input as { places?: unknown })?.places)
    ? (input as { places: GoogleTextPlace[] }).places
    : [];
  return places
    .map((place) => {
      const lat = Number(place.location?.latitude);
      const lng = Number(place.location?.longitude);
      const googleId = typeof place.id === 'string' ? place.id : '';
      const name = typeof place.displayName?.text === 'string' ? place.displayName.text : '';
      if (!googleId || !name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return {
        id: `google:${googleId}`,
        name: name.slice(0, 120),
        address: typeof place.formattedAddress === 'string'
          ? place.formattedAddress.slice(0, 180)
          : 'near you',
        lat,
        lng,
        category: typeof place.primaryType === 'string' ? place.primaryType : undefined,
        mapsUrl: googleMapsUrl(lat, lng),
        provenance: 'live' as const,
        fetchedAt,
        sourceId: 'google-places-text-search',
      };
    })
    .filter((place): place is LivePlace => Boolean(place))
    .slice(0, MAX_LIVE_PLACES);
}

async function rankLivePlacesWithAI(
  apiKey: string | undefined,
  model: string,
  constraints: unknown,
  places: LivePlace[],
): Promise<LivePlace[]> {
  if (!apiKey || places.length < 2) return places;

  const placeIds = new Set(places.map((place) => place.id));
  const tool = {
    name: 'rank_live_places',
    description: 'Return the best ordering of real provider-returned places with a warm reason for each.',
    input_schema: {
      type: 'object',
      properties: {
        picks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              placeId: { type: 'string', description: 'One of the provided place ids.' },
              why: { type: 'string', description: 'One warm, specific sentence (<180 chars).' },
              signalsUsed: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['placeId', 'why'],
          },
        },
      },
      required: ['picks'],
    },
  };

  const system =
    'You help sort real nearby places for a date. You are given ONLY places ' +
    'already returned by Google Places. STRICT RULES: choose only provided ' +
    'placeIds; never invent a venue, address, price, rating or opening hour; ' +
    'do not claim a place is open; keep each why warm and under 180 characters.';

  const userContent =
    'Constraints (JSON):\n' +
    JSON.stringify(asRecord(constraints)) +
    '\n\nPlaces (JSON):\n' +
    JSON.stringify(places.map((place) => ({
      placeId: place.id,
      name: place.name,
      address: place.address,
      category: place.category,
    })));

  try {
    const aiResp = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 900,
        system,
        tools: [tool],
        tool_choice: { type: 'tool', name: 'rank_live_places' },
        messages: [{ role: 'user', content: userContent }],
      }),
    });
    if (!aiResp.ok) return places;

    const data = await aiResp.json();
    const block = Array.isArray(data?.content)
      ? data.content.find((b: { type?: string; name?: string }) => b.type === 'tool_use' && b.name === 'rank_live_places')
      : undefined;
    const rawPicks: unknown = block?.input?.picks;
    const picks: PlacePick[] = Array.isArray(rawPicks)
      ? (rawPicks as PlacePick[])
          .filter((pick) => pick && typeof pick.placeId === 'string' && placeIds.has(pick.placeId))
          .slice(0, places.length)
      : [];
    if (picks.length === 0) return places;

    const byId = new Map(places.map((place) => [place.id, place]));
    const ranked: LivePlace[] = [];
    for (const pick of picks) {
      const place = byId.get(pick.placeId);
      if (!place) continue;
      ranked.push({
        ...place,
        aiWhy: typeof pick.why === 'string' ? pick.why.slice(0, 220) : undefined,
        signalsUsed: Array.isArray(pick.signalsUsed)
          ? pick.signalsUsed.filter((signal): signal is string => typeof signal === 'string').slice(0, 5)
          : undefined,
      });
      byId.delete(pick.placeId);
    }
    return [...ranked, ...byId.values()];
  } catch {
    return places;
  }
}

async function handleLivePlaces(body: Record<string, unknown>): Promise<Response> {
  const googleKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  if (!googleKey) {
    return json({
      error: 'not_configured',
      reason: 'not_configured',
      places: [],
      message: 'GOOGLE_PLACES_API_KEY is not set. Client will use curated places.',
    });
  }

  const near = cleanCoords(body.near);
  if (!near) return json({ error: 'bad_request', message: 'near.lat/lng required.' }, 400);

  const query = cleanLivePlaceQuery(body.query);
  const radiusKm = clampNumber(
    body.radiusKm,
    DEFAULT_LIVE_PLACE_RADIUS_KM,
    0.5,
    Number(Deno.env.get('LIVE_PLACES_MAX_RADIUS_KM')) || MAX_LIVE_PLACE_RADIUS_KM,
  );
  const limit = Math.round(clampNumber(
    body.limit,
    6,
    1,
    Math.min(MAX_LIVE_PLACES, Number(Deno.env.get('LIVE_PLACES_MAX_RESULTS')) || MAX_LIVE_PLACES),
  ));
  const fetchedAt = new Date().toISOString();

  try {
    const googleResp = await fetch(GOOGLE_TEXT_SEARCH_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-Goog-Api-Key': googleKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.primaryType',
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: limit,
        locationBias: {
          circle: {
            center: { latitude: near.lat, longitude: near.lng },
            radius: radiusKm * 1000,
          },
        },
      }),
    });

    if (googleResp.status === 429) {
      return json({ error: 'rate_limited', reason: 'rate_limited', places: [] });
    }
    if (!googleResp.ok) {
      return json({ error: 'network_error', reason: 'network_error', places: [], status: googleResp.status });
    }

    const googleData = await googleResp.json();
    const places = googlePlacesToLivePlaces(googleData, fetchedAt);
    if (places.length === 0) {
      return json({ error: 'no_results', reason: 'no_results', places: [] });
    }

    const model = Deno.env.get('ANTHROPIC_MODEL') ?? DEFAULT_MODEL;
    const ranked = await rankLivePlacesWithAI(
      Deno.env.get('ANTHROPIC_API_KEY') ?? undefined,
      model,
      body.constraints,
      places,
    );

    return json({
      places: ranked,
      source: 'google-places-text-search',
      ai: ranked.some((place) => Boolean(place.aiWhy)),
      fetchedAt,
      radiusKm,
      limit,
    });
  } catch {
    return json({ error: 'network_error', reason: 'network_error', places: [] });
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return json({ error: 'bad_request', message: 'Body must be JSON.' }, 400);
  }

  const recordBody = asRecord(rawBody);
  if (recordBody.mode === 'live_places') {
    return handleLivePlaces(recordBody);
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    // Not configured yet → client falls back to the deterministic recommender.
    return json(
      {
        error: 'not_implemented',
        message: 'ANTHROPIC_API_KEY is not set. Client will use the curated recommender.',
      },
      501,
    );
  }

  const body = recordBody as { constraints?: Record<string, unknown>; candidates?: unknown };

  const candidates = cleanCandidates(body.candidates);
  if (candidates.length === 0) {
    return json({ error: 'bad_request', message: 'No valid candidates provided.' }, 400);
  }

  // Only structured constraints reach the model — never raw conversational text.
  const constraints = body.constraints && typeof body.constraints === 'object' ? body.constraints : {};
  const candidateIds = new Set(candidates.map((c) => c.momentId));

  const model = Deno.env.get('ANTHROPIC_MODEL') ?? DEFAULT_MODEL;

  const system =
    'You help a couple or friends choose something to do together. You will be ' +
    'given a list of CANDIDATE ideas (each with an id, title and concept) and ' +
    'the current structured constraints. Your only job is to (1) order the ' +
    'candidates from best to least fitting for these constraints, and (2) write ' +
    'one warm, plain, specific sentence saying why each chosen idea fits. ' +
    'STRICT RULES: choose only from the provided candidate ids; never invent an ' +
    'idea, venue, price, address or opening time; do not mention anything not ' +
    'present in the candidate or constraints; keep each "why" under 200 ' +
    'characters; signalsUsed must be short truthful phrases referring only to ' +
    'the given constraints. Return at most ' + MAX_PICKS + ' picks via the tool.';

  const userContent =
    'Constraints (JSON):\n' +
    JSON.stringify(constraints) +
    '\n\nCandidates (JSON):\n' +
    JSON.stringify(candidates);

  const tool = {
    name: 'rank_dates',
    description: 'Return the best ordering of the provided candidate ideas with a warm reason for each.',
    input_schema: {
      type: 'object',
      properties: {
        picks: {
          type: 'array',
          description: 'Ordered best-first. Each id MUST be one of the provided candidate ids.',
          items: {
            type: 'object',
            properties: {
              momentId: { type: 'string', description: 'One of the provided candidate ids.' },
              why: { type: 'string', description: 'One warm, specific sentence (<200 chars).' },
              signalsUsed: {
                type: 'array',
                items: { type: 'string' },
                description: 'Short truthful phrases referring only to the constraints.',
              },
            },
            required: ['momentId', 'why'],
          },
        },
      },
      required: ['picks'],
    },
  };

  try {
    const aiResp = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system,
        tools: [tool],
        tool_choice: { type: 'tool', name: 'rank_dates' },
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    if (!aiResp.ok) {
      // Upstream error → let the client fall back to curated.
      return json({ error: 'upstream_error', status: aiResp.status, picks: [] }, 502);
    }

    const data = await aiResp.json();
    const block = Array.isArray(data?.content)
      ? data.content.find((b: { type?: string; name?: string }) => b.type === 'tool_use' && b.name === 'rank_dates')
      : undefined;
    const rawPicks: unknown = block?.input?.picks;

    const picks: Pick[] = Array.isArray(rawPicks)
      ? (rawPicks as Pick[])
          // Hard guarantee: only ids we actually sent survive.
          .filter((p) => p && typeof p.momentId === 'string' && candidateIds.has(p.momentId))
          .slice(0, MAX_PICKS)
          .map((p) => ({
            momentId: p.momentId,
            why: typeof p.why === 'string' ? p.why.slice(0, 240) : undefined,
            signalsUsed: Array.isArray(p.signalsUsed)
              ? p.signalsUsed.filter((s): s is string => typeof s === 'string').slice(0, 6)
              : undefined,
          }))
      : [];

    return json({ picks, source: 'ai', model });
  } catch (_err) {
    return json({ error: 'function_error', picks: [] }, 500);
  }
});
