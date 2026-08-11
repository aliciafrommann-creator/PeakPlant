# APP-FINALISIERUNG — das Playbook

> **So promptest du es:** In einer frischen Session (Repo PeakPlant) reicht ein Satz:
>
> > **„führe APP-FINALISIERUNG.md aus"**
>
> Optional mit Fokus: „… mit Fokus auf Onboarding" / „… nur Phase 1" /
> „… Befunde aus dem letzten Lauf zuerst". Mehr braucht es nicht — alles
> Weitere steht hier und ist für die Session bindend.

---

## Ziel

Die PeakPlant-App auf **veröffentlichbaren, store-fertigen Stand** bringen und
halten. „Fertig" heißt: jeder Kern-Loop funktioniert nachweislich in beiden
Modi (lokal + Supabase), jede UI-Behauptung hält, was der Code tut
(MANIFESTO §1), und die Checks sind grün. Nicht „fertig" heißt: hübsch, aber
ein Loop bricht auf halbem Weg.

## Bindende Grundregeln (vor allem anderen lesen)

1. `../MANIFESTO.md` und `AGENTS.md` in `mobile/` gelten vollständig — bei
   Konflikt gewinnt das Manifest.
2. **Branch, nie main.** Kleine Commits, Schluss per PR.
3. **Keine Supabase-Migration ohne ausdrückliches OK von Alicia.** Analyse ja,
   Anwenden nein.
4. **90%-Regel:** bei ~90 % Kontext keine neuen großen Aufgaben — stabilisieren,
   committen, pushen, Übergabe schreiben.
5. **Ehrlicher Report:** was headless nicht prüfbar ist (GUI, Animation,
   echtes Gerät), wird als *unverifiziert* benannt — nie als „funktioniert"
   verkauft.

---

## Phase 1 — Analyse durch Subagents (READ-ONLY, scharf gepromptet)

Setze parallele **Explore-Agents** ein. Jeder Agent bekommt GENAU eine Dimension
und einen erschöpfenden Checklisten-Prompt. In jeden Agent-Prompt gehören
wörtlich diese Sätze:

> „Du arbeitest READ-ONLY — du änderst nichts, du berichtest.
> Prüfe JEDEN Fall deiner Checkliste einzeln und benenne ihn einzeln.
> Wenn du ‚die meisten' statt JEDEN prüfst, hast du die Aufgabe verfehlt.
> Melde je Befund: Datei:Zeile, was kaputt/inkonsistent ist, warum es gegen
> Ziel oder Manifest verstößt, und einen konkreten Fix-Vorschlag.
> Melde auch, was du geprüft und für GESUND befunden hast — sonst ist
> Schweigen nicht von Auslassung unterscheidbar."

### Die Dimensionen (je ein Agent)

| # | Dimension | Muss u. a. JEDEN Fall prüfen von |
|---|---|---|
| A1 | **Kern-Loop Karte→Moment** | Scan → Edition/Karte erkennen → Moment anlegen (Foto+Notiz) → Tagebuch/Feed → beide Modi (local/Supabase); Foto-Persistenz (`photoStorage`, upload-first) |
| A2 | **Spaces & Identität** | Space anlegen (couple UND friends), einladen/beitreten, Emoji/Avatar/Sammel-Emoji-Sync, Umbenennen, Verlassen; RLS-Erwartungen vs. Code |
| A3 | **Discover & Map-Loop** | Filter, kuratierte Ideen, Pilotstädte + „near me" überall, Map find→plan→done→memory→anonym bewerten; map-ready/map-failed-Wege |
| A4 | **Editions, Challenges, Rewards** | Weekly Challenge (annehmen→Moment→abschließen→Reward-Toast), Editions-Fortschritt, Bloom-Sprache, pendingReward-TTL |
| A5 | **Auth & Onboarding** | welcome→language→intro→sign-in (OTP!)→onboarding→invite; JEDER Fehlerweg (falscher Code, abgelaufen, offline, kein Template-Token) endet in einer Handlung, nie in einer Sackgasse |
| A6 | **Manifest-Compliance** | JEDE UI-Behauptung vs. tatsächliches Code-Verhalten (§1); Privacy-Versprechen vs. Datenfluss (§2); keine Druck-Mechanik (§3); genau EINE Primäraktion pro Screen-Zustand, PeakPlant-Verben (§5); Feel-Primitive statt Eigenbau (§6) |
| A7 | **Sprache & Ton** | JEDER sichtbare deutsche String: echte Umlaute, natürlicher warmer Ton, keine Denglisch-Brüche, EN/DE-Parität |

Skills nutzen: `feel-audit` (A6), `run-peakplant-mobile` (A1/A3-Logik headless),
`verify-peakplant` (Phase 3).

## Phase 2 — Verifizieren, DANN erst glauben

Der Hauptagent (Integrator) prüft **jede** Agent-Behauptung selbst im Code,
bevor er sie anfasst. Lektion aus früheren Läufen: Agents melden auch
Falsch-Positive („activated sei user-facing" — war es nicht) und übersehen
Zusammenhänge. Ein Befund ohne eigene Verifikation ist ein Gerücht.

Danach: Befunde priorisieren —
**P0** Loop bricht / Behauptung falsch / Datenverlust ·
**P1** verwirrend, unfertig, tot ·
**P2** Politur.

## Phase 3 — Fixes durch EINEN Integrator

- Nur der Hauptagent ändert Code. Subagents analysieren, niemals editieren.
- P0 zuerst, kleine thematische Commits, keine Rewrites, nichts anfassen, was
  nicht auf der Befundliste steht.
- Nach jedem Themenblock: `npx tsc --noEmit` + ESLint + `npx vitest run`
  (alles in `mobile/`) — grün, sonst sofort reparieren.

## Phase 4 — Abschluss

1. `verify-peakplant` komplett grün; Zahlen in den Report (z. B. „312/312").
2. Ehrliche Liste: verifiziert / nicht verifizierbar (Gerät nötig) / offen.
3. **Operator-Schritte pflegen:** alles, was nur Alicia kann (Supabase-Mail-
   Template mit `{{ .Token }}`, AASA/assetlinks auf peak-plant.com,
   expo-secure-store, EAS-Build + Gerätetest, Store-Privacy-Labels) als
   Schritt-für-Schritt-Anleitung — nie als „geht hier nicht".
4. Push, PR mit Zusammenfassung: gefixt / bewusst nicht gefixt (warum) / offen.

---

## Was die App KÖNNEN MUSS (die Messlatte für „fertig")

1. Karte scannen → Moment mit Foto+Notiz festhalten → im gemeinsamen Tagebuch
   sehen — in unter einer Minute, ohne Anleitung.
2. Einen Space als **Paar oder Freundeskreis** anlegen und eine zweite Person
   per Einladung hineinholen.
3. Eine Idee finden (Discover oder Map), sie planen, sie erleben, sie als
   Erinnerung festhalten — und optional NUR den Ort anonym bewerten.
4. Die Weekly Challenge in einer Woche natürlich abschließen und die Belohnung
   spüren.
5. Offline/ohne Supabase-Konfiguration sinnvoll funktionieren (lokaler Modus),
   ohne stillen Datenverlust.
6. Nirgendwo lügen: jede Privacy-/Status-/Erfolgs-Aussage in der UI ist im
   Code wahr.
