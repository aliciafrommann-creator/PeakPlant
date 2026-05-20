import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isDE = params.locale === 'de'
  return {
    title: isDE ? 'PeakPlant — Intimität neu erleben' : 'PeakPlant — Reimagine Intimacy',
    description: isDE
      ? 'Edition 01. 6 Kondome. 6 Reflexionskarten. 1 Saatpapierkarte. Für die Momente, die bleiben. Vegan, fair rubber latex. Startet August 2026.'
      : 'Edition 01. 6 condoms. 6 reflection cards. 1 seed paper card. Made for the moments that stay with you. Vegan, fair rubber latex. Launching August 2026.',
    alternates: {
      canonical: `/${params.locale}`,
      languages: {
        'en': '/en',
        'de': '/de',
      },
    },
  }
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
