import { NextResponse } from 'next/server'
import { Resend } from 'resend'

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

function newsletterBody(month: string, year: number, edition: string, recipientEmail: string): string {
  const unsubUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peakplant.com'}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
  return `this is the peakplant monthly.
${edition} drops soon.

safe. soft. wild.
∧ peakplant

—
unsubscribe: ${unsubUrl}`
}

export async function POST(req: Request) {
  // Protect with secret key
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.NEWSLETTER_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const resendKey = process.env.RESEND_API_KEY

  if (!supabaseUrl || !resendKey) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
  }

  // Fetch active subscribers (use service role key if available, else anon)
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

  // Send individually so each gets a personalised unsubscribe link
  for (const { email } of subscribers) {
    try {
      await resend.emails.send({
        from: 'hello@peakplant.com',
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

  // Log the send
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

// Allow Vercel cron (GET with Authorization header isn't standard — cron hits GET)
export async function GET(req: Request) {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  // We reuse NEWSLETTER_SECRET for simplicity
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.NEWSLETTER_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return POST(req)
}
