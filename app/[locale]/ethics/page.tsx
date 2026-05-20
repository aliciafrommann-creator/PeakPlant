'use client'
import { motion } from 'framer-motion'
import { NavBar } from '../../../components/NavBar'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

function IconLeaf() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 24C14 24 5 18 5 10C5 6.13 8.13 3 12 3C15 3 17.5 4.8 18.7 7.3C21.7 7.8 24 10.4 24 13.5C24 18.5 18 22 14 24Z" stroke="#1A1A1A" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M14 24V14" stroke="#1A1A1A" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconTruck() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="8" width="16" height="11" rx="1" stroke="#1A1A1A" strokeWidth="1.4" />
      <path d="M19 11H23L25 15V19H19V11Z" stroke="#1A1A1A" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="20" r="2" stroke="#1A1A1A" strokeWidth="1.4" />
      <circle cx="22" cy="20" r="2" stroke="#1A1A1A" strokeWidth="1.4" />
    </svg>
  )
}

function IconDocument() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="6" y="3" width="16" height="22" rx="1.5" stroke="#1A1A1A" strokeWidth="1.4" />
      <path d="M10 9H18M10 13H18M10 17H14" stroke="#1A1A1A" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconSeedling() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 22V12" stroke="#1A1A1A" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 16C14 16 9 16 9 11C9 11 13 9 16 11C17.5 12 18 14 14 16Z" stroke="#1A1A1A" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M14 13C14 13 15 10 19 10C19 10 19 14 14 14" stroke="#1A1A1A" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 22H20" stroke="#1A1A1A" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export default function EthicsPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const isDE = locale === 'de'

  const commitments = isDE ? [
    {
      icon: <IconLeaf />,
      headline: 'blauer engel verpackung',
      text: 'unsere boxen tragen das Blauer Engel Zertifikat — deutschlands strengstes umweltsiegel. recycelte materialien, klimaneutrale produktion, keine schädlichen chemikalien. die box, die du erhältst, ist so sauber wie ihr inhalt.',
    },
    {
      icon: <IconTruck />,
      headline: 'dhl gogreen versand',
      text: 'jede bestellung wird klimaneutral via dhl gogreen versendet. die emissionen deiner lieferung sind vollständig kompensiert. wir wählten dhl warenpost — das kleinstmögliche format für den kleinstmöglichen fußabdruck.',
    },
    {
      icon: <IconDocument />,
      headline: 'blauer engel karten',
      text: 'die sechs reflexionskarten in deiner box sind auf circle offset premium white gedruckt — 300g recyclingpapier, blauer engel zertifiziert. gedruckt von dieumweltdruckerei, deutschlands nachhaltigstem druckhaus.',
    },
    {
      icon: <IconSeedling />,
      headline: 'pflanzen. wachsen. sehen.',
      text: 'die saatpapierkarte in jeder box ist 100% pflanzbar. kein müll. sie wird zu wildblumen.',
    },
  ] : [
    {
      icon: <IconLeaf />,
      headline: 'blauer engel packaging',
      text: "our boxes carry the blauer engel certification — germany's strictest environmental label. recycled materials, climate-neutral production, no harmful chemicals. the box you receive is as clean as what's inside.",
    },
    {
      icon: <IconTruck />,
      headline: 'dhl gogreen shipping',
      text: 'every order ships climate-neutral via dhl gogreen. the emissions from your delivery are fully offset. we chose dhl warenpost — the smallest possible format for the smallest possible footprint.',
    },
    {
      icon: <IconDocument />,
      headline: 'blauer engel cards',
      text: "the six reflection cards in your box are printed on circle offset premium white — 300g recycled paper, certified with the blauer engel. printed by dieumweltdruckerei, germany's most sustainable print shop.",
    },
    {
      icon: <IconSeedling />,
      headline: 'plant it. watch it grow.',
      text: 'the seed paper card in every box is 100% plantable. no waste. it becomes wildflowers.',
    },
  ]

  const certifications = [
    { name: 'BLAUER ENGEL', description: isDE ? 'deutschlands strengstes umweltsiegel.\nunsere verpackung und karten.' : "germany's strictest environmental label.\nour packaging and cards." },
    { name: 'DHL GOGREEN', description: isDE ? 'klimaneutraler versand.\njede bestellung, jedes mal.' : 'climate-neutral shipping.\nevery order, every time.' },
    { name: 'FAIR RUBBER', description: isDE ? 'unser latex stammt von fair rubber zertifizierten lieferanten — zum schutz von arbeitnehmern und ökosystemen.' : 'our latex is sourced from fair rubber certified suppliers — protecting workers and ecosystems.' },
    { name: 'VEGAN', description: isDE ? 'alle produkte sind 100% vegan.\nkeine tierversuche. keine tierischen produkte.' : 'all products are 100% vegan.\nno animal testing. no animal products.' },
  ]

  const limitsItems = isDE ? [
    'unser kondomlieferant ist noch nicht b corp zertifiziert. wir suchen aktiv nach einem hersteller für fair rubber, veganen latex, der b corp standards erfüllt. das ist unsere größte offene herausforderung.',
    'unsere verpackung ist noch nicht 100% plastikfrei. die einzelnen kondomverpackungen benötigen eine schutzfolie. wir erforschen alternativen.',
    'wir sind eine junge marke. wir haben nicht alle antworten. aber wir verpflichten uns, unsere fortschritte ehrlich zu teilen.',
  ] : [
    "our condom supplier is not yet b corp certified. we are actively looking for a fair rubber, vegan latex manufacturer who meets b corp standards. this is our biggest open challenge.",
    "our packaging is not yet 100% plastic-free. the individual condom wrappers require a protective foil. we are researching alternatives.",
    "we are a young brand. we don't have all the answers. but we commit to sharing our progress — honestly.",
  ]

  const philosophyParas = isDE ? [
    'wir haben peakplant nicht aufgebaut, um eine nachhaltige marke zu sein.',
    'wir haben es aufgebaut, um eine marke zu sein, die zufällig die dinge richtig macht.',
    'weil wir glauben, das nachhaltigste, was wir tun können, ist etwas zu schaffen, das die menschen wirklich behalten.',
    'eine box, die auf einem nachttisch bleibt.\nkarten, die in brieftaschen wandern.\nein ritual, das alles verlangsamt.',
    'emotionale langlebigkeit ist auch nachhaltigkeit.',
  ] : [
    "we didn't build peakplant to be a sustainable brand.",
    'we built it to be a brand that happens to do things right.',
    'because we believe the most sustainable thing we can do is make something people actually keep.',
    'a box that stays on a nightstand.\ncards that get carried in wallets.\na ritual that slows everything down.',
    'emotional longevity is sustainability too.',
  ]

  return (
    <div style={{ fontFamily: PP, background: '#ffffff', color: '#1A1A1A', minHeight: '100vh' }}>
      <NavBar activePath="/ethics" />

      <section style={{ padding: '14rem 2.5rem 8rem', maxWidth: 780, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '2rem' }}>
          {isDE ? 'Ethik' : 'Ethics'}
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '2rem' }}>
          {isDE ? 'wir haben nichts\nzu verbergen.' : 'we have nothing\nto hide.'}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          style={{ fontSize: '1.15rem', lineHeight: 1.75, color: '#555', maxWidth: 520 }}>
          {isDE ? 'hier ist genau, was wir tun —\nund was noch nicht.' : "here is exactly what we do —\nand what we don't do yet."}
        </motion.p>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem' }}>
          {isDE ? '01 — versprechen' : '01 — commitments'}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '5rem' }}>
          {isDE ? 'was wir versprechen.' : 'what we commit to.'}
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4rem 6rem' }}>
          {commitments.map((c, i) => (
            <motion.div key={c.headline} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ opacity: 0.85 }}>{c.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{c.headline}</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#555', fontWeight: 300 }}>{c.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ background: '#F5F5F3', padding: '7rem 2.5rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem' }}>
            {isDE ? '02 — grenzen' : '02 — limits'}
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '3.5rem' }}>
            {isDE ? 'was wir noch nicht tun.' : "what we don't do yet."}
          </motion.h2>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
            <p style={{ fontSize: '1rem', lineHeight: 1.85, color: '#555', marginBottom: '2.5rem' }}>
              {isDE ? 'wir glauben daran, dir zu sagen, was wir noch nicht herausgefunden haben.' : "we believe in telling you what we haven't figured out yet."}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {limitsItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.3, flexShrink: 0 }}>—</span>
                  <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#444' }}>{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem' }}>
          {isDE ? '03 — zertifizierungen' : '03 — certifications'}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '4rem' }}>
          {isDE ? 'zertifiziert.' : 'certified.'}
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {certifications.map((cert, i) => (
            <motion.div key={cert.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{ border: '1px solid #1A1A1A', padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>{cert.name}</p>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: '#555', whiteSpace: 'pre-line' }}>{cert.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4, marginBottom: '1.5rem' }}>
            {isDE ? '04 — philosophie' : '04 — philosophy'}
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '3rem' }}>
            {isDE ? 'nachhaltigkeit ist kein feature.' : 'sustainability is not a feature.'}
          </motion.h2>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {philosophyParas.map((text, i) => (
              <p key={i} style={{ fontSize: '1.05rem', lineHeight: 1.85, color: i === 3 ? '#555' : '#444', fontStyle: i === 3 ? 'italic' : 'normal', fontWeight: i === 4 ? 400 : 300, whiteSpace: 'pre-line' }}>
                {text}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid #e8e8e8', padding: '7rem 2.5rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.4 }}>05 — {isDE ? 'kontakt' : 'contact'}</p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            {isDE ? 'fragen? wir antworten.' : 'questions? we answer.'}
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#555' }}>
            {isDE
              ? 'wenn du mehr über unsere lieferanten, zertifizierungen oder produktion wissen möchtest — frag einfach.'
              : 'if you want to know more about our suppliers, our certifications, or our production — just ask.'}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#1A1A1A', opacity: 0.6 }}>hello@peak-plant.com</p>
          <a href="mailto:hello@peak-plant.com" style={{ fontFamily: PP, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '1rem 2.5rem', background: 'transparent', color: '#1A1A1A', border: '1px solid #1A1A1A', textDecoration: 'none', display: 'inline-block' }}>
            {isDE ? 'schreib uns' : 'write to us'}
          </a>
        </motion.div>
      </section>

      <div style={{ borderTop: '1px solid #ebebeb', padding: '2rem 2.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.7rem', color: '#1A1A1A', opacity: 0.3, fontFamily: PP }}>
          {isDE ? 'zuletzt aktualisiert: mai 2026. wir aktualisieren diese seite, wenn wir mehr lernen.' : 'last updated: may 2026. we update this page as we learn more.'}
        </p>
      </div>
    </div>
  )
}
