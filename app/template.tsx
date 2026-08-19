'use client'
import { motion } from 'framer-motion'

/**
 * Der Seitenwechsel-Übergang — und die Notbremse dafür.
 *
 * WARUM DAS `noscript` DA IST: framer-motion setzt den Ausgangszustand als
 * Inline-Stil ins SSR-HTML (`opacity:0`). Ohne JavaScript wird daraus nie
 * wieder 1 — die Seite ist dann im Quelltext vorhanden und trotzdem
 * unsichtbar. Für eine Marketingseite ist das ärgerlich; für die
 * Widerrufsbelehrung und das Impressum ist es eine Pflichtinformation, die
 * niemand lesen kann (gefunden beim Gegenlesen, 18.08.2026).
 *
 * ZWEI FALLEN, in die der erste Anlauf beide getreten ist:
 *
 *   1. `&lt;style&gt;{'…'}&lt;/style&gt;` — React escapt die Anführungszeichen im
 *      Textinhalt, und `&lt;style&gt;` ist ein Raw-Text-Element: `&amp;quot;` wird darin
 *      NICHT zurückverwandelt. Der Selektor war ungültig, die Regel wurde
 *      verworfen, und ohne JavaScript blieb die GANZE Seite unsichtbar.
 *      Deshalb `dangerouslySetInnerHTML` — hier ausnahmsweise das richtige
 *      Werkzeug, weil der Inhalt eine Konstante ist.
 *   2. `[style*="opacity:0;"]` verlangt das Semikolon. React schreibt hinter
 *      der letzten Deklaration keins. Auf `/shop` fielen dadurch vier
 *      Produktkarten durch — samt Kaufknopf und dem Satz über die Erstattung.
 *      Deshalb zusätzlich `[style$="opacity:0"]`.
 *
 * Geprüft wird das im GEBAUTEN HTML, nicht im Quelltext. Genau dort ist der
 * erste Anlauf gescheitert.
 */
const NOSCRIPT_SICHTBAR =
  '[style*="opacity:0;"],[style$="opacity:0"]{opacity:1!important;transform:none!important}';
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: NOSCRIPT_SICHTBAR }} />
      </noscript>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
        {children}
      </motion.div>
    </>
  )
}
