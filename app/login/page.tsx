'use client'
/**
 * /login — Zugang zum Mitgliederbereich, per E-Mail und selbst gewaehltem
 * Passwort (Entscheidung Alicia, 13.08.).
 *
 * Es bleibt DASSELBE Supabase-Konto wie in der PeakPlant-App: die App meldet
 * sich per Code an, die Website per Passwort — beides landet in derselben
 * auth.users-Zeile. Wer sein App-Konto hier zum ersten Mal nutzt, setzt sein
 * Passwort ueber „passwort vergessen"; der Hinweis steht auf der Seite.
 *
 * Vier Modi:
 *   signin  E-Mail + Passwort → signInWithPassword → /members
 *   signup  E-Mail + Passwort → signUp. Verlangt das Projekt eine
 *           Bestaetigung, folgt der confirm-Schritt (Code aus der Mail,
 *           verifyOtp type 'signup') — die Supabase-Vorlage zeigt laut
 *           App-Doku einen {{ .Token }}-Code.
 *   reset   E-Mail → resetPasswordForEmail mit redirectTo /login?mode=update.
 *           OPERATOR-SCHRITT: diese URL muss in Supabase unter
 *           Auth → URL Configuration → Redirect URLs stehen, sonst kommt der
 *           Link aus der Mail nicht hierher zurueck.
 *   update  Ankunft aus der Reset-Mail (Session aus dem URL-Hash):
 *           neues Passwort → updateUser → /members.
 *
 * Ehrlichkeit (MANIFESTO §1): ohne NEXT_PUBLIC_SUPABASE-Variablen zeigt die
 * Seite eine sichtbare "nicht konfiguriert"-Karte statt eines Formulars, das
 * nur scheitern kann. Anbieter-Fehler werden im Original angezeigt, nie
 * verschluckt. Die Reset-Bestaetigung behauptet nicht, dass ein Konto
 * existiert ("wenn es ein konto gibt, ist die mail unterwegs").
 *
 * Kein framer-motion, kein useIsMobile(): die Seite ist ein Formular,
 * einspaltig, gestapelt — gleiche Gruende wie auf /beta.
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

type Mode = 'signin' | 'signup' | 'confirm' | 'reset' | 'reset-sent' | 'update'

type Copy = {
  eyebrow: string
  titleSignin: string
  titleSignup: string
  titleReset: string
  titleUpdate: string
  lead: string
  sameAccount: string
  emailLabel: string
  emailPlaceholder: string
  passwordLabel: string
  passwordPlaceholder: string
  newPasswordLabel: string
  passwordHint: string
  signinCta: string
  signupCta: string
  resetCta: string
  updateCta: string
  loading: string
  toSignup: string
  toSignin: string
  toReset: string
  confirmLead: string
  confirmCodeLabel: string
  confirmCta: string
  confirmLinkNote: string
  resetSent: string
  updateLead: string
  errorPrefix: string
  notConfiguredTitle: string
  notConfiguredBody: string
}

const COPY: Record<Locale, Copy> = {
  de: {
    eyebrow: 'community',
    titleSignin: 'anmelden.',
    titleSignup: 'konto erstellen.',
    titleReset: 'passwort vergessen.',
    titleUpdate: 'neues passwort.',
    lead: 'dein zugang zur peakplant-community — mit e-mail und deinem passwort.',
    sameAccount: 'dasselbe konto wie in der peakplant-app. wenn du dort schon eines hast, nimm dieselbe adresse — dein passwort legst du über „passwort vergessen" an.',
    emailLabel: 'deine e-mail',
    emailPlaceholder: 'deine@email.com',
    passwordLabel: 'dein passwort',
    passwordPlaceholder: '••••••••',
    newPasswordLabel: 'neues passwort',
    passwordHint: 'mindestens 8 zeichen.',
    signinCta: 'anmelden',
    signupCta: 'konto erstellen',
    resetCta: 'link schicken',
    updateCta: 'passwort speichern',
    loading: '...',
    toSignup: 'noch kein konto? erstellen',
    toSignin: 'schon ein konto? anmelden',
    toReset: 'passwort vergessen?',
    confirmLead: 'fast geschafft — wir haben dir eine mail geschickt an',
    confirmCodeLabel: 'code aus der mail',
    confirmCta: 'bestätigen',
    confirmLinkNote: 'steht in der mail ein link statt eines codes: klick ihn und melde dich danach hier an.',
    resetSent: 'wenn es zu dieser adresse ein konto gibt, ist die mail mit dem link jetzt unterwegs. schau auch im spam nach.',
    updateLead: 'wähle dein neues passwort.',
    errorPrefix: 'das hat nicht geklappt',
    notConfiguredTitle: 'der login ist hier gerade nicht eingerichtet.',
    notConfiguredBody: 'dieser umgebung fehlen die zugangsdaten zum anmeldedienst (NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY). ein formular, das nur scheitern kann, zeigen wir dir nicht.',
  },
  en: {
    eyebrow: 'community',
    titleSignin: 'sign in.',
    titleSignup: 'create your account.',
    titleReset: 'forgot password.',
    titleUpdate: 'new password.',
    lead: 'your way into the peakplant community — with your email and password.',
    sameAccount: 'the same account as in the peakplant app. if you already have one there, use the same address — set your password via “forgot password”.',
    emailLabel: 'your email',
    emailPlaceholder: 'your@email.com',
    passwordLabel: 'your password',
    passwordPlaceholder: '••••••••',
    newPasswordLabel: 'new password',
    passwordHint: 'at least 8 characters.',
    signinCta: 'sign in',
    signupCta: 'create account',
    resetCta: 'send me the link',
    updateCta: 'save password',
    loading: '...',
    toSignup: 'no account yet? create one',
    toSignin: 'already have an account? sign in',
    toReset: 'forgot your password?',
    confirmLead: 'almost there — we sent a mail to',
    confirmCodeLabel: 'code from the mail',
    confirmCta: 'confirm',
    confirmLinkNote: 'if the mail contains a link instead of a code, click it and sign in here afterwards.',
    resetSent: 'if an account exists for this address, the mail with the link is on its way. check spam too.',
    updateLead: 'choose your new password.',
    errorPrefix: 'that did not work',
    notConfiguredTitle: 'sign-in is not set up here right now.',
    notConfiguredBody: 'this environment is missing the credentials for the sign-in service (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY). we will not show you a form that can only fail.',
  },
}

const labelStyle = {
  fontSize: 11,
  letterSpacing: '0.24em',
  textTransform: 'uppercase',
} as const

const inputStyle = {
  fontFamily: PP,
  /* 16px ist Pflicht: alles darunter laesst iOS Safari beim Fokus zoomen. */
  fontSize: 16,
  fontWeight: 300,
  minHeight: 48,
  width: '100%',
  padding: '0 1.25rem',
  borderRadius: 999,
  border: '1px solid rgba(26,26,26,0.18)',
  background: '#ffffff',
  color: INK,
  outline: 'none',
} as const

const buttonStyle = (disabled: boolean) => ({
  fontFamily: PP,
  fontSize: 12,
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  minHeight: 48,
  width: '100%',
  padding: '0 1.5rem',
  borderRadius: 999,
  border: 0,
  background: INK,
  color: '#ffffff',
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.6 : 1,
})

const quietButtonStyle = {
  ...labelStyle,
  fontFamily: PP,
  minHeight: 44,
  border: 0,
  background: 'transparent',
  color: INK,
  opacity: 0.5,
  cursor: 'pointer',
  padding: 0,
  textAlign: 'left' as const,
}

export default function LoginPage() {
  /* Serverseitig immer 'en' — deterministischer erster Frame, sonst
     Hydration-Mismatch. Umschaltung im Effekt bzw. per Klick. */
  const [locale, setLocale] = useState<Locale>('en')
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  /* Die Original-Fehlermeldung des Anbieters — angezeigt, nicht verschluckt. */
  const [errorDetail, setErrorDetail] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const param = params.get('lang')
    if (param === 'de' || param === 'en') setLocale(param)
    else if (navigator.language?.toLowerCase().startsWith('de')) setLocale('de')

    /* Ankunft aus der Passwort-vergessen-Mail: supabase-js liest die
       Recovery-Session aus dem URL-Hash (detectSessionInUrl); mode=update
       kommt aus unserem redirectTo. Das Auth-Event deckt den Fall ab, dass
       der Hash vor dem Query-Parameter verarbeitet wird. */
    if (params.get('mode') === 'update') setMode('update')

    const supabase = getSupabaseBrowser()
    if (!supabase) return
    const { data: sub } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') setMode('update')
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const t = COPY[locale]

  const switchMode = (m: Mode) => {
    setMode(m)
    setStatus('idle')
    setErrorDetail(null)
    setCode('')
  }

  /* Ein gemeinsamer Rahmen fuer alle Aktionen: genau ein Zustandswechsel am
     Ende, sonst bleibt bei einem Fehler 'loading' stehen und der Button ist
     fuer immer tot. Anbieter-Fehler landen sichtbar in errorDetail. */
  const run = async (
    action: () => Promise<{ error: { message: string } | null; next?: Mode | 'members' }>,
  ) => {
    if (!getSupabaseBrowser()) return
    setStatus('loading')
    setErrorDetail(null)
    let ok = false
    try {
      const { error, next } = await action()
      if (error) {
        console.error('[Login] auth action failed:', error.message)
        setErrorDetail(error.message)
      } else {
        ok = true
        if (next === 'members') {
          window.location.assign('/members')
          return
        }
        if (next) setMode(next)
      }
    } catch (err) {
      console.error('[Login] auth action threw:', err)
      setErrorDetail(err instanceof Error ? err.message : String(err))
    } finally {
      setStatus(ok ? 'idle' : 'error')
    }
  }

  const signIn = (e: React.FormEvent) => {
    e.preventDefault()
    run(async () => {
      const { error } = await getSupabaseBrowser()!.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      return { error, next: error ? undefined : 'members' }
    })
  }

  const signUp = (e: React.FormEvent) => {
    e.preventDefault()
    run(async () => {
      const { data, error } = await getSupabaseBrowser()!.auth.signUp({
        email: email.trim(),
        password,
      })
      if (error) return { error }
      /* Session sofort da: Bestaetigung im Projekt abgeschaltet, direkt rein.
         Keine Session: Supabase hat eine Bestaetigungs-Mail geschickt. */
      return { error: null, next: data.session ? 'members' : 'confirm' }
    })
  }

  const confirmSignup = (e: React.FormEvent) => {
    e.preventDefault()
    run(async () => {
      const { error } = await getSupabaseBrowser()!.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'signup',
      })
      return { error, next: error ? undefined : 'members' }
    })
  }

  const sendReset = (e: React.FormEvent) => {
    e.preventDefault()
    run(async () => {
      const { error } = await getSupabaseBrowser()!.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login?mode=update`,
      })
      return { error, next: error ? undefined : 'reset-sent' }
    })
  }

  const updatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    run(async () => {
      const { error } = await getSupabaseBrowser()!.auth.updateUser({ password })
      return { error, next: error ? undefined : 'members' }
    })
  }

  const title =
    mode === 'signup' ? t.titleSignup
    : mode === 'reset' || mode === 'reset-sent' ? t.titleReset
    : mode === 'update' ? t.titleUpdate
    : t.titleSignin

  const emailField = (
    <>
      <label htmlFor="login-email" style={{ ...labelStyle, fontSize: 11, opacity: 0.5 }}>
        {t.emailLabel}
      </label>
      <input
        id="login-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={t.emailPlaceholder}
        style={inputStyle}
      />
    </>
  )

  const passwordField = (label: string, autoComplete: string) => (
    <>
      <label htmlFor="login-password" style={{ ...labelStyle, fontSize: 11, opacity: 0.5 }}>
        {label}
      </label>
      <input
        id="login-password"
        type="password"
        name="password"
        required
        autoComplete={autoComplete}
        minLength={8}
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder={t.passwordPlaceholder}
        style={inputStyle}
      />
    </>
  )

  const busy = status === 'loading'

  return (
    <div style={{ fontFamily: PP, background: PAPER, color: INK, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar activePath="/login" />

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
        {/* Sprachumschalter — wie auf /beta, weil die NavBar auf Root-Routen
            keine Sprachwahl kennt. */}
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

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 200, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.5rem' }}>
          {title}
        </h1>

        {(mode === 'signin' || mode === 'signup') ? (
          <>
            <p style={{ fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.8, color: BODY, maxWidth: 520, marginBottom: '1rem' }}>
              {t.lead}
            </p>
            <p style={{ fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.7, color: SUBTLE, maxWidth: 520, marginBottom: 'clamp(2.5rem, 7vw, 3.5rem)' }}>
              {t.sameAccount}
            </p>
          </>
        ) : (
          <div style={{ marginBottom: 'clamp(2rem, 6vw, 3rem)' }} />
        )}

        {!isSupabaseConfigured ? (
          /* Ehrliche Meldung statt kaputtem Formular (MANIFESTO §1). */
          <section style={{ background: CREAM, border: `1px solid ${CREAM_EDGE}`, borderRadius: 18, padding: 'clamp(1.5rem, 6vw, 2.5rem)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 400, lineHeight: 1.7, marginBottom: '0.75rem' }}>{t.notConfiguredTitle}</p>
            <p style={{ fontSize: '0.85rem', fontWeight: 300, lineHeight: 1.7, color: BODY, maxWidth: 460 }}>{t.notConfiguredBody}</p>
          </section>
        ) : (
          <section style={{ background: CREAM, border: `1px solid ${CREAM_EDGE}`, borderRadius: 18, padding: 'clamp(1.5rem, 6vw, 2.5rem)' }}>

            {mode === 'signin' && (
              <>
                <form onSubmit={signIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 420 }}>
                  {emailField}
                  {passwordField(t.passwordLabel, 'current-password')}
                  <button type="submit" disabled={busy} style={buttonStyle(busy)}>
                    {busy ? t.loading : t.signinCta}
                  </button>
                </form>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => switchMode('signup')} style={quietButtonStyle}>{t.toSignup}</button>
                  <button type="button" onClick={() => switchMode('reset')} style={quietButtonStyle}>{t.toReset}</button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <>
                <form onSubmit={signUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 420 }}>
                  {emailField}
                  {passwordField(t.passwordLabel, 'new-password')}
                  <p style={{ fontSize: '0.8rem', fontWeight: 300, color: SUBTLE, margin: 0 }}>{t.passwordHint}</p>
                  <button type="submit" disabled={busy} style={buttonStyle(busy)}>
                    {busy ? t.loading : t.signupCta}
                  </button>
                </form>
                <div style={{ marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => switchMode('signin')} style={quietButtonStyle}>{t.toSignin}</button>
                </div>
              </>
            )}

            {mode === 'confirm' && (
              <>
                {/* aria-live: der Schrittwechsel passiert ohne Navigation —
                    ohne Ansage merkt ein Screenreader ihn nicht. */}
                <p role="status" aria-live="polite" style={{ fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.7, color: BODY, marginBottom: '1rem', maxWidth: 420 }}>
                  {t.confirmLead} <strong style={{ fontWeight: 500 }}>{email.trim()}</strong>.
                </p>
                <form onSubmit={confirmSignup} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 420 }}>
                  <label htmlFor="login-code" style={{ ...labelStyle, fontSize: 11, opacity: 0.5 }}>
                    {t.confirmCodeLabel}
                  </label>
                  <input
                    id="login-code"
                    type="text"
                    name="code"
                    required
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    style={{ ...inputStyle, letterSpacing: '0.35em' }}
                  />
                  <button type="submit" disabled={busy} style={buttonStyle(busy)}>
                    {busy ? t.loading : t.confirmCta}
                  </button>
                </form>
                <p style={{ fontSize: '0.8rem', fontWeight: 300, lineHeight: 1.7, color: SUBTLE, marginTop: '1rem', maxWidth: 420 }}>
                  {t.confirmLinkNote}
                </p>
                <div style={{ marginTop: '0.75rem' }}>
                  <button type="button" onClick={() => switchMode('signin')} style={quietButtonStyle}>{t.toSignin}</button>
                </div>
              </>
            )}

            {mode === 'reset' && (
              <>
                <form onSubmit={sendReset} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 420 }}>
                  {emailField}
                  <button type="submit" disabled={busy} style={buttonStyle(busy)}>
                    {busy ? t.loading : t.resetCta}
                  </button>
                </form>
                <div style={{ marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => switchMode('signin')} style={quietButtonStyle}>{t.toSignin}</button>
                </div>
              </>
            )}

            {mode === 'reset-sent' && (
              <>
                <p role="status" aria-live="polite" style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.8, color: BODY, maxWidth: 420 }}>
                  {t.resetSent}
                </p>
                <div style={{ marginTop: '1.25rem' }}>
                  <button type="button" onClick={() => switchMode('signin')} style={quietButtonStyle}>{t.toSignin}</button>
                </div>
              </>
            )}

            {mode === 'update' && (
              <form onSubmit={updatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 420 }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.7, color: BODY, margin: 0 }}>{t.updateLead}</p>
                {passwordField(t.newPasswordLabel, 'new-password')}
                <p style={{ fontSize: '0.8rem', fontWeight: 300, color: SUBTLE, margin: 0 }}>{t.passwordHint}</p>
                <button type="submit" disabled={busy} style={buttonStyle(busy)}>
                  {busy ? t.loading : t.updateCta}
                </button>
              </form>
            )}

            {/* Fehler sichtbar, mit der Original-Meldung des Anbieters —
                verschluckte Fehler sind hier verboten. */}
            {status === 'error' && (
              <p role="alert" style={{ marginTop: '1rem', fontSize: '0.85rem', fontWeight: 400, lineHeight: 1.7, color: TERRACOTTA, maxWidth: 420 }}>
                {t.errorPrefix}{errorDetail ? ` — ${errorDetail}` : '.'}
              </p>
            )}
          </section>
        )}

        <p style={{ marginTop: 'clamp(2.5rem, 7vw, 3.5rem)' }}>
          {/* padding statt der 10px aus .pp-quiet-link: 44px Tap-Hoehe. */}
          <Link href="/members" className="pp-quiet-link" style={{ fontFamily: PP, padding: '15px 0' }}>
            {locale === 'de' ? 'ZUM MITGLIEDERBEREICH →' : 'TO THE MEMBERS AREA →'}
          </Link>
        </p>
      </main>

      <SiteFooter locale={locale} />
    </div>
  )
}
