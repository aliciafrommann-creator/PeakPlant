# PeakPlant — Manifest

> Dieses Dokument wird von **Menschen und vom KI-Assistenten** gelesen. Es ist
> über `mobile/CLAUDE.md` eingebunden, damit es jede Entwicklungs-Session
> tatsächlich steuert — nicht als Poster, sondern als Entscheidungsgrundlage.
>
> Format pro Prinzip: **Regel** (kurz, bindend) + **Warum** (der Grund dahinter,
> auch fürs Team lesbar). Im Zweifel gewinnt die Regel.

---

## Worum es im Kern geht

PeakPlant verwandelt einen physischen Kartenmoment in ein **privates, geteiltes
Paar-/Freundschafts-Tagebuch**: physische Karte → echter gemeinsamer Moment →
QR-Scan → Foto + Notiz → wachsendes Tagebuch. Kernversprechen: *collect moments.
grow together.* Der Wert entsteht daraus, dass Menschen **bemerken, was zwischen
ihnen schon wächst** — nicht daraus, eine Beziehung zu messen, zu bewerten oder
zu optimieren. „Deine Beziehung ist nichts zum Optimieren. Sie ist etwas zum
Bemerken." Jede Funktion, jede Zeile Copy wird an dieser Latte gemessen.

### Warum der Name — Alicia, 19.08.2026

> „weil wir peaken und dann nicht abfallen, sondern da pflanzen und wieder
> peaken."

Das ist die ganze Produktlogik in einem Satz, und sie stand bis heute nirgends
im Repo. Sie erklärt drei Dinge, die vorher wie Geschmacksfragen aussahen:

1. **Ein Peak ist ein Feuerwerk, kein Gipfel.** Ein Gipfel hat eine Spitze und
   danach geht es abwärts — das ist die Kurve, die jede Streak-App zeichnet.
   Ein Feuerwerk hat keinen Abstieg. Es geht hoch, es ist schön, es ist vorbei,
   und das nächste ist keine Wiederholung des ersten. Deshalb zeigt die App
   Peaks als wachsende **Reihe**, nie als Kurve, nie als Höchststand.
2. **Das Pflanzen ist der Teil zwischen zwei Peaks.** Ein festgehaltener Moment
   ist nicht der Beweis, dass etwas gut lief — er ist das, was man an der Stelle
   in den Boden setzt, damit dort etwas nachwächst. Das ist der Grund, warum die
   Karten auf **Saatpapier** gedruckt sind: Die Metapher ist keine Verpackung,
   sie ist das Produkt.
3. **Peaks können nur steigen** (die Regel steht schon in `lib/peaks.ts`).
   Jetzt steht auch der Grund dabei: Wer einen Peak abziehen kann, hat aus dem
   Feuerwerk wieder einen Gipfel gemacht — und damit einen Abstieg erfunden, den
   es in diesem Produkt nicht geben darf (§3).

**Bindend daraus:** Keine Kurve, kein Höchststand, kein „dein bester Monat",
kein Vergleich zwischen zwei Zeiträumen. Jede Darstellung, die einen ABSTIEG
zeichnen könnte, widerspricht dem Namen.

### Der Gefühls-Nordstern — Alicia, 19.08.2026

Alicia nennt als Bild für das Produkt das Lied **„These Little Wonders"**
(Rob Thomas, aus *Meet the Robinsons*, 2007) — der Gedanke darin: Das Große
fällt mit der Zeit weg, die kleinen Stunden bleiben.

Das ist die genaueste Beschreibung dessen, was diese App tun soll, die es
bisher gibt: **nicht das Bedeutende bewahren, sondern das Kleine, das sich
später als das Bedeutende herausstellt.** Ein Sonntagmorgen mit Kaffee ist
kein Ereignis. Er ist genau das, was bleibt.

Wer eine Funktion entwirft, prüft sie an dieser Frage: *Hilft das jemandem,
eine kleine Stunde zu bemerken — oder macht es aus ihr ein Ereignis?* Das
Zweite ist die Verwandlung, gegen die §3 geschrieben ist.

**RECHTLICHE GRENZE, damit das nicht schiefgeht:** Der Liedtext ist
urheberrechtlich geschützt. Er darf hier als Herkunft einer Idee stehen,
weil dieses Dokument intern ist. Er darf **nicht** in die App, auf eine
Karte, in Marketing oder auf die Website — dafür bräuchte es eine Lizenz.
Die Idee ist frei, die Formulierung nicht.

---

## 1. Ehrlichkeit vor Eindruck — keine Fake-Claims

**Regel:** Die App behauptet nie etwas, das der Code nicht hält. Sagt eine UI
„bleibt privat auf deinem Gerät", müssen die Daten wirklich nur auf dem Gerät
liegen — tun sie das nicht (Cloud-Sync), sagt die Copy die Wahrheit („privat für
euren Space"). Kein erfundener Ort, kein erfundener Partner-Deal, keine
Scheinzahl.

**Warum:** Die einzige Eigenschaft, die PeakPlant von generischem App-Theater
unterscheidet, ist Vertrauen. Genau solche falschen „device-only"-Aussagen sind
uns schon durchgerutscht und mussten korrigiert werden. Ein einziger falscher
Datenschutz-Satz kostet mehr Vertrauen, als zehn Features es aufbauen — und er
ist nicht zurückzugewinnen. Live-Orte kommen von echten Providern, nie aus
PeakPlant-Fantasie.

## 2. Privatsphäre ist ein Versprechen, kein Default

**Regel:** Tagebuch, Notizen und Fotos sind privat für die Mitglieder eines
Space (RLS, space-scoped). Nichts wird automatisch geteilt oder an Analytics
gesendet. Öffentlich wird ausschließlich, was ein Mensch **aktiv und anonym**
teilt (Orts-Bewertung: nur Spot + Sterne + Tipp — nie Space, Notiz oder
Identität). Sensible Editionen werden im App-Switcher/Hintergrund verdeckt und
hinter Biometrie gegatet.

**Warum:** „Komplett sicher" ist eine Behauptung, die man sich verdient — nicht
eine, die man voraussetzt. Der `service_role`-Key umgeht RLS; er gehört
ausschließlich in Server-Secrets, niemals in den Client oder ins Git. Die klare
Trennung privat/anonym ist der Kern des Community-Features — verwischt sie,
verlieren wir das Feature *und* das Vertrauen.

## 3. Der Mensch entscheidet, die Software lädt ein

**Regel:** PeakPlant *lädt ein* — es drängt nie. Keine Streaks als Druck, keine
Punkte, kein Beziehungs-Score, kein „X% erledigt", keine aggressiven
Notifications, kein automatisches Social-Sharing. Sammlung ist eine neutrale,
warme Tatsache („N von 20 bewahrt"), nie eine Completion-Peitsche.

**Warum:** Der Sog von Instagram/Strava soll als *Mechanik* dienen (lebendiger
Feed, leichtes Festhalten, sanfte Anerkennung), nicht als Social-Media-Logik.
Bloom/Sammel-Emoji statt Likes, Weekly Challenge als gemeinsamer Anlass statt
Fitness-Wettkampf, Memory-Filmstrip statt Stories. Gamifizierter Druck würde
genau das zerstören, was das Produkt schützt: Präsenz statt Performance.

## 4. Erst lesen, dann ändern — additive Migrationen

**Regel:** Vor jeder Schema-/RLS-Änderung den bestehenden Zustand lesen
(`list_tables`). Migrationen sind **additiv und vorwärts** (bestehende Dateien
sind immutabel; Korrekturen sind neue Migrationen), rühren **niemals** an
`orders`, `subscribers`, `community_questions`, `newsletter_subscribers`, und
werden nach dem Anwenden mit den Security-Advisors gegengeprüft. Produktions-
Migrationen nur mit ausdrücklicher menschlicher Freigabe anwenden.

**Warum:** Die teuersten Fehler entstehen aus Annahmen über das, was „schon da
sein müsste". Eine `spaces`-Tabelle hatte keine UPDATE-Policy — jede Umbenennung
wurde still von RLS verworfen, und niemand merkte es, bis wir den Datenfluss
verfolgten. Read-before-write ist keine Zeremonie, sondern die billigste
Versicherung, die wir haben.

## 5. Eine klare Handlung pro Screen — Polish heißt Mehrdeutigkeit entfernen

**Regel:** Jeder Screen-Zustand hat **genau eine** klare Primäraktion, ruhige
Sekundäraktionen und keine doppelten Ziele. Buttons sprechen PeakPlant-Verben
(START TOGETHER, PRESERVE THIS MOMENT, PLAN A DATE HERE, WE DID THIS HERE, SHARE
ONLY THE SPOT), nicht generisches SAVE/DONE/SUBMIT. Nach jeder Primäraktion gibt
es Feedback (Haptik, Toast, sichtbare Konsequenz im Space).

**Warum:** Echter Polish ist nicht Schriftart, Radius oder Schatten — es ist
*„jede Komponente hat einen Grund, eine Persönlichkeit, ein Verhalten"*. Als die
Weekly Challenge dreimal aufs selbe Ziel zeigte, fühlte sich die App „gebaut"
statt „designed" an. Ein generisches SAVE sagt nichts; „SAVE FOR US → in eurem
Space gemerkt" schließt eine Produktschleife.

## 6. Es fühlt sich physisch an — Feel ist Funktion

**Regel:** Taps nutzen `PressableScale` (Feder + Dim + Haptik), Fotos blenden ein
(`FadeInImage`, nie Aufploppen), Fortschritt gleitet (`AnimatedFill`, nie
Sprünge), Laden zeigt Skeletons statt nackter Spinner. Motion respektiert immer
Reduce-Motion.

**Warum:** Der Unterschied zwischen „okay" und „premium" liegt in
Micro-Interaktionen, nicht in Feature-Zahl. Diese Primitive existieren genau
dafür — wer eine neue Fläche baut, erbt sie, statt das tote „Opacity-Dimmen von
gestern" zu wiederholen.

## 7. Verifizieren vor Pushen — der Zustand ist ehrlich

**Regel:** Vor jedem Push laufen `tsc --noEmit`, ESLint und Vitest grün (siehe
Skill `verify-peakplant`). Gearbeitet wird auf einem Branch, nie direkt auf
`main`; Änderungen gehen per PR. Was nicht auf dem Gerät verifiziert werden kann
(GUI, Animationen), wird als **unverifiziert** benannt, nicht als „funktioniert"
verkauft.

**Warum:** „312 Tests grün" ist eine belegbare Aussage; „fühlt sich smooth an"
ist es ohne Gerätetest nicht. Ehrliche Statusmeldungen sind die Fortsetzung von
Prinzip 1 nach innen. Ein Push, der tsc/lint/tests bricht, kostet die nächste
Session mehr, als der Check gekostet hätte.

## 8. Entscheidungen & Kontext werden dokumentiert

**Regel:** Architektur-/Sicherheitsentscheidungen und nötige manuelle Schritte
(Migrationen anwenden, Buckets, E-Mail-Templates, `.env`-Keys) kommen in
`AGENTS.md` bzw. `supabase/README.md`. Eine bewusste Abwägung, die nirgends
steht, gilt als nicht getroffen.

**Warum:** Der Login braucht z. B. ein Supabase-E-Mail-Template mit
`{{ .Token }}` — steht das nirgends, läuft der nächste Mensch in dieselbe
Sackgasse. Kontext, der nur in einem Kopf (oder einer Session) liegt, ist
verloren.

---

## Wie dieses Manifest benutzt wird

- **Beim Bauen:** Widerspricht eine Aufgabe einem Prinzip, wird das *vor* der
  Umsetzung angesprochen — nicht stillschweigend umgangen.
- **Beim Versprechen:** Produkt- und Marketing-Aussagen werden an Prinzip 1–3
  gemessen. Im Zweifel untertreiben.
- **Beim Wachsen:** Neue Skills und Features erben diese Regeln. Sie sind die
  Verfassung, nicht eine Meinung.
