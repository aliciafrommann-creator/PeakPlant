# Website-Relaunch: Kondome → Kartensets + App-Experience

> Ausführungs-Briefing für die nächste Session. Grounded am 27.06.2026 durch
> Datei-Inventur: Kondom-Content steckt in genau den unten gelisteten Dateien.
> Regeln aus `MANIFESTO.md` gelten (keine Fake-Claims, im Zweifel untertreiben).

## Die neue Produktgeschichte (aus der App übernommen — Quelle: `mobile/lib/seed.ts`)

PeakPlant verkauft **physische Kartensets (Editionen)**, die mit der App leben:

- Eine **Edition** ist ein Deck aus **15–20 Momentkarten** (`DECK_SIZE_RANGE`),
  in drei Gruppen: **Dates, Acts, Questions** (pro Edition eigene Labels, z. B.
  „Grow Dates" bei Edition 01).
- **Der Loop:** Karte ziehen → echten Moment zusammen erleben → **QR scannen** →
  Foto + Notiz festhalten → das gemeinsame Tagebuch im Couple Space wächst.
  „collect moments. grow together."
- **Edition 01 — the sunflower** bleibt der Held (Symbol 🌻, Saatpapier-Karte
  mit Sonnenblumensamen BEHALTEN — das ist Marke). Weitere Editionen aus der
  App als „Roadmap" zeigen (upcoming, ehrlich als „coming" markiert).
- **Die App ist Teil des Produkts:** privater Couple/Friends Space, Weekly
  Challenge, Sammel-Emoji, Discover (kuratierte Date-Ideen), Orte-Karte.
  Privatsphäre-Versprechen wie in der App formulieren: Tagebuch privat für den
  Space; öffentlich wird nur, was aktiv anonym geteilt wird.

## Was BLEIBT (nicht anfassen)

- **Waitlist-Modus** im Shop (keine festgelegten Preise → keine neuen
  Preis-Claims erfinden; Stripe-Price-IDs sind Env-Config des Operators).
- Design-Sprache der Site (editorial, warm, lowercase-Emotion) — sie passt
  bereits zur App-Ästhetik.
- Journal als Format; Legal-Grundgerüst; API-Routen (checkout/reserve/waitlist
  funktionieren produktunabhängig über Env-Price-IDs).
- Launch-Zeitrahmen „ab august 2026" (sofern die Gründerin nichts anderes sagt).

## Datei-für-Datei (Kondom-Fundstellen, verifiziert per grep)

1. **`app/[locale]/page.tsx`** (Homepage): Hero-Copy Z.~85 („6 Kondome. 1
   Fragenkarte…") → Kartenset-Story (z. B. „ein Deck. 15–20 Momente. euer
   Tagebuch."). Alt-Text Z.~105. Den Scan→Preserve-Loop als Sektion erzählen;
   App-Teaser (Screens folgen, KEINE Fake-Screenshots).
2. **`app/shop/page.tsx`**: Produkt-Tiers umbauen — statt „3/6/12 condoms" z. B.
   Edition-01-Deck / Founders-Bundle (Deck + früher App-Zugang) / Duo (2 Decks).
   Feature-Listen: Karten-Anzahl, drei Gruppen, QR→App, Saatpapier. Vergleichs-
   Tabelle Z.~94 anpassen. Waitlist-CTA bleibt.
3. **`app/shop/layout.tsx`** + **`app/[locale]/layout.tsx`** + **`app/layout.tsx`**:
   Metadata/OG-Descriptions (Z.11/20/23/32 in app/layout.tsx) auf Kartenset.
4. **`app/[locale]/ethics/page.tsx`**: Material-Ethik von Latex auf Papier/Druck
   (FSC, Saatpapier, faire Produktion) umschreiben — NUR behaupten, was belegt
   ist; sonst weglassen (MANIFESTO §1).
5. **`app/journal/why-the-wrapper-has-a-question/page.tsx`** + **`lib/journal.ts`**:
   Artikel ist Kondom-spezifisch („wrapper"). Entweder umschreiben auf „warum
   jede Karte eine Frage trägt" oder aus der Liste nehmen.
6. **`app/agb/page.tsx`**: Produktbeschreibung anpassen. ⚠️ Rechtstext — Entwurf
   liefern, **Gründerin muss reviewen** (ggf. entfallen Kondom-spezifische
   Passagen wie Hygiene-Widerrufsausschluss §312g — kein Rechtsrat, Review!).
7. **`app/api/admin/forward/route.ts`**: Supplier-Weiterleitungs-Mail nennt das
   Produkt → Text anpassen (rein kosmetisch, Flow bleibt).

## Was ich NICHT kann (Operator)

- **Produktbilder**: `public/product-hero.png` zeigt das Kondom-Produkt. Neue
  Fotos/Renders des Kartensets müssen von dir kommen — bis dahin ehrlicher
  Platzhalter oder Karten-Typo-Komposition aus Web-Mitteln.
- Stripe-Produkte/Preise (Env), finale AGB-Freigabe, ggf. neue OG-Images.

## Vorgehen (nächste Session)

1. Branch `claude/website-cardsets`, Seiten in obiger Reihenfolge (Homepage →
   Shop → Metadata → Ethics → Journal → AGB-Entwurf → Admin-Mail).
2. Kleine Commits pro Seite; danach `npm run build` (Web-Job wie in CI) grün.
3. PR mit Vorher/Nachher-Copy-Tabelle; AGB-Punkte explizit zur Review markieren.

**Aufwandsschätzung:** 1 fokussierte Session für Copy/Struktur + Build-grün;
Bilder/AGB-Finalisierung parallel durch Gründerin.
