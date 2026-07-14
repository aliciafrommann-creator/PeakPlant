import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteFooter } from '../../components/SiteFooter'

const SITE_URL = 'https://peak-plant.com'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isDE = params.locale === 'de'
  return {
    title: 'PeakPlant — collect moments. grow together.',
    description: isDE
      ? 'Edition 01. Ein Kartenset voller echter Momente — Dates, Acts, Questions. Plus Saatpapierkarte. Für die Momente, die bleiben. Startet August 2026.'
      : 'Edition 01. A deck of real moments — dates, acts, questions. Plus a seed paper card. Made for the moments that stay with you. Launching August 2026.',
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

export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  if (!['en', 'de'].includes(params.locale)) notFound()
  return (
    <>
      {children}
      <SiteFooter locale={params.locale} />
    </>
  )
}
