/**
 * PeakPlant — Push-Versand (P2.1).
 *
 * Wird von einem Supabase-Datenbank-Webhook aufgerufen, wenn
 *   a) ein Moment entsteht  (INSERT auf `memories`)        → „ein neuer Moment"
 *   b) jemand beitritt      (INSERT auf `space_members`)   → „ihr seid zu zweit"
 *
 * Die Regeln sind dieselben wie in der App (mobile/lib/notifications/policy.ts,
 * freigegeben von Alicia am 17.08.2026) und werden hier NOCH EINMAL geprüft —
 * nicht aus Misstrauen gegenüber der App, sondern weil dieser Weg gar nicht
 * durch die App führt: Der Auslöser ist die Datenbank, das Ziel ist das Handy
 * des anderen Menschen.
 *
 *   1. Höchstens EINE Zustellung pro Space und Tag, über alle Anlässe hinweg.
 *      Gezählt wird in `push_deliveries` — der einzigen Wahrheit, die alle
 *      Geräte eines Paares gemeinsam haben.
 *   2. Nichts zwischen 22 und 8 Uhr.
 *   3. Nie Inhalt: weder Notiz noch Kartenfrage noch Foto verlassen diese
 *      Funktion. Der Text ist fest verdrahtet (PP-031) — der Sperrbildschirm
 *      ist eine öffentliche Fläche.
 *   4. Wer den Moment ausgelöst hat, bekommt keine Nachricht darüber.
 *
 * Secrets (Edge-Function-Secrets, niemals im Client):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — von Supabase gesetzt
 *   PUSH_WEBHOOK_SECRET                       — Header `x-webhook-secret`
 *
 * Fehlt das Secret, antwortet die Funktion 503 und sendet nichts. Ein offener
 * Push-Endpunkt wäre ein Megafon für jeden, der die URL kennt.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Zeitzone der Nachtruhe. Bewusst fest: die App speichert keine Zeitzone der
 * Nutzer, und eine erfundene wäre schlechter als eine benannte Annahme. Für
 * den deutschsprachigen Start stimmt sie; sobald Paare außerhalb dieser Zone
 * dabei sind, gehört eine Spalte `profiles.timezone` her — bis dahin steht die
 * Annahme hier, sichtbar, statt unsichtbar im Verhalten.
 */
const ASSUMED_TZ = 'Europe/Berlin';
const QUIET_FROM = 22;
const QUIET_TO = 8;

type Category = 'partner_activity';

function localHour(now: Date): number {
  const s = new Intl.DateTimeFormat('en-GB', {
    timeZone: ASSUMED_TZ,
    hour: '2-digit',
    hour12: false,
  }).format(now);
  return Number.parseInt(s, 10);
}

function inQuietHours(now: Date): boolean {
  const h = localHour(now);
  return h >= QUIET_FROM || h < QUIET_TO;
}

/** Die zwei erlaubten Texte. Nehmen bewusst keinen Inhalt entgegen. */
function body(kind: 'moment' | 'joined'): string {
  return kind === 'moment'
    ? 'In eurem Space liegt ein neuer Moment.'
    : 'Ihr seid jetzt zu zweit in eurem Space.';
}

async function sql(path: string, init?: RequestInit): Promise<Response> {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      apikey: key!,
      Authorization: `Bearer ${key}`,
      ...(init?.headers ?? {}),
    },
  });
}

serve(async (req: Request) => {
  const secret = Deno.env.get('PUSH_WEBHOOK_SECRET');
  if (!secret) {
    console.error('[push-notify] PUSH_WEBHOOK_SECRET not set — refusing to send');
    return new Response(JSON.stringify({ error: 'not configured' }), { status: 503 });
  }
  if (req.headers.get('x-webhook-secret') !== secret) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
  }

  let payload: { table?: string; record?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'bad payload' }), { status: 400 });
  }

  const record = payload.record ?? {};
  const spaceId = record.space_id as string | undefined;
  if (!spaceId) return new Response(JSON.stringify({ skipped: 'no space' }), { status: 200 });

  const kind: 'moment' | 'joined' = payload.table === 'space_members' ? 'joined' : 'moment';
  /** Wer es ausgelöst hat — bekommt selbst nichts. */
  const actor = (record.created_by ?? record.user_id) as string | undefined;

  const now = new Date();
  if (inQuietHours(now)) {
    // Bewusst verworfen statt nachts zugestellt. Beides — der Moment und der
    // Beitritt — steht am Morgen ohnehin in der App; ein Telefon, das um drei
    // Uhr wegen einer Beziehungs-App leuchtet, wäre der schlechtere Tausch.
    // (Eine Warteschlange mit Morgen-Versand wäre die Kür; sie steht als
    // eigener Punkt im Backlog, damit sie nicht heimlich hier entsteht.)
    console.info('[push-notify] quiet hours — nothing sent for space', spaceId);
    return new Response(JSON.stringify({ skipped: 'quiet_hours' }), { status: 200 });
  }

  // Regel 1: höchstens eine Zustellung pro Space und Tag.
  const since = new Date(now);
  since.setHours(0, 0, 0, 0);
  const delivered = await sql(
    `push_deliveries?space_id=eq.${spaceId}&delivered_at=gte.${since.toISOString()}&select=id`,
  );
  if (delivered.ok) {
    const rows = await delivered.json();
    if (Array.isArray(rows) && rows.length >= 1) {
      console.info('[push-notify] daily cap reached for space', spaceId);
      return new Response(JSON.stringify({ skipped: 'daily_cap' }), { status: 200 });
    }
  } else {
    // Ohne Protokoll ist die Obergrenze nicht prüfbar — dann lieber nichts
    // senden als womöglich zum fünften Mal. Fail-closed.
    console.error('[push-notify] delivery log unreadable:', delivered.status);
    return new Response(JSON.stringify({ skipped: 'log_unavailable' }), { status: 200 });
  }

  // Empfänger: alle anderen Mitglieder des Space.
  const membersRes = await sql(`space_members?space_id=eq.${spaceId}&select=user_id`);
  if (!membersRes.ok) {
    console.error('[push-notify] members unreadable:', membersRes.status);
    return new Response(JSON.stringify({ error: 'members' }), { status: 500 });
  }
  const members = (await membersRes.json()) as { user_id: string }[];
  const recipients = members.map(m => m.user_id).filter(id => id !== actor);
  if (recipients.length === 0) {
    return new Response(JSON.stringify({ skipped: 'no recipient' }), { status: 200 });
  }

  const tokensRes = await sql(
    `push_tokens?user_id=in.(${recipients.join(',')})&select=token`,
  );
  const tokens = tokensRes.ok
    ? ((await tokensRes.json()) as { token: string }[]).map(t => t.token)
    : [];
  if (tokens.length === 0) {
    return new Response(JSON.stringify({ skipped: 'no device' }), { status: 200 });
  }

  const messages = tokens.map(to => ({
    to,
    title: 'PeakPlant',
    body: body(kind),
    // Nur die Kategorie — keine Moment-Id, keine Notiz, kein Foto.
    data: { category: 'partner_activity' as Category },
  }));

  const sent = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });
  if (!sent.ok) {
    console.error('[push-notify] expo rejected:', sent.status, (await sent.text()).slice(0, 300));
    return new Response(JSON.stringify({ error: 'send failed' }), { status: 502 });
  }

  // Erst protokollieren, wenn wirklich etwas rausging — sonst würde ein
  // fehlgeschlagener Versuch das Tageskontingent verbrauchen.
  await sql('push_deliveries', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ space_id: spaceId, category: 'partner_activity' }),
  });

  return new Response(JSON.stringify({ sent: tokens.length }), { status: 200 });
});
