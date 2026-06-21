import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isDE = params.locale === 'de'
  return {
    title: isDE ? 'über uns — peakplant · alicia frommann' : 'about — peakplant · alicia frommann',
    description: isDE
      ? 'peakplant wurde von Alicia Frommann gegründet. eine brand, die daran glaubt, dass liebe, präsenz und verbindung es wert sind, in sie zu investieren.'
      : 'peakplant was founded by Alicia Frommann. a brand built on the belief that love, presence, and connection are worth investing in.',
    alternates: {
      canonical: `https://peak-plant.com/${params.locale}/about`,
      languages: { en: 'https://peak-plant.com/en/about', de: 'https://peak-plant.com/de/about' },
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
