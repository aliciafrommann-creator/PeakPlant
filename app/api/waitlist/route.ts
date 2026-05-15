import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    const sanitized = email.trim().toLowerCase()
    console.log(`[PeakPlant Waitlist] ${new Date().toISOString()} — ${sanitized}`)

    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const { Resend } = await import('resend')
      const resend = new Resend(apiKey)
      await resend.emails.send({
        from: 'PeakPlant <onboarding@resend.dev>',
        to: [process.env.OWNER_EMAIL ?? 'hello@peakplant.com'],
        subject: `New waitlist signup: ${sanitized}`,
        html: `<p>New PeakPlant waitlist signup:<br><strong>${sanitized}</strong></p><p><small>${new Date().toISOString()}</small></p>`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Waitlist] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
