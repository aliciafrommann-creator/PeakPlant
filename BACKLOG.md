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
- **Push-Warteschlange für die Nachtruhe.** Zwischen 22 und 8 Uhr verwirft der
  Versand (`supabase/functions/push-notify`) eine Nachricht, statt sie am
  Morgen zuzustellen — eine Edge Function kann nicht warten. Beides (Moment,
  Beitritt) steht morgens ohnehin in der App, deshalb ist das vertretbar. Die
  Kür wäre eine kleine Warteschlange plus Morgen-Cron; sie steht bewusst hier
  und nicht heimlich im Code.
- **Zeitzone pro Konto.** Die Nachtruhe rechnet mit `Europe/Berlin`, weil die
  App keine Zeitzone speichert. Für den deutschsprachigen Start stimmt das;
  sobald Paare außerhalb dabei sind, braucht es `profiles.timezone` — sonst
  ist „nachts" für sie die falsche Uhrzeit.

## Zwei ungenutzte Filme (Entscheidung Alicia)

Seit der „Vier Phasen"-Block auf `/intimacy` entfernt wurde (P0), werden diese
beiden Dateien nirgends mehr geladen:

| Datei | Größe |
|---|---|
| `public/film-distance.mp4` | 2,2 MB |
| `public/film-logo-transform.mp4` | 2,5 MB |

In Benutzung sind weiterhin `film-intimacy` (Startseite), `film-presence`
(/intimacy) und `film-wildness` (/shop).

**Bewusst nicht gelöscht:** das sind deine Aufnahmen, und die Entscheidung
gehört dir. Drei Wege: (a) löschen — spart 4,7 MB im Deploy, die Dateien
bleiben in der Git-Historie, (b) an anderer Stelle einsetzen, (c) liegen
lassen (sie kosten nichts an Ladezeit, nur Repo-Größe, weil sie niemand
abruft).

---

## Langfrist-Vision: von Couples zur Community (Alicia, 17.08.2026)

Alicias Roadmap-Grafik, hier festgehalten — **nicht in Umsetzung**. Der Zweck
dieses Eintrags: die Idee überlebt den Chat, und die drei Stellen, an denen sie
mit bereits getroffenen Entscheidungen kollidiert, stehen daneben statt später
zu überraschen.

### Die fünf Phasen (ihre Struktur)

| Phase | Zeitraum | Inhalt |
|---|---|---|
| 1 — Foundations | 0–3 Monate | Couples-Kern verfeinern, Editionen verkaufen, aktive Spaces steigern, **Retention beweisen** |
| 2 — Friends & Circles | 3–6 Monate | Freundesgruppen, gemeinsame Rituale, kleine Offline-Events |
| 3 — Community | 6–12 Monate | thematische Communities, wertebasierte Matching-Logik, Community-Events |
| 4 — Dating (ohne Swipes) | 12–18 Monate | Persönlichkeits- und Werteprofil, Vorschläge, Kennenlernen im realen Leben |
| 5 — KI & Premium | 18+ Monate | KI-Begleiter, Deep Matching, exklusive Erlebnisse und Retreats |

**Wichtig und richtig:** Phase 1 endet in ihrer eigenen Grafik mit „Retention
beweisen". Das ist exakt das Gate aus dem Audit — die Roadmap widerspricht dem
Vorgehen also nicht, sie setzt es voraus.

### Die Prinzipien (übernommen)

Werte vor Aussehen · Real Life First (die digitale Verbindung soll offline
stattfinden) · Sicherheit und Vertrauen · Qualität vor Quantität · Achtsamkeit
und Respekt. Der Ablauf ohne Swipes: **Profil mit Tiefe → Werte-Abgleich →
Einladung statt Like → Offline-Erlebnis → Reflexion.**

### Events und Premium

Formate: Dinner Circles, Werte-Workshops, Outdoor-Erlebnisse, Editions-Abende,
Retreats. Kleine Gruppen (20–40), Moderation vor Ort, Notfall- und
Support-System, verifizierte Identität (Ausweis + Selfie/Video).
Premium als Mitgliedschaft: Zugang zu Events, erweiterte Werteanalyse, private
Community-Räume, Early Access, Coaching, Support.

### Entschiedene Richtung (Alicia, 17.08.2026)

Alicia hat den Rahmen aus „Kennenlernen ohne Swipen" bestätigt. Damit ist das
**keine Option mehr, sondern die Leitplanke** für alles, was hier später
entsteht:

- **Die kleinste Einheit ist ein Abend, kein Mensch.** Kein Profil-Raster, kein
  Durchblättern von Personen. Man zeigt sich, indem man kommt.
- **Sicherheit in vier Schichten**, jede für sich tragfähig: keine
  durchblätterbaren Profile und Verifizierung vorab · echter Ort mit anwesender
  Gastgeberin, Adresse erst nach Zusage, **keine Standortfreigabe, nie** ·
  Kontakt erst bei beidseitigem Ja, Melden mit menschlicher Prüfung und ohne
  Begründungspflicht · dauerhaft keine Likes, keine Bewertungen von Menschen,
  **harte Trennwand zwischen Kennenlernen und Tagebuch**.
- **Die KI ordnet Angebote, sie beurteilt keine Menschen.** Ein Satz, der die
  Grenze vollständig beschreibt.
- **Premium rechtfertigt sich über Knappheit und einen echten Abend**, nicht
  über freigeschaltete Funktionen. Der Kern (Karten, Momente, Tagebuch) bleibt
  vollständig kostenlos.
- **Reihenfolge:** jetzt nichts davon · dann zwei bis drei Abende manuell
  veranstalten, ohne Code · erst bei Wiederkehr ohne Einzeleinladung in die App
  · Kennenlernen zwischen Teilnehmenden zuallerletzt.

Offen bleiben Details, die erst mit echten Abenden entscheidbar sind:
Gruppengröße, Preis, Verifizierungs-Dienstleister, Umgang mit Absagen.

### Drei Kollisionen — durch die Richtungsentscheidung aufgelöst

Diese drei Punkte aus der Roadmap-Grafik stehen im Widerspruch zur bestätigten
Richtung. Sie bleiben hier stehen, damit niemand sie später versehentlich aus
der alten Grafik wieder aufgreift:

1. **„Kompatibilitäts-Scoring" — gestrichen.** MANIFESTO §1 und §3 verbieten Beziehungs- und
   Kompatibilitätswerte ausdrücklich („Deine Beziehung ist nichts zum
   Optimieren"), und das Audit führt sie unter *Explicitly Not Building*. Dazu
   kommt: Werte, Orientierung und Beziehungsangaben sind besonders geschützte
   Daten — eine KI, die daraus Rangfolgen von **Menschen** bildet, ist rechtlich
   ein anderes Produkt als eine, die **Abende** vorschlägt. Der gangbare Weg ist
   der zweite: die KI ordnet Angebote, sie beurteilt keine Menschen.
2. **„KI-gestützte Verhaltensanalyse" als Frühwarnsystem — nicht als erste Schicht.** Der
   Gedanke ist gut gemeint und der Effekt heikel: Es ist eine Überwachung der
   eigenen Mitglieder. Sicherheit trägt hier zuerst über Struktur (verifizierte
   Identität, anwesende Gastgeberin, Kontakt erst bei beidseitigem Ja, Melden
   mit menschlicher Prüfung), nicht über Mustererkennung. Falls doch, dann mit
   Transparenzpflicht nach AI Act und menschlicher Entscheidung am Ende.
3. **„Beziehungs- und Kommunikations-Coach" — gestrichen.** Das Audit hält fest: die KI ist
   Kuratorin, nie Therapeutin, und Tagebuchinhalte gehen nie in Prompts. Ein
   Coach, der die Beziehung deutet, überschreitet beides. Vorbereitungsfragen
   vor einem Abend sind die Version davon, die trägt.

Ausführliche Begründung inklusive Sicherheitsschichten und Premium-Logik:
Artefakt „Kennenlernen ohne Swipen" (17.08.2026).

### Der billigste nächste Test (wenn es so weit ist)

Zwei bis drei Abende **manuell** veranstalten — Einladung per Mail, Anmeldung
per Formular, Alicia als Gastgeberin. Kein Code. Beantwortet mehr als ein
Quartal Entwicklung, und erst wenn Menschen wiederkommen, ohne einzeln
eingeladen zu werden, lohnt sich eine Zeile dafür.
