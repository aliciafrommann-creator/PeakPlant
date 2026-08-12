# Audit A1-kernloop — 2026-08-11 (read-only Analyse-Agent)

Ich habe den kompletten Loop gelesen (Scanner → QR-Resolver → Kartendetail → Moment anlegen → Foto-Persistenz beide Modi → Anzeige → Feed → Löschen/Bearbeiten). Bericht pro Checklistenpunkt, jeder Punkt einzeln, inkl. dem, was gesund ist.

---

## 1. Scan-Flow — `app/(tabs)/scan.tsx`

**Gesund:**
- Gültiger Karten-QR (`scan.tsx:82-96`): `handled.current` verhindert Doppelauslösung, Haptik (`confirmSuccess`), Token-Redemption wird gespeichert, Navigation zu `/card/[id]?unlocked=true` → Banner in `card/[id].tsx:130-136`. Kein Sackgassen-Ende.
- Storage-Hiccup beim Redeem (`scan.tsx:87-93`) blockiert bewusst *nicht* den legitimen Unlock — kommentiert und richtig entschieden.
- Verweigerte Berechtigung (`scan.tsx:127-155`): unterscheidet sauber `canAskAgain === false` (→ OPEN SETTINGS via `Linking.openSettings()`) von "noch nie gefragt" (→ ALLOW CAMERA). Beide Wege enden in einer Handlung. Kein Auto-Prompt beim Öffnen — passt zu Manifest §3 (einladen, nicht drängen).
- Malformed/unknown/expired: jeweils eigene, ehrliche Meldung + TRY AGAIN (`scan.tsx:156-168`).
- Abbruch = Tab verlassen; `useFocusEffect` (`scan.tsx:53-63`) resettet `handled`/`error` und lädt die Redeem-Liste neu. Sauber.
- Fallback ohne physische Karte: TRY DEMO CARD (`scan.tsx:184-192`).

**Befund A1-1 (Sackgasse) — `scan.tsx:79-81`, Status `used`:**
Eine bereits freigeschaltete Sammelkarte, die man erneut scannt, endet in „Diese Karte wurde bereits freigeschaltet." + nur TRY AGAIN. Die Karte *gehört* dem Nutzer, ist in der Edition sichtbar — aber der Scan bietet keinen Weg dorthin. Erneutes Scannen führt exakt wieder zur selben Meldung: echte Sackgasse.
*Verstoß:* Manifest §5 („jeder Screen-Zustand hat genau eine klare Primäraktion").
*Fix:* Bei `used` (und optional bei `ok`) `outcome.cardId` mitliefern und als Primäraktion „KARTE ÖFFNEN" → `router.push('/card/'+cardId)` anbieten; TRY AGAIN bleibt sekundär. `resolveScan` liefert die cardId bei `used` heute gar nicht mit — `ResolveOutcome` in `lib/qr.ts:122` um `cardId` erweitern.

**Befund A1-2 (Sackgasse light) — `scan.tsx:73-75`, Status `unknown_card`:**
„gehört zu einer Edition, die noch nicht erschienen ist" — ohne jeden Anschluss (kein Link zu Editionen/Shop, kein „benachrichtigt uns"). `components/edition/ShopLink.tsx` existiert und wird hier nicht genutzt.
*Fix:* Sekundäraktion „EDITIONEN ANSEHEN" → `/(tabs)/editions`.

**Befund A1-3 (Copy, Manifest/AGENTS German-Regel) — `scan.tsx:74`:**
`'Diese Karte gehort zu einer Edition…'` — ASCII-Transliteration statt „gehört". AGENTS.md: „korrekte Umlaute — nie ASCII-Transliteration".
*Fix:* `gehört`.

**Beobachtung (kein Blocker) — `scan.tsx:111-116`:** `onBarcodeScanned` ist bei Fehlerzuständen ungedrosselt (nur der `ok`-Pfad setzt `handled`). Bei einem dauerhaft sichtbaren Fremd-QR läuft `resolveScan` pro Frame. `setError` mit identischem String löst kein Re-Render aus, also kein Bug — aber ein `scanned`-Cooldown wäre sauberer.

---

## 2. Karten-Erkennung / QR-Auflösung — `lib/qr.ts`

**Gesund — das ist der beste Teil des Loops:**
- Reine Funktionen, keine I/O, alles injiziert über `ResolveContext` (`qr.ts:107-115`) — vollständig testbar, und `lib/qr.test.ts` existiert.
- Zwei Payload-Familien sauber getrennt (`qr.ts:99-105`): wiederverwendbare Kartenreferenz vs. Einmal-Token `PP1.<cardId>.<YYYYMMDD>.<nonce>`. Kollisionsfrei, da Kartenreferenz zuerst geprüft wird.
- URL-Unwrapping ignoriert Query/Hash und akzeptiert jeden Host (`qr.ts:44-48`) — robust gegen Druckerei-Varianten.
- Reihenfolge der Fehlerdiagnose ist bewusst „spezifischster Fehler zuerst" (`qr.ts:151-156`): unbekannte Karte → abgelaufen → benutzt.
- Ablauf inklusiv bis 23:59:59 UTC (`qr.ts:125-132`) — kein Off-by-one.
- Unbekannte Karten-ID: `cardExists` prüft gegen `SEED_CARDS` (`scan.tsx:24`) → `unknown_card`, kein Absturz, keine Navigation ins Leere. Korrekt.

**Befund A1-4 (Ehrlichkeit / dokumentierte Abwägung) — `lib/redeemedTokens.ts:9-11`:**
Redemption ist *device-scoped* (AsyncStorage). Nach Reinstall oder auf dem Zweitgerät ist derselbe Einmal-Token wieder einlösbar; umgekehrt ist eine legitim eingelöste Karte auf dem Partner-Gerät „unbenutzt". Die Abwägung *ist* dokumentiert (§8 erfüllt) — aber der Nutzertext „Diese Karte wurde bereits freigeschaltet" behauptet mehr Verbindlichkeit, als der Code hält.
*Fix (klein):* Copy entschärfen („auf diesem Gerät bereits freigeschaltet") bis der Server-Ledger existiert.

---

## 3. Moment anlegen — `app/memory/create.tsx`

Alle vier Eingabezustände einzeln:

| Zustand | Verhalten | Bewertung |
|---|---|---|
| nur Notiz | KEEP aktiv (`:198`), speichert `note.trim()` | gesund |
| nur Foto | KEEP aktiv, Notiz wird durch `t('photo moment','Fotomoment')` ersetzt (`:111`) | siehe A1-6 |
| beides | speichert beides | gesund |
| nichts | KEEP disabled (`:198,202`) + Guard in `handleSave` (`:91`) | gesund, konsistent |

**Gesund:** Validierung und UI-Botschaft passen zusammen — der Button ist sichtbar deaktiviert, kein stummes Nichts-passiert. Foto ist explizit als „optional" gelabelt (`:237`). Abbruch mit Inhalt fragt nach (`handleClose`, `:158-179`) — Manifest §5.

**Befund A1-5 (Datenverlust) — `app/_layout.tsx:63-66`:**
`memory/create` ist als `presentation: 'modal'` registriert, ohne `gestureEnabled: false`. Auf iOS lässt sich das Modal per Swipe-down schließen — dabei läuft `handleClose` **nicht**, die „diesen Moment verwerfen?"-Nachfrage wird komplett umgangen und eine getippte Notiz ist weg. Der Confirm-Dialog in `create.tsx:164-178` schützt also nur den CLOSE-Button.
*Verstoß:* Manifest §1/§5 — die App verspricht per Dialog, nicht ungefragt zu verwerfen, und hält es auf dem häufigsten Dismiss-Weg nicht.
*Fix:* In `_layout.tsx` `options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: false }}` — oder besser: `gestureEnabled` dynamisch aus dem Dirty-State, bzw. `usePreventRemove`/`beforeRemove`-Listener im Screen, der denselben Alert zeigt. Dasselbe gilt für `note/compose` und `space/edit` (außerhalb A1, aber gleiche Klasse).

**Befund A1-6 (erfundener Inhalt) — `create.tsx:111`:**
Ein reiner Foto-Moment bekommt den erfundenen Notiztext „Fotomoment" untergeschoben. Der erscheint danach im Feed (`MemoryCard.tsx:51-53`) und im Detail (`memory/[id].tsx:223`) wie etwas, das der Mensch geschrieben hat — und ist beim späteren Bearbeiten der vorbefüllte Text.
*Verstoß:* Manifest §1 („die App behauptet nie etwas, das der Code hält" → hier: kein erfundener Nutzerinhalt).
*Fix:* Leere Notiz zulassen (`note: note.trim()`) und in den Anzeigen bei leerer Notiz nichts bzw. das Kartenprompt rendern. Erfordert kleine Anpassung in `MemoryCard` (`numberOfLines`-Block konditional) und `memory/[id].tsx:223`.

**Befund A1-7 (Zustandsreihenfolge) — `create.tsx:92-100`:**
„kein aktiver Raum" wird erst **nach** dem Tippen auf KEEP gemeldet — also nachdem der Mensch Foto und Notiz eingegeben hat. `activeSpace` ist ab Mount bekannt (`useSpaces`, `create.tsx:66`).
*Verstoß:* Manifest §5 (Mehrdeutigkeit entfernen) — der Screen lädt zu einer Handlung ein, die er nicht ausführen kann.
*Fix:* Bei `!activeSpace && !spacesLoading` direkt einen Empty-State mit Primäraktion „SPACE ANLEGEN" (`/space/new`) rendern statt des Formulars.

**Beobachtung:** Die Notiz trägt kein „optional"-Label, obwohl sie es ist (Foto allein genügt). Asymmetrisch zu `:237`. Kein Fehler, aber ein Klarheits-Punkt.

---

## 4. Foto-Persistenz LOKAL — jede Picker-Aufrufstelle einzeln

Vollständiger Grep über `app/`, `components/`, `lib/` nach `launchImageLibraryAsync|launchCameraAsync|ImagePicker`. Es gibt **genau zwei** Aufrufstellen, keine weitere (kein `launchCameraAsync` im gesamten Code):

1. **`app/memory/create.tsx:80-88`** (`launchImageLibraryAsync`) → persistiert: **JA**, in `handleSave` via `persistPickedPhoto(photoUri,'memory')` (`:106-108`). ✅
2. **`app/space/edit.tsx:112-122`** (`launchImageLibraryAsync`) → persistiert: **JA**, `persistPickedPhoto(photoUri,'space-avatar')` im Nicht-Supabase-Zweig (`:141-144`), Upload im Supabase-Zweig. ✅

**Gesund:** `lib/photoStorage.ts:17-30` ist korrekt defensiv — no-op bei Supabase, no-op bei nicht-`file://`, idempotent bei bereits persistenten Pfaden (`:21`), Fallback auf die Original-URI statt Save-Blockade (`:27-29`). Extension wird aus der URI abgeleitet und Query-Suffixe entfernt (`:22`).

**Befund A1-8 (Verwaiste Kopien) — `create.tsx:106-108`:**
`persistPickedPhoto` läuft **in** `handleSave`. Schlägt der anschließende Repo-Write fehl (`:145`), bleibt die bereits erzeugte Kopie im `documentDirectory` liegen und der nächste Retry erzeugt eine weitere. Bei drei Fehlversuchen liegen drei Kopien desselben Fotos dauerhaft im App-Speicher, referenziert wird höchstens eine.
*Fix:* Ergebnis von `persistPickedPhoto` in einem State/Ref cachen (z. B. `durableUriRef`) und beim Retry wiederverwenden; oder direkt beim Picken persistieren statt beim Speichern.

**Befund A1-9 (Verwaistes Foto beim Löschen) — `lib/repositories/local.ts:101-106`:**
`localMemoryRepository.delete` entfernt nur den Datensatz. Die persistierte Datei im `documentDirectory` wird nie gelöscht. Im Supabase-Modus **wird** aufgeräumt (`supabase.ts:150-154`). Die beiden Modi verhalten sich also unterschiedlich, und im Lokalmodus wächst der App-Speicher monoton mit gelöschten Momenten — für den Nutzer unsichtbar, aber „gelöscht" ist es dann nicht wirklich.
*Verstoß:* Manifest §1/§2 — „das nimmt ihn für euch beide aus dem Tagebuch" (`memory/[id].tsx:95-96`) suggeriert Entfernung; die Bilddatei bleibt.
*Fix:* In `local.ts:delete` vor dem Filtern die Memory holen und bei `photoUri.startsWith(FileSystem.documentDirectory)` per `FileSystem.deleteAsync(uri,{idempotent:true})` best-effort löschen — analog zum Supabase-Zweig.

---

## 5. Foto-Persistenz SUPABASE — create und update einzeln

**`supabaseMemoryRepository.create` — `supabase.ts:91-114`: gesund.**
Jede vorhandene `photoUri` wird vor dem Insert hochgeladen (`:95-97`), gespeichert wird nur der Storage-Pfad. Bemerkenswert gut: schlägt der Insert fehl, wird das bereits hochgeladene Bild wieder entfernt (`:110`) — keine verwaisten Bucket-Objekte. EXIF-Strippen + Downscale passiert in `uploadMemoryPhoto` (`storage.ts:26-30`), Pfad ist space-scoped `<spaceId>/…` (`storage.ts:33`), passend zur member-scoped Bucket-Policy. Manifest §2 erfüllt.

**`supabaseMemoryRepository.update` — `supabase.ts:116-137`: teilweise.**
Der `file:`/`content:`-Fall ist explizit behandelt und lädt vorher hoch (`:122-129`), inkl. Kommentar warum. Gut.

**Befund A1-10 (latente Datenkorruption) — `supabase.ts:130-132`:**
Der else-Zweig schreibt `updates.photoUri` **verbatim** in `photo_path`. Aber genau das, was jeder Screen als `Memory.photoUri` in der Hand hält, ist nach `withSignedPhoto` (`:68-72`) eine **signierte HTTPS-URL**, kein Pfad. Ein Aufruf wie `updateMemory(id, { note, photoUri: memory.photoUri })` — über `useMemories.updateMemory` (`useMemories.ts:51-58`) trivial möglich — schreibt eine in einer Stunde tote URL als „Cloud-Pfad" in die DB. Das Foto wäre dann dauerhaft unauffindbar, obwohl die Datei im Bucket noch liegt. Heute ruft kein Screen das so auf; es ist eine scharfe Falle, die genau der Kommentar darüber vermeiden wollte.
*Fix:* Regex invertieren — nur ein `photoUri`, das **kein** `http(s):` ist und wie ein Storage-Pfad aussieht (`^[0-9a-f-]{36}/`), darf direkt geschrieben werden; `http(s):` → als „unverändert" behandeln (Patch-Key nicht setzen); leer/undefined → `null`. Zusätzlich: alte `photo_path`-Datei nach erfolgreichem Ersetzen per `deleteMemoryPhoto` aufräumen — das fehlt hier ebenfalls (Bucket-Leiche bei Fotowechsel).

**Befund A1-11 (Modus-Inkonsistenz) — `local.ts:89-99` vs. `supabase.ts:116-137`:**
Der lokale `update` schreibt `photoUri` roh in den Store (`:94`), ohne `persistPickedPhoto`. Der Supabase-`update` lädt hoch. Das Interface (`interfaces.ts`) verspricht in beiden Modi dasselbe; die Garantie „das Foto überlebt" gilt nur in einem. Ebenfalls heute nicht aufgerufen, weil es gar keine Foto-Bearbeitung gibt (siehe Punkt 9), aber die Asymmetrie ist eine Falle für den nächsten, der Foto-Editing baut.
*Fix:* `persistPickedPhoto` in `local.ts:update` ziehen, symmetrisch zu `supabase.ts`.

---

## 6. Anzeige signierter URLs — jede Fundstelle einzeln

Memory-Fotos werden an **vier** Stellen gerendert:

1. **Home-Feed-Karte** — `home.tsx:152` → `MemoryCard.tsx:33-35` (`FadeInImage`)
2. **Home-Filmstrip** — `home.tsx:379-389` (`FadeInImage`, sonst `polaroidBlank` mit ✦)
3. **Memory-Detail** — `memory/[id].tsx:197-199` (`FadeInImage`)
4. **Editions-Detail** — `editions/[id].tsx:53-62` → dieselbe `MemoryCard`

**Gesund:** Alle vier nutzen `FadeInImage` (Manifest §6 erfüllt, kein Aufploppen), alle vier prüfen `memory.photoUri` auf Existenz, keine crasht bei `undefined`. Der Filmstrip und `MemoryCard` haben gestaltete „kein Foto"-Zustände statt Löchern.

**Befund A1-12 (stiller Fotoverlust) — `supabase.ts:68-72`:**
```ts
const url = await signedPhotoUrl(m.photoUri).catch(() => undefined);
return { ...m, photoUri: url };
```
Schlägt das Signieren fehl (Netzwerk, RLS, fehlender Bucket), wird `photoUri` auf `undefined` gesetzt. Ergebnis: **alle vier** Anzeigeflächen rendern den „hat kein Foto"-Zustand (✦-Block, `MemoryCard.tsx:37-41`, `home.tsx:386-388`) — optisch identisch zu „hier war nie ein Foto". Der Nutzer sieht: mein Foto ist weg. Kein Hinweis, kein Retry. Das ist die unehrlichste Variante des Fehlerfalls.
*Verstoß:* Manifest §1 — die UI behauptet „kein Foto", obwohl das Foto existiert.
*Fix:* Fehlerzustand nicht mit „kein Foto" verschmelzen: `Memory` um ein `photoUnavailable?: boolean` (oder `photoPath` behalten und `photoUrl` separat) erweitern; die Anzeigen zeigen dann einen dezenten „Foto konnte gerade nicht geladen werden — nochmal versuchen"-Platzhalter statt des ✦-Blocks.

**Befund A1-13 (kein Fehlerpfad im Bildprimitiv) — `components/ui/FadeInImage.tsx:19-35`:**
Es gibt nur `onLoad`, kein `onError`. Läuft eine signierte URL zwischen Laden und Rendern ab oder liefert 403, bleibt dauerhaft der graue Holder (`styles.holder`, `:42`) stehen — nicht unterscheidbar von „lädt noch", ohne Retry, ohne Ende.
*Fix:* `onError` ergänzen → Fallback-Layer (Mark/Cream-Fläche + optional Retry-Callback als Prop). Betrifft alle Fotoflächen der App auf einmal.

**Befund A1-14 (Ablauf während der Sitzung) — `lib/supabase/storage.ts:17` + `useMemories.ts:33-37`:**
`SIGNED_URL_TTL = 1h`. Neu signiert wird nur bei `load()`, also bei Fokuswechsel oder Pull-to-Refresh. Ein Home-Screen, der länger als eine Stunde im Vordergrund bleibt (oder eine Detailseite, die offen liegt), zeigt danach tote URLs — in Kombination mit A1-13 dauerhaft graue Kästen.
*Fix:* TTL für Anzeige auf wenige Minuten senken und beim Bildfehler gezielt neu signieren (mit A1-13 zusammen lösbar), oder ein Refresh-Intervall/AppState-Resume-Hook.

**Befund A1-15 (Doppelter Signier-Traffic) — `home.tsx:43` + `useWeeklyChallenge.ts:8`:**
Home instanziiert `useMemories` zweimal (einmal direkt, einmal über `useWeeklyChallenge`). Beide laden bei **jedem** Fokus die volle Memory-Liste und signieren im Supabase-Modus **jede** Foto-URL — also 2 × N Storage-Requests pro Home-Fokus.
*Fix:* `useWeeklyChallenge(spaceId, memories)` die bereits geladene Liste durchreichen, oder `useMemories` hinter einen React-Query-Key legen (`QueryClientProvider` ist in `_layout.tsx:48` bereits vorhanden, wird aber für Memories nicht genutzt).

---

## 7. Tagebuch/Feed — erscheint der Moment sofort?

**Gesund — der Rückweg ist geschlossen:**
- `useMemories.createMemory` (`useMemories.ts:39-49`) macht optimistisches Prepend in den lokalen State.
- Entscheidend für den Feed ist aber `useFocusEffect(load)` in `useMemories.ts:33-37`: Home lädt bei jedem Fokus neu. Nach `router.replace('/memory/'+id)` (`create.tsx:143`) und Zurücknavigieren ist der Moment da.
- Lokalmodus: `memoryCache.invalidatePrefix('memories:')` in create/update/delete (`local.ts:85,97,105`) — der 5-Sekunden-Cache (`cache.ts:27`) kann also keinen veralteten Feed liefern.
- Kartenfortschritt („GROWING TOGETHER") wird per eigenem `useFocusEffect` neu berechnet (`home.tsx:118-122`) — kommentiert und korrekt.
- Belohnung: `setPendingReward('moment')` (`create.tsx:117`) → Toast auf Home (`home.tsx:75-81`), mit 5-Minuten-TTL (`pendingReward.ts:12`), damit kein Toast Stunden später auftaucht. Manifest §5 („sichtbare Konsequenz im Space") sauber erfüllt.
- Auch der Saved-Date-Umweg (`create.tsx:120-141` → `discover/feedback/[id].tsx:90` → `/memory/[id]`) endet in einer sichtbaren Konsequenz.

**Befund A1-16 (klebriger Fehlerzustand → falscher Empty-State) — `useMemories.ts:17-25`:**
`load()` setzt `error` im catch, aber **nirgends** wieder auf `null` bei Erfolg. Folge auf Home: Erster Load scheitert (offline) → `error` gesetzt. Nutzer geht online, `refresh` läuft durch, der Space ist aber (noch) leer → `!loading && error && recentMemories.length === 0` ist weiterhin wahr (`home.tsx:497`) → der Nutzer sieht dauerhaft „kurz die Verbindung verloren" statt des echten Empty-States mit der Primäraktion **„ERSTE KARTE SCANNEN"** (`home.tsx:511-522`). Genau der Einstieg in den Kern-Loop ist dann unerreichbar, bis die App neu gestartet wird.
*Verstoß:* Manifest §1 (die UI behauptet einen Fehler, den es nicht mehr gibt) und §5 (Screen ohne Primäraktion).
*Fix:* In `load()` im `try` vor `setMemories` ein `setError(null)` — eine Zeile.

---

## 8. Fehlerwege bei Netzwerk-/Speicherfehler

**Gesund:**
- `create.tsx:145-155`: ehrliche Meldung („der Moment konnte nicht gespeichert werden. prüfe deine Verbindung und versuche es erneut."), `saving` wird zurückgesetzt, **Notiz und Fotoauswahl bleiben im State** → echter Retry ohne Datenverlust. `accessibilityLiveRegion="polite"` (`:257`). Vorbildlich, kein stiller Fehler.
- Supabase-Upload-Fehler propagiert aus `uploadMemoryPhoto` → landet in genau diesem catch. Kein halb geschriebener Zustand (siehe Rollback `supabase.ts:110`).
- `memory/[id].tsx:83-87` (Edit) und `:108-110` (Delete): eigene, ehrliche Fehlermeldungen statt stillem Scheitern.
- `home.tsx:496-508`: Load-Fehler ist ausdrücklich **nicht** als „keine Momente" dargestellt, mit TRY AGAIN. Der Kommentar sagt das auch so. Genau richtig.
- `markTokenRedeemed` wirft laut Doku bei Fehler (`redeemedTokens.ts:23`) und der Scanner behandelt das bewusst (`scan.tsx:89-93`).

**Befund A1-17 (Fehlermeldung ohne sichtbare Retry-Aktion) — `create.tsx:148-155`:**
Nach dem Fehler ist der Retry nur der KEEP-Button oben rechts (`:196-205`) — 10px-Text am Screenrand, während die Fehlermeldung unten im ScrollView steht und der Nutzer je nach Scrollposition den Button gar nicht sieht. Es gibt keine Aktion *bei* der Meldung.
*Fix:* Neben der Fehlerzeile eine „NOCHMAL VERSUCHEN"-Sekundäraktion rendern, die `handleSave` erneut auslöst (Manifest §5).

**Beobachtung:** Kein Offline-Queueing/Draft-Persistenz — stirbt die App im Fehlerzustand, ist die Notiz weg. Für die Beta vertretbar, aber nirgends dokumentiert (§8). Ein Satz in `AGENTS.md` wäre ehrlich.

---

## 9. Löschen / Bearbeiten eines Moments

**Vorhanden?** Teilweise. **Konsistent?** Nein.

**Gesund:**
- Löschen: `memory/[id].tsx:90-115` mit destruktivem Confirm-Alert und ehrlichem Text („das nimmt ihn für euch beide aus dem Tagebuch"), Haptik, Navigation zurück; Fehler wird gemeldet statt verschluckt.
- Beide Repos implementieren `delete` (`local.ts:101`, `supabase.ts:139`), Supabase räumt bewusst *nach* dem DB-Delete auf und lässt den Storage-Fehler nicht die UI-Wahrheit verfälschen (`supabase.ts:151-153`) — gut begründet.
- Bearbeiten der Notiz: `memory/[id].tsx:74-88`, Inline-Edit mit CANCEL/SAVE, Validierung (`!draftNote.trim()` → disabled, `:170,175`).

**Befund A1-18 (fehlende Funktion) — `memory/[id].tsx:234-253`:**
Es gibt **keine** Möglichkeit, das Foto eines Moments zu ändern oder zu entfernen — nur „NOTIZ BEARBEITEN". Wer versehentlich das falsche Bild aus der Galerie wählt, kann den Moment nur löschen und komplett neu anlegen. Beide Repositories unterstützen `photoUri` im Update-Contract; die UI nutzt es nirgends.
*Verstoß:* Manifest §2 im Geist — ein privates Foto, das man nicht mehr entfernen kann, ohne den Moment zu opfern.
*Fix:* Im Edit-Modus die Fotofläche antippbar machen (Picker + „FOTO ENTFERNEN"), `updateMemory(id,{photoUri})` verwenden — **erst** nachdem A1-10 (Supabase-URL-Falle) und A1-11 (lokales `persistPickedPhoto`) behoben sind, sonst korrumpiert genau dieses Feature die Daten.

**Befund A1-9 (Wiederholung, hier einsortiert):** Foto verwaist beim Löschen im Lokalmodus, wird im Supabase-Modus aufgeräumt. Siehe Punkt 4.

**Befund A1-19 (Copy) — `memory/[id].tsx:250`:**
`t('DELETE', 'LOSCHEN')` — muss „LÖSCHEN" heißen. AGENTS.md nennt genau dieses Wort als Negativbeispiel („nie ASCII-Transliteration — ‚loschen'"). Steht auf dem destruktivsten Button des Loops.

**Befund A1-20 (fehlende Testabdeckung) — `lib/repositories/`:**
Es gibt `feedback.test.ts`, `notes.test.ts`, `rituals.test.ts`, `space.test.ts`, `spaceCreation.test.ts` — aber **keinen** Test für das Memory-Repository, obwohl dort die gesamte Foto-Pfad-/Upload-/Cleanup-Logik liegt und die zwei Modi auseinanderlaufen (A1-9, A1-10, A1-11).
*Fix:* `memories.test.ts` mit den Fällen: create ohne Foto, create mit Foto, update nur Notiz, update mit `file:`-URI, update mit `https:`-URI (muss `photo_path` **nicht** überschreiben), delete räumt Foto auf. Manifest §7.

**Beobachtung — `local.ts:69-73`:** `localMemoryRepository.getById` filtert **nicht** nach `spaceId`. Wer per Deeplink `/memory/<id>` eines anderen Space öffnet, bekommt ihn im Lokalmodus zu sehen. Im Supabase-Modus fängt RLS das ab. Auf einem Ein-Nutzer-Gerät praktisch harmlos, aber die Modi geben unterschiedliche Garantien.

---

## 10. Manifest §1 — hält der Code jede UI-Aussage dieses Loops?

Jede Aussage im Loop einzeln geprüft:

| Aussage | Ort | Hält der Code? |
|---|---|---|
| „✓ KARTE FREIGESCHALTET" | `card/[id].tsx:133` | ✅ Token ist markiert, Karte navigierbar |
| „Das bleibt privat in eurem Space — nur ihr beide könnt es sehen." | `card/[id].tsx:89-91` | ✅ Exakt die vom Manifest §1 geforderte Formulierung, nicht „auf deinem Gerät" |
| „dieses Tagebuch bleibt privat — nur für euch beide" | `editions/[id].tsx:105` | ✅ RLS/space-scoped |
| „Das nimmt ihn für euch beide aus dem Tagebuch." | `memory/[id].tsx:95-96` | ⚠️ DB-Zeile ja; lokale Bilddatei bleibt (A1-9) |
| „eure Erinnerungen sind sicher — wir versuchen es gleich nochmal." | `home.tsx:502-503` | ✅ echter Load-Fehler, keine Löschung |
| „N von …" / „N MOMENTE" / „N festgehalten" | `home.tsx:333,358-360` | ⚠️ siehe A1-22 (Seed-Daten) |
| „N / 20 cards" GROWING TOGETHER | `home.tsx:431-433` | ❌ siehe A1-21 |
| „ein Moment, den es sich zu bewahren lohnt. **das bleibt privat.**" | `create.tsx:262-267` | ⚠️ siehe A1-23 |

**Befund A1-21 (falsche Zahl + falsche Kartenzuordnung) — `create.tsx:70` + `useMemories.ts:44`:**
```ts
const selectedCardId = cardId ?? 'card-01';   // create.tsx:70
await cardRepository.activate(data.cardId, spaceId);  // useMemories.ts:44
```
Von den **sieben** Einstiegen nach `/memory/create` übergibt genau **einer** eine `cardId`:

| Einstieg | `cardId` übergeben? |
|---|---|
| `card/[id].tsx:79` (PRESERVE THIS MOMENT) | ✅ ja |
| `home.tsx:62-67` (Wochen-Challenge-Kachel) | ❌ nein |
| `home.tsx:537` (ADD A MOMENT) | ❌ nein |
| `challenges/[id].tsx:104-113` (ADD PHOTO/NOTE) | ❌ nein |
| `discover/saved.tsx:150-166` (markDone) | ❌ nein |
| `discover/saved.tsx:241-259` (preserveCompleted) | ❌ nein |
| `(tabs)/community.tsx:546-566` (Ort → Moment) | ❌ nein |
| `together/[id].tsx:94-105` (preserveDate) | ❌ nein |

Sechs von sieben Wegen erzeugen also einen Moment, der **fälschlich Karte 01 „Grow Something Together" zugeschrieben** wird — sichtbar als Kartentitel über dem Notizfeld (`create.tsx:212`), als „CARD 01" + Kartenprompt im Feed (`MemoryCard.tsx:44-49`), im Kartendetail des Moments (`memory/[id].tsx:202-207`) — **und** er aktiviert `card-01` im Space. Damit steigt der Zähler „GROWING TOGETHER — 1 / 20 Karten" (`home.tsx:431`) und der „CARDS"-Wert im Heartbeat (`home.tsx:340`), obwohl **nie eine Karte gescannt wurde**. Wer die App ohne physische Karten nutzt, sieht Sammelfortschritt für eine Sammlung, die er nicht besitzt.
*Verstoß:* Manifest §1 („keine Scheinzahl", „behauptet nie etwas, das der Code nicht hält") und §3 („Sammlung ist eine neutrale, warme Tatsache") — hier ist sie schlicht falsch.
*Fix:* `cardId` optional machen: `Memory.cardId` als `string | undefined` (Typ + beide Repos + Migration `card_id nullable`), `create.tsx` rendert den Kartenblock nur bei echter `cardId`, und `useMemories.createMemory` ruft `cardRepository.activate` **nur** wenn `data.cardId` gesetzt ist. Kurzfristige Minimalvariante ohne Schemaänderung: `activate` nur aufrufen, wenn der Screen mit `cardId`-Param aufgerufen wurde, und den Karten-Header bei fehlender `cardId` ausblenden.

**Befund A1-22 (Seed-Daten erscheinen als eigene Momente) — `local.ts:61,71,77` + `seed.ts:244ff`:**
Im Lokalmodus liefert `getAll` `SEED_MEMORIES`, wenn nichts gespeichert ist — fünf ausformulierte, sehr intime Tagebucheinträge in Ich-Form („we talked until 2am…", `seed.ts:249`), zugeordnet zu `card-11/12/14` (Edition 02). Der Nutzer sieht sie im Home-Feed, im Filmstrip, im Zähler „5 MOMENTE" und sie fließen über `useWeeklyChallenge.ts:13` in den Challenge-Fortschritt ein. Beim ersten eigenen Moment werden sie zusätzlich dauerhaft persistiert (`local.ts:77`: `stored ?? [...SEED_MEMORIES]`).
*Verstoß:* Manifest §1 (keine Scheinzahl, kein erfundener Inhalt).
*Fix:* Seed-Memories hinter ein explizites Demo-Flag (`lib/features.ts`) legen, das nur im Dev-Build greift; Produktions-Default ist die leere Liste — dann greift auch der schöne Empty-State (`home.tsx:511-522`), der derzeit im Lokalmodus praktisch nie zu sehen ist.

**Befund A1-23 (unpräzise Datenschutz-Aussage) — `create.tsx:262-267`:**
„das bleibt privat." — im Supabase-Modus verlässt das Foto samt Notiz das Gerät. Der Satz sagt nicht „auf deinem Gerät", ist also nicht direkt falsch, aber unbestimmt, und er steht ausgerechnet auf dem Screen, auf dem das Foto hochgeladen wird. Die App kann es besser: `card/[id].tsx:89-91` und `editions/[id].tsx:105` sagen korrekt „privat in eurem Space — nur ihr beide".
*Verstoß:* Manifest §1 („im Zweifel untertreiben" / die Wahrheit sagen: „privat für euren Space").
*Fix:* Wortgleich zu `card/[id].tsx` angleichen: „bleibt privat in eurem Space — nur ihr beide könnt es sehen."

**Befund A1-24 (Privatsphäre-Gate wird im Loop umgangen) — `home.tsx:151-161, 368-400`:**
`editions.tsx:49` und `home.tsx:86-95` gaten sensible Editionen korrekt hinter Biometrie. Ein Moment aus einer sensiblen Edition (Edition 02 `soft-wild`, `seed.ts:95`) erscheint aber mit **Foto und Notiztext ungegatet** im Home-Feed (`MemoryCard`) und im Filmstrip — und `/memory/[id]` ist von dort ohne Biometrie erreichbar. Home rendert außerdem **keinen** `PrivacyScreen`, obwohl `memory/[id].tsx:156` das (richtigerweise) tut; im App-Switcher ist der Feed samt intimer Fotos also sichtbar.
*Verstoß:* Manifest §2 („Sensible Editionen werden im App-Switcher/Hintergrund verdeckt und hinter Biometrie gegatet") — der Kommentar in `home.tsx:83-84` behauptet sogar, die Lücke sei geschlossen; sie ist es nur für den Editions-Einstieg, nicht für die Momente selbst.
*Fix:* (a) `usePrivacyOverlay()` + `<PrivacyScreen />` auch in `(tabs)/home.tsx`, sobald mindestens ein sichtbarer Moment zu einer `sensitive`-Edition gehört; (b) `MemoryCard`/Filmstrip für sensible Karten standardmäßig blurren/maskieren und den Tap auf `/memory/[id]` durch `authenticate()` führen — analog `home.tsx:86-95`.

---

## Zusammenfassung

**Gesund und ausdrücklich bestätigt:** die gesamte QR-Logik inkl. Tests (`lib/qr.ts`), alle Berechtigungs- und Fehlerzustände des Scanners, die vier Eingabezustände von `create.tsx` mit konsistenter Button-Disabling-Logik, `persistPickedPhoto` und beide (nur zwei) Picker-Aufrufstellen, der Supabase-`create` inkl. Upload-Rollback, EXIF-Strippen und space-scopede Pfade, die Feed-Aktualisierung nach dem Anlegen (Focus-Reload + Cache-Invalidierung + Toast mit TTL), die ehrlichen Fehlermeldungen mit Inhaltserhalt in `create.tsx`/`memory/[id].tsx`/`home.tsx`, der Löschen-Confirm-Dialog, und die korrekte „privat in eurem Space"-Formulierung auf Karten- und Editions-Screens.

**Die vier, die ich zuerst beheben würde:**
1. **A1-21** — falsche Kartenzuordnung + inflationierter Sammelzähler bei 6 von 7 Einstiegen (Manifest §1, sichtbar für jeden Nutzer)
2. **A1-24** — sensible Momente ungegatet im Home-Feed und App-Switcher (Manifest §2)
3. **A1-5** — Swipe-Dismiss des Create-Modals verwirft die Notiz ohne Nachfrage (Datenverlust, Einzeiler-Fix)
4. **A1-16** — klebriger `error`-State sperrt den „ERSTE KARTE SCANNEN"-Empty-State aus (Einzeiler-Fix, blockiert den Loop-Einstieg)