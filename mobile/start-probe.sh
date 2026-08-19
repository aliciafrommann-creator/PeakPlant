#!/usr/bin/env bash
#
# PeakPlant starten — hol dir den neuesten Stand und lauf los.
#
# WARUM ES DIESES SKRIPT GIBT (19.08.2026): An diesem Tag hat Alicia dreimal
# vergeblich versucht, den aktuellen Stand auf ihr Telefon zu bekommen. Jedes
# Mal lag es NICHT am Code, sondern daran, dass er nicht bei ihr ankam:
#
#   1. Sie war auf `main`, die Arbeit lag auf einem Branch.
#   2. `git pull` brach ab, weil eine erzeugte Datei lokal verändert war —
#      die Fehlermeldung stand mitten in hundert Zeilen npm-Ausgabe.
#   3. Die `.env` fehlte, also lief die App ohne Server und der Login war tot.
#
# Ihr Satz dazu: „die letzten Male hat der Code nie funktioniert." Sie hatte
# recht, und die Ursache war jedes Mal die Anleitung, nicht das Programm.
#
# Dieses Skript räumt alle drei Fallen selbst weg und sagt am Ende in vier
# Zeilen, woran es liegt, wenn doch etwas fehlt.
set -u

cd "$(dirname "$0")" || exit 1
WURZEL="$(git rev-parse --show-toplevel)"

echo ""
echo "  PeakPlant — Stand holen und starten"
echo "  ───────────────────────────────────"

# 1. Lokale Änderungen an erzeugten Dateien beiseitelegen, statt am Pull zu
#    scheitern. `git stash` wirft nichts weg: `git stash list` zeigt es, `git
#    stash pop` holt es zurück.
if [ -n "$(git -C "$WURZEL" status --porcelain)" ]; then
  echo "  · lokale Änderungen beiseitegelegt (git stash list zeigt sie)"
  git -C "$WURZEL" stash push -u -m "automatisch vor dem Start $(date +%H:%M)" >/dev/null 2>&1
fi

# 2. Auf main und den neuesten Stand.
git -C "$WURZEL" checkout main >/dev/null 2>&1
if ! git -C "$WURZEL" pull --ff-only origin main >/dev/null 2>&1; then
  echo "  ✗ Der Stand ließ sich nicht holen (Netz? Zugang?)."
  echo "    Schick mir diese Zeile, dann sehe ich nach."
  exit 1
fi

# 3. Die öffentlichen Server-Zugänge. Ohne sie läuft die App offline und der
#    Login ist tot — das war Falle 3.
[ -f .env ] || { cp .env.example .env && echo "  · .env aus der Vorlage angelegt"; }

# 4. Pakete nachziehen, aber nur wenn nötig: `npm ci` dauert Minuten.
INSTALLIERT="$(node -p "try{require('./node_modules/expo/package.json').version}catch(e){''}" 2>/dev/null)"
ERWARTET="$(node -p "require('./package.json').dependencies.expo.replace(/[^0-9.]/g,'')" 2>/dev/null)"
if [ -z "$INSTALLIERT" ] || [ "${INSTALLIERT%%.*}" != "${ERWARTET%%.*}" ]; then
  echo "  · Pakete werden nachgezogen — das dauert 2 bis 4 Minuten"
  npm install --no-audit --no-fund >/dev/null 2>&1 || {
    echo "  ✗ npm install ist gescheitert. Schick mir diese Zeile."
    exit 1
  }
  INSTALLIERT="$(node -p "require('./node_modules/expo/package.json').version")"
fi

echo ""
echo "  Branch      $(git -C "$WURZEL" branch --show-current)"
echo "  Stand       $(git -C "$WURZEL" log -1 --format='%h  %s' | cut -c1-58)"
echo "  .env        $([ -s .env ] && echo "vorhanden" || echo "FEHLT")"
echo "  Expo        $INSTALLIERT"
echo ""
echo "  Alles bereit. Gleich erscheint ein QR-Code —"
echo "  mit der KAMERA-App scannen (nicht in Expo Go suchen)."
echo "  Telefon und Mac müssen im selben WLAN sein."
echo ""

echo "  (Start ausgelassen — Prüflauf)"
