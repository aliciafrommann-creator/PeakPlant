# Audit A7-sprache — 2026-08-11 (read-only Analyse-Agent)

I have completed the sweep. Here is the full A7 report.

---

# A7 — Sprache & Ton (Deutsch + EN/DE-Parität)
**Repo:** `/home/user/PeakPlant/mobile` · **Read-only** · 594 einzeilige `t()`-Aufrufe + alle mehrzeiligen + alle `*De`-Datenfelder geprüft.

Der i18n-Mechanismus (`lib/hooks/useLanguage.ts:19` `t(en, de)`, `l()` für `LocalizedText`) ist sauber gebaut. Die Probleme liegen ausschließlich im Inhalt.

---

## 1. Umlaut-Reste — 43 Fundstellen

Die Reparatur hat große Teile erwischt, aber ganze Dateien ausgelassen. Verräterisch: `app/settings/preferences.tsx:150` enthält im **selben Satz** „Vorschlage" (kaputt) und „Präferenzen" (repariert).

### app/
| # | Datei:Zeile | Exakter String (Ausschnitt) | Problem | Vorschlag |
|---|---|---|---|---|
| 1 | `app/ask/index.tsx:56` | `'Worauf hast du Lust? Erzahl mir wie du dich fuhlst und ich finde etwas Passendes.'` | `Erzahl`, `fuhlst`; zusätzlich fehlt das Komma vor `wie` | `'Worauf hast du Lust? Erzähl mir, wie du dich fühlst — ich finde etwas Passendes.'` |
| 2 | `app/ask/index.tsx:110` | `` `hier ${…} ein paar Ideen, die passen konnte.` `` | `konnte` statt `könnten`; **außerdem Numerus-Bruch** — bei Plural muss es `könnten` heißen, bei Singular `könnte` | `` `hier ${n===1?'ist':'sind'} ${n>1?'ein paar Ideen, die passen könnten':'eine Idee, die passen könnte'}.` `` |
| 3 | `app/together/[id].tsx:213` | `'WIE SICH DAS ANFUHLT'` | fehlendes Ü | `'WIE SICH DAS ANFÜHLT'` |
| 4 | `app/together/[id].tsx:222` | `'geschatzt aus dieser Idee, keine Live-Daten'` | `geschatzt` | `'geschätzt aus dieser Idee — keine Live-Daten'` |
| 5 | `app/together/[id].tsx:255` | `'EIN ORT DAFUR'` | fehlendes Ü | `'EIN ORT DAFÜR'` |
| 6 | `app/together/index.tsx:67` | `'FUR EUCH EMPFOHLEN'` | fehlendes Ü | `'FÜR EUCH EMPFOHLEN'` |
| 7 | `app/together/index.tsx:61` | `'kleine Dinge, die ihr gemeinsam tun konnt - draussen in der Welt…'` | `konnt` | `'…die ihr gemeinsam tun könnt — draußen in der Welt…'` |
| 8 | `app/(auth)/onboarding.tsx:46` | `'wählt, was sich richtig anfühlt. ihr konnt es jederzeit andern.'` | `konnt`, `andern` — im selben Satz stehen `wählt`/`anfühlt` korrekt | `'wählt, was sich richtig anfühlt. ihr könnt es jederzeit ändern.'` |
| 9 | `app/(auth)/onboarding.tsx:91` | `'Vorerst uberspringen'` | fehlendes ü | `'Vorerst überspringen'` |
| 10 | `app/(auth)/onboarding.tsx:93` | `'vorerst uberspringen'` | fehlendes ü | `'vorerst überspringen'` |
| 11 | `app/(auth)/sign-in.tsx:34` | `'Bitte gib eine gultige E-Mail-Adresse ein.'` | `gultige` | `'Bitte gib eine gültige E-Mail-Adresse ein.'` |
| 12 | `app/(auth)/sign-in.tsx:152` | `'Code bestatigen'` | `bestatigen` | `'Code bestätigen'` |
| 13 | `app/(auth)/invite.tsx:99` | `'Dieser Code hat nicht funktioniert. Prufe ihn mit deinem Partner und versuche es erneut.'` | `Prufe` | `'…Prüfe ihn kurz mit deinem Partner und versuch es nochmal.'` |
| 14 | `app/space/new.tsx:68` | `'Dieser Code hat nicht funktioniert. Prufe ihn und versuche es erneut.'` | `Prufe` | `'…Prüfe ihn und versuch es nochmal.'` |
| 15 | `app/discover/feedback/[id].tsx:140` | `'Uberspringen'` | fehlendes Ü | `'Überspringen'` |
| 16 | `app/discover/feedback/[id].tsx:142` | `'UBERSPRINGEN'` | fehlendes Ü | `'ÜBERSPRINGEN'` |
| 17 | `app/settings/preferences.tsx:101` | `'Deine Entdecken-Vorschlage werden nicht mehr danach personalisiert.'` | `Vorschlage` | `'…Entdecken-Vorschläge…'` |
| 18 | `app/settings/preferences.tsx:138` | `'Hier ist alles, was deine Entdecken-Vorschlage beeinflusst.'` | `Vorschlage` | `'…Entdecken-Vorschläge…'` |
| 19 | `app/settings/preferences.tsx:150` | `'Deine heutigen Vorschlage basieren auf unserem kuratierten Katalog, nicht auf personlichen Präferenzen.'` | `Vorschlage`, `personlichen` — `Präferenzen` daneben korrekt | `'Deine heutigen Vorschläge kommen aus unserem kuratierten Katalog, noch nicht aus persönlichen Vorlieben.'` |
| 20 | `app/settings/preferences.tsx:121` | `'abgeleitete Beziehungs- oder Intimitatsmerkmale'` | `Intimitatsmerkmale` | `'was ihr fühlt oder wie nah ihr euch seid'` (siehe auch §4) |
| 21 | `app/settings/preferences.tsx:180` | `'…Sie werden zurückgesetzt, wenn du die Seite verlasst.'` | `verlasst` (2. Pl.) statt `verlässt` (2. Sg.) — grammatisch falsch bei „du" | `'…sobald du den Screen verlässt.'` |
| 22 | `app/settings/preferences.tsx:191` | `'ONBOARDING-ZIELE LOSCHEN'` | fehlendes Ö | `'ZIELE ZURÜCKSETZEN'` (siehe §7) |
| 23 | `app/settings/preferences.tsx:240` | `'du lasst eher aus'` | `lasst` statt `lässt` | `'du lässt eher aus'` |
| 24 | `app/challenges/index.tsx:45` | `'sanfte, endliche Ziele, die ihr gemeinsam angehen konnt.'` | `konnt` | `'…die ihr gemeinsam angehen könnt.'` |
| 25 | `app/challenges/index.tsx:73` | `'VERFUGBAR'` | fehlendes Ü | `'VERFÜGBAR'` |
| 26 | `app/memory/[id].tsx:250` | `'LOSCHEN'` | fehlendes Ö | `'LÖSCHEN'` |
| 27 | `app/rituals/index.tsx:174` | `'…ein Sonntagsspaziergang, eine jahrliche Reise, eine kleine Sache, die euch gehort.'` | `jahrliche`, `gehort` | `'…eine jährliche Reise, eine kleine Sache, die euch gehört.'` |
| 28 | `app/(tabs)/scan.tsx:74` | `'Diese Karte gehort zu einer Edition, die noch nicht erschienen ist.'` | `gehort` | `'Diese Karte gehört zu einer Edition, die es noch nicht gibt.'` |
| 29 | `app/(tabs)/community.tsx:93` | `'Monatslimit fuer Live-Suchen auf diesem Geraet erreicht. Kuratierte Orte funktionieren weiter.'` | `fuer`, `Geraet` — **ue/ae-Ersatz**, genau die verbotene Form | siehe §4 (kompletter Neutext) |
| 30 | `app/(tabs)/community.tsx:98` | `'Google limitiert Live-Orte gerade. Versuch es spaeter nochmal.'` | `spaeter` | `'…Versuch es später nochmal.'` |
| 31 | `app/(tabs)/community.tsx:103` | `'Keine passenden Live-Orte in der Naehe gefunden.'` | `Naehe` | `'…in der Nähe…'` |

### components/ und lib/
| # | Datei:Zeile | Exakter String | Problem | Vorschlag |
|---|---|---|---|---|
| 32 | `components/space/SpacePicker.tsx:182` | `'Neuen Space hinzufuegen'` | **`ue`-Ersatz** | `'Neuen Space hinzufügen'` |
| 33 | `components/edition/ShopLink.tsx:18` | `'NACHSTE EDITION HOLEN'` | fehlendes Ä | `'NÄCHSTE EDITION HOLEN'` |
| 34 | `components/edition/ShopLink.tsx:44` | `'Nachste Edition im Shop holen'` | fehlendes ä | `'Nächste Edition im Shop holen'` |
| 35 | `lib/features.ts:39` | `'…etwas, zu dem ihr gemeinsam zuruckkehrt.'` | `zuruckkehrt` | `'…zu dem ihr gemeinsam zurückkehrt.'` |
| 36 | `lib/features.ts:48` | `'kleine reale Dinge, die ihr als Space tun konnt - fur euch vorgeschlagen.'` | `konnt`, `fur` | `'kleine echte Dinge, die ihr als Space tun könnt — für euch vorgeschlagen.'` |
| 37 | `lib/features.ts:57` | `'entdeckt aktuelle Orte in der Nahe, um dort einen Moment zu teilen.'` | `Nahe` | `'…in der Nähe…'` |
| 38 | `lib/features.ts:66` | `'…Herausforderungen, die ihr als Space annehmen konnt.'` | `konnt` | `'…annehmen könnt.'` |
| 39 | `lib/seed.ts:296` | `labelDe: 'tiefere Gesprache'`, `descriptionDe: 'uber den Alltag hinausdenken'` | `Gesprache`, `uber` | `'tiefere Gespräche'` / `'über den Alltag hinaus reden'` |
| 40 | `lib/seed.ts:298` | `labelDe: 'mehr Prasenz'` | `Prasenz` | `'mehr Präsenz'` (oder wärmer: `'wirklich da sein'`) |
| 41 | `lib/seed.ts:301` | `labelDe: 'stille Nahe'` | `Nahe` | `'stille Nähe'` |
| 42 | `lib/discovery/experience.ts:47` | `['gentle for a first date', 'sanft fur ein erstes Date']` | `fur` | `'sanft für ein erstes Date'` |
| 43 | `lib/discovery/experience.ts:48` | `['good for reconnecting', 'gut zum Wiederannahern']` | `Wiederannahern`; zudem sperriges Substantiv | `'gut, um wieder anzukommen'` |

> **Diese Fundstellen sind besonders kritisch**, weil sie alle im Onboarding (`lib/seed.ts` Ziele) bzw. auf dem Customize-Screen (`lib/features.ts`) liegen — die ersten deutschen Sätze, die ein Nutzer je sieht.

---

## 2. ß-Fehler — 15 Fundstellen

**Wichtig vorab (geprüft & gesund):** ALL-CAPS `'SCHLIESSEN'` (`app/card/[id].tsx:138`, `account.tsx:77`, `space/edit.tsx:183`, `space/new.tsx:84`, `customize.tsx:31`, `memory/create.tsx:193`) ist **orthografisch korrekt** — in Versalien wird ß zu SS. Kein Befund. Ebenso `'muss'`, `'Muss'`, `'dass'` überall korrekt.

Falsch ist die gemischtschreibende Variante:

| # | Datei:Zeile | String | Problem |
|---|---|---|---|
| 1 | `app/discover/saved.tsx:471` | `t('Close', 'Schliessen')` | → `'Schließen'` |
| 2 | `app/rituals/index.tsx:228` | `t('Close', 'Schliessen')` | → `'Schließen'` |
| 3 | `app/account.tsx:75` | `t('Close', 'Schliessen')` | → `'Schließen'` |
| 4 | `app/space/edit.tsx:181` | `t('Close', 'Schliessen')` | → `'Schließen'` |
| 5 | `app/space/new.tsx:82` | `t('Close', 'Schliessen')` | → `'Schließen'` |
| 6 | `app/customize.tsx:29` | `t('Close', 'Schliessen')` | → `'Schließen'` |
| 7 | `components/space/SpacePicker.tsx:102` | `t('Close', 'Schliessen')` | → `'Schließen'` |

Diese 7 stehen im **direkten Widerspruch** zu drei korrekten Stellen derselben App: `app/plus.tsx:77`, `app/(tabs)/community.tsx:1016`, `app/memory/create.tsx:191` = `t('Close', 'Schließen')`. Screenreader-Nutzer hören also je nach Screen zwei verschiedene Wörter.

| # | Datei:Zeile | String | Vorschlag |
|---|---|---|---|
| 8 | `app/editions/[id].tsx:134` | `'Schliesse eine Karte ab, dann scanne ihren QR-Code…'` | `'Schließe eine Karte ab…'` |
| 9 | `app/settings/preferences.tsx:220` | `'merke, plane oder schliesse ein paar Ideen ab'` | `'…oder schließe ein paar Ideen ab'` |
| 10 | `app/challenges/index.tsx:45` | `'eines abschliessen, das Abzeichen behalten'` | `'eines abschließen, das Abzeichen behalten'` |
| 11 | `app/settings/preferences.tsx:180` | `'(ruhig, draussen, kostenlos ...)'` | `'draußen'` — **widerspricht** `app/(tabs)/discover.tsx:73` und `app/discover/browse.tsx:288`, die beide korrekt `'draußen'` schreiben |
| 12 | `app/together/index.tsx:61` | `'draussen in der Welt'` | `'draußen in der Welt'` |
| 13 | `app/settings/preferences.tsx:266` | `'…verkauft oder ausserhalb deines Space geteilt.'` | `'außerhalb eures Spaces'` (auch Genitiv fehlt) |
| 14 | `lib/features.ts:30` | `'…ein sanfter Anstoss, mehr gemeinsam zu tun.'` | `'…ein sanfter Anstoß…'` |
| 15 | *(kein Treffer)* | `gross`, `Strasse`, `heiss`, `Fuss`, `Spass`, `weiss` | **Geprüft — sauber, keine Fundstelle.** |

---

## 3. EN/DE-Parität

### 3a. Komplett fehlende deutsche Übersetzung (englischer Text im DE-Modus)

| Datei:Zeile | String | Problem | Vorschlag |
|---|---|---|---|
| `components/space/StreakBanner.tsx:25` | `'{emoji} share a moment this week to start collecting {units} together.'` | **Kein `t()`, kein `useLanguage`.** Die gesamte Komponente ist hartverdrahtetes Englisch — sie liegt auf dem Home-Screen. | `t('…','teilt diese Woche einen Moment — dann fängt euer gemeinsamer Rhythmus an.')` |
| `components/space/StreakBanner.tsx:37` | `` `${count} ${count===1?'week':'weeks'} of shared moments` `` | a11y-Label englisch | `` `${count} ${count===1?'Woche':'Wochen'} mit gemeinsamen Momenten` `` |
| `components/space/StreakBanner.tsx:40` | `'SHARED RHYTHM'` | englisch | `'GEMEINSAMER RHYTHMUS'` (Begriff existiert schon: `lib/features.ts:26`) |
| `components/space/StreakBanner.tsx:41-42` | `{count} {…'week':'weeks'} together` | englisch | `{count} Wochen zusammen` |
| `components/space/StreakBanner.tsx:49-50` | `` `a moment this week keeps your rhythm going — no rush.` `` / `` `lovely. you've shared moments ${count} weeks in a row.` `` | englisch | `'ein Moment diese Woche hält euren Rhythmus — ganz ohne Eile.'` / `` `schön. ihr habt ${count} Wochen in Folge Momente geteilt.` `` |
| `components/challenge/ProgressBar.tsx:18` | `` `${n} of ${goal} moments` `` | a11y-Label englisch | `` `${n} von ${goal} Momenten` `` |
| `components/challenge/ProgressBar.tsx:24` | `{complete ? 'complete' : `${n} of ${goal} moments`}` | **sichtbarer Text**, englisch | `'geschafft'` / `` `${n} von ${goal} Momenten` `` |
| `components/memory/MemoryCard.tsx:30` | `` `Moment${card ? ` for card ${card.number}` : ''}, ${when}` `` | a11y englisch | `` `Moment${card ? ` zu Karte ${card.number}` : ''}, ${when}` `` |
| `components/memory/MemoryCard.tsx:31` | `'Opens this moment. Long-press to share.'` / `'Opens this moment'` | a11y englisch | `'Öffnet diesen Moment. Lange drücken zum Teilen.'` |
| `components/memory/MemoryListItem.tsx:15` | `d.toLocaleDateString('en-US', …)` | **Datum immer englisch formatiert**, obwohl die App sonst `t('en-US','de-DE')` verwendet (`app/memory/[id].tsx:145`, `app/rituals/index.tsx:191`, `app/discover/saved.tsx:281`) | `d.toLocaleDateString(t('en-US','de-DE'), …)` |
| `components/memory/MemoryListItem.tsx:20` | `` `card ${…}` `` | a11y englisch | `` `Karte ${…}` `` |
| `components/together/PlaceItem.tsx:12` | `` `…, verified perk: ${place.perk}` `` | a11y englisch | `` `…, geprüfter Vorteil: ${place.perk}` `` |
| `components/ui/BackButton.tsx:34` | `label ?? (variant === 'close' ? 'Close' : 'Back')` | Fallback-a11y-Label englisch; greift überall dort, wo kein `label` übergeben wird | Sprache über `useLanguage()` auflösen: `t('Back','Zurück')` |
| `lib/shareText.ts:12,26-31,41,54` | `'— a moment, preserved with PeakPlant 🌻'`, `"Join me on PeakPlant — let's start our shared diary."`, `` `Your invite code: ${code}` ``, `'Open the app, choose "join with code", and enter it. 🌻'`, `` `What about this? ${title}` ``, `` `Our plan: … / When: …` `` | **Die gesamte Teilen-/Einlade-Copy hat keinen Sprachparameter.** Ein deutscher Nutzer verschickt englische Einladungen an seinen Partner. Zusätzlich verweist `'choose "join with code"'` auf ein Label, das im DE-Modus `'MIT CODE BEITRETEN'` heißt. | `lang: Lang` als Parameter durchreichen; DE: `'Komm zu mir auf PeakPlant — lass uns unser Tagebuch starten.'`, `'Öffne die App, tippe auf „Mit Code beitreten" und gib ihn ein. 🌻'` |
| `lib/challenges.ts:36-59` (`CHALLENGES`, `WEEKLY_CHALLENGES`) | `title: 'a season together'`, `subtitle: 'preserve four moments this season — any cards, any order.'`, … 8 Weekly + 3 Season | Titel/Untertitel sind reine `string`, kein `LocalizedText`. Gerendert roh in `app/challenges/[id].tsx:77-78`, `app/(tabs)/home.tsx:256`, `app/(tabs)/discover.tsx:558`. **Im DE-Modus steht der deutsche Rahmen um englischen Inhalt**: `'Wochen-Challenge: one soft evening'`. | Auf `LocalizedText` umstellen (das Muster existiert bereits — `lib/content/edition01.ts` + `l()` in `app/card/[id].tsx:60`) |
| `lib/together.ts` / `lib/discovery/curatedMoments.ts` / `lib/discovery/ideaCatalog.ts` | `title`/`idea`/`concept` durchgehend englisch, z. B. `'breakfast in bed, together'` | Dieselbe Lücke für den gesamten Ideen-Katalog — der Kern-Content von Entdecken. Nur `CATEGORY_LABEL` (`ideaCatalog.ts:68-78`) ist zweisprachig. | Mindestens die kuratierten Momente + Weekly Challenges zweisprachig machen; für den generierten `ideaCatalog` ehrlich benennen oder generieren |
| `app/settings/preferences.tsx:90` + Chip-Rendering Zeile 165 | `source: 'onboarding'` → `<Text style={styles.sourceChip}>{s.source}</Text>` | Der Herkunfts-Chip zeigt immer das englische Schlüsselwort | `t('onboarding','Onboarding')` bzw. `'aus deinen Zielen'` |
| `app/discover/saved.tsx:296` | `{STATUS_LABEL[d.status] ?? d.status}` | Fallback rendert den rohen technischen Status-Key | Fallback auf `t('idea','Idee')` statt Rohwert |

### 3b. Deutscher Text im ENGLISCHEN Slot

| Datei:Zeile | String | Problem | Vorschlag |
|---|---|---|---|
| `app/(tabs)/discover.tsx:355` | `t('LASST EUCH ÜBERRASCHEN · DATE GENERATOR', 'LASST EUCH ÜBERRASCHEN · DATE GENERATOR')` | Beide Argumente identisch **auf Deutsch** — englische Nutzer sehen deutschen Text auf dem Haupt-Discover-Screen | `t('LET YOURSELVES BE SURPRISED · DATE GENERATOR', 'LASST EUCH ÜBERRASCHEN · DATE GENERATOR')` |

### 3c. DE-Seite kürzer / Bedeutung verloren

| Datei:Zeile | EN | DE | Problem | Vorschlag |
|---|---|---|---|---|
| `app/discover/saved.tsx:116` | `'could not plan this idea. please try again.'` | `'Idee konnte nicht geplant werden.'` | „please try again" fehlt — der Nutzer erfährt nicht, dass er es nochmal versuchen kann | `'Die Idee konnte nicht geplant werden. Versuch es gleich nochmal.'` |
| `app/discover/saved.tsx:135` | `'could not update this idea. please try again.'` | `'Idee konnte nicht aktualisiert werden.'` | dito | `'…Versuch es gleich nochmal.'` |
| `app/discover/saved.tsx:173` | `'could not update this idea. please try again.'` | `'Idee konnte nicht aktualisiert werden.'` | dito | dito |
| `app/rituals/index.tsx:98` | `'could not save this ritual. please try again.'` | `'Ritual konnte nicht gespeichert werden.'` | dito | `'Das Ritual konnte nicht gespeichert werden. Versuch es gleich nochmal.'` |
| `app/plus.tsx:211` | `'Suggestions that learn from what you save and love.'` | `'Vorschläge, die aus euren Saves lernen.'` | „and love" fehlt; „Saves" ist Denglisch (§5) | `'Vorschläge, die aus dem lernen, was ihr merkt und liebt.'` |
| `app/discover/saved.tsx:508` | `'notes (optional) — who books, what to bring...'` | `'Notizen (optional) - wer bucht, was mitbringen...'` | Gedankenstrich zu Bindestrich degradiert (§9) | `'Notizen (optional) — wer bucht, was mitbringen…'` |

---

## 4. Ton-Brüche — technisches Vokabular in sichtbarer Copy

| Datei:Zeile | Exakter String | Problem | Vorschlag |
|---|---|---|---|
| `app/(tabs)/community.tsx:88` | `'Live-Orte sind eingebaut, aber GOOGLE_PLACES_API_KEY ist in Supabase noch nicht gesetzt.'` | **Ein Environment-Variablen-Name und der Name des Backends in der Nutzer-UI.** Für einen Endnutzer bedeutungslos und beunruhigend. | `'Live-Orte sind gerade noch nicht eingerichtet. Die kuratierten Orte unten funktionieren wie gewohnt.'` |
| `app/(tabs)/community.tsx:93` | `'Monatslimit fuer Live-Suchen auf diesem Geraet erreicht. Kuratierte Orte funktionieren weiter.'` | „Monatslimit", „Gerät" — Abrechnungs-Innenleben; dazu die ue/ae-Fehler aus §1 | `'Für diesen Monat sind die Live-Suchen aufgebraucht. Die kuratierten Orte unten warten weiter auf euch.'` |
| `app/(tabs)/community.tsx:98` | `'Google limitiert Live-Orte gerade. Versuch es spaeter nochmal.'` | Provider-Name + „limitiert" | `'Die Ortssuche ist gerade überlastet. Versuch es in ein paar Minuten nochmal.'` |
| `app/(tabs)/community.tsx:108` | `'Live-Suche ist pausiert, weil das lokale Kostenlimit nicht gespeichert werden konnte.'` | „lokales Kostenlimit" = internes Kostenmanagement, für den Nutzer sinnlos | `'Die Live-Suche pausiert gerade. Die kuratierten Orte unten funktionieren weiter.'` |
| `app/(tabs)/community.tsx:630` | `'PeakPlant fragt Standort nur, wenn du tippst. Supabase prüft Google Places; AI darf nur echte gefundene Orte sortieren.'` | **Drei Technologienamen in einem Satz** (Supabase, Google Places, AI). Der Datenschutz-Gedanke ist richtig (Manifest §1), die Sprache ist ein Architektur-Diagramm. | `'Wir fragen euren Standort nur, wenn ihr tippt. Die Orte kommen von echten Kartendiensten — die KI darf sie nur sortieren, nie erfinden.'` |
| `app/(tabs)/community.tsx:703` | `'Beta-Default: 6 nützliche frische Live-Suchen pro Space/Monat; Cache-Wiederholungen und Null-Treffer sind gratis.'` | „Beta-Default", „Cache-Wiederholungen", „Null-Treffer", „pro Space/Monat" — vier technische Begriffe | `'In der Beta sind 6 frische Live-Suchen pro Space und Monat drin. Wiederholte oder ergebnislose Suchen zählen nicht mit.'` |
| `app/(tabs)/community.tsx:814` | `'Live-Provider-Ergebnis — Öffnungszeiten/Details vor dem Losgehen in Maps prüfen. 24h gecacht, damit Kosten ruhig bleiben.'` | „Live-Provider-Ergebnis", „gecacht", „damit Kosten ruhig bleiben" | `'Frisch geladen — schaut Öffnungszeiten vor dem Losgehen kurz in der Karte nach. Wir merken uns das Ergebnis einen Tag lang.'` |
| `app/(tabs)/community.tsx:797` | `'AI hat nur Orte sortiert, die Google geliefert hat; dieser Ort wurde nicht erfunden.'` | „AI" untranslated + Provider-Name; siehe auch §5 (KI vs. AI) | `'Die KI hat diese Orte nur sortiert — erfunden hat sie keinen davon.'` |
| `app/(tabs)/community.tsx:432` | `t('Could not reset counter', 'Kontingent konnte nicht zurückgesetzt werden')` | „Kontingent" ist Behördendeutsch; und es widerspricht `community.tsx:694` `'LOKALEN ZÄHLER ZURÜCKSETZEN'` — zwei Wörter für dieselbe Sache | Beide auf `'Suchen'` vereinheitlichen: `'Die Suchen konnten nicht zurückgesetzt werden'` |
| `app/(tabs)/community.tsx:691/694` | `'Lokales Live-Suchkontingent zurücksetzen'` / `'LOKALEN ZÄHLER ZURÜCKSETZEN'` | Reiner Debug-Affordance-Text in der Produktions-UI | `'SUCHEN ZURÜCKSETZEN'` — oder den Button hinter einen Dev-Flag legen |
| `app/settings/preferences.tsx:265-266` | `'… shared outside your space. (PP-014 / PP-016)'` / `'… ausserhalb deines Space geteilt. (PP-014 / PP-016)'` | **Interne Ticket-IDs stehen im sichtbaren Footer** — in beiden Sprachen. Alle anderen `PP-`Referenzen im Repo stehen korrekt in Kommentaren. | Klammer ersatzlos streichen |
| `app/settings/preferences.tsx:266` | `'…nur auf diesem Gerät (lokaler Modus) oder in deinem privaten Space (Backend-Modus)…'` | „lokaler Modus"/„Backend-Modus" = Implementierungsdetail | `'…bleiben auf deinem Gerät oder in eurem privaten Space — nie woanders.'` |
| `app/settings/preferences.tsx:180` | `'Die Chips auf dem Entdecken-Bildschirm … gelten nur für diese Sitzung…'` | „Chips" (UI-Jargon) + „Sitzung" (Session-Übersetzung) | `'Die Filter auf Entdecken gelten nur für diesen Besuch und werden nie gespeichert — sie setzen sich zurück, sobald du den Screen verlässt.'` |
| `app/settings/preferences.tsx:121` | `'abgeleitete Beziehungs- oder Intimitatsmerkmale'` | „Intimitätsmerkmale" klingt nach Datenschutzerklärung, nicht nach „cute & easy" | `'Rückschlüsse darauf, wie nah ihr euch seid'` |
| `app/settings/preferences.tsx:146` | `'noch keine Signale gesetzt.'` | „Signale" ist ML-Vokabular | `'noch nichts, was wir nutzen.'` |
| `app/note/compose.tsx:44` | `t('Error', 'Fehler')` | Nacktes „Fehler" als Alert-Titel — sonst nirgends in der App verwendet (überall sonst `'Etwas ist schiefgelaufen'`) | `t('Something went wrong', 'Etwas ist schiefgelaufen')` |
| `app/(auth)/sign-in.tsx:43` | `setError(e instanceof Error ? e.message : t(…))` | **Rohe Provider-Fehlertexte werden im deutschen UI angezeigt** — Supabase liefert englische Strings wie „Email rate limit exceeded". Der deutsche Fallback greift nie, wenn ein `Error` vorliegt. | Immer den `t()`-Text zeigen, `e.message` nur loggen |
| `app/(auth)/sign-in.tsx:56` | dito | dito | dito |
| `app/(auth)/sign-in.tsx:71` | dito (`'That code did not work.'`) | dito | dito |
| `app/account.tsx:64` | `e instanceof Error ? e.message : t('please try again.', 'Bitte versuche es erneut.')` | dito — im Löschdialog, dem heikelsten Moment der App | dito |

**Geprüft und sauber:** kein `'undefined'`, `'null'`, `'Token'`, `'Session'`, `'Sync'`, `'Server'`, `'failed'` in sichtbarer Copy. `'QR-Code'` ist ein etablierter deutscher Begriff — kein Befund.

---

## 5. Denglisch & Markenbegriff-Konsistenz

Bewusst englische Markenbegriffe: **Space, Edition, Challenge, PeakPlant, Plus, Ask PeakPlant**. Geprüft wurde, ob sie *überall gleich* verwendet werden — sie sind es nicht.

| Begriff | Widerspruch | Vorschlag |
|---|---|---|
| **Challenge vs. Herausforderung** | `app/(tabs)/discover.tsx:508` `t('Challenges','Herausforderungen')` steht **19 Zeilen über** `discover.tsx:524` `t('🔥 challenges','🔥 Challenges')` — derselbe Screen, derselbe Link, zwei Namen. Ebenso in einer Datei: `app/challenges/index.tsx:37` `'HERAUSFORDERUNGEN'` vs. `:92` `'noch keine Challenges.'` vs. `:98` `'Challenges werden in einem Space geteilt.'`. Weiter: `app/challenges/[id].tsx:46,70,94,127` durchgehend „Herausforderung", `lib/features.ts:64` `'Herausforderungen'`, aber `app/(tabs)/home.tsx:79` `'Challenge geschafft ✦'` und `discover.tsx:565` `'Challenge geschafft!'`. | Eine Entscheidung. Da „Weekly Challenge" laut Vorgabe Markenbegriff ist: **überall „Challenge"**, „Herausforderung" streichen. |
| **Wochen-Challenge vs. Wöchentliche Challenge** | `app/(tabs)/home.tsx:65` + `app/challenges/[id].tsx:109` `'Wochen-Challenge: …'`, `home.tsx:244` `'Geschaffte Wochen-Challenge ansehen'` — aber `app/(tabs)/discover.tsx:589` `'Wöchentliche Challenge annehmen'` | überall `'Wochen-Challenge'` |
| **Moment vs. Erinnerung** | `app/discover/saved.tsx:423,428,429` „Moment"; `app/(tabs)/community.tsx:588` `'Erinnerung anlegen'`, `:934` `'Erinnerung an … anlegen'`, `:936` `'ERINNERUNG FESTHALTEN'`, `:1024` `'Space, Erinnerung und Identität'`; `app/discover/feedback/[id].tsx:124` `'deine Erinnerung wurde gespeichert'`; `app/(tabs)/home.tsx:499` `'eure Erinnerungen sind sicher'` vs. `app/editions/[id].tsx:123` `'eure Momente sind sicher'` — **wortgleicher Satz, zwei Substantive** | „Moment" ist das Kernversprechen (*collect moments*) — überall `'Moment'` |
| **merken vs. speichern** | `app/discover/browse.tsx:394,398` `t('Save','Merken')` / `t('saved','gemerkt')`, `app/(tabs)/discover.tsx:415` `'FÜR UNS MERKEN'`, `app/(tabs)/home.tsx:295` `'gemerkte Pläne'`, `app/(tabs)/profile.tsx:37` `'gemerkte Pläne'` — aber `app/discover/saved.tsx:41` `t('saved','gespeichert')`, `:295` `'gespeicherte Ideen'`, `:302` `'noch nichts gespeichert.'`, `app/together/[id].tsx:330` `'Gespeicherte Ideen öffnen'`. Der Screen, auf den „MERKEN" führt, heißt selbst „gespeicherte Ideen". | überall `'merken'`/`'gemerkt'` — das ist das PeakPlant-Verb |
| **Karte vs. Map** | `app/(tabs)/community.tsx:1019` `'ANONYMER MAP-TIPP'` steht gegen `:730` `'Karte der kuratierten Orte'`, `:748` `'Karte © OpenStreetMap'`, `:887` `'Route zu …'`, `app/(tabs)/discover.tsx:348` `'🗺️ KARTE'` — „Map" ist ein einzelner Ausreißer in derselben Datei | `'ANONYMER KARTEN-TIPP'` |
| **KI vs. AI** | `app/plus.tsx:90` `'Plus schaltet die KI-Ebene frei.'` vs. `app/(tabs)/community.tsx:630,797` `'AI darf nur…'`, `'AI hat nur Orte sortiert'` | überall `'KI'` |
| **Space vs. Raum** | `app/memory/create.tsx:96` `'kein aktiver Raum — richte zuerst einen ein, dann halte diesen Moment fest.'` — **einziger Ort, an dem der Markenbegriff Space übersetzt wurde**; 100+ andere Stellen sagen „Space" | `'noch kein Space — richte zuerst einen ein, dann haltet ihr diesen Moment fest.'` |
| **Feedback** | `app/discover/feedback/[id].tsx:109,123,149,155` `'Feedback speichern'`, `'Feedback konnte nicht gespeichert werden'`; `app/together/[id].tsx:247` `'aus eurem eigenen Feedback'`; `app/(tabs)/community.tsx:837` `'Aus eurem privaten Feedback'` | „Feedback" ist kein PeakPlant-Markenbegriff — `'Eindruck'` oder `'Bewertung'` (das Wort nutzt die App bereits: `community.tsx:945,949`) |
| **Shortlist** | `app/discover/saved.tsx:306` `'MERKEN antippen bei einer Idee in Entdecken — deine Shortlist erscheint hier.'` | `'…— was du merkst, landet hier.'` |
| **Saves** | `app/plus.tsx:211` `'Vorschläge, die aus euren Saves lernen.'` — konkurriert mit `app/settings/preferences.tsx:198,211` `'aus Gemerktem lernen'` | `'Vorschläge, die aus dem lernen, was ihr merkt.'` |
| **Community-Spot / Spot** | `app/(tabs)/community.tsx:486` `'…oder wähle einen Community-Spot…'`, `:518` `'Spot konnte nicht geteilt werden'`, `:950` `'NUR DEN ORT TEILEN'`, `:1024` `'Nur dieser Spot…'` — „Spot" und „Ort" wechseln in derselben Datei | überall `'Ort'` |
| **gecacht** | `app/(tabs)/community.tsx:814` `'24h gecacht'` | `'einen Tag lang gemerkt'` |
| **Ask PeakPlant** | `app/plus.tsx:97` `t('Ask PeakPlant','Ask PeakPlant')` (Feature-Name englisch belassen) vs. `app/(tabs)/home.tsx:285,287` `t('Ask PeakPlant','PeakPlant fragen')` vs. `app/ask/index.tsx:146` `'PEAKPLANT FRAGEN'` vs. `app/plus.tsx:205` `'Ask PeakPlant ist ein Plus-Feature'` | Wenn Markenname: überall `'Ask PeakPlant'`. Wenn Aktion: überall `'PeakPlant fragen'`. Aktuell beides. |
| **Plus-Feature** | `app/ask/index.tsx:205` `'Ask PeakPlant ist ein Plus-Feature'` | `'Ask PeakPlant gehört zu Plus'` |
| **Upgraden** | `app/ask/index.tsx:206` `t('Upgrade →','Upgraden →')` | `'Plus ansehen →'` |
| **Ideen für gemeinsam** | `app/(auth)/intro.tsx:41` `'ein Space, zwei Menschen. Ideen für gemeinsam und Momente nur für euch.'` | **grammatisch kaputt** — „für gemeinsam" ist kein deutsches Objekt. Wörtlich aus „ideas to do together". → `'Ideen für zu zweit und Momente nur für euch.'` |
| **der ganze Kreis** | `app/(auth)/intro.tsx:49` `'das ist der ganze Kreis — klein, echt, eurer.'` | Wörtliche Übersetzung von „the whole loop"; „Kreis" trägt die Bedeutung nicht → `'mehr ist es nicht — klein, echt, eurer.'` |
| **Mach PeakPlant zu deinem.** | `app/customize.tsx:41` | Der Satz ist unvollständig — „zu deinem" *was*? → `'Richte PeakPlant so ein, wie es zu euch passt.'` |
| **Keine behaupteten Partnerorte.** | `app/(tabs)/community.tsx:619` | Wörtlich aus „no fake partner venues"; „behauptet" ist hier kein deutsches Attribut → `'Wir erfinden keine Partner-Orte.'` |
| **Tagebucherinnerung** | `app/discover/feedback/[id].tsx:239` `'Eure Tagebucherinnerung bleibt getrennt und privat.'` | Fehlkompositum — liest sich als „Tage-Bucher-innerung"; die App schreibt sonst `'Tagebuch-Notizen'` (`preferences.tsx:123`) | `'Euer Tagebuch-Moment bleibt getrennt und privat.'` |
| **Tagebuchmomente** | `app/(tabs)/community.tsx:998` | dito, ohne Bindestrich | `'Tagebuch-Momente'` |
| **App Store / Play Store Kontoeinstellungen** | `app/plus.tsx:143` | Deutsche Komposita brauchen Durchkopplung | `'in den Kontoeinstellungen im App Store bzw. Play Store'` |

---

## 6. Anrede-Konsistenz (du / ihr)

Die App nutzt bewusst beides: **„du"** für die einzelne Person, **„ihr/euer"** für den Space. Das ist ein tragfähiges Prinzip. Gebrochen wird es an folgenden Stellen:

| Datei:Zeile | String | Problem | Vorschlag |
|---|---|---|---|
| `app/(tabs)/community.tsx:619` | `'Keine behaupteten Partnerorte. Wählt eine Stimmung, dann werden aktuelle Orte in deiner Nähe oder einer Pilotstadt gezogen.'` | **Wechsel innerhalb eines Satzpaars**: `Wählt` (ihr) → `deiner` (du) | `'…Wählt eine Stimmung, dann holen wir aktuelle Orte in eurer Nähe oder in einer Pilotstadt.'` |
| `app/(auth)/intro.tsx:41` | `'…Momente nur für euch. Lade deinen Menschen ein, dann wird es lebendig.'` | ihr → du im selben Absatz, gemeint ist dieselbe Person | `'…Momente nur für euch. Ladet euren Menschen ein, dann wird es lebendig.'` |
| `app/discover/saved.tsx:306` vs. `:322` | `'…deine Shortlist erscheint hier.'` / `'ERLEDIGT antippen wenn ihr es erlebt habt — wir helfen euch…'` | Derselbe Screen spricht oben „du" und unten „ihr" an | einheitlich „ihr" (es geht um gemeinsam Erlebtes) |
| `app/(tabs)/community.tsx:630` vs. `:845` | `'…wenn du tippst.'` / `'Wenn ihr hier eine Idee erlebt habt, erscheinen eure Bewertung…'` | derselbe Screen, wechselnde Anrede für dieselbe Handlung | einheitlich „ihr" auf dem Places-Screen |
| `app/(tabs)/community.tsx:441-442` | `'Erstelle zuerst einen Space'` / `'Pläne brauchen einen gemeinsamen Space, damit daraus später Momente werden.'` vs. `:615` `'findet einen echten Ort'` | du/ihr im selben Screen | einheitlich |
| `app/(tabs)/editions.tsx:50` vs. `:459` | `'privates Tagebuch entsperren'` (neutral/du) / `'eure Sammlungen'` (ihr) | Der Tab-Kopf sagt „eure", die Sperrzeile spricht die Einzelperson an | `'euer privates Tagebuch entsperren'` |
| `app/together/index.tsx:99` vs. `:104` | `'wähle zuerst einen Space.'` / `'Ideen richten sich nach eurem Space.'` | du/ihr im selben Empty-State | `'wählt zuerst einen Space.'` |
| `app/challenges/index.tsx:93` vs. `:97-98` | `'wähle zuerst einen Space.'` / `'…schau bald wieder vorbei.'` / `'Challenges werden in einem Space geteilt.'` | dito | `'wählt zuerst einen Space.'` / `'…schaut bald wieder vorbei.'` |
| `app/memory/create.tsx:96` | `'kein aktiver Raum — richte zuerst einen ein, dann halte diesen Moment fest.'` | „du"-Form für eine Space-Handlung, die sonst „ihr" ist | `'noch kein Space — richtet zuerst einen ein, dann haltet ihr diesen Moment fest.'` |

**Geprüft und gesund:** Kleinschreibung von „du/ihr/euer" ist **durchgehend konsistent** — kein einziges großgeschriebenes „Du"/„Ihr"/„Euer" im gesamten Repo. Die einzigen Großschreibungen stehen satzinitial (`'Du kannst dich jederzeit wieder anmelden.'` `app/account.tsx:101`) und sind korrekt.

---

## 7. Button-Verben — generisch statt PeakPlant-Verb

Manifest §5 fordert explizit PeakPlant-Verben. Vorbildlich umgesetzt sind: `'MOMENT FESTHALTEN'`, `'DIESEN MOMENT BEWAHREN'`, `'DIESES DATE PLANEN'`, `'WIR HABEN DAS SCHON GEMACHT'`, `'FÜR UNS MERKEN'`, `'NUR DEN ORT TEILEN'`, `'RUHIG VERLASSEN'`, `'LOSLASSEN'`, `'FESTHALTEN…'`. Folgende bleiben generisch:

| # | Datei:Zeile | Button | Vorschlag |
|---|---|---|---|
| 1 | `app/discover/feedback/[id].tsx:155` | `t('SAVE','SPEICHERN')` | `'EINDRUCK BEHALTEN'` |
| 2 | `app/space/edit.tsx:311` | `t('SAVE','SPEICHERN')` | `'SPACE AKTUALISIEREN'` |
| 3 | `app/memory/[id].tsx:176` | `t('SAVE','SPEICHERN')` | `'MOMENT AKTUALISIEREN'` |
| 4 | `app/note/compose.tsx:92` | `t('SEND','SENDEN')` | `'AN DEINEN MENSCHEN SCHICKEN'` bzw. `'ABSCHICKEN ♥'` |
| 5 | `app/ask/index.tsx:225` | `t('Send','Senden')` | `'FRAGEN'` |
| 6 | `app/(auth)/onboarding.tsx:85` | `t('CONTINUE','WEITER')` | Kontextloses „Weiter" → `'DAS PASST ZU UNS'` |
| 7 | `app/(auth)/invite.tsx:304` | `t('CONTINUE','WEITER')` | `'IN UNSEREN SPACE'` |
| 8 | `app/(auth)/sign-in.tsx:158` | `t('CONTINUE','WEITER')` (Code-Verifizierung) | `'CODE BESTÄTIGEN'` — der a11y-Label sagt bereits `'Code bestätigen'` (Zeile 152), der sichtbare Text nicht |
| 9 | `app/(auth)/intro.tsx:126` | `t('NEXT','WEITER')` | akzeptabel im Slider, aber `'WEITER'` ohne Kontext → `'ERZÄHL MIR MEHR'` |
| 10 | `app/discover/saved.tsx:533` | `t('SET DATE','DATUM SETZEN')` | `'DATE EINTRAGEN'` |
| 11 | `app/discover/saved.tsx:522` | `t('CANCEL','ABBRECHEN')` | im Modal ok, aber `'NICHT JETZT'` passt besser zum Ton |
| 12 | `app/rituals/index.tsx:269` | `t('CANCEL','ABBRECHEN')` | `'NICHT JETZT'` |
| 13 | `app/(tabs)/community.tsx:1056` | `t('CANCEL','ABBRECHEN')` | `'NICHT JETZT'` |
| 14 | `app/memory/[id].tsx:165` | `t('CANCEL','ABBRECHEN')` | `'DOCH NICHT'` |
| 15 | `app/discover/feedback/[id].tsx:142` | `t('SKIP','UBERSPRINGEN')` | `'VIELLEICHT SPÄTER'` (Ton) + Umlaut (§1) |
| 16 | `app/memory/[id].tsx:167` | `t('EDIT','BEARBEITEN')` | `'NOTIZ ÄNDERN'` — Zeile 242 macht es mit `'NOTIZ BEARBEITEN'` bereits richtig; zwei Buttons, zwei Labels |
| 17 | `app/memory/create.tsx:228` | `t('CHANGE','ÄNDERN')` | `'ANDERES FOTO'` |
| 18 | `app/settings/preferences.tsx:191` | `t('CLEAR ONBOARDING GOALS','ONBOARDING-ZIELE LOSCHEN')` | „Onboarding" ist Produktjargon → `'ZIELE ZURÜCKSETZEN'` (+ Umlaut, §1) |
| 19 | `app/discover/browse.tsx:324` / `app/(tabs)/discover.tsx:442,487` | `t('CLEAR FILTERS','FILTER LÖSCHEN')` vs. `discover.tsx:440,485` a11y `'Filter zurücksetzen'` vs. `browse.tsx:235` `t('clear','zurücksetzen')` | **Drei Formulierungen für eine Aktion.** „Filter löschen" ist zudem falsch — sie werden zurückgesetzt, nicht gelöscht. Überall `'FILTER ZURÜCKSETZEN'` |
| 20 | `app/(tabs)/home.tsx:505` | `t('TRY AGAIN','NOCHMAL VERSUCHEN')` vs. `app/editions/[id].tsx:125` + `app/(tabs)/scan.tsx:166` `'ERNEUT VERSUCHEN'` | zwei Labels für denselben Retry → einheitlich `'NOCHMAL VERSUCHEN'` (wärmer) |
| 21 | `app/discover/browse.tsx:394` | `t('Saved','Gemerkt')` / `t('Save','Merken')` | gut — aber `app/discover/saved.tsx:305` verweist als Anleitung auf `'tap SAVE'` / `'MERKEN antippen'`, während `app/(tabs)/discover.tsx:415` den Button `'FÜR UNS MERKEN'` nennt. **Anleitung und Label stimmen nicht überein.** |

---

## 8. Fehlermeldungen — sagt sie was passiert ist UND was man tun kann?

### Gesund (Ursache + Ausweg + warmer Ton)
- `app/editions/[id].tsx:120-125` — `'euer Tagebuch konnte nicht geladen werden.'` + `'eure Momente sind sicher — das ist nur ein Verbindungsproblem.'` + CTA `'ERNEUT VERSUCHEN'` — **vorbildlich**, beruhigt zuerst.
- `app/(tabs)/home.tsx:498-506` — `'kurz die Verbindung verloren.'` + `'eure Erinnerungen sind sicher — wir versuchen es gleich nochmal.'` + Retry-CTA — vorbildlich.
- `app/memory/create.tsx:152` — `'der Moment konnte nicht gespeichert werden. prüfe deine Verbindung und versuche es erneut.'` — gut.
- `app/(tabs)/scan.tsx:131-132` — `'Die Kamera ist aus — aktivier sie kurz in den Einstellungen, dann könnt ihr Karten scannen.'` — vorbildlich warm und handlungsleitend.
- `app/(tabs)/community.tsx:394-395` — `'Alles gut — ohne Standort nutze eine Pilotstadt oder versuch es später erneut.'` — sehr guter Ton.
- `app/(tabs)/community.tsx:441-442`, `485-486` — beide erklären *warum* und *was jetzt*.

### Befunde
| # | Datei:Zeile | String | Problem | Vorschlag |
|---|---|---|---|---|
| 1 | `app/(auth)/invite.tsx:77` | `'Space konnte nicht eingerichtet werden. Tippe auf Wiederholen.'` | **Verweist auf einen Button, den es nicht gibt.** Kein Element in der App heißt „Wiederholen" — die Retry-Buttons heißen `'ERNEUT VERSUCHEN'`/`'NOCHMAL VERSUCHEN'`. Sackgasse. | `'Euer Space konnte nicht eingerichtet werden. Tipp nochmal auf „Space starten".'` — oder das Label angleichen |
| 2 | `app/discover/saved.tsx:116` | `'Idee konnte nicht geplant werden.'` | Kein Ausweg genannt (EN hat „please try again") | `'Die Idee konnte nicht geplant werden. Versuch es gleich nochmal.'` |
| 3 | `app/discover/saved.tsx:135` | `'Idee konnte nicht aktualisiert werden.'` | dito | `'…Versuch es gleich nochmal.'` |
| 4 | `app/discover/saved.tsx:173` | `'Idee konnte nicht aktualisiert werden.'` | dito | dito |
| 5 | `app/discover/saved.tsx:194` | `'Idee konnte nicht entfernt werden.'` | dito | `'…Versuch es gleich nochmal.'` |
| 6 | `app/rituals/index.tsx:98` | `'Ritual konnte nicht gespeichert werden.'` | dito | `'Das Ritual konnte nicht gespeichert werden. Versuch es gleich nochmal.'` |
| 7 | `app/note/compose.tsx:44-45` | `t('Error','Fehler')` + `'Notiz konnte nicht gespeichert werden.'` | Kalter Titel, kein Ausweg, kein Hinweis dass der Text noch da ist | `'Etwas ist schiefgelaufen'` + `'Deine Notiz ist noch da — versuch es gleich nochmal.'` |
| 8 | `app/(tabs)/community.tsx:88` | `'…GOOGLE_PLACES_API_KEY ist in Supabase noch nicht gesetzt.'` | Beschreibt einen Zustand, den der Nutzer nicht beheben kann, in einer Sprache, die er nicht versteht | siehe §4 |
| 9 | `app/(tabs)/community.tsx:108` | `'Live-Suche ist pausiert, weil das lokale Kostenlimit nicht gespeichert werden konnte.'` | dito | siehe §4 |
| 10 | `app/(auth)/sign-in.tsx:43,56,71`, `app/account.tsx:64` | `e.message` | Roher englischer Provider-Text im DE-UI (siehe §4) | immer `t()`-Fallback anzeigen |
| 11 | `app/discover/feedback/[id].tsx:124` | `'deine Erinnerung wurde gespeichert. Die Bewertung nicht.'` | Inhaltlich gut (teilweiser Erfolg wird ehrlich benannt), aber **stilistisch inkonsistent**: erster Satz klein, zweiter groß; und der zweite Satz ist ein Ellipsen-Fragment | `'dein Moment ist gespeichert — nur die Bewertung nicht. Versuch sie gleich nochmal.'` |
| 12 | `app/(tabs)/community.tsx:432` | `'Kontingent konnte nicht zurückgesetzt werden'` (Titel) + `'Bitte versuche es gleich noch einmal.'` (Body) | Titel unverständlich (§4/§5) | `'Die Suchen konnten nicht zurückgesetzt werden'` |
| 13 | Drei Varianten desselben Satzes | `'Bitte versuche es gleich noch einmal.'` (browse:126,141; community:291,433,476,519,598; discover:258) — `'Bitte versuche es erneut.'` (account:64; space/edit:166; together/[id]:127,154,171; ask:131; plus:39) — `'Bitte versuch es nochmal.'` (memory/[id]:84) | Drei Formulierungen für den identischen Satz | Eine wählen — `'Versuch es gleich nochmal.'` ist am wärmsten und kürzesten |

---

## 9. Interpunktion & Typografie

| # | Datei:Zeile | String | Problem | Vorschlag |
|---|---|---|---|---|
| 1 | `app/(auth)/invite.tsx:267` | `'Dein Partner tippt auf "Ich habe einen Code" und gibt diesen ein.'` | ASCII-Zollzeichen statt deutscher Anführung | `'…tippt auf „Ich habe einen Code" und gibt ihn ein.'` |
| 2 | `app/(tabs)/scan.tsx:197` | `'nutzt Grow Together #01 - "Gemeinsam etwas wachsen lassen"'` | ASCII-Quotes **und** ASCII-Bindestrich, obwohl die EN-Seite derselben Zeile `—` und `“ ”` verwendet | `'nutzt Grow Together #01 — „Gemeinsam etwas wachsen lassen"'` |
| 3 | `app/(tabs)/community.tsx:832` | `` <Text>“{ownSummary.latestTip}”</Text> `` | englische Anführungszeichen um deutschen Nutzertext | `„{…}"` sprachabhängig |
| 4 | `app/(tabs)/community.tsx:865` | `` <Text>“{publicSummary.latestTip}”</Text> `` | dito | dito |
| 5 | `app/together/index.tsx:61` | `'…tun konnt - draussen in der Welt…'` | Bindestrich als Gedankenstrich | `—` |
| 6 | `app/settings/preferences.tsx:138` | `'…abgeleitet - nur was du uns…'` | dito (EN-Seite hat `—`) | `—` |
| 7 | `app/settings/preferences.tsx:202` | `'…nur deine eigenen Aktionen - nie abgeleitet.'` | dito (EN-Seite hat `—`) | `—` |
| 8 | `app/settings/preferences.tsx:220` | `'…ein sanftes Bild - immer sichtbar…'` | dito (EN-Seite hat `—`) | `—` |
| 9 | `app/settings/preferences.tsx:266` | `'…(Backend-Modus) - sie werden nie…'` | dito (EN-Seite hat `—`) | `—` |
| 10 | `app/rituals/index.tsx:174` | `'…macht ein Ritual daraus - ein Sonntagsspaziergang…'` | dito (EN-Seite hat `—`) | `—` |
| 11 | `app/customize.tsx:41` | `'…zu Beginn aktiviert - schalte ab, was du nicht möchtest.'` | dito | `—` |
| 12 | `lib/features.ts:30` | `'…Momente teilt - ein sanfter Anstoss…'` | dito (EN hat `—`) | `—` |
| 13 | `lib/features.ts:48` | `'…tun konnt - fur euch vorgeschlagen.'` | dito | `—` |
| 14 | `app/discover/saved.tsx:508` | `'Notizen (optional) - wer bucht…'` | dito | `—` |
| 15 | `app/together/[id].tsx:247` | `'aus eurem eigenen Feedback – privat auf diesem Gerät'` | **Halbgeviertstrich (–)** statt Geviertstrich (—), den die App sonst durchgängig nutzt | `—` |
| 16 | `app/(tabs)/community.tsx:738` | `'Die Karte braucht eine Verbindung – alle Orte funktionieren unten weiter.'` | dito; die EN-Seite derselben Zeile nutzt `—` | `—` |
| 17 | `app/(tabs)/community.tsx:837` | `'Aus eurem privaten Feedback auf diesem Gerät – keine öffentliche Community-Bewertung.'` | dito | `—` |
| 18 | `app/(auth)/invite.tsx:309` | `'Dein Partner kann später mit dem Code oben beitreten'` | Schlusspunkt fehlt (alle Nachbarsätze haben einen) | Punkt ergänzen |
| 19 | `app/discover/saved.tsx:322` | `'ERLEDIGT antippen wenn ihr es erlebt habt — wir helfen euch, den Moment festzuhalten.'` | **Komma vor Nebensatz fehlt** — im Deutschen zwingend | `'ERLEDIGT antippen, wenn ihr es erlebt habt — …'` |
| 20 | `app/ask/index.tsx:56` | `'Erzahl mir wie du dich fuhlst und ich finde etwas Passendes.'` | Komma vor `wie` fehlt (+ Umlaute, §1) | `'Erzähl mir, wie du dich fühlst — ich finde etwas Passendes.'` |
| 21 | `app/settings/preferences.tsx:180` | `'(ruhig, draussen, kostenlos ...)'` | Leerzeichen **vor** der Auslassung; EN-Seite schreibt `free...` ohne Leerzeichen | `'(ruhig, draußen, kostenlos …)'` |
| 22 | Ellipsen gemischt | `…` in 8 Strings (`browse.tsx:194`, `community.tsx:900,1047`, `memory/create.tsx:203`) vs. `...` in 16 Strings (`note/compose.tsx:71,92`, `home.tsx:474`, `discover.tsx:405`, `memory/[id].tsx:176`, `plus.tsx:153`, `feedback/[id].tsx:196`, `saved.tsx:508`) | Zwei Zeichen für dasselbe, teils auf benachbarten Screens | überall `…` |
| 23 | `app/settings/preferences.tsx:172` | `<Text style={styles.neverBullet}>-</Text>` | Aufzählungszeichen ist ein ASCII-Minus | `·` oder `—` |
| 24 | `app/(auth)/language.tsx:19` | `sublabel: 'die app spricht dich auf deutsch an'` | `app` und `deutsch` klein — bei der Sprachbezeichnung ist die Großschreibung nicht optional, und daneben steht `label: 'Deutsch'` | `'die App spricht dich auf Deutsch an'` |

**Geprüft und sauber:** keine doppelten Leerzeichen in Strings (Regex über alle `.ts`/`.tsx` — 0 Treffer). Der typografische Apostroph `’` wird auf der EN-Seite durchgängig richtig verwendet.

---

## 10. Leere Zustände — lädt jede Empty-Copy zum nächsten Schritt ein?

Alle 5 `EmptyState`-Verwendungen plus 6 handgebaute Empty-Blöcke einzeln geprüft:

| # | Stelle | Bewertung |
|---|---|---|
| 1 | `app/(tabs)/home.tsx:511-521` — `'euer erster Moment beginnt hier.'` + `'scannt eine Karte oder nehmt zusammen die Wochen-Challenge an — euer erster festgehaltener Moment wird eure erste Blüte.'` + CTA `'ERSTE KARTE SCANNEN'` | **Vorbildlich.** Bild, zwei Wege, ein CTA. Das ist die Latte. |
| 2 | `app/(tabs)/home.tsx:497-507` (Fehler-Empty) | **Gesund.** Ist bewusst vom echten Leerzustand unterschieden, mit Retry-CTA. |
| 3 | `app/rituals/index.tsx:169-179` — `'noch keine Rituale.'` + `'wenn ein Moment es wert ist, wiederholt zu werden, macht ein Ritual daraus - ein Sonntagsspaziergang, eine jahrliche Reise…'` + CTA `'RITUAL ERSTELLEN'` | **Inhaltlich vorbildlich** (konkrete Beispiele!), sprachlich kaputt: `jahrliche`, `gehort`, Bindestrich (§1/§9) |
| 4 | `app/rituals/index.tsx:152-162` — `'Rituale sind ausgeschaltet.'` + `'schalte sie in den Einstellungen ein, um eure wiederkehrenden Momente zu sammeln.'` + CTA `'EINSTELLUNGEN ÖFFNEN'` | **Gesund.** |
| 5 | `app/discover/saved.tsx:301-316` — `'noch nichts gespeichert.'` + `'MERKEN antippen bei einer Idee in Entdecken — deine Shortlist erscheint hier.'` + CTA | Einladend, aber: Wortstellung unnatürlich (Verb-Vorfeld fehlt), „Shortlist" (§5), Anrede-Bruch zur Zeile darunter (§6), Label-Verweis stimmt nicht (§7) → `'Tipp bei einer Idee in Entdecken auf MERKEN — was ihr merkt, landet hier.'` |
| 6 | `app/(tabs)/discover.tsx:464-490` — `'nichts passt gerade auf alles.'` + `'Lockert einen Filter oder fragt PeakPlant in Worten — das ist oft schneller.'` + 2 CTAs | **Vorbildlich.** |
| 7 | `app/discover/browse.tsx:322-325` — `'nichts passt auf alles.'` + CTA `'FILTER LÖSCHEN'` | **Befund: kein Hinweis-Text.** Nur Titel + Button, während der fast identische Zustand in `discover.tsx:465` einen warmen Hinweis hat. → Hinweiszeile ergänzen: `'Lockert einen Filter — oder fragt PeakPlant direkt.'` |
| 8 | `app/together/index.tsx:94-105` — `'gerade keine Ideen.'` + `'schau bald wieder vorbei für frische Ideen zu zweit.'` | **Befund: kein CTA.** Sackgasse — der Nutzer kann nur zurück. → `ctaLabel={t('BROWSE ALL IDEAS','ALLE IDEEN ANSEHEN')}` auf `/discover/browse` |
| 9 | `app/challenges/index.tsx:88-100` — `'noch keine Challenges.'` + `'neue gemeinsame Ziele erscheinen hier regelmäßig — schau bald wieder vorbei.'` | **Befund: kein CTA.** Dieselbe Sackgasse. → CTA auf die Wochen-Challenge oder auf Entdecken |
| 10 | `app/editions/[id].tsx:129-137` — `'noch keine Momente.'` + `'Schliesse eine Karte ab, dann scanne ihren QR-Code, um sie eurem Tagebuch hinzuzufügen.'` | Text ist einladend und handlungsleitend — aber **kein CTA**, obwohl der Scan-Screen einen Tap entfernt ist; dazu `Schliesse` (§2) → `'SCHLIEẞE'`-Button bzw. `'KARTE SCANNEN'`-CTA ergänzen |
| 11 | `app/settings/preferences.tsx:145-153` — `'noch keine Signale gesetzt.'` + `'Deine heutigen Vorschlage basieren auf unserem kuratierten Katalog, nicht auf personlichen Präferenzen. Setze Ziele beim Onboarding oder nutze die Filter-Chips in Entdecken.'` | **Befund:** „Signale", „Onboarding", „Filter-Chips" (§4/§5) + zwei Umlautfehler (§1) + **der genannte Weg „Setze Ziele beim Onboarding" ist nicht erreichbar** — es gibt von hier keinen Weg zurück ins Onboarding. → `'noch nichts, was wir nutzen. deine Vorschläge kommen gerade aus unserem kuratierten Katalog. Nutze die Filter in Entdecken, dann wird es persönlicher.'` |
| 12 | `app/settings/preferences.tsx:218-222` — `'noch nichts gelernt. merke, plane oder schliesse ein paar Ideen ab, und hier entsteht ein sanftes Bild - immer sichtbar, immer von dir rücksetzbar.'` | **Inhaltlich vorbildlich** (nennt genau drei Handlungen), sprachlich: `schliesse` (§2), Bindestrich (§9) |
| 13 | `app/(tabs)/community.tsx:844-846` — `'Wenn ihr hier eine Idee erlebt habt, erscheinen eure Bewertung und euer praktischer Tipp privat auf diesem Gerät.'` | **Gesund**, erklärt den Mechanismus statt nur „nichts hier". |

---

## Zusammenfassung

| Punkt | Befunde | Schwere |
|---|---|---|
| 1 Umlaut-Reste | **43** | hoch — verletzt AGENTS.md/Manifest direkt; `hinzufuegen`, `fuer`, `Geraet`, `spaeter`, `Naehe` sind die explizit verbotene ASCII-Transliteration |
| 2 ß-Fehler | **15** (davon 7× `Schliessen` gegen 3× korrektes `Schließen`) | hoch |
| 3 EN/DE-Parität | **19** Stellen ohne DE, 1 Stelle ohne EN, 6 verkürzte DE-Texte | sehr hoch — `StreakBanner`, `ProgressBar`, `lib/shareText.ts`, alle Challenge-Titel und der gesamte Ideen-Katalog sind im DE-Modus englisch |
| 4 Ton-Brüche | **19** | hoch — inkl. Ticket-IDs `(PP-014 / PP-016)` und `GOOGLE_PLACES_API_KEY` in der Nutzer-UI |
| 5 Denglisch/Marken | **21** | mittel-hoch — Challenge/Herausforderung, Moment/Erinnerung, merken/speichern, KI/AI je zweigleisig |
| 6 Anrede | **9** | mittel — inkl. eines du/ihr-Bruchs innerhalb eines Satzes |
| 7 Button-Verben | **21** | mittel |
| 8 Fehlermeldungen | **13** | hoch — inkl. eines Verweises auf einen nicht existierenden Button und 4× rohe englische Provider-Fehler |
| 9 Typografie | **24** | niedrig-mittel |
| 10 Leere Zustände | **5** Befunde von 13 geprüften | mittel — 3 Sackgassen ohne CTA |

**Als gesund bestätigt:** der `t()`/`l()`-Mechanismus selbst; ALL-CAPS-`SCHLIESSEN` (orthografisch korrekt); durchgehende Kleinschreibung von du/ihr/euer; keine doppelten Leerzeichen; kein `gross`/`Strasse`/`heiss`/`weiss`; kein `undefined`/`null`/`Token`/`Session` in sichtbarer Copy; die Fehler-Empty-States in `home.tsx` und `editions/[id].tsx`; die Krisen-Antwort in `app/ask/index.tsx:87` (fehlerfrei, warm, korrekt lokalisiert); die Manifest-Zeilen in `app/(tabs)/discover.tsx:603/607`; alle `PP-`Referenzen außerhalb von `preferences.tsx:265-266` stehen korrekt in Kommentaren.

**Empfohlene Reihenfolge:** §1 + §2 (rein mechanisch, 58 Strings) → §3a (`StreakBanner`, `ProgressBar`, `lib/shareText.ts` — sichtbar englisch) → §4 (`community.tsx` Fehlertexte + `preferences.tsx:265-266`) → §5 (eine Begriffsentscheidung pro Paar) → §8 → §6/§7/§9/§10.