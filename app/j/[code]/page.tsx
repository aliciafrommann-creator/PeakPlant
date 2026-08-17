import type { Metadata } from 'next'
import JoinClient from './JoinClient'

/**
 * /j/<code> — die Landeseite eines Einladungslinks.
 *
 * Vorher trug die Einladungsnachricht nur `PEAK-XXXXXX`. Die eingeladene
 * Person musste den Code aus einem Chat abtippen, korrekt, in ein Feld, das
 * neun Bildschirme hinter der Anmeldung liegt. In Produktion: vier Spaces,
 * kein einziger mit einer zweiten Person.
 *
 * Diese Seite hat genau zwei Aufgaben:
 *   1. Ist die App da, öffnet der Universal-Link sie direkt — diese Seite wird
 *      dann nie gesehen. Der Code landet über `parseJoinLink` im Beitritts-
 *      Feld, ausgefüllt.
 *   2. Ist sie nicht da (der Normalfall während der geschlossenen Beta),
 *      erklärt diese Seite ehrlich, wie der Stand ist — und BEHÄLT DEN CODE,
 *      statt ihn zu verlieren.
 *
 * MANIFESTO §2: Der Code ist ein Schlüssel. Er steht deshalb nicht im
 * Seitentitel, nicht in der Beschreibung und nicht in der OpenGraph-Vorschau —
 * sonst stünde er in jeder Chat-Vorschau, in der der Link auftaucht. Und die
 * Seite ist `noindex`: ein Einladungslink gehört nicht in eine Suchmaschine.
 */
export const metadata: Metadata = {
  title: 'Eine Einladung · PeakPlant',
  description: 'Jemand möchte ein gemeinsames Tagebuch mit dir teilen.',
  robots: { index: false, follow: false },
}

export default function JoinPage({ params }: { params: { code: string } }) {
  return <JoinClient code={decodeURIComponent(params.code)} />
}
