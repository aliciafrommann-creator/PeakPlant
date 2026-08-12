import { Resend } from 'resend'

/**
 * One place that sends mail.
 *
 * Five routes used to construct their own Resend client, which meant swapping
 * provider touched five files and every one of them reported success whether
 * or not the mail actually left. Both problems live here now: the provider is
 * chosen from the environment, and every send returns an honest result.
 *
 * Provider is picked by which key is present, Brevo first:
 *   BREVO_API_KEY   → Brevo (api.brevo.com/v3/smtp/email)
 *   RESEND_API_KEY  → Resend
 *   neither         → nothing is sent, and the result says so
 *
 * Whichever provider you use, the sending domain (peak-plant.com) has to be
 * verified there via DNS or the provider rejects the message.
 */

export const DEFAULT_FROM = 'peakplant <hello@peak-plant.com>'

export type MailProvider = 'brevo' | 'resend'

export interface MailInput {
  to: string
  subject: string
  /** At least one of html/text must be set. */
  html?: string
  text?: string
  /** "Name <addr@host>" or a bare address. Defaults to DEFAULT_FROM. */
  from?: string
  replyTo?: string
}

export interface MailResult {
  /** True only when the provider accepted the message. Never optimistic. */
  sent: boolean
  provider: MailProvider | null
  error?: string
}

/** Which provider this deployment will use, or null if none is configured. */
export function mailProvider(): MailProvider | null {
  if (process.env.BREVO_API_KEY) return 'brevo'
  if (process.env.RESEND_API_KEY) return 'resend'
  return null
}

/**
 * Splits `peakplant <hello@peak-plant.com>` into its parts. Brevo wants name
 * and address as separate fields; Resend takes the combined string.
 */
export function parseFrom(from: string): { name?: string; email: string } {
  const match = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  if (match) {
    const name = match[1].trim()
    return { name: name || undefined, email: match[2].trim() }
  }
  return { email: from.trim() }
}

async function sendViaBrevo(input: MailInput, from: string): Promise<MailResult> {
  const sender = parseFrom(from)
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY as string,
      'content-type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({
      sender: sender.name ? { name: sender.name, email: sender.email } : { email: sender.email },
      to: [{ email: input.to }],
      subject: input.subject,
      ...(input.html ? { htmlContent: input.html } : {}),
      ...(input.text ? { textContent: input.text } : {}),
      ...(input.replyTo ? { replyTo: { email: input.replyTo } } : {}),
    }),
  })

  if (!res.ok) {
    // Read the body: Brevo explains refusals here (unverified sender domain,
    // quota reached, malformed payload). Swallowing it would leave us guessing.
    const detail = await res.text().catch(() => '')
    return { sent: false, provider: 'brevo', error: `brevo ${res.status}: ${detail.slice(0, 300)}` }
  }
  return { sent: true, provider: 'brevo' }
}

async function sendViaResend(input: MailInput, from: string): Promise<MailResult> {
  const resend = new Resend(process.env.RESEND_API_KEY as string)
  // The SDK reports refusals in `error` instead of throwing, so checking only
  // for exceptions would call a rejected mail a success.
  const res = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    ...(input.html ? { html: input.html } : {}),
    ...(input.text ? { text: input.text } : {}),
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
  } as Parameters<typeof resend.emails.send>[0])

  if (res.error) {
    return { sent: false, provider: 'resend', error: `resend: ${res.error.message ?? String(res.error)}` }
  }
  return { sent: true, provider: 'resend' }
}

/**
 * Sends one mail. Never throws — callers get a result they can report on.
 * Failures are logged server-side with the provider's own message.
 */
export async function sendMail(input: MailInput): Promise<MailResult> {
  const provider = mailProvider()
  const from = input.from ?? DEFAULT_FROM

  if (!provider) {
    const error = 'no mail provider configured (set BREVO_API_KEY or RESEND_API_KEY)'
    console.error('[mail]', error, '— not sent:', input.subject)
    return { sent: false, provider: null, error }
  }
  if (!input.html && !input.text) {
    const error = 'mail has neither html nor text body'
    console.error('[mail]', error, '—', input.subject)
    return { sent: false, provider, error }
  }

  try {
    const result = provider === 'brevo'
      ? await sendViaBrevo(input, from)
      : await sendViaResend(input, from)
    if (!result.sent) console.error('[mail] not sent:', result.error)
    return result
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[mail] send threw:', error)
    return { sent: false, provider, error }
  }
}
