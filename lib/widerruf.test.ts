import { describe, it, expect } from 'vitest'
import { WIDERRUF_DE, WIDERRUF_EN, widerrufEmailHtml } from './widerruf'

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
