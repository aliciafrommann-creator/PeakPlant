import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Der Wächter gegen Code, den niemand erreicht.
 *
 * WARUM ES DIESE DATEI GIBT: Am 19.08.2026 fragte Alicia, ob „alle neuen
 * Funktionen integriert" sind. Die Tests waren grün — aber grün heißt nur
 * „funktioniert, wenn es aufgerufen wird", nicht „wird aufgerufen". Eine
 * Nachrechnung vom Router aus fand **achtzehn** Dateien, die von keinem
 * Bildschirm der App aus erreichbar sind. Darunter das komplette Push-System,
 * dessen Regeln in `AGENTS.md` als lebende Logik beschrieben waren.
 *
 * Das ist der teuerste stille Fehler dieses Projekts: Code, der aussieht wie
 * ein Feature, in der Dokumentation steht wie ein Feature, in den Tests grün
 * ist wie ein Feature — und nie läuft.
 *
 * WIE GEPRÜFT WIRD: Vom Router aus (`app/**` ist bei expo-router jeder
 * Einstieg) den relativen Importen folgen. Was übrig bleibt, ist unerreichbar.
 *
 * WAS DAS NICHT SIEHT: dynamische Importe, Aliase, Importe aus
 * `node_modules`. Ein Modul, das nur über `require(variable)` geladen wird,
 * gilt hier fälschlich als tot — dann gehört es mit BEGRÜNDUNG in die Liste
 * unten, nicht der Test abgeschaltet.
 */
const WURZEL = path.resolve(__dirname, '..');

/**
 * Bekannt unerreichbar — jede Zeile mit Grund. Die Liste ist eine SCHULD,
 * kein Freibrief: Sie soll kürzer werden.
 */
const BEKANNT: Record<string, string> = {
  // Bewusster Schalter, dokumentiert in lib/monetization/billing/index.ts:
  // RevenueCat wird per Checkliste eingeschaltet, nicht per Import.
  'lib/monetization/billing/revenuecat.ts': 'dokumentierter Opt-in-Schalter',
  'lib/monetization/index.ts': 'Sammel-Export, Aufrufer importieren direkt',
  'lib/monetization/usage.ts': 'gehört zum schlafenden Kaufweg',

  // NICHT eingebaut, obwohl AGENTS.md es wie eingebaut beschrieb (19.08.2026).
  // Die Regeln in policy.ts sind getestet und richtig — sie werden nur von
  // niemandem aufgerufen. Erst verdrahten, dann hier streichen.
  'lib/notifications/index.ts': 'Push ist gebaut, aber nicht verdrahtet',
  'lib/notifications/expo.ts': 'Push ist gebaut, aber nicht verdrahtet',
  'lib/notifications/null.ts': 'Push ist gebaut, aber nicht verdrahtet',
  'lib/notifications/policy.ts': 'Push ist gebaut, aber nicht verdrahtet',
  'lib/notifications/register.ts': 'Push ist gebaut, aber nicht verdrahtet',
  'lib/notifications/types.ts': 'Push ist gebaut, aber nicht verdrahtet',

  // Kein Aufrufer. MANIFESTO §2 verbietet Analytics ohnehin — das hier ist
  // die Null-Fassung. Entweder verdrahten oder löschen.
  'lib/analytics/index.ts': 'ohne Aufrufer',
  'lib/analytics/events.ts': 'ohne Aufrufer',
  'lib/analytics/null.ts': 'ohne Aufrufer',
  'lib/ai/anthropic.ts': 'ohne Aufrufer',

  // Fünf abgelöste Oberflächen-Bausteine. Es gibt jeweils etwas Neueres, das
  // dasselbe tut und live ist.
  'components/ui/Button.tsx': 'abgelöst — Bildschirme nutzen PressableScale',
  'components/ui/Surface.tsx': 'abgelöst',
  'components/memory/MemoryListItem.tsx': 'abgelöst',
  'components/together/PlaceItem.tsx': 'abgelöst',
  'components/together/TogetherCard.tsx': 'abgelöst',
};

function dateien(d: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.expo', 'dist', '.git'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) dateien(p, out);
    else if (/\.tsx?$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}

function aufloesen(von: string, ziel: string): string | null {
  const t = path.resolve(path.dirname(von), ziel);
  for (const k of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    if (fs.existsSync(t + k) && fs.statSync(t + k).isFile()) return t + k;
  }
  return null;
}

function unerreichbar(): string[] {
  const alle = ['app', 'lib', 'components', 'constants'].flatMap((d) =>
    dateien(path.join(WURZEL, d)),
  );
  const kanten = new Map<string, string[]>();
  for (const f of alle) {
    const quelle = fs.readFileSync(f, 'utf8');
    const ziele: string[] = [];
    for (const m of quelle.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
      const t = aufloesen(f, m[1]);
      if (t) ziele.push(t);
    }
    kanten.set(f, ziele);
  }
  // Bei expo-router ist jede Datei unter app/ ein Einstiegspunkt.
  const wurzeln = alle.filter((f) => f.startsWith(path.join(WURZEL, 'app')));
  const erreicht = new Set(wurzeln);
  const stapel = [...wurzeln];
  while (stapel.length) {
    for (const t of kanten.get(stapel.pop()!) ?? []) {
      if (!erreicht.has(t)) {
        erreicht.add(t);
        stapel.push(t);
      }
    }
  }
  return alle.filter((f) => !erreicht.has(f)).map((f) => path.relative(WURZEL, f));
}

describe('Erreichbarkeit — kein Feature, das niemand aufruft', () => {
  it('der Router erreicht überhaupt etwas (sonst prüft der Test nichts)', () => {
    const alle = ['app', 'lib', 'components'].flatMap((d) => dateien(path.join(WURZEL, d)));
    expect(alle.length).toBeGreaterThan(100);
    expect(unerreichbar().length).toBeLessThan(alle.length / 2);
  });

  it('keine NEUE unerreichbare Datei', () => {
    const neu = unerreichbar().filter((f) => !BEKANNT[f]);
    expect(
      neu,
      `unerreichbar und nicht begründet — entweder verdrahten, löschen oder mit Grund eintragen:\n  ${neu.join('\n  ')}`,
    ).toEqual([]);
  });

  it('die Schuldenliste ist aktuell — Erledigtes wird abgeschrieben', () => {
    // Ohne diese Richtung wird die Liste zum Freibrief: Wer eine Datei
    // verdrahtet oder löscht, aber den Eintrag stehen lässt, deckt damit
    // stillschweigend die nächste.
    const jetzt = new Set(unerreichbar());
    const veraltet = Object.keys(BEKANNT).filter((f) => !jetzt.has(f));
    expect(
      veraltet,
      `steht als unerreichbar in der Liste, ist es aber nicht mehr — Eintrag streichen: ${veraltet.join(', ')}`,
    ).toEqual([]);
  });
});
