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

export default function DatenschutzPage() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar />
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '10rem 2.5rem 8rem' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '2rem', fontFamily: PP }}>
          legal
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 200, letterSpacing: '-0.025em', marginBottom: '4rem', fontFamily: PP }}>
          datenschutzerklärung
        </motion.h1>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>

          <Sec>
            <H2>1. Datenschutz auf einen Blick</H2>
            <H3>Allgemeine Hinweise</H3>
            <P>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</P>
            <H3>Datenerfassung auf dieser Website</H3>
            <P><strong>Wer ist verantwortlich für die Datenerfassung?</strong><br />Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur verantwortlichen Stelle“ entnehmen.</P>
            <P><strong>Wie erfassen wir Ihre Daten?</strong><br />Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z. B. über ein Formular). Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website erfasst — vor allem technische Daten (Browser, Betriebssystem, Uhrzeit des Seitenaufrufs).</P>
            <P><strong>Welche Rechte haben Sie?</strong><br />Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit Ihrer gespeicherten personenbezogenen Daten sowie ein Beschwerderecht bei der zuständigen Aufsichtsbehörde.</P>
          </Sec>

          <Sec>
            <H2>2. Hosting</H2>
            <H3>Vercel</H3>
            <P>Wir hosten unsere Website bei Vercel. Anbieter ist die Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA.</P>
            <P>Wenn Sie unsere Website besuchen, erfasst Vercel verschiedene Logfiles inklusive Ihrer IP-Adressen. Die Verwendung von Vercel erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir haben ein berechtigtes Interesse an einer möglichst zuverlässigen Darstellung unserer Website.</P>
            <P>Die Datenübertragung in die USA wird auf die Standardvertragsklauseln der EU-Kommission gestützt. Details: https://vercel.com/legal/privacy-policy.</P>
          </Sec>

          <Sec>
            <H2>3. Allgemeine Hinweise und Pflichtinformationen</H2>
            <H3>Datenschutz</H3>
            <P>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften.</P>
            <H3>Hinweis zur verantwortlichen Stelle</H3>
            <P>Alicia Frommann<br />PeakPlant<br />Otto-Löffler-Weg 10<br />73207 Plochingen</P>
            <P>Telefon: 01639076331<br />E-Mail: hello@peak-plant.com</P>
            <H3>Speicherdauer</H3>
            <P>Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt oder Sie die Löschung verlangen.</P>
            <H3>Ihre Rechte</H3>
            <P>Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO). Wenden Sie sich an: hello@peak-plant.com.</P>
          </Sec>

          <Sec>
            <H2>4. Datenerfassung auf dieser Website</H2>
            <H3>Cookies</H3>
            <P>Unsere Website verwendet Cookies. Cookies sind kleine Datenpakete, die auf Ihrem Endgerät gespeichert werden. Session-Cookies werden nach Ende Ihres Besuchs automatisch gelöscht. Permanente Cookies bleiben gespeichert, bis Sie diese löschen oder Ihr Browser sie automatisch entfernt.</P>
            <H3>Server-Log-Dateien</H3>
            <P>Der Provider erfasst automatisch Informationen in Server-Log-Dateien: Browsertyp, Betriebssystem, Referrer URL, Hostname, Uhrzeit der Serveranfrage, IP-Adresse. Die Erfassung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</P>
            <H3>E-Mail-Kontakt</H3>
            <P>Wenn Sie uns per E-Mail kontaktieren, werden Ihre Angaben zwecks Bearbeitung der Anfrage gespeichert. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).</P>
          </Sec>

          <Sec>
            <H2>5. Soziale Medien</H2>
            <H3>Instagram</H3>
            <P>Auf unserer Website können Links zu Instagram enthalten sein. Anbieter ist die Meta Platforms Ireland Limited, 4 Grand Canal Square, Dublin 2, Irland. Wenn Sie unsere Instagram-Seite besuchen, stellt Instagram eine direkte Verbindung zwischen Ihrem Browser und dem Instagram-Server her.</P>
            <P>Weitere Informationen: https://privacycenter.instagram.com/policy. Die Nutzung erfolgt auf Grundlage Ihrer Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO.</P>
          </Sec>

          <Sec>
            <H2>6. Newsletter</H2>
            <P>Wenn Sie unseren Newsletter abonnieren, benötigen wir Ihre E-Mail-Adresse sowie Bestätigung Ihrer Einwilligung. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO. Sie können die Einwilligung jederzeit widerrufen, z. B. über den Austragen-Link im Newsletter.</P>
          </Sec>

          <Sec>
            <H2>7. Plugins und Tools</H2>
            <H3>Google Fonts (lokales Hosting)</H3>
            <P>Diese Seite nutzt Google Fonts, die lokal installiert sind. Eine Verbindung zu Servern von Google findet nicht statt.</P>
            <H3>Spotify</H3>
            <P>Auf unseren Seiten können Funktionen des Musik-Dienstes Spotify eingebunden sein. Anbieter ist die Spotify AB, Regeringsgatan 19, 111 53 Stockholm, Schweden. Durch eingebundene Inhalte kann eine Verbindung zu Spotify-Servern hergestellt werden. Weitere Informationen: https://www.spotify.com/de/legal/privacy-policy/.</P>
          </Sec>

          <div style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem' }}>
            <P>Quelle: <a href="https://www.e-recht24.de" target="_blank" rel="noopener noreferrer" style={{ color: '#888', fontFamily: PP }}>https://www.e-recht24.de</a></P>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
