'use client'
/**
 * /beta — der Aufruf an Beta-Testerinnen und Beta-Tester.
 *
 * Endpunkt: der BESTEHENDE /api/waitlist mit { email, source: 'beta', locale }.
 * Keine eigene Route, keine Migration. Die Route setzt daraus in Supabase
 * `source: 'beta-de'` bzw. `'beta-en'` — daraus liest der Monatsbrief spaeter
 * die Sprache. Genau deshalb ist die Sprachwahl unten nicht Kosmetik: sie
 * entscheidet, in welcher Sprache diese Person Post bekommt.
 *
 * Sprache: /beta liegt auf Root-Ebene, es gibt also kein [locale]-Segment, aus
 * dem sich die Sprache ableiten liesse. Der Brief verlinkt aus beiden Sprachen
 * auf dieselbe URL (app/letters/[slug]/page.tsx), deshalb traegt die Seite
 * beide Sprachen und einen sichtbaren Umschalter. Serverseitig rendert sie
 * englisch (eine URL, ein Snapshot fuer den Crawler); nach dem Hydrieren
 * schaltet sie fuer deutschsprachige Browser auf Deutsch — dieselbe
 * Accept-Language-Logik, die die Middleware fuer die Locale-Routen macht.
 *
 * Kein framer-motion: die Seite ist im Kern ein Formular. Die Motion-Signatur
 * der Site startet bei opacity 0 — bei fehlgeschlagenem JS waere das
 * Anmeldefeld unsichtbar.
 *
 * Kein useIsMobile(): der Hook liefert auf dem Server Desktop und korrigiert
 * sich erst nach dem Hydrieren. Die Seite ist einspaltig, skaliert ueber
 * clamp(), und das Formular ist ohnehin gestapelt.
 *
 * Farbe: BRAND.md nennt #1E1C1A als Dunkel; die Website ist real durchgaengig
 * auf #1A1A1A verdrahtet (NavBar, SiteFooter, .pp-cta). Gegen diese Chrome-
 * Flaechen waere ein zweites Warmschwarz eine sichtbare Kante — deshalb hier
 * bewusst #1A1A1A, wie auf /letters.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NavBar } from '../../components/NavBar'
import { SiteFooter } from '../../components/SiteFooter'
import type { Locale } from '../../lib/translations'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

/* Warme Papiertoene, EIN dominanter Akzent (chili). Terracotta erscheint
   ausschliesslich als Status (Fehlermeldung) — so sieht es BRAND.md fuer die
   Farbfamilie vor. */
const INK = '#1A1A1A'
const CHILI = '#CF4B2C'
const TERRACOTTA = '#B5532E'
const PAPER = '#FBFAF7'
const CREAM = '#F7F2E8'
const CREAM_EDGE = '#EFE6D4'
const BODY = '#555'
const SUBTLE = '#857F76'

type Copy = {
  eyebrow: string
  title: string
  lead: string
  reasonsLabel: string
  reasons: string[]
  formLabel: string
  emailLabel: string
  placeholder: string
  cta: string
  ctaLoading: string
  successMailed: string
  successPlain: string
  duplicate: string
  error: string
  privacyPre: string
  privacyLink: string
  privacyPost: string
  listNote: string
  openLabel: string
  open: string
}

/* Jeder Satz hier ist entweder eine Beschreibung dessen, was gebaut wird, oder
   ein offenes „wissen wir noch nicht". Kein Starttermin, keine Geraeteliste,
   keine Platzzahl, keine Gegenleistung — nichts davon ist entschieden, also
   steht nichts davon auf der Seite (MANIFESTO §1). */
const COPY: Record<Locale, Copy> = {
  de: {
    eyebrow: 'die beta',
    title: 'die app, bevor sie fertig ist.',
    lead: 'wir bauen einen privaten space für zwei: eine karte erleben, ihren QR-code scannen, ein foto und eine notiz behalten. bevor das jemand kauft, soll es jemand wirklich benutzt haben.',
    reasonsLabel: 'warum wir tester suchen',
    reasons: [
      'was sich im code richtig anfühlt, kann sich im echten leben falsch anfühlen. das merkt nur, wer die app mit seinem menschen benutzt.',
      'wir wollen wissen, wo es hakt, was nervt und was fehlt — ehrlich, nicht nett.',
      'was du siehst, ist unfertig. genau das ist der punkt.',
    ],
    formLabel: 'dabei sein',
    emailLabel: 'deine e-mail',
    placeholder: 'deine@email.com',
    cta: 'auf die beta-liste',
    ctaLoading: '...',
    successMailed: 'gut. wir haben deine adresse — und dir gerade eine mail geschickt. alicia meldet sich, sobald die beta losgeht.',
    successPlain: 'gut. wir haben deine adresse. alicia meldet sich, sobald die beta losgeht.',
    duplicate: 'du stehst schon auf der liste. genau über diese liste meldet sich alicia, wenn die beta losgeht — du musst nichts weiter tun.',
    error: 'das hat gerade nicht geklappt — deine adresse ist nicht gespeichert. bitte versuch es nochmal.',
    privacyPre: 'mit der anmeldung stimmst du unserer ',
    privacyLink: 'datenschutzerklärung',
    privacyPost: ' zu.',
    listNote: 'du landest auf derselben liste wie die warteliste — von dort kommt auch der monatliche brief. abmelden geht in jeder mail mit einem klick.',
    openLabel: 'was wir noch nicht sagen können',
    open: 'wann es losgeht, auf welchen geräten, wie viele menschen dabei sind und was es dafür gibt — das steht noch nicht fest. wir schreiben hier nichts hin, was wir noch nicht halten können. sobald es losgeht, meldet sich alicia bei dir.',
  },
  en: {
    eyebrow: 'the beta',
    title: 'the app, before it is finished.',
    lead: 'we are building a private space for two: live a card, scan its QR code, keep a photo and a note. before anyone buys it, someone should have really used it.',
    reasonsLabel: 'why we are looking for testers',
    reasons: [
      'what feels right in the code can feel wrong in real life. only someone using the app with their person notices that.',
      'we want to know where it snags, what annoys you and what is missing — honest, not kind.',
      'what you will see is unfinished. that is exactly the point.',
    ],
    formLabel: 'count me in',
    emailLabel: 'your email',
    placeholder: 'your@email.com',
    cta: 'put me on the beta list',
    ctaLoading: '...',
    successMailed: 'good. we have your address — and just sent you a mail. alicia will reach out as soon as the beta starts.',
    successPlain: 'good. we have your address. alicia will reach out as soon as the beta starts.',
    duplicate: 'you are already on the list. that is the same list alicia reaches out from when the beta starts — nothing else to do.',
    error: 'that did not go through — your address was not saved. please try again.',
    privacyPre: 'by joining you agree to our ',
    privacyLink: 'privacy policy',
    privacyPost: '.',
    listNote: 'you land on the same list as the waitlist — the monthly letter comes from there too. every mail carries a one-click unsubscribe.',
    openLabel: 'what we cannot tell you yet',
    open: 'when it starts, on which devices, how many people are in and what you get for it — none of that is decided. we do not write down what we cannot keep. the moment it starts, alicia gets in touch.',
  },
}

const labelStyle = {
  fontSize: 11,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
} as const

export default function BetaPage() {
  /* Serverseitig immer 'en': ein deterministischer erster Frame, sonst meldet
     React einen Hydration-Mismatch. Die Umschaltung passiert unten im Effekt
     bzw. per Klick. */
  const [locale, setLocale] = useState<Locale>('en')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')
  /* Ob die Willkommensmail tatsaechlich rausging. /api/waitlist gibt das
     ehrlich zurueck (`mailed`) — „schau in dein postfach" wird nur behauptet,
     wenn wirklich etwas verschickt wurde. */
  const [mailed, setMailed] = useState(false)

  useEffect(() => {
    /* ?lang=de gewinnt (damit man aus einer Mail sprachgenau verlinken kann),
       sonst entscheidet die Browsersprache. Nur beim ersten Rendern — eine
       spaetere Klick-Auswahl wird nicht ueberschrieben. */
    const param = new URLSearchParams(window.location.search).get('lang')
    if (param === 'de' || param === 'en') { setLocale(param); return }
    if (navigator.language?.toLowerCase().startsWith('de')) setLocale('de')
  }, [])

  const t = COPY[locale]
  const isDE = locale === 'de'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    /* Ein einziger Zustandswechsel am Ende: sonst bleibt bei einem Fehler
       zwischendrin 'loading' stehen und der Button ist fuer immer tot. */
    let finalStatus: typeof status = 'error'
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'beta', locale }),
      })
      const data = await res.json()
      if (data.duplicate) finalStatus = 'duplicate'
      else if (res.ok) { finalStatus = 'success'; setMailed(!!data.mailed) }
    } catch { finalStatus = 'error' }
    finally { setStatus(finalStatus) }
  }

  return (
    <div style={{ fontFamily: PP, background: PAPER, color: INK, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar activePath="/beta" />

      {/* lang am Container, nicht nur im <html>: der sichtbare Text wechselt
          die Sprache, Screenreader und Uebersetzer muessen das mitbekommen. */}
      <main
        lang={locale}
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 680,
          margin: '0 auto',
          padding: 'clamp(7rem, 14vw, 9rem) clamp(1.25rem, 5vw, 2.5rem) 5rem',
        }}
      >
        {/* Sprachumschalter. Die NavBar kann das hier nicht: ihr DE/EN-Link
            zeigt auf Root-Routen zurueck auf die Startseite. */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem', marginBottom: '1.5rem' }}>
          {(['de', 'en'] as Locale[]).map(code => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              aria-pressed={locale === code}
              lang={code}
              style={{
                ...labelStyle,
                fontFamily: PP,
                /* 44px Mindest-Tapziel, auch wenn der Text nur zwei Zeichen hat. */
                minWidth: 44,
                minHeight: 44,
                border: 0,
                background: 'transparent',
                color: INK,
                opacity: locale === code ? 1 : 0.35,
                cursor: 'pointer',
              }}
            >
              {code}
            </button>
          ))}
        </div>

        <p style={{ ...labelStyle, color: CHILI, marginBottom: '1.5rem' }}>{t.eyebrow}</p>

        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 200,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}
        >
          {t.title}
        </h1>

        <p
          style={{
            fontSize: '1.05rem',
            fontWeight: 300,
            lineHeight: 1.8,
            color: BODY,
            maxWidth: 520,
            marginBottom: 'clamp(3rem, 8vw, 4rem)',
          }}
        >
          {t.lead}
        </p>

        {/* Warum */}
        <p style={{ ...labelStyle, opacity: 0.4, marginBottom: '1.5rem' }}>{t.reasonsLabel}</p>
        <ul style={{ listStyle: 'none', borderTop: `1px solid ${CREAM_EDGE}`, marginBottom: 'clamp(3rem, 8vw, 4rem)' }}>
          {t.reasons.map(reason => (
            <li
              key={reason}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '1.25rem',
                padding: '1.35rem 0',
                borderBottom: `1px solid ${CREAM_EDGE}`,
              }}
            >
              <span aria-hidden="true" style={{ fontSize: '0.6rem', color: CHILI, opacity: 0.7 }}>∧</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.8, color: BODY }}>{reason}</p>
            </li>
          ))}
        </ul>

        {/* Formular auf Creme — helles Pendant zu .pp-waitlist, die fuer dunkle
            Flaechen gebaut ist (weisser Text, weisse Rahmen). Gestapelt in
            beiden Groessen: nebeneinander wird das Feld auf einem 390px-Handy
            zum Schlitz, und ein Breakpoint gehoert nach globals.css, nicht in
            dieses Formular. */}
        <section
          aria-labelledby="beta-form-heading"
          style={{
            background: CREAM,
            border: `1px solid ${CREAM_EDGE}`,
            borderRadius: 18,
            padding: 'clamp(1.5rem, 6vw, 2.5rem)',
          }}
        >
          <h2 id="beta-form-heading" style={{ ...labelStyle, color: CHILI, marginBottom: '1.25rem', fontWeight: 400 }}>
            {t.formLabel}
          </h2>

          {status === 'success' || status === 'duplicate' ? (
            /* aria-live, weil das Formular an dieser Stelle verschwindet —
               ohne Ansage merkt ein Screenreader die Antwort nicht. */
            <p
              role="status"
              aria-live="polite"
              style={{ fontSize: '1rem', fontWeight: 300, lineHeight: 1.8, color: INK, maxWidth: 460 }}
            >
              {status === 'duplicate' ? t.duplicate : mailed ? t.successMailed : t.successPlain}
            </p>
          ) : (
            <>
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 420 }}>
                <label htmlFor="beta-email" style={{ ...labelStyle, fontSize: 11, opacity: 0.5 }}>
                  {t.emailLabel}
                </label>
                <input
                  id="beta-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t.placeholder}
                  style={{
                    fontFamily: PP,
                    /* 16px ist Pflicht: alles darunter laesst iOS Safari beim
                       Fokus hineinzoomen, und der Besucher steht auf einer
                       seitlich verschobenen Seite. */
                    fontSize: 16,
                    fontWeight: 300,
                    minHeight: 48,
                    width: '100%',
                    padding: '0 1.25rem',
                    borderRadius: 999,
                    border: `1px solid rgba(26,26,26,0.18)`,
                    background: '#ffffff',
                    color: INK,
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    fontFamily: PP,
                    fontSize: 12,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    minHeight: 48,
                    width: '100%',
                    padding: '0 1.5rem',
                    borderRadius: 999,
                    border: 0,
                    background: INK,
                    color: '#ffffff',
                    cursor: status === 'loading' ? 'default' : 'pointer',
                    opacity: status === 'loading' ? 0.6 : 1,
                  }}
                >
                  {status === 'loading' ? t.ctaLoading : t.cta}
                </button>
              </form>

              {/* Fehler sichtbar, nicht verschluckt: die Adresse ist in diesem
                  Fall wirklich nicht gespeichert, also darf hier nichts nach
                  Erfolg aussehen. */}
              {status === 'error' && (
                <p
                  role="alert"
                  style={{ marginTop: '1rem', fontSize: '0.85rem', fontWeight: 400, lineHeight: 1.7, color: TERRACOTTA, maxWidth: 420 }}
                >
                  {t.error}
                </p>
              )}

              <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', fontWeight: 300, lineHeight: 1.7, color: SUBTLE, maxWidth: 420 }}>
                {t.privacyPre}
                <Link href="/datenschutz" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  {t.privacyLink}
                </Link>
                {t.privacyPost}
              </p>

              {/* Diese Liste IST die Newsletter-Liste (/api/newsletter/send
                  verschickt an alle aktiven Adressen, ohne source-Filter).
                  Wer sich hier eintraegt, bekommt also auch den Monatsbrief —
                  das muss dranstehen, sonst verspricht das Formular „beta" und
                  liefert zusaetzlich Post. */}
              <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', fontWeight: 300, lineHeight: 1.7, color: SUBTLE, maxWidth: 420 }}>
                {t.listNote}
              </p>
            </>
          )}
        </section>

        {/* Was offen ist — bewusst als eigener Block, nicht als Kleingedrucktes. */}
        <div style={{ marginTop: 'clamp(3rem, 8vw, 4rem)' }}>
          <p style={{ ...labelStyle, opacity: 0.4, marginBottom: '1rem' }}>{t.openLabel}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem' }}>
            <span aria-hidden="true" style={{ fontSize: '0.6rem', opacity: 0.25 }}>∧</span>
            <p style={{ fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.8, color: '#777', maxWidth: 460 }}>
              {t.open}
            </p>
          </div>
        </div>

        <p style={{ marginTop: 'clamp(2.5rem, 7vw, 3.5rem)' }}>
          <Link href="/letters" className="pp-quiet-link" style={{ fontFamily: PP }}>
            {isDE ? 'DIE BRIEFE LESEN →' : 'READ THE LETTERS →'}
          </Link>
        </p>
      </main>

      <SiteFooter locale={locale} />
    </div>
  )
}
