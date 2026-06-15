# PeakPlant — Shop & Automatisierung Setup

Dieser Leitfaden bringt den kompletten Bestellvorgang live: Stripe-Checkout,
automatische Bestätigungs-Mails, Bestellverwaltung im Admin-Panel,
Supplier-Weiterleitung per Klick und den gesicherten digitalen Zugang über `/01`.

---

## 1. Datenbank (Supabase) — einmalig

1. Supabase Dashboard → **SQL Editor** → **New query**
2. Inhalt von [`supabase/orders.sql`](./supabase/orders.sql) einfügen und ausführen.

Damit entsteht die `orders`-Tabelle, in der jede Bestellung landet.
Die bestehende `subscribers`-Tabelle (Waitlist/Newsletter) bleibt unverändert.

---

## 2. Stripe — Produkte & Preise anlegen

Im Stripe Dashboard → **Produkte**:

| Produkt | Typ | Preis | Env-Variable |
|---|---|---|---|
| Founders Edition (Preorder) | Einmalzahlung | 7,99 € | `STRIPE_PRICE_FOUNDERS` |
| Abo — 6 Stück/Monat | Wiederkehrend / Monat | 7,40 € | `STRIPE_PRICE_SUB_6` |
| Abo — 9 Stück/Monat | Wiederkehrend / Monat | 10,40 € | `STRIPE_PRICE_SUB_9` |
| Abo — 12 Stück/Monat | Wiederkehrend / Monat | 13,40 € | `STRIPE_PRICE_SUB_12` |

> **Versand beim Abo:** 6-Stück-Abo schließt keinen Gratisversand ein (Stripe Shipping Rate
> für ~1,99 € ergänzen oder direkt im Preis einrechnen). Ab 9 Stück ist der Versand frei
> — auf der Website so kommuniziert.

Jeweils die **Price-ID** (`price_…`) kopieren — nicht die Produkt-ID.

> Versandkosten sind im Founders-Preis enthalten. Die Lieferadresse wird im
> Checkout für AT, DE, CH, LU, BE, NL automatisch abgefragt.
>
> **Preorder-Modell:** Edition 01 läuft das ganze Jahr als Vorbestellung. Die
> Karte wird bei Bestellung sofort belastet, Versand Mitte August 2026. Kunden
> sind jederzeit bis zum Versand zu 100 % erstattbar — der digitale Zugang
> kommt sofort nach der Bestellung als Sneak-Peek per Mail.
>
> **Produktinhalt:** 6 Kondome (vegan, nachhaltig) + 1 Fragenkarte (6 Fragen) +
> digitaler Zugang. Die 6 Fragen sind auf EINER Karte (nicht 6 Karten). Druck
> der Fragen direkt auf die Verpackung folgt in einer späteren Edition.

### Webhook einrichten
Stripe Dashboard → **Entwickler → Webhooks → Endpoint hinzufügen**
- URL: `https://peakplant.com/api/webhook/stripe`
- Events: `checkout.session.completed`, `customer.subscription.deleted`
- Signing secret (`whsec_…`) kopieren → `STRIPE_WEBHOOK_SECRET`

---

## 3. Environment-Variablen (Vercel → Settings → Environment Variables)

```
# ── Stripe ───────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_…
STRIPE_WEBHOOK_SECRET=whsec_…
STRIPE_PRICE_FOUNDERS=price_…
STRIPE_PRICE_SUB_6=price_…              # 6 Stück/Monat · 7,40 €
STRIPE_PRICE_SUB_9=price_…              # 9 Stück/Monat · 10,40 € (free shipping)
STRIPE_PRICE_SUB_12=price_…             # 12 Stück/Monat · 13,40 € (free shipping)

# ── Supabase ─────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://….supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ…
SUPABASE_SERVICE_ROLE_KEY=eyJ…          # NUR server-seitig, niemals öffentlich

# ── E-Mail (Resend) ──────────────────────────────────────
RESEND_API_KEY=re_…

# ── Admin & Supplier ─────────────────────────────────────
ADMIN_SECRET=ein-langes-zufälliges-passwort
SUPPLIER_EMAIL=supplier@beispiel.com    # wohin Versandaufträge gehen
OWNER_EMAIL=hello@peakplant.com         # wohin Bestell-Benachrichtigungen gehen

# ── Allgemein ────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://peakplant.com
```

Nach dem Setzen: **Redeploy** auslösen, damit die Variablen greifen.

---

## 4. So läuft der komplette Flow

```
Kunde klickt "vorbestellen" im Shop
        │
        ▼
/api/checkout  ──►  Stripe Checkout (Adresse + Zahlung)
        │
        ▼
Stripe  ──►  /api/webhook/stripe  (checkout.session.completed)
        │
        ├──►  Bestellung in Supabase `orders` gespeichert (Status: pending)
        ├──►  Kunde bekommt Bestätigung + persönlichen Zugangslink (/01?token=…)
        └──►  Du bekommst Benachrichtigung an OWNER_EMAIL
        │
        ▼
Du öffnest /admin  ──►  siehst alle Bestellungen
        │
        ▼
Klick "an supplier →"  ──►  /api/admin/forward
        │
        ├──►  Supplier bekommt formatierten Versandauftrag (Adresse + Inhalt)
        └──►  Bestellung-Status wird auf "forwarded" gesetzt
```

### Zwei Wege zu bestellen
- **Jetzt zahlen** (Stripe): gibt dir sofort Cashflow, Kunde bekommt Sneak-Peek.
  Bestellung landet mit `payment_status = paid`.
- **Reservieren & auf Rechnung zahlen** (`/api/reserve`): keine Zahlung nötig,
  Kunde bekommt trotzdem den Sneak-Peek + Hinweis auf spätere Rechnung.
  Bestellung landet mit `payment_status = invoice` (im Admin gelb „rechnung offen").
  Die Rechnung/den Zahllink schickst du später manuell (z. B. Stripe Payment Link).

> Im Admin-Panel siehst du pro Bestellung den Zahlungsstatus (bezahlt /
> rechnung offen / erstattet) zusätzlich zum Versandstatus.

**Rechnung per Klick senden:** Bei Bestellungen mit `payment_status = invoice`
erscheint im Admin ein Button **„rechnung senden →"**. Ein Klick legt in Stripe
einen Kunden + eine Rechnung an und verschickt automatisch einen gehosteten
Zahllink per E-Mail (14 Tage Zahlungsziel). Sobald der Kunde zahlt, kommt das
`invoice.paid`-Event — Betrag und Status kannst du in Stripe verfolgen. Nach dem
Senden zeigt das Panel „✓ rechnung gesendet" mit Zeitstempel.

### Digitaler Zugang (`/01`)
- **Per E-Mail-Link:** `/01?token=…` entsperrt automatisch und merkt sich das
  Gerät per Cookie (1 Jahr).
- **Per QR-Karte in der Box:** QR führt auf `/01` → Kunde gibt die Bestell-E-Mail
  ein → wird gegen die `orders`-Tabelle geprüft → entsperrt.
- Wer keine Bestellung hat, sieht ein Gate mit Link zum Shop.

> **QR-Karten-Hinweis:** Da die Karten in Auflage gedruckt werden, trägt der
> QR keinen individuellen Token, sondern zeigt schlicht auf
> `https://peakplant.com/01`. Die Zugangskontrolle passiert dann über die
> E-Mail-Eingabe. Wer einen individuellen Link will, bekommt ihn per
> Bestell-Mail.

---

## 5. Admin-Panel

`https://peakplant.com/admin` → mit `ADMIN_SECRET` einloggen.

- Alle Bestellungen, filterbar nach offen / weitergeleitet
- Pro Bestellung: Kunde, Lieferadresse, Produkt, Betrag, Status
- **Ein-Klick-Weiterleitung** an den Supplier
- Das Passwort wird nur in der Session gehalten (sessionStorage), nicht dauerhaft.

---

## 6. Noch offen / nächste Schritte

- [ ] Stripe Live-Keys statt Test-Keys eintragen, sobald bereit
- [ ] `orders.sql` in Supabase ausführen
- [ ] Supplier-E-Mail final festlegen (`SUPPLIER_EMAIL`)
- [ ] Domain `peakplant.com` in Resend verifizieren (für Absender `hello@peakplant.com`)
- [ ] Kärtchen-Design (1 Karte, 6 Fragen) mit QR auf `https://peakplant.com/01` finalisieren & drucken
- [ ] Test-Bestellung im Stripe-Testmodus durchspielen (Karte `4242 4242 4242 4242`)
- [ ] Entscheiden: Abo-Modell (27€ + 12,90€/mo) im Preorder-Jahr behalten oder pausieren?
