/**
 * Rendert die Batik-Farbwelten aus `constants/dyes.ts` zu PNG-Bildern.
 *
 * WARUM ÜBERHAUPT BILDER: Die Färbung entsteht aus überlagerten Farbfeldern
 * plus einer Störung. Im Browser macht das CSS mit `radial-gradient` und
 * `feTurbulence`; React Native kann von sich aus KEINES von beidem. Die
 * Alternative wären drei zusätzliche Pakete (react-native-svg,
 * expo-linear-gradient, expo-blur) plus Rechenzeit auf jedem Bild.
 *
 * Also einmal rendern statt tausendmal rechnen. Das Rezept in
 * `constants/dyes.ts` bleibt die Wahrheit; dieses Skript ist nur der Drucker.
 * Neu laufen lassen, wenn ein Rezept sich ändert:
 *
 *     node scripts/renderDyes.mjs
 *
 * Deterministisch: gleicher Eingang, gleiches Bild. Deshalb steht das Ergebnis
 * im Git und niemand muss das Skript ausführen, um die App zu bauen.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
const WURZEL = path.resolve(HIER, '..');
const ZIEL = path.join(WURZEL, 'assets', 'dyes');

// Klein gerendert und in der App hochskaliert: Eine Färbung hat keine harten
// Kanten, also sieht man die Auflösung nicht — die Bundle-Größe schon. Bei
// 360×240 waren die dreizehn Bilder zusammen 1,5 MB, hier sind es unter 200 KB.
const B = 200;
const H = 140;
// Die Störung erzeugt Entropie, und Entropie kostet im PNG. Auf Stufen von 4
// gerundet fällt die Datei auf ein Sechstel — sichtbar ist der Unterschied auf
// einem weichen Verlauf nicht.
const STUFE = 4;

// ── Der sichere Bereich ────────────────────────────────────────────────────
// DER WICHTIGSTE TEIL DIESER DATEI. Eine Färbung ist ein BILD, kein flacher
// Ton: Die Lichter sind heller als der Grund, die Störung hebt und senkt
// zusätzlich. Schrift sitzt aber nicht auf dem Grund, sondern auf dem BILD.
//
// Am 19.08.2026 nachgemessen: Der Grund trug seine Tinte überall mit 5–13:1,
// die hellsten Punkte der Bilder aber nur mit 1,55–3,94:1. ZWÖLF von dreizehn
// Welten wären an ihrer schlechtesten Stelle durchgefallen — und kein Test
// hätte es gemerkt, weil alle nur gegen den Grundton rechneten. Genau die
// Sorte Fehler, die den Kontrast-Durchgang fünf Runden gekostet hat.
//
// Also wird jeder Punkt, der zu weit läuft, zum Grund zurückgezogen — nur so
// weit wie nötig. Der Farbton bleibt, die Helligkeit kommt in den Bereich, in
// dem die gewählte Tinte trägt. Das ist der Unterschied zwischen „sieht schön
// aus" und „kann man lesen".
const KANAL = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const LUM = ([r, g, b]) => 0.2126 * KANAL(r) + 0.7152 * KANAL(g) + 0.0722 * KANAL(b);
const KONTRAST = (a, b) => {
  const la = LUM(a), lb = LUM(b);
  const [h, d] = la >= lb ? [la, lb] : [lb, la];
  return (h + 0.05) / (d + 0.05);
};
const TINTE_DUNKEL = [0x1a, 0x1a, 0x1a];
const TINTE_HELL = [0xfa, 0xf7, 0xf0];
// Etwas über 4,5, damit das Runden auf Farbstufen die Grenze nicht wieder
// unterschreitet.
const ZIEL_KONTRAST = 4.7;

function inDenBereich(farbe, grund, tinte) {
  if (KONTRAST(tinte, farbe) >= ZIEL_KONTRAST) return farbe;
  // Zum Grund mischen, bis es trägt. Der Grund selbst besteht — das hält
  // `lib/dyes.test.ts` fest —, also endet die Suche immer.
  let lo = 0, hi = 1;
  for (let i = 0; i < 18; i++) {
    const m = (lo + hi) / 2;
    const probe = farbe.map((c, k) => c + (grund[k] - c) * m);
    if (KONTRAST(tinte, probe) >= ZIEL_KONTRAST) hi = m; else lo = m;
  }
  return farbe.map((c, k) => c + (grund[k] - c) * hi);
}

// ── Rezepte aus constants/dyes.ts lesen ────────────────────────────────────
// Bewusst per Textauswertung statt Import: Die Datei ist TypeScript, und ein
// Build-Schritt nur fürs Drucken wäre eine Abhängigkeit zu viel.
function rezepte() {
  const quelle = fs.readFileSync(path.join(WURZEL, 'constants', 'dyes.ts'), 'utf8');
  const out = [];
  const re = /'(edition-\d+)':\s*\{[\s\S]*?ground:\s*'(#[0-9A-Fa-f]{6})'[\s\S]*?lights:\s*\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(quelle))) {
    out.push({ id: m[1], ground: m[2], lights: [...m[3].matchAll(/#[0-9A-Fa-f]{6}/g)].map((x) => x[0]) });
  }
  const haus = quelle.match(/HOUSE_DYE[\s\S]*?ground:\s*'(#[0-9A-Fa-f]{6})'[\s\S]*?lights:\s*\[([^\]]*)\]/);
  if (haus) out.push({ id: 'house', ground: haus[1], lights: [...haus[2].matchAll(/#[0-9A-Fa-f]{6}/g)].map((x) => x[0]) });
  return out;
}

/**
 * Der Fingerabdruck eines Rezepts. Er wird als `tEXt`-Stück ins PNG geschrieben,
 * damit `lib/dyes.test.ts` merkt, wenn jemand ein Rezept ändert und das Drucken
 * vergisst. Vorher BEHAUPTETE der Test das nur: Ein Prüfer hat am 19.08.2026
 * einen Grundton auf Knallgrün gedreht, ohne neu zu drucken — alles blieb grün.
 */
export const fingerabdruck = (rez) =>
  crypto.createHash('sha256').update(`${rez.ground}|${rez.lights.join(',')}`).digest('hex').slice(0, 16);

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// ── Störung: Wert-Rauschen über vier Oktaven ───────────────────────────────
// Das ist der Unterschied zwischen „Verlauf" und „gefärbtem Stoff". Ein
// glatter Verlauf sieht sofort nach Software aus.
function prng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function gitter(seed, n) {
  const r = prng(seed);
  return Array.from({ length: n * n }, () => r());
}
const glatt = (t) => t * t * (3 - 2 * t);
function wertRauschen(g, n, x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const tx = glatt(x - xi), ty = glatt(y - yi);
  const at = (a, b) => g[((b % n) + n) % n * n + (((a % n) + n) % n)];
  const o = at(xi, yi), p = at(xi + 1, yi), q = at(xi, yi + 1), s = at(xi + 1, yi + 1);
  return (o * (1 - tx) + p * tx) * (1 - ty) + (q * (1 - tx) + s * tx) * ty;
}
function fbm(seed, x, y) {
  let wert = 0, amp = 0.5, frq = 1, summe = 0;
  for (let o = 0; o < 4; o++) {
    wert += amp * wertRauschen(gitter(seed + o * 7919, 16), 16, x * frq, y * frq);
    summe += amp; amp *= 0.5; frq *= 2.1;
  }
  return wert / summe;
}

// ── Ein Bild ───────────────────────────────────────────────────────────────
function male({ ground, lights }, seed) {
  const g = hex(ground);
  const L = lights.map(hex);
  // Welche Tinte auf diesem Grund liest — dieselbe Wahl wie `editionInk()`
  // in der App. Danach richtet sich der sichere Bereich.
  const tinte = KONTRAST(TINTE_DUNKEL, g) >= KONTRAST(TINTE_HELL, g) ? TINTE_DUNKEL : TINTE_HELL;
  // Die Lichter sitzen an festen Stellen, aber je Welt leicht versetzt —
  // „immer etwas anders" (Alicia, 19.08.2026), nie zufällig unterschiedlich.
  const r = prng(seed);
  const orte = [[0.82, 0.14], [0.14, 0.28], [0.9, 0.8], [0.3, 0.92]]
    .map(([x, y]) => [x + (r() - 0.5) * 0.16, y + (r() - 0.5) * 0.16]);
  const weiten = orte.map(() => 0.52 + r() * 0.22);

  const px = Buffer.alloc(B * H * 3);
  const rauschGitter = Array.from({ length: 4 }, (_, o) => gitter(seed + 101 + o * 7919, 16));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < B; x++) {
      const u = x / B, v = y / H;
      let cr = g[0], cg = g[1], cb = g[2];
      for (let i = 0; i < L.length && i < orte.length; i++) {
        const dx = (u - orte[i][0]) * 1.35, dy = v - orte[i][1];
        const d = Math.sqrt(dx * dx + dy * dy) / weiten[i];
        if (d < 1) {
          const a = Math.pow(1 - d, 1.7);
          cr += (L[i][0] - cr) * a; cg += (L[i][1] - cg) * a; cb += (L[i][2] - cb) * a;
        }
      }
      // Störung: hebt und senkt die Helligkeit wolkig, nicht körnig.
      let n = 0, amp = 0.5, frq = 3.5, summe = 0;
      for (let o = 0; o < 4; o++) {
        n += amp * wertRauschen(rauschGitter[o], 16, u * frq * 4, v * frq * 4);
        summe += amp; amp *= 0.5; frq *= 2.1;
      }
      const f = 1 + ((n / summe) - 0.5) * 0.22;
      const roh = [cr * f, cg * f, cb * f].map((c) => Math.max(0, Math.min(255, c)));
      const sicher = inDenBereich(roh, g, tinte);
      const k = (c) => {
        const v = Math.max(0, Math.min(255, Math.round(c)));
        return Math.min(255, Math.round(v / STUFE) * STUFE);
      };
      const i3 = (y * B + x) * 3;
      px[i3] = k(sicher[0]); px[i3 + 1] = k(sicher[1]); px[i3 + 2] = k(sicher[2]);
    }
  }
  return px;
}

// ── PNG schreiben (ohne Fremdpaket) ────────────────────────────────────────
function png(px, abdruck) {
  const roh = Buffer.alloc((B * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    roh[y * (B * 3 + 1)] = 0;
    px.copy(roh, y * (B * 3 + 1) + 1, y * B * 3, (y + 1) * B * 3);
  }
  const stueck = (typ, daten) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(daten.length);
    const koerper = Buffer.concat([Buffer.from(typ, 'ascii'), daten]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(koerper) >>> 0);
    return Buffer.concat([len, koerper, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(B, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    stueck('IHDR', ihdr),
    // Der Fingerabdruck des Rezepts, aus dem dieses Bild entstanden ist.
    stueck('tEXt', Buffer.concat([Buffer.from('rezept\0', 'latin1'), Buffer.from(abdruck, 'latin1')])),
    stueck('IDAT', zlib.deflateSync(roh, { level: 9 })),
    stueck('IEND', Buffer.alloc(0)),
  ]);
}
let TAB = null;
function crc32(buf) {
  if (!TAB) {
    TAB = new Int32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; TAB[n] = c; }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TAB[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}

fs.mkdirSync(ZIEL, { recursive: true });
let gesamt = 0;
for (const [i, rez] of rezepte().entries()) {
  const datei = path.join(ZIEL, `${rez.id}.png`);
  const daten = png(male(rez, 1000 + i * 137), fingerabdruck(rez));
  fs.writeFileSync(datei, daten);
  gesamt += daten.length;
  console.log(`${rez.id}.png  ${(daten.length / 1024).toFixed(0)} KB`);
}
console.log(`\n${(gesamt / 1024).toFixed(0)} KB gesamt`);
