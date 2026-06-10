import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createHmac } from 'crypto'

function supabaseHeaders(useServiceKey = false) {
  const key = useServiceKey
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
  }
}

function makeUnsubToken(email: string): string {
  const secret = process.env.NEWSLETTER_SECRET ?? process.env.CRON_SECRET ?? 'dev-secret'
  return createHmac('sha256', secret).update(email).digest('base64url')
}

function newsletterBody(month: string, year: number, edition: string, recipientEmail: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peak-plant.com'
  const token = makeUnsubToken(recipientEmail)
  const unsubUrl = `${siteUrl}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}&token=${encodeURIComponent(token)}`
  return `this is the peakplant monthly.
${edition} drops soon.

safe. soft. wild.
∧ peakplant

—
unsubscribe: ${unsubUrl}`
}

async function sendNewsletter(): Promise<NextResponse> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const resendKey = process.env.RESEND_API_KEY

  if (!supabaseUrl || !resendKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const subsRes = await fetch(
    `${supabaseUrl}/rest/v1/subscribers?status=eq.active&select=email`,
    { headers: supabaseHeaders(!!process.env.SUPABASE_SERVICE_ROLE_KEY) }
  )
  if (!subsRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
  const subscribers: { email: string }[] = await subsRes.json()
  if (subscribers.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No active subscribers' })
  }

  const now = new Date()
  const month = now.toLocaleString('en', { month: 'long' })
  const year = now.getFullYear()
  const subject = `∧ peakplant — ${month} ${year}`
  const edition = 'edition 01'

  const resend = new Resend(resendKey)
  let sent = 0
  const errors: string[] = []

  for (const { email } of subscribers) {
    try {
      await resend.emails.send({
        from: 'alicia@peak-plant.com',
        to: email,
        subject,
        text: newsletterBody(month, year, edition, email),
      })
      sent++
    } catch (err) {
      errors.push(email)
      console.error('[Newsletter] Failed to send to', email, err)
    }
  }

  await fetch(`${supabaseUrl}/rest/v1/newsletter_sends`, {
    method: 'POST',
    headers: {
      ...supabaseHeaders(!!process.env.SUPABASE_SERVICE_ROLE_KEY),
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ subject, recipient_count: sent, edition }),
  })

  return NextResponse.json({ sent, errors: errors.length > 0 ? errors : undefined })
}

function isAuthorized(req: Request): boolean {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.NEWSLETTER_SECRET ?? process.env.CRON_SECRET
  return !!secret && auth === `Bearer ${secret}`
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return sendNewsletter()
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return sendNewsletter()
}
