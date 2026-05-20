import { MetadataRoute } from 'next'

const BASE = 'https://peak-plant.com'
const LOCALES = ['en', 'de']
const PAGES = ['', '/shop', '/philosophy', '/about', '/ethics', '/intimacy', '/community']
const LEGAL = ['/impressum', '/datenschutz', '/agb']

export default function sitemap(): MetadataRoute.Sitemap {
  const localePages = LOCALES.flatMap(locale =>
    PAGES.map(path => ({
      url: `${BASE}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map(l => [l, `${BASE}/${l}${path}`])
        ),
      },
    }))
  )

  const legalPages = LEGAL.map(path => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }))

  return [...localePages, ...legalPages]
}
