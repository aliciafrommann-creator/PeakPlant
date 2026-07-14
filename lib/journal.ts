// The journal IS the newsletter. Each month the monthly letter features one
// of these pieces, alongside a personal founder note written at send time.
// Add new articles to the top as they are published.

export type JournalArticle = {
  slug: string
  category: string
  title: string
  excerpt: string
}

export const journalArticles: JournalArticle[] = [
  {
    slug: 'why-the-card-has-a-question',
    category: 'Design',
    title: 'Why every card asks a question.',
    excerpt:
      'Most card games are designed to fill time. We wanted our cards to do the opposite — to create a small moment of pause, so two people actually look at each other before anything else happens.',
  },
  {
    slug: 'the-case-for-slowness',
    category: 'Embodiment',
    title: 'The case for slowness.',
    excerpt:
      'The best moments with another person almost always happen in the gaps. Not during the planned thing — in the pause before, the drive home, the moment neither of you is performing.',
  },
  {
    slug: 'what-emotional-safety-feels-like',
    category: 'Relationships',
    title: 'What emotional safety actually feels like.',
    excerpt:
      'Most people have never had a word for it. They have just noticed its absence — the subtle bracing, the things left unsaid, the conversations that feel like minefields you navigate.',
  },
  {
    slug: 'performance-entered-intimacy',
    category: 'Vulnerability',
    title: 'Performance entered intimacy.',
    excerpt:
      'There is a moment in most relationships when something shifts — when two people stop showing up for each other and start showing up as something for each other.',
  },
  {
    slug: 'the-systems-behind-disconnection',
    category: 'Systems',
    title: 'The systems behind disconnected intimacy.',
    excerpt:
      'When people feel disconnected, the first instinct is to look for a personal explanation. But often the cause is not personal at all — it is built into the systems we live inside.',
  },
  {
    slug: 'you-are-allowed-to-be-fully-alive',
    category: 'Aliveness',
    title: 'You are allowed to be fully alive.',
    excerpt:
      'At some point, most of us learned to regulate how much we feel. To turn things down, to be easier, less, more palatable. This is an invitation to stop doing that.',
  },
]

// Deterministic: advances by one each calendar month, cycles through the set.
export function articleForMonth(date = new Date()): JournalArticle {
  const idx = (date.getFullYear() * 12 + date.getMonth()) % journalArticles.length
  return journalArticles[idx]
}
