import type { Metadata } from 'next'

const SITE_URL = 'https://peak-plant.com'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isDE = params.locale === 'de'
  return {
    title: isDE ? 'PeakPlant — Intimität neu erleben' : 'PeakPlant — Reimagine Intimacy',
    description: isDE
      ? 'Edition 01. 6 Kondome. 1 Fragenkarte mit 6 Fragen. 1 Saatpapierkarte. Für die Momente, die bleiben. Vegan, fair rubber latex. Startet August 2026.'
      : 'Edition 01. 6 condoms. 1 question card with 6 questions. 1 seed paper card. Made for the moments that stay with you. Vegan, fair rubber latex. Launching August 2026.',
    alternates: {
      canonical: `${SITE_URL}/${params.locale}`,
      languages: {
        'en': `${SITE_URL}/en`,
        'de': `${SITE_URL}/de`,
        'x-default': `${SITE_URL}/en`,
      },
    },
  }
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
