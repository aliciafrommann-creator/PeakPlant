import { MetadataRoute } from 'next'

const BASE = 'https://peak-plant.com'
const LOCALES = ['en', 'de']

// Pages that stay at root (no locale prefix)
const GLOBAL_PAGES = ['/shop', '/journal']
// Pages that exist in both locales under /[locale]/
const LOCALE_CONTENT_PAGES = ['/philosophy', '/intimacy', '/community', '/about', '/ethics', '/01']
const LEGAL_PAGES = ['/impressum', '/datenschutz', '/agb']
const JOURNAL_ARTICLES = [
  '/journal/why-the-card-has-a-question',
  '/journal/the-case-for-slowness',
  '/journal/what-emotional-safety-feels-like',
  '/journal/performance-entered-intimacy',
  '/journal/the-systems-behind-disconnection',
  '/journal/you-are-allowed-to-be-fully-alive',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const homepages = LOCALES.map(locale => ({
    url: `${BASE}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1,
    alternates: {
      languages: Object.fromEntries(LOCALES.map(l => [l, `${BASE}/${l}`])),
    },
  }))

  const globalPages = GLOBAL_PAGES.map(path => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))

  const localeContentPages = LOCALE_CONTENT_PAGES.flatMap(path =>
    LOCALES.map(locale => ({
      url: `${BASE}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(LOCALES.map(l => [l, `${BASE}/${l}${path}`])),
      },
    }))
  )

  const journalPages = JOURNAL_ARTICLES.map(path => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  const legalPages = LEGAL_PAGES.map(path => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.2,
  }))

  return [...homepages, ...globalPages, ...localeContentPages, ...journalPages, ...legalPages]
}
