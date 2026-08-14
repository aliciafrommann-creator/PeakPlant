# PeakPlant — Backlog

Was aufgehoben, aber bewusst **nicht jetzt** gebaut wird. Eine Idee, die
nirgends steht, gilt als nicht getroffen (MANIFESTO §8) — eine, die hier
steht, blockiert dafür keine laufende Welle.

---

## Editions-Text von Alicia (14.08.2026) — Ablage, noch ohne Ort

Alicias Formulierung, wörtlich. **Nicht für die Website gedacht** (ihre
ausdrückliche Klarstellung am 14.08.), deshalb nirgends eingebaut, sondern
hier geparkt:

> every edition is a plant. edition 01 is the sunflower — its seeds are
> pressed into the seed paper in your deck.
>
> editions 02 and 03 are already taking shape: a new plant, new cards, a new
> digital world — and the decks are designed to belong together. later, the
> three will also come as a triple bundle.
>
> join early and you help shape them: the next editions grow on instagram and
> in the community.
>
> planned for 2027: friends editions for your circle, family editions — and
> solo editions. solo does not mean being lonely: it is the edition for
> finding yourself and being brave. plus a winter edition for couples.
>
> INSTAGRAM →
> JOIN THE COMMUNITY →

**Offen (Entscheidung Alicia):** wohin dieser Text gehört. Kandidaten aus dem
Gespräch: eine Kreativ-Sektion auf der Shop-Seite, ein Brief/Letter, ein
Instagram-Carousel. Bis das entschieden ist, wird er nirgends eingebaut.

**Wenn er doch auf die Website soll, gilt vorher:** „family editions" erst
nach dem Rechts-Review (Minderjährige + intime Editionen, siehe
`PEAKPLANT_SECURITY_PRIVACY.md`), und alle Jahreszahlen bleiben im Futur
(„geplant für 2027"), nie im Präsens.

---

## Aus dem Audit vertagt (Kurzliste, Details in den Audit-Dokumenten)

- **Echtes Zugangs-Gate für die digitale Welt** — `orders.access_token` liegt
  ungenutzt bereit; heute ist `/edition-01` bewusst öffentlich. Nur bauen,
  wenn Exklusivität wirklich versprochen werden soll.
- **QR-Einmal-Token serverseitig entwerten** — heute nur gerätelokal. Muss vor
  breitem physischem Verkauf passieren, nicht vor der Beta.
- **Programmatischer Datenexport** (RPC/Edge, JSON+Zip) — Phase 4/5; bis dahin
  gilt das manuelle Runbook in `supabase/README.md`.
- **Experience Library in die Datenbank** — nur wenn Website oder Redaktion
  sie brauchen; heute lebt sie im App-Bundle.
- **Push-Benachrichtigungen** als Einladung (Phase 2, nach belegter Retention).
