import type { Metadata } from 'next'

/* Eigenes Layout, weil ./page.tsx eine Client-Komponente ist (Formular-State):
   `metadata` laesst sich dort nicht exportieren. /beta liegt — wie /letters,
   /journal und /shop — auf Root-Ebene, es gibt also genau eine URL und keine
   hreflang-Paare. Die Seite darf indexiert werden: kein noindex.

   Die Beschreibung nennt nur, was wirklich feststeht. Kein Starttermin, keine
   Geraeteliste, keine Platzzahl, keine Gegenleistung — die stehen nicht fest,
   und was nicht feststeht, wird auch nicht in ein Suchergebnis geschrieben
   (MANIFESTO §1). */
export const metadata: Metadata = {
  title: 'die beta — peakplant · die app, bevor sie fertig ist',
  description:
    'peakplant sucht menschen, die die app fruehzeitig mit ihrem menschen benutzen und ehrlich sagen, wo es hakt. e-mail hinterlassen — alicia meldet sich, sobald es losgeht.',
  alternates: {
    canonical: 'https://peak-plant.com/beta',
  },
  openGraph: {
    title: 'die beta — peakplant',
    description:
      'die app, bevor sie fertig ist. wir suchen menschen, die sie im echten leben ausprobieren und ehrlich zurueckmelden.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  keywords: ['peakplant beta', 'beta tester', 'couples app beta', 'app testen', 'beta zugang'],
}

export default function BetaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
