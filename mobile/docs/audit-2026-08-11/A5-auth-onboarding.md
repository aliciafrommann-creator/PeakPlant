# Audit A5-auth-onboarding — 2026-08-11 (read-only Analyse-Agent)

## A5 — Auth & Onboarding — Befundbericht (read-only, nichts geändert)

Geprüft: `app/(auth)/*` (alle 6 Screens + Layout), `app/index.tsx`, `app/_layout.tsx`, `app/account.tsx`, `app/c/[id].tsx`, `app/i/[id].tsx`, `app/space/new.tsx`, `lib/supabase/{client,auth}.ts`, `lib/{session,mock-auth,store,storage,invite,links,shareText,qr,pendingDestination,config}.ts`, `lib/repositories/{index,local,supabase}.ts`, `lib/hooks/useLanguage.ts`, `app.json`, `eas.json`, `package.json`, `.env.example`, `AGENTS.md`, `docs/*`.

---

## 1. Flow-Durchlauf Schritt für Schritt

**Tatsächliche Kette im Code:** `welcome` → (push) `language` → (push) `intro` → (**replace**) `onboarding` → (push) `invite` → `(tabs)/home`. `sign-in` hängt **nicht** in dieser Kette.

**A5-1.1 — `sign-in` ist kein Glied der Flow-Kette**
`app/(auth)/intro.tsx:67` — `finish()` → `router.replace('/(auth)/onboarding')`. Es gibt im gesamten `(auth)`-Stack keinen einzigen Navigationspfad nach `sign-in`; erreichbar nur über `app/index.tsx:57/65` (Gate) und `app/(auth)/invite.tsx:54` (Session-Verlust).
Verstoß: `AGENTS.md:69` dokumentiert verbindlich „`intro` (60–90s explainer) → `sign-in` (email OTP) → `onboarding`" — Manifest §8 (dokumentierter Kontext muss stimmen) und §1 (Doku behauptet, was der Code nicht hält).
Fix: Entweder Doku auf die reale Reihenfolge (`sign-in` als Vor-Gate über `index.tsx`) korrigieren, oder `intro.finish()` auf `/(auth)/sign-in` legen und `sign-in` nach Erfolg auf `/(auth)/onboarding` statt `/` schicken. Eine Variante wählen, beide Stellen synchron halten.

**A5-1.2 — „no account needed to explore" ist im Backend-Modus falsch**
`app/(auth)/welcome.tsx:39-41` verspricht Erkunden ohne Konto; `app/index.tsx:55-58` schickt aber jeden ohne Session direkt auf `sign-in` — `welcome` wird im Backend-Modus **erst nach** dem Login erreicht.
Verstoß: Manifest §1 (keine Behauptung, die der Code nicht hält).
Fix: Copy zu „ein Code per E-Mail genügt — kein Passwort" ändern, oder einen echten Gast-Pfad bauen (Local-Repos bis zum ersten Space).

**A5-1.3 — Kein Zurück in der gesamten Auth-Strecke**
Kein `BackButton` in `welcome.tsx`, `language.tsx`, `intro.tsx`, `sign-in.tsx`, `onboarding.tsx`; nur `invite.tsx:181` hat ein „back" (nur in der Join-Phase). `app/(auth)/_layout.tsx:5` setzt `animation:'fade'` ohne Gesten-/Header-Alternative. Android-Hardware-Back funktioniert, iOS hat keine sichtbare Affordanz.
Verstoß: Manifest §5 (Screen-Zustände eindeutig, ruhige Sekundäraktionen).
Fix: `BackButton` als ruhige Sekundäraktion in `language`, `intro`, `onboarding` ergänzen; in `sign-in` bewusst weglassen und stattdessen begründen.

**A5-1.4 — Sprachwahl ist eine Einbahnstraße**
`setLanguage` wird ausschließlich in `app/(auth)/language.tsx:23/26/49` aufgerufen (grep über `app/`: keine weitere Fundstelle). Weder `settings/preferences.tsx` noch `customize.tsx` noch `profile.tsx` bieten einen Wechsel. Wer einmal falsch tippt, hängt dauerhaft in der falschen Sprache — im lokalen Modus nur per Sign-out/`reset()` lösbar, im Backend-Modus **gar nicht** (nach `reset()` führt `index.tsx:63` bei vorhandenem Space direkt nach Home, `language` wird nie wieder gerendert).
Verstoß: Zielbild („kann man zurückgehen / kommt man weiter?") + Manifest §3 (der Mensch entscheidet).
Fix: Sprachumschalter in `app/settings/preferences.tsx` ergänzen (dieselbe Options-Liste wie `language.tsx`, `setLanguage` aus dem Store).

**A5-1.5 — Intro läuft im Backend-Modus bei jedem Kaltstart erneut**
`app/(auth)/intro.tsx:21` sagt „shown once", es wird aber kein „intro gesehen"-Flag geschrieben. Im Backend-Modus entscheidet `app/index.tsx:63` allein über `spaces.length`; wer sich angemeldet hat und vor der Space-Erstellung abbricht, sieht bei jedem Start wieder `welcome` → `language` → `intro`.
Verstoß: Manifest §3 (nicht drängen/wiederholen) und §1 (Kommentar behauptet Verhalten, das nicht existiert).
Fix: `introSeenAt` im Store persistieren, `index.tsx` bei vorhandener Session + gesehenem Intro direkt nach `/(auth)/invite` routen.

**A5-1.6 — Zwei Buttons, ein Ergebnis (Onboarding)**
`app/(auth)/onboarding.tsx:78-94` — „CONTINUE" und „skip for now" rufen beide `goNext()` (Zeile 30-33) und speichern identisch `setGoals(selectedGoals)`. „Skip" verwirft nichts und tut nichts anderes.
Verstoß: Manifest §5 (genau eine klare Primäraktion, keine doppelten Ziele).
Fix: „skip for now" auf `setGoals([])` + `router.push('/(auth)/invite')` legen, oder den Skip-Link ganz streichen, wenn Auswahl ohnehin optional ist.

**A5-1.7 — Echte Sackgasse: Ladefehler wird als „nicht angemeldet" interpretiert**
`app/index.tsx:64-66` — jeder Fehler aus `spaceRepository.getAllForUser` (`lib/repositories/supabase.ts:197` wirft bei jedem Supabase-Error, inkl. Netzwerk/RLS) landet in `catch` → `setRoute('/(auth)/sign-in')`. Ein korrekt angemeldeter Nutzer wird also bei einem transienten Fehler auf den Login geworfen; nach erfolgreichem OTP führt `sign-in.tsx:69` (`router.replace('/')`) sofort in denselben Fehler zurück → Login-Schleife ohne Erklärung.
Verstoß: Manifest §1 (ehrliche Zustandsmeldung) + Zielbild (Zustand, aus dem man nicht weiterkommt).
Fix: Session-Fehler und Datenfehler trennen: nur `user === null` → `sign-in`; bei Query-Fehler einen Retry-Screen („wir konnten euren Space gerade nicht laden — erneut versuchen") zeigen und die Session behalten.

**A5-1.8 — Fehlertext verspricht einen Button, den es nicht gibt**
`app/(auth)/invite.tsx:77` — „couldn't set up your space. tap retry to try again." / „Tippe auf Wiederholen." Es gibt keinen „Retry"-Button; die einzige Aktion heißt weiterhin „START A SPACE" (Zeile 220).
Verstoß: Manifest §1/§5.
Fix: Entweder Copy auf „tippe erneut auf SPACE STARTEN" ändern oder den Button im Fehlerfall auf „ERNEUT VERSUCHEN" umbenennen.

---

## 2. OTP-Eingabe — jeder Fehlerweg einzeln

Basis: `app/(auth)/sign-in.tsx:31-74`, `lib/supabase/auth.ts:19-34`.

**A5-2.1 — Falscher Code:** `sign-in.tsx:71` zeigt `e.message` roh. Supabase liefert hier `"Invalid login credentials"` bzw. `"Token has expired or is invalid"` — englisch, technisch, auch wenn die App auf Deutsch steht (der deutsche Fallback greift nur, wenn `e` kein `Error` ist, also praktisch nie). Handlung ist möglich (Feld bleibt befüllt), aber die Meldung sagt nicht, was zu tun ist.
Verstoß: Manifest §1 (ehrliche, verständliche Meldung) + §5.
Fix: Supabase-Fehler in `lib/supabase/auth.ts` auf einen eigenen `AuthProblem`-Typ mappen (`invalid_code`, `expired`, `rate_limited`, `offline`, `unknown`) und im Screen je Fall zweisprachige Copy + passende Handlung anbieten.

**A5-2.2 — Abgelaufener Code:** identischer Pfad, identische rohe Meldung — der Nutzer erfährt nicht, dass der Code schlicht zu alt ist und ein neuer angefordert werden muss. Fix: Fall `expired` → „dieser Code ist abgelaufen" + Fokus auf „Code erneut senden".

**A5-2.3 — Rate-Limit (Supabase):** `resendCode` (`sign-in.tsx:49-60`) hat **keinen Cooldown, keinen Countdown, keine Sperre**; der Link ist nur während `busy` gedimmt. Zwei schnelle Taps ⇒ `"For security purposes, you can only request this after 46 seconds"` roh in Englisch; nach ~4 Mails pro Stunde ⇒ `"Email rate limit exceeded"` — und der Nutzer sitzt ohne Erklärung fest.
Verstoß: Manifest §1 + §5.
Fix: 60-Sekunden-Countdown im Label („erneut senden in 0:47"), Button in der Zeit deaktiviert; `rate_limited` mit ehrlicher Copy („zu viele Anfragen — bitte in X Minuten erneut") abfangen.

**A5-2.4 — Tippfehler-Korrektur:** funktioniert grundsätzlich (`onChangeText` filtert `\D`, Feld bleibt nach Fehler stehen, `sign-in.tsx:126` erlaubt Rücksprung zur E-Mail). Zwei Mängel: der falsche Code wird nicht geleert/markiert, und der Fehler bleibt beim Weitertippen stehen (kein `setError(null)` in `onChangeText` — anders als `invite.tsx:149`, wo es korrekt gemacht wird). Zusätzlich fehlt `accessibilityLiveRegion` am Fehlertext (`sign-in.tsx:143`), das `invite.tsx:158` hat → Screenreader liest den Fehler nie vor.
Fix: `onChangeText` um `if (error) setError(null)` erweitern; `accessibilityLiveRegion="polite"` ergänzen.

**A5-2.5 — Erneut senden:** kein Erfolgsfeedback. `resendCode` setzt nur `busy` und wieder zurück; kein Toast, keine Haptik, keine Textänderung. Der Nutzer tippt und sieht nichts — der klassische „ist es angekommen?"-Moment, der zu Doppelklicks und damit direkt in A5-2.3 führt.
Verstoß: Manifest §5 („Nach jeder Primäraktion gibt es Feedback") und §6 (Haptik/Toast-Primitive existieren, werden hier nicht genutzt).
Fix: `Toast` („neuer Code unterwegs") + `confirmSuccess()` aus `lib/haptics.ts`.

**A5-2.6 — Toter Tap bei leerem Code:** `sign-in.tsx:63` — `if (!code || busy) return;`, der Button (Zeile 146-150) ist aber nur bei `busy` deaktiviert. Tippen auf „CONTINUE" ohne Code passiert nichts, ohne jede Rückmeldung. Fix: `disabled={busy || !code}` + gedimmter Stil (Muster existiert in `invite.tsx:126` als `canJoin`).

**A5-2.7 — Platzhalter widerspricht der Code-Länge:** `sign-in.tsx:116` zeigt `"12345678"` (8 Stellen); Supabase liefert per Default einen 6-stelligen `{{ .Token }}`. Kein `maxLength`. Verstoß: Manifest §1 (kleine, aber echte Falschangabe). Fix: Platzhalter `"123456"`, `maxLength={6}`, optional Auto-Submit bei voller Länge.

**A5-2.8 — Profil-Fehler wird stumm geschluckt:** `sign-in.tsx:68` — `await ensureProfile(...).catch(() => undefined)`. Schlägt der `profiles`-Upsert fehl (RLS, offline), merkt niemand etwas; der Name bleibt still der E-Mail-Präfix. Fix: Fehler nicht verschlucken, sondern nach dem Login einmalig nachziehen (Retry beim nächsten Start) oder loggen.

---

## 3. Offline beim Sign-in

**A5-3.1 — Rohe Netzwerkfehlermeldung.** Es gibt im gesamten Repo **keine** Offline-Erkennung (kein `NetInfo`, kein `isConnected`; grep über `lib/`, `app/`, `components/` liefert nur Kommentare). Offline zeigt `sign-in.tsx:43` das durchgereichte `"Network request failed"` (bzw. `AuthRetryableFetchError`) — englisch, technisch, ohne Handlungsangebot. Zusätzlich retryt `supabase-js` intern mit Backoff, d. h. der Spinner dreht mehrere Sekunden ohne Abbruchmöglichkeit.
Verstoß: Manifest §1 + §5.
Fix: Fehlerklasse auf `offline` mappen und ehrlich texten („keine Verbindung — der Code kann erst gesendet werden, wenn ihr wieder online seid"), Button in „ERNEUT VERSUCHEN" umschalten.

**A5-3.2 — Schwerwiegend: Offline-Kaltstart sperrt bereits angemeldete Nutzer komplett aus.**
`lib/supabase/auth.ts:39` nutzt `supabase.auth.getUser()` — ein **Netzwerk**-Call. Offline liefert er `user: null` (ohne zu werfen) → `lib/session.ts:16` gibt `null` → `app/index.tsx:56-58` routet auf `sign-in` → dort kann offline kein Code angefordert werden. Ergebnis: Ein Nutzer mit gültiger, persistierter Session steht offline vor einem Login, in den er nicht hineinkommt — bei einer App, deren Architektur „local-first" heißt.
Verstoß: Manifest §1 (die App verhält sich nicht wie versprochen) + Zielbild „Session-Persistenz übersteht Neustart".
Fix: Zum Gaten `supabase.auth.getSession()` (rein lokal, kein Netz) verwenden und `getUser()` nur dort, wo eine serverseitige Verifikation wirklich nötig ist; Profilnamen aus dem Session-Objekt/Cache bedienen.

---

## 4. E-Mail-Normalisierung

**Gesund:** doppelt abgesichert — `sign-in.tsx:40` und `:54` senden `email.trim().toLowerCase()`, und `lib/supabase/auth.ts:21/29` normalisieren nochmal serverseitig-nah. `verifyEmailCode` bekommt zwar den Rohwert (`sign-in.tsx:67`), normalisiert aber selbst (`auth.ts:29-30`), inkl. `token.trim()`. `autoCapitalize="none"` + `keyboardType="email-address"` (`sign-in.tsx:99-100`) sind gesetzt.

**A5-4.1 — Zwei Rest-Stellen mit Rohwert:**
- `sign-in.tsx:68` — `ensureProfile(email.split('@')[0])` nutzt den **untrimmten** State; ein eingefügtes `" Alicia@…"` erzeugt den Profilnamen `" Alicia"` (führendes Leerzeichen, Großschreibung), der überall im Space angezeigt wird.
- `sign-in.tsx:110-111` — Anzeige `email.toLowerCase()` ohne `trim()`: die Bestätigung zeigt eine andere Adresse als die tatsächlich verschickte.
Verstoß: Manifest §1 (angezeigter Wert ≠ verwendeter Wert).
Fix: Einmal oben normalisieren (`const normalized = email.trim().toLowerCase()`) und ausschließlich damit arbeiten.

---

## 5. Deep Links

**A5-5.1 — Zwei deklarierte Link-Präfixe haben keine Route.**
`app.json:42-45` verifiziert `/c/`, `/i/`, `/t/`, `/places/` (Android `autoVerify`). Vorhanden sind nur `app/c/[id].tsx` und `app/i/[id].tsx`. Für `/t/` (Aktivierungstoken, Format dokumentiert in `lib/qr.ts:22-23`) und `/places/` (aktiv erzeugt von `lib/links.ts:29 placeLink()`) gibt es **keine** Route — und es existiert **kein** `+not-found.tsx` (find über `app/`: keine `+`-Datei). Der Nutzer, der eine Sammelkarte scannt oder einen geteilten Ort antippt, landet auf dem Expo-Router-Standardschirm „Unmatched Route / Page could not be found" — englisch, technisch, ohne Weg zurück in die App.
Verstoß: Manifest §1 (App verspricht per Link-Deklaration etwas, das der Code nicht hält) + §5.
Fix: `app/t/[token].tsx` (an `parseActivationToken`/`resolveScan` übergeben) und `app/places/[id].tsx` anlegen; zusätzlich ein designtes `app/+not-found.tsx` mit PeakPlant-Copy und „zurück zu eurem Space".

**A5-5.2 — Kaltstart über Link umgeht das Gate; die Resume-Mechanik ist faktisch tot.**
`app/index.tsx:37-47` fängt die Initial-URL und legt sie via `setPendingCard` ab, `resumeHome()` (`:25-28`) holt sie wieder. Das setzt voraus, dass `index` beim Kaltstart gemountet wird — bei expo-router wird aber direkt die verlinkte Route gerendert (`app/c/[id]` → `Redirect` auf `/card/<id>`); es gibt kein `unstable_settings.initialRouteName` (grep: keine Fundstelle), das `index` vorschalten würde. Folge: `setPendingCard` läuft nie, `consumePendingCard` liefert nie etwas, und ein frisch installierter, nicht angemeldeter Nutzer landet direkt im Kartenscreen — vorbei an Sign-in, Sprache, Intro und Space-Setup. Erst beim Tippen auf „PRESERVE THIS MOMENT" (`app/card/[id].tsx:79`) trifft er auf die fehlende Session.
Verstoß: Manifest §1 (der Kommentar in `pendingDestination.ts:1-11` beschreibt ein Verhalten, das so nicht eintritt) + Zielbild („was passiert bei kaltem Start über Link").
Fix: Das Gate in ein Root-Guard verschieben (Auth-Check im `app/_layout.tsx` bzw. ein `useProtectedRoute`-Hook, der bei fehlender Session auf `sign-in` umleitet und die Ziel-URL in `pendingDestination` legt) statt in `app/index.tsx`.

**A5-5.3 — Laufende App:** identisches Bild ohne Gate — expo-router navigiert direkt zur Route. Immerhin funktioniert der Kartenscreen offline/ohne Session, weil er aus `SEED_CARDS` liest (`app/card/[id].tsx:40`); der Bruch kommt erst beim Speichern. Fix wie A5-5.2.

**A5-5.4 — Invite hat gar keinen Deep Link, wird aber als Link beworben.**
`app/(auth)/invite.tsx:284` — `accessibilityLabel: 'Share invite link' / 'Einladungslink teilen'`, Button „SHARE INVITE". Geteilt wird jedoch reiner Text mit Code (`lib/shareText.ts:22-33`), kein Link; `lib/links.ts` kennt keinen Invite-Link, und `app.json` deklariert keine Invite-Route.
Verstoß: Manifest §1 (Screenreader-Nutzer bekommen ein Versprechen, das nicht eingelöst wird).
Fix: Entweder Label auf „Einladung teilen" korrigieren, oder einen echten `/join/<code>`-Link + Route bauen (dann ist auch die Privacy-Zusage in `links.ts:9-12` neu zu bewerten, weil der Code ein Join-Secret ist).

**A5-5.5 — iOS-Associated-Domain ist domainweit.**
`app.json:25` — `applinks:peak-plant.com` ohne Pfadeinschränkung. Die tatsächliche Einschränkung liegt allein in der serverseitigen `apple-app-site-association` (Operator-Schritt, korrekt in `AGENTS.md` dokumentiert). Risiko: Enthält die AASA `"/*"`, springt auch `SHOP_URL` (`lib/config.ts:10` = `https://peak-plant.com/`) aus `components/edition/ShopLink.tsx` in die App zurück statt in den Shop.
Verstoß: Manifest §8 (Abwägung, die nirgends steht, gilt als nicht getroffen).
Fix: In `AGENTS.md`/`docs/PLATFORM.md` die AASA-`paths`-Liste verbindlich festhalten (`/c/*`, `/i/*`, `/t/*`, `/places/*`, explizit **NOT** `/`).

---

## 6. Session-Persistenz & abgelaufener Refresh-Token

**Gesund:** `lib/supabase/client.ts:51-60` setzt `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: false` und `storage: AsyncStorage` — die Session überlebt einen App-Neustart. Der SecureStore-Adapter ist ausführlich und korrekt (inkl. Chunking wegen 2-KB-Limit) in `client.ts:21-50` dokumentiert; `expo-secure-store` ist tatsächlich nicht in `package.json` — Doku und Code stimmen also überein (Manifest §8 erfüllt). Lokaler Modus braucht keine Session (`lib/session.ts:18`) und übersteht Neustarts trivial.

**A5-6.1 — Offline-Neustart bricht die Persistenz faktisch:** siehe A5-3.2. Die Session *liegt* da, wird aber wegen des Netz-Calls nicht *gesehen*.

**A5-6.2 — Kein `onAuthStateChange`, kein AppState-gesteuerter Auto-Refresh.**
Grep über das Repo: keine einzige Fundstelle für `onAuthStateChange`, `startAutoRefresh`, `stopAutoRefresh`, `refreshSession`. Supabase empfiehlt für React Native ausdrücklich, den Auto-Refresh-Timer an `AppState` zu koppeln — der Hook dafür existiert sogar schon (`app/_layout.tsx:39-44` hört bereits auf `AppState` für die Biometrie-Sperre). Folge: Der Refresh läuft im Hintergrund unzuverlässig; ein abgelaufener Refresh-Token wird in der **laufenden** App nirgends bemerkt — die Repos werfen dann still, und die Screens zeigen ihre generischen „konnte nicht geladen werden"-Texte, ohne dass jemand sagt „du bist abgemeldet".
Verstoß: Manifest §1 (ehrlicher Zustand) + Zielbild („stiller Logout mit Datenverlust-Gefühl").
Fix: In `app/_layout.tsx` im bestehenden `AppState`-Listener `supabase?.auth.startAutoRefresh()` / `stopAutoRefresh()` ergänzen und einen `onAuthStateChange`-Listener registrieren, der bei `SIGNED_OUT`/`TOKEN_REFRESHED === null` einmalig auf `sign-in` leitet **mit** einer Meldung „deine Sitzung ist abgelaufen — melde dich kurz neu an, deine Momente bleiben in eurem Space".

**A5-6.3 — Abgelaufener Refresh-Token beim Kaltstart:** Weg ist sauber (→ `sign-in`), aber kommentarlos. Kein Hinweis, dass nichts verloren ist. Genau das erzeugt das Datenverlust-Gefühl.
Fix: Query-Param/Store-Flag `sessionExpired` setzen und in `sign-in.tsx` als ruhige Zeile über dem Eingabefeld zeigen.

---

## 7. Sign-out

**Gesund:** vorhanden und funktional (`app/account.tsx:25-34`): `signOut()` (nur wenn konfiguriert) → `store.reset()` → `router.replace('/')`. Der `QueryClient` aus `app/_layout.tsx:18` wird nirgends im Code tatsächlich benutzt (grep: nur die Provider-Zeilen), also gibt es **keinen** React-Query-Cache-Bleed. `deleteAccount` (`lib/supabase/auth.ts:64-68`) hängt an einer `delete_account`-RPC mit vorgeschaltetem Bestätigungsdialog (`account.tsx:36-52`) — sauber.

**A5-7.1 — Sign-out räumt lokale Daten NICHT auf → Daten-Bleed in den nächsten Account.**
`lib/store.ts:116-133` entfernt genau sieben Präferenz-Keys. Auf dem Gerät bleiben liegen: `memories`, `spaces`, `spaceMembers`, `savedDates` (`lib/repositories/local.ts:36-40`), `dateFeedback`, `publicPlaceFeedback`, `publicPlaceSpots` (`:306-308`), `rituals`, `partnerNotes` (`:375-376`), `challengeEnrollments` (`lib/challenges.ts:86`), `redeemedTokens` (`lib/redeemedTokens.ts`) sowie die persistierten Fotos aus `lib/photoStorage.ts`. Entscheidend: **auch im Backend-Modus** sind `feedbackRepository` und `ritualRepository` local-only (`lib/repositories/index.ts:34` und `:44`) — der nächste Account auf demselben Gerät sieht die Rituale und das Date-Feedback des vorigen Menschen.
Verstoß: Manifest §2 (privat für die Mitglieder eines Space) — und `docs/PRIVACY.md`-Zusagen.
Fix: In `store.reset()` (oder besser in einem eigenen `signOutEverywhere()`) `storage.clear()` verwenden — die Funktion existiert bereits ungenutzt in `lib/storage.ts:52-60` und löscht alle `peakplant:`-Keys; zusätzlich `photoStorage`-Verzeichnis leeren und `savedDateCache`/`memoryCache` (`lib/cache.ts:71-72`) `clear()`en.

**A5-7.2 — Fehlgeschlagener Sign-out meldet nichts.**
`account.tsx:31-33` — `catch { setBusy(false); }`. Wirft `signOut()` (z. B. offline), bleibt der Nutzer angemeldet, der Spinner verschwindet und **nichts** erklärt, warum. Anders als beim Löschen (`:60-66`) gibt es keinen Alert.
Verstoß: Manifest §1 + §5.
Fix: `supabase.auth.signOut({ scope: 'local' })` als Fallback (lokale Token immer entfernen) und im Fehlerfall ehrlich melden.

---

## 8. Erststart-Weiche & Splash

**Gesund:** `app/_layout.tsx:14` `preventAutoHideAsync()` mit `.catch()`, `:31` `hideAsync()` bei `hydrated`, `:33-36` 3-Sekunden-Failsafe mit Cleanup — genau wie im Zielbild beschrieben. Die Weiche selbst ist korrekt geschichtet: `index.tsx:73` blockt bis `hydrated`, `:76-78` lokaler Modus über `onboarded`, `:80` Backend-Modus blockt bis `route` gesetzt ist. Ein *falscher* Screen flackert dadurch **nicht** auf — geprüft und gesund.

**A5-8.1 — Der Failsafe kann Splash → nackter Spinner → Screen erzeugen.**
Der 3-s-Timer (`_layout.tsx:34`) ist unbedingt: Er blendet den Splash auch dann aus, wenn `index.tsx:80` im Backend-Modus noch auf die `getAllForUser`-Antwort wartet. Sichtbar wird dann der `Spinner` aus `index.tsx:13-19` — ein nackter `ActivityIndicator`.
Verstoß: Manifest §6 („Laden zeigt Skeletons statt nackter Spinner").
Fix: Statt des nackten Spinners den Splash-Look nachbauen (Logo auf `Colors.background` + `PeakBloom`) — dann ist der Übergang unsichtbar, egal wann der Failsafe greift.

**A5-8.2 — Farbsprung beim Splash-Übergang.**
`app.json:19` Splash-Hintergrund `#1A1A1A` (dunkel) gegen App-Hintergrund `Colors.background` (`#F3F1EC`, warmes Papier, gesetzt in `_layout.tsx:53`). Jeder Kaltstart blitzt von Dunkel auf Hell.
Verstoß: Manifest §6 (Feel ist Funktion).
Fix: Splash-Hintergrund auf `#F3F1EC` ziehen (Asset entsprechend anpassen) oder `androidStatusBar`/Splash-Variante in Warm-Stone bereitstellen.

---

## 9. Intro- & Onboarding-Inhalte gegen die echte App (Manifest §1)

Ich habe alle drei Slides einzeln gegen den Code geprüft:

- **Slide 1** (`intro.tsx:32-33`): „not a feed, not a follower count" — **gesund**. Es gibt keine Follower, Likes oder öffentlichen Profile im Code; `AGENTS.md` verbietet sie ausdrücklich.
- **Slide 2** (`intro.tsx:40-41`): „invite your person and it comes alive" — **stimmt nur im Backend-Modus**. Im unkonfigurierten Modus gibt es keinerlei Mechanismus, über den ein zweiter Mensch beitreten kann (siehe A5-9.1/A5-9.2).
- **Slide 3** (`intro.tsx:48-49`): „pick a card or an idea, do it together, then keep it" — **gesund**; entspricht `scan` → `card/[id]` → `memory/create`.
- **Sprach-Screen** (`language.tsx:37-39`): „the cards are always in english — that's the physical product" — **gesund und ehrlich**; `lib/content/edition01.ts:9` bestätigt „strings default to English today".
- **Dauer 60–90 s:** 3 Slides ohne Timer, plausibel; nicht messbar, aber auch nicht falsch behauptet.

**A5-9.1 — Der im lokalen Modus angezeigte Einladungscode ist vom eigenen Validator ungültig.**
`app/(auth)/invite.tsx:44-45` setzt im unkonfigurierten Modus `space = SEED_SPACES[0]`; dessen `inviteCode` ist `'PEAK-7842'` (`lib/seed.ts:19`). Das Muster in `lib/invite.ts:16` verlangt aber `^PEAK-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$` — vier Ziffern erfüllen das nicht. Der Screen sagt „share this with your partner" (`invite.tsx:251`), und der Partner bekommt beim Eintippen exakt dieses Codes „that code doesn't look right. it looks like PEAK-AB23CD." (`invite.tsx:86`). Die App weist ihren eigenen Code zurück.
Verstoß: Manifest §1 (erfundener, nicht funktionierender Code) und §4/§5 (Lockstep-Regel aus `lib/invite.ts:3-9` gebrochen).
Fix: `SEED_SPACES[*].inviteCode` auf gültige 6-stellige Codes ziehen (z. B. `PEAK-SUN742`→`PEAK-SUNF42`, jedenfalls `INVITE_CODE_PATTERN`-konform) und einen Unit-Test ergänzen, der jeden Seed-Code gegen `isValidInviteCode` prüft.

**A5-9.2 — Lokales `joinByCode` erfindet einen Erfolg.**
`lib/repositories/local.ts:196-206`: Findet sich der Code nicht, wird kurzerhand ein Space namens `'Joined space'` angelegt und der Nutzer als Mitglied eingetragen — die UI meldet also „beigetreten", obwohl niemand verbunden wurde. Erreichbar über `app/space/new.tsx:62` (im `(auth)/invite`-Screen ist die Join-Phase im lokalen Modus nicht erreichbar, weil `phase` dort mit `'created'` startet).
Verstoß: Manifest §1 — das ist ein Fake-Erfolg an der sensibelsten Stelle des Produkts (Paar-Verknüpfung).
Fix: Im lokalen Modus bei unbekanntem Code ehrlich scheitern („dieser Code gehört zu keinem Space auf diesem Gerät — zum echten Verbinden braucht ihr die Online-Version") statt einen Space zu erfinden.

**A5-9.3 — `space/new` prüft den Code nicht.**
`app/space/new.tsx:55-70` ruft `joinByCode` ohne `isValidInviteCode` — inkonsistent zu `invite.tsx:85`, wo korrekt vorvalidiert wird. Ein Tippfehler geht damit erst nach einem Roundtrip als generischer Fehler zurück.
Fix: Dieselbe Vorvalidierung + `normalizeInviteCode` verwenden.

**A5-9.4 — Deutsche Copy ohne Umlaute in der gesamten Auth-Strecke.**
`sign-in.tsx:34` „gultige", `:152` „bestatigen"; `onboarding.tsx:46` „konnt … andern", `:91/:93` „uberspringen"; `invite.tsx:99` „Prufe"; `account.tsx:75` „Schliessen".
Verstoß: `AGENTS.md` (Design-System) — „korrekte Umlaute (ä ö ü ß) — never ASCII transliteration (‚Zuruck', ‚loschen')" — und Manifest §5/§6 (Polish).
Fix: Umlaute setzen; ein Lint-Regel-/Test-Guard über die deutschen Literale wäre die billigste Versicherung.

**A5-9.5 — Auth-Screens nutzen die Interaktions-Primitive nicht.**
Alle sechs Screens verwenden nacktes `TouchableOpacity` statt `PressableScale`; Haptik gibt es nur an einer einzigen Stelle (`intro.tsx:70 acknowledgeSelection`), kein `confirmSuccess()` nach erfolgreichem Login, Space-Erstellen oder Beitreten; kein `Toast`.
Verstoß: `AGENTS.md` („use them, don't reinvent") + Manifest §5 (Feedback nach jeder Primäraktion) und §6.
Fix: `PressableScale` in allen Auth-CTAs; `confirmSuccess()` + `Toast` nach OTP-Erfolg, Space-Erstellung und Join.

---

## 10. mock-auth — kann er produktiv aktiv werden?

**Teilweise gesund:** Der Umschalter ist genau eine Stelle (`lib/session.ts:14-18`, gesteuert von `isSupabaseConfigured`), und `eas.json:16-19` sowie `:23-26` setzen die `EXPO_PUBLIC_SUPABASE_*`-Variablen für **preview** und **production**. In einem regulären EAS-Build ist Mock-Auth also nicht aktiv. `lib/mock-auth.ts:1-5` ist deutlich als Mock gekennzeichnet.

**A5-10.1 — Kein Fail-Closed-Guard: fehlende Env ⇒ stiller Mock-Login in Produktion.**
`lib/session.ts:14-19` hat keinen `__DEV__`-Check und keinen Runtime-Assert. Fällt `EXPO_PUBLIC_SUPABASE_URL`/`_ANON_KEY` in einem Bundle weg — realistischer Pfad: das `development`-Profil in `eas.json:7-10` hat **gar kein** `env`, und `EXPO_PUBLIC_*` wird beim Bundling inlined, ein `eas update`/OTA-Push von einer Maschine ohne `.env` erzeugt genau so ein Bundle, das über `app.json:12-14` (`updates.url`, `runtimeVersion: appVersion`) an echte Installationen ausgeliefert wird — dann meldet die App den Nutzer still als `SEED_USER` an, zeigt fremde Seed-Daten („Alicia & Partner", `lib/seed.ts:18`) und die echten Momente sind scheinbar weg.
Verstoß: Manifest §1 (die App gibt eine erfundene Identität aus) und §2 (fremde Seed-Inhalte statt der eigenen privaten Daten); `AGENTS.md:100` („never a production path") wird nur durch Konfiguration, nicht durch Code garantiert.
Fix: `lib/session.ts` fail-closed machen — `if (!isSupabaseConfigured) { if (!__DEV__) return null; return getMockUser(); }` plus einen ehrlichen Konfigurationsfehler-Screen („diese App-Version ist nicht korrekt konfiguriert"); zusätzlich einen Build-Time-Check (`app.config.ts` oder CI-Step), der einen Release-Build ohne die beiden Variablen abbricht.

**A5-10.2 — Drei Doku-Stellen behaupten etwas Falsches über mock-auth.**
`docs/PRIVACY.md:69` („never imported in app screens"), `docs/ARCHITECTURE.md:27` („never imported in production paths"), `docs/BACKEND.md:14` („it is never imported in app"). Tatsächlich importiert `lib/session.ts:7` es, und `session.ts` wird von Screens genutzt (`app/(auth)/invite.tsx:23`, `app/space/new.tsx:17`, `app/index.tsx:7`).
Verstoß: Manifest §1 (Datenschutz-Doku behauptet eine Isolation, die nicht existiert) + §8.
Fix: Formulierung auf die Wahrheit ziehen: „nur über `lib/session.ts` und ausschließlich, wenn Supabase unkonfiguriert ist" — zusammen mit A5-10.1, damit die Aussage dann auch wirklich stimmt.

---

## Was ich geprüft und für GESUND befunden habe

1. Splash-Handling komplett: `preventAutoHideAsync` + `hideAsync` bei `hydrated` + 3-s-Failsafe mit `clearTimeout`, alle `.catch()` gesetzt (`app/_layout.tsx:14-36`).
2. Erststart-Weiche flackert nicht: kein falscher Screen kurz sichtbar, weil `index.tsx:73/80` bis zur Entscheidung blockt.
3. E-Mail-Normalisierung vor dem Senden — doppelt abgesichert (`sign-in.tsx:40/54`, `auth.ts:21/29-30`), inkl. `token.trim()`.
4. OTP-Eingabefeld ist technisch korrekt vorbereitet: `autoComplete="one-time-code"`, `textContentType="oneTimeCode"`, `keyboardType="number-pad"`, `autoFocus`, Ziffernfilter (`sign-in.tsx:119-123`).
5. „andere E-Mail-Adresse" als sauberer Rückweg aus der Code-Stufe inkl. State-Reset (`sign-in.tsx:126`).
6. Session-Persistenz grundsätzlich korrekt konfiguriert (`persistSession`, `autoRefreshToken`, `detectSessionInUrl: false`) und der SecureStore-Adapter vollständig und ehrlich als „noch nicht aktiv" dokumentiert (`client.ts:21-50`) — deckt sich mit `package.json` (kein `expo-secure-store`). Manifest §8 hier erfüllt.
7. Kein `service_role`-Key im Client; `.env.example` und `eas.json` enthalten ausschließlich den publishable Key, mit klarem Warnhinweis (`.env.example:6`).
8. Kein React-Query-Cache-Bleed über Accounts hinweg (der `QueryClient` wird nirgends verwendet).
9. Konto-Löschung: Bestätigungsdialog mit ehrlicher Konsequenz-Copy und `destructive`-Style, danach `signOut` (`account.tsx:36-67`, `auth.ts:64-68`).
10. Invite-Code-Generator und -Validator sind bewusst im Lockstep mit dem DB-Check-Constraint gehalten und dokumentiert (`lib/invite.ts:3-16`) — die Idee ist richtig, nur die Seed-Daten brechen sie (A5-9.1).
11. `invite.tsx` ist der beste Screen der Strecke: `accessibilityLiveRegion` am Fehler, Fehler-Reset beim Tippen, `ActivityIndicator` in den Buttons, Vorvalidierung, echter „back"-Weg, und der Kommentar `:30-35` erklärt sauber, warum Start/Join eine explizite Entscheidung ist.
12. Der kritische Operator-Schritt (Supabase-Template braucht `{{ .Token }}`) ist dokumentiert — `AGENTS.md` „Operator steps" und `MANIFESTO.md §8` verweisen aufeinander. Genau so soll das laufen.
13. `app/(auth)/_layout.tsx` deklariert alle sechs Screens explizit, `headerShown:false` konsistent.
14. Der Kartenscreen funktioniert ohne Session und ohne Netz (`SEED_CARDS`), inkl. „card not found"-Zustand mit Rückweg (`app/card/[id].tsx:43-54`) — der Deep-Link-Landepunkt selbst ist robust.

---

### Priorisierung (meine Einschätzung)

**Zuerst:** A5-3.2 (Offline sperrt angemeldete Nutzer aus) · A5-7.1 (Daten-Bleed nach Sign-out) · A5-10.1 (Mock-Auth ohne Fail-Closed) · A5-1.7 (Login-Schleife bei Ladefehler) · A5-9.2 (erfundener Join-Erfolg).
**Danach:** A5-2.1/2.3 (rohe englische Auth-Fehler, kein Resend-Cooldown) · A5-5.1/5.2 (fehlende Routen, umgangenes Gate) · A5-9.1 (ungültiger Seed-Code) · A5-1.2 (falsches Welcome-Versprechen).
**Zum Schluss:** A5-1.4 (Sprache nicht änderbar) · A5-9.4/9.5 (Umlaute, Primitive) · A5-8.1/8.2 (Splash-Feel).