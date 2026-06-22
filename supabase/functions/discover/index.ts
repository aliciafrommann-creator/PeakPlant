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
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const MAX_CANDIDATES = 8;
const MAX_PICKS = 4;

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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
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

  let body: { constraints?: Record<string, unknown>; candidates?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request', message: 'Body must be JSON.' }, 400);
  }

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
