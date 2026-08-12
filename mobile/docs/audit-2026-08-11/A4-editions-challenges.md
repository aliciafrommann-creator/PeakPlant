# Audit A4-editions-challenges — 2026-08-11 (read-only Analyse-Agent)

# A4-Audit — Editions, Weekly Challenge, Rewards

Read-only geprüft. Ich gehe jeden Checklistenpunkt einzeln durch, benenne pro Fläche Befund **und** Gesundes. Nichts geändert.

---

## 1. Weekly-Challenge-Lebenszyklus: annehmen → Moment → zählt? → abschließen → Reward

Ich habe jeden Übergang im Code verfolgt: `home.tsx:52` → `useWeeklyChallenge.accept` → `useChallenges.join` → `challenges.ts:107 joinChallenge` → `/memory/create` → `useMemories.createMemory` → `progressFor` → Anzeige.

**A4-01 — Challenge-Moment wird still auf `card-01` gebucht und aktiviert diese Karte**
`/home/user/PeakPlant/mobile/app/memory/create.tsx:70` — `const selectedCardId = cardId ?? 'card-01';`
Der Challenge-Weg (`home.tsx:62`, `challenges/[id].tsx:104`) übergibt **nur** `prefillNote`, nie `cardId`. Damit landet jeder Challenge-Moment auf `card-01` („Grow Something Together", `lib/content/edition01.ts:14`) und `useMemories.ts:44` ruft `cardRepository.activate('card-01', spaceId)` auf.
Folge: Edition 01 zeigt danach eine bewahrte Karte, die das Paar nie gemacht hat; der Filmstrip stempelt „01" auf das Moment (`home.tsx:393`); die Editions-Zählung ist falsch.
Verstoß: MANIFESTO §1 (die App behauptet etwas, das nicht stimmt).
Fix: `Memory.cardId` optional machen bzw. eine Sentinel-Quelle (`challengeId` statt `cardId`) einführen; `createMemory` nur aktivieren, wenn ein echter `cardId`-Parameter kam.

**A4-02 — Jeder beliebige Moment schließt die Challenge ab, auch ohne prefillNote**
`/home/user/PeakPlant/mobile/lib/challenges.ts:74-82` — `progressFor` zählt schlicht `memoryDates.filter(d >= joinedAt)`.
Die konkrete Frage aus dem Auftrag: **Ein Moment ohne prefillNote zählt trotzdem** — genauso wie ein völlig unbeteiligter Kartenscan oder ein aus `discover/saved` heraus festgehaltener Date-Moment. Es gibt keinerlei Verbindung Moment↔Challenge (`Memory` in `lib/types.ts` hat kein Challenge-Feld).
Verstoß: MANIFESTO §1 — „Challenge geschafft ✓" ist nicht durch die Handlung gedeckt, die behauptet wird.
Fix: `challengeId` optional auf `Memory` speichern und `progressFor` eine `memories: {createdAt, challengeId}[]`-Signatur geben; alternativ ehrlich umtexten („ein Moment diese Woche zählt").

**A4-03 — Abschluss hat KEIN Feedback; `RewardKind = 'challenge'` wird nirgends gesetzt**
`/home/user/PeakPlant/mobile/lib/pendingReward.ts:9` definiert `'challenge'`; `/home/user/PeakPlant/mobile/app/(tabs)/home.tsx:79` rendert dafür den Toast „challenge done ✦". Einziger Setter ist `/home/user/PeakPlant/mobile/app/memory/create.tsx:117` — `setPendingReward('moment')`. Grep über `app/`, `lib/`, `components/`: kein einziges `setPendingReward('challenge')`.
Folge: Der wichtigste Moment der ganzen Schleife (Challenge abgeschlossen, Sammel-Emoji verdient) ist **komplett stumm** — keine Haptik, kein Toast, kein Banner. Die Karte kippt beim nächsten Render lautlos auf „done".
Verstoß: MANIFESTO §5 („Nach jeder Primäraktion gibt es Feedback").
Fix: In `create.tsx` nach erfolgreichem `createMemory` prüfen, ob dadurch eine Enrollment komplett wurde, und dann `setPendingReward('challenge')` + `confirmSuccess()`.

**A4-04 — „Annehmen" auf Discover ist ein stiller No-Op ohne aktiven Space, feuert aber Erfolgs-Haptik**
`/home/user/PeakPlant/mobile/app/(tabs)/discover.tsx:542` — der ganze Challenge-Block liegt (anders als der StreakBanner in Zeile 308) **nicht** hinter `activeSpace &&`. Der Accept-Handler `discover.tsx:586` ruft `acceptChallenge().then(() => confirmSuccess())`; `useChallenges.ts:31` bricht bei `!spaceId` wortlos ab.
Folge: Erfolgs-Haptik ohne Wirkung; der Button bleibt stehen, nichts passiert. Hängt genau hier fest.
Verstoß: MANIFESTO §1 + §5. (Auf Home ist es korrekt in `activeSpace &&` gekapselt, `home.tsx:231` — dort gesund.)
Fix: Block in `activeSpace &&` einfassen oder Button deaktivieren/auf Space-Anlage leiten.

**A4-05 — Nach dem Speichern landet man nie auf Home, wo der Reward wohnt**
`/home/user/PeakPlant/mobile/app/memory/create.tsx:143` — `router.replace(\`/memory/${memory.id}\`)`. Der Toast wird ausschließlich in `home.tsx:75` beim Fokus konsumiert. Der Nutzer muss innerhalb von 5 Minuten (TTL) selbst auf den Home-Tab wechseln, sonst verfällt die Belohnung.
Verstoß: MANIFESTO §5 (sichtbare Konsequenz nicht garantiert).
Fix: siehe A4-11/A4-12.

**Gesund in Punkt 1:** `joinChallenge` ist idempotent (`challenges.ts:117`, DB-Unique `supabase/migrations/0001_init.sql:62`) — kein Doppel-Enrollment. Beitritt/Verlassen im Detailscreen gibt Haptik (`challenges/[id].tsx:33,37`). Der Hub-Card-Zustandsautomat (nicht angenommen → annehmen / laufend → `/memory/create` mit prefillNote / fertig → Review) ist in `home.tsx:52-68` sauber und einaktionig umgesetzt — genau eine Primäraktion je Zustand (§5 erfüllt).

---

## 2. ISO-Wochen-Rotation, Wochenwechsel, Jahreswechsel

**A4-06 — Enrollment kennt keine Woche: nach 8–9 Wochen ist jede Weekly dauerhaft „geschafft"** *(schwerwiegendster Befund)*
`/home/user/PeakPlant/mobile/lib/challenges.ts:26-29` (`Enrollment` = nur `challengeId` + `joinedAt`), `challenges.ts:117` (Re-Join wird verworfen), `supabase/migrations/0001_init.sql:62` (`unique (space_id, challenge_id)`).
Ablauf: Woche 11 → `wk-3` angenommen, erledigt. Woche 12 → `currentWeeklyChallenge()` liefert `wk-4`; die `wk-3`-Enrollment bleibt für immer bestehen. Woche 19 kommt `wk-3` zurück — `enrollmentFor('wk-3')` trifft, `joinedAt` ist 8 Wochen alt, `progressFor` findet zwangsläufig Momente danach ⇒ **`complete: true` ab der ersten Sekunde der Woche.** Die Hub-Karte zeigt sofort „THIS WEEK ✓ / done", ein erneutes Annehmen ist unmöglich (`joinChallenge` returned früh).
Folge: Nach ~2 Monaten ist das Feature tot — alle 8 Weeklies erscheinen dauerhaft als erledigt.
Verstoß: Zielbild „Weekly Challenge als gemeinsamer Anlass" (MANIFESTO §3) wird faktisch abgeschafft.
Fix: Enrollment-Key auf `challengeId + isoWeekKey` (z. B. `wk-3@2027-W19`) erweitern — additiv als neue Spalte `week_key` mit neuer Migration, Unique auf `(space_id, challenge_id, week_key)`.

**A4-07 — Fortschritt beim Wochenwechsel: Progress läuft weiter, Enrollment bleibt verwaist**
Nimmt man `wk-3` an und schafft sie nicht, wechselt die Woche: die Hub-Karte springt kommentarlos auf `wk-4`, der alte Fortschritt ist unsichtbar, aber `completedCount` (`weeklyChallenge.ts:20-29`) zählt `wk-3` weiterhin mit — sie kann Wochen später „nachträglich" ein Sammel-Emoji auslösen, sobald irgendein Moment entsteht. Kein Abschluss, kein Verfall, keine Info.
Fix: mit A4-06 zusammen lösen; abgelaufene Wochen-Enrollments beim Rendern nach `week_key` filtern.

**A4-08 — Jahreswechsel überspringt vier Challenges (verifiziert)**
`/home/user/PeakPlant/mobile/lib/weeklyChallenge.ts:14-17` — `WEEKLY_CHALLENGES[week % 8]` mit Woche-im-Jahr.
Simuliert: 2026-12-21 = KW 52 → `wk-5`; 2026-12-28 = KW 53 → `wk-6`; 2027-01-04 = KW 1 → **`wk-2`**. `wk-7`, `wk-8`, `wk-1` fallen aus. In einem 52-Wochen-Jahr springt es von `wk-5` direkt auf `wk-2`.
Verstoß: kein Manifest-Verstoß, aber Bruch der versprochenen Rotation („rotiert alle 7 Tage").
Fix: monotonen Wochenzähler nutzen, z. B. `Math.floor(Date.UTC(...)/604800000) % WEEKLY_CHALLENGES.length` — dann ist die Rotation über Jahresgrenzen lückenlos.

**A4-09 — Rotation aktualisiert sich nicht in einer laufenden Session**
`/home/user/PeakPlant/mobile/lib/hooks/useWeeklyChallenge.ts:11` — `useMemo(() => currentWeeklyChallenge(), [])` mit leerer Dep-Liste. Eine App, die über Sonntag→Montag im Hintergrund bleibt, zeigt weiter die Challenge der Vorwoche, bis die Tab-Komponente neu mountet.
Verstoß: §1 (angezeigter Zustand ist nicht der wahre).
Fix: in `useFocusEffect` neu berechnen oder Datums-Key als Dep.

**A4-10 — `currentWeeklyChallenge()` ignoriert `spaceTypes`**
`/home/user/PeakPlant/mobile/lib/weeklyChallenge.ts:14-17` vs. `/home/user/PeakPlant/mobile/lib/challenges.ts:58` — `wk-7` („one kind word", `spaceTypes: ['couple']`) wird in jeder Woche mit `week % 8 === 6` auch **Freunde-Spaces** angeboten. Ebenso trägt `wk-8` („one cosy night in, just the two of you") `spaceTypes: ['couple','friends']`, obwohl die Copy explizit paarbezogen ist.
Verstoß: §5 (falsche Handlung für den Kontext) + Zielbild Freunde-Space.
Fix: `currentWeeklyChallenge(type: SpaceType)` — erst nach `spaceTypes` filtern, dann modulo über die gefilterte Liste.

**Gesund in Punkt 2:** `isoWeekNumber` (`weeklyChallenge.ts:5-10`) selbst ist der korrekte Standard-Algorithmus (Donnerstag-Anker, ISO-Jahr des Anker-Datums) — die Wochennummer stimmt, auch KW 53. Innerhalb einer Woche ist die Auswahl deterministisch und stabil.

---

## 3. pendingReward: TTL, one-shot, App-Kill

**A4-11 — Reward überlebt keinen App-Kill / Reload**
`/home/user/PeakPlant/mobile/lib/pendingReward.ts:14` — `let pending` im Modul-Scope, keine Persistenz (`storage` wird nicht benutzt).
Szenario: Moment gespeichert (`create.tsx:117`) → Nutzer bleibt auf `/memory/[id]` → App wird gekillt/JS neu geladen → Reward ist weg, Home zeigt nie einen Toast.
Verstoß: §5 (Feedback fehlt), §6 (die Belohnungsschleife ist Teil des „Feel").
Bewertung: bewusst dokumentiert („Module-memory scope", Zeile 6) — also eine getroffene Abwägung, aber sie kollidiert mit dem Navigationsziel aus A4-05.
Fix: entweder in `storage` persistieren (mit demselben TTL) **oder** nach dem Speichern auf Home zurückführen, statt auf die Detailseite.

**A4-12 — TTL 5 Min ist gegen den tatsächlichen Flow zu knapp**
`/home/user/PeakPlant/mobile/lib/pendingReward.ts:12` + `create.tsx:143`. Weil `router.replace` auf `/memory/[id]` geht, ist Home nicht im Rückweg. Wer sein Moment noch liest, ein Foto tauscht oder das Handy weglegt, verliert die Belohnung lautlos.
Fix: TTL an den Flow koppeln (Home direkt anfahren) statt an eine Wanduhr.

**A4-13 — Doppelfeuern: nein. One-shot ist korrekt.** *(gesund, explizit geprüft)*
`/home/user/PeakPlant/mobile/lib/pendingReward.ts:27-30` — `pending` wird **vor** der TTL-Prüfung genullt. Auch ein abgelaufener Reward wird konsumiert, kann also nicht später doch noch feuern. Einziger Consumer ist `home.tsx:77`. Wiederholte Fokus-Events liefern `null`. Kein Doppel-Toast möglich.

**A4-14 — Toast-Timer wird bei jedem Home-Re-Render neu gestartet**
`/home/user/PeakPlant/mobile/components/ui/Toast.tsx:42` — Dep-Array enthält `onHide`; `/home/user/PeakPlant/mobile/app/(tabs)/home.tsx:165` übergibt `onHide={() => setReward(null)}`, eine bei jedem Render neue Funktion. Home rendert nach dem Fokus mehrfach neu (`useMemories`-Load, `loadEditionProgress`, `useChallenges`-Load). Effekt: Cleanup + Neustart, Einblend-Animation läuft erneut, die 2400 ms beginnen von vorn — der Toast kann sichtbar zucken oder deutlich länger stehen.
Verstoß: §6 (Micro-Interaktion ist genau das Qualitätsversprechen).
Fix: `onHide` in `home.tsx` mit `useCallback` stabilisieren, oder in `Toast` per Ref halten.

---

## 4. Sammel-Emoji pro Woche — serverseitig und lokal, Doppelvergabe

**A4-15 — Doppelvergabe ist ausgeschlossen** *(gesund, explizit geprüft)*
`/home/user/PeakPlant/mobile/lib/weeklyChallenge.ts:24-28` zählt **Enrollments**, nicht Abschlüsse; Enrollments sind pro `challengeId` eindeutig (lokal `challenges.ts:117`, Supabase `0001_init.sql:62` + `ignoreDuplicates: true` in `challenges.ts:111`). Zweimal abschließen in derselben Woche kann das Emoji nicht doppelt gutschreiben.

**A4-16 — Das Emoji wird nie gutgeschrieben, sondern jedes Mal neu errechnet — und kann verschwinden**
`/home/user/PeakPlant/mobile/lib/weeklyChallenge.ts:20-29` leitet `chillyCount` live aus `enrollments × memoryDates` ab. Es gibt keine Tabelle, keine Spalte, keinen lokalen Zähler (nur `spaces.collectible_emoji` = die *Auswahl* des Symbols, `0013_space_collectible.sql`).
Folgen, jeweils still:
- Ein altes Moment löschen (`useMemories.deleteMemory`) kann ein längst verdientes Sammelzeichen wieder entfernen.
- „LEAVE QUIETLY" (`challenges/[id].tsx:129`) löscht die Enrollment (`challenges.ts:122`) und damit das verdiente Emoji — während direkt darunter (`challenges/[id].tsx:136`) steht: „Verlassen behält jeden Moment — nur die Challenge verschwindet."
- `space/edit.tsx:270` verspricht: „ihr verdient eins, jedes Mal wenn ihr eine Challenge zusammen abschließt."
Verstoß: MANIFESTO §1 — die Copy behauptet dauerhaften Besitz, der Code hält ihn nicht.
Fix: Abschlüsse beim Eintreten persistieren (`challenge_completions`-Tabelle, additive Migration) und `chillyCount` daraus lesen; oder die Copy ehrlich machen.

**A4-17 — Serverseitig/lokal konsistent — mit einer Einschränkung**
Die Ableitung ist in beiden Modi identisch, weil beide dieselbe reine Funktion füttern (`useWeeklyChallenge.ts:19-22`). `joinedAt` kommt lokal aus `new Date().toISOString()` (`challenges.ts:118`), in Supabase aus `default now()` (`0001_init.sql:61`) — bei Uhrenabweichung Client/Server kann ein unmittelbar danach erstellter Moment knapp *vor* `joinedAt` liegen und nicht zählen (`progressFor` nutzt `>=`). Niedrige Wahrscheinlichkeit, aber real.
Fix: beim Vergleich eine kleine Toleranz oder serverseitig konsistente Zeitquelle.

**A4-18 — Zwei verschiedene Symbole für dasselbe Ereignis**
`/home/user/PeakPlant/mobile/app/(tabs)/discover.tsx:563` zeigt bei Abschluss `weekly.badge` (z. B. 🍽️ für `wk-5`), während `/home/user/PeakPlant/mobile/app/(tabs)/home.tsx:261` und `/home/user/PeakPlant/mobile/app/challenges/[id].tsx:64` `activeSpace.collectibleEmoji` (z. B. 🌶️) zeigen. Dieselbe geschaffte Challenge, zwei Sammelzeichen.
Verstoß: §5 (Mehrdeutigkeit statt Polish).
Fix: überall `collectibleEmoji ?? challenge.badge` wie in `challenges/[id].tsx:64`.

**A4-19 — Lebenslanges Maximum von 13 Sammelzeichen**
Aus A4-06/A4-15 folgt: `completedCount` kann höchstens `CHALLENGES.length + WEEKLY_CHALLENGES.length = 5 + 8 = 13` erreichen. Das Versprechen „jede Woche eins" ist nach ~3 Monaten strukturell nicht mehr einlösbar. `home.tsx:312` kappt die Anzeige zusätzlich bei 12.
Fix: mit A4-06 (Wochen-Key) automatisch behoben.

---

## 5. Editions-Screen — jede Karte/Sektion einzeln

Geprüft: `/home/user/PeakPlant/mobile/app/(tabs)/editions.tsx` vollständig plus `/home/user/PeakPlant/mobile/app/editions/[id].tsx`.

| Fläche | Zeile | Befund |
|---|---|---|
| Header-Kicker „EDITIONS / EDITIONEN" | `editions.tsx:106` | **gesund**, bilingual |
| Titel „your collections / eure Sammlungen" | `editions.tsx:107` | **gesund**, Bloom-Sprache |
| Lead-Text | `editions.tsx:119-124` | **gesund**, einladend, keine Druckmechanik |
| „SCAN CARD"-Button | `editions.tsx:109-117` | siehe A4-23 (kein `PressableScale`) |
| Edition-Karte: Symbol/Label/Name/Description | `editions.tsx:73-77` | **gesund** |
| Meta-Zeile „N von M bewahrt" | `editions.tsx:82` | **gesund** — exakt die vom Manifest §3 sanktionierte Formulierung, kein Prozent |
| Meta bei Vollständigkeit „✦ jeder Moment bewahrt" | `editions.tsx:81` | **gesund**, warm statt Trophäe |
| Upcoming-Karte („15-20 Karten - demnächst", `opacity 0.55`, `disabled`) | `editions.tsx:84-86,187` | **gesund** und ehrlich (§1): `cardCount: 0`, kein Fantasie-Inhalt |
| `privateBadge` „privat — nur für euch" | `editions.tsx:89` | **gesund** (§2), durch Biometrie-Gate `editions.tsx:50` gedeckt |
| Biometrie-Gate für `sensitive` | `editions.tsx:48-52` | **gesund**, wird auch von Home gespiegelt (`home.tsx:85-96`) |
| `ShopLink` im Footer | `editions.tsx:127` | ruhige Sekundäraktion, **gesund** |
| Detail-Header/Stats/Scan-CTA | `editions/[id].tsx:87-115` | **gesund**, eine klare Primäraktion |
| Detail Empty-/Error-State | `editions/[id].tsx:117-139` | **gesund**, unterscheidet Fehler von Leere |

**A4-20 — Auf dem Editions-Screen gibt es überhaupt keinen `AnimatedFill`/Fortschrittsbalken**
Grep über `AnimatedFill`: nur `home.tsx:426`, `discover.tsx:571`, `ProgressBar.tsx:21`. `/home/user/PeakPlant/mobile/app/(tabs)/editions.tsx` zeigt Fortschritt ausschließlich als Text.
Folge: Dieselbe Edition hat auf Home einen gleitenden Balken („GROWING TOGETHER") und auf dem Editions-Tab nur eine Zahl — zwei Darstellungen desselben Zustands.
Verstoß: §6 („Fortschritt gleitet") bzw. §5 (Inkonsistenz).
Fix: `AnimatedFill` in die Editions-Karte übernehmen, mit denselben Tokens wie `home.tsx:425-430`.

**A4-21 — Editions-Fortschritt aktualisiert sich nicht nach einem Scan**
`/home/user/PeakPlant/mobile/app/(tabs)/editions.tsx:28-45` — der Ladeeffekt hängt nur an `[activeSpace?.id]`. Home macht es richtig (`home.tsx:118-122`, `useFocusEffect`) und begründet es sogar im Kommentar. Der Editions-Tab bleibt gemountet, zeigt also nach Scan + Moment weiterhin den alten Stand.
Verstoß: §5 („sichtbare Konsequenz im Space").
Fix: denselben `useFocusEffect`-Refresh wie in `home.tsx:118` ergänzen.

**A4-22 — Gescannte vs. nicht gescannte Karten sind nirgends sichtbar**
Der Tab zeigt nur eine Zahl (`editions.tsx:82`); `/home/user/PeakPlant/mobile/app/editions/[id].tsx:75` listet ausschließlich `editionMemories` — die versiegelten (`status: 'sealed'`) Karten kommen in keinem Screen vor, obwohl das Repository sie liefert (`local.ts:112-117`). Ein Paar kann nicht sehen, welche Karten noch offen sind.
Bewertung: Produktlücke, kein Manifest-Verstoß (eher §3-konform, weil es keine Checkliste zum Abarbeiten gibt). Bewusst festhalten.

**A4-23 — Primäraktionen nutzen `TouchableOpacity` statt `PressableScale`**
`/home/user/PeakPlant/mobile/app/(tabs)/editions.tsx:109` (SCAN CARD) und `:60` (Edition-Karte), `/home/user/PeakPlant/mobile/app/editions/[id].tsx:102` (SCAN A CARD), `/home/user/PeakPlant/mobile/app/(tabs)/discover.tsx:585` (ACCEPT CHALLENGE), `/home/user/PeakPlant/mobile/components/challenge/ChallengeCard.tsx:20`.
Verstoß: MANIFESTO §6 wörtlich — „Taps nutzen `PressableScale` (Feder + Dim + Haptik)"; AGENTS.md nennt es „den Default-Tap". Home und Challenge-Detail machen es korrekt (`home.tsx:239`, `challenges/[id].tsx:90`).
Fix: auf `PressableScale` umstellen.

**A4-24 — „activated"/technisches Vokabular: kein Restbestand im UI** *(gesund, Grep durchgeführt)*
Grep über `app/`, `components/`, `lib/` nach `activated`: alle 20 Treffer sind intern — Typ (`lib/types.ts:2`), Repositories (`local.ts:112-135`, `supabase.ts:158-187`), Hook (`useEdition.ts:30`), AI-Kontext (`lib/ai/types.ts:8`), Zähl-Filter in `home.tsx:106` / `editions.tsx:37`. **Kein einziger user-sichtbarer String** sagt „activated", „unlocked deck", „completion" o. ä. Die sichtbare Sprache ist durchgehend bewahren/bloom/preserve/festhalten. Bloom-Sprache ist konsequent.

**A4-25 — ASCII-Transliteration in der deutschen Edition-Copy**
`/home/user/PeakPlant/mobile/app/editions/[id].tsx:134` — „**Schliesse** eine Karte ab" → „Schließe".
Ebenso im angrenzenden Scan-Pfad: `/home/user/PeakPlant/mobile/app/(tabs)/scan.tsx:74` — „**gehort**" → „gehört".
Und im Challenge-Bereich: `/home/user/PeakPlant/mobile/app/challenges/index.tsx:45` — „**konnt**" → „könnt", „**abschliessen**" → „abschließen"; `:73` — „**VERFUGBAR**" → „VERFÜGBAR".
Verstoß: AGENTS.md, Design-System: „German copy … mit korrekten Umlauten — never ASCII transliteration ('Zuruck', 'loschen')".
Fix: Umlaute setzen.

**A4-26 — `useEdition` ist toter Code**
`/home/user/PeakPlant/mobile/lib/hooks/useEdition.ts` — Grep über `app/`, `components/`, `lib/`: null Konsumenten. Der Hook (inkl. `activatedCount`) wird nirgends verwendet; beide Screens zählen selbst über `cardRepository.getAll`.
Fix: entweder die Duplikate in `home.tsx:103-109` / `editions.tsx:34-39` auf den Hook ziehen (dann wäre A4-21 an einer Stelle lösbar) oder den Hook entfernen.

---

## 6. Editions-Fortschritt-Berechnung / Dedupe

**A4-27 — Dedupe bei doppeltem Scan derselben Karte funktioniert** *(gesund, explizit geprüft)*
Lokal: `local.ts:112` `new Set(activations[spaceId])`, `local.ts:130-134` schreibt nur, wenn noch nicht enthalten. Supabase: `supabase.ts:158` `new Set(...)`, `supabase.ts:184` `upsert(..., { onConflict: 'space_id,card_id', ignoreDuplicates: true })`. Gezählt wird `cards.filter(status === 'activated')` (`editions.tsx:37`, `home.tsx:106`) — Kartenmenge, nicht Momentmenge. Zweimal dieselbe Karte = weiterhin 1. Zusätzlich schluckt `useMemories.ts:44` einen Aktivierungsfehler bewusst per `.catch(() => undefined)`, ohne den Moment zu verlieren.

**A4-28 — Die Detailseite zählt anders als der Tab**
`/home/user/PeakPlant/mobile/app/editions/[id].tsx:39` — `editionMemories = memories.filter(m => editionCardIds.has(m.cardId))`, ausgegeben in `:64-67` als „N Momente bewahrt". Das zählt **Momente**, nicht Karten. Zwei Momente auf `card-11` ⇒ Detailseite „2 Momente bewahrt", Tab „1 von 20 bewahrt". Die Detailzahl kann `cardCount` überschreiten.
Verstoß: §5 (dieselbe Sache, zwei Zahlen) und im Grenzfall §1.
Fix: entweder auf `new Set(editionMemories.map(m => m.cardId)).size` deduplizieren oder die Zahlen bewusst unterschiedlich labeln („N Momente in dieser Edition" vs. „N von 20 Karten").

**A4-29 — Latente Division durch Null in der Home-Fortschrittsberechnung**
`/home/user/PeakPlant/mobile/app/(tabs)/home.tsx:413` — `const pct = Math.min(100, (progress / e.cardCount) * 100);` ohne `cardCount > 0`-Guard. Heute unerreichbar (nur `edition-01`/`02` sind `available`, beide mit 20 Karten), aber jede künftige `available`-Edition mit `cardCount: 0` liefert `Infinity` → Balken sofort voll. `editions.tsx:80` prüft dagegen korrekt `item.cardCount > 0`.
Fix: denselben Guard in `home.tsx:413`.

**A4-30 — Die Fortschrittszahl ist durch A4-01 aktiv verfälscht**
Jeder Weekly-Challenge-Moment erhöht Edition 01 um genau eine „bewahrte" Karte. Das ist der Punkt, an dem der Zählfehler aus Punkt 1 in dieser Dimension sichtbar wird — Tab, Home-Balken und Detailseite zeigen alle drei zu viel.

---

## 7. Manifest-§3-Audit dieser Flächen — jede Fundstelle einzeln

**Geprüft und GESUND (keine Druckmechanik):**
- `home.tsx:301-308` „✦ N Momente diese Woche zusammen" — neutrale Tatsache, kein Ziel, kein Soll.
- `home.tsx:310-325` Sammel-Strip + „euer Sammelzeichen startet mit der ersten geschafften Challenge." — Einladung, keine Schuld-Copy.
- `home.tsx:251-253` „DIESE WOCHE ✓" — Feststellung, kein Countdown.
- `home.tsx:271-273` „N/M Momente · tippen zum Hinzufügen" — kein Prozent, kein „nur noch".
- `components/challenge/ProgressBar.tsx:24` „complete" / „N of M moments" — **kein Prozentwert irgendwo** in Challenge- oder Editions-Flächen. Explizit gegen §3 („kein X% erledigt") geprüft: sauber.
- `editions.tsx:82` „N von 20 bewahrt" — die im Manifest wörtlich genannte Zielformulierung.
- `challenges/index.tsx:44` „no scores, no rush / keine Punkte, keine Eile" — vorbildlich.
- `challenges/[id].tsx:129` „LEAVE QUIETLY / RUHIG VERLASSEN" — Ausstieg ohne Schuld.
- `challenges/[id].tsx:136` „Verlassen behält jeden Moment" — beruhigend (inhaltlich aber A4-16).
- `card/[id].tsx:95` „kein druck. macht, was sich richtig anfühlt." — vorbildlich.
- `challenges.ts:22` `durationLabel` als weiche Dauer statt Countdown — vorbildlich, Kommentar `challenges.ts:5-11` benennt die Regel selbst.
- Keine Leaderboards, keine Likes, kein Beziehungs-Score, kein Auto-Sharing in irgendeiner dieser Flächen.

**A4-31 — Push-Kategorie „your streak is at risk" ist per Default aktiv**
`/home/user/PeakPlant/mobile/lib/notifications/types.ts:22` — `| 'streak_at_risk' // "your streak is at risk"`, und `:31` — `streak_at_risk: true` in `DEFAULT_NOTIFICATION_PREFS`. Zum Vergleich sind `partner_activity` und `weekly_recap` mit ausdrücklicher Begründung auf `false` gesetzt.
Verstoß: MANIFESTO §3 direkt („Keine Streaks als Druck … keine aggressiven Notifications") und AGENTS.md „Prohibited: streaks-as-pressure". Loss-Aversion-Push ist die reinste Form der verbotenen Mechanik.
Aktuell inert, weil `lib/notifications/index.ts` den `nullNotifications`-Provider exportiert und `schedule()` ein No-Op ist (`null.ts:23`) — **aber** es ist der ausgelieferte Default in dem Moment, in dem der echte Provider getauscht wird (Schritt 5 der Anleitung in `null.ts:12`).
Fix: Kategorie streichen oder mindestens `streak_at_risk: false` mit derselben Begründungs-Kommentierung wie die anderen opt-ins.

**A4-32 — Streak-at-Risk-Mechanik im Produkt (Discover, feature-flag default an)**
`/home/user/PeakPlant/mobile/lib/streaks.ts:2-7` beschreibt sich selbst als „Strava-style" mit „one week of grace"; `/home/user/PeakPlant/mobile/components/space/StreakBanner.tsx:48-49` rendert im Risikofall „a moment this week keeps your rhythm going — no rush."; `/home/user/PeakPlant/mobile/lib/features.ts:24-33` setzt `streaks` auf `defaultEnabled: true`.
Bewertung: Die Copy ist bewusst entschärft („no rush", „shared rhythm" statt „streak"), das ist ehrlicher Aufwand. Die zugrunde liegende Mechanik — eine Zahl, die reißt, wenn man eine Woche aussetzt, plus die dazu passende Push-Kategorie — bleibt aber genau die von §3 verbotene. Da es hinter einem Feature-Flag liegt, das *an* ist, zählt es als aktive Fläche.
Fix: Entweder `atRisk` aus UI und Datenmodell entfernen (nur „N Wochen zusammen" ohne Verfall) oder `defaultEnabled: false`.

**A4-33 — `StreakBanner` ist vollständig unübersetzt**
`/home/user/PeakPlant/mobile/components/space/StreakBanner.tsx:23,25,37,41,49,50` — hartcodiertes Englisch, kein `useLanguage`. Auf einer deutschen Oberfläche steht „SHARED RHYTHM … you've shared moments 3 weeks in a row."
Verstoß: AGENTS.md („German copy is natural, cute & easy").

**A4-34 — Flammen-Emoji als Challenge-Icon**
`/home/user/PeakPlant/mobile/app/(tabs)/discover.tsx:524` — `'🔥 challenges'`. Die Flamme ist die etablierte Streak-Ikonografie (Duolingo/Snapchat). Weicher Befund, aber tonal genau die Social-Media-Logik, die §3 als Mechanik zulassen, als Logik aber ausschließen will.
Fix: neutrales Zeichen (✦ oder das Sammelzeichen des Space).

**A4-35 — Weekly-Challenge-Block ignoriert den Feature-Schalter**
`/home/user/PeakPlant/mobile/app/(tabs)/discover.tsx:516` gated den Challenges-Pill korrekt mit `challengesEnabled`, aber der komplette Weekly-Block ab `:542` steht ungeschützt. Wer „challenges" in den Einstellungen ausschaltet, bekommt sie trotzdem.
Verstoß: §3 im Geist („Der Mensch entscheidet") und §1 (die Einstellung hält nicht, was sie sagt).
Fix: `{challengesEnabled && ( … )}` um den Block.

---

## 8. Feedback nach Primäraktionen (§5)

| Aktion | Ort | Haptik | Toast/sichtbare Konsequenz | Urteil |
|---|---|---|---|---|
| Karte gescannt | `scan.tsx:85` `confirmSuccess()` | ✓ | „✓ KARTE FREIGESCHALTET"-Banner `card/[id].tsx:130-136` (2 s, animiert) | **gesund** |
| Moment festgehalten | `create.tsx:115` `confirmSuccess()` | ✓ | Toast auf Home `home.tsx:78` | **gesund**, mit Einschränkung A4-11/A4-12 |
| Challenge angenommen (Home) | `home.tsx:59` `confirmSuccess()` | ✓ | Karte kippt auf „tippen, um euren Moment hinzuzufügen" | **gesund** (kein Toast, aber sichtbare Konsequenz) |
| Challenge angenommen (Discover) | `discover.tsx:586` | ✓ | Kartenzustand | **A4-04** — feuert auch bei No-Op ohne Space |
| Challenge angenommen (Detail) | `challenges/[id].tsx:33` | ✓ | ProgressBar erscheint | **gesund** |
| Challenge verlassen | `challenges/[id].tsx:37` `acknowledgeSelection()` | ✓ | Buttons wechseln | **gesund** (leiser Ton ist korrekt gewählt) |
| **Challenge abgeschlossen** | — | ✗ | ✗ | **A4-03 — vollständige Lücke, §5-Verstoß** |
| Edition-Fortschritt nach Scan | `editions.tsx:28` | – | ✗ (stale) | **A4-21** |
| Karten-/Scan-Buttons in Editions | `editions.tsx:60,109` | ✗ (`activeOpacity`) | – | **A4-23**, §6 |

**A4-36 — kein einziges Analytics-Event für Challenges**
Grep über `/home/user/PeakPlant/mobile/lib/analytics/events.ts` nach `challenge`: null Treffer, während Discover/Saved-Dates dicht instrumentiert sind (`saved_idea_dismissed` u. a.). Ein Abschluss ist also weder für den Nutzer (A4-03) noch fürs Team sichtbar.
Bewertung: kein Manifest-Verstoß (§2 mahnt eher zur Zurückhaltung), aber der Grund, warum A4-06 vermutlich nie aufgefallen ist.

---

## 9. `ALL_CHALLENGES` vs. `WEEKLY_CHALLENGES` — verwaiste/unerreichbare Einträge

**A4-37 — 7 von 8 Weeklies sind zu jedem Zeitpunkt ohne Einstiegspunkt**
`/home/user/PeakPlant/mobile/lib/challenges.ts:65-67` — `challengesForSpaceType` filtert ausschließlich `CHALLENGES`. Der Listenscreen `/home/user/PeakPlant/mobile/app/challenges/index.tsx:27` nutzt nur diese Funktion. Die Weeklies erscheinen also **nirgends in einer Liste**; erreichbar ist pro Woche genau die eine aus `currentWeeklyChallenge()`, plus per Direkt-Route `/challenges/wk-N` (nur aus `home.tsx:53`, wenn bereits erledigt).
Der Kommentar `challenges.ts:45-50` nennt das als Absicht („damit die Liste unaufgeräumt bleibt") — die Abwägung ist also dokumentiert. In Kombination mit A4-06 kippt sie aber ins Verwaiste: nach einem Rotationszyklus sind alle 8 dauerhaft „erledigt" und keine ist je wieder annehmbar.

**A4-38 — `wk-7` ist für Freunde-Spaces erreichbar, obwohl `spaceTypes: ['couple']`** — siehe A4-10. Der einzige Datensatz mit einer Space-Typ-Einschränkung unter den Weeklies wird von der Auswahlfunktion ignoriert. Das ist der Datenbestand-Befund: die Einschränkung existiert, wird aber nirgends ausgewertet.

**A4-39 — Badge-Kollisionen über `ALL_CHALLENGES`**
`wk-1` 🌙 = `ch-2` 🌙 (`challenges.ts:39,52`); `wk-3` ✨ = `ch-5` ✨ (`:42,54`); `wk-4` 🧭 = `ch-3` 🧭 (`:40,55`). Der Typkommentar nennt `badge` „Collectible badge shown on completion" — als Sammlung sind sie nicht unterscheidbar. Heute folgenlos, weil Detail und Home `collectibleEmoji` bevorzugen; auf Discover (A4-18) wird es sichtbar.
Fix: eindeutige Badges oder `badge` als reines Dekor dokumentieren.

**A4-40 — Alle 13 Challenges sind englisch-only**
`/home/user/PeakPlant/mobile/lib/challenges.ts:14-24` — `title`, `subtitle`, `durationLabel` sind `string`, nicht `LocalizedText` (das Projekt hat den Typ, `lib/types.ts`, und nutzt ihn für Kartentexte). Ausgabe roh in `home.tsx:256`, `discover.tsx:558-559`, `challenges/[id].tsx:76-78`, `ChallengeCard.tsx:29,31,33`.
Folge: Auf deutscher Oberfläche steht „one soft evening / do one calm, unhurried thing together this week." mitten in deutscher UI — der Rahmen ringsum ist übersetzt, der Inhalt nicht.
Verstoß: AGENTS.md (German-first).
Fix: `Challenge` auf `LocalizedText` umstellen; `l()` beim Rendern.

**A4-41 — `ChallengeCard` und `ProgressBar` sind unübersetzt**
`/home/user/PeakPlant/mobile/components/challenge/ChallengeCard.tsx:40` — `{challenge.goalCount} moments` (hartcodiert; bei `goalCount: 1` außerdem „1 moments"). `/home/user/PeakPlant/mobile/components/challenge/ProgressBar.tsx:18,24` — `${...} of ${goal} moments` und `'complete'`, auch im `accessibilityLabel`.
Fix: `useLanguage` einziehen, Singular/Plural behandeln.

**A4-42 — `handleLeave` wird ohne `void` als Promise-Handler übergeben**
`/home/user/PeakPlant/mobile/app/challenges/[id].tsx:124` — `onPress={() => handleLeave(challenge.id)}` gibt ein Promise zurück, während `handleJoin` direkt daneben (`:93`) korrekt `void handleJoin(...)` nutzt. Stilbruch, potenziell `no-misused-promises`; unbehandelte Rejection wenn der Storage-Write fehlschlägt (der Nutzer sähe gar nichts).
Fix: `void` ergänzen und `leaveChallenge`-Fehler wie in `create.tsx:145` sichtbar machen.

---

## 10. Tests: `lib/challenges.test.ts` und `lib/weeklyChallenge.test.ts`

**Was tatsächlich abgedeckt ist** (49 + 26 Zeilen):
- `challenges.test.ts:9-14` Filter nach Space-Typ (nur Invariante „enthält den Typ", nicht die Vollständigkeit).
- `:16-21` `challengeById` Treffer + Miss.
- `:23-40` `progressFor`: Momente vor/nach Beitritt, Abschluss bei Zielerreichung, Null-Fall.
- `:42-49` Badge-Integrität — **nur über `CHALLENGES`**, nicht über `WEEKLY_CHALLENGES` oder `ALL_CHALLENGES`.
- `weeklyChallenge.test.ts:6-10` alle Weeklies `goalCount === 1` und `durationLabel === 'this week'`.
- `:12-16` `currentWeeklyChallenge()` liefert eine `wk-*`-Id mit Ziel 1.
- `:18-25` `completedCount` 0 ohne Moment, 1 mit Moment.

**Urteil: Rotation ist praktisch ungetestet, Abschluss nur im Trivialfall.** Die drei schwersten Befunde (A4-06 stale Enrollment, A4-08 Jahreswechsel, A4-10 spaceTypes) hätte jeder dieser fehlenden Tests gefangen.

**Konkret fehlend, einzeln benannt:**

a) **`isoWeekNumber` ist nicht exportiert** (`weeklyChallenge.ts:5`) — die eigentliche Rotationsmathematik ist von außen nicht testbar. Der einzige Rotationstest (`weeklyChallenge.test.ts:12-16`) prüft nur, dass *irgendeine* Weekly zurückkommt, und ist damit für 8 von 8 möglichen Ergebnissen grün.

b) **Kein Test, dass unterschiedliche Wochen unterschiedliche Challenges liefern** und dass die Auswahl innerhalb einer Woche stabil ist. Dafür bräuchte `currentWeeklyChallenge()` einen injizierbaren `now`-Parameter (den `computeWeeklyStreak(isoDates, now)` in `streaks.ts:39` vorbildlich hat).

c) **Kein Jahreswechsel-Test** (KW 52/53 → KW 1). Ein Fixture-Test über 2026-12-21 … 2027-01-04 hätte A4-08 sofort gezeigt.

d) **Kein Test für abgelaufene Enrollments** — z. B.: `joinedAt` 9 Wochen alt + ein Moment von gestern ⇒ `completedCount` sagt „complete". Das ist A4-06 in drei Zeilen reproduzierbar und heute grün-durchgewunken.

e) **Kein Test, dass `currentWeeklyChallenge` `spaceTypes` respektiert** (A4-10). Auch kein Test, der Space-Typ überhaupt an die Weekly-Auswahl heranträgt — die Funktion nimmt ja kein Argument.

f) **Kein Test über `ALL_CHALLENGES`**: keine Id-Eindeutigkeit (`ch-*` vs `wk-*`), keine Badge-Integrität für Weeklies, kein `challengeById('wk-1')`-Roundtrip — obwohl der Kommentar `challenges.ts:49` genau diese Auflösbarkeit als Vertrag zusichert.

g) **Persistenzschicht komplett ungetestet**: `joinChallenge` (Idempotenz), `leaveChallenge`, `getEnrollments` haben keinen einzigen Test — anders als die Nachbarn `lib/repositories/notes.test.ts`, `space.test.ts`, `rituals.test.ts`.

h) **Randfälle von `progressFor` ungetestet**: exakt gleicher Zeitstempel (`>=`, `challenges.ts:80`), ungültiges Datum (`new Date('x')` → `NaN` → Filter `false`, still 0 statt Fehler), `joinedAt` in der Zukunft.

i) **`completedCount` mit unbekannter `challengeId`** (`weeklyChallenge.ts:26`, `return false`) — der Guard existiert, wird aber nie geprüft; genau dieser Pfad greift, wenn eine Challenge aus dem Katalog entfernt wird.

j) **`lib/pendingReward.ts` hat überhaupt keine Testdatei.** Weder TTL-Grenze (4:59 vs. 5:01), noch das One-Shot-Verhalten (A4-13), noch dass ein abgelaufener Reward konsumiert statt aufgehoben wird. Ein rein funktionales Modul ohne RN-Import — laut AGENTS.md genau die Kategorie, die getestet gehört.

k) **Kein Test für das Editions-Dedupe** (A4-27) — das Verhalten ist korrekt, aber nur durch die `Set`-Implementierung und einen DB-Constraint geschützt, nicht durch einen Test.

---

## Priorisierung

| Prio | Befund | Kern |
|---|---|---|
| 1 | **A4-06** | Weekly Challenge stirbt nach ~9 Wochen dauerhaft ab |
| 1 | **A4-01** | Challenge-Momente fälschen die Editions-Zählung (§1) |
| 1 | **A4-03** | Abschluss ist komplett feedbacklos (§5) |
| 1 | **A4-31** | „your streak is at risk"-Push per Default an (§3) |
| 2 | A4-16, A4-02, A4-10, A4-04, A4-35, A4-32 | falsche Versprechen, falscher Kontext, ignorierte Schalter |
| 2 | A4-11/A4-12, A4-21, A4-28, A4-40 | Reward-Verlust, stale/widersprüchliche Zahlen, Sprache |
| 3 | A4-08, A4-09, A4-14, A4-18, A4-20, A4-23, A4-25, A4-26, A4-29, A4-33, A4-34, A4-39, A4-41, A4-42 | Rotation, Feel, Konsistenz, Copy |
| 3 | Punkt 10 a–k | Testlücken, die genau diese Befunde durchgelassen haben |

**Nicht verifizierbar in dieser Session** (read-only, kein Gerät): das tatsächliche Toast-Timing (A4-14), das Haptik-Erlebnis und die Animationsqualität von `AnimatedFill` — bewertet wurde ausschließlich der Code.