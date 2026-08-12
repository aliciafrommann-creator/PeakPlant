# Audit A6-manifest — 2026-08-11 (read-only Analyse-Agent)

Audit abgeschlossen. Ich habe MANIFESTO.md vollständig gelesen und jeden der 10 Checklistenpunkte einzeln geprüft.

---

# A6 — Manifest-Compliance-Audit `/home/user/PeakPlant/mobile`

## 1. §1 Ehrlichkeit — Privacy-/Status-Behauptungen in sichtbarer Copy

Ich habe jede Fundstelle einzeln gegen den Code in **beiden** Modi (local / Supabase) geprüft.

### BEFUND 1.1 — KRITISCH: „nicht verwendet: live weather" ist falsch

`/home/user/PeakPlant/mobile/lib/discovery/recommend.ts:24`
```ts
const ALWAYS_UNUSED = ['live weather', 'your device location'];
```
Diese Liste geht unbedingt in `signalsNotUsed()` (`recommend.ts:143-148`) und wird gerendert in `/home/user/PeakPlant/mobile/app/(tabs)/discover.tsx:668-671` mit dem Präfix `t('not used:', 'nicht verwendet:')` (Zeilen 419, 456).

Gleichzeitig holt `discover.tsx:129-135` beim Tab-Mount aktiv Live-Wetter von Open-Meteo und wendet es in Zeile 168 als Ranking-Constraint an:
```ts
if (!c.weather && liveWeather) c = { ...c, weather: liveWeather };
```
`recommend.ts:88-90` schiebt dann `it suits ${c.weather} weather` in `used`. Die App zeigt dem Nutzer also **gleichzeitig** „wir haben es wegen sonnigem Wetter vorgeschlagen" und „nicht verwendet: live weather".

- **Verletzt:** §1 („Die App behauptet nie etwas, das der Code nicht hält.")
- **Fix:** `ALWAYS_UNUSED` auf `['your device location']` reduzieren und `signalsNotUsed()` `'live weather'` nur pushen, wenn `!c.weather` (d.h. der Fetch fehlgeschlagen ist). Die bestehende Zeile 146 `if (!c.weather) notUsed.push('weather')` deckt das bereits ab — sie doppelt sich aktuell nur mit dem statischen Eintrag.

### BEFUND 1.2 — KRITISCH: „hier ist ALLES, was deine Vorschläge beeinflusst" ist unvollständig

`/home/user/PeakPlant/mobile/app/settings/preferences.tsx:136-139`
> „here is everything that shapes your Discover picks. nothing is inferred behind the scenes — only what you've explicitly told us is used."

Die gerenderte `signals`-Liste (`preferences.tsx:84-93`) enthält **ausschließlich** Onboarding-Goals. Nicht gelistet, aber nachweislich rankingwirksam:
- **Live-Wetter** (`discover.tsx:131`, `recommend.ts:50-51, 88-90`) — kein Nutzer hat das je „explizit mitgeteilt", es ist genau das „behind the scenes inferred", das der Satz ausschließt.
- **Tageszeit**, automatisch aus der Uhr abgeleitet (`discover.tsx:163`, `recommend.ts:145`).

- **Verletzt:** §1 (Absolutbehauptung ohne Deckung im Code)
- **Fix:** Beide Signale als eigene `SignalRow` mit `source: 'automatic'` in die Liste aufnehmen (inkl. ehrlichem Hinweis, dass das Wetter aus einer Region-Default-Koordinate kommt, siehe 2.4), **oder** den Satz auf „hier ist alles, was du uns selbst mitgeteilt hast" abschwächen.

### BEFUND 1.3 — MITTEL: „Bleibt vorerst privat auf diesem Gerät" direkt über dem Public-Share-Toggle

`/home/user/PeakPlant/mobile/app/discover/feedback/[id].tsx:189-192`
```
'optional · what worked, what to bring, how long it really took. private on this device for now.'
'... Bleibt vorerst privat auf diesem Gerät.'
```
Das ist ein **unbedingter** Satz über dem `tip`-Feld. Genau dieses `tip`-Feld wird 100 Zeilen tiefer bei aktivem Toggle wortwörtlich veröffentlicht (`feedback/[id].tsx:114-118` → `public_place_feedback`, RLS `select using (true)` für `anon`).

Zur Fairness: Der private `DateFeedback`-Record ist tatsächlich immer lokal (`lib/repositories/index.ts:34` — `feedbackRepository = localDateFeedbackRepository`, kein Supabase-Adapter, in beiden Modi), und Zeile 227-232 klärt korrekt auf. Aber der Satz in 190/191 gilt unbedingt, während der Text bedingt public wird.

- **Verletzt:** §1 (Copy, die der Code im Toggle-On-Fall nicht hält)
- **Fix:** Zeile 189-192 an `shareAnonymously` koppeln: aus `Bleibt vorerst privat auf diesem Gerät.` wird bei aktivem Toggle `Dieser Tipp wird anonym auf der Karte veröffentlicht.`

### GESUND geprüft (§1) — einzeln belegt

| Fundstelle | Behauptung | Code-Deckung |
|---|---|---|
| `app/editions/[id].tsx:97` | „dieses Tagebuch bleibt privat — nur für euch beide" | ✅ `memories` space-scoped via `app_is_space_member()`; Manifest §1 nennt genau diese Formulierung als korrekte Cloud-Variante |
| `app/card/[id].tsx:89-90` | „bleibt privat in eurem Space — nur ihr beide könnt es sehen" | ✅ identisch |
| `app/account.tsx:86-87` | „Dein Tagebuch ist privat für deinen Space" | ✅ korrekt Space-, nicht Device-Formulierung |
| `app/(tabs)/community.tsx:836-837` | „Aus eurem privaten Feedback auf diesem Gerät" | ✅ `feedbackRepository` ist in **beiden** Modi lokal |
| `app/(tabs)/community.tsx:844-845` | „erscheinen … privat auf diesem Gerät" | ✅ ebenso |
| `app/together/[id].tsx:246-247` | „aus eurem eigenen Feedback – privat auf diesem Gerät" | ✅ ebenso |
| `app/settings/preferences.tsx:265-266` | „nur auf diesem Gerät (lokaler Modus) oder in deinem privaten Space (Backend-Modus)" | ✅ **Vorbildlich** — nennt beide Modi explizit, genau wie §1 es fordert |
| `app/(tabs)/community.tsx:796-798` | „AI hat nur Orte sortiert, die Google geliefert hat; dieser Ort wurde nicht erfunden" | ✅ `lib/ai/aiRecommend.ts` `mergeAiRanking` erzwingt Kandidaten-Pool |
| `app/(tabs)/community.tsx:803-806` | „Das ist kein behaupteter Ort" | ✅ `provenance: 'needs-confirmation'` |
| `app/(tabs)/home.tsx:503`, `app/editions/[id].tsx:123` | „eure Erinnerungen/Momente sind sicher" | ✅ reiner Lesefehler-Pfad, Daten unangetastet |
| `app/settings/preferences.tsx:179-181` | „Chips … gelten nur für diese Sitzung und werden nie gespeichert" | ✅ `discover.tsx:110` `active` ist reines `useState`, keine Persistenz |
| `lib/together.ts:82-160` | **Kein erfundener Partner-Deal** | ✅ **alle** 6 `LOCAL_PLACES` haben `isPartner: false`, kein `perk`, `provenance: 'needs-confirmation'`. Das im Manifest genannte Altproblem ist echt behoben. |

---

## 2. §2 Privatsphäre — vollständige Netzwerk-Inventur des Clients

Alle ausgehenden Aufrufe, ohne Ausnahme:

| # | Datei:Zeile | Ziel | Was verlässt das Gerät | Nutzer-Handlung? |
|---|---|---|---|---|
| 1 | `lib/repositories/supabase.ts:77-147` | Supabase `memories` | Notiz, Foto-Pfad, space_id | ✅ Öffnen/Anlegen |
| 2 | `lib/repositories/supabase.ts:159-185` | `card_activations` | space_id, card_id | ✅ QR-Scan |
| 3 | `lib/repositories/supabase.ts:194-244` | `spaces` / `space_members` | Space-Name, Emoji, Avatar | ✅ Space-Verwaltung |
| 4 | `lib/repositories/supabase.ts:280-355` | `saved_dates` | Idee + Orts-Snapshot | ✅ „FÜR UNS MERKEN" |
| 5 | `lib/repositories/supabase.ts:401-426` | `partner_notes` | Notiztext (space-scoped RLS) | ✅ „SENDEN" |
| 6 | `lib/repositories/supabase.ts:434-458` | `public_place_spots` | **Öffentlich:** Ortsfakten | ✅ nur bei Opt-in-Bewertung |
| 7 | `lib/repositories/supabase.ts:464-481` | `public_place_feedback` | **Öffentlich:** place_id, rating, tip | ✅ nur bei Opt-in (siehe §3) |
| 8 | `lib/supabase/auth.ts:65` | RPC `delete_account` | — | ✅ Konto löschen |
| 9 | `lib/repositories/supabase.ts:217,226` | RPC `create_space` / `redeem_invite` | Name / Code | ✅ |
| 10 | `lib/ai/askGateway.ts:48-59` | Edge Fn `discover` | **nur** `constraints` + `{momentId,title,concept}` — Rohtext explizit nicht (Kommentar Z.51, Contract Z.9) | ✅ „PEAKPLANT FRAGEN" |
| 11 | `lib/discovery/providers/supabasePlaces.ts:52-63` | Edge Fn `discover` | Suchquery + **GPS-Koordinaten** | ✅ „FIND NEAR ME" (`lib/location.ts:48-51` erzwingt Foreground-One-Shot) |
| 12 | `lib/supabase/storage.ts` | Storage Buckets | Fotos (EXIF-gestrippt, member-scoped, signed URLs) | ✅ |
| 13 | `lib/discovery/providers/openMeteo.ts:88` | `api.open-meteo.com` | **lat/lng** | ❌ **automatisch beim Mount** — siehe 2.4 |
| 14 | `app/(tabs)/community.tsx:710` (WebView) | `unpkg.com`, `tile.openstreetmap.org`, `*.basemaps.cartocdn.com` | IP + Kachel-Viewport (≈ Region) | ❌ automatisch beim Tab-Öffnen |
| 15 | `app.json:11-13` | `u.expo.dev` | OTA-Update-Check | ❌ automatisch (Standard-Expo) |

### Analytics/Tracking: GESUND ✅
`/home/user/PeakPlant/mobile/lib/analytics/index.ts:17` exportiert `nullAnalytics` — echter No-Op ohne Netzwerk. `lib/analytics/index.ts:13` verbietet explizit Diary-Text/Fotos/Location im Log. `lib/notifications/index.ts:6` exportiert `nullNotifications`. Kein PostHog/Firebase/Sentry/Amplitude/Segment im gesamten `package.json`. **Kein einziger Tracker.**

### BEFUND 2.4 — NIEDRIG: Ungefragter Third-Party-Call beim Discover-Mount
`app/(tabs)/discover.tsx:129-135` ruft ohne jede Nutzer-Handlung Open-Meteo auf. Entlastend: es werden **keine** Nutzerdaten gesendet, weil `weatherContext.ts:39` ohne `coords` auf die Hardcoded-Konstante `INNSBRUCK` (`openMeteo.ts:21`) zurückfällt. Es entsteht nur ein IP-sichtbarer Request an einen Dritten.
- **Verletzt:** §2 (Randbereich — nichts wird geteilt, aber der Call ist undeklariert) + koppelt an Befund 1.2
- **Fix:** In der Datenschutz-Sektion `preferences.tsx` einen Punkt „Live-Wetter (Open-Meteo, ohne deinen Standort)" ergänzen.

### BEFUND 2.5 — NIEDRIG: Karten-WebView lädt still von drei CDNs
`lib/discovery/placeMap.ts:49,72,101,106`. Positiv: **SRI-Integrity-Hashes sind gesetzt** (`sha256-p4NxAo…`, `sha256-20nQCc…`) und `community.tsx:718-725` whitelistet die Origins strikt. Supply-Chain ist also sauber. Offen ist nur die Transparenz gegenüber dem Nutzer.
- **Fix:** Ein Satz unter der Karte: „Kartenkacheln kommen von OpenStreetMap/CARTO."

### BEFUND 2.6 — MITTEL: Verstecktes Long-Press teilt private Tagebuchtexte
`/home/user/PeakPlant/mobile/app/(tabs)/home.tsx:156`
```tsx
onLongPress={() => void shareMemory(item, card)}
```
`lib/share.ts:28-32` → `lib/shareText.ts:8-14` packt `memory.note` (Tagebuchtext) **plus das Foto** (`resolveLocalPhoto`) ins OS-Share-Sheet. Es gibt keinen Bestätigungsdialog, kein `accessibilityHint` auf `MemoryCard`, keinen visuellen Hinweis — ein versehentlicher Long-Press im Feed öffnet direkt einen Share-Sheet voll privater Paar-Daten.
- **Verletzt:** §2 („Öffentlich wird ausschließlich, was ein Mensch **aktiv** teilt" — ein unbeschriftetes Versehen ist keine aktive Entscheidung) + §5 (nicht kommunizierte Aktion)
- **Fix:** Entweder Long-Press entfernen und nur den expliziten Share-Button in `app/memory/[id].tsx:185` behalten, oder einen `Alert.alert('Diesen Moment teilen?', 'Notiz und Foto verlassen dann PeakPlant.')` vorschalten.

---

## 3. §2 Anonymes Teilen — Bewertungs-Payload, Feld für Feld

Versprechen (§2): *nur Spot + Sterne + Tipp — nie Space, Notiz oder Identität.*

**Payload A** (`lib/repositories/supabase.ts:474-479`, aus `community.tsx:501-505`):

| Feld | Wert | Urteil |
|---|---|---|
| `place_id` | Spot-ID | ✅ Spot |
| `rating` | 1–5 | ✅ Sterne |
| `tip` | `sanitiseTip(tip)` — trim + 280 Zeichen (`lib/privacy/boundaries.ts:44-48`) | ✅ Tipp |
| `id` | `gen_random_uuid()` serverseitig | ✅ |
| `created_at` | `now()` | ✅ |
| — | **kein** `space_id`, **kein** `user_id`/`auth.uid()`-Default, **kein** `memory_id`, **kein** Notizfeld | ✅ |

Gegengeprüft in der Migration `/home/user/PeakPlant/supabase/migrations/0009_public_place_feedback.sql:11-17`: Die Tabelle **hat schlicht keine** Spalte für Identität oder Space. Es gibt also nicht nur keinen Client-Code, der es sendet — das Schema macht es unmöglich. `char_length(tip) <= 280` als zweite Verteidigungslinie.

**Payload B** (`supabase.ts:445-453` `public_place_spots`): `id, name, address, lat, lng, category, maps_url, source_id` — reine Venue-Fakten, Migration `0010:8-18` bestätigt: keine User-/Space-Spalten.

**Trigger-Pfade** — beide sind echte Opt-ins:
- `app/discover/feedback/[id].tsx:110` — `if (shareAnonymously && placeId)`, Default `useState(false)` (Z. 69).
- `app/(tabs)/community.tsx:590` — Alert-Auswahl „Anonym bewerten", Alternative „Erinnerung anlegen" ist gleichrangig.

**Urteil: GESUND ✅.** Das ist der sauberste Teil der Codebase. Einziger Restpunkt ist Befund 1.3 (Copy, nicht Payload).

Ein Hinweis ohne Manifest-Bezug: `insert with check (true)` für `anon` (0009:33-36) hat keinerlei Rate-Limit — ein Skript könnte die öffentliche Karte fluten. Kein §-Verstoß, aber operativ relevant.

---

## 4. §2 Sensible Editionen — App-Switcher-Verdeckung + Biometrie-Gate

### Biometrie-Gate — implementiert an 2 von 4 Eintrittspunkten

| Eintrittspunkt | Gate? |
|---|---|
| `app/(tabs)/editions.tsx:49-52` → `/editions/[id]` | ✅ `authenticate()` |
| `app/(tabs)/home.tsx:84-95` → `/editions/[id]` | ✅ (Kommentar Z.83: „closes the bypass from the feed") |
| `app/c/[id].tsx:10` → `/card/[id]` | ❌ **BYPASS** |
| `app/(tabs)/scan.tsx:95` → `/card/[id]` | ❌ **BYPASS** |

### BEFUND 4.1 — HOCH: Biometrie umgehbar per Universal Link und per Scan
`/home/user/PeakPlant/mobile/app/c/[id].tsx:10`
```tsx
return <Redirect href={`/card/${id}`} />;
```
`app.json:52` registriert `https://peak-plant.com/c/*` als Android-Intent, `app.json:41` als iOS `applinks`. Ein Link `https://peak-plant.com/c/<id>` einer Karte aus `lib/content/edition02.ts` (`sensitive: true`, `lib/seed.ts:95`) öffnet den vollen intimen Kartentext **ohne Face ID**. `app/card/[id].tsx` importiert `useBiometric` gar nicht — nur `usePrivacyOverlay`. Der Scan-Pfad `scan.tsx:95` ist identisch offen.

- **Verletzt:** §2 („Sensible Editionen werden … hinter Biometrie gegatet")
- **Fix:** Das Gate in `app/card/[id].tsx` selbst verankern statt an den Aufrufern — ein `useEffect`, der bei `edition.sensitive` `authenticate()` erzwingt und bei Ablehnung `router.back()` aufruft. Damit sind alle vier Pfade und jeder künftige gedeckt.

### BEFUND 4.2 — HOCH: App-Switcher-Verdeckung greift auf Android faktisch nicht
`/home/user/PeakPlant/mobile/lib/hooks/usePrivacyOverlay.ts:9-11` setzt `obscured` per `AppState`-Listener. Auf iOS feuert `inactive` **vor** dem Switcher-Snapshot — dort funktioniert es. Auf Android gibt es kein `inactive`; `background` kommt erst, **nachdem** das System den Recents-Screenshot gezogen hat. Der einzige belastbare Android-Mechanismus ist `FLAG_SECURE`. `package.json` enthält kein `expo-screen-capture`, `app.json` setzt kein `android:excludeFromRecents`/`FLAG_SECURE`.

Die Aufgabe fragte explizit nach beiden Plattform-Pfaden: **iOS-Pfad gesund, Android-Pfad wirkungslos.**

- **Verletzt:** §2 („werden im App-Switcher/Hintergrund verdeckt") + §7 (unverifiziert als funktionierend geführt)
- **Fix:** `npx expo install expo-screen-capture` und in `app/_layout.tsx` neben `lockBiometricSession()` `ScreenCapture.preventScreenCaptureAsync()` auf `Platform.OS === 'android'` aufrufen, sobald ein sensibler Screen aktiv ist.

### BEFUND 4.3 — MITTEL: Der Haupt-Feed ist gar nicht verdeckt
Verdeckt sind nur `app/editions/[id].tsx:146`, `app/card/[id].tsx:129` (beide `edition.sensitive &&`) und `app/memory/[id].tsx:156` (unbedingt ✅). **Nicht** verdeckt: der Home-Tab, der ab `home.tsx:340-400` Fotos und Notizen aller Momente im Filmstrip und im Feed rendert. App wegwischen, während der Feed offen ist → das Paar-Tagebuch liegt im Switcher.
- **Fix:** Bei aktivierter FLAG_SECURE-Lösung (4.2) global schalten statt pro Screen.

### BEFUND 4.4 — NIEDRIG: Fail-open bei fehlender Enrollment
`lib/hooks/useBiometric.ts:20-23` gibt `true` zurück, wenn kein Passcode/Biometrie eingerichtet ist. Das ist eine bewusste UX-Abwägung — aber sie steht nirgends in `AGENTS.md` (§8: „Eine bewusste Abwägung, die nirgends steht, gilt als nicht getroffen").
- **Fix:** Zwei Zeilen im Security-Abschnitt von `AGENTS.md`. `lockBiometricSession()` bei `background` (`app/_layout.tsx:38-41`) ist korrekt und gesund.

---

## 5. §3 Keine Druck-Mechanik — jede Fundstelle bewertet

### BEFUND 5.1 — HOCH: `streak_at_risk`-Notification, standardmäßig AN
`/home/user/PeakPlant/mobile/lib/notifications/types.ts:22` und `:31`
```ts
| 'streak_at_risk'       // "your streak is at risk"
...
streak_at_risk: true,
```
Das ist wortwörtlich die Completion-Peitsche. `AGENTS.md:92-94` verbietet unter „Prohibited" ausdrücklich „streaks-as-pressure" und „aggressive notifications" — und die Default-Präferenz ist `true`, im Gegensatz zu `partner_activity`/`weekly_recap`, die korrekt `false` sind. Entlastend: `lib/notifications/index.ts:6` liefert aktuell `nullNotifications`, es wird also nichts gesendet. Aber Typ und Default sind die Blaupause für den Tag, an dem jemand den Provider tauscht.
- **Verletzt:** §3 („Keine Streaks als Druck … keine aggressiven Notifications")
- **Fix:** Kategorie ersatzlos aus `NotificationCategory` und `DEFAULT_NOTIFICATION_PREFS` streichen. Wenn ein wöchentlicher Impuls gewollt ist, dann als `weekly_invite` mit Default `false` und einladender statt verlustaversiver Formulierung.

### BEFUND 5.2 — MITTEL: `atRisk` als Konzept + „Strava-style" im Code
`/home/user/PeakPlant/mobile/lib/streaks.ts:4-6`
> „A 'real' streak (Strava-style): consecutive weeks … it puts it `atRisk`"

§3 sagt: der Strava-Sog soll *Mechanik* sein, **nicht** die Logik. `atRisk` ist reine Verlustaversion. Die UI mildert es zwar sehr gut ab (`components/space/StreakBanner.tsx:49`: „a moment this week keeps your rhythm going — **no rush**"), aber die Datenstruktur trägt den Druck weiter und speist genau die Notification aus 5.1.
- **Fix:** `atRisk` in `continuable` o.ä. umbenennen — die eine Woche Karenz (`streaks.ts:6`) ist inhaltlich schon die richtige, warme Lösung; nur die Benennung lädt zum Missbrauch ein.

### Fundstelle für Fundstelle bewertet — alles Übrige ist GESUND ✅

| Fundstelle | Text | Urteil |
|---|---|---|
| `StreakBanner.tsx:23,39` | Label „SHARED RHYTHM" statt „STREAK" | ✅ warme Tatsache |
| `StreakBanner.tsx:41` | „N weeks together" | ✅ neutrale Zählung, kein Ziel |
| `StreakBanner.tsx:24-26` | Inaktiv-Zustand: „share a moment this week to start collecting" | ✅ Einladung, kein „du hast verloren" |
| `StreakBanner.tsx:49` | „no rush" | ✅ explizite Entdruckung |
| `lib/features.ts:28-30` | „ein sanfter Anstoss … **Nie ein Muss**" | ✅ |
| `lib/features.ts:65` | „zeitlich begrenzte, entspannte Herausforderungen" | ✅ finit, kein Ranking |
| `app/challenges/index.tsx:44` | „**no scores, no rush**" | ✅ Vorbild |
| `app/(tabs)/editions.tsx:81-82` | „`${done} von ${item.cardCount} bewahrt`" | ✅ **Wortgleich mit §3** („N von 20 bewahrt") |
| `app/(tabs)/profile.tsx:80` | Kommentar „Archive, not a scoreboard" + `:83` „N Momente festgehalten · N Challenges zusammen geschafft" | ✅ |
| `components/challenge/ProgressBar.tsx:23` | „`${count} of ${goal} moments`", **kein Prozentwert** | ✅ `%` nur intern als `ratio` für `AnimatedFill` |
| `app/(tabs)/home.tsx:301` (`pct`) | Prozent nur als Fill-Ratio, Label = „N / M Karten" | ✅ |
| `app/(tabs)/discover.tsx:566-568` | „N Challenges geschafft ✓" | ✅ |
| `app/(tabs)/home.tsx:329-334` | „euer Sammelzeichen 🌶️ startet mit der ersten geschafften Challenge" | ✅ Sammel-Emoji statt Likes, exakt wie §3 vorsieht |
| `app/card/[id].tsx:95` | „kein druck. macht, was sich richtig anfühlt." | ✅ |
| `app/(tabs)/*` | Suche nach `leaderboard`, `points`, `xp`, `level up`, `relationship score`, `% erledigt` | ✅ **null Treffer** |
| `lib/discovery/recommend.ts:62-65` `Scored.score` | interner Ranking-Score, nie sichtbar | ✅ kein Beziehungs-Score |

**Kein Prozent-Fortschritt, kein Leaderboard, kein Beziehungs-Score, kein Punktesystem in der gesamten App.** Die einzigen zwei §3-Löcher sind 5.1 und 5.2.

---

## 6. §5 Eine Primäraktion — Screen für Screen

### `app/(tabs)/home.tsx` — BEFUND 6.1, MITTEL
Default-Zustand mit Inhalt: Hub-Challenge-Card (`:236`) + „ask peakplant" (`:281`) + „saved plans" (`:289`) + Notes-Row (`:462`) + Editions-Cards (`:427`) + Filmstrip (`:380`) + **Bottom-Bar mit zwei Buttons** (`:531` SCAN CARD gefüllt, `:538` ADD A MOMENT outline).
Die Bottom-Bar ist mit Fill-vs-Outline gerade noch Primär/Sekundär. **Aber im leeren Zustand kippt es:** `home.tsx:517` rendert `EmptyState ctaLabel={t('SCAN YOUR FIRST CARD', …)} onCta={() => router.push('/(tabs)/scan')}` — und die Bottom-Bar Zeile 531 zeigt gleichzeitig `SCAN CARD` → **derselbe Ziel-Screen, zweimal sichtbar**, plus ADD A MOMENT. Genau das im §5-„Warum" beschriebene Muster („Als die Weekly Challenge dreimal aufs selbe Ziel zeigte").
- **Verletzt:** §5 („keine doppelten Ziele")
- **Fix:** Bottom-Bar ausblenden, solange `recentMemories.length === 0` — der EmptyState ist dann die eine Handlung.

### BEFUND 6.2 — NIEDRIG: Zwei Verben für dieselbe Aktion
`home.tsx:540` sagt `ADD A MOMENT` / `MOMENT FESTHALTEN`; `app/card/[id].tsx:83` sagt für die identische Navigation nach `/memory/create` `PRESERVE THIS MOMENT`; der Header dort heißt `PRESERVE MOMENT` (`memory/create.tsx:194`). §5 nennt `PRESERVE THIS MOMENT` als kanonisches Verb. Das englische „ADD A MOMENT" ist die generische Variante (das Deutsche „FESTHALTEN" ist korrekt).
- **Fix:** EN auf `PRESERVE A MOMENT` vereinheitlichen.

### `app/(tabs)/discover.tsx` — BEFUND 6.3, HOCH (schlimmster §5-Screen)
Im Default-Zustand gleichzeitig sichtbar:
1. `:490` Header-Link `SETTINGS`
2. `:308` StreakBanner
3. `:318/:328/:340` Segment-Chips SURPRISE ME / ALL IDEAS / MAP (zwei davon navigieren weg)
4. `:365` Vollbreiter Button `ASK PEAKPLANT FOR SOMETHING SPECIFIC`
5. `:381` Filter-Chip-Reihe
6. `:410-418` RecommendationCard mit **drei** Aktionen: SAVE FOR US, SEE THIS IDEA, WHY THIS
7. `:414` `onViewSaved` → `/discover/saved`
8. `:503` Pill „saved plans" → **wieder** `/discover/saved`
9. `:516` Pill „challenges", `:530` Pill „rituals"
10. `:584` Button `ACCEPT CHALLENGE`

Das sind **mindestens vier gleichgewichtige, konkurrierende Ziele** und ein **doppeltes Ziel** (7 + 8 zeigen beide auf `/discover/saved`). Bemerkenswert: der Kommentar `:502-504` formuliert das Prinzip korrekt („One door each, not three") und wendet es auf ask/library an — übersieht dabei die eigene Doppelung bei „saved plans".
- **Verletzt:** §5 („genau eine klare Primäraktion … keine doppelten Ziele")
- **Fix:** Primäraktion ist die RecommendationCard. Weekly-Challenge-Block und „MORE WAYS IN"-Pills in einen kollabierten Bereich unter dem Fold; Pill „saved plans" (`:513-524`) streichen, da `onViewSaved` in der Card denselben Weg bietet.

### BEFUND 6.4 — Deutsche Copy als englischer Fallback
`app/(tabs)/discover.tsx:352`
```tsx
t('LASST EUCH ÜBERRASCHEN · DATE GENERATOR', 'LASST EUCH ÜBERRASCHEN · DATE GENERATOR')
```
Englische Nutzer sehen deutschen Text. §1 im weiteren Sinne (Zustand ist nicht, was er vorgibt zu sein).
- **Fix:** EN-Argument auf `'LET YOURSELVES BE SURPRISED · DATE GENERATOR'`.

### `app/(tabs)/editions.tsx` — GESUND ✅
Eine Primäraktion (Edition öffnen, `:60`), eine ruhige Sekundäraktion (`:109` SCAN CARD als Outline-Pill im Header), keine Doppelung. Copy `:82` „N von M bewahrt" ist die Manifest-Formulierung. Vorbildlicher Screen.

### `app/(tabs)/community.tsx` — BEFUND 6.5, MITTEL
Der Screen ist mit 1369 Zeilen der größte und trägt gestaffelt `FIND NEAR ME`, Pilotstadt-Buttons, `FIND LIVE MATCHES`, Vibe-Chips, `openDirections`, `planSelectedPlace`, `markSelectedDone`, `createMemoryForSelected`, `openPublicRating`. Positiv: die Aktionen sind an **Zustände** gebunden (`selectedIsPlanned`, `selectedIsDone`, `selectedCanBeShared`, `:625-629`), d.h. pro Zustand sind es meist ein bis zwei. Der Save→Plan→Do→Memory→Rate-Loop ist sauber modelliert und `markSelectedDone` (`:578-596`) stellt die Folgefrage explizit als Wahl zwischen zwei gleichwertigen Wegen. **Kein klarer Verstoß, aber der Screen braucht dringend eine Aufteilung.**

### `app/(tabs)/profile.tsx` — GESUND ✅
Ein Space-Block (`:58`) + eine ruhige Link-Liste (`:99-113`). Kommentar `:33-34` „No vanity metrics — links lead to control, not a public persona" wird eingehalten. Keine konkurrierende CTA.

### `app/(tabs)/scan.tsx` — BEFUND 6.6, MITTEL: Hierarchie invertiert
Die eigentliche Primäraktion (Kamera auf den QR halten) ist ein reiner Textsatz (`:170`). Der lauteste Button des Screens ist `:183-190` `TRY DEMO CARD` mit `styles.demoButton` = `backgroundColor: Colors.text` + weißer Schrift (`:257-258`) — also der einzige gefüllte Dark-Button. Die Demo-Sekundäraktion sieht damit primärer aus als das Scannen.
- **Verletzt:** §5 („ruhige Sekundäraktionen")
- **Fix:** `demoButton` auf Outline umstellen (analog `permissionButton` `:245-253`).

### `app/memory/create.tsx` — GESUND ✅
Genau eine Primäraktion: `:200` `KEEP` / `FESTHALTEN`, korrekt disabled ohne Inhalt (`:198`). Header `PRESERVE MOMENT`. Foto-Area ist Sub-Eingabe, kein konkurrierendes Ziel. Einziger Nitpick: `accessibilityLabel` `:199` sagt generisch „Save moment / Moment speichern" statt des sichtbaren Verbs — Screenreader hören ein anderes Wort als Sehende lesen.

### `app/space/new.tsx` — BEFUND 6.7, NIEDRIG
Zwei vollbreite Buttons: `:141` `CREATE SPACE` (styles.primary) und `:171` `JOIN WITH CODE` (styles.secondary). Der `OR JOIN ONE`-Divider (`:152-156`) macht die Alternative sauber lesbar und die Styles differenzieren — das ist ein legitimes Entweder-Oder, kein doppeltes Ziel. Verben sind PeakPlant-konform. **Akzeptabel**, aber es sind zwei gleich große Endpunkte in einem Screen; ein Segment-Switch „neu / beitreten" oben wäre eindeutiger.

### Generische Verben — §5-Verstöße, einzeln
| Datei:Zeile | Label | Vorschlag |
|---|---|---|
| `app/discover/feedback/[id].tsx:155` | `SAVE` / `SPEICHERN` (Primäraktion des Screens!) | `KEEP THIS RATING` / `BEWERTUNG BEHALTEN` |
| `app/memory/[id].tsx:176` | `SAVE` | `KEEP CHANGES` / `ÄNDERUNG BEHALTEN` |
| `app/space/edit.tsx:311` | `SAVE` | `UPDATE OUR SPACE` / `UNSEREN SPACE AKTUALISIEREN` |
| `app/note/compose.tsx:92` | `SEND` | `SEND TO YOUR PARTNER` / `AN DEINEN PARTNER SENDEN` |
| `app/(auth)/onboarding.tsx:85`, `invite.tsx:304`, `sign-in.tsx:158` | `CONTINUE` | im Auth-Flow tolerierbar |

Positiv-Inventar der verwendeten Verben (§5-konform): `PRESERVE THIS MOMENT`, `SAVE FOR US` / `FÜR UNS MERKEN`, `SAVED FOR US ✓`, `SHARE ANONYMOUS PLACE TIP`, `ACCEPT CHALLENGE`, `KEEP`, `CREATE SPACE`, `JOIN WITH CODE`, `WE DID THIS HERE`, `SEE THIS IDEA`, `WHY THIS`.

---

## 7. §6 Feel-Primitive — jede Abweichung

Die Primitive existieren alle und sind sauber gebaut. Ihre Adoption in `app/` ist die große Lücke.

### BEFUND 7.1 — HOCH: 138 rohe `TouchableOpacity` gegen 15 `PressableScale`
Gezählt über `app/` (ohne `components/ui/`). §6 sagt: „Taps nutzen `PressableScale` (Feder + Dim + Haptik)". `AGENTS.md:82-84`: „use them, don't reinvent". Rohe `TouchableOpacity` liefert exakt „das tote Opacity-Dimmen von gestern", das §6 im „Warum" beim Namen nennt — **ohne Haptik und ohne Feder**.

Vollständige Liste aller Dateien mit `<TouchableOpacity`-Instanzen:

| Datei | Anzahl | Datei | Anzahl |
|---|---|---|---|
| `app/(tabs)/discover.tsx` | 17 | `app/plus.tsx` | 3 |
| `app/(tabs)/community.tsx` | 17 | `app/customize.tsx` | 3 |
| `app/discover/saved.tsx` | 14 | `app/ask/index.tsx` | 3 |
| `app/rituals/index.tsx` | 9 | `app/account.tsx` | 3 |
| `app/space/edit.tsx` | 8 | `app/(auth)/sign-in.tsx` | 3 |
| `app/discover/browse.tsx` | 8 | `app/(auth)/onboarding.tsx` | 3 |
| `app/memory/[id].tsx` | 6 | `app/settings/preferences.tsx` | 2 |
| `app/(auth)/invite.tsx` | 6 | `app/memory/create.tsx` | 2 |
| `app/together/[id].tsx` | 4 | `app/challenges/[id].tsx` | 2 |
| `app/space/new.tsx` | 4 | `app/(tabs)/home.tsx` | 2 |
| `app/discover/feedback/[id].tsx` | 4 | `app/(tabs)/editions.tsx` | 2 |
| `app/(tabs)/scan.tsx` | 4 | `app/(auth)/language.tsx` | 2 |
| | | `app/(auth)/intro.tsx` | 2 |
| | | `app/note/compose.tsx` | 1 |
| | | `app/editions/[id].tsx` | 1 |
| | | `app/card/[id].tsx` | 1 |
| | | `app/(tabs)/profile.tsx` | 1 |
| | | `app/(auth)/welcome.tsx` | 1 |

Nur 7 Dateien nutzen `PressableScale` überhaupt: `together/[id].tsx`, `card/[id].tsx`, `challenges/[id].tsx`, `(tabs)/home.tsx`, `(tabs)/discover.tsx`, `(tabs)/profile.tsx`, `memory/create.tsx`.
- **Fix:** Priorisiert alle Buttons ersetzen, die eine Primär- oder Sekundäraktion auslösen (Header-SAVE, CTAs, Chips); reine Navigations-Rows sind zweitrangig. `PressableScale` akzeptiert `scaleTo` (`profile.tsx:103` `scaleTo={0.99}`) für dezente Flächen.

### BEFUND 7.2 — MITTEL: 18 nackte `ActivityIndicator` statt Skeletons
§6: „Laden zeigt Skeletons statt nackter Spinner." Es gibt nur **drei** Skeleton-Verwendungen (`home.tsx:493` MemoryFeedSkeleton, `discover.tsx:404` IdeaCardSkeleton, `discover/saved.tsx:299` IdeaListSkeleton) gegenüber 18 Spinnern. Als echte Content-Ladezustände (nicht Inline-Button-Spinner) und damit klare Verstöße:

| Datei:Zeile | Kontext |
|---|---|
| `app/index.tsx:16` | App-Start-Gate — Vollbild-Spinner |
| `app/memory/[id].tsx:121` | Moment-Detail lädt |
| `app/rituals/index.tsx:166` | Ritual-Liste lädt |
| `app/(tabs)/community.tsx:742` | Orte-Bereich lädt |
| `app/(auth)/invite.tsx:260` | Invite-Code lädt |

Die übrigen 13 (`ask/index.tsx:198`, `together/[id].tsx:290`, `invite.tsx:170,218`, `sign-in.tsx:155`, `feedback/[id].tsx:152`, `saved.tsx:531`, `plus.tsx:127`, `rituals/index.tsx:278`, `account.tsx:104`, `space/edit.tsx:309`, `community.tsx:642,1065`, `components/ui/Button.tsx:39`) sind Inline-Spinner **in** Buttons — dort ist ein Spinner die richtige Wahl, kein Verstoß.

### BEFUND 7.3 — MITTEL: Animation ohne Reduce-Motion-Prüfung
`/home/user/PeakPlant/mobile/app/card/[id].tsx:33-37`
```tsx
Animated.sequence([
  Animated.timing(bannerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
  Animated.delay(2000),
  Animated.timing(bannerOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
]).start(() => setShowBanner(false));
```
Die Datei importiert `useReducedMotion` nicht. §6: „Motion respektiert **immer** Reduce-Motion."
- **Fix:** `const reduced = useReducedMotion();` und bei `reduced` `bannerOpacity.setValue(1)` + `setTimeout(…, 2000)` statt der Timing-Sequenz.

### GESUND geprüft (§6) ✅
- **`<Image>` roh in `app/` oder `components/`: null Treffer.** Alle 9 Bildstellen nutzen `FadeInImage` (`space/edit.tsx:204`, `home.tsx:178,380`, `memory/[id].tsx:198`, `memory/create.tsx:225`, `SpacePicker.tsx:132`, `MemoryCard.tsx:34`). Vorbildlich.
- **Alle Fortschrittsbalken nutzen `AnimatedFill`:** `home.tsx:437`, `discover.tsx:577`, `ProgressBar.tsx:19`. Kein Sprung-Rendering.
- **Reduce-Motion in allen `components/ui`-Primitiven verdrahtet:** `FadeInImage.tsx:16`, `Skeleton.tsx:23`, `Toast.tsx:21`, `PressableScale.tsx:47`, `PeakBloom.tsx:19`, `AnimatedFill.tsx:22`, `SpacePicker.tsx:61`.
- **`app/(tabs)/scan.tsx:32` prüft `useReducedMotion` korrekt** vor der Pulse-Loop (`:36-46`) — der eine Screen außerhalb `components/ui`, der es richtig macht.
- Genau **eine** rohe `<Pressable>` in der ganzen App (`components/space/SpacePicker.tsx:102`) — und das ist ein transparenter Backdrop-Dismiss ohne visuelles Feedback. Legitim.

---

## 8. §5 Feedback nach jeder Primäraktion — Aktion für Aktion

| Aktion | Datei:Zeile | Haptik | Toast/Sichtbare Konsequenz | Urteil |
|---|---|---|---|---|
| Moment festhalten | `memory/create.tsx:115` | ✅ `confirmSuccess()` | ✅ `setPendingReward('moment')` → `home.tsx:76` Toast „Moment festgehalten ♥" | ✅ **Vorbild** — schließt die Schleife über Screengrenzen |
| Karte scannen | `(tabs)/scan.tsx:85` | ✅ | ✅ `card/[id].tsx:130-136` Banner „✓ KARTE FREIGESCHALTET" + Navigation | ✅ |
| Idee merken | `(tabs)/discover.tsx:246-247` | ✅ | ✅ Toast „in eurem Space gemerkt ♥" + optimistischer Button-Flip (`:235`) + Rollback bei Fehler (`:251-259`) | ✅ **Vorbild** |
| Challenge annehmen (Discover) | `(tabs)/discover.tsx:586` | ✅ | ✅ Card flippt auf Fortschrittsbalken | ✅ |
| Challenge annehmen (Home-Hub) | `(tabs)/home.tsx:59` | ✅ | ✅ Toast über `pendingReward` „challenge done ✦" | ✅ |
| Challenge beitreten/verlassen | `challenges/[id].tsx:33` | ✅ | ✅ Zustandswechsel | ✅ |
| Anonym bewerten (Community) | `(tabs)/community.tsx:515` | ✅ | ✅ Modal schließt, `getSpots`+`getByPlaceIds` neu geladen → eigener Tipp erscheint auf der Karte | ✅ |
| Anonym bewerten (Feedback-Screen) | `discover/feedback/[id].tsx:120` | ✅ | ⚠️ nur Haptik, dann `goToMemory()` — **kein Toast, keine Bestätigung, dass der öffentliche Tipp raus ist** | ⚠️ **Lücke** |
| Ort als erlebt markieren | `(tabs)/community.tsx:576` | ✅ | ✅ Alert mit Folgeoptionen (`:578-596`) | ✅ |
| Plan anlegen | `(tabs)/community.tsx:470` | ✅ | ✅ | ✅ |
| Live-Suche | `(tabs)/community.tsx:366,429` | ✅ | ✅ Ergebnisliste + Cache-Hinweis | ✅ |
| Notiz an Partner senden | `note/compose.tsx:40` | ✅ | ✅ Notes-Row auf Home zeigt sie (`home.tsx:462-500`) | ✅ |
| Space anlegen / beitreten | `space/new.tsx:46,63` | ✅ | ✅ `setActiveSpace` + `router.back()` | ✅ |
| Space bearbeiten | `space/edit.tsx:158` | ✅ | ✅ | ✅ |
| Moment löschen/bearbeiten | `memory/[id].tsx:80,106` | ✅ | ✅ | ✅ |
| Idee planen / absagen / entfernen | `discover/saved.tsx:110,169` | ✅ | ✅ Statuswechsel-Badge (`:328`) | ✅ |
| Idee als erlebt markieren | `together/[id].tsx:121,148,167` | ✅ | ✅ | ✅ |
| Idee aus Bibliothek merken | `discover/browse.tsx:120` | ✅ | ✅ | ✅ |
| **Moment teilen (Long-Press)** | `home.tsx:156` → `lib/share.ts:28` | ❌ | ❌ | ❌ **BEFUND 8.1** |
| **Moment teilen (Detail-Button)** | `memory/[id].tsx:185` | ❌ | — (OS-Sheet ist die Konsequenz) | ⚠️ akzeptabel, Haptik fehlt |
| **Partner einladen (teilen)** | `(auth)/invite.tsx:104-107` | ❌ | — (OS-Sheet) | ⚠️ Haptik fehlt |

### BEFUND 8.1 — MITTEL: Die Teilen-Aktionen sind die einzigen ohne jedes Feedback
Drei von drei Share-Pfaden (`home.tsx:156`, `memory/[id].tsx:185`, `(auth)/invite.tsx:104`) rufen `Share.share()` ohne `confirmSuccess()` und ohne Erfolgsauswertung. `Share.share()` liefert ein `{action}`-Result zurück, das komplett verworfen wird.
- **Verletzt:** §5 („Nach **jeder** Primäraktion gibt es Feedback")
- **Fix:** Result auswerten und bei `action === 'sharedAction'` `confirmSuccess()` + bei Invite einen Toast „Einladung gesendet".

### BEFUND 8.2 — NIEDRIG: Öffentliches Teilen wird nicht quittiert
`app/discover/feedback/[id].tsx:114-128`: der `.catch(() => undefined)` schluckt einen Fehlschlag der öffentlichen Bewertung **stillschweigend** (Z. 118). Der Nutzer glaubt, sein Tipp sei auf der Karte — er ist es womöglich nicht. Der private Pfad hat einen korrekten Alert (`:122-125`), der öffentliche nicht.
- **Fix:** Bei erfolgreichem Public-Share einen Toast „dein anonymer Tipp ist auf der Karte"; bei Fehler ehrlich melden statt schlucken.

---

## 9. Tote UI

### BEFUND 9.1 — NIEDRIG: Ein Pressable ganz ohne Handler
Ich habe alle `TouchableOpacity` / `Pressable` / `PressableScale` / `TouchableHighlight` in `app/` per Parser auf ein fehlendes `onPress` geprüft. **Genau ein Treffer:**

`/home/user/PeakPlant/mobile/app/(tabs)/discover.tsx:318-326`
```tsx
<TouchableOpacity
  style={[styles.toggleChip, styles.toggleChipActive]}
  accessibilityRole="button"
  accessibilityState={{ selected: true }}
>
  <Text …>{t('✨ SURPRISE ME', '✨ ÜBERRASCH MICH')}</Text>
</TouchableOpacity>
```
Kein `onPress`. Fachlich ist das der aktive Zustand des Segment-Switchers, also nicht sinnlos — aber es ist als `accessibilityRole="button"` deklariert, meldet sich Screenreadern als drückbar und tut beim Antippen nichts. Ein Nutzer, der zurück zu „Surprise me" will, drückt ins Leere.
- **Verletzt:** §5 („Polish heißt Mehrdeutigkeit entfernen")
- **Fix:** Auf `accessibilityRole="tab"` mit `accessibilityState={{selected:true}}` umstellen, oder ein `onPress={resetFilters}` geben (die Funktion existiert bereits in `:225-228` und ist genau die passende Semantik).

### GESUND ✅
- Keine leeren `onPress={() => {}}` / `onPress={undefined}` / `onPress={() => null}` in der gesamten Codebase.
- Keine `TODO`/`FIXME`/„not implemented"-Marker in `app/` oder `components/`.
- Die beiden `coming soon`-Treffer (`(tabs)/editions.tsx:71,84`) sind **korrekt** umgesetzt: `disabled={!available}` (`:67`), `accessibilityState={{disabled}}` (`:70`), 55 % Opazität (`:187`) — ehrlich als „noch nicht da" markiert statt tot.
- Die drei Legacy-Tabs `grow.tsx`, `moments.tsx`, `us.tsx` sind saubere `<Redirect>`s mit erklärendem Kommentar (`app/c/[id].tsx` ebenso) — kein toter Code, sondern gepflegte Deep-Link-Kompatibilität.
- Alle Buttons mit `disabled` haben ein sichtbares Disabled-Styling (`saveBtnDisabled`, `primaryDisabled`, `saveDisabled`).

---

## 10. Sicherheit — hartkodierte Keys/Secrets

Vollscan über `mobile/` (`app/`, `components/`, `lib/`, `eas.json`, `app.json`, `.env.example`) nach `sb_secret`, `service_role`, `ANTHROPIC`, `sk-`, `SUPABASE_SERVICE`, `secret`.

### Ergebnis: GESUND ✅ — kein einziges Secret im Client

| Fundstelle | Wert | Urteil |
|---|---|---|
| `eas.json:19,27` | `sb_publishable_yXn6he-Mbcr5JQQoeBa1FQ_8l8WIqql` | ✅ **publishable** — genau der eine erlaubte Key, in `preview` und `production` |
| `eas.json:18,26` | `https://kmlqjmxkcnkfwsbptvuc.supabase.co` | ✅ öffentliche Projekt-URL |
| `.env.example:10-11` | derselbe publishable Key | ✅ |
| `.env.example:6` | „NEVER put the service_role / sb_secret key here." | ✅ dokumentierte Warnung |
| `.env.example:13-14` | „The Anthropic key … is NOT a client var. It lives only as a Supabase Edge Function secret" | ✅ |
| `lib/ai/anthropic.ts:52-53` | „ANTHROPIC_API_KEY lives only in the Edge Function's secrets — never on the client" | ✅ nur Kommentar, kein Wert |
| `lib/discovery/providers/index.ts:8-9` | `GOOGLE_PLACES_API_KEY` / `ANTHROPIC_API_KEY` als „Supabase secret, never public" | ✅ nur Doku |
| `lib/supabase/client.ts:16-17` | liest ausschließlich `EXPO_PUBLIC_*` | ✅ |
| `app.json` | vollständig durchgesehen | ✅ keine Keys, nur `projectId` (öffentlich) |
| `.gitignore:23-25` | `.env`, `.env.local`, plus `*.jks`, `*.p8`, `*.p12`, `*.key`, `*.mobileprovision` | ✅ |
| Restliche `secret`-Treffer | `lib/discovery/curatedMoments.ts:78,160`, `lib/content/edition01.ts:945`, `lib/ai/safety.test.ts:45`, `lib/privacy/boundaries.test.ts:74` | ✅ Prosa („a secret ingredient") und Testdaten |

**Kein `service_role`, kein `sb_secret`, kein `sk-…`, kein `ANTHROPIC_API_KEY`-Wert.** §2 („Der `service_role`-Key … gehört ausschließlich in Server-Secrets, niemals in den Client oder ins Git") ist vollständig eingehalten.

### BEFUND 10.1 — NIEDRIG: Auth-Session unverschlüsselt (bekannt und dokumentiert)
`/home/user/PeakPlant/mobile/lib/supabase/client.ts:54` — `storage: AsyncStorage`. Auf einem gerooteten/gejailbreakten Gerät ist das Refresh-Token im Klartext lesbar. Das ist **kein §-Verstoß**, weil es §8 sauber erfüllt: die Abwägung steht als 30-zeiliger Kommentar mit fertigem `SecureStoreAdapter`-Code in `client.ts:21-50` **und** in `AGENTS.md:113-114` als Vor-Store-Submission-Schritt. Vorbildlich dokumentierte Schuld.
- **Fix:** Vor Store-Einreichung `npx expo install expo-secure-store` und den bereitliegenden Adapter aktivieren.

---

## Querschnitts-Befund: ASCII-Transliteration in deutscher Copy

`AGENTS.md:87-88`: „German copy is natural, cute & easy, with **correct umlauts** (ä ö ü ß) — never ASCII transliteration ('Zuruck', 'loschen')." Verletzt an mindestens 30 Stellen, darunter sichtbare Button-Labels:

- `app/settings/preferences.tsx:191` `ONBOARDING-ZIELE LOSCHEN` → `LÖSCHEN`
- `app/discover/feedback/[id].tsx:140,142` `Uberspringen` / `UBERSPRINGEN` → `Überspringen`
- `app/discover/saved.tsx:471`, `app/space/new.tsx:82` `Schliessen` → `Schließen`
- `app/settings/preferences.tsx:101,138,150` `Vorschlage` → `Vorschläge`; `:121` `Intimitatsmerkmale` → `Intimitätsmerkmale`; `:180` `verlasst` → `verlässt`; `:266` `ausserhalb` → `außerhalb`
- `app/(auth)/invite.tsx:99` `Prufe` → `Prüfe`
- `app/(auth)/onboarding.tsx:46` `konnt es jederzeit andern` → `könnt es jederzeit ändern`
- `app/together/index.tsx:61` `tun konnt` / `draussen` → `könnt` / `draußen`
- `app/editions/[id].tsx:134` `Schliesse` → `Schließe`
- `lib/features.ts:39,48,57,66` (`zuruckkehrt`, `konnt`, `Nahe`, `konnt`)
- 12× `konnte nicht …` in Fehler-Alerts — hier ist die Form zufällig korrekt (Präteritum von „können"), aber im Kontext „X konnte nicht gespeichert werden" gemeint und richtig. Kein Fehler.

Rund die Hälfte der App nutzt korrekte Umlaute (`app/(tabs)/community.tsx`, `home.tsx`, `editions.tsx`, `card/[id].tsx`), die andere Hälfte nicht — die Inkonsistenz fällt Nutzern im selben Flow auf.

---

## Gesamtbild

| # | Dimension | Ergebnis |
|---|---|---|
| 1 | §1 Ehrlichkeit | **2 kritisch** (Wetter-Signal doppelt falsch deklariert), 1 mittel; 12 Claims verifiziert gesund |
| 2 | §2 Netzwerk/Analytics | **Analytics + Notifications sind echte No-Ops** — vorbildlich; 1 mittel (Long-Press-Share), 2 niedrig |
| 3 | §2 Anonymes Teilen | **GESUND** — Schema macht Leaks strukturell unmöglich |
| 4 | §2 Sensible Editionen | **2 hoch** (Deep-Link/Scan umgeht Biometrie; Android-Verdeckung wirkungslos) |
| 5 | §3 Druck-Mechanik | **1 hoch** (`streak_at_risk` default-on), 1 mittel; sonst durchweg warm und §3-treu |
| 6 | §5 Eine Primäraktion | **1 hoch** (Discover), 3 mittel; editions/profile/memory-create sind Vorbilder |
| 7 | §6 Feel-Primitive | **1 hoch** (138 vs. 15 Pressables), 2 mittel; Bilder + Progress 100 % konform |
| 8 | §5 Feedback | **19 von 22 Aktionen vollständig** — stärkste Dimension; nur Share-Pfade ohne Feedback |
| 9 | Tote UI | **1 niedrig** — praktisch sauber |
| 10 | Secrets | **GESUND** — nur der publishable Key, nirgends sonst etwas |

**Die vier Punkte, die ich zuerst angehen würde:** Befund 1.1/1.2 (die App sagt nachweislich die Unwahrheit über Datennutzung — §1 ist das Prinzip, das laut Manifest „nicht zurückzugewinnen" ist), Befund 4.1 (Biometrie per Link umgehbar), Befund 4.2 (Android-Verdeckung), Befund 5.1 (`streak_at_risk` default-on).