# PeakPlant — Visuelle Sprache

> Eine Marke, drei Flächen: App, Website, Social. Quelle der Wahrheit sind die
> App-Tokens (`mobile/constants/*.ts`); Website und Instagram leiten sich davon
> ab. Wer ein Visual baut, baut es aus diesem Dokument — nicht aus Gefühl.

## Palette (sun-faded, warm, nie grell)

| Rolle | Hex | Name |
|---|---|---|
| Papier (Basis) | `#F3F1EC` | warm stone |
| Fläche hell | `#FBFAF7` | warm card |
| Creme-Block | `#F7F2E8` / `#EFE6D4` | cream |
| Dunkel (nie #000) | `#1E1C1A` | warm graphite |
| **Primär-Akzent** | `#CF4B2C` | chili |
| Familie | `#E08A4F` apricot · `#E3B23C` sunflower · `#E2683C` ember · `#B5532E` terracotta · `#D9477E` blossom · `#7C8A66` sage |
| Text | `#1E1C1A` / `#5A554E` muted / `#857F76` subtle |

Regel: **eine dominante Akzentfarbe pro Fläche** — nie Regenbogen. Chili ist
der Default; die Familie nur für Editionen/Status.

## Typografie

- **Eine Familie: Helvetica Neue** (iOS nativ; Android/System-Sans als
  Fallback). Die großen emotionalen Zeilen sind **leicht** (Gewicht 200–300),
  lowercase und eng gesetzt (`letter-spacing -0.02em bis -0.03em`) — Luft und
  Zurückhaltung statt Serifen-Schwere.
- Funktionales (Body, Buttons) läuft in derselben Familie, Gewicht 400–500 —
  der Kontrast entsteht über Größe + Gewicht, nie über einen Schriftwechsel.
- **Labels**: UPPERCASE, 9–11px-Äquivalent, `letter-spacing 0.15–0.28em`.
- Emotionale Copy ist **lowercase**; Deutsch natürlich & warm, echte Umlaute.
- **Sonderstimme für spezielle Visuals (Entscheidung 12.08.):** NUR für
  besondere Social-/Kampagnen-Visuals (Drops, Ankündigungen, einzelne
  Hero-Kacheln) darf die Kombination **Playfair Display (Kursive) ×
  Poppins (kräftig)** verwendet werden — wie im Referenz-Reel. Website und
  App bleiben IMMER bei der Helvetica; die Sonderstimme taucht nie in
  Produkt-UI oder auf der Website auf. Vorlage: `brand/ig-templates.html`
  Kachel 07.

## Form & Motive

- **Pill-Buttons** (`border-radius 999`) für Aktionen; Karten `radius 10–22`.
- Das **∧-Mark** (Logo-Wedge) als stiller Stempel auf Karten/Visuals.
- **Organische Blüten-/Bloom-Formen** (wie die Edition-01-Kartenkunst) als
  einziges Illustrations-Motiv. Kein Icon-Zoo.
- Momente sammeln sich als **✦** und dem Paar-Sammel-Emoji (Default 🌶️).

## Fotografie

Warm, filmisch, golden hour; echte Paare, echte Orte, nie gestellt-clean.
S/W erlaubt für Editorial-Kontrast. Fotos blenden ein, ploppen nie (App).

## Stimme

„collect moments. grow together." — Einladung statt Druck. Keine Scores,
keine Streaks-Peitsche, keine Fake-Claims (siehe `MANIFESTO.md` §1–3).

## Instagram (Format-Regeln)

- Formate: 1080×1350 (Feed) / 1080×1920 (Story). Vorlagen: `brand/ig-templates.html`.
- Jede Kachel = **eine** Aussage: eine Frage, ein Moment, eine Challenge.
- Mix aus **Typo-Karten** (leichte Helvetica-Frage auf Creme/Chili) und **Foto-Kacheln**
  (warme Paarfotos mit schmaler Caption-Zeile) — Verhältnis ≈ 1:1, wie ein Deck.
- Immer ein ruhiges Element: ∧-Mark oder ✦, klein, nie beides groß.

## Website-Chrome: monochrom warm (Entscheidung 13.08.)

Auf der Website wirkte das Chili-Rot in Labels und Markenzeichen wie ein
Sale-Sticker in einer sonst ruhigen, editorialen Flaeche ("das rot passt nicht
sooo richtig", Alicia). Deshalb: **Website-Chrome ist monochrom warm** — Labels
und ∧-Zeichen laufen in Subtle `#857F76` bzw. Ink mit Opazitaet. Chili bleibt
die Primaerfarbe der App, der Karten und der Kampagnen-Visuals; auf der Website
darf Farbe aus Fotografie und Produktbildern kommen, nicht aus dem Chrome.
Fehler-/Warntexte behalten Terracotta `#B5532E` (Funktionsfarbe, kein Akzent).
