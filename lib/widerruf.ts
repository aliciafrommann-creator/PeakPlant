/**
 * Die Widerrufsbelehrung — EINE Quelle für Seite und E-Mail.
 *
 * WARUM ES DIESE DATEI GIBT: Am 18.08.2026 stand die Belehrung zuerst nur in
 * `app/agb/page.tsx`. Das Gegenlesen hat den entscheidenden Punkt gefunden:
 * Eine Webseite ist kein dauerhafter Datenträger (EuGH C-49/11, Content
 * Services). § 312f Abs. 2 BGB verlangt die Bestätigung in Textform — und
 * ohne sie beginnt die Widerrufsfrist gar nicht zu laufen (§ 356 Abs. 3 BGB).
 * Die Belehrung muss also in die Bestellbestätigung, nicht nur auf die Seite.
 *
 * Zwei Kopien desselben Rechtstexts wären die schlechteste Lösung: Sie
 * driften auseinander, und dann gilt eine Fassung, die niemand geprüft hat.
 * Deshalb steht der Text hier, ohne Darstellung, und beide Stellen lesen ihn.
 *
 * ACHTUNG BEIM ÄNDERN: Der deutsche Text folgt dem amtlichen Muster (Anlage 1
 * bzw. 2 zu Art. 246a § 1 Abs. 2 Satz 2 EGBGB, Fassung ab 28.05.2022). Wer das
 * Muster unverändert benutzt, ist gesetzlich abgesichert
 * („Gesetzlichkeitsfiktion"); wer daran formuliert, verliert diesen Schutz.
 * Umformulieren also nur mit anwaltlicher Prüfung.
 *
 * ENTSCHIEDEN (Alicia, 19.08.2026): **Der Käufer trägt die Rücksendekosten.**
 * Das ist zulässig, WEIL der Satz „Sie tragen die unmittelbaren Kosten der
 * Rücksendung der Waren." unten im Muster steht — ohne diese Angabe trägt der
 * Verkäufer sie kraft Gesetzes. Wer den Satz je entfernt, dreht damit die
 * Kostenlast um, ohne es zu merken.
 *
 * NICHT GEPRÜFT (MANIFESTO §1): Dieser Text ist aus dem amtlichen Muster
 * zusammengesetzt, nicht von einer Juristin geprüft. Zwei Punkte gehören
 * ausdrücklich mit auf den Zettel für die Prüfung:
 *   · Fristbeginn. Gewählt ist die Variante für „mehrere Waren einer
 *     Bestellung, getrennt geliefert" (letzte Ware). § 5 Abs. 3 der AGB behält
 *     sich aber TEILLIEFERUNGEN vor, wofür das Muster eine eigene Variante
 *     vorsieht. Mehrere Varianten nebeneinander zu drucken gilt seinerseits
 *     als abmahnfähig — hier muss eine Fachperson entscheiden, nicht der Code.
 *   · § 312g Abs. 2 (Ausnahmen). Bei bedrucktem Karton vermutlich irrelevant,
 *     bei der Saatpapier-Karte offen.
 *
 * ENGLISCH: Der Shop ist englisch und liefert in sechs Länder. Die englische
 * Fassung ist eine Übersetzung zur Verständlichkeit — verbindlich ist die
 * deutsche, und genau das steht auch dabei. Eine amtliche englische Fassung
 * des Musters gibt es nicht.
 */

export interface WiderrufBlock {
  title: string
  /** Absätze. Beim Rendern je ein eigener Absatz, nie zusammengezogen. */
  paragraphs: string[]
}

export interface WiderrufTexte {
  heading: string
  intro: string
  blocks: WiderrufBlock[]
  formTitle: string
  formIntro: string
  formLines: string[]
  /** Nur in der englischen Fassung gesetzt: welche Sprache verbindlich ist. */
  bindingNote?: string
}

const VERKAEUFER_DE =
  'Alicia Frommann, PeakPlant, Otto-Löffler-Weg 10, 73207 Plochingen, Deutschland, Telefon: 01639076331, E-Mail: hello@peak-plant.com'

export const WIDERRUF_DE: WiderrufTexte = {
  heading: 'Widerrufsbelehrung',
  intro: 'Verbraucher haben ein vierzehntägiges Widerrufsrecht.',
  blocks: [
    {
      title: 'Widerrufsrecht',
      paragraphs: [
        'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.',
        'Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die letzte Ware in Besitz genommen haben bzw. hat.',
        `Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (${VERKAEUFER_DE}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.`,
        'Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.',
      ],
    },
    {
      title: 'Folgen des Widerrufs',
      paragraphs: [
        'Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.',
        'Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.',
        'Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.',
        'Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.',
        'Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.',
      ],
    },
  ],
  formTitle: 'Muster-Widerrufsformular',
  formIntro:
    '(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück. Es ist nicht vorgeschrieben — eine formlose E-Mail genügt ebenso.)',
  formLines: [
    '— An: Alicia Frommann · PeakPlant · Otto-Löffler-Weg 10 · 73207 Plochingen · Deutschland · E-Mail: hello@peak-plant.com',
    '',
    '— Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)',
    '',
    '— Bestellt am (*)/erhalten am (*)',
    '',
    '— Name des/der Verbraucher(s)',
    '',
    '— Anschrift des/der Verbraucher(s)',
    '',
    '— Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)',
    '',
    '— Datum',
    '',
    '(*) Unzutreffendes streichen.',
  ],
}

export const WIDERRUF_EN: WiderrufTexte = {
  heading: 'Right of withdrawal',
  intro: 'Consumers have a fourteen-day right of withdrawal.',
  bindingNote:
    'This is a translation for your convenience. The legally binding version is the German text above.',
  blocks: [
    {
      title: 'Right of withdrawal',
      paragraphs: [
        'You have the right to withdraw from this contract within fourteen days without giving any reason.',
        'The withdrawal period is fourteen days from the day on which you, or a third party other than the carrier indicated by you, takes possession of the last of the goods.',
        `To exercise your right of withdrawal, you must inform us (${VERKAEUFER_DE}) of your decision to withdraw from this contract by an unequivocal statement (for example, a letter sent by post or an email). You may use the model withdrawal form below, but it is not obligatory.`,
        'To meet the withdrawal deadline, it is sufficient for you to send your communication concerning your exercise of the right of withdrawal before the withdrawal period has expired.',
      ],
    },
    {
      title: 'Effects of withdrawal',
      paragraphs: [
        'If you withdraw from this contract, we shall reimburse to you all payments received from you, including the costs of delivery (with the exception of the supplementary costs resulting from your choice of a type of delivery other than the least expensive type of standard delivery offered by us), without undue delay and in any event not later than fourteen days from the day on which we are informed about your decision to withdraw from this contract. We will carry out such reimbursement using the same means of payment as you used for the initial transaction, unless you have expressly agreed otherwise; in any event, you will not incur any fees as a result of such reimbursement.',
        'We may withhold reimbursement until we have received the goods back or you have supplied evidence of having sent back the goods, whichever is the earliest.',
        'You shall send back the goods or hand them over to us without undue delay and in any event not later than fourteen days from the day on which you communicate your withdrawal from this contract to us. The deadline is met if you send back the goods before the period of fourteen days has expired.',
        'You will have to bear the direct cost of returning the goods.',
        'You are only liable for any diminished value of the goods resulting from the handling other than what is necessary to establish the nature, characteristics and functioning of the goods.',
      ],
    },
  ],
  formTitle: 'Model withdrawal form',
  formIntro:
    '(Complete and return this form only if you wish to withdraw from the contract. It is not obligatory — a plain email is enough.)',
  formLines: [
    '— To: Alicia Frommann · PeakPlant · Otto-Löffler-Weg 10 · 73207 Plochingen · Germany · email: hello@peak-plant.com',
    '',
    '— I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*)/for the provision of the following service (*)',
    '',
    '— Ordered on (*)/received on (*)',
    '',
    '— Name of consumer(s)',
    '',
    '— Address of consumer(s)',
    '',
    '— Signature of consumer(s) (only if this form is notified on paper)',
    '',
    '— Date',
    '',
    '(*) Delete as appropriate.',
  ],
}

/**
 * Die Belehrung als schlichtes HTML für die Bestellbestätigung.
 *
 * Bewusst ohne Verweis auf die Website: Ein Link ist kein dauerhafter
 * Datenträger. Was hier steht, liegt danach im Postfach des Käufers.
 */
export function widerrufEmailHtml(): string {
  const rahmen =
    'font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:#555;font-weight:300'
  const teil = (t: WiderrufTexte) => `
  <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;opacity:0.45;margin:0 0 8px">${t.heading}</p>
  <p style="${rahmen};margin:0 0 16px">${t.intro}</p>
  ${t.blocks
    .map(
      (b) => `<p style="${rahmen};color:#1A1A1A;font-weight:400;margin:0 0 6px">${b.title}</p>` +
        b.paragraphs.map((p) => `<p style="${rahmen};margin:0 0 10px">${p}</p>`).join(''),
    )
    .join('')}
  <p style="${rahmen};color:#1A1A1A;font-weight:400;margin:16px 0 6px">${t.formTitle}</p>
  <p style="${rahmen};margin:0 0 10px">${t.formIntro}</p>
  ${t.formLines.map((z) => `<p style="${rahmen};margin:0 0 4px">${z || '&nbsp;'}</p>`).join('')}
  ${t.bindingNote ? `<p style="${rahmen};opacity:0.6;margin:16px 0 0">${t.bindingNote}</p>` : ''}`

  return `
<div style="border:1px solid #e8e8e8;padding:24px;margin-bottom:32px">
  ${teil(WIDERRUF_DE)}
  <div style="border-top:1px solid #e8e8e8;margin:24px 0"></div>
  ${teil(WIDERRUF_EN)}
</div>`
}
