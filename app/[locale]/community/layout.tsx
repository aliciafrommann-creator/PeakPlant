import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isDE = params.locale === 'de'
  return {
    title: isDE ? 'community — peakplant · menschen, die tief lieben' : 'community — peakplant · people who love deeply',
    description: isDE
      ? 'die peakplant community. für alle, die an präsenz, liebe und die schönheit der verbindung glauben. trag dich in die waitlist ein und sei teil von edition 01 — die sonnenblume.'
      : 'the peakplant community. people who believe in presence, love, and the beauty of connection. join the waitlist and be part of edition 01 — the sunflower.',
    alternates: {
      canonical: `https://peak-plant.com/${params.locale}/community`,
      languages: { en: 'https://peak-plant.com/en/community', de: 'https://peak-plant.com/de/community' },
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
