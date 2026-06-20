import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isDE = params.locale === 'de'
  return {
    title: isDE ? 'philosophie — peakplant · warum verbindung zählt' : 'philosophy — peakplant · why connection matters',
    description: isDE
      ? 'die wissenschaft hinter peakplant. psychologische sicherheit, verletzlichkeit und warum das tiefste menschliche bedürfnis ist, wirklich gesehen zu werden. forschung von Amy Edmondson, Brené Brown, Simon Sinek.'
      : 'the science behind peakplant. psychological safety, vulnerability, and why the deepest human need is to be truly seen. research by Amy Edmondson, Brené Brown, Simon Sinek.',
    alternates: {
      canonical: `https://peak-plant.com/${params.locale}/philosophy`,
      languages: { en: 'https://peak-plant.com/en/philosophy', de: 'https://peak-plant.com/de/philosophy' },
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
