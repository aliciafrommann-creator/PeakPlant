import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://peak-plant.com'
  const pages = ['/', '/shop', '/philosophy', '/ethics', '/about', '/intimacy', '/community', '/journal', '/01']
  return pages.map(path => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.8,
  }))
}
