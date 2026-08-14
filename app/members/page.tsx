'use client'
/**
 * /members — der Mitgliederbereich hinter dem Passwort-Login (/login:
 * E-Mail + selbst gewähltes Passwort, Entscheidung Alicia 13.08.).
 *
 * Session-Pruefung im Client (supabase.auth.getSession): die Session lebt im
 * localStorage des Browsers, ein Server-Render kann sie nicht sehen. Ohne
 * Session gibt es KEINEN harten Redirect (der wuerde mit /login ping-pongen,
 * wenn dort etwas schiefgeht), sondern eine freundliche Karte mit
 * Login-Button.
 *
 * WhatsApp-Community: der Link ist bewusst NICHT im Client-Bundle und nicht
 * im Git (Entscheidung Alicia, 12.08.: ein Gruppenlink in einer Mail oder im
 * Quelltext kann an beliebige Leute weitergereicht werden). Er liegt als
 * Server-Env-Variable WHATSAPP_COMMUNITY_URL und wird nur per API an
 * eingeloggte Konten ausgegeben. Ist er (noch) nicht gesetzt, sagt die Karte
 * ehrlich "der zugang kommt bald" — kein toter Button (MANIFESTO §1).
 *
 * Sprache/Struktur wie /beta und /login: Root-Ebene, beide Sprachen, server-
 * seitig englisch, Umschalter, kein framer-motion, kein useIsMobile().
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NavBar } from '../../components/NavBar'
import { SiteFooter } from '../../components/SiteFooter'
import type { Locale } from '../../lib/translations'
import { getSupabaseBrowser, isSupabaseConfigured } from '../../lib/supabaseBrowser'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

const INK = '#1A1A1A'
const ACCENT = '#857F76'
const TERRACOTTA = '#B5532E'
const PAPER = '#FBFAF7'
const CREAM = '#F7F2E8'
const CREAM_EDGE = '#EFE6D4'
const BODY = '#555'
const SUBTLE = '#857F76'

type Copy = {
  eyebrow: string
  title: string
  checking: string
  greeting: string
  noSessionTitle: string
  noSessionBody: string
  loginCta: string
  whatsappLabel: string
  whatsappBody: string
  whatsappCta: string
  whatsappSoon: string
  whatsappError: string
  whatsappLoading: string
  moreLabel: string
  links: { href: string; title: string; body: string }[]
  signOut: string
  notConfiguredTitle: string
  notConfiguredBody: string
}

const COPY: Record<Locale, Copy> = {
  de: {
    eyebrow: 'mitglieder',
    title: 'schön, dass du da bist.',
    checking: 'einen moment — wir schauen nach deiner anmeldung.',
    greeting: 'angemeldet als',
    noSessionTitle: 'du bist gerade nicht angemeldet.',
    noSessionBody: 'dieser bereich gehört den mitgliedern. melde dich mit deiner e-mail und deinem passwort an — oder leg in einer minute ein konto an.',
    loginCta: 'zum login',
    whatsappLabel: 'whatsapp-community',
    whatsappBody: 'die gruppe, in der alicia und die community sich austauschen.',
    whatsappCta: 'zur gruppe',
    whatsappSoon: 'der zugang kommt bald.',
    whatsappError: 'der link liess sich gerade nicht laden — bitte lade die seite neu.',
    whatsappLoading: 'wird geladen …',
    moreLabel: 'für dich',
    links: [
      { href: '/letters', title: 'die briefe', body: 'alicias monatlicher brief an die community.' },
      { href: '/journal', title: 'das journal', body: 'was gerade entsteht, aufgeschrieben während es entsteht.' },
      { href: '/beta', title: 'die beta', body: 'die app ausprobieren, bevor sie fertig ist.' },
    ],
    signOut: 'abmelden',
    notConfiguredTitle: 'der mitgliederbereich ist hier gerade nicht eingerichtet.',
    notConfiguredBody: 'dieser umgebung fehlen die zugangsdaten zum anmeldedienst (NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY).',
  },
  en: {
    eyebrow: 'members',
    title: 'good to have you here.',
    checking: 'one moment — checking your sign-in.',
    greeting: 'signed in as',
    noSessionTitle: 'you are not signed in right now.',
    noSessionBody: 'this area belongs to the members. sign in with your email and password — or create an account in a minute.',
    loginCta: 'go to login',
    whatsappLabel: 'whatsapp community',
    whatsappBody: 'the group where alicia and the community talk.',
    whatsappCta: 'open the group',
    whatsappSoon: 'access is coming soon.',
    whatsappError: 'the link could not be loaded just now — please reload the page.',
    whatsappLoading: 'loading …',
    moreLabel: 'for you',
    links: [
      { href: '/letters', title: 'the letters', body: 'alicia’s monthly letter to the community.' },
      { href: '/journal', title: 'the journal', body: 'what is being built, written down while it happens.' },
      { href: '/beta', title: 'the beta', body: 'try the app before it is finished.' },
    ],
    signOut: 'sign out',
    notConfiguredTitle: 'the members area is not set up here right now.',
    notConfiguredBody: 'this environment is missing the credentials for the sign-in service (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY).',
  },
}

const labelStyle = {
  fontSize: 11,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
} as const

const cardStyle = {
  background: CREAM,
  border: `1px solid ${CREAM_EDGE}`,
  borderRadius: 18,
  padding: 'clamp(1.5rem, 6vw, 2.5rem)',
} as const

export default function MembersPage() {
  const [locale, setLocale] = useState<Locale>('en')
  /* 'checking' als eigener Zustand: waehrend getSession laeuft, darf die Seite
     weder "nicht angemeldet" behaupten noch Mitglieder-Inhalte zeigen. */
  const [session, setSession] = useState<'checking' | 'none' | 'active'>('checking')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [whatsapp, setWhatsapp] = useState<
    { state: 'loading' } | { state: 'ready'; url: string } | { state: 'pending' } | { state: 'error' }
  >({ state: 'loading' })

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('lang')
    if (param === 'de' || param === 'en') setLocale(param)
    else if (navigator.language?.toLowerCase().startsWith('de')) setLocale('de')

    const supabase = getSupabaseBrowser()
    if (!supabase) { setSession('none'); return }

    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase.auth.getSession()
      if (cancelled) return
      if (error) {
        /* Ein Fehler bei der Session-Abfrage ist ehrlich "nicht angemeldet"
           mit Log — nicht ein stiller weisser Bildschirm. */
        console.error('[Members] getSession failed:', error.message)
        setSession('none')
        return
      }
      const s = data.session
      if (!s) { setSession('none'); return }
      setUserEmail(s.user.email ?? null)
      setSession('active')

      /* WhatsApp-Link holen — mit dem Access-Token, damit der Server weiss,
         dass hier wirklich ein eingeloggtes Konto fragt. Jedes Ergebnis wird
         ausgewertet; ein Fehler wird angezeigt, nie verschluckt. */
      try {
        const res = await fetch('/api/community/whatsapp', {
          headers: { Authorization: `Bearer ${s.access_token}` },
        })
        if (cancelled) return
        if (!res.ok) {
          const detail = await res.text().catch(() => '')
          console.error('[Members] whatsapp link request failed:', res.status, detail.slice(0, 300))
          setWhatsapp({ state: 'error' })
          return
        }
        const body = await res.json()
        if (cancelled) return
        if (typeof body.url === 'string' && body.url) setWhatsapp({ state: 'ready', url: body.url })
        else setWhatsapp({ state: 'pending' })
      } catch (err) {
        if (cancelled) return
        console.error('[Members] whatsapp link fetch threw:', err)
        setWhatsapp({ state: 'error' })
      }
    })()
    return () => { cancelled = true }
  }, [])

  const t = COPY[locale]

  const signOut = async () => {
    const supabase = getSupabaseBrowser()
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      /* Nicht nur loggen: schlaegt das serverseitige Abmelden fehl, lebt die
         Session weiter — dann "du bist nicht angemeldet" zu behaupten, waere
         eine UI-Aussage, die der Code nicht haelt (MANIFESTO §1). Also die
         lokale Session ausdruecklich verwerfen, damit die Aussage stimmt. */
      console.error('[Members] signOut failed:', error.message)
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
    }
    setUserEmail(null)
    setSession('none')
    setWhatsapp({ state: 'loading' })
  }

  return (
    <div style={{ fontFamily: PP, background: PAPER, color: INK, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar activePath="/members" />

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
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem', marginBottom: '1.5rem' }}>
          {(['de', 'en'] as Locale[]).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setLocale(c)}
              aria-pressed={locale === c}
              lang={c}
              style={{
                ...labelStyle,
                fontFamily: PP,
                minWidth: 44,
                minHeight: 44,
                border: 0,
                background: 'transparent',
                color: INK,
                opacity: locale === c ? 1 : 0.35,
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <p style={{ ...labelStyle, color: ACCENT, marginBottom: '1.5rem' }}>{t.eyebrow}</p>

        {!isSupabaseConfigured ? (
          <section style={cardStyle}>
            <p style={{ fontSize: '1rem', fontWeight: 400, lineHeight: 1.7, marginBottom: '0.75rem' }}>{t.notConfiguredTitle}</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.7, color: BODY, maxWidth: 460 }}>{t.notConfiguredBody}</p>
          </section>
        ) : session === 'checking' ? (
          <p role="status" aria-live="polite" style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.8, color: SUBTLE }}>
            {t.checking}
          </p>
        ) : session === 'none' ? (
          /* Freundliche Karte statt Redirect: kein Loop-Risiko, und die Seite
             erklaert, was hier liegt und wie man hineinkommt. */
          <section style={cardStyle}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '1rem' }}>
              {t.noSessionTitle}
            </h1>
            <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.8, color: BODY, maxWidth: 460, marginBottom: '1.5rem' }}>
              {t.noSessionBody}
            </p>
            <Link href="/login" className="pp-cta" style={{ fontFamily: PP }}>
              {t.loginCta}
            </Link>
          </section>
        ) : (
          <>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 200, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '0.75rem' }}>
              {t.title}
            </h1>
            {userEmail && (
              <p style={{ fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.7, color: SUBTLE, marginBottom: 'clamp(2.5rem, 7vw, 3.5rem)' }}>
                {t.greeting} <strong style={{ fontWeight: 500, color: INK }}>{userEmail}</strong>
              </p>
            )}

            {/* WhatsApp-Karte: der Link kommt vom Server, nur fuer eingeloggte
                Konten. Ohne Link keine tote Schaltflaeche, sondern der ehrliche
                Satz, dass der Zugang noch kommt. */}
            <section aria-labelledby="members-whatsapp" style={{ ...cardStyle, marginBottom: '1.25rem' }}>
              <h2 id="members-whatsapp" style={{ ...labelStyle, color: ACCENT, marginBottom: '1rem', fontWeight: 400 }}>
                {t.whatsappLabel}
              </h2>
              <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.8, color: BODY, maxWidth: 460, marginBottom: '1.25rem' }}>
                {t.whatsappBody}
              </p>
              {whatsapp.state === 'loading' ? (
                <p role="status" aria-live="polite" style={{ fontSize: '0.85rem', fontWeight: 300, color: SUBTLE }}>{t.whatsappLoading}</p>
              ) : whatsapp.state === 'ready' ? (
                <a href={whatsapp.url} target="_blank" rel="noopener noreferrer" className="pp-cta" style={{ fontFamily: PP }}>
                  {t.whatsappCta}
                </a>
              ) : whatsapp.state === 'pending' ? (
                <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.8, color: INK }}>{t.whatsappSoon}</p>
              ) : (
                <p role="alert" style={{ fontSize: '0.85rem', fontWeight: 400, lineHeight: 1.7, color: TERRACOTTA, maxWidth: 420 }}>
                  {t.whatsappError}
                </p>
              )}
            </section>

            {/* Verweise auf das, was es fuer Mitglieder schon gibt. */}
            <p style={{ ...labelStyle, opacity: 0.4, margin: '2rem 0 1rem' }}>{t.moreLabel}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: 'clamp(2.5rem, 7vw, 3.5rem)' }}>
              {t.links.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    ...cardStyle,
                    display: 'block',
                    padding: '1.35rem clamp(1.25rem, 5vw, 1.75rem)',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  <p style={{ fontSize: '1.05rem', fontWeight: 300, letterSpacing: '-0.01em', marginBottom: '0.35rem' }}>{item.title}</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.7, color: BODY }}>{item.body}</p>
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={signOut}
              style={{
                ...labelStyle,
                fontFamily: PP,
                minHeight: 44,
                border: 0,
                background: 'transparent',
                color: INK,
                opacity: 0.5,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {t.signOut}
            </button>
          </>
        )}
      </main>

      <SiteFooter locale={locale} />
    </div>
  )
}
