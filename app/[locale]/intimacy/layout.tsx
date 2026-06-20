import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isDE = params.locale === 'de'
  return {
    title: isDE ? 'intimität — peakplant · vollständig präsent sein' : 'intimacy — peakplant · being fully present',
    description: isDE
      ? 'was intimität wirklich bedeutet. keine performance, kein druck — präsenz. wie man wirklich ankommt, bei sich und beim anderen.'
      : 'what intimacy actually looks like. not performance, not pressure — presence. the guide to being fully here with another person.',
    alternates: {
      canonical: `https://peak-plant.com/${params.locale}/intimacy`,
      languages: { en: 'https://peak-plant.com/en/intimacy', de: 'https://peak-plant.com/de/intimacy' },
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
