# Audit A2-spaces — 2026-08-11 (read-only Analyse-Agent)

Ich habe alle 10 Punkte einzeln durchverfolgt. Hier der Bericht.

---

# A2 — Spaces & Identität: Audit-Bericht (read-only)

Geprüfte Dateien: `app/space/new.tsx`, `app/space/edit.tsx`, `app/(auth)/invite.tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/home.tsx`, `app/(tabs)/discover.tsx`, `app/account.tsx`, `app/plus.tsx`, `app/customize.tsx`, `app/settings/preferences.tsx`, `app/index.tsx`, `components/space/SpacePicker.tsx`, `lib/hooks/useSpaces.ts`, `lib/hooks/useMemories.ts`, `lib/hooks/useWeeklyChallenge.ts`, `lib/repositories/{interfaces,index,local,supabase,spaceCreation}.ts`, `lib/{invite,session,mock-auth,seed,store,types,spaceCustomization,spaceTheme,shareText,challenges,weeklyChallenge}.ts`, `lib/supabase/{client,auth,storage}.ts`, `supabase/migrations/0001–0013` (nur gelesen).

---

## 1. Space anlegen als 'couple' UND als 'friends'

**Pfad `couple` (Onboarding):** `app/(auth)/invite.tsx:67-72` → `spaceRepository.create({type:'couple', …})` → `lib/repositories/supabase.ts:215-221` → `buildCreateSpaceRpcArgs` (`lib/repositories/spaceCreation.ts:14-24`) → RPC `create_space` (`0008_create_space.sql`). Typ wird serverseitig gegen `('couple','friends')` validiert (0008:27-29), Ownership aus `auth.uid()`. **Gesund und sauber.**

**Pfad `friends` (SpacePicker → `/space/new`):** `components/space/SpacePicker.tsx:90-93` → `app/space/new.tsx:33-53` → gleicher Repository-Weg. Beide Typen laufen durch dieselbe RPC/local-Implementierung. **Gesund.**

**Unterscheidet sich `friends` sinnvoll?** Teilweise ja — es ist kein reines Label:
- `lib/together.ts` / `lib/discovery/curatedMoments.ts` / `ideaCatalog.ts` filtern über `spaceTypes`
- `lib/challenges.ts:65-67` `challengesForSpaceType` filtert die Saison-Challenges (ch-4 nur couple, ch-5 nur friends)
- `app/(tabs)/discover.tsx:600-608` eigene Tagline für friends
- `lib/spaceTheme.ts:14-17` friends = 🌻, couple = 🌶️

### BEFUND 1.1 — `spaceTypes` der Weekly Challenges wird nie angewendet
- **Datei:Zeile:** `lib/weeklyChallenge.ts:14-17` (`currentWeeklyChallenge()`), Konsument `lib/hooks/useWeeklyChallenge.ts:11`
- **Problem:** `currentWeeklyChallenge()` nimmt **keinen** `SpaceType` entgegen und rotiert stumpf über `WEEKLY_CHALLENGES[week % length]`. Das Feld `spaceTypes` ist auf jedem Eintrag deklariert (`lib/challenges.ts:52-59`), wird aber nirgends ausgewertet. Konkret: In einer Freunde-Gruppe erscheint in KW-Rotation `wk-7 "one kind word — tell or write each other one real thank-you"` (`spaceTypes: ['couple']`, `challenges.ts:58`) als „THIS WEEK" auf Home. Ebenso ist `wk-8 "one cosy night in, just the two of you"` (`challenges.ts:59`) für `friends` freigegeben, obwohl die Copy explizit zu zweit adressiert.
- **Verstoß:** MANIFESTO §1 (App behauptet etwas, das der Code nicht hält — die Typ-Deklaration verspricht Filterung), §5 (Mehrdeutigkeit: falsche Ansprache im Space).
- **Fix:** `currentWeeklyChallenge(type: SpaceType)` einführen, das zuerst auf `WEEKLY_CHALLENGES.filter(c => c.spaceTypes.includes(type))` reduziert und dann `week % pool.length` bildet; `useWeeklyChallenge(spaceId, spaceType)` durchreichen (Aufrufer: `home.tsx:125-ff`, `discover.tsx:124-125`, `profile.tsx:29`). Zusätzlich `wk-8` auf `spaceTypes: ['couple']` korrigieren.

### BEFUND 1.2 — Sammel-Default widerspricht dem eigenen Space-Theme
- **Datei:Zeile:** `lib/spaceCustomization.ts:4` (`DEFAULT_COLLECTIBLE_EMOJI = '🌶️'`), `app/(tabs)/home.tsx:261,262,312,322,323` (hartcodiertes `?? '🌶️'`), `app/space/edit.tsx:64`
- **Problem:** `lib/spaceTheme.ts:14-17` legt fest, dass Freunde 🌻 sammeln und Paare 🌶️. Der Default ignoriert das: Ein neuer Freunde-Space startet mit dem Paar-Chili, und Home fällt an 5 Stellen hart auf `'🌶️'` zurück. Nur `StreakBanner` nutzt `spaceTheme` überhaupt.
- **Verstoß:** MANIFESTO §5 (jede Komponente hat einen Grund/eine Persönlichkeit — hier zwei widersprechende Wahrheiten im selben Produkt).
- **Fix:** `DEFAULT_COLLECTIBLE_EMOJI` durch `spaceTheme(type).emoji` ersetzen; in `home.tsx` `activeSpace.collectibleEmoji ?? spaceTheme(activeSpace.type).emoji` verwenden; `edit.tsx:64` analog auf den typabhängigen Default setzen.

### BEFUND 1.3 (niedrig) — hartcodierter `spaceType: 'couple'` im Discover-Wetterpfad
- **Datei:Zeile:** `app/(tabs)/discover.tsx:131` — `enrichWithLiveWeather({ spaceType: 'couple' })`
- **Problem:** Der aktive Space-Typ wird ignoriert. Praktisch folgenlos (nur `c.weather` wird ausgelesen, `discover.tsx:132`), aber ein Platzhalter, der beim nächsten Ausbau der Funktion still falsch wird.
- **Verstoß:** MANIFESTO §5/§7 (unehrlicher Zwischenzustand im Code).
- **Fix:** `enrichWithLiveWeather({ spaceType: activeSpace?.type ?? 'couple' })` und den Effekt von `activeSpace?.type` abhängig machen.

**Gesund geprüft:** Der Default-Typ in `space/new.tsx:27` ist `'friends'` (sinnvoll, weil der Couple-Space schon im Onboarding entsteht). Copy/Placeholder unterscheiden sich korrekt (`new.tsx:114-120,131-133`). Der Name-Fallback ist an beiden Enden identisch (`spaceCreation.ts:20`, `local.ts:173`, `0008:45`) — kein Drift.

---

## 2. Einladen: Code-Erzeugung, Teilen, Einlösen, Fehlerfälle

**Erzeugung:** `lib/invite.ts:19-25` — `PEAK-` + 6 Zeichen aus einem eindeutigen Alphabet (~1e9 Kombis), Pattern in `invite.ts:16` gespiegelt zur DB-Prüfung in `0008:31-34`. Getestet in `lib/invite.test.ts:10-35` (500 Runden Round-Trip gegen das DB-Regex). **Vorbildlich gesund.**

**Teilen:** `lib/shareText.ts:22-33` (`composeInviteText`) → OS-Share-Sheet in `invite.tsx:104-111` und `SpacePicker.tsx:81-88`. Immer nutzerinitiiert. **Gesund.**

**Einlösen:** `invite.tsx:83-102` validiert vorab mit `isValidInviteCode`, ruft `spaceRepository.joinByCode` → `supabase.ts:223-229` → RPC `redeem_invite` (`0002_redeem_invite.sql`), SECURITY DEFINER, idempotent per `on conflict do nothing`.

### BEFUND 2.1 — Beitreten scheitert mit falscher Fehlermeldung, wenn die Profilzeile fehlt (Sackgasse)
- **Datei:Zeile:** `app/(auth)/sign-in.tsx:68` (`await ensureProfile(...).catch(() => undefined)`), `supabase/migrations/0002_redeem_invite.sql:26-33`, FK in `0001_init.sql:31`
- **Problem:** `ensureProfile` ist best-effort und schluckt jeden Fehler. `create_space` fängt das ab und legt die Profilzeile notfalls selbst an (`0008:38-40`, explizit kommentiert). `redeem_invite` tut das **nicht** — es inserted direkt in `space_members`, dessen `user_id` per Fremdschlüssel auf `profiles(id)` zeigt (`0001:31`). Fehlt die Profilzeile (Netzabbruch genau nach OTP-Verifikation), schlägt der Join mit einer FK-Verletzung fehl. Der Nutzer sieht `invite.tsx:99`: „Dieser Code hat nicht funktioniert. Prüfe ihn mit deinem Partner" — er prüft also stundenlang einen korrekten Code. Da der Join-Pfad `create_space` nie durchläuft, gibt es **keinen Weg aus dieser Sackgasse** außer Account-Neuanlage.
- **Verstoß:** MANIFESTO §1 (die App behauptet, der Code sei falsch — das ist unwahr), §4 (Annahme über einen Zustand, der „schon da sein müsste").
- **Fix:** Neue Forward-Migration `0014`, die `redeem_invite` um denselben Recovery-Insert wie `0008:38-40` ergänzt (`insert into public.profiles (id, name) values (uid, '') on conflict (id) do nothing;` vor dem `space_members`-Insert). Zusätzlich in `invite.tsx:98-101` den Fehlercode unterscheiden (`invalid invite code` vs. sonstiges) und bei sonstigen Fehlern eine ehrliche Meldung zeigen.

### BEFUND 2.2 — „Abgelaufener Code" existiert nicht: Codes laufen nie ab, sind nie widerrufbar, unbegrenzt oft einlösbar
- **Datei:Zeile:** `supabase/migrations/0002_redeem_invite.sql:21-33`, Tabellendefinition `0001_init.sql:20-26`
- **Problem:** Die Checklisten-Zustände „abgelaufener Code" und „Code zurückziehen" sind im Produkt schlicht nicht vorhanden. `spaces.invite_code` hat kein `expires_at`, keinen Nutzungszähler, keine Rotation. `redeem_invite` prüft nur Existenz. Praktische Folge: Wer den Code je gesehen hat — Screenshot, weitergeleitete WhatsApp-Nachricht, alter Gruppenchat — kann **dauerhaft und jederzeit** in den privaten Space eintreten und liest ab dann alle Memories, Fotos, Partner-Notizen und Rituale. Es gibt in der gesamten App keinen Weg, einen Code zu erneuern.
- **Verstoß:** MANIFESTO §2 („Privatsphäre ist ein Versprechen, kein Default" — ein unwiderruflicher, ewig gültiger Generalschlüssel zu Tagebuch und Fotos ist genau ein Default statt eines Versprechens).
- **Fix:** Forward-Migration `0014`: `alter table public.spaces add column if not exists invite_code_expires_at timestamptz;` plus `redeem_invite`-Prüfung (`if s.invite_code_expires_at is not null and s.invite_code_expires_at < now() then raise exception 'invite expired'`), und eine RPC `rotate_invite_code(space_id)` für Mitglieder. In `space/edit.tsx` eine ruhige Sekundäraktion „neuen Code erzeugen (alter wird ungültig)" ergänzen. Kurzfristig, ohne Migration: in `SpacePicker` beim Teilen-Icon ehrlich kennzeichnen, dass der Code dauerhaft gültig ist.

### BEFUND 2.3 — Kein Mitgliederlimit: ein 'couple'-Space kann beliebig viele Mitglieder aufnehmen
- **Datei:Zeile:** `supabase/migrations/0002_redeem_invite.sql:26-33`, `0001_init.sql:20-36`
- **Problem:** `redeem_invite` kennt keine Obergrenze. Der Typ `'couple'` ist rein dekorativ — mit demselben Code können fünf Personen in den Paar-Space. Die UI verspricht dagegen „nur ihr zwei" (`space/new.tsx:118`) und „just the two of you".
- **Verstoß:** MANIFESTO §1 (Copy behauptet eine Grenze, die der Code nicht durchsetzt).
- **Fix:** In der Forward-Migration in `redeem_invite` vor dem Insert prüfen: `if s.type = 'couple' and (select count(*) from space_members where space_id = s.id) >= 2 and not exists (…caller already member…) then raise exception 'space full'`. Fehlerfall in `invite.tsx`/`space/new.tsx` mit eigener Meldung abbilden.

### BEFUND 2.4 — Falscher Code wird in `space/new.tsx` nicht vorvalidiert (inkonsistent zu `invite.tsx`)
- **Datei:Zeile:** `app/space/new.tsx:55-70` (kein `isValidInviteCode`), Gegenbeispiel `app/(auth)/invite.tsx:85-88`
- **Problem:** Der Onboarding-Screen prüft das Format lokal und gibt die hilfreiche Meldung „Er sieht aus wie PEAK-AB23CD". Der Space-anlegen-Modal schickt jeden Müll an den Server/das lokale Repository und zeigt danach dieselbe generische Meldung. Im lokalen Modus hat das zusätzlich die Folge aus Befund 3.1.
- **Verstoß:** MANIFESTO §5 (zwei Screens, dieselbe Handlung, unterschiedliches Verhalten), §1 (unnötig vage Fehlermeldung).
- **Fix:** In `space/new.tsx:55` vor dem Aufruf `if (!isValidInviteCode(code)) { setError(t('that code doesn’t look right. it looks like PEAK-AB23CD.', …)); setBusy(false); return; }` — identisch zu `invite.tsx:85-88`. `isValidInviteCode` ist bereits exportiert.

### BEFUND 2.5 — Zustand „bereits Mitglied" wird nicht unterschieden
- **Datei:Zeile:** `supabase/migrations/0002_redeem_invite.sql:33` (`on conflict … do nothing`), `app/space/new.tsx:62-65`, `app/(auth)/invite.tsx:94-97`
- **Problem:** Wer den eigenen Code eingibt oder zweimal beitritt, bekommt den vollen Erfolgspfad: `confirmSuccess()`-Haptik, aktiver Space, `router.back()`. Es sieht aus, als sei etwas passiert, obwohl nichts passiert ist.
- **Verstoß:** MANIFESTO §5 (nach jeder Primäraktion gibt es Feedback mit *sichtbarer Konsequenz* — hier gibt es Feedback ohne Konsequenz).
- **Fix:** `redeem_invite` einen zweiten Rückgabewert `joined boolean` geben (via `FOUND` nach dem Insert) oder clientseitig vor dem Aufruf gegen `useSpaces().spaces` prüfen und ruhig melden: „du bist hier schon dabei — wir bringen dich hin."

### BEFUND 2.6 (niedrig) — Teilen-Icon ohne Bestätigung direkt neben dem Wechseln-Ziel
- **Datei:Zeile:** `components/space/SpacePicker.tsx:164-172`
- **Problem:** Das Share-Icon liegt in derselben Zeile wie die Wechsel-Aktion und öffnet ohne Zwischenschritt das OS-Share-Sheet mit dem Beitritts-Geheimnis (`shareText.ts:22-33` enthält den Code im Klartext). Ein Fehltipp genügt, um in Kombination mit Befund 2.2 einen ewigen Zugang zu verschicken.
- **Verstoß:** MANIFESTO §2 und §5 (eine klare Primäraktion pro Fläche; hier stehen „wechseln" und „Zugang verschenken" gleichwertig nebeneinander).
- **Fix:** Share-Icon aus der Zeile nehmen und in den Edit-Screen verlagern, oder einen kurzen Bestätigungsschritt vorschalten („Code teilen? Wer ihn hat, sieht euer Tagebuch.").

---

## 3. Beitreten in BEIDEN Modi — ist die Grenze ehrlich?

**Backend-Modus:** ehrlich. `index.tsx:50-71` entscheidet anhand echter Session + echter Spaces; `invite.tsx:44` startet in `'choice'` mit expliziter Wahl Starten/Beitreten; der Kommentar `invite.tsx:30-35` begründet das korrekt.

### BEFUND 3.1 — Lokaler Modus gaukelt einen erfolgreichen Beitritt vor
- **Datei:Zeile:** `lib/repositories/local.ts:190-221`, speziell `196-206`
- **Problem:** `joinByCode` findet lokal keinen passenden Space und legt dann **stillschweigend einen erfundenen Space namens „Joined space" an** und macht den Nutzer zum Mitglied. Der aufrufende Screen (`space/new.tsx:62-65`) kann das nicht von einem echten Beitritt unterscheiden: `confirmSuccess()`-Haptik, `setActiveSpace`, `router.back()`. Der Nutzer glaubt, er sei jetzt im Space seines Partners — er ist in einer leeren lokalen Attrappe. Nirgends im UI steht, dass ohne Server nichts synchronisiert.
- **Verstoß:** MANIFESTO §1 direkt und wörtlich („Die App behauptet nie etwas, das der Code nicht hält"). Der Kommentar in `local.ts:197` („Mock: no server to validate against") gibt zu, dass es eine Attrappe ist — der Nutzer erfährt es nicht.
- **Fix:** `localSpaceRepository.joinByCode` soll bei unbekanntem Code `throw new Error('unknown invite code')` werfen statt zu erfinden (Zeilen 196-206 ersetzen). Ergänzend in `space/new.tsx` und `invite.tsx` bei `!isSupabaseConfigured` eine ehrliche Zeile rendern: „ohne Konto bleibt dieser Space nur auf diesem Gerät — Beitreten braucht eine Verbindung."

### BEFUND 3.2 — Der im lokalen Modus angezeigte „dein Code" ist ein fester Seed-Code, der nicht einmal das eigene Format erfüllt
- **Datei:Zeile:** `app/(auth)/invite.tsx:28,44-45,240-269`; `lib/seed.ts:19` (`inviteCode: 'PEAK-7842'`); Validator `lib/invite.ts:16`
- **Problem:** Ohne Supabase startet `invite.tsx` direkt in Phase `'created'` mit `FIRST_SPACE = SEED_SPACES[0]` und zeigt groß `PEAK-7842` unter der Überschrift „dein Einladungscode" mit dem Text „Teile diesen Code mit deinem Partner, damit ihr gemeinsam euer Tagebuch aufbaut" (`invite.tsx:250-253`). Zwei Probleme in einem: (a) es ist ein für **alle Installationen identischer** Seed-Wert, kein persönlicher Code; (b) `PEAK-7842` hat 4 statt 6 Zeichen und verletzt `INVITE_CODE_PATTERN` — der Partner kann ihn auf dem Join-Screen gar nicht absenden, weil `isValidInviteCode` ihn ablehnt (`invite.tsx:85-88,126`). Der Screen fordert also aktiv zu einer Handlung auf, die garantiert scheitert.
- **Verstoß:** MANIFESTO §1 (erfundener Wert als echter Nutzerwert präsentiert), §5 (Primäraktion mit Sackgasse).
- **Fix:** Im lokalen Modus keinen Code anzeigen. Entweder `invite.tsx:44-45` so ändern, dass auch unkonfiguriert Phase `'choice'` gilt und `create` einen echten Space über `localSpaceRepository.create` anlegt (dort erzeugt `local.ts:174` einen formatgültigen Code), oder den Code-Block durch eine ehrliche Notiz ersetzen. Unabhängig davon: `lib/seed.ts:19,26` auf formatgültige Codes bringen (z. B. `PEAK-K7R4M2`), damit Seed und Validator nicht auseinanderlaufen.

---

## 4. Emoji / Sammel-Emoji / Avatar — jede Operation, beide Modi, Fehlerfall

**Backend-Modus:** `space/edit.tsx:130-170` → `supabaseSpaceRepository.update` (`supabase.ts:231-248`) schreibt `emoji`, `collectible_emoji`, `avatar_path`, `name` in einem `UPDATE`. Avatar: `uploadSpaceAvatar` (`lib/supabase/storage.ts:61-75`) re-encodiert (EXIF weg), skaliert auf 512², lädt in `space-avatars` (`0012:24-26`, `public=false`), Lesen über 1-h-Signed-URL (`storage.ts:84-90`, `useSpaces.ts:12-22`). **Dieser Kernpfad ist gesund und gut belegt.**

**Lokaler Modus:** `local.ts:223-242` schreibt alle vier Felder in AsyncStorage; Avatar über `persistPickedPhoto` (`edit.tsx:143`) aus dem verdrängbaren Cache. `useSpaces.ts:16` gibt den lokalen Pfad direkt zurück. **Gesund.**

### BEFUND 4.1 — Lokaler Stale-Wert überschreibt den Server-Wert im Edit-Screen und wird zurückgeschrieben
- **Datei:Zeile:** `app/space/edit.tsx:85-93`
- **Problem:** `useSpaces` etabliert bereits die richtige Rangfolge — Server gewinnt, lokal ist nur Fallback (`useSpaces.ts:44-49`, dort explizit so kommentiert). Der Edit-Screen macht das direkt danach kaputt: Zwei Effekte laden `getSpaceEmoji(id)` / `getCollectibleEmoji(id)` aus AsyncStorage und rufen bedingungslos `setEmoji(e)` / `setCollectible(e)`, sobald ein lokaler Wert existiert. Szenario: Partner A ändert das Emoji auf 🌸 (Server). Partner B hat lokal noch 🔥 vom letzten eigenen Speichern liegen (geschrieben in `edit.tsx:156-157`). B öffnet den Edit-Screen: es steht 🔥 statt 🌸. B ändert nur den Namen und speichert — `edit.tsx:150` schickt `emoji: '🔥'` mit und **setzt A's Änderung serverseitig zurück**. Ein stiller Rückschritt für beide Mitglieder.
- **Verstoß:** MANIFESTO §1 (die App zeigt einen Zustand, der nicht der geteilte ist) und §2/§5 (das Versprechen „beide sehen dasselbe Zeichen" aus `types.ts:50-54` wird gebrochen).
- **Fix:** Die lokalen Werte nur als Fallback anwenden: `edit.tsx:85-93` auf `if (space?.emoji) return;` bzw. `if (space?.collectibleEmoji) return;` gaten — oder die beiden Effekte ganz streichen, da `useSpaces.ts:48-49` den Fallback bereits auflöst und `edit.tsx:63-64` ihn übernimmt.

### BEFUND 4.2 — Alte Avatare bleiben für immer im Bucket liegen; `deleteSpaceAvatar` ist toter Code
- **Datei:Zeile:** `lib/supabase/storage.ts:78-81` (nie aufgerufen), `app/space/edit.tsx:141-146`
- **Problem:** `uploadSpaceAvatar` schreibt bei jedem Wechsel einen **neuen** zeitgestempelten Pfad (`storage.ts:69`, `upsert:false`) — der Doc-Kommentar `storage.ts:58-59` behauptet „old files are overwritten", das stimmt nicht. Nur `spaces.avatar_path` zeigt danach woanders hin. Beim Entfernen (`edit.tsx:144-146`, `avatarPath = ''`) wird die Datei ebenfalls nicht gelöscht. `deleteSpaceAvatar` existiert, wird aber in der gesamten Codebasis nirgends aufgerufen (verifiziert per Suche). Ergebnis: Jedes je hochgeladene Space-Foto liegt dauerhaft im Bucket — auch das, das der Nutzer bewusst „entfernt" hat. Vergleich: Beim Memory-Foto wird korrekt aufgeräumt (`supabase.ts:150-154`).
- **Verstoß:** MANIFESTO §2 (der Nutzer entfernt ein Foto und glaubt, es sei weg; es ist es nicht) und §1.
- **Fix:** In `edit.tsx:save()` den bisherigen `space.avatarPath` merken und nach erfolgreichem `spaceRepository.update` `deleteSpaceAvatar(oldPath).catch(() => undefined)` aufrufen — sowohl beim Ersetzen als auch beim Leeren. Kommentar `storage.ts:58-59` korrigieren.

### BEFUND 4.3 — Fehlerbehandlung meldet Misserfolg, obwohl der Server gespeichert hat
- **Datei:Zeile:** `app/space/edit.tsx:148-169`
- **Problem:** Im `try`-Block folgen nach dem erfolgreichen `spaceRepository.update` noch `setSpaceEmoji` und `setCollectibleEmoji` (Zeilen 156-157). `storage.set` wirft laut `lib/store.ts:14-18` bei Schreibfehlern. Wirft es hier, landet man im `catch` (161) und der Nutzer liest „Änderungen konnten nicht gespeichert werden. Bitte versuche es erneut" — obwohl die Änderung serverseitig bereits durch ist. Er versucht es erneut, `refresh()` und `router.back()` (159-160) wurden übersprungen, die UI zeigt weiter den alten Stand.
- **Verstoß:** MANIFESTO §1 (falsche Statusmeldung), §5 (Primäraktion ohne korrektes Feedback).
- **Fix:** Die beiden Write-Through-Aufrufe aus dem kritischen Pfad nehmen: `void setSpaceEmoji(...).catch(() => undefined)` bzw. den Block hinter `confirmSuccess()` in ein eigenes `try/catch` legen.

### BEFUND 4.4 — Hochgeladener Avatar wird verwaist, wenn der anschließende UPDATE fehlschlägt
- **Datei:Zeile:** `app/space/edit.tsx:137-153`
- **Problem:** Erst wird das Bild hochgeladen (141-143), dann der Zeilen-Update ausgeführt (148). Schlägt der Update fehl (RLS, Netz), liegt die Datei im Bucket ohne Referenz. `supabaseMemoryRepository.create` macht es an dieser Stelle richtig und räumt auf (`supabase.ts:109-112`).
- **Verstoß:** MANIFESTO §2 (Foto liegt im Storage, ohne dass irgendetwas im Produkt es je wieder erreicht oder löscht).
- **Fix:** Denselben Kompensationspfad wie `supabase.ts:109-112` einbauen: bei Fehler `deleteSpaceAvatar(avatarPath).catch(() => undefined)`.

### BEFUND 4.5 (niedrig) — Emoji-Auswahl ohne sichtbare Wirkung, solange ein Foto gesetzt ist
- **Datei:Zeile:** `app/space/edit.tsx:75-76,203-207,243-263`
- **Problem:** Die Anzeige bevorzugt immer das Foto. Wer bei gesetztem Foto ein Emoji antippt, sieht die Zelle markiert, aber weder Vorschau noch Space ändern sich — das Emoji wird gespeichert und ist unsichtbar. Kein Hinweis erklärt das.
- **Verstoß:** MANIFESTO §5 (Mehrdeutigkeit entfernen; Aktion ohne sichtbare Konsequenz).
- **Fix:** Unter dem Emoji-Grid eine ruhige Zeile rendern, wenn `shownAvatarUrl` gesetzt ist: „euer Foto wird gezeigt — das Emoji greift, sobald ihr auf „Emoji nutzen" wechselt."

**Gesund geprüft:** EXIF-Strippen und Downscale für Avatare (`storage.ts:62-66`); Bucket ist nicht öffentlich und alle vier Storage-Policies sind mitgliedsgebunden (`0012:24-58`); die Signed-URL-Auflösung fällt bei fehlendem Bucket sauber auf das Emoji zurück statt zu crashen (`useSpaces.ts:18-21`); `mapSpace` liest alle drei Identitätsfelder korrekt (`supabase.ts:46-48`).

---

## 5. Space umbenennen vs. UPDATE-Policy (Migration 0012)

**Erwartung und Code passen — das historische Problem ist behoben.** `0012:14-18` legt die fehlende UPDATE-Policy `"spaces: members update"` an (`using` und `with check` beide `app_is_space_member(id)`), und der Migrationskopf `0012:4-7` dokumentiert die alte, stille Verwerfung ausdrücklich. `0013:2-3` begründet korrekt, warum `collectible_emoji` keine neue Policy braucht.

**Wird ein RLS-Reject still verschluckt?** Nein, nicht mehr — an der entscheidenden Stelle: `supabase.ts:240-247` nutzt `.select().single()` nach dem Update. Ein RLS-Reject liefert 0 Zeilen, `.single()` erzeugt daraus einen Error, und `edit.tsx:161` fängt ihn und zeigt eine Fehlermeldung. Ein stiller Erfolg ist auf diesem Weg nicht möglich. **Gesund und bewusst so gebaut.**

### BEFUND 5.1 (niedrig) — Kein Format-Constraint auf `spaces.invite_code` in der Tabelle selbst
- **Datei:Zeile:** `supabase/migrations/0001_init.sql:20-26` vs. `0008_create_space.sql:31-34`, INSERT-Policy `0001_init.sql:95-96`
- **Problem:** Das `PEAK-XXXXXX`-Regex existiert nur **innerhalb** von `create_space`. Die Tabelle hat lediglich `unique`. Gleichzeitig erlaubt `"spaces: authenticated create" … with check (true)` jedem authentifizierten Client den direkten Insert mit beliebigem `invite_code` — an der RPC vorbei. Lesbar wäre die Zeile mangels Mitgliedschaft nicht, aber es lassen sich beliebig kurze/vorhersagbare Codes belegen und der Namensraum vergiften.
- **Verstoß:** MANIFESTO §2 (deny-by-default gilt für Lesen, aber die Schreibfläche ist unnötig offen), §4 (die Invariante lebt nur in einer Funktion, nicht im Schema).
- **Fix:** Forward-Migration: `alter table public.spaces add constraint spaces_invite_code_format check (invite_code ~ '^PEAK-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$') not valid;` (`not valid`, weil Seed-/Altbestand wie `PEAK-7842` sonst blockiert). Zusätzlich die INSERT-Policy auf `false` setzen und Anlage ausschließlich über `create_space` erzwingen.

---

## 6. Space verlassen / löschen

### BEFUND 6.1 — Es gibt keine Möglichkeit, einen Space zu verlassen oder zu löschen; die Server-Policy dafür existiert und liegt brach
- **Datei:Zeile:** `lib/repositories/interfaces.ts:39-54` (kein `leave`/`delete` im `ISpaceRepository`); `supabase/migrations/0001_init.sql:103-104` (`"space_members: leave self"` DELETE-Policy vorhanden); UI-Flächen `components/space/SpacePicker.tsx:116-189`, `app/space/edit.tsx`, `app/(tabs)/profile.tsx:35-44`
- **Problem:** Der SpacePicker bietet ausschließlich Wechseln, Bearbeiten, Teilen, Neu. Der Edit-Screen hat keinerlei destruktive Aktion. Der Server erlaubt das Austreten ausdrücklich (`0001:103-104`) — dieser Weg wird von keiner Zeile Client-Code genutzt. Folge: Wer versehentlich einem Space beitritt, oder wer nach einer Trennung aus einem Paar-Space heraus will, hat **genau eine Option: den gesamten Account löschen** (`app/account.tsx:36-67`) — und verliert damit auch alle anderen Spaces. Das ist die eigentliche Sackgasse dieser Dimension.
- **Verstoß:** MANIFESTO §2 („Du hast jederzeit die Kontrolle über deine Daten" — genau dieser Satz steht in `account.tsx:86-88` und ist für Space-Mitgliedschaften unwahr) und §1.
- **Fix:** `ISpaceRepository` um `leave(spaceId, userId): Promise<void>` erweitern; Supabase-Implementierung: `delete from space_members where space_id = … and user_id = auth.uid()` (die Policy trägt das bereits, keine Migration nötig); lokale Implementierung analog über `MEMBERS_KEY`. Im Edit-Screen unten eine ruhige „Gefahrenzone" mit „diesen Space verlassen" + `Alert`-Bestätigung ergänzen, danach `refresh()` und Fallback auf den ersten verbleibenden Space.

### BEFUND 6.2 — Was mit Memories und Fotos passiert, ist nur für den Account-Löschpfad geregelt, und dort unvollständig
- **Datei:Zeile:** `supabase/migrations/0004_delete_account_storage.sql:18-30` vs. `0012_space_identity.sql:24-26`
- **Problem:** `delete_account` räumt beim Löschen von Solo-Spaces korrekt den Bucket `memory-photos` mit auf (`0004:26-28`) — genau dafür wurde 0004 geschrieben. Der Bucket `space-avatars` kam erst mit 0012 dazu, und es gibt **keine** Folgemigration, die `delete_account` nachzieht. Ergebnis: Nach einer Account-Löschung („Das kann nicht rückgängig gemacht werden", `account.tsx:40-41`) bleiben alle Space-Avatarfotos des gelöschten Solo-Space im Storage zurück. Verstärkt durch Befund 4.2, wo auch die Historie aller je ersetzten Avatare liegen bleibt.
- **Verstoß:** MANIFESTO §2 (Fotos überleben eine als endgültig angekündigte Löschung), §4 (0012 hat eine bestehende Funktion nicht nachgezogen; „Korrekturen sind neue Migrationen" — diese Korrektur fehlt).
- **Fix:** Forward-Migration `0014`, die `create or replace function public.delete_account()` um denselben Block wie `0004:26-28` für `bucket_id = 'space-avatars'` ergänzt. Wenn Befund 6.1 umgesetzt wird, dieselbe Frage auch für „letztes Mitglied verlässt den Space" beantworten (heute bliebe der Space als Waise mit allen Fotos zurück).

**Gesund geprüft:** Die Cascades im Schema sind sauber — `space_members`, `memories`, `card_activations`, `challenge_enrollments` hängen alle mit `on delete cascade` an `spaces` (`0001:30,39,51,58`). Geteilte Spaces bleiben für die anderen bestehen, Autorschaft wird korrekt abgelöst statt Zeilen zu löschen (`0004:32-35`). Der Bestätigungsdialog in `account.tsx:36-52` benennt ehrlich, dass nur Solo-Spaces gelöscht werden.

---

## 7. Mehrere Spaces: Besitz, Auswahl, Neustart

**Mehrere Spaces sind möglich und werden korrekt geladen:** `space_members` erlaubt n:m (`0001:28-36`), `getAllForUser` joint über die Mitgliedschaften (`supabase.ts:192-201`), sortiert deterministisch nach `createdAt`. Copy sagt das ehrlich (`space/new.tsx:92-95`: „Du kannst in so vielen sein, wie du möchtest"). **Gesund.**

**Aktive Wahl:** `useAppStore.setActiveSpace` (`lib/store.ts:89-92`) schreibt in den State **und** nach AsyncStorage unter `ACTIVE_SPACE_KEY`; `hydrate` liest ihn beim Start zurück (`store.ts:61,71`). **Überlebt den Neustart im Normalfall — gesund.**

### BEFUND 7.1 — Die gespeicherte Space-Wahl kann beim Kaltstart still überschrieben werden
- **Datei:Zeile:** `lib/hooks/useSpaces.ts:56-58` im Zusammenspiel mit `lib/store.ts:47-77` und `app/_layout.tsx:24-36`
- **Problem:** `useSpaces.load` setzt bedingungslos `setActiveSpace(data[0].id)`, sobald `activeSpaceId` nicht in der geladenen Liste vorkommt — und `setActiveSpace` **persistiert sofort** (`store.ts:91`). Vor Abschluss der Hydration ist `activeSpaceId` aber `null` (`store.ts:52`). Es gibt keine Gate auf `hydrated`: `_layout.tsx` blockiert das Rendering nicht, sondern hält nur den Splash (`_layout.tsx:30-36`) und hat einen 3-Sekunden-Failsafe (`_layout.tsx:33-36`), nach dem die App unabhängig vom Hydration-Zustand sichtbar wird. Läuft `useSpaces` in diesem Fenster (langsames AsyncStorage, kalter Start), wird die bewusste Wahl des Nutzers durch den ältesten Space ersetzt und sofort überschrieben — der Rückweg ist weg.
- **Verstoß:** MANIFESTO §3 („Der Mensch entscheidet" — die Software überschreibt eine explizite Entscheidung), §5.
- **Fix:** In `useSpaces` den Store-Wert `hydrated` mitlesen und `load` erst laufen lassen bzw. den Auto-Default nur anwenden, wenn `hydrated === true`: `if (hydrated && data.length > 0 && !data.some(...))`.

### BEFUND 7.2 — Kein Weg zurück, wenn der Nutzer noch keinen Space hat
- **Datei:Zeile:** `app/(tabs)/profile.tsx:57-96`, `app/(tabs)/home.tsx:~228` (`{activeSpace && …}`)
- **Problem:** Der gesamte Space-Block inklusive des einzigen Einstiegs in den `SpacePicker` ist an `activeSpace &&` gebunden. Ein Nutzer ohne Space (z. B. nach einem fehlgeschlagenen Beitritt, siehe Befund 2.1) sieht auf Profile keinen Space-Block, keinen Picker, und damit **keinen Weg zu „neuer Space"** — der `/space/new`-Screen ist ausschließlich über `SpacePicker.tsx:90-93` erreichbar. Kein `EmptyState`, obwohl die Komponente existiert (`components/ui/EmptyState.tsx`).
- **Verstoß:** MANIFESTO §5 (jeder Screen-Zustand hat genau eine klare Primäraktion — dieser Zustand hat keine).
- **Fix:** In `profile.tsx` und `home.tsx` einen `else`-Zweig mit `EmptyState` und Primäraktion „SPACE STARTEN" → `router.push('/space/new')` ergänzen.

---

## 8. `useSpaces` — Race Conditions, Stale State, Refresh nach Mutationen

**Refresh nach Mutationen: gesund.** `useFocusEffect` (`useSpaces.ts:66-70`) lädt beim Zurückkehren aus den Modals `space/new` und `space/edit` neu; `space/edit.tsx:159` ruft zusätzlich explizit `refresh()`.

### BEFUND 8.1 — `load()` hat keinen In-Flight-Guard: ein veraltetes Ergebnis kann den neuen Zustand überschreiben und den aktiven Space zurücksetzen
- **Datei:Zeile:** `lib/hooks/useSpaces.ts:34-70`
- **Problem:** `load` ist unkontrolliert nebenläufig. Auf demselben Screen laufen mindestens zwei Aufrufe an: der Mount-Effekt (61-63) und `useFocusEffect` (66-70) — beide mit derselben `load`-Identität, aber ohne Abbruch. Zusätzlich wird `load` bei jeder Änderung von `activeSpaceId` neu erzeugt (Dependency, Zeile 59) und erneut ausgeführt. Jeder Durchlauf macht pro Space einen Netz-Roundtrip für die Signed URL (`useSpaces.ts:50` in `Promise.all`), die Laufzeiten schwanken also stark. Es gibt weder ein `cancelled`-Flag noch eine Request-Sequenz — das zuletzt zurückkehrende Ergebnis gewinnt, nicht das zuletzt gestartete. Konkrete Folge nach einem Beitritt/Anlegen: Ein noch laufender älterer `load` liefert die Liste **ohne** den neuen Space, `setSpaces` schreibt die alte Liste zurück, und Zeile 56-58 stellt fest, dass der frisch gesetzte `activeSpaceId` „ungültig" ist und ruft `setActiveSpace(data[0].id)` — der Nutzer wird in seinen alten Space zurückgeworfen, **inklusive Persistierung**.
- **Verstoß:** MANIFESTO §5 (Primäraktion ohne verlässliche Konsequenz), §3 (Software überschreibt die Entscheidung).
- **Fix:** In `load` eine monoton steigende Request-ID über ein `useRef` führen und `setSpaces` / `setActiveSpace` nur ausführen, wenn die ID noch aktuell ist; zusätzlich `activeSpaceId` aus der `useCallback`-Dependency nehmen (per Ref lesen), damit ein Space-Wechsel nicht jedes Mal einen kompletten Neuladezyklus samt Signed-URL-Runde auslöst.

### BEFUND 8.2 — Jeder Screen hält eine eigene, nicht geteilte Kopie der Space-Liste
- **Datei:Zeile:** `lib/hooks/useSpaces.ts:29-30`; 19 Aufrufstellen (u. a. `home.tsx:42`, `discover.tsx:96`, `profile.tsx:26`, `editions.tsx:23`, `space/edit.tsx:57`, `challenges/index.tsx:22`)
- **Problem:** `useState` statt eines geteilten Caches — obwohl ein `QueryClientProvider` bereits im Root hängt (`app/_layout.tsx:48`) und ungenutzt bleibt. Jede gemountete Instanz lädt unabhängig; nur `activeSpaceId` ist über Zustand geteilt, `spaces` nicht. Nach einer Umbenennung in `space/edit` zeigen im Hintergrund gemountete Tabs weiter den alten Namen, bis sie selbst Fokus bekommen. Bei mehreren Spaces vervielfacht sich außerdem die Signed-URL-Last (`useSpaces.ts:50`) pro Screen.
- **Verstoß:** MANIFESTO §5 (die App zeigt gleichzeitig zwei Wahrheiten über denselben Space).
- **Fix:** `useSpaces` auf `useQuery(['spaces', userId])` des bereits vorhandenen React-Query-Clients umstellen; Mutationen in `space/edit.tsx:148` und `space/new.tsx:40,62` invalidieren den Key. Das löst 8.1 und 8.2 gemeinsam.

### BEFUND 8.3 — Beim Space-Wechsel bleiben die Memories des vorherigen Space sichtbar
- **Datei:Zeile:** `lib/hooks/useMemories.ts:11-30` (kein Reset von `memories` bei `spaceId`-Wechsel, kein In-Flight-Guard), Konsument `app/(tabs)/home.tsx:42-…`
- **Problem:** Wechselt der Nutzer im `SpacePicker` von Space A nach B, ändert sich `activeSpaceId` sofort; Header, Name, Emoji und Avatar springen auf B (`home.tsx:158-196`). `useMemories` startet erst dann den Reload und **behält bis zu dessen Rückkehr die Memories von A im State** — die private Liste von A wird also für die Dauer des Ladens unter dem Namen und Foto von B angezeigt. Dieselbe fehlende Abbruchlogik wie in 8.1 erlaubt zusätzlich, dass bei schnellem A→B→A das Ergebnis von B zuletzt landet und dauerhaft unter A steht, bis der Screen neu fokussiert wird.
- **Verstoß:** MANIFESTO §2 (Inhalte eines Space werden im Kontext eines anderen Space dargestellt — die Space-Grenze ist die Kernzusage) und §1.
- **Fix:** In `useMemories.load` beim Wechsel zuerst `setMemories([])` (bzw. `useEffect(() => setMemories([]), [spaceId])`) und einen Request-ID-Guard analog zu 8.1 ergänzen, damit ein veraltetes Ergebnis nie in einen anderen Space geschrieben wird. Derselbe Guard fehlt in `useChallenges`.

---

## 9. Manifest §2 — werden Space-Daten geloggt, geteilt oder öffentlich?

Jede Behauptung gegen den Datenfluss geprüft:

- **Logging:** Vollständige Suche nach `console.*` in `app/`, `lib/`, `components/` ergibt exakt zwei Treffer: `lib/storage.ts:31` (Key-Name, kein Wert) und `lib/store.ts:21` (Fehlerobjekt, kein Space-Inhalt). **Kein Space-Name, kein Emoji, kein Avatar wird geloggt. Gesund.**
- **Analytics:** `lib/analytics/events.ts` deklariert `space_created`/`space_joined`/`space_switched`, aber die Suche nach `track(` in `app/` und `lib/` (außerhalb von `lib/analytics/`) ergibt **null Treffer** — es gibt keine einzige Aufrufstelle, und der aktive Provider ist der No-Op (`lib/analytics/null.ts`). Der Vertrag `events.ts:4-14` („keine Diary-Texte, keine Fotos, Space-IDs nur als opake Keys") wird eingehalten, weil nichts gesendet wird. **Gesund.**
- **Öffentliche Orts-Bewertung:** `supabase.ts:472-484` sendet ausschließlich `place_id`, `rating` und den durch `sanitiseTip` (`lib/privacy/boundaries.ts:43-47`) gekürzten Tipp. **Keine `space_id`, kein Name, kein Emoji, keine Identität** — exakt so, wie §2 es fordert. **Gesund, und der beste Beleg dafür, dass die Trennung privat/anonym im Code real ist.**
- **Teilbare Links:** `composeIdeaShareText` und `composeDatePlanShareText` (`lib/shareText.ts:40-59`) tragen nur Katalog-IDs bzw. den vom Nutzer selbst geschriebenen „wann"; `validateShareableLink` (`boundaries.ts:79-93`) verbietet Query-Parameter. **Gesund.**
- **Space-Name im Invite-Text:** `lib/shareText.ts:22-33` setzt den Space-Namen in die Einladung. Das ist nutzerinitiiert über das OS-Share-Sheet (`invite.tsx:107`, `SpacePicker.tsx:84`), also gedeckt von §2 („aktiv geteilt"). **Gesund** — mit der Einschränkung aus Befund 2.6 (zu leicht auslösbar).
- **Avatare:** Bucket `public=false`, alle Policies mitgliedsgebunden, Zugriff nur über 1-h-Signed-URLs (`0012:24-58`, `storage.ts:84-90`). **Gesund.**

### BEFUND 9.1 (niedrig) — Der Space-Typ verlässt das Gerät, ohne im Transparenz-Screen aufzutauchen
- **Datei:Zeile:** `lib/ai/askGateway.ts:49-56` (`body: { constraints, candidates }`), Quelle der Constraints `app/(tabs)/discover.tsx:163`, Transparenzliste `app/settings/preferences.tsx:83-125,175-181`
- **Problem:** `DateConstraints` enthält `spaceType` und wird komplett an die Edge Function `discover` geschickt. Der Preferences-Screen behauptet: „hier ist alles, was deine Entdecken-Vorschläge beeinflusst" (`preferences.tsx:136-139`) und listet unter „WAS WIR VERWENDEN" ausschließlich die Onboarding-Ziele (`preferences.tsx:83-92`) — `spaceType` (Paar vs. Freunde), `timeOfDay` und das Live-Wetter fehlen. Unter „WAS WIR NIE VERWENDEN" steht „abgeleitete Beziehungs- oder Intimitätsmerkmale" (`preferences.tsx:119-122`); `spaceType` ist zwar **erklärt** und nicht abgeleitet, aber ein Beziehungsmerkmal, das der Nutzer auf diesem Screen nicht wiederfindet.
- **Verstoß:** MANIFESTO §1 (die Aussage „hier ist *alles*" ist unvollständig) — kein Datenleck, aber eine zu starke Behauptung.
- **Fix:** In `preferences.tsx` die `signals`-Liste um drei ehrliche Zeilen ergänzen: Space-Typ (Quelle: „von dir gewählt"), Tageszeit (Quelle: „Gerät, pro Anfrage") und Live-Wetter (Quelle: „Open-Meteo, pro Anfrage, nicht gespeichert").

### BEFUND 9.2 (niedrig) — Seed-Daten geben im lokalen Modus erfundene Menschen als Space-Mitglieder aus
- **Datei:Zeile:** `lib/seed.ts:14-37` (`'Alicia & Partner'`, Mitglieder `Partner`, `Jonas`, `Mira`), geladen über `local.ts:139-145`, aktiv wenn `isSupabaseConfigured === false` (`lib/repositories/index.ts:28`)
- **Problem:** Ohne Supabase-Keys startet jeder Nutzer mit zwei fertigen Spaces samt fiktiver Mitglieder und vorbelegten Kartenaktivierungen (`seed.ts:47-50`). Der Produktionsbuild setzt die Keys (`eas.json` `preview`/`production`), der Pfad ist also normalerweise Dev-only — aber `isSupabaseConfigured` ist der einzige Schalter, und `AGENTS.md` verlangt ausdrücklich „`lib/mock-auth.ts` ist unconfigured-mode only — never a production path". Es gibt keine Laufzeit-Absicherung, die das erzwingt.
- **Verstoß:** MANIFESTO §1 (erfundene Menschen als echte Space-Mitglieder, wenn der Modus je in einem Build landet).
- **Fix:** In `lib/repositories/index.ts` oder `lib/config.ts` einen Guard ergänzen, der im Release-Build (`!__DEV__`) bei fehlender Supabase-Konfiguration hart fehlschlägt oder mindestens einen sichtbaren „Demo-Daten"-Banner erzwingt.

---

## 10. `app/(tabs)/profile.tsx` als Vertrauens-/Kontrollzentrum — jede Aktion einzeln

Der Anspruch steht als Kommentar im Code: „Me = trust & control center" (`profile.tsx:33-34`). Alle acht angebotenen Aktionen einzeln geprüft:

| # | Aktion | Ort | Ziel | Befund |
|---|---|---|---|---|
| 1 | Space-Block antippen → `SpacePicker` | `profile.tsx:57-87` | `setPickerOpen(true)` | **funktional**; nur bei `activeSpace` sichtbar → siehe Befund 7.2 |
| 2 | Space wechseln | `profile.tsx:94` → `SpacePicker.tsx:124` | `setActiveSpace` | **funktional**, persistiert; Stale-Risiko siehe 8.1/8.3 |
| 3 | Space bearbeiten (Stift) | `SpacePicker.tsx:154-162` | `/space/edit` | **funktional**; Mängel siehe 4.1–4.5 |
| 4 | Space teilen (Share) | `SpacePicker.tsx:164-172` | OS-Share-Sheet | **funktional**; Risiko siehe 2.6 |
| 5 | Neuer Space | `SpacePicker.tsx:178-189` | `/space/new` | **funktional** |
| 6 | „PeakPlant anpassen" | `profile.tsx:36` | `/customize` | **funktional** — `app/customize.tsx` schaltet echte Feature-Flags, `soon`-Einträge sind sichtbar deaktiviert und als „BALD" markiert (`customize.tsx:53,59`). Ehrlich gebaut. |
| 7 | „gemerkte Pläne" | `profile.tsx:37` | `/discover/saved` | **funktional** — Screen existiert und lädt space-scoped. |
| 8 | „eure Rituale" | `profile.tsx:38-40` | `/rituals` | **funktional, aber praktisch unerreichbar**: `rituals` hat `status:'soon'` und `defaultEnabled:false` (`lib/features.ts:35-42`), und `customize.tsx:59` deaktiviert den Schalter für `soon`. Der Link kann also über die UI nie eingeschaltet werden. Sauber ausgeblendet statt tot — akzeptabel, aber der Screen `app/rituals/index.tsx` ist damit ungenutzter Code. |
| 9 | „Sprache & Einstellungen" | `profile.tsx:41` | `/settings/preferences` | **funktional** — alle Schalter und beide Reset-Dialoge wirken echt (`preferences.tsx:69-112,203-212`). Einschränkung siehe 9.1. |
| 10 | „Konto & Daten" | `profile.tsx:42` | `/account` | **funktional** — Abmelden (`account.tsx:25-34`) und Löschen (`account.tsx:54-67`) rufen echte RPCs. Einschränkung siehe 6.2. |
| 11 | „PeakPlant Plus" | `profile.tsx:43` | `/plus` | **TOTER BUTTON — siehe Befund 10.1** |

### BEFUND 10.1 — „7 TAGE KOSTENLOS TESTEN" ist ein toter Button, der sich als vorübergehender Fehler ausgibt
- **Datei:Zeile:** `app/plus.tsx:118-124` (CTA) → `plus.tsx:29-44` (`handleStartTrial`) → `lib/monetization/billing/index.ts:12` (`export { nullBilling as billing }`) → `lib/monetization/billing/null.ts:23-26`
- **Problem:** Der aktive Billing-Provider ist der No-Op und liefert **immer** `{ success: false, error: 'billing_disabled' }`. Das ist im Adapter bewusst als „Honest failure, not a fake success" kommentiert (`null.ts:24`) — der Screen macht daraus aber das Gegenteil: Er prüft nur auf `!== 'cancelled'` und zeigt „Etwas ist schiefgelaufen — Bitte versuche es erneut oder stelle deine Käufe unten wieder her" (`plus.tsx:35-39`). Der Nutzer erlebt eine Störung statt einer nicht existierenden Funktion und wird zusätzlich auf „Käufe wiederherstellen" gelenkt, das ebenfalls immer scheitert (`null.ts:27-29` → `plus.tsx:57-61` „Kein aktives Plus-Abo für dieses Konto gefunden"). Die ehrliche Absicht des Adapters wird im UI vollständig kassiert. Erschwerend: Preis, Testphase und „Zahlung nach der Testphase" (`plus.tsx:132-137`) werden als Fakten dargestellt, obwohl `PRICE_HYPOTHESES` schon im Namen sagt, dass es Hypothesen sind.
- **Verstoß:** MANIFESTO §1 (die App behauptet ein kaufbares Abo und einen behebbaren Fehler — beides hält der Code nicht) und §5 (Primäraktion ohne mögliche Konsequenz).
- **Fix:** `plus.tsx` an `billing.isConfigured()` koppeln: Ist der Provider nicht konfiguriert, den CTA und „Käufe wiederherstellen" gar nicht rendern, stattdessen eine ruhige Zeile im PeakPlant-Ton („Plus ist noch nicht zu haben — alles im Tagebuch bleibt frei"). Zusätzlich `error === 'billing_disabled'` in `plus.tsx:34` gesondert behandeln, statt es unter „Etwas ist schiefgelaufen" zu subsumieren. Solange das offen ist, konsequenterweise Zeile `profile.tsx:43` ausblenden.

### BEFUND 10.2 — „Paar"-Copy im Freunde-Space auf dem Plus-Screen
- **Datei:Zeile:** `app/plus.tsx:20` (`MONTHLY_PRODUCT_ID = 'couple_monthly'`), `plus.tsx:129-131` („pro Paar"), `plus.tsx:132-137` („Ein Abo pro Paar")
- **Problem:** Der Screen wird über `profile.tsx:43` aus **jedem** Space erreicht und rechnet in `plus.tsx:33` mit dem aktiven `spaceId` ab — auch aus einem Freunde-Space heraus, wo dann dreimal „pro Paar" steht. Der Space-Typ wird nirgends berücksichtigt.
- **Verstoß:** MANIFESTO §1/§5 (falsche Ansprache; §2 des Manifests behandelt Freunde-Spaces als gleichwertig, das Produkt hier nicht).
- **Fix:** In `plus.tsx` `activeSpace.type` lesen und die drei Copy-Stellen auf „pro Space" bzw. typabhängig formulieren.

### BEFUND 10.3 — Wer im Space ist, lässt sich nirgends einsehen; `getMembers` ist toter Code
- **Datei:Zeile:** `lib/repositories/interfaces.ts:42`, implementiert in `lib/repositories/local.ts:162-165` und `lib/repositories/supabase.ts:209-213` — **keine einzige Aufrufstelle** in `app/`, `components/` oder `lib/` (verifiziert); ebenso ungenutzt: `getById` (`supabase.ts:203-207`)
- **Problem:** Das Profil nennt sich Vertrauens- und Kontrollzentrum, aber die für Vertrauen entscheidende Frage — *wer hat Zugriff auf unser Tagebuch?* — kann der Nutzer nirgends beantworten. Die Mitgliederliste ist in beiden Repositories fertig implementiert und wird von keinem Screen gerendert. In Kombination mit Befund 2.2 (Code läuft nie ab, ist nie widerrufbar), 2.3 (kein Mitgliederlimit) und 6.1 (kein Verlassen) heißt das: Es kann jemand in einem Space sein, ohne dass die anderen es je erfahren, ohne Limit, ohne Widerruf und ohne Ausstieg. Das ist die schwerwiegendste Kombination dieser Dimension.
- **Verstoß:** MANIFESTO §2 („Tagebuch, Notizen und Fotos sind privat für die Mitglieder eines Space" — ohne Sichtbarkeit der Mitgliederliste ist das eine unüberprüfbare Behauptung) und §3 (der Mensch entscheidet).
- **Fix:** In `app/space/edit.tsx` einen Abschnitt „WER IST HIER" ergänzen, der `spaceRepository.getMembers(space.id)` rendert (Name, Rolle, beigetreten am — die Daten liegen bereits vor, `mapMember` in `supabase.ts:51-53`, RLS-Policy `0001:99-100` erlaubt das Lesen für Mitglieder). Zusammen mit 6.1 (verlassen) und 2.2 (Code rotieren) ergibt das ein vollständiges Kontrollzentrum ohne eine einzige neue Tabelle.

---

## Zusammenfassung

**Als GESUND befunden** (explizit geprüft, keine Beanstandung): Invite-Code-Generator und sein Lockstep mit dem DB-Regex inkl. Test über 500 Runden (`lib/invite.ts`, `invite.test.ts`); `create_space` als SECURITY-DEFINER-RPC mit `auth.uid()`-Ownership statt client-gelieferter ID (`0008`, `spaceCreation.ts`); die UPDATE-Policy aus `0012` und ihr sauberes Zusammenspiel mit `.select().single()` — das historische „stille RLS-Verwerfung beim Umbenennen" ist behoben und kann nicht still zurückkehren; deny-by-default RLS und die rekursionssichere `app_is_space_member` (`0001`); Avatar-Bucket nicht öffentlich, EXIF-Strippen, kurzlebige Signed URLs mit Emoji-Fallback statt Crash; die Trennung privat/anonym bei der Orts-Bewertung (keine `space_id` im öffentlichen Pfad); kein Logging und kein Analytics-Versand von Space-Daten; Persistenz der aktiven Space-Wahl über AsyncStorage; die Feature-Flag-Ehrlichkeit in `customize.tsx` („BALD" statt toter Schalter); `friends` ist echtes Verhalten (Empfehlungen, Saison-Challenges, Tagline), kein bloßes Label.

**Schwerpunkt der Mängel:** Die Identitäts-Schreibpfade (Punkt 4/5) sind sauber gebaut. Der Riss liegt im **Lebenszyklus einer Mitgliedschaft** — Punkte 2, 6 und 10 zusammen: unwiderruflicher, ewig gültiger Code (2.2), kein Limit (2.3), keine Mitgliederliste (10.3), kein Verlassen (6.1), obwohl die Server-Policy dafür seit `0001:103` existiert. Dazu die Ehrlichkeitslücken im lokalen Modus (3.1, 3.2) und auf dem Plus-Screen (10.1).