'use client'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

// Physical insert card: 85 × 55 mm (credit-card footprint, fits the box).
// The QR is a fixed target (peak-plant.com/01) since cards are printed in bulk —
// access is verified by the order email once the customer lands on /01.

export default function CardPrintPage() {
  return (
    <div style={{ fontFamily: PP, background: '#e9e9e7', minHeight: '100vh', color: '#1A1A1A', cursor: 'auto' }}>
      <style>{`
        @page { size: auto; margin: 12mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .sheet { background: #fff !important; padding: 0 !important; gap: 14mm !important; }
        }
      `}</style>

      {/* toolbar */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', borderBottom: '1px solid #d6d6d3', background: '#fff', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4, marginBottom: 4 }}>∧ peakplant — druckvorlage</p>
          <p style={{ fontSize: 14, opacity: 0.7 }}>einlegekarte · 85 × 55 mm · doppelseitig (front + back)</p>
        </div>
        <button onClick={() => window.print()}
          style={{ fontFamily: PP, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem 1.75rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
          drucken / als pdf speichern →
        </button>
      </div>

      {/* hint */}
      <p className="no-print" style={{ maxWidth: 720, margin: '1.5rem auto 0', padding: '0 2rem', fontSize: 13, lineHeight: 1.7, color: '#777' }}>
        tipp: im druckdialog „randlos" / „tatsächliche größe (100%)" wählen, skalierung aus.
        die karte ist exakt 85 × 55 mm. für professionellen druck mit anschnitt jede seite
        + 3 mm rundum als pdf an die druckerei geben. front auf eine seite, back auf die rückseite.
      </p>

      {/* sheet with both faces */}
      <div className="sheet" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', padding: '3rem 2rem' }}>

        {/* ── FRONT ─────────────────────────────────────────────── */}
        <div style={{
          width: '85mm', height: '55mm', background: '#1A1A1A', color: '#fff',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '7mm', boxSizing: 'border-box', boxShadow: '0 2px 24px rgba(0,0,0,0.18)', overflow: 'hidden',
        }}>
          <p style={{ fontSize: '7pt', letterSpacing: '0.28em', textTransform: 'uppercase', opacity: 0.55 }}>∧ peakplant</p>
          <div>
            <p style={{ fontSize: '15pt', fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              your digital world<br />is waiting.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '6.5pt', letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.45 }}>edition 01</p>
            <p style={{ fontSize: '6.5pt', letterSpacing: '0.12em', opacity: 0.45 }}>safe. soft. wild.</p>
          </div>
        </div>

        {/* ── BACK ──────────────────────────────────────────────── */}
        <div style={{
          width: '85mm', height: '55mm', background: '#faf9f7', color: '#1A1A1A',
          display: 'flex', alignItems: 'center', gap: '6mm',
          padding: '7mm', boxSizing: 'border-box', boxShadow: '0 2px 24px rgba(0,0,0,0.18)', overflow: 'hidden',
          border: '1px solid #ececea',
        }}>
          {/* QR */}
          <div style={{ width: '32mm', height: '32mm', flexShrink: 0, background: '#fff', padding: '2.5mm', boxSizing: 'border-box', border: '1px solid #ededed' }}>
            <img src="/qr-01.svg" alt="scan to enter peak-plant.com/01" style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>
          {/* instructions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm' }}>
            <p style={{ fontSize: '6.5pt', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4 }}>scan to enter</p>
            <p style={{ fontSize: '11pt', fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1.25 }}>
              step into edition 01
            </p>
            <p style={{ fontSize: '7.5pt', lineHeight: 1.55, color: '#666', fontWeight: 300 }}>
              scan the code, then enter the email you ordered with. your world unlocks instantly.
            </p>
            <p style={{ fontSize: '7pt', letterSpacing: '0.06em', color: '#1A1A1A', opacity: 0.8, marginTop: '1mm' }}>
              peak-plant.com/01
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
