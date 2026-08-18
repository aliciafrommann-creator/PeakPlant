'use client'

import { useEffect, useState } from 'react'
import { NavBar } from '../../../components/NavBar'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'
const INK = '#1A1A1A'
const PAPER = '#FBFAF7'
const CREAM = '#F7F2E8'
const CREAM_EDGE = '#EFE6D4'
const TERRACOTTA = '#B5532E'
const BODY = '#555'
const SUBTLE = '#726D65'

/** Muss mit lib/invite.ts und der DB-Constraint aus Migration 0008 übereinstimmen. */
const INVITE_CODE_PATTERN = /^PEAK-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/

type Locale = 'de' | 'en'

const COPY = {
  de: {
    eyebrow: 'du wurdest eingeladen',
    title: 'jemand möchte ein gemeinsames Tagebuch mit dir teilen.',
    what:
      'PeakPlant ist ein privater Ort für zwei Menschen: ihr macht etwas zusammen, haltet es mit einem Foto und ein paar Worten fest, und es bleibt bei euch. Keine Likes, keine Profile, nichts Öffentliches.',
    codeLabel: 'dein Einladungscode',
    keepIt: 'Heb ihn auf — er bleibt gültig.',
    haveApp: 'Du hast die App schon?',
    haveAppBody:
      'Dann öffne diesen Link nochmal auf dem Handy, auf dem PeakPlant installiert ist. Der Code steht danach von allein im richtigen Feld.',
    noApp: 'Du hast sie noch nicht?',
    noAppBody:
      'Ehrlich gesagt: die App ist noch in geschlossener Beta, du kannst sie also gerade nicht einfach herunterladen. Trag hier deine Adresse ein — wir sehen dann, dass jemand auf dich wartet, und ihr kommt gemeinsam rein.',
    emailLabel: 'deine E-Mail-Adresse',
    cta: 'sag mir Bescheid',
    sending: 'einen Moment …',
    done: 'notiert. Wir melden uns, sobald ihr beide reinkommt.',
    dup: 'du stehst schon auf der Liste — wir melden uns.',
    fail: 'das hat gerade nicht geklappt. Versuch es bitte gleich nochmal.',
    badCode: 'Dieser Link sieht nicht nach einer Einladung aus.',
    badCodeBody:
      'Vielleicht ist beim Kopieren etwas verloren gegangen. Bitte die Person, die dich eingeladen hat, den Link noch einmal zu schicken.',
  },
  en: {
    eyebrow: 'you were invited',
    title: 'someone wants to share a private diary with you.',
    what:
      'PeakPlant is a private place for two people: you do something together, keep it with a photo and a few words, and it stays with you. No likes, no profiles, nothing public.',
    codeLabel: 'your invite code',
    keepIt: 'Keep it — it stays valid.',
    haveApp: 'Already have the app?',
    haveAppBody:
      'Open this link again on the phone that has PeakPlant installed. The code will fill itself in.',
    noApp: "Don't have it yet?",
    noAppBody:
      'Honestly: the app is still in closed beta, so you cannot simply download it right now. Leave your address here — we will see that someone is waiting for you, and you two get in together.',
    emailLabel: 'your email address',
    cta: 'let me know',
    sending: 'one moment …',
    done: 'noted. We will be in touch as soon as you both get in.',
    dup: 'you are already on the list — we will be in touch.',
    fail: "that didn't work just now. Please try again in a moment.",
    badCode: "this link doesn't look like an invitation.",
    badCodeBody:
      'Something may have been lost while copying. Ask the person who invited you to send the link again.',
  },
} satisfies Record<Locale, Record<string, string>>

export default function JoinClient({ code }: { code: string }) {
  const [locale, setLocale] = useState<Locale>('de')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('lang')
    if (param === 'de' || param === 'en') { setLocale(param); return }
    if (!navigator.language?.toLowerCase().startsWith('de')) setLocale('en')
  }, [])

  const t = COPY[locale]
  const normalized = code.trim().toUpperCase()
  const valid = INVITE_CODE_PATTERN.test(normalized)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    let finalStatus: typeof status = 'error'
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        /* Eigene Quelle: wer über einen echten Einladungslink kommt, hat
           bereits einen Menschen, der wartet. Diese Paare zuerst einladen —
           sie sind das Einzige, was den North Star bewegt.
           Der CODE geht bewusst NICHT mit: er ist ein Schlüssel zu einem
           privaten Tagebuch und hat auf einer Warteliste nichts verloren
           (MANIFESTO §2). Dass jemand wartet, sagt die Quelle schon. */
        body: JSON.stringify({ email, source: 'invite-link', locale }),
      })
      const data = await res.json()
      if (data.duplicate) finalStatus = 'duplicate'
      else if (res.ok) finalStatus = 'success'
    } catch { finalStatus = 'error' }
    finally { setStatus(finalStatus) }
  }

  return (
    <div style={{ fontFamily: PP, background: PAPER, color: INK, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar activePath="/beta" />

      <main
        lang={locale}
        style={{ flex: 1, width: '100%', maxWidth: 620, margin: '0 auto', padding: '48px 24px 80px' }}
      >
        {!valid ? (
          <>
            <h1 style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.25, margin: '0 0 16px' }}>
              {t.badCode}
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: BODY, margin: 0 }}>{t.badCodeBody}</p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: TERRACOTTA, margin: '0 0 20px' }}>
              {t.eyebrow}
            </p>
            <h1 style={{ fontSize: 30, fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
              {t.title}
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: BODY, margin: '0 0 36px' }}>{t.what}</p>

            <div style={{ background: CREAM, border: `1px solid ${CREAM_EDGE}`, borderRadius: 4, padding: '20px 22px', margin: '0 0 36px' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: SUBTLE, margin: '0 0 8px' }}>
                {t.codeLabel}
              </p>
              <p style={{ fontSize: 26, fontWeight: 300, letterSpacing: '0.14em', margin: '0 0 8px', fontVariantNumeric: 'tabular-nums' }}>
                {normalized}
              </p>
              <p style={{ fontSize: 13, lineHeight: 1.5, color: SUBTLE, margin: 0 }}>{t.keepIt}</p>
            </div>

            <h2 style={{ fontSize: 17, fontWeight: 500, margin: '0 0 8px' }}>{t.haveApp}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: BODY, margin: '0 0 32px' }}>{t.haveAppBody}</p>

            <h2 style={{ fontSize: 17, fontWeight: 500, margin: '0 0 8px' }}>{t.noApp}</h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: BODY, margin: '0 0 20px' }}>{t.noAppBody}</p>

            {status === 'success' || status === 'duplicate' ? (
              <p style={{ fontSize: 15, lineHeight: 1.6, color: TERRACOTTA, margin: 0 }}>
                {status === 'success' ? t.done : t.dup}
              </p>
            ) : (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
                <label htmlFor="join-email" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: SUBTLE }}>
                  {t.emailLabel}
                </label>
                <input
                  id="join-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    fontFamily: PP, fontSize: 16, padding: '12px 14px', minHeight: 48,
                    border: `1px solid ${CREAM_EDGE}`, borderRadius: 4, background: '#fff', color: INK,
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    fontFamily: PP, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase',
                    minHeight: 48, padding: '0 24px', border: 'none', borderRadius: 999,
                    background: INK, color: '#fff', cursor: status === 'loading' ? 'wait' : 'pointer',
                    alignSelf: 'flex-start',
                  }}
                >
                  {status === 'loading' ? t.sending : t.cta}
                </button>
                {status === 'error' && (
                  <p style={{ fontSize: 14, color: TERRACOTTA, margin: 0 }}>{t.fail}</p>
                )}
              </form>
            )}
          </>
        )}
      </main>
    </div>
  )
}
