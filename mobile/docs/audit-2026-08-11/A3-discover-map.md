# Audit A3-discover-map — 2026-08-11 (read-only Analyse-Agent)

Ich habe alle 10 Punkte einzeln geprüft — Code gelesen, und wo möglich die reine Logik headless ausgeführt (esbuild → node) statt geraten. Testsuite: **312/312 grün** (35 Dateien).

---

# A3 — Discover & Map-Loop · Befundbericht

## 1. Filter auf `app/(tabs)/discover.tsx` — jeder Chip einzeln

Ich habe jeden der 10 Chips einzeln gegen `recommendDates` laufen lassen (Pool: 108 kuratierte Momente, `spaceType: couple`, `timeOfDay: afternoon`):

| Chip | Patch | filtert wirklich? | Ergebnis im Lauf |
|---|---|---|---|
| ⏱️ unter 2 Std | `maxDurationMin:120` | **JA** (Hard-Filter, `recommend.ts:46`) | entfernt 8/108; Primary unverändert (tm-1 ist 60 min) |
| ✨ gratis | `maxBudget:'free'` | **JA** (`recommend.ts:47`) | wechselt Primary auf tm-2 |
| 💸 günstig | `maxBudget:'€€'` | **JA** | Primary unverändert (tm-1 ist bereits €€) |
| 🍃 ruhig | `energy:'low'` | **NEIN — toter Filter** | siehe Befund A3-1 |
| 🔥 aktiv | `energy:'high'` | **NEIN — toter Filter** | siehe Befund A3-1 |
| 🌤️ draußen | `indoorOutdoor:'outdoor'` | **JA** (`recommend.ts:54-58`) | Primary → tm-2 |
| 🛋️ drinnen | `indoorOutdoor:'indoor'` | **JA** | Primary tm-1, Alt tm-5 |
| 🌙 ruhig (vibe) | `categories:['calm']` | **JA** (`recommend.ts:45`) | 23 Kandidaten |
| 🎲 verspielt | `categories:['play']` | **JA** | Primary → tm-8 |
| 🍽️ lecker | `categories:['food']` | **JA** | Primary → tm-3 |
| 🎨 kreativ | `categories:['create']` | **JA** | Primary → tm-5 |

### Befund A3-1 (hoch) — die beiden Energie-Chips sind tote Filter
- **Datei:Zeile:** `mobile/lib/discovery/recommend.ts:40-60` (`passesHardFilters` prüft `c.energy` gar nicht) vs. `recommend.ts:100-103` (nur `score += 1`); UI: `mobile/app/(tabs)/discover.tsx:64-69`
- **Problem:** „Energie" ist kein Filter, sondern ein +1-Tiebreaker — und wird von Goal (+3), Tageszeit (+2), Wetter (+2), drinnen/draußen (+2) überstimmt. Belegter Lauf mit `energy:'high'`:
  `cm-o5(energy=high) | tm-1(energy=low)` — d. h. wer **🔥 aktiv** wählt, bekommt als „ODER STATTDESSEN" ausgerechnet *one slow coffee* (energy=low). Mit `energy:'low'` kommt tm-8 als Alternative.
  Die UI stellt den Chip visuell identisch zu den echten Hard-Filtern dar und löscht per Single-Select die Geschwister (`discover.tsx:207-214`) — er verspricht also eine Filterwirkung, die er nicht hat.
- **Verstoß:** MANIFESTO §1 (Die App behauptet nie etwas, das der Code nicht hält) und §5 (Mehrdeutigkeit entfernen).
- **Fix:** In `passesHardFilters` ergänzen: `if (c.energy && moment.energy !== c.energy) return false;` — der Pool trägt das (low 55 / medium 44 / high 9), „aktiv" liefert dann immer noch 9 Kandidaten. Alternativ, falls bewusst weich: Chip aus der Filterzeile herausnehmen und als „eher ruhig / eher aktiv"-Sortierhinweis kennzeichnen.

### Befund A3-2 (mittel) — „✨ SURPRISE ME" ist ein Button ohne Funktion
- **Datei:Zeile:** `mobile/app/(tabs)/discover.tsx:319-327`
- **Problem:** `TouchableOpacity` mit `accessibilityRole="button"` und `accessibilityState={{selected:true}}`, aber **ohne `onPress`**. Screenreader kündigt einen Button an, der nichts tut; Sehende tippen ins Leere.
- **Verstoß:** MANIFESTO §5 (jede Komponente hat ein Verhalten), §6 (Feel ist Funktion).
- **Fix:** In eine nicht-interaktive `View` mit `accessibilityRole="header"`/`text` umwandeln, oder `onPress={resetFilters}` („zurück zur Überraschung") geben.

### Befund A3-3 (niedrig) — Kommentar verweist auf einen Wetter-Chip, den es nicht gibt
- **Datei:Zeile:** `mobile/app/(tabs)/discover.tsx:167` („Live weather is a default only — a manual weather chip always wins") und `lib/discovery/recommend.ts:145-147` (`if (!c.weather) notUsed.push('weather')`)
- **Problem:** In `FILTER_GROUPS` (`discover.tsx:49-86`) existiert keine Wetter-Gruppe. Der Nutzer kann Wetter nie manuell setzen; die Logik hält einen Pfad frei, den keine UI erreicht.
- **Verstoß:** MANIFESTO §8 (Kontext dokumentieren) — irreführender Kommentar; kein Nutzerschaden.
- **Fix:** Entweder Wetter-Gruppe (sonnig/Regen/kalt/egal) ergänzen — dann wird A3-5 gleich mit entschärft — oder Kommentar auf den Ist-Zustand korrigieren.

### Befund A3-4 (mittel) — „FÜR UNS MERKEN" ohne Space: stiller No-Op
- **Datei:Zeile:** `mobile/app/(tabs)/discover.tsx:231-232` (`if (!activeSpace) return;`)
- **Problem:** Ohne aktiven Space passiert bei Tap auf SAVE nichts: kein Toast, keine Haptik, kein Alert. Genau das Verhalten, das der Code weiter unten (`:250-260`) für Fehlerfälle ausdrücklich als „hat Tester verwirrt" beschreibt.
- **Verstoß:** MANIFESTO §5 („Nach jeder Primäraktion gibt es Feedback").
- **Fix:** Analog zu `community.tsx:438-444` einen Alert „Erstelle zuerst einen Space" mit Route auf `/space/new` zeigen.

**GESUND geprüft:** Single-Select pro Gruppe (`discover.tsx:88-91, 203-218`) funktioniert; `excludeIds` wird bei jedem Chip-Wechsel zurückgesetzt, so dass „ANDERE IDEE" nicht mit alten Ausschlüssen kollidiert. Der Leerzustand (`:463-491`) ist ehrlich, nennt zwei Auswege (ASK / FILTER LÖSCHEN) und ist real erreichbar — belegt: `free + outdoor + create + ≤120min` → 0 Treffer, ebenso `free + indoor + food + ≤120min`. „FILTER LÖSCHEN" erscheint nur, wenn Filter aktiv sind (`:434`). Kategorie-Verteilung ist ausgewogen (calm 23 / outdoors 21 / food 21 / create 21 / play 22), kein Chip läuft strukturell leer.

---

## 2. Empfehlungslogik `lib/discovery/recommend.ts` + Wetter

### Befund A3-5 (hoch) — die „Live-Wetter"-Karte widerspricht sich selbst
- **Datei:Zeile:** `mobile/lib/discovery/recommend.ts:24` (`const ALWAYS_UNUSED = ['live weather', 'your device location']`) gegen `mobile/app/(tabs)/discover.tsx:129-135` und `:168` (Live-Wetter wird sehr wohl in die Constraints injiziert) und `recommend.ts:88-91` (`used.push('it suits ${c.weather} weather')`). Angezeigt in `discover.tsx:668-672`.
- **Problem:** Dieselbe Karte kann gleichzeitig sagen „*we suggested this because it suits rain weather*" **und** darunter „*not used: live weather, your device location*". Eine der beiden Aussagen ist immer falsch.
- **Verstoß:** MANIFESTO §1 direkt — Kern der Explainability.
- **Fix:** `signalsNotUsed()` (`recommend.ts:143-148`) dynamisch machen: `ALWAYS_UNUSED` auflösen und `'live weather'` nur pushen, wenn `!c.weather`; `'your device location'` nur, wenn keine Koordinaten in den Constraints liegen. Der Testfall `recommend.test.ts:82-87` prüft heute nur den Fall ohne Wetter und würde grün bleiben — er braucht ein Gegenstück mit gesetztem `weather`.

### Befund A3-6 (hoch) — das „Live-Wetter" ist immer das Wetter von Innsbruck
- **Datei:Zeile:** `mobile/lib/discovery/weatherContext.ts:39` (`options.coords ?? INNSBRUCK`), `mobile/lib/discovery/providers/openMeteo.ts:21` (`INNSBRUCK = {47.2692, 11.4041}`). Beide Aufrufer übergeben **nie** `coords`: `app/(tabs)/discover.tsx:131` und `app/ask/index.tsx:102`.
- **Problem:** Ein Paar in Hannover bekommt bei Regen in Innsbruck stillschweigend Indoor-Ideen vorgefiltert — und die Karte behauptet „it suits rain weather". Der Kommentar in `openMeteo.ts:20` („the home region of the curated catalog") stimmt nicht mehr: die Pilotstädte sind Hannover/Stuttgart/München/Freiburg/Konstanz, Innsbruck ist keine davon.
- **Verstoß:** MANIFESTO §1 (erfundenes Faktum, als lokal ausgegeben).
- **Fix:** Ohne Standortfreigabe **kein** Wetter setzen (`return { constraints, usedLiveWeather:false }`, wenn keine `coords` übergeben wurden). Wenn Standort schon vorliegt (Places-Tab-Suche), die Koordinaten cachen und durchreichen. Alternativ ein Städte-Picker aus `PILOT_CITIES` — dann ist die Herkunft benannt.

**GESUND geprüft:** Der Fallback-Pfad ist wirklich robust. `discovery` = `nullDiscovery` (`lib/ai/index.ts:13`) → `recommendDates` ist rein, ohne Netz-/RN-Import (`recommend.ts:1-19`) und liefert deterministisch. `enrichWithLiveWeather` schluckt jeden Provider-Fehler (`weatherContext.ts:40-42`), respektiert eine explizite Nutzerwahl (`:30-32`) und rät nie („no guessed weather"). `discover.tsx:129-135` fängt zusätzlich mit `.catch(() => {})`. Ohne Netz **und** ohne Standort läuft der Generator also vollständig offline weiter — bestätigt: `recommendDates(base)` liefert `tm-1 | tm-2` ohne jeden externen Aufruf. Tie-Break ist stabil (`recommend.ts:194`, Katalogposition), Affinität ist auf ±1 gedeckelt und kann Hard-Constraints nicht überschreiben (`recommend.test.ts:76`).

### Befund A3-7 (niedrig) — negative Affinität wird nicht erklärt
- **Datei:Zeile:** `mobile/lib/discovery/recommend.ts:114-116`
- **Problem:** Positive Affinität landet in `used` („it is like ideas you have saved before"), negative (`score -= 1`) wird **stumm** angewandt. Eine Kategorie, die ihr zweimal verworfen habt, wird leise abgewertet, ohne dass es je in „WARUM DIES" auftaucht.
- **Verstoß:** MANIFESTO §1 (Explainability) — die Learning-Doku (`lib/discovery/learning.ts:6-8`) verspricht ausdrücklich „shown back to the user verbatim".
- **Fix:** Im Negativfall `used.push('ihr habt Ähnliches zuletzt verworfen')` bzw. in `signalsUsed` aufnehmen.

---

## 3. „Near me" außerhalb der Pilotstädte (Leipzig, Land)

**Was die Person sieht — Schritt für Schritt aus dem Code:**
1. Places-Tab öffnet sich mit `displayPlaces` = 6 generische `LOCAL_PLACES` + globale Community-Spots + (noch) keine Live-Orte (`community.tsx:211-218`).
2. Karte: `mappablePlaces` behält nur Orte mit `lat/lng` (`placeMap.ts:5-9`). **Alle 6 `LOCAL_PLACES` haben keine Koordinaten** (`together.ts:82-161`, jeweils `lastVerifiedAt: 'live-search-required'`). → 0 Pins.
3. `FIND NEAR ME` → echter GPS-Fix → `searchLivePlacesNear` → Edge Function → Google Places Text Search um die tatsächlichen Koordinaten (`livePlaceSearch.ts:136`, `supabasePlaces.ts:49-69`).

**GESUND:** „Near me" ist **nicht** an die Pilotstädte gebunden. Die Pilotstädte sind reine Koordinaten-Seeds (`livePlaces.ts:20-25` sagt das auch so) und ein Weg *ohne* Standortfreigabe. In Leipzig funktioniert die Suche exakt wie in Hannover, sofern `GOOGLE_PLACES_API_KEY` gesetzt ist. Die generischen Prompts sind ehrlich als Nicht-Ortsbehauptung markiert (`community.tsx:803-809`: „Das ist kein behaupteter Ort"). Kein erfundener Partnerort im Katalog (`isPartner` überall `false`, keine `perk`).

### Befund A3-8 (hoch) — Erststart zeigt eine Karte von Innsbruck ohne einen einzigen Pin
- **Datei:Zeile:** `mobile/lib/discovery/placeMap.ts:134` (`else map.setView([47.2692, 11.4041], 12)`), zusammen mit `together.ts:82-161` (keine Koordinaten) und `community.tsx:730` (`accessibilityLabel: 'Karte der kuratierten Orte'`)
- **Problem:** Bei frischer Installation ohne Community-Spots und ohne Live-Suche rendert die Karte Innsbruck auf Zoom 12 mit **null** Markern — beschriftet als „Karte der kuratierten Orte". Für jemanden in Leipzig ist das kein ehrlicher Zustand, sondern ein irreführender.
- **Verstoß:** MANIFESTO §1 und §5 (ein Screen-Zustand ohne klare Aussage).
- **Fix:** Wenn `mappablePlaces(...).length === 0`, die WebView gar nicht erst mounten und stattdessen einen ehrlichen Leerzustand mit der Primäraktion `FIND NEAR ME` / Pilotstadt-Chips zeigen („noch keine Orte auf der Karte — such welche in deiner Nähe"). Den Innsbruck-Default aus `placeMap.ts:134` entfernen.

### Befund A3-9 (mittel) — Community-Spots werden weltweit ungefiltert eingeblendet
- **Datei:Zeile:** `mobile/lib/repositories/supabase.ts:432-440` (`getSpots()` = neueste 120 global, kein Geo-Filter), verwendet in `community.tsx:196-209, 211-218`, gezeichnet über `placeMap.ts:133` (`map.fitBounds(bounds)`)
- **Problem:** Wer in Leipzig ist, bekommt Pins aus München, Konstanz und überall sonst; `fitBounds` zoomt dann auf ganz Mitteleuropa heraus, und die Chip-Leiste (`community.tsx:751-773`) füllt sich mit unerreichbaren Orten.
- **Verstoß:** MANIFESTO §5 (eine klare Handlung pro Screen; hier: Rauschen statt Nutzen).
- **Fix:** `getSpots()` um einen Bounding-Box-/Radius-Parameter erweitern (letzte bekannte Koordinate oder gewählte Pilotstadt) und clientseitig zusätzlich per Haversine auf z. B. 50 km filtern.

### Befund A3-10 (niedrig) — Entwicklersprache im Nutzer-Fehlertext
- **Datei:Zeile:** `mobile/app/(tabs)/community.tsx:85-89`
- **Problem:** „Live-Orte sind eingebaut, aber **GOOGLE_PLACES_API_KEY** ist in Supabase noch nicht gesetzt." — ein Env-Var-Name im Endnutzer-UI. Genau der Zustand, den jemand außerhalb der Pilotphase am ehesten sieht.
- **Verstoß:** BRAND/MANIFESTO §5 (Copy spricht PeakPlant, nicht Ops).
- **Fix:** „Live-Orte sind bei euch noch nicht freigeschaltet — die kuratierten Ideen funktionieren weiter." Den technischen Grund nur ins Log.

### Befund A3-11 (niedrig) — Places-Tab kann komplett leer rendern
- **Datei:Zeile:** `mobile/app/(tabs)/community.tsx:603` (`if (!selected) return null;`)
- **Problem:** Rendert einen weißen Screen ohne Header, Erklärung oder Ausweg. Heute unerreichbar (`LOCAL_PLACES` ist nie leer), aber ein stiller Totalausfall, sobald die Liste dynamisch wird.
- **Fix:** `EmptyState` mit `FIND NEAR ME` statt `return null`.

---

## 4. Standort verweigert — jede Stelle im Code, die Standort nutzt

Es gibt genau **eine** Standort-Nutzung in der ganzen App:

| Stelle | Weg ohne Standort? |
|---|---|
| `lib/location.ts:51-80` `requestCurrentForegroundLocation` (einzige Implementierung) | ✓ liefert typisiertes `{ok:false, reason}` statt Throw; `module_unavailable` wenn `expo-location` fehlt (`:30-44`) |
| `app/(tabs)/community.tsx:390` `findNearby` (Button `FIND NEAR ME`, `:634-646`) | ✓ Alert + Statustext + Pilotstadt-Chips (`:661-674`) |
| `app/(tabs)/community.tsx:894` (`FIND LIVE MATCHES` auf der Ortskarte) | ✓ selber Pfad, selber Fallback |
| `lib/discovery/weatherContext.ts` | ✓ nutzt **gar keinen** Standort — siehe aber A3-6 |
| `app/(tabs)/discover.tsx` | ✓ standortfrei by design (`:38` „Honest, location-free contextual signal") |

**GESUND:** Der Standort wird ausschließlich auf Tap geholt (`location.ts:47-50` Kommentar + Aufrufkontext), nie im Hintergrund, nie beim Start; `app.json:73-75` deklariert nur `locationWhenInUsePermission` mit passender Begründung. Bei `permission_denied` gibt es Statustext **und** Alert (`community.tsx:392-405`), bei `location_unavailable` nur Statustext — beide Male bleibt der Pilotstadt-Weg voll funktionsfähig. Ich habe keine Stelle gefunden, die ohne Standort in eine Sackgasse läuft.

### Befund A3-12 (mittel) — Datenschutz-Seite sagt „genauer Standort: nie", der Code sendet ihn
- **Datei:Zeile:** `mobile/app/settings/preferences.tsx:114-118`, gelistet unter der Überschrift „WAS WIR NIE VERWENDEN" (`:168`) — gegen `app/(tabs)/community.tsx:407` und `lib/discovery/livePlaceSearch.ts:136` → `supabasePlaces.ts:52-63` (`near: {lat, lng}` in voller Genauigkeit an die Edge Function → Google).
- **Problem:** Der Klammerzusatz „du kannst einen **Ort** pro Anfrage teilen" impliziert Stadt-Granularität. Tatsächlich gehen die exakten GPS-Koordinaten raus. `locationBucket` rundet auf 2 Dezimalstellen (`livePlaces.ts:51-53`) — aber nur für den **Cache-Key**, nicht für den Request.
- **Verstoß:** MANIFESTO §1 und §2 — exakt die Sorte Datenschutz-Satz, die laut §1 („Genau solche falschen Aussagen sind uns schon durchgerutscht") nicht noch einmal passieren soll.
- **Fix (zwei Optionen):** (a) Copy korrigieren: den Punkt aus „NIE VERWENDEN" herausnehmen und unter „nur auf deinen Tap, einmalig, nie im Hintergrund" führen; oder (b) Code an die Copy anpassen: Koordinaten vor dem Versand auf ~2 Dezimalstellen (≈1 km) runden — bei 3 km Suchradius (`livePlaces.ts:6`) verlustfrei genug. (b) ist die stärkere Wahl.

---

## 5. Map-Readiness (`lib/discovery/placeMap.ts` + WebView-Seite)

**GESUND — und zwar sauber:**
- `map-ready` wird **ausschließlich** aus `markReady()` gepostet, und `markReady` hängt nur an `tileload` beider Layer (`placeMap.ts:93-97, 110-111`). Es gibt genau eine `post('map-ready')`-Stelle; der Test `placeMap.test.ts:34-43` friert das ein. Leaflets bloßes Booten löst kein Ready aus. ✓
- **Script-/CDN-Fehler:** `if (typeof L === 'undefined') throw` (`:81`) im `try`, dessen `catch` `post('map-failed')` sendet (`:135-137`). Gilt auch bei fehlgeschlagener SRI-Prüfung (`integrity=` auf `:73`), weil das Script dann blockiert wird. ✓
- **tileerror vor Paint:** CARTO-Fehler → einmalige Umschaltung auf OSM (`:112-117`), OSM-Fehler → `if (!tilesShown) post('map-failed')` (`:118-120`). Genau die geforderte Kette. ✓
- **UI-Zustand bei failed:** `community.tsx:271-274` setzt `mapUnavailable`; `:732-745` zeigt „Die Karte braucht eine Verbindung – alle Orte funktionieren unten weiter." Und das stimmt: Chip-Leiste (`:751-773`), Ortskarte (`:775-955`) und alle Loop-Aktionen liegen unterhalb und rendern unabhängig von der WebView. Ehrlicher Zustand **mit** funktionierender Liste als Alternative. ✓
- Zusätzliche Netze: 8-Sekunden-Watchdog auf RN-Seite (`community.tsx:189-194`), `onError`/`onHttpError` (`:713-714`), strenge `onShouldStartLoadWithRequest`-Whitelist (`:716-726`, deckt `a–d.basemaps.cartocdn.com` passend zu `subdomains:'abcd'` ab), XSS-Escaping der Ortsnamen (`placeMap.ts:11-13`, Test `:45-49`). ✓

### Befund A3-13 (mittel) — jeder Chip-Tap lädt die ganze Karte neu vom CDN
- **Datei:Zeile:** `mobile/app/(tabs)/community.tsx:250-257` (`mapHtml` hängt an `selected?.id`) und `:189-194` (`setMapReady(false)` bei jedem `selectedId`)
- **Problem:** Ein Ortswechsel per Chip erzeugt neues HTML → WebView-Reload → Leaflet + CSS erneut von unpkg, Tiles erneut. Sichtbar als Spinner-Flackern bei jedem Tap, und jeder Tap ist eine neue Chance auf `map-failed`.
- **Verstoß:** MANIFESTO §6 (Feel ist Funktion — „nie Aufploppen", Micro-Interaktionen).
- **Fix:** HTML nur aus `displayPlaces` bauen, die Auswahl per `injectedJavaScript` / `postMessage` an die bestehende Karte schicken (`map.setView` + Pin-Klasse `selected` umsetzen). Das ist die eine Änderung, die den Map-Screen spürbar aufwertet.

### Befund A3-14 (niedrig) — kein In-Page-Watchdog bei hängenden Tiles
- **Datei:Zeile:** `mobile/lib/discovery/placeMap.ts:110-120`
- **Problem:** Tiles, die weder `tileload` noch `tileerror` feuern (DNS-Blackhole, Captive Portal), lösen nichts aus. Es rettet nur der 8-s-Timer auf RN-Seite — der aber bei jedem `selectedId`-Wechsel neu startet (`community.tsx:189-194`), also bei schnellem Chip-Tippen faktisch nie abläuft.
- **Fix:** Im HTML `setTimeout(() => { if (!tilesShown) post('map-failed'); }, 7000)` ergänzen — dann ist die Aussage unabhängig vom RN-Timer.

### Befund A3-15 (niedrig) — ein einzelner Tile-Fehler wirft den ganzen CARTO-Layer weg
- **Datei:Zeile:** `mobile/lib/discovery/placeMap.ts:112-117` (`map.removeLayer(cartoTiles)` beim **ersten** `tileerror`)
- **Problem:** Ein einzelner 404 am Rand (kommt bei `fitBounds` über weite Gebiete vor, vgl. A3-9) degradiert die Karte dauerhaft auf den langsameren OSM-Layer, auch wenn CARTO gesund ist.
- **Fix:** Erst ab z. B. 3 Fehlern innerhalb von 2 s umschalten, oder gar nicht umschalten, wenn `tilesShown === true`.

---

## 6. Der Loop Schritt für Schritt

**Pfad A — Karte (vollständig, funktioniert):**
finden (`community.tsx:380-411`) → `PLAN A DATE HERE` (`:438-479`) → `WE DID THIS HERE` (`:569-601`) → Alert bietet Memory **und** anonyme Bewertung → `createMemoryForSelected` (`:543-567`) → `memory/create.tsx:118-142` schreibt `memoryId` zurück und leitet nach `/discover/feedback/[id]` → dort Sterne + Tipp + Opt-in-Toggle (`feedback/[id]:209-234`).

**GESUND — auch der Sonderfall aus der Checkliste:** Für einen **kuratierten Prompt ohne echten Spot** (kein `lat/lng`) entsteht trotzdem ein Plan **mit** `placeName`: `community.tsx:463` `placeName: spot?.name ?? selected.name`. Der Loop-Status auf der Karte matcht danach per Name (`:528-539`), also greifen „◷ geplant" und „✓ zusammen erlebt" auch dort. Der Rating-Schritt wird für solche Prompts sauber ausgeblendet (`:580` `canShare`) bzw. mit ehrlichem Alert erklärt (`:481-493` „Finde zuerst einen echten Ort") — kein Fake-Pin. ✓

### Befund A3-16 (hoch) — der Loop bricht am Haupt-Einstieg: Discover-Generator und Ideen-Detail verlieren den Ort
- **Datei:Zeile:** `mobile/app/(tabs)/discover.tsx:237-245` (`savedDateRepository.save({...})` **ohne** `placeId/placeName/placeLat/placeLng`, obwohl `rec.place` und `rec.placeId` vorliegen — `recommend.ts:160-161`) und identisch `mobile/app/together/[id].tsx:71-79` (obwohl `place` dort per `placeById` bekannt ist, `:36`).
- **Problem:** Kette: SAVE FOR US → `saved.tsx:142-178` `markDone` reicht `d.placeId/placeName/...` weiter (alle `undefined`) → `memory/create.tsx:126-141` reicht leere Strings weiter → `feedback/[id].tsx:71` `placeId` ist falsy → **der ganze Block „ANONYMEN ORTE-TIPP TEILEN" (`:209-234`) rendert nicht**. Ergebnis: Wer eine Idee über den Date-Generator oder das Ideen-Detail speichert und erlebt, kann den Ort **nie** anonym bewerten. Der letzte Loop-Schritt existiert praktisch nur im Places-Tab.
- **Verstoß:** MANIFESTO §5 (die Produktschleife wird nicht geschlossen) — und untergräbt das Community-Feature aus §2.
- **Fix:** In `discover.tsx:237-245` und `together/[id].tsx:71-79` die Ortsfelder mitschreiben, wenn `rec.place` / `place` Koordinaten hat (`placeId`, `placeName`, `placeAddress`, `placeLat`, `placeLng`, `placeCategory`) — dieselben Felder, die `community.tsx:465-468` schon korrekt füllt. Die Spalten existieren bereits (Migration `0010`, `supabase.ts:300-303`).

### Befund A3-17 (mittel) — „planen" im Browse legt keinen Plan an
- **Datei:Zeile:** `mobile/app/discover/browse.tsx:402-411` (Button „plan/planen") → `:133-146` `addToCalendar` → nur `shareCalendarEvent`
- **Problem:** Der Button verspricht „planen", exportiert aber nur eine ICS-Datei ins OS-Share-Sheet. Es entsteht kein `SavedDate` mit Status `planned`, nichts erscheint unter „gemerkte Pläne", der Loop startet nicht. Zwei Screens weiter heißt derselbe Schritt „PLAN THIS DATE" und tut etwas völlig anderes (`saved.tsx:358-365`).
- **Verstoß:** MANIFESTO §5 (PeakPlant-Verben, eine klare Bedeutung pro Aktion).
- **Fix:** Erst `savedDateRepository.save({... status:'saved'})`, dann auf `/discover/saved?plan=<id>` navigieren (exakt wie `community.tsx:472`), Kalenderexport dort als Sekundäraktion belassen. Oder den Button ehrlich „in den Kalender" nennen.

### Befund A3-18 (mittel) — der Kalender-Link aus Browse führt in „Idee nicht gefunden"
- **Datei:Zeile:** `mobile/app/discover/browse.tsx:137` (`ideaLink(idea.id)` mit Katalog-Ids wie `idea-0-0-0`) → `mobile/app/i/[id].tsx:11` (`Redirect href={/together/${id}}`) → `mobile/app/together/[id].tsx:35` (`momentById(id)` sucht nur in `TOGETHER_MOMENTS`) → `:178-193` Fehlerzustand.
- **Problem:** Belegt: `IDEA_CATALOG` hat 1275 Einträge mit Ids `idea-*`, `TOGETHER_MOMENTS` hat 108 mit Ids `tm-*`/`cm-*` — kein Überlapp. Jeder aus der Bibliothek geteilte/exportierte Link landet garantiert auf „Idee nicht gefunden." Gleiches gilt für `saved.tsx:218-220` bei aus Browse gespeicherten Ideen.
- **Verstoß:** MANIFESTO §1 (ein Link, der etwas verspricht, das die App nicht hält).
- **Fix:** In `together/[id].tsx` einen Fallback auf `ideaById(id)` aus `lib/discovery/ideaCatalog.ts:507` ergänzen und `DateIdea` auf die gleiche Detailansicht mappen (Ort/Rating-Blöcke entfallen dort). Damit ist gleichzeitig A3-19 gelöst.

### Befund A3-19 (mittel) — `/places/` und `/t/` sind als Deep-Links deklariert, existieren aber nicht
- **Datei:Zeile:** `mobile/app.json:44-45` (`pathPrefix: "/t/"`, `"/places/"`) — im Router gibt es weder `app/t/` noch `app/places/` (`ls app/`). Erzeugt wird `/places/...` von `lib/links.ts:29` `placeLink`, benutzt in `app/discover/saved.tsx:219`.
- **Problem:** Ein Kalendereintrag für einen von der Karte geplanten Ort trägt einen Link, den die App nicht auflösen kann.
- **Verstoß:** MANIFESTO §1.
- **Fix:** `app/places/[id].tsx` als Redirect auf `/(tabs)/community?place=<id>` anlegen (die Route akzeptiert den Parameter bereits, `community.tsx:120, 164-168`), oder `placeLink` bis dahin nicht in Exporte schreiben.

---

## 7. Anonymität der Orts-Bewertung

**Payload, den ich im Code verfolgt habe:**
- `community.tsx:501-505` → `publicPlaceFeedbackRepository.save({ placeId, rating, tip })` — mehr nicht.
- `feedback/[id].tsx:114-118` → identisch, und nur wenn `shareAnonymously` explizit an ist (`:110`).
- `supabase.ts:472-484` → `insert({ place_id, rating, tip: sanitiseTip(tip) })`, Select nur `id, place_id, rating, tip, created_at`. **Kein** `space_id`, **kein** `user_id`, **kein** `memory_id`, **kein** `saved_date_id`, **kein** Notiztext.
- Der Spot selbst (`saveSpot`, `:442-459`) trägt nur Venue-Fakten: `id, name, address, lat, lng, category, maps_url, source_id`.
- Serverseitig bestätigt: `supabase/migrations/0009_public_place_feedback.sql:11-17` — die Tabelle **hat gar keine** Spalte für Identität; `0010:8-18` ebenso für Spots. Es kann also auch keine Trigger-/Default-Zuordnung geben.
- `sanitiseTip` (`lib/privacy/boundaries.ts:44-48`) trimmt und kappt bei 280; die UI limitiert zusätzlich (`community.tsx:1045`, `feedback/[id].tsx:199`).

**Verdikt: die Anonymitäts-Zusage hält — nur Spot + Sterne + Tipp verlassen das Gerät.** UI-Kommunikation ist glasklar: Sheet-Kicker „ANONYMER MAP-TIPP" + expliziter Satz `community.tsx:1021-1026` („Nur dieser Spot, Sterne und optionaler praktischer Tipp werden öffentlich. Space, Erinnerung und Identität bleiben privat."), Button „NUR DEN ORT TEILEN" (`:950`), Fußnote `:995-1000`. Auf dem Feedback-Screen zweifach (`:227-232` und `:236-241`). Der Toggle ist per Default **aus** (`feedback/[id].tsx:69`). Ebenfalls sauber: `feedbackRepository` ist bewusst local-only (`lib/repositories/index.ts:34`), damit stimmt die Aussage „privat auf diesem Gerät" in `community.tsx:836-838` und `together/[id].tsx:246-248` tatsächlich.

### Befund A3-20 (mittel) — widersprüchliche Copy über demselben Tipp-Feld
- **Datei:Zeile:** `mobile/app/discover/feedback/[id].tsx:189-192` — „…**Bleibt vorerst privat auf diesem Gerät.**" steht direkt über dem Eingabefeld, dessen Inhalt 20 Zeilen weiter (`:117`) genau dann öffentlich wird, wenn der Toggle darunter an ist.
- **Problem:** Zwei sich widersprechende Datenschutzaussagen im selben Scroll-Viewport. Die zweite (`:227-232`) korrigiert die erste — aber wer nur die erste liest, teilt unwissentlich.
- **Verstoß:** MANIFESTO §1 und §2 („Ein einziger falscher Datenschutz-Satz kostet mehr Vertrauen, als zehn Features es aufbauen").
- **Fix:** `:189-192` umformulieren auf „privat in eurem Space — außer du teilst ihn unten ausdrücklich anonym."

### Befund A3-21 (niedrig) — anonymes Teilen ohne Backend teilt gar nichts, sagt aber „öffentlich"
- **Datei:Zeile:** `mobile/lib/repositories/index.ts:38-40` (ohne `EXPO_PUBLIC_SUPABASE_*` greift `localPublicPlaceFeedbackRepository`, `local.ts:335-373`) gegen `community.tsx:1021-1026` („werden öffentlich") und den Button `:1067` „ANONYM TEILEN".
- **Problem:** Im lokalen Modus landet die „öffentliche" Bewertung in AsyncStorage. Untertreibung statt Übertreibung — also harmlos für den Nutzer, aber die Copy stimmt nicht mit dem Code überein.
- **Verstoß:** MANIFESTO §1 (auch in die andere Richtung).
- **Fix:** Bei `!isSupabaseConfigured` den Sheet-Text auf „bleibt auf diesem Gerät, bis die Community-Verbindung steht" umschalten.

### Befund A3-22 (niedrig) — kein Spam-/Doppel-Schutz auf dem öffentlichen Kanal
- **Datei:Zeile:** `supabase/migrations/0009_public_place_feedback.sql:33-38` (`for insert with check (true)`, Grant an `anon`) und `community.tsx:495-524` (keine lokale Dedupe)
- **Problem:** Derselbe Nutzer kann denselben Spot beliebig oft bewerten; der Durchschnitt (`community.tsx:65-72`) ist damit trivial manipulierbar. Das ist der Preis echter Anonymität, aber ungemindert.
- **Verstoß:** kein Manifest-Prinzip direkt; gefährdet aber die Glaubwürdigkeit der angezeigten Zahl (§1).
- **Fix:** Lokalen „schon bewertet"-Marker pro `placeId` setzen und den Button entsprechend umbeschriften; serverseitig ein Rate-Limit pro IP/Zeitfenster in einer neuen (additiven) Migration.

---

## 8. `app/discover/browse.tsx` — jeder Pfad

| Pfad | Zustand |
|---|---|
| Suche (`:190-206`) | funktional, aber siehe A3-23 |
| Filter WER / WANN / BUDGET / ENERGIE / WO / JAHRESZEIT / KATEGORIE (`:246-315`) | **alle sieben live** — `filterIdeas` (`ideaCatalog.ts:532-553`) wertet jeden aus; Toggle-Verhalten (`:88-93`) korrekt; `activeFilterCount` (`:558-570`) zählt alle inkl. `query` |
| Speichern / erledigt (`:103-131`) | funktional inkl. optimistischem Flip + Rollback + Alert |
| „planen" (`:402-411`) | **siehe A3-17** — legt keinen Plan an |
| Detail-Navigation | **fehlt vollständig — siehe A3-24** |
| Performance bei 1275 | siehe A3-25 |

**GESUND geprüft:** Ich habe `filterIdeas` gegen den echten Katalog laufen lassen: 1275 Einträge, `cook` → 141, `walk` → 98, `museum` → 40, `picnic` → 30. Budget-Filter ist korrekt als „≤" implementiert (`ideaCatalog.ts:526-528`), `indoorOutdoor` lässt `flexible` durch (konsistent mit dem Recommender), `season` respektiert `any`. Leerzustand mit „FILTER LÖSCHEN" vorhanden (`browse.tsx:320-327`). Trefferzahl live sichtbar (`:239-241`). `LayoutAnimation` mit Android-Opt-in (`:41-43`) — sauber.

### Befund A3-23 (hoch) — deutsche Suche liefert garantiert null Treffer
- **Datei:Zeile:** `mobile/lib/discovery/ideaCatalog.ts:547-550` (Substring-Suche über `title + idea + tags`) — Katalog ist ausschließlich englisch (`ideaCatalog.ts:100-160` u. w.)
- **Problem:** Gemessen am realen Katalog: `Picknick` → **0**, `kochen` → **0**, `backen` → **0**, `spazieren` → **0**; die englischen Entsprechungen liefern 30/141/…/98. Null Einträge enthalten überhaupt einen Umlaut. Die Oberfläche drumherum ist aber deutsch („Ideen suchen…", „die Ideen-Bibliothek", `browse.tsx:182-199`) — ein deutschsprachiges Paar hält die Suche für kaputt.
- **Verstoß:** AGENTS.md „German copy is natural, cute & easy" und MANIFESTO §1 (die App verspricht eine deutsche Bibliothek, liefert eine englische).
- **Fix (aufsteigender Aufwand):** (a) sofort: Platzhalter ehrlich machen („search ideas in English / Ideen auf Englisch suchen") und unter dem Feld einen Hinweis; (b) richtig: `tags` je Familie um 3–5 deutsche Synonyme erweitern (`Family.tags`, `ideaCatalog.ts:88`) — die Suche greift bereits auf `tags` zu, das ist die billigste echte Lösung; (c) langfristig: `titleDe`/`ideaDe` pro Familie.

### Befund A3-24 (hoch) — es gibt keine Detail-Navigation aus der Bibliothek
- **Datei:Zeile:** `mobile/app/discover/browse.tsx:356-429` (`IdeaRow` ist eine `View`, kein `Pressable`; `renderItem` `:148-161` setzt kein `onPress`)
- **Problem:** 1275 Ideen, und keine einzige lässt sich öffnen. Es gibt keinen Weg zu „WHAT THIS IS LIKE", zu Ratings, zu `PLAN THIS DATE` / `WE ALREADY DID THIS` — also zu genau den Loop-Schritten, die `together/[id].tsx` für die kuratierten 108 anbietet. Die Bibliothek ist eine Sackgasse mit drei Icon-Buttons.
- **Verstoß:** MANIFESTO §5 (eine klare Primäraktion pro Zustand — hier fehlt sie) und §6 (`PressableScale` ist der Default-Tap, hier gar kein Tap).
- **Fix:** `IdeaRow` in `PressableScale` wickeln, `onPress → router.push('/together/' + idea.id)` — funktioniert, sobald A3-18 (Katalog-Fallback in `together/[id].tsx`) umgesetzt ist. Die beiden Befunde gehören in einen PR.

### Befund A3-25 (mittel) — Performance: 1275 Einträge ohne Memo und ohne Debounce
- **Datei:Zeile:** `mobile/app/discover/browse.tsx:81` (`filterIdeas` bei jedem Tastendruck über 1275 Einträge), `:356` (`IdeaRow` ohne `React.memo`), `:148-161` (`renderItem` hängt an `savedIds`/`completedIds`, die sich bei jedem Speichern als neues `Set` ändern → alle sichtbaren Rows re-rendern), `:171-179` (kein `getItemLayout`)
- **Problem:** Der ungefilterte Fall rendert die volle Liste; jedes Zeichen im Suchfeld triggert Filterlauf + FlatList-Diff. Zusätzlich sitzt das gesamte Filter-Panel im `ListHeaderComponent`, wird also bei jedem Filter-Tap mitre-rendert.
- **Verstoß:** MANIFESTO §6 (Micro-Interaktionen; „premium" statt „okay").
- **Fix:** `IdeaRow` in `React.memo` (mit `saved`/`completed` als primitiven Props), ~200 ms Debounce auf `query`, `getItemLayout` für die feste Kartenhöhe, `removeClippedSubviews` auf Android. Nicht dringend, aber der Screen ist der einzige mit vierstelliger Datenmenge.

### Befund A3-26 (niedrig) — „merken" ohne Space ist auch hier ein stiller No-Op
- **Datei:Zeile:** `mobile/app/discover/browse.tsx:105` (`if (!activeSpace) return;`) — dasselbe Muster wie A3-4.
- **Fix:** identisch zu A3-4.

### Befund A3-27 (niedrig) — die Bibliothek fließt nicht ins Learning ein
- **Datei:Zeile:** `mobile/app/(tabs)/discover.tsx:153` (`categoryOf: (id) => momentById(id)?.category`)
- **Problem:** Für aus Browse gespeicherte Ideen (`idea-*`) liefert `momentById` `undefined` → kein Affinitäts-Signal. Wer 20 Ideen aus der Bibliothek merkt, verändert die Empfehlungen um exakt nichts.
- **Verstoß:** kein direkter; aber §1, sobald die UI „PeakPlant lernt aus dem, was ihr merkt" behauptet.
- **Fix:** `categoryOf` um `ideaById(id)?.category` erweitern und die 10 Katalog-Kategorien auf die 5 `MomentCategory` mappen (`culture/learn → calm`, `adventure → outdoors`, `home/wellness → calm` o. ä.).

---

## 9. „Ask PeakPlant" / AI-Flow

**GESUND — das ist die sauberste Stelle der ganzen Dimension.** Ich habe jeden Fehlerpfad einzeln verfolgt:

| Fehlerfall | Verhalten |
|---|---|
| Edge Function nicht deployed | `functions.invoke` wirft/`error` → `askGateway.ts:60-65` `return null` → `source:'fallback'`, kuratierte Ideen |
| `ANTHROPIC_API_KEY` fehlt | Function liefert **501** (`supabase/functions/discover/index.ts:383-388`) → derselbe Fallback |
| Netz-/Auth-Fehler | `catch` in `fetchAiPicks` (`:62-65`) |
| Supabase gar nicht konfiguriert | `if (!supabase) return null` (`:46`) und `canUseAi` ist `false` (`:84`) → `source:'deterministic'` |
| AI antwortet mit unbekannten Ids | `mergeAiRanking` (`aiRecommend.ts:70-73`) verwirft sie; `merged.length===0` → Fallback (`askGateway.ts:89-105`) |
| AI erfindet Fakten | strukturell unmöglich: gesendet werden nur `momentId/title/concept` (`:53-57`), alle Fakten/Preise/Orte werden clientseitig wieder angeklebt (`aiRecommend.ts:79-86`) |
| Krisen-Text | Vorrang vor allem, neutrale Hilfe, kein Recommender-Aufruf (`ask/index.tsx:78-93`) |

**In jedem Fall bekommt der Nutzer kuratierte Ideen statt eines Fehlers** — und das Quellenlabel ist immer sichtbar (`ask/index.tsx:189-191`, Labels `askGateway.ts:31-32`). `recommendDates` wird **vor** dem AI-Versuch berechnet (`:82`), der Fallback kann also nicht selbst scheitern. Kill-Switch (`safety.ts:101`), Rohtext wird nie gesendet (`askGateway.ts:79` `_freeText`), `AI_WHY_MAX` deckelt (`aiRecommend.ts:32`). Monetarisierung ist aus (`config.ts:16`), `canUseAI` also immer `true` (`useEntitlement.ts:52-54`) — kein versteckter Paywall-Deadend.

### Befund A3-28 (mittel) — Ask fragt ohne Space und ohne Constraints
- **Datei:Zeile:** `mobile/app/ask/index.tsx:97-99` (`const base = { spaceType: activeSpace?.type ?? 'couple' }`)
- **Problem:** Der freie Text („was Ruhiges, drinnen, gratis") wird **nirgends** in Constraints übersetzt — weder clientseitig noch serverseitig (`askGateway.ts:79` ignoriert `_freeText` bewusst). Die Antwort ist damit für jede Eingabe identisch: dieselben Top-Ideen für `spaceType:'couple'`. Belegt: `recommendDates({spaceType:'couple'})` → immer `tm-1 | tm-2`. Weder Ziele, noch Tageszeit, noch die Discover-Chips fließen ein — obwohl `discover.tsx:161-170` genau so ein Constraint-Objekt schon baut.
- **Verstoß:** MANIFESTO §1 — der Screen sagt „Erzähl mir wie du dich fühlst und ich finde etwas Passendes" (`:54-57`) und „ideas that might fit", tut aber nichts mit dem Erzählten. Ohne aktive AI (Fallback-Fall, der laut Code der Normalfall sein kann) ist das eine leere Zusage.
- **Fix:** Einen reinen, testbaren `parseFreeText(text): Partial<DateConstraints>` in `lib/discovery/` ergänzen (Schlüsselwort-Mapping DE/EN auf `categories`, `energy`, `maxBudget`, `indoorOutdoor`, `maxDurationMin`) und in `ask/index.tsx:97` einfließen lassen. Mindestens aber: `goals` und `timeOfDay` wie in `discover.tsx` mitgeben. Und im Fallback-Fall die Copy ehrlich halten („aus unserer kuratierten Auswahl — beschreib es mit den Chips genauer").

### Befund A3-29 (niedrig) — der Deutsch-Text im Ask-Screen hat keine Umlaute
- **Datei:Zeile:** `mobile/app/ask/index.tsx:56` („Erzahl mir wie du dich fuhlst"), `:110` („passen konnte"); ebenso `app/together/[id].tsx:213` („WIE SICH DAS ANFUHLT"), `:222` („geschatzt"), `app/discover/feedback/[id].tsx:140-142` („UBERSPRINGEN"), `app/settings/preferences.tsx:121` („Intimitatsmerkmale").
- **Verstoß:** AGENTS.md explizit: „correct umlauts (ä ö ü ß) — never ASCII transliteration".
- **Fix:** Mechanisch korrigieren: „Erzähl mir, wie du dich fühlst", „passen könnte", „WIE SICH DAS ANFÜHLT", „geschätzt", „ÜBERSPRINGEN", „Intimitätsmerkmale".

---

## 10. Gespeicherte Ideen („SAVE FOR US")

**Wo sie landen:** `savedDateRepository` (`lib/repositories/index.ts:29-31`) — `supabase_saved_dates` wenn `EXPO_PUBLIC_SUPABASE_*` gesetzt (`supabase.ts:278-330`, Migration `0006`/`0010`), sonst AsyncStorage (`local.ts`). **Beide Modi geprüft, beide funktionieren:** Screens sprechen ausschließlich `index.ts` an, die Ortsfelder sind in beiden Adaptern vorhanden (`supabase.ts:300-303`).

**Wo man sie wiedersieht:**
- Pille „🔖 gemerkte Pläne · N" auf Discover (`discover.tsx:504-515`), Zähler aus `useFocusEffect` (`:139-149`) — aktualisiert sich also nach dem Speichern.
- Button-Zustand „FÜR UNS GEMERKT ✓" führt auf die Liste (`:680-688`).
- `/discover/saved` mit vollem Statusfluss saved → planned → completed → Memory (`saved.tsx:325-453`).
- Zeilen in Browse zeigen `saved`/`done` (`browse.tsx:60-74`), Karte zeigt „◷ geplant" / „✓ erlebt" (`community.tsx:871-879`), Detailscreen zeigt „GEMERKT ✓ · LISTE ANSEHEN" (`together/[id].tsx:332`). Der Zustand ist über alle fünf Oberflächen konsistent sichtbar. ✓

### Befund A3-30 (mittel) — „gemerkte Pläne" ohne Space hängt für immer im Skeleton
- **Datei:Zeile:** `mobile/app/discover/saved.tsx:55-64` — `if (!activeSpace) return;` steht **vor** `setLoading(true/false)`, `loading` startet aber auf `true` (`:49`)
- **Problem:** Die Pille auf Discover ist immer sichtbar (`discover.tsx:504`). Ohne aktiven Space landet man auf einem Screen, der dauerhaft `IdeaListSkeleton` (`:298-299`) zeigt — kein Text, kein Zurück-Weg außer der Systemgeste. Der sonst gute Leerzustand (`:300-316`) wird nie erreicht.
- **Verstoß:** MANIFESTO §1 (ein Ladezustand, der nie endet, ist eine Lüge) und §5.
- **Fix:** `if (!activeSpace) { setDates([]); setLoading(false); return; }` — und im Leerzustand zusätzlich auf `/space/new` verweisen, wenn gar kein Space existiert.

### Befund A3-31 (niedrig) — der geplante Ort ist in der Plan-Liste unsichtbar
- **Datei:Zeile:** `mobile/app/discover/saved.tsx:336-355` — gerendert werden `title`, `concept`, Dauer, Preis, Datum, Notizen; `d.placeName` / `d.placeAddress` (die `community.tsx:463-466` extra speichert) werden **nirgends** angezeigt.
- **Problem:** Wer von der Karte aus plant, sieht in „gemerkte Pläne" nur „Café Nordwind besuchen" — Adresse und Maps-Link (`d.placeMapsUrl`) liegen im Datensatz, werden aber nicht angeboten. Am Tag des Dates fehlt der Weg dorthin.
- **Verstoß:** MANIFESTO §5 (der Screen erfüllt seinen Zweck nur halb).
- **Fix:** In der Kartenzeile `📍 {d.placeName} · {d.placeAddress}` ergänzen und bei `d.placeMapsUrl` eine „ROUTE ÖFFNEN"-Sekundäraktion (analog `community.tsx:882-890`).

---

## Zusammenfassung

**Blocker (Vertrauen / Manifest §1–2):** A3-1 (toter Energie-Filter), A3-5 (Wetter-Widerspruch auf der Karte), A3-6 (Innsbruck-Wetter für alle), A3-12 (Datenschutz-Copy vs. gesendete GPS-Präzision), A3-16 (Loop bricht am Haupteinstieg), A3-8 (Innsbruck-Karte ohne Pins), A3-23/A3-24 (deutsche Suche 0 Treffer, keine Detail-Navigation in der Bibliothek).

**Ausdrücklich gesund und belastbar:** die Map-Readiness-Kette (`map-ready` nur bei `tileload`, `map-failed` bei Script-Block und Pre-Paint-tileerror, ehrlicher Zustand mit funktionierender Liste als Alternative), der AI-Fallback (fünf Fehlerpfade, jedes Mal kuratierte Ideen mit sichtbarem Quellenlabel, keine erfindbaren Fakten), die Anonymität der Orts-Bewertung (Client-Payload, Repository und Migration enthalten nachweislich weder User- noch Space- noch Notiz-Bezug; UI kommuniziert es dreifach und ist per Default aus), der offline-fähige deterministische Recommender, „near me" ist tatsächlich nicht an die Pilotstädte gebunden, die Standort-Abfrage ist einmalig, tap-getriggert und hat überall einen funktionierenden Weg ohne, und alle sieben Filter im Browse-Katalog filtern real.

**Ein Vorschlag zur Reihenfolge:** A3-16 + A3-18 + A3-24 gehören in einen PR (sie hängen alle am Katalog-/Ort-Durchreichen und schließen zusammen die Produktschleife), A3-5 + A3-6 + A3-12 in einen zweiten (Ehrlichkeits-Paket), A3-1 + A3-2 + A3-4 in einen dritten kleinen (Filter-Hygiene).