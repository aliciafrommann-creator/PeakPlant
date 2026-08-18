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
- Die blassesten Farben (`textFaint`, `textSubtle`) nie mit ≤ 12 pt
  kombinieren — das ist ein Kontrastfehler, keine Geschmacksfrage.
- Tapp-Ziele mindestens 44 pt.

*Befund:* Sechs von neun Schrift-Stufen wurden nirgends benutzt, und alle 40
Stellen, die eine einbanden, überschrieben sie direkt daneben. Die Datei
steuerte nichts. Dazu: 67 % der Schrift ≤ 13 pt, gleichzeitig 15 Bildschirme mit
26–36 pt Titeln — zweigipflig, nicht zu groß.

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

Ein Teil dieser Regeln steht als Wächtertest in `lib/klarheit.test.ts` und
scheitert in der CI. Was ein Test **nicht** kann, ist die eigentliche Frage von
K1, K2 und K6 beantworten — ob ein Bildschirm ein Hauptobjekt hat und ob ein
Reiter berechtigt ist. Das bleibt Urteil, und dafür ist dieses Dokument da.

Wer eine Regel bewusst bricht, schreibt den Grund als Kommentar an die Stelle —
nicht in den Chat. Eine Abwägung, die nirgends steht, gilt als nicht getroffen
(MANIFESTO §8).
