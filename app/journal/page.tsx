'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 38" fill="none">
      <path d="M4 34 L24 4 L44 34" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const posts = [
  {
    slug: 'performance-entered-intimacy',
    category: 'Vulnerability',
    title: 'Performance entered intimacy.',
    excerpt: 'We learned to optimize everything — our productivity, our appearance, our feeds. At some point, without noticing, we started optimizing our relationships too. This is about what that costs us.',
    date: 'May 2025',
    readTime: '5 min',
    image: '/scenery-1.jpg',
  },
  {
    slug: 'the-systems-behind-disconnection',
    category: 'Systems Thinking',
    title: 'The systems behind disconnected intimacy.',
    excerpt: 'Disconnected intimacy is not a personal failure. It is a symptom — created by larger systems: social media, dating apps, performance culture, emotional illiteracy. Understanding the system changes everything.',
    date: 'May 2025',
    readTime: '7 min',
    image: '/scenery-2.jpg',
  },
  {
    slug: 'the-case-for-slowness',
    category: 'Embodiment',
    title: 'The case for slowness.',
    excerpt: 'The best moments of closeness tend to happen in the gaps — the pauses, the silences, the in-betweens. We have been trained to move fast. This is a case for not doing that.',
    date: 'April 2025',
    readTime: '4 min',
    image: '/scenery-3.jpg',
  },
  {
    slug: 'what-emotional-safety-feels-like',
    category: 'Relationships',
    title: 'What emotional safety actually feels like.',
    excerpt: 'It is not the absence of conflict. It is the presence of trust — the knowledge that you can be yourself without risking the relationship. Once you feel it, you understand why everything else is harder without it.',
    date: 'April 2025',
    readTime: '5 min',
    image: '/scenery-4.jpg',
  },
  {
    slug: 'you-are-allowed-to-be-fully-alive',
    category: 'Aliveness',
    title: 'You are allowed to be fully alive.',
    excerpt: 'Not performing aliveness. Not optimizing for it. Just feeling it — the warmth, the electricity, the strangeness and privilege of being a person who can feel things. This is what PeakPlant is really about.',
    date: 'March 2025',
    readTime: '4 min',
    image: '/bw-grid-2.png',
  },
  {
    slug: 'why-the-wrapper-has-a-question',
    category: 'Design',
    title: 'Why the wrapper has a question on it.',
    excerpt: 'A product designed for one of the most tender moments in human life — and most of the time it comes in packaging that feels clinical, aggressive, or just awkward. We wanted to make something different.',
    date: 'March 2025',
    readTime: '3 min',
    image: '/product-hero.png',
  },
]

export default function JournalPage() {
  const [featured, ...rest] = posts

  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#1A1A1A' }}>
          <Logo size={32} />
        </Link>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {[['/', 'Home'], ['/intimacy', 'Intimacy'], ['/philosophy', 'Philosophy'], ['/shop', 'Shop'], ['/journal', 'Journal'], ['/community', 'Community']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#1A1A1A', opacity: href === '/journal' ? 1 : 0.5 }}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <section style={{ paddingTop: '9rem', paddingBottom: '4rem', maxWidth: 1100, margin: '0 auto', padding: '9rem 2.5rem 4rem' }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '1.5rem' }}
        >
          Journal
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em' }}
        >
          On vulnerability, systems, and the courage to feel.
        </motion.h1>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem 5rem', borderBottom: '1px solid #e8e8e8' }}>
        <Link href={`/journal/${featured.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', cursor: 'pointer' }}
          >
            <div style={{ aspectRatio: '4/3', background: '#f5f5f5', overflow: 'hidden' }}>
              <img src={featured.image} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.4 }}>{featured.category}</p>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.4 }}>{featured.date}</p>
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.4rem)', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                {featured.title}
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.75, color: '#555' }}>{featured.excerpt}</p>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5 }}>{featured.readTime} read</p>
            </div>
          </motion.div>
        </Link>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem 2.5rem' }}>
          {rest.map((post, i) => (
            <Link key={post.slug} href={`/journal/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <motion.article
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer' }}
              >
                <div style={{ aspectRatio: '4/3', background: '#f5f5f5', overflow: 'hidden', marginBottom: '0.5rem' }}>
                  <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.4 }}>{post.category}</p>
                  <p style={{ fontSize: '0.6rem', letterSpacing: '0.1em', opacity: 0.35 }}>{post.date}</p>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 400, lineHeight: 1.35, letterSpacing: '-0.01em' }}>{post.title}</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#666' }}>{post.excerpt}</p>
                <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.45, marginTop: '0.25rem' }}>{post.readTime} read</p>
              </motion.article>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
