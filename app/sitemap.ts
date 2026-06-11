import { MetadataRoute } from 'next'

const BASE = 'https://peak-plant.com'
const LOCALES = ['en', 'de']

// Global pages live at root level (not locale-prefixed)
const GLOBAL_PAGES = ['/shop', '/philosophy', '/intimacy', '/community', '/about', '/ethics', '/journal']
const LEGAL_PAGES = ['/impressum', '/datenschutz', '/agb']

export default function sitemap(): MetadataRoute.Sitemap {
  // Homepage is locale-specific
  const homepages = LOCALES.map(locale => ({
    url: `${BASE}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1,
    alternates: {
      languages: Object.fromEntries(LOCALES.map(l => [l, `${BASE}/${l}`])),
    },
  }))

  // Content pages are at root (no locale prefix)
  const globalPages = GLOBAL_PAGES.map(path => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const legalPages = LEGAL_PAGES.map(path => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }))

  return [...homepages, ...globalPages, ...legalPages]
}
