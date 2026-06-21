'use client'
import { motion } from 'framer-motion'
import { NavBar } from '../../components/NavBar'
import { ReactNode } from 'react'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: '1.05rem', fontWeight: 500, letterSpacing: '-0.01em', marginBottom: '0.75rem', marginTop: '0.25rem', color: '#1A1A1A', fontFamily: PP }}>{children}</h2>
}
function H3({ children }: { children: ReactNode }) {
  return <h3 style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.03em', marginBottom: '0.4rem', marginTop: '1rem', color: '#1A1A1A', fontFamily: PP }}>{children}</h3>
}
function P({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: '0.9rem', lineHeight: 1.85, color: '#555', fontWeight: 300, marginBottom: '0.75rem', fontFamily: PP }}>{children}</p>
}
function Sec({ children }: { children: ReactNode }) {
  return <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>{children}</div>
}

export default function AppPrivacyPage() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar />
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '10rem 2.5rem 8rem' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '2rem', fontFamily: PP }}>
          peakplant app
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 200, letterSpacing: '-0.025em', marginBottom: '1rem', fontFamily: PP }}>
          datenschutz – app
        </motion.h1>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
          <P>Diese Erklärung beschreibt, wie die PeakPlant-App (iOS/Android) mit deinen Daten umgeht. Für die Website gilt zusätzlich unsere allgemeine <a href="/datenschutz" style={{ color: '#888' }}>Datenschutzerklärung</a>.</P>

          <Sec>
            <H2>1. Verantwortlicher</H2>
            <P>Alicia Frommann · PeakPlant<br />Otto-Löffler-Weg 10, 73207 Plochingen<br />E-Mail: hello@peak-plant.com</P>
          </Sec>

          <Sec>
            <H2>2. Welche Daten wir verarbeiten</H2>
            <H3>Konto</H3>
            <P>Zur Anmeldung verarbeiten wir deine <strong>E-Mail-Adresse</strong> und einen Anmelde-Code (Einmal-Passwort). Es gibt kein Passwort. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</P>
            <H3>Dein Tagebuch</H3>
            <P>Die Inhalte, die du bewusst erstellst – <strong>Notizen, optionale Fotos, gespeicherte Momente, Spaces und Mitgliedschaften</strong> – werden gespeichert, damit du und die Mitglieder deines Space sie sehen könnt. Diese Inhalte sind <strong>privat</strong> für die Mitglieder des jeweiligen Space und werden niemals öffentlich gemacht.</P>
            <H3>Was wir NICHT tun</H3>
            <P>Keine Werbung, kein Tracking durch Dritte, kein Verkauf von Daten, kein öffentlicher Feed. Deine Tagebuch-Inhalte werden nicht für Werbung oder zum Training von KI-Modellen verwendet.</P>
          </Sec>

          <Sec>
            <H2>3. Fotos</H2>
            <P>Fügst du einem Moment ein Foto hinzu, wird es in einem <strong>privaten Speicher</strong> abgelegt und nur Mitgliedern deines Space über kurzlebige, signierte Links zugänglich gemacht. Standortdaten (EXIF) werden vor der Speicherung entfernt.</P>
          </Sec>

          <Sec>
            <H2>4. Auftragsverarbeiter</H2>
            <P><strong>Supabase</strong> (Datenbank, Authentifizierung, Speicher) – gehostet in der EU (Frankfurt, eu-central-1). Die Verarbeitung erfolgt auf Grundlage eines Auftragsverarbeitungsvertrags. Anmelde-E-Mails werden über den E-Mail-Dienst des Anbieters versendet.</P>
          </Sec>

          <Sec>
            <H2>5. Berechtigungen auf dem Gerät</H2>
            <P><strong>Kamera</strong> (optional) – zum Scannen von Karten und Aufnehmen von Fotos. <strong>Fotomediathek</strong> (optional) – um ein Foto zu einem Moment hinzuzufügen. Beide sind freiwillig; die App funktioniert auch ohne. Es findet keine fortlaufende Standorterfassung statt.</P>
          </Sec>

          <Sec>
            <H2>6. Speicherdauer &amp; Löschung</H2>
            <P>Deine Daten bleiben gespeichert, solange dein Konto besteht. Du kannst dein <strong>Konto jederzeit direkt in der App löschen</strong> (Customize → Account &amp; data → Konto löschen). Dabei werden dein Konto, die Spaces, in denen du das einzige Mitglied bist, sowie deine Momente unwiderruflich entfernt. Alternativ: hello@peak-plant.com.</P>
          </Sec>

          <Sec>
            <H2>7. Deine Rechte</H2>
            <P>Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO) sowie ein Beschwerderecht bei der zuständigen Aufsichtsbehörde. Kontakt: hello@peak-plant.com.</P>
          </Sec>

          <Sec>
            <H2>8. Mindestalter</H2>
            <P>Die App richtet sich an Erwachsene. Inhalte mit intimem Charakter sind auf Nutzer ab 18 Jahren beschränkt.</P>
          </Sec>

          <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem' }}>
            <P>Stand: dieser Hinweis wird mit neuen App-Funktionen aktualisiert.</P>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
