---
name: klarheit
description: Die strukturellen Klarheits-Regeln von PeakPlant, abgeleitet aus dem Vergleich mit Instagram, Strava, BeReal und DeepL (18.08.2026). Vor JEDER neuen oder geänderten Oberfläche anwenden — Bildschirm, Reiter, Leerzustand, Zahl oder sichtbarem Text. Ergänzt feel-audit: feel-audit prüft Handlungs-Hierarchie und Haptik, dieses hier prüft Struktur, Ehrlichkeit von Zuständen und Dichte. Auch anwenden, wenn jemand sagt, ein Bildschirm sei unklar, überladen, „riesig", oder wenn eine Zahl, ein Leerzustand oder ein Fehlertext entsteht.
---

# Klarheit (PeakPlant)

Diese Regeln sind nicht erfunden. Jede stammt aus einem Befund vom 18.08.2026,
als Alicia die App zum ersten Mal auf einem echten Gerät benutzt und gesagt hat:
**„das Modell funktioniert, aber die UX nicht."** Daneben stand ihr Maßstab:
Instagram, Strava, BeReal, DeepL — „die haben Klarheit."

Was der Vergleich ergab, steht unten als Regel. Wer eine davon brechen will,
schreibt den Grund dazu — nicht in den Chat, sondern in den Code.

> **Erst hier lesen, dann `feel-audit`.** Diese Regeln entscheiden, ob ein
> Bildschirm überhaupt richtig geschnitten ist; `feel-audit` entscheidet, ob
> seine Handlungen und sein Anfassen stimmen. Struktur vor Politur.

---

## K1 — Ein Bildschirm hat EIN Hauptobjekt

Instagram zeigt den Beitrag. Strava den Lauf. BeReal die Tagesaufnahme. **Ein**
Objekttyp, groß, wiederholt — und die Haupthandlung liegt *außerhalb* der Liste
als ein bleibender Knopf.

PeakPlants Objekt ist der **festgehaltene Moment**.

- Was ist auf diesem Bildschirm das Hauptobjekt? Wenn die Antwort „mehrere"
  ist, ist der Bildschirm noch nicht fertig geschnitten.
- Ein Vorschlag für etwas noch nicht Getanes ist **kein** Hauptobjekt. Er darf
  eine Zeile sein, keine Karte, die ein Viertel Bildschirm frisst.

*Befund:* Der Startbildschirm führte mit einem Vorschlag, stellte danach eine
Frage („was wollt ihr zusammen machen?") und bot drei weitere Wege an, sie zu
beantworten. Die Momente kamen an dritter Stelle und waren auf drei begrenzt.

## K2 — Keine Abschnitts-Überschriften in Großbuchstaben auf einem Hauptbildschirm

Jede Großbuchstaben-Überschrift ist ein Versprechen, dass hier ein **neues
Thema** beginnt. Instagram hat auf seinem Startbildschirm null davon.

- Zähle sie. Sind es mehr als zwei, ist der Bildschirm ein Inhaltsverzeichnis.
- Eine Reihe ruhiger Textlinks ersetzt fünf Abschnitte, ohne etwas zu verlieren.

*Befund:* Dreizehn auf einem gefüllten Startbildschirm.

## K3 — Die lauteste Handlung muss möglich sein

Ein Leerzustand, dessen einzige Handlung niemand ausführen kann, ist eine
Sackgasse — egal wie schön sie formuliert ist.

- Wer kann diesen Knopf **heute** drücken? Wenn die Antwort „nur wer etwas hat,
  das es noch nicht gibt" lautet, ist er nicht der Primärknopf.
- Es muss immer einen zweiten, ruhigen Weg geben, der ohne Voraussetzung geht.

*Befund:* Drei Bildschirme boten „erste Karte scannen" an, während die Decks
erst im Oktober ausgeliefert werden — für jeden heutigen Nutzer die einzig
unmögliche Handlung.

## K4 — „Kaputt" ist nicht „leer" (die teuerste Regel)

Ein Ladefehler darf **nie** wie ein Leerzustand aussehen. Wer offline vierzig
Momente hat, darf nicht lesen, seine Geschichte beginne gerade erst.

Jeder Bildschirm, der Daten lädt, braucht **drei** unterscheidbare Zustände:

| Zustand | Was er sagt | Was er anbietet |
|---|---|---|
| lädt | nichts behaupten | Skelett, kein Text über Inhalt |
| fehlgeschlagen | „konnten wir nicht laden — es ist sicher" | Wiederholen |
| leer | „hier ist noch nichts" | den ersten Schritt |

- Der Fehlertext sagt, dass nichts verloren ist. Bei einer App, deren
  Versprechen das Bewahren ist, ist „nicht gefunden" die schlimmstmögliche
  falsche Nachricht.
- Prüfe auch: erreicht der Wiederholen-Knopf den Zustand, in dem er gebraucht
  wird? (Er stand schon einmal in einer Bedingung, die genau dann falsch war.)

*Befund:* Vier Bildschirme sagten „Moment nicht gefunden", „eure Geschichte
beginnt hier" oder „noch nichts gespeichert", wenn nur das Netz fehlte.

## K5 — Eine Null, die „wir wissen es nicht" heißt, ist eine Scheinzahl

MANIFESTO §1, angewandt auf Zahlen. Solange geladen wird oder das Laden
scheiterte, steht **keine Zahl** da — nicht die Null.

- Gilt auch für Prüfdaten, Fortschritt und Zähler. Ein Vorgabewert, der als
  Messung angezeigt wird, ist derselbe Fehler.
- Faustregel: Könnte diese Zahl aus einem Fehler stammen? Dann darf sie nicht
  wie eine Tatsache aussehen.

*Befund:* Jede Idee zeigte „geprüft 2026-06-01" — ein festes Literal. Das Profil
zeigte „0 Momente" beim Laden. Jedes Deck behauptete „0 von 20 bewahrt", wenn
der Fortschritt nicht geladen werden konnte.

## K6 — Ein Reiter, der für den echten Nutzerzustand leer ist, ist eine Frage

Instagrams fünf Reiter sind ab Tag eins voll, weil **fremde** Menschen sie
füllen. PeakPlant hat per Konstruktion keine Fremden — bei euch ist nur drin,
was ihr selbst hineingelegt habt.

- Für welchen Zustand ist dieser Reiter gedacht, und existiert der Zustand?
- Zwei Reiter über denselben Daten sind einer. Nichts löschen: umhängen, und
  einen Weg zurück geben (`BackButton`), sonst wird aus dem Reiter eine
  Sackgasse.

*Befund:* Fünf Reiter, drei davon strukturell leer für den einzigen real
existierenden Nutzerzustand.

## K7 — Die Schrift-Leiter gilt, oder sie gilt nicht

- Kein lokales `fontSize` in einem Stil, der schon ein `Typography`-Token
  einbindet. Wer eine Größe braucht, die es nicht gibt, ergänzt die Leiter.
- Die kleinste Schrift ist **11 pt**. Instagram und Strava setzen ihre
  kleinste bei 11–12; alles darunter ist unter dem Mindestmaß.
- Tapp-Ziele mindestens 44 pt.

**Kontrast — nach dem UNTERGRUND fragen, nie nach dem Farbnamen.** Der erste
Durchgang am 18.08.2026 suchte nach `textFaint` und fand echte Fehler; die
schlimmeren trugen andere Namen. Deshalb, in dieser Reihenfolge:

1. Worauf liegt dieser Text? Papier (#F3F1EC), warm, creme, weiß, `border`,
   `Accents.cream` — oder dunkel (#1E1C1A), oder eine Editionsfarbe?
2. Unter 24 pt gelten 4,5:1. „Groß" beginnt bei 24 pt normal bzw. 18,66 fett,
   **nicht bei 18**.
3. Rechnen, nicht schätzen: `lib/contrast.ts` (`contrastRatio`, `composite`
   für Deckkraft, `bestInk` für Flächen, deren Farbe erst zur Laufzeit
   feststeht).
4. Fläche und Schrift sind zwei Paletten: `Accents`/`Sections` füllen,
   `AccentInks`/`SectionInks` schreiben. `accent` füllt, `accentInk`
   schreibt — und füllt dort, wo kleine weiße Schrift darauf liegt.
5. Auf dunklem Grund: `onDark` (8,07:1) bzw. `onDarkStrong` (15,88:1).
   `textSubtle` ist dort 3,31:1.
6. Deckkraft ist kein Grauton: `rgba(26,26,26,0.62)` auf einer Editionsfarbe
   ist eine andere Farbe und fiel auf elf von zwölf Editionen durch.
7. Ein statischer Farbwert in einem Stil, dessen Farbe beim Rendern gesetzt
   wird, gehört gelöscht — er täuscht eine Entscheidung vor.
8. Ein Text über einem Foto oder Kamerabild hat KEINEN bekannten Untergrund.
   Entweder der Streifen darunter ist deckend, oder sein schlechtester Fall
   ist gerechnet (Kamera auf eine weiße Wand ist der schlechteste Fall).
9. Eine lokale Konstante versteckt die Farbe vor jedem Wächter
   (`const TOGETHER = Sections.together`). Wenn du eine anlegst und sie als
   Schrift benutzt, brauchst du daneben die Ink-Fassung. Der Wächter löst nur
   den einfachsten Fall auf — Ketten, Kleinschreibung, Objektfelder und
   Importe sieht er nicht.
10. Ein Bedienelement braucht Kontrast zu seiner Umgebung — als Rand wie als
    Füllung. Entscheidend ist der schlechteste GERECHNETE Untergrund, nicht die
    Bauart. Im Scanner ging das dreimal schief: Ein Schleier rettete die
    Schrift und drückte den Rand auf 2,46:1; eine dunkle Füllung „damit er von
    nichts abhängt" lag bei 2,16:1, also schlechter. „Eine Füllung hängt von
    nichts ab" ist eine plausible Begründung ohne Rechnung — und das ist der
    Fehler, nicht die Bauart.
11. Eine Farbe, die als **Vorgabewert in den Props** steht
    (`color = Colors.accent`), ist kein Style-Block — sie fehlt in jeder
    Zählung, die Style-Blöcke durchgeht. Der lauteste Knopf der App wurde so
    zweimal übersehen.

*Funde:* eine Knopfbeschriftung in `Colors.text` auf dunklem Grund — **1,00:1,
schlicht unsichtbar**; `Sections.together` als 11-pt-Etikett auf Papier
(**2,35:1**, hinter einer lokalen Konstante versteckt); `Accents.apricot` als
13-pt-Anrede auf Creme (2,38:1); elf Akzent-/Sektionsfarben als 11–13-pt-
Schrift; ein Stil, der auf zwei verschiedenen Untergründen benutzt wurde. Und
die teuerste Lehre: Die erste Korrektur im Scanner schob den
Unsichtbarkeits-Fehler nur von einem Zustand in den anderen — helle Schrift auf
dem Live-Kamerabild sind 1,07:1. Ein Bildschirm hat mehrere Zustände; geprüft
gehören alle.

*Befund:* Sechs von neun Schrift-Stufen wurden nirgends benutzt, und alle 40
Stellen, die eine einbanden, überschrieben sie direkt daneben. Die Datei
steuerte nichts. Dazu: 67 % der Schrift ≤ 13 pt, gleichzeitig 15 Bildschirme mit
26–36 pt Titeln — zweigipflig, nicht zu groß.

## K7b — Batik: die Färbung bleibt selten

Alicias Richtung vom 19.08.2026, gewählt unter fünf Entwürfen. Der gewählte
hieß „Batik leise", und der Name ist die Regel.

- **Eine gefärbte Fläche pro Bildschirm.** Papier bleibt der Grund. Bei vierzig
  Momenten erschlägt einen sonst eine Farbwand. (`lib/dyeUse.test.ts` deckelt
  bei EINER je Datei. Der Deckel stand zuerst bei zwei — und übersah dadurch,
  dass der Startbildschirm zwei gefärbte Flächen hatte, weil die zweite in
  einer anderen Datei lag. Der Test zählt Dateien, nicht Bildschirme; die
  Lücke bleibt bestehen, sie ist nur kleiner geworden.)
- **Nie eine Färbung in einer Wiederholung.** Zehn Challenge-Karten mit
  demselben Kopfband sind die Farbwand, gegen die diese Regel argumentiert.
  Eine Liste, deren Einträge je eine EIGENE Welt haben (die Sammlung), ist der
  erlaubte Fall — dort ist die Färbung die Information.
- **Die Tinte auf einer Färbung wird IMMER gerechnet** (`editionInk`), nie
  gesetzt. Die Fläche ist je Edition eine andere; eine feste Farbe stimmt
  höchstens für eine der dreizehn Welten. Auch das hält der Test.
- **Unter dem Bild liegt immer der Grundton als Füllung** — und er steht in
  `DyeField` bewusst HINTER dem Style des Aufrufers, damit ein eigenes
  `backgroundColor` ihn nicht still ausschalten kann. Genau das war auf dem
  Editions-Kopf passiert: darunter lag `backgroundDark`, und solange das Bild
  lud, stand die gerechnete Tinte für zehn von zwölf Editionen bei 1,02:1 —
  unsichtbar. Der Test schlägt jetzt auf ein `backgroundColor` in einem an
  `DyeField` übergebenen Style an.
- **Das Rezept steht in `constants/dyes.ts`, das Bild entsteht daraus**
  (`scripts/renderDyes.mjs`). Wer ein Rezept ändert, druckt neu — sonst zeigt
  die App eine Färbung, die es im Code nicht mehr gibt. Jedes PNG trägt dazu
  den Fingerabdruck seines Rezepts in einem `tEXt`-Stück, und
  `lib/dyes.test.ts` rechnet ihn nach. Bis zum 19.08.2026 stand dieser Satz
  hier, ohne dass ihn etwas hielt: ein Prüfer drehte einen Grundton auf
  Knallgrün, ohne neu zu drucken — alle Tests blieben grün.
- **Die Tinte muss auf dem BILD tragen, nicht nur auf dem Grundton.** Eine
  Färbung ist keine Fläche: An den hellsten Stellen mischen sich die Lichter in
  den Grund. Beim ersten Durchgang fielen dadurch zwölf von dreizehn Welten
  unter 4,5:1 — bis auf 1,55:1 —, während ihre Grundtöne bei 5 bis 13:1 lagen.
  Der Drucker klemmt jede Stelle jetzt selbst in den lesbaren Bereich
  (`inDenBereich`), und `lib/dyeImages.test.ts` liest die ausgelieferten PNG
  Punkt für Punkt nach.
- **Der gestapelte Titel** (`Typography.stack`) höchstens EINMAL je Bildschirm
  und nie unter 24 pt. Eine Serife wird klein dünn, und dünn auf einer Färbung
  ist genau die Kombination, die K7 rausgeräumt hat. Die Untergrenze hält
  `lib/klarheit.test.ts` — sie wurde beim ERSTEN Anwenden gebrochen (16 pt auf
  der Partner-Notiz des Startbildschirms).
- **Ein Zeichen je Edition.** Das Emoji im Rezept ist dasselbe wie `symbol` im
  Seed. In der ersten Fassung waren es zwei: Wer in der Sammlung auf 🌹 tippte,
  landete auf einer Seite mit 🌻 (`lib/dyes.test.ts`).

*Befund:* Fünf Entwürfe waren nötig, bis die Richtung stand — und zwei
Korrekturen von Alicia unterwegs: „was soll denn das braun" (meine
Foto-Platzhalter färbten jede Richtung ein) und „ein bisschen extrem batik
dunkel" (ich hatte die Gründe fast schwarz gemacht, damit helle Schrift
trägt; ihre Vorbilder machen es umgekehrt — helle Färbung, dunkle Schrift).

## K8 — Die App muss den Zustand bemerken, in dem sie ist

Ein Space mit einer Person sah exakt aus wie einer mit zweien, während überall
„ihr beide" stand.

- Wenn ein Text „ihr" sagt: weiß der Bildschirm, dass ihr zwei seid?
- Wenn nicht: nichts behaupten. `undefined` heißt „wissen wir noch nicht", und
  dann steht dort kein Satz darüber.
- Was der Zustand anbietet, ist eine **Einladung**, nie eine Mahnung: es zählt
  nicht, wird nicht lauter, und verschwindet von selbst (MANIFESTO §3).

*Befund:* Vier Spaces in Produktion, kein einziger mit einer zweiten Person —
und nach dem Onboarding fragte die App nie wieder.

---

## Was mechanisch geprüft wird (und was nicht)

Ein Teil dieser Regeln steht als Wächtertest und scheitert in der CI:
`lib/klarheit.test.ts` (Schriftgröße, Überschriften, Zustände),
`lib/palette.test.ts` (Akzente nie als kleine Schrift; jede andere Schriftfarbe
muss auf dem Papierton bestehen oder eine erklärte Dunkel-Tinte sein; Ausnahmen
brauchen `// kontrast-ok: <Grund>`),
`lib/editionInk.test.ts` (die zwölf Editionsfarben), `lib/dyes.test.ts`
(Färberezepte und ihre gedruckten Bilder) und `lib/dyeUse.test.ts` (K7b). Was ein Test **nicht** kann, ist die eigentliche Frage von
K1, K2 und K6 beantworten — ob ein Bildschirm ein Hauptobjekt hat und ob ein
Reiter berechtigt ist. Das bleibt Urteil, und dafür ist dieses Dokument da.

Wer eine Regel bewusst bricht, schreibt den Grund als Kommentar an die Stelle —
nicht in den Chat. Eine Abwägung, die nirgends steht, gilt als nicht getroffen
(MANIFESTO §8).
