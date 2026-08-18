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

### Ergänzungen vom 17.08. (Alicia)

**Gruppengröße IST die Sicherheitsfunktion.** Alicias Einsicht, und sie trägt
weiter als jedes Feature: Ein Abend mit zwölf Menschen hat kein „wer wird das
sein?". Das Risiko des Treffens unter vier Augen mit einer fremden Person
entsteht gar nicht, weil es dieses Treffen nicht gibt. Damit ist die
Gruppengröße keine Komfort-, sondern eine Sicherheitsentscheidung — und sie
gehört nach oben in jede Format-Überlegung, nicht in die Feinplanung.

**Zielgruppen der Abende:** Paare · Solo · Menschen, die sich freundschaftlich
kennenlernen wollen. Nicht als getrennte Produkte, sondern als verschiedene
Abende auf derselben Struktur.

**Notfall- und Standortfunktion — die Grenze präzisiert.** Die frühere Fassung
(„keine Standortfreigabe, nie") war zu grob. Es sind zwei verschiedene Dinge:

- **Für andere Mitglieder: bleibt ein Nein.** Sobald Menschen auf der Plattform
  sehen, wo andere sind, existiert ein Stalking-Kanal. Kein Feature rechtfertigt
  das.
- **An einen selbst gewählten Menschen: vertretbar** — und genau das, was sich
  Frauen ohnehin gegenseitig schicken. Empfängerin ist **wer auch immer die
  Person wählt**: Freundin, Schwester, Mitbewohnerin, Partner. Ausdrücklich
  nicht auf „den Partner" verengen — wer allein zu einem Abend geht, hat oft
  gar keinen, und die Freundin ist ohnehin die realistischere Adresse. Sie
  muss PeakPlant nicht benutzen.

Entwurfsgrundsatz dafür, falls es je gebaut wird:
**PeakPlant speichert keinen Standort.** Eine Datenbank mit den Aufenthaltsorten
von Frauen an Veranstaltungsabenden wäre das attraktivste Angriffsziel, das
dieses Produkt haben kann. Stattdessen an das übergeben, was auf dem Telefon
existiert (Live-Standort von iOS/Android, Notruf): zeitlich begrenzt, selbst
gewählte Empfängerin, läuft von allein aus, nichts Passives, nichts
Dauerhaftes. Dazu ein einfaches „ich bin gut angekommen" nach dem Abend.

**Solo ist kein Sonderfall, sondern ein Dauerzustand** (Entscheidung Alicia,
17.08.): Ein Mensch allein soll PeakPlant benutzen können — nicht nur als
Wartezimmer, bis jemand beitritt. Das weicht bewusst von der Audit-Empfehlung
ab („Solo nicht jetzt, Marke heißt grow *together*") und ist Alicias Ruf.
Teilweise ist es ohnehin schon wahr: Die App funktioniert vor dem Beitritt des
Partners vollständig allein. Was fehlt, ist, dass sie das auch *sagt*, statt es
als unfertigen Zustand zu behandeln.

**Solo-Editionen** passen in dieses Bild (Konten sind ohnehin einzeln).
Technischer Hinweis, damit er nicht überrascht: `spaces.type` erlaubt heute per
Check-Constraint nur `couple` und `friends` (Migration 0001). Solo braucht also
eine additive Migration — machbar, aber eine bewusste Entscheidung. Alicias
eigene Formulierung bleibt der Maßstab: Solo heißt nicht einsam, sondern sich
selbst finden und mutig sein.

### Editionen 03–05: die Themen stehen (17.08.)

Damit sich nichts doppelt, bekommt jede Edition **eine Frage, die nur sie
stellt** — die bestehenden 40 Karten aus 01 und 02 wurden dafür durchgesehen:

| Edition | Pflanze | Die eine Frage |
|---|---|---|
| 01 Grow Together | Sonnenblume | Wie wachsen wir? (Zukunft, Entwicklung) |
| 02 Soft & Wild | offen | Wie nah dürfen wir uns sein? (Körper, Begehren) |
| 03 Love Languages | Ringelblume (Vorschlag) | Wie zeige ich Liebe — und kommt sie so an? |
| 04 Opening Souls | Nachtkerze (öffnet sich erst in der Dämmerung) | Was habe ich dir nie erzählt? (Herkunft, Scham) |
| 05 On Adventure | Löwenzahn (wächst in jeder Ritze, Samen reisen) | Wer sind wir außerhalb unseres Alltags? |

**Die kritische Abgrenzung:** Edition 01 schaut nach vorn (wer werden wir),
Opening Souls nach hinten (was hat mich geformt). Ohne diese Trennung schreibt
man zwangsläufig die Fragen aus 01 noch einmal — dort steht bereits „Wo fühlst
du dich von mir manchmal ungesehen?" und „Wer wirst du gerade langsam?".

Aufbau je Edition wie gehabt: 5 Dates · 5 Small Acts · 10 Questions.
Ein vollständiger Prompt-Entwurf für Edition 03 liegt im Chat vom 17.08. und
wartet auf Alicias Urteil zur Tonhöhe.

### Der billigste nächste Test (wenn es so weit ist)

Zwei bis drei Abende **manuell** veranstalten — Einladung per Mail, Anmeldung
per Formular, Alicia als Gastgeberin. Kein Code. Beantwortet mehr als ein
Quartal Entwicklung, und erst wenn Menschen wiederkommen, ohne einzeln
eingeladen zu werden, lohnt sich eine Zeile dafür.

---

## Feed, Folgen und Sichtbarkeit (Alicia, 18.08.2026) — geparkt, „hat auch Zeit"

Alicias Wortlaut, damit er nicht durch meine Zusammenfassung verloren geht:

> „aber es fehlt noch superviel bei peakplant in solo und freunde nh? und wenn
> man einen ort teilen will an dem man war und wenn man seine community
> aktivität öffentlich teilen will - es soll schon auch nen feed geben und das
> man sich folgen kann solo, als freundesgruppen oder couples"
>
> „und immer einstellen kann wer alles das bild der aktivität sehen kann - mit
> einer frage auch im feed teilen, im feed teilen mit: ... :)) aber das hat auch
> Zeit"

### Was davon schon existiert

**Einen Ort teilen ist gebaut.** Die Orte-Fläche kann heute schon anonym
teilen: Spot plus Sterne plus Tipp, nie Space, nie Notiz, nie Identität
(`app/(tabs)/community.tsx`, „SHARE ONLY THE SPOT" / „ADD ANONYMOUS RATING").
Was fehlt, ist nicht die Funktion, sondern dass irgendjemand sie je benutzt hat
— null Momente, null zweite Mitglieder.

### Was ohne Reibung baubar ist

- **Solo und Freunde ernst nehmen.** Alicias eigene Entscheidung vom 17.08.:
  „Solo ist kein Sonderfall, sondern ein Dauerzustand." Die App kann das
  technisch schon; sie sagt es nur nicht. Kostet Copy und Leerzustände, kein
  neues Datenmodell. Solo-Editionen brauchen eine additive Migration
  (`spaces.type` kennt heute nur `couple` und `friends`).
- **Pro Aktivität einstellen, wer das Bild sieht.** Das ist keine Kollision,
  das ist MANIFESTO §2 als Funktion: „Öffentlich wird ausschließlich, was ein
  Mensch aktiv teilt." Alicias „im Feed teilen mit: …" ist genau die aktive,
  informierte, pro-Stück-Entscheidung, die das Prinzip verlangt. Wichtig:
  Standard ist immer privat, und die Frage kommt beim Teilen, nicht beim
  Anlegen — sonst wird aus einer Einladung ein Formular.
- **Ein Feed aus AKTIVITÄTEN.** Orte, Ideen, Abende — Dinge, die man tun kann.
  Verträgt sich mit allem und ist vermutlich das, was den Sog erzeugt, den
  Alicia meint.

### Die eine echte Kollision: Folgen

**Menschen folgen** kollidiert frontal mit zwei Dingen — und beide sind
Alicias eigene:

1. MANIFESTO §3 verbietet „öffentliche Profile / Follower / Likes" wörtlich.
2. Ihre eigene Entscheidung vom 17.08.: **„Die kleinste Einheit ist ein Abend,
   kein Mensch"** — kein durchblätterbares Profilraster, man zeigt sich, indem
   man auftaucht. Begründet hat sie das mit Sicherheit für Frauen: kein
   Browsing-Raster heißt auch keine Stalking-Fläche.

Ein Follower-Graph baut genau das Raster wieder auf, das sie bewusst
weggelassen hat. Er ist außerdem der Punkt, an dem aus „bemerken, was zwischen
euch wächst" ein Publikum wird, vor dem man auftritt.

**Der Vorschlag, der beides bekommt:** Man folgt keiner Person, sondern einem
**Ort, einer Stadt, einem Thema oder einer Gruppe** — und sieht dort, was
Menschen aktiv geteilt haben. Der Feed ist voll, der Sog entsteht, es gibt
etwas zu entdecken, aber es gibt kein Profil zum Durchblättern und keine
Zahl neben einem Namen. Wer eine Gruppe teilt, teilt als Gruppe („zwei
Menschen waren hier"), nicht als Person.

**Nicht entschieden.** Das ist eine Verfassungsfrage, keine Feature-Frage:
Wenn Alicia Personen-Folgen will, ändert sich MANIFESTO §3, und das gehört
bewusst getan und aufgeschrieben, nicht nebenbei. Ihr eigener Satz „aber das
hat auch Zeit" ist hier die richtige Antwort — es steht, bis die Kernschleife
mindestens einmal durchgelaufen ist.

### Was vorher wahr sein muss

Alles hier hängt an derselben Bedingung wie die Phasen 2–5: **die Schleife
muss erst einmal geschlossen sein.** Ein Feed ohne Inhalt ist ein leerer Raum,
und Inhalt entsteht aus Momenten, die es noch nicht gibt (Stand 18.08.: null
Momente, null Spaces mit zweiter Person). Ein Feed, den man vorher baut,
zeigt beim Start genau das, was die App gerade zeigen kann: nichts.
