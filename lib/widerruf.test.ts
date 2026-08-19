import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { WIDERRUF_DE, WIDERRUF_EN, widerrufEmailHtml } from './widerruf'
import { escapeHtml } from './email'

/**
 * Wächter für die Widerrufsbelehrung.
 *
 * Warum ein Test für Rechtstext: Das Gegenlesen am 18.08.2026 fand, dass die
 * Belehrung zwar auf der Seite stand, aber die Bestellbestätigung sie nicht
 * mitschickte — und damit die Widerrufsfrist gar nicht zu laufen begann
 * (§ 356 Abs. 3 BGB, EuGH C-49/11: eine Webseite ist kein dauerhafter
 * Datenträger). Genau das kann ein Test halten: dass der Text da ist, wo er
 * ankommen muss.
 *
 * Was er NICHT kann: beurteilen, ob der Wortlaut dem amtlichen Muster
 * entspricht. Das bleibt die anwaltliche Prüfung, die im Kopf von
 * `lib/widerruf.ts` ausdrücklich verlangt wird.
 */
describe('Widerrufsbelehrung', () => {
  it('geht vollständig in die Bestellbestätigung, nicht nur als Link', () => {
    const html = widerrufEmailHtml()
    // Die vier Sätze, an denen die Belehrung hängt.
    expect(html).toContain('binnen vierzehn Tagen ohne Angabe von Gründen')
    expect(html).toContain('Muster-Widerrufsformular')
    expect(html).toContain('unmittelbaren Kosten der Rücksendung')
    expect(html).toContain('within fourteen days without giving any reason')
    // Kein Verweis statt Inhalt: ein Link ist kein dauerhafter Datenträger.
    expect(html).not.toMatch(/href="[^"]*agb/)
  })

  it('nennt Anschrift, Telefon und E-Mail — seit 2022 Pflicht', () => {
    for (const t of [WIDERRUF_DE, WIDERRUF_EN]) {
      const text = JSON.stringify(t)
      expect(text).toContain('Otto-Löffler-Weg 10')
      expect(text).toContain('73207 Plochingen')
      expect(text).toContain('01639076331')
      expect(text).toContain('hello@peak-plant.com')
    }
  })

  it('das Formular lässt die Dienstleistungs-Alternative nicht weg', () => {
    // Anlage 2 sieht dafür — anders als Anlage 1 — keinen Gestaltungshinweis
    // vor, der das Streichen erlaubt.
    expect(WIDERRUF_DE.formLines.join(' ')).toContain('die Erbringung der folgenden Dienstleistung')
    expect(WIDERRUF_EN.formLines.join(' ')).toContain('for the provision of the following service')
  })

  it('die englische Fassung sagt, dass die deutsche verbindlich ist', () => {
    expect(WIDERRUF_EN.bindingNote).toBeTruthy()
    expect(WIDERRUF_EN.bindingNote).toContain('German')
    // Umgekehrt steht der Hinweis nicht bei der deutschen — dort wäre er falsch.
    expect(WIDERRUF_DE.bindingNote).toBeUndefined()
  })

  it('beide Fassungen haben dieselbe Struktur', () => {
    expect(WIDERRUF_EN.blocks.length).toBe(WIDERRUF_DE.blocks.length)
    expect(WIDERRUF_EN.formLines.length).toBe(WIDERRUF_DE.formLines.length)
    for (let i = 0; i < WIDERRUF_DE.blocks.length; i++) {
      expect(
        WIDERRUF_EN.blocks[i].paragraphs.length,
        `Block ${i}: die Übersetzung hat eine andere Absatzzahl`,
      ).toBe(WIDERRUF_DE.blocks[i].paragraphs.length)
    }
  })

  it('kein Absatz ist leer oder ein Platzhalter', () => {
    for (const t of [WIDERRUF_DE, WIDERRUF_EN]) {
      for (const b of t.blocks) {
        expect(b.title.trim().length).toBeGreaterThan(0)
        for (const p of b.paragraphs) expect(p.trim().length).toBeGreaterThan(40)
      }
    }
  })
})

describe('Die Belehrung erreicht wirklich jeden Kaufweg', () => {
  /**
   * WARUM DIESER TEST DEN QUELLTEXT LIEST: Der erste Anlauf prüfte nur die
   * Rückgabe von `widerrufEmailHtml()`. Man konnte den Aufruf aus der
   * Webhook-Route löschen — 27 Tests blieben grün, während der Testname
   * behauptete, die Belehrung lande „wirklich in der Mail". Ein Wächter, der
   * eine Absicherung behauptet, die er nicht leistet, ist schlimmer als
   * keiner (MANIFESTO §1).
   *
   * Ein Quelltext-Test ist grob, aber er hält genau die Aussage: Beide
   * Kaufwege rufen die Funktion auf.
   */
  const WEGE = [
    { datei: 'app/api/webhook/stripe/route.ts', name: 'Stripe-Checkout' },
    { datei: 'app/api/admin/invoice/route.ts', name: 'Rechnung über das Admin-Panel' },
  ]

  for (const weg of WEGE) {
    it(`${weg.name} schickt die Belehrung mit`, () => {
      const quelle = fs.readFileSync(path.resolve(__dirname, '..', weg.datei), 'utf8')
      expect(quelle, `${weg.datei} ruft widerrufEmailHtml() nicht auf`).toContain('widerrufEmailHtml()')
      expect(quelle).toContain("from '../../../../lib/widerruf'")
    })
  }

  it('keine Bestelldaten gehen ungeprüft ins Mail-HTML', () => {
    // Ein Name aus vier Zeichen — `<!--` — kommentierte bis zum 18.08.2026
    // alles dahinter weg, inklusive der Belehrung. Der Käufer gibt die
    // Adresse selbst ein und profitiert davon, dass sie fehlt.
    const quelle = fs.readFileSync(
      path.resolve(__dirname, '..', 'app/api/webhook/stripe/route.ts'),
      'utf8',
    )
    expect(quelle).toContain('escapeHtml')
    // Rohe Interpolation der Lieferdaten ins HTML: darf es nicht mehr geben.
    expect(quelle).not.toMatch(/\$\{shipping[.?]/)
  })

  it('escapeHtml entschärft die vier gefährlichen Zeichen', () => {
    expect(escapeHtml('<!--')).toBe('&lt;!--')
    expect(escapeHtml('<a href="x">y</a>')).toBe('&lt;a href=&quot;x&quot;&gt;y&lt;/a&gt;')
    expect(escapeHtml('Erika Musterfrau')).toBe('Erika Musterfrau')
    expect(escapeHtml(undefined)).toBe('')
  })
})
