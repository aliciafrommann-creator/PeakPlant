/**
 * PeakPlant — Date Discovery Edge Function (stub).
 *
 * Architecture:
 *   Mobile client → this function (auth header checked by Supabase gateway)
 *   → validate + resolve personalization signals
 *   → retrieve candidates (curated catalog, later: Places/Events APIs)
 *   → Claude Sonnet (structured output) for ranking + plain-language explanation
 *   → post-validate (provenance check: every fact must have a source; nothing
 *     can be `verified-live` unless confirmed by a live API call in this request)
 *   → return DateRecommendation[] to the client.
 *
 * Provider key (ANTHROPIC_API_KEY) lives here only — never in the mobile client.
 * All preferences/signals come from the caller's verified JWT; no raw note text
 * is passed to the AI (AI_SAFETY). Sensitive inferences prohibited (PP-014).
 *
 * This stub returns HTTP 501 so the mobile client falls back to nullDiscovery
 * (the deterministic recommender in lib/discovery/recommend.ts) gracefully.
 * Replace the body below with the real implementation once:
 *   1. supabase/migrations/0005_date_discovery.sql is applied.
 *   2. ANTHROPIC_API_KEY secret is set: `supabase secrets set ANTHROPIC_API_KEY=…`
 *   3. The function is deployed: `supabase functions deploy discover`
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  return new Response(
    JSON.stringify({
      error: 'not_implemented',
      message:
        'The AI-powered discover function is not yet deployed. The mobile client will use the deterministic curated recommender instead.',
    }),
    {
      status: 501,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    },
  );
});
