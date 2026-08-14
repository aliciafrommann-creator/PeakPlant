# PeakPlant — Shop & Automatisierung Setup

> Stand: 14.08.2026 (P0-Ehrlichkeits-Sprint). Beschreibt den Code, wie er IST —
> die frühere Version dieser Datei beschrieb noch Kondom-Abos und ein
> /01-Zugangs-Gate, die es im Code nie gab.

Dieser Leitfaden bringt den kompletten Bestellvorgang live: Stripe-Checkout,
automatische Bestätigungs-Mails, Bestellverwaltung im Admin-Panel und
Supplier-Weiterleitung per Klick. Die digitale Welt der Edition
(`/edition-01`, früher `/01`) ist eine **öffentliche Seite ohne Gate** —
bewusst, damit die Karten ohne App und ohne Konto funktionieren.

---

## 1. Datenbank (Supabase) — einmalig

1. Supabase Dashboard → **SQL Editor** → **New query**
2. Inhalt von [`supabase/orders.sql`](./supabase/orders.sql) einfügen und ausführen
   (bereits geschehen — die `orders`-Tabelle ist live).
3. Für die Rate-Limits der öffentlichen Routen zusätzlich
   `supabase/migrations/0017_rate_limits.sql` ausführen (Reihenfolge:
   erst `0015`, siehe `supabase/README.md`). Ohne 0017 läuft der Shop trotzdem —
   die Drossel fällt dann auf die schwächere In-Memory-Schicht zurück und
   loggt das ehrlich.

Die bestehende `subscribers`-Tabelle (Waitlist/Newsletter) bleibt unverändert.

---

## 2. Stripe — Produkte & Preise anlegen

Im Stripe Dashboard → **Produkte** (alles Einmalzahlungen, keine Abos):

| Produkt | Env-Variable |
|---|---|
| Founders Edition — Edition 01 Deck (Preorder) | `STRIPE_PRICE_FOUNDERS` |
| 3er Pack — Edition 01 | `STRIPE_PRICE_PACK_3` |
| 12er Pack — Edition 01 | `STRIPE_PRICE_PACK_12` |

Jeweils die **Price-ID** (`price_…`) kopieren — nicht die Produkt-ID.

> Versandkosten sind im Preis enthalten. Die Lieferadresse wird im Checkout
> für AT, DE, CH, LU, BE, NL automatisch abgefragt.
>
> **Preorder-Modell:** Edition 01 läuft als Vorbestellung, **Versand Oktober
> 2026** (eine Aussage, überall). Die Karte wird bei Bestellung sofort
> belastet; Kund:innen sind bis zum Versand jederzeit zu 100 % erstattbar.
>
> **Produktinhalt:** ein Deck mit zwanzig Moment-Karten (grow dates, small
> acts, growing questions) + eine Saatpapierkarte (Sonnenblumen) + die
> öffentliche digitale Welt der Edition.

### Webhook einrichten
Stripe Dashboard → **Entwickler → Webhooks → Endpoint hinzufügen**
- URL: `https://peak-plant.com/api/webhook/stripe`
- Events: `checkout.session.completed`, `customer.subscription.deleted`
- Signing secret (`whsec_…`) kopieren → `STRIPE_WEBHOOK_SECRET`

---

## 3. Environment-Variablen (Vercel → Settings → Environment Variables)

```
# ── Stripe ───────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_…
STRIPE_WEBHOOK_SECRET=whsec_…
STRIPE_PRICE_FOUNDERS=price_…
STRIPE_PRICE_PACK_3=price_…
STRIPE_PRICE_PACK_12=price_…

# ── Supabase ─────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://….supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ…
SUPABASE_SERVICE_ROLE_KEY=eyJ…          # NUR server-seitig, niemals öffentlich

# ── E-Mail (ein Anbieter genügt) ─────────────────────────
# Der Versand läuft über lib/email.ts. Gesetzt wird EINER der beiden Keys;
# ist Brevo gesetzt, gewinnt Brevo. Ist keiner gesetzt, wird nichts versendet
# und die Seite sagt das ehrlich, statt ein Postfach zu versprechen.
BREVO_API_KEY=xkeysib-…                  # Brevo, Free-Tarif reicht für die Warteliste
RESEND_API_KEY=re_…                      # Alternative

# ── Secrets (PFLICHT — die Routen sind fail-closed) ──────
# NEWSLETTER_SECRET signiert die Abmelde-Links. Ohne gesetzten Wert lehnen
# Waitlist-Anmeldung und Newsletter-Versand ab (kein 'dev-secret'-Fallback
# mehr — der machte Abmelde-Token für jeden vorhersagbar, Befund H3).
NEWSLETTER_SECRET=ein-langes-zufälliges-secret
CRON_SECRET=ein-weiteres-zufälliges-secret   # Vercel-Cron für den Monatsbrief
ADMIN_SECRET=ein-langes-zufälliges-passwort

# ── Admin & Supplier ─────────────────────────────────────
SUPPLIER_EMAIL=supplier@beispiel.com    # wohin Versandaufträge gehen
OWNER_EMAIL=…                            # wohin Bestell-Benachrichtigungen gehen

# ── Community (optional, /members) ───────────────────────
WHATSAPP_COMMUNITY_URL=https://chat.whatsapp.com/…   # nur hinter Login ausgegeben

# ── Allgemein ────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://peak-plant.com
```

Nach dem Setzen: **Redeploy** auslösen, damit die Variablen greifen. Prüfen:
`GET /api/health?key=<ADMIN_SECRET>` zeigt, welche Variablen gesetzt sind.

---

## 4. So läuft der komplette Flow

```
Kunde klickt "vorbestellen" im Shop
        │
        ▼
/api/checkout  ──►  Stripe Checkout (Adresse + Zahlung)   [Rate-Limit 10/h/IP]
        │
        ▼
Stripe  ──►  /api/webhook/stripe  (checkout.session.completed, signaturgeprüft)
        │
        ├──►  Bestellung in Supabase `orders` gespeichert (Status: pending)
        ├──►  Kunde bekommt Bestätigung + Link auf /edition-01
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
- **Jetzt zahlen** (Stripe): gibt dir sofort Cashflow. Bestellung landet mit
  `payment_status = paid`.
- **Reservieren & auf Rechnung zahlen** (`/api/reserve`, Rate-Limit 5/h/IP):
  keine Zahlung nötig. Bestellung landet mit `payment_status = invoice`
  (im Admin gelb „rechnung offen"). Hinweis: es gibt aktuell **keinen
  UI-Aufrufer** für diese Route — sie wartet auf Phase 1.

**Rechnung per Klick senden:** Bei Bestellungen mit `payment_status = invoice`
erscheint im Admin ein Button **„rechnung senden →"**. Ein Klick legt in Stripe
einen Kunden + eine Rechnung an und verschickt automatisch einen gehosteten
Zahllink per E-Mail (14 Tage Zahlungsziel).

### Die digitale Welt (`/edition-01`)
- **Öffentliche Seite, kein Gate.** Briefe, Monatsfrage, Playlist, Fragenwand.
  Der QR auf der Einlegekarte zeigt auf `peak-plant.com/01`, das permanent
  auf `/edition-01` weiterleitet — die Karte funktioniert ohne Konto, ohne
  App, ohne Bestell-Mail (Produktprinzip: die Karte hängt nie von der App ab).
- `orders.access_token` wird weiterhin gespeichert, aber nirgends geprüft.
  Falls je ein echtes Gate gewünscht ist, ist das der Baustein dafür — bis
  dahin verspricht keine Mail und keine Karte mehr „exklusiven" Zugang.

---

## 5. Admin-Panel

`https://peak-plant.com/admin` → mit `ADMIN_SECRET` einloggen.

- Alle Bestellungen, filterbar nach offen / weitergeleitet
- Pro Bestellung: Kunde, Lieferadresse, Produkt (`pack_3` / `founders` /
  `pack_12`), Betrag, Zahlungs- und Versandstatus
- **Ein-Klick-Weiterleitung** an den Supplier
- `/admin/card`: Druckvorlage der Einlegekarte (85×55 mm)
- Das Passwort wird nur in der Session gehalten (sessionStorage), nicht dauerhaft.

---

## 6. Noch offen / nächste Schritte

- [ ] Stripe Live-Keys statt Test-Keys eintragen, sobald bereit
- [ ] `NEWSLETTER_SECRET` in Vercel prüfen/setzen (Pflicht — s. o.)
- [ ] Migrationen 0015–0019 im SQL-Editor ausführen (s. `supabase/README.md`)
- [ ] Supplier-E-Mail final festlegen (`SUPPLIER_EMAIL`)
- [ ] Versand einmal prüfen: `GET /api/health?key=<ADMIN_SECRET>&testmail=deine@adresse.de`
- [ ] Einlegekarte (`/admin/card`) freigeben und drucken — Copy ist seit dem
      P0-Sprint ehrlich (kein „unlocks instantly" mehr); Gedrucktes ist nicht
      patchbar, also vor dem Druck noch einmal lesen
- [ ] Test-Bestellung im Stripe-Testmodus durchspielen (Karte `4242 4242 4242 4242`)
