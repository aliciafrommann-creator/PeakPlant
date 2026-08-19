import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  tagesSchluessel,
  karteVon,
  tagesReihe,
  tageMitKarten,
  notizPasst,
  NOTIZ_MAX,
} from './daily';
import type { Daily } from './types';

const karte = (autorId: string, tag: string, createdAt = '2026-08-19T10:00:00.000Z'): Daily => ({
  id: `${autorId}-${tag}`,
  spaceId: 's1',
  authorId: autorId,
  authorName: autorId,
  day: tag,
  note: '',
  createdAt,
  updatedAt: createdAt,
});

describe('Die Tageskarte', () => {
  it('der Tag richtet sich nach der ORTSZEIT, nicht nach UTC', () => {
    // DER TEUERSTE FEHLER, DEN DIESE DATEI VERHINDERN SOLL. Wer abends um
    // 23 Uhr in Deutschland etwas ablegt, legt es an DIESEM Abend ab. In UTC
    // wäre es schon der nächste Tag — und dann stünden zwei Karten desselben
    // Menschen an einem Tag, was sich hinterher nicht mehr reparieren lässt.
    const spaetAbends = new Date(2026, 7, 19, 23, 30); // 19.08.2026, 23:30 Ortszeit
    expect(tagesSchluessel(spaetAbends)).toBe('2026-08-19');

    const kurzNachMitternacht = new Date(2026, 7, 20, 0, 15);
    expect(tagesSchluessel(kurzNachMitternacht)).toBe('2026-08-20');
  });

  it('einstellige Monate und Tage bekommen ihre Null', () => {
    expect(tagesSchluessel(new Date(2026, 0, 5, 12, 0))).toBe('2026-01-05');
  });

  it('findet die Karte einer Person an einem Tag', () => {
    const alle = [karte('a', '2026-08-19'), karte('b', '2026-08-19'), karte('a', '2026-08-18')];
    expect(karteVon(alle, 'a', '2026-08-19')?.id).toBe('a-2026-08-19');
    expect(karteVon(alle, 'c', '2026-08-19')).toBeUndefined();
  });

  it('die eigene Karte steht zuerst', () => {
    // Man soll sehen, ob man selbst schon etwas abgelegt hat, OHNE dass die
    // App danach fragen muss. Ein leerer erster Platz ist eine Einladung.
    const alle = [
      karte('b', '2026-08-19', '2026-08-19T08:00:00.000Z'),
      karte('c', '2026-08-19', '2026-08-19T09:00:00.000Z'),
      karte('ich', '2026-08-19', '2026-08-19T20:00:00.000Z'),
    ];
    expect(tagesReihe(alle, '2026-08-19', 'ich').map((k) => k.authorId)).toEqual([
      'ich',
      'b',
      'c',
    ]);
  });

  it('Karten anderer Tage kommen nicht in die Reihe', () => {
    const alle = [karte('a', '2026-08-19'), karte('a', '2026-08-18')];
    expect(tagesReihe(alle, '2026-08-19', 'a')).toHaveLength(1);
  });

  it('Tage ohne Karte werden NICHT aufgefüllt', () => {
    // Eine Lücke ist eine Lücke. Sie sichtbar zu machen wäre der erste
    // Schritt zu einer Serie — und damit zu dem Druck, den MANIFESTO §3
    // ausschließt.
    const alle = [karte('a', '2026-08-19'), karte('a', '2026-08-15')];
    expect(tageMitKarten(alle)).toEqual(['2026-08-19', '2026-08-15']);
  });

  it('die Notiz hat eine Grenze, damit die Rückseite sie trägt', () => {
    expect(notizPasst('x'.repeat(NOTIZ_MAX))).toBe(true);
    expect(notizPasst('x'.repeat(NOTIZ_MAX + 1))).toBe(false);
  });
});

describe('Die Tageskarte macht keinen Druck (MANIFESTO §3)', () => {
  /**
   * Der Wächter für die Grenze, die VOR dem ersten Zeichen Code stand.
   * „Einmal am Tag" ist ein Angebot. Eine Serie, ein „du hast heute noch
   * nicht", eine Zahl verpasster Tage — jedes davon macht aus einer
   * Einladung eine Pflicht, und zwar unbemerkt, weil es sich wie eine
   * Verbesserung anfühlt.
   */
  const verboten = [
    'streak',
    'serie',
    'missed',
    'verpasst',
    'noch nicht',
    "haven't yet",
    'reminder',
    'erinnere',
    'in a row',
    'am stück',
  ];

  it('keine Druck-Mechanik in der Tageskarten-Logik', () => {
    const quelle = fs.readFileSync(path.resolve(__dirname, 'daily.ts'), 'utf8');
    // Der Kopfkommentar NENNT die verbotenen Dinge, um sie auszuschließen —
    // deshalb wird nur der Code unterhalb geprüft.
    const code = quelle.slice(quelle.lastIndexOf(' */') + 3);
    const funde = verboten.filter((w) => new RegExp(w, 'i').test(code));
    expect(funde, `Druck-Mechanik in lib/daily.ts: ${funde.join(', ')}`).toEqual([]);
  });
});
