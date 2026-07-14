import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isDE = params.locale === 'de'
  return {
    title: isDE ? 'unsere werte — peakplant · nachhaltigkeit & ethik' : 'ethics — peakplant · sustainability & values',
    description: isDE
      ? 'peakplant setzt auf fsc-papier, vegane farben, faire produktion und saatpapier, das zu sonnenblumen wird. was wir glauben, wie wir es machen.'
      : 'peakplant is built on fsc paper, vegan inks, fair production and seed paper that grows into sunflowers. what we believe, how we make it.',
    alternates: {
      canonical: `https://peak-plant.com/${params.locale}/ethics`,
      languages: { en: 'https://peak-plant.com/en/ethics', de: 'https://peak-plant.com/de/ethics' },
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
