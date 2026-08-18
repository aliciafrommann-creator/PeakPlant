'use client'
import { motion } from 'framer-motion'
import { NavBar } from '../../components/NavBar'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

const sections = [
  {
    heading: '§ 1 Grundlegende Bestimmungen',
    paragraphs: [
      '(1) Die nachstehenden Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge, die zwischen Alicia Frommann, PeakPlant, Otto-Löffler-Weg 10, 73207 Plochingen (nachfolgend „Verkäufer“) und dem Käufer über den Online-Shop auf der Website peak-plant.com abgeschlossen werden.',
      '(2) Abweichende Bedingungen des Käufers werden nicht anerkannt, es sei denn, der Verkäufer stimmt ihrer Geltung ausdrücklich schriftlich zu.',
      '(3) Im Sinne dieser AGB ist Verbraucher jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können.',
    ],
  },
  {
    heading: '§ 2 Zustandekommen des Vertrages',
    paragraphs: [
      '(1) Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot dar, sondern eine Einladung zur Abgabe eines Angebots (invitatio ad offerendum).',
      '(2) Durch Klicken des Buttons „Kaufen“ bzw. „Jetzt kaufen“ gibt der Käufer ein verbindliches Angebot zum Kauf der im Warenkorb befindlichen Waren ab.',
      '(3) Der Verkäufer bestätigt den Eingang der Bestellung unverzüglich per E-Mail. Diese Eingangsbestätigung stellt noch keine Annahme des Angebots dar. Ein Kaufvertrag kommt erst zustande, wenn der Verkäufer die Bestellung durch eine gesonderte E-Mail ausdrücklich annimmt oder die Ware versendet.',
    ],
  },
  {
    heading: '§ 3 Vertragsgegenstand',
    paragraphs: [
      '(1) Gegenstand des Kaufvertrags sind die im Online-Shop angebotenen Produkte, insbesondere:',
      '— Kartensets (Decks mit Momentkarten: Dates, Acts, Questions)',
      '— Reflexionskarten (Cards)',
      '— Seed Paper Cards (Samenpapier-Karten)',
      '— weitere Bestandteile der jeweiligen Edition',
      '(2) Die konkreten Produkteigenschaften ergeben sich aus den jeweiligen Produktbeschreibungen im Online-Shop. Abbildungen sind Produktfotos und können vom tatsächlichen Produkt geringfügig abweichen.',
    ],
  },
  {
    heading: '§ 4 Preise',
    paragraphs: [
      '(1) Die angegebenen Preise sind Endpreise und enthalten die gesetzliche Umsatzsteuer, sofern diese anfällt.',
      '(2) Versandkosten sind in den angegebenen Preisen, sofern nicht anders angegeben, enthalten.',
      '(3) Für Lieferungen in Länder außerhalb der Europäischen Union können im Einzelfall weitere Zölle, Steuern oder Gebühren anfallen, die vom Käufer zu tragen sind.',
    ],
  },
  {
    heading: '§ 5 Lieferung',
    paragraphs: [
      '(1) Die Lieferung erfolgt an die vom Käufer angegebene Lieferadresse.',
      '(2) Der Versand erfolgt nach Verfügbarkeit des Produkts. Vorbestellungen werden zum angegebenen Erscheinungsdatum versandt.',
      '(3) Der Verkäufer ist berechtigt, Teillieferungen vorzunehmen, soweit dies für den Käufer zumutbar ist.',
      '(4) Ist der Verkäufer an der Lieferung gehindert, wird er den Käufer unverzüglich informieren und bereits gezahlte Beträge erstatten.',
    ],
  },
  {
    heading: '§ 6 Eigentumsvorbehalt',
    paragraphs: [
      '(1) Die gelieferte Ware bleibt bis zur vollständigen Bezahlung Eigentum des Verkäufers.',
      '(2) Der Käufer darf über die unter Eigentumsvorbehalt stehende Ware vor vollständiger Bezahlung nicht verfügen.',
    ],
  },
  {
    heading: '§ 7 Gewährleistung',
    paragraphs: [
      '(1) Es gelten die gesetzlichen Gewährleistungsrechte.',
      '(2) Die Gewährleistungsfrist beträgt bei neuen Waren zwei Jahre ab Lieferung.',
      '(3) Der Käufer ist verpflichtet, die gelieferte Ware unverzüglich auf offensichtliche Mängel zu prüfen und diese dem Verkäufer innerhalb von zwei Wochen nach Entdeckung anzuzeigen.',
    ],
  },
  {
    heading: '§ 8 Produkthinweise',
    paragraphs: [
      '(1) Die Kartensets sind Druckerzeugnisse und kein Spielzeug; Kleinteile (z. B. Kartenschuber-Verpackung) gehören nicht in die Hände von Kleinkindern.',
      '(2) Die Saatpapierkarte ist zum Einpflanzen bestimmt und nicht zum Verzehr geeignet.',
      '(3) Die Nutzung der zugehörigen App ist optional; für die Nutzung gelten ergänzend die App-Datenschutzhinweise.',
    ],
  },
  {
    heading: '§ 9 Abonnements',
    paragraphs: [
      '(1) Soweit PeakPlant Abonnements anbietet, verlängert sich das Abonnement automatisch um den vereinbarten Zeitraum, sofern es nicht rechtzeitig vor Ablauf gekündigt wird.',
      '(2) Die Kündigung des Abonnements ist jederzeit zum Ende des jeweiligen Abrechnungszeitraums möglich.',
      '(3) Die Kündigung ist per E-Mail an hello@peak-plant.com möglich.',
      '(4) Bereits bezahlte und versandte Bestellungen sind von einer Kündigung nicht betroffen.',
    ],
  },
  {
    heading: '§ 10 Widerrufsrecht',
    paragraphs: [
      '(1) Verbrauchern steht das nachfolgend beschriebene gesetzliche Widerrufsrecht zu. Die vollständige Widerrufsbelehrung und das Muster-Widerrufsformular finden sich unter Abschnitt III dieser Seite.',
      '(2) Das Widerrufsrecht besteht nicht bei Verträgen, die mit einem Unternehmer im Sinne des § 14 BGB geschlossen werden.',
      '(3) Ein Widerruf kann formlos erklärt werden — per E-Mail an hello@peak-plant.com oder postalisch an die in Abschnitt III genannte Anschrift. Die Verwendung des Muster-Widerrufsformulars ist möglich, aber nicht vorgeschrieben.',
    ],
  },
  {
    heading: '§ 11 Rechtswahl und Gerichtsstand',
    paragraphs: [
      '(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.',
      '(2) Gerichtsstand für alle Streitigkeiten aus dem Vertragsverhältnis mit Kaufleuten, juristischen Personen des öffentlichen Rechts oder öffentlich-rechtlichen Sondervermögen ist der Sitz des Verkäufers.',
      '(3) Die gesetzlichen Regelungen zur Beschränkung der Gerichtsstandswahl bleiben unberührt.',
    ],
  },
]

const customerInfo = [
  {
    heading: '1. Identität des Verkäufers',
    text: 'Alicia Frommann · PeakPlant · Otto-Löffler-Weg 10 · 73207 Plochingen · Telefon: 01639076331 · E-Mail: hello@peak-plant.com',
  },
  {
    heading: '2. Informationen zum Vertragsschluss',
    text: 'Die technischen Schritte zum Vertragsschluss sowie der Vertragstext werden nach Bestellabschluss per E-Mail mitgeteilt. Der Vertragstext wird vom Verkäufer gespeichert.',
  },
  {
    heading: '3. Vertragssprache',
    text: 'Die für den Vertragsschluss zur Verfügung stehenden Sprachen sind Deutsch und Englisch.',
  },
  {
    heading: '4. Wesentliche Eigenschaften der Waren',
    text: 'Die wesentlichen Eigenschaften der Waren ergeben sich aus den jeweiligen Produktbeschreibungen auf der Website.',
  },
  {
    heading: '5. Preise und Zahlungsmodalitäten',
    text: 'Die angegebenen Preise sind Endpreise inkl. MwSt. Die Zahlung erfolgt über die im Bestellprozess angegebenen Zahlungsmethoden.',
  },
  {
    heading: '6. Lieferbedingungen',
    text: 'Die Lieferung erfolgt weltweit. Versandkosten und voraussichtliche Lieferzeiten sind in der Produktbeschreibung angegeben.',
  },
  {
    heading: '7. Widerrufsrecht',
    text: 'Verbrauchern steht ein vierzehntägiges Widerrufsrecht zu. Die vollständige Widerrufsbelehrung und das Muster-Widerrufsformular stehen in Abschnitt III dieser Seite.',
  },
  {
    heading: '8. Streitbeilegung',
    text: 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Wir sind weder bereit noch verpflichtet, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
  },
]

/**
 * Widerrufsbelehrung — gesetzliches Muster.
 *
 * ACHTUNG, BEVOR HIER JEMAND ETWAS ÄNDERT: Der Text unten folgt dem amtlichen
 * Muster aus Anlage 1 zu Art. 246a § 1 Abs. 2 Satz 2 EGBGB. Wer das Muster
 * unverändert benutzt, ist gesetzlich abgesichert („Gesetzlichkeitsfiktion");
 * wer daran formuliert, verliert diesen Schutz. Umformulieren also nur mit
 * anwaltlicher Prüfung.
 *
 * ZWEI ENTSCHEIDUNGEN, DIE ALICIA BESTÄTIGEN MUSS (18.08.2026):
 *  1. Rücksendekosten. Hier steht die übliche Fassung „Sie tragen die
 *     unmittelbaren Kosten der Rücksendung". Das ist zulässig, WEIL es hier
 *     steht — ohne diese Information trägt der Verkäufer die Kosten. Wenn du
 *     die Rücksendung übernehmen willst, wird aus dem Satz „Wir tragen die
 *     Kosten der Rücksendung."
 *  2. Geltungsbereich. Diese Belehrung deckt den WEBSHOP (physische Decks).
 *     PeakPlant Plus wird über App Store und Google Play verkauft; dort ist
 *     Apple bzw. Google der Vertragspartner, und deren Widerrufsregeln gelten.
 *     Wenn digitale Inhalte je direkt über peak-plant.com verkauft werden,
 *     braucht es einen zusätzlichen Absatz zum vorzeitigen Erlöschen.
 *
 * NICHT GEPRÜFT: Dieser Text ist von Claude aus dem amtlichen Muster
 * zusammengesetzt, nicht von einer Juristin geprüft. Vor dem ersten echten
 * Verkauf gehört er einmal an eine Fachperson (MANIFESTO §1 — was nicht
 * geprüft ist, wird nicht als geprüft ausgegeben).
 */
const widerrufsbelehrung = {
  heading: 'Widerrufsbelehrung',
  intro: 'Verbraucher haben ein vierzehntägiges Widerrufsrecht.',
  blocks: [
    {
      title: 'Widerrufsrecht',
      text: 'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die letzte Ware in Besitz genommen haben bzw. hat.\n\nUm Ihr Widerrufsrecht auszuüben, müssen Sie uns (Alicia Frommann, PeakPlant, Otto-Löffler-Weg 10, 73207 Plochingen, Deutschland, Telefon: 01639076331, E-Mail: hello@peak-plant.com) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.\n\nZur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.',
    },
    {
      title: 'Folgen des Widerrufs',
      text: 'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.\n\nWir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.\n\nSie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.\n\nSie tragen die unmittelbaren Kosten der Rücksendung der Waren.\n\nSie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.',
    },
  ],
  formTitle: 'Muster-Widerrufsformular',
  formIntro: 'Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück. Es ist nicht vorgeschrieben — eine formlose E-Mail genügt ebenso.',
  form: [
    'An: Alicia Frommann · PeakPlant · Otto-Löffler-Weg 10 · 73207 Plochingen · Deutschland · E-Mail: hello@peak-plant.com',
    '',
    'Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*):',
    '',
    'Bestellt am (*) / erhalten am (*):',
    '',
    'Name des/der Verbraucher(s):',
    '',
    'Anschrift des/der Verbraucher(s):',
    '',
    'Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier):',
    '',
    'Datum:',
    '',
    '(*) Unzutreffendes streichen.',
  ],
}

export default function AGBPage() {
  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar />
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '10rem 2.5rem 8rem' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '2rem', fontFamily: PP }}>
          legal
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 200, letterSpacing: '-0.025em', marginBottom: '1rem', fontFamily: PP }}>
          allgemeine geschäftsbedingungen
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
          style={{ fontSize: '0.85rem', color: '#888', marginBottom: '4rem', fontWeight: 300, fontFamily: PP }}>
          I. Allgemeine Geschäftsbedingungen
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {sections.map(({ heading, paragraphs }) => (
            <div key={heading} style={{ borderTop: '1px solid #ebebeb', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.05em', marginBottom: '1rem', color: '#1A1A1A', fontFamily: PP }}>{heading}</p>
              {paragraphs.map((p, i) => (
                <p key={i} style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#555', fontWeight: 300, marginBottom: '0.75rem', fontFamily: PP }}>{p}</p>
              ))}
            </div>
          ))}
          <div style={{ borderTop: '2px solid #ebebeb', paddingTop: '2rem', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '2rem', color: '#1A1A1A', fontFamily: PP }}>II. Kundeninformationen</p>
            {customerInfo.map(({ heading, text }) => (
              <div key={heading} style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.04em', marginBottom: '0.5rem', color: '#1A1A1A', fontFamily: PP }}>{heading}</p>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#555', fontWeight: 300, fontFamily: PP }}>{text}</p>
              </div>
            ))}
          </div>

          {/* Abschnitt III — die Widerrufsbelehrung.
              Eigener, deutlich abgesetzter Block: Sie ist keine Fußnote,
              sondern die Pflichtinformation, ohne die die Widerrufsfrist gar
              nicht zu laufen beginnt. */}
          <div id="widerruf" style={{ borderTop: '2px solid #ebebeb', paddingTop: '2rem', marginTop: '1rem', scrollMarginTop: '6rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: '#1A1A1A', fontFamily: PP }}>III. {widerrufsbelehrung.heading}</p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#555', fontWeight: 300, marginBottom: '2rem', fontFamily: PP }}>{widerrufsbelehrung.intro}</p>

            {widerrufsbelehrung.blocks.map(({ title, text }) => (
              <div key={title} style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.04em', marginBottom: '0.75rem', color: '#1A1A1A', fontFamily: PP }}>{title}</p>
                {text.split('\n\n').map((absatz, i) => (
                  <p key={i} style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#555', fontWeight: 300, marginBottom: '0.75rem', fontFamily: PP }}>{absatz}</p>
                ))}
              </div>
            ))}

            <div style={{ border: '1px solid #ebebeb', padding: '1.5rem', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.04em', marginBottom: '0.75rem', color: '#1A1A1A', fontFamily: PP }}>{widerrufsbelehrung.formTitle}</p>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#555', fontWeight: 300, marginBottom: '1.25rem', fontFamily: PP }}>{widerrufsbelehrung.formIntro}</p>
              {widerrufsbelehrung.form.map((zeile, i) => (
                <p key={i} style={{ fontSize: '0.9rem', lineHeight: 1.8, color: zeile ? '#555' : 'transparent', fontWeight: 300, marginBottom: '0.35rem', fontFamily: PP, minHeight: '1.2rem' }}>{zeile || '\u00A0'}</p>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
