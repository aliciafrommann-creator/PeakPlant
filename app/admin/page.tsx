'use client'
import { useState, useEffect, useCallback } from 'react'

const PP = '"Helvetica Neue", Helvetica, Arial, sans-serif'

type Order = {
  id: string
  created_at: string
  email: string
  product: string
  shipping_name: string | null
  shipping_address_line1: string | null
  shipping_address_line2: string | null
  shipping_city: string | null
  shipping_postal_code: string | null
  shipping_country: string | null
  amount_total_cents: number | null
  currency: string
  payment_status: string
  status: string
  supplier_forwarded_at: string | null
}

const PAYMENT_LABEL: Record<string, { label: string; color: string }> = {
  paid:     { label: 'bezahlt',         color: '#16a34a' },
  invoice:  { label: 'rechnung offen',  color: '#C9A96E' },
  refunded: { label: 'erstattet',       color: '#888' },
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:   { label: 'offen',          color: '#C9A96E' },
  forwarded: { label: 'weitergeleitet', color: '#16a34a' },
  cancelled: { label: 'storniert',      color: '#e74c3c' },
}

export default function AdminPage() {
  const [secret, setSecret]   = useState('')
  const [authed, setAuthed]   = useState(false)
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [forwarding, setForwarding] = useState<string | null>(null)
  const [filter, setFilter]   = useState<'all' | 'pending' | 'forwarded'>('all')

  const load = useCallback(async (s: string) => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/orders', { headers: { 'x-admin-secret': s } })
      if (res.status === 401) { setError('Falsches Passwort.'); setAuthed(false); return }
      const data = await res.json()
      setOrders(Array.isArray(data.orders) ? data.orders : [])
      setAuthed(true)
    } catch { setError('Fehler beim Laden.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem('pp_admin_secret')
    if (saved) { setSecret(saved); load(saved) }
  }, [load])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    sessionStorage.setItem('pp_admin_secret', secret)
    load(secret)
  }

  async function forward(orderId: string) {
    if (!confirm('Diese Bestellung an den Supplier weiterleiten?')) return
    setForwarding(orderId)
    try {
      const res = await fetch('/api/admin/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error ?? 'Fehler'); return }
      await load(secret)
    } finally { setForwarding(null) }
  }

  const fmtAmount = (o: Order) =>
    o.amount_total_cents != null ? `${(o.amount_total_cents / 100).toFixed(2)} ${o.currency.toUpperCase()}` : '—'

  const fmtDate = (s: string) =>
    new Date(s).toLocaleString('de-AT', { timeZone: 'Europe/Vienna', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  const visible = orders.filter(o => filter === 'all' ? true : o.status === filter)
  const pendingCount = orders.filter(o => o.status === 'pending').length

  if (!authed) {
    return (
      <div style={{ fontFamily: PP, background: '#fff', color: '#1A1A1A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'auto' }}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 320, width: '100%', padding: '2rem' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4 }}>∧ peakplant admin</p>
          <input type="password" value={secret} onChange={e => setSecret(e.target.value)} placeholder="admin passwort" autoFocus
            style={{ fontFamily: PP, fontSize: 14, padding: '0.85rem 1rem', border: '1px solid #1A1A1A', outline: 'none', background: 'transparent' }} />
          <button type="submit" disabled={loading}
            style={{ fontFamily: PP, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.85rem', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {loading ? '...' : 'einloggen'}
          </button>
          {error && <p style={{ fontSize: 12, color: '#e74c3c' }}>{error}</p>}
        </form>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: PP, background: '#fff', color: '#1A1A1A', minHeight: '100vh', padding: '3rem 2rem', cursor: 'auto' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.4, marginBottom: 6 }}>∧ peakplant admin</p>
            <h1 style={{ fontSize: 28, fontWeight: 200, letterSpacing: '-0.02em' }}>bestellungen</h1>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: 13 }}>
            <span style={{ opacity: 0.5 }}>{orders.length} gesamt</span>
            <span style={{ color: '#C9A96E' }}>{pendingCount} offen</span>
            <button onClick={() => load(secret)} disabled={loading}
              style={{ fontFamily: PP, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid #ddd', padding: '4px 12px', cursor: 'pointer' }}>
              {loading ? '...' : 'aktualisieren'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['all', 'pending', 'forwarded'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                fontFamily: PP, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '6px 14px', cursor: 'pointer', border: '1px solid',
                borderColor: filter === f ? '#1A1A1A' : '#e0e0e0',
                background: filter === f ? '#1A1A1A' : 'transparent',
                color: filter === f ? '#fff' : '#888',
              }}>
              {f === 'all' ? 'alle' : f === 'pending' ? 'offen' : 'weitergeleitet'}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p style={{ fontSize: 14, opacity: 0.4, padding: '3rem 0' }}>keine bestellungen.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#ececec', border: '1px solid #ececec' }}>
            {visible.map(o => {
              const st = STATUS_LABEL[o.status] ?? { label: o.status, color: '#888' }
              return (
                <div key={o.id} style={{ background: '#fff', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr auto', gap: '1.5rem', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 10, fontFamily: 'monospace', opacity: 0.4, marginBottom: 4 }}>#{o.id.slice(0, 8).toUpperCase()}</p>
                    <p style={{ fontSize: 14, fontWeight: 400 }}>{o.email}</p>
                    <p style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>{fmtDate(o.created_at)}</p>
                  </div>

                  <div style={{ fontSize: 13, lineHeight: 1.5, color: '#555' }}>
                    {o.shipping_name ? (
                      <>
                        <p style={{ color: '#1A1A1A' }}>{o.shipping_name}</p>
                        <p>{o.shipping_address_line1}{o.shipping_address_line2 ? `, ${o.shipping_address_line2}` : ''}</p>
                        <p>{o.shipping_postal_code} {o.shipping_city} · {o.shipping_country}</p>
                      </>
                    ) : <span style={{ opacity: 0.4 }}>keine adresse</span>}
                  </div>

                  <div>
                    <p style={{ fontSize: 13 }}>{o.product === 'founders' ? 'Founders Edition' : 'Subscription'}</p>
                    <p style={{ fontSize: 13, color: '#16a34a', marginTop: 2 }}>{fmtAmount(o)}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                      {(() => { const p = PAYMENT_LABEL[o.payment_status] ?? { label: o.payment_status, color: '#888' }; return (
                        <span style={{ display: 'inline-block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.color, border: `1px solid ${p.color}`, padding: '2px 8px', borderRadius: 2 }}>{p.label}</span>
                      ) })()}
                      <span style={{ display: 'inline-block', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: st.color, border: `1px solid ${st.color}`, padding: '2px 8px', borderRadius: 2 }}>
                        {st.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    {o.status === 'pending' ? (
                      <button onClick={() => forward(o.id)} disabled={forwarding === o.id}
                        style={{ fontFamily: PP, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '10px 18px', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {forwarding === o.id ? '...' : 'an supplier →'}
                      </button>
                    ) : o.status === 'forwarded' ? (
                      <p style={{ fontSize: 11, opacity: 0.4, whiteSpace: 'nowrap' }}>
                        ✓ {o.supplier_forwarded_at ? fmtDate(o.supplier_forwarded_at) : ''}
                      </p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
