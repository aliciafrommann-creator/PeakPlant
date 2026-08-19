import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildDataExport, exportHinweise, exportDateiname, type ExportInput } from './dataExport';

const leererSpace = (id: string, mitglieder: number) => ({
  space: { id, name: 's', type: 'couple', createdAt: 'x', updatedAt: 'x' } as never,
  mitglieder: Array.from({ length: mitglieder }, (_, i) => ({ id: `m${i}` }) as never),
  momente: [],
  notizen: [],
  gemerkteIdeen: [],
  bewertungen: [],
});

const basis: ExportInput = {
  userId: 'u1',
  email: 'a@b.de',
  name: 'Alicia',
  erstelltAm: '2026-08-19T12:00:00.000Z',
  spaces: [],
};

describe('Datenauskunft (Art. 15/20 DSGVO)', () => {
  it('zählt, was drin ist — und die Zahlen stimmen mit dem Inhalt überein', () => {
    // Eine Zusammenfassung, die etwas anderes sagt als der Inhalt, ist
    // schlimmer als keine: Sie sieht aus wie eine Prüfung.
    const s = leererSpace('s1', 1);
    s.momente = [{ id: 'm1' }, { id: 'm2' }] as never;
    s.notizen = [{ id: 'n1' }] as never;
    const e = buildDataExport({ ...basis, spaces: [s] });
    expect(e.zusammenfassung.spaces).toBe(e.spaces.length);
    expect(e.zusammenfassung.momente).toBe(2);
    expect(e.zusammenfassung.notizen).toBe(1);
  });

  it('SAGT, dass Fotos nicht enthalten sind — und zwar immer', () => {
    // DER WICHTIGSTE TEST HIER. Ein Export, der „deine Daten" heißt und die
    // Fotos stillschweigend weglässt, ist eine Falschaussage in Dateiform
    // (MANIFESTO §1). Der Hinweis muss in BEIDEN Fällen dastehen: mit Fotos
    // und ohne. Ohne die zweite Hälfte könnte jemand den Hinweis für eine
    // Fehlermeldung halten statt für eine Eigenschaft des Formats.
    for (const anzahl of [0, 1, 7]) {
      const s = leererSpace('s1', 1);
      s.momente = Array.from({ length: anzahl }, (_, i) => ({
        id: `m${i}`,
        photoUri: 'file://x.jpg',
      })) as never;
      const e = buildDataExport({ ...basis, spaces: [s] });
      expect(e.hinweise[0], `bei ${anzahl} Fotos`).toMatch(/FOTOS/);
      expect(e.zusammenfassung.fotosNichtEnthalten).toBe(anzahl);
    }
  });

  it('benennt geteilte Spaces als geteilt', () => {
    const allein = buildDataExport({ ...basis, spaces: [leererSpace('s1', 1)] });
    expect(allein.hinweise.some((h) => h.startsWith('GETEILTE'))).toBe(false);

    const geteilt = buildDataExport({ ...basis, spaces: [leererSpace('s1', 2)] });
    expect(geteilt.hinweise.some((h) => h.startsWith('GETEILTE'))).toBe(true);
  });

  it('sagt immer, wo die Auskunft aufhört', () => {
    // Ein Paket, das so tut, als sei es vollständig, verhindert die Nachfrage,
    // die ein Mensch stellen müsste.
    const e = buildDataExport(basis);
    expect(e.hinweise.some((h) => h.startsWith('VOLLSTÄNDIGKEIT'))).toBe(true);
  });

  it('erfindet keinen Zeitpunkt', () => {
    // Der Zeitstempel kommt von außen. Eine Datei, die sich ihr eigenes Datum
    // gibt, lässt sich nicht reproduzierbar prüfen.
    const e = buildDataExport(basis);
    expect(e.erstelltAm).toBe(basis.erstelltAm);
  });

  it('der Dateiname trägt kein Zeichen, an dem ein Dateisystem scheitert', () => {
    const n = exportDateiname('2026-08-19T12:00:00.000Z');
    expect(n).toBe('peakplant-datenauskunft-2026-08-19.json');
    expect(n).not.toMatch(/[:/\\?*"<>|]/);
  });

  it('das Paket überlebt den Weg durch JSON', () => {
    // Es geht als Datei hinaus. Was sich nicht serialisieren lässt, ist beim
    // Menschen nicht angekommen.
    const s = leererSpace('s1', 2);
    s.momente = [{ id: 'm1', note: 'ä ö ü ß — „quotes"', photoUri: 'file://x' }] as never;
    const e = buildDataExport({ ...basis, spaces: [s] });
    const zurueck = JSON.parse(JSON.stringify(e));
    expect(zurueck).toEqual(e);
    expect(zurueck.spaces[0].momente[0].note).toContain('ß');
  });

  it('jeder Hinweis ist ein ganzer Satz, kein Stichwort', () => {
    const e = buildDataExport({ ...basis, spaces: [leererSpace('s1', 2)] });
    for (const h of e.hinweise) {
      expect(h.length, h).toBeGreaterThan(60);
      expect(h.trim().endsWith('.'), h).toBe(true);
    }
  });

  it('der Hinweistext steht in lib, nicht im Bildschirm', () => {
    // Bei den Beispielkarten stand der Hinweis einmal direkt im JSX: Man
    // konnte den ganzen Block löschen, ohne dass ein Test rot wurde, und die
    // Dokumentation behauptete trotzdem, er sei gesichert. Deshalb hier
    // ausdrücklich: Wer den Text in den Bildschirm zurückzieht, wird rot.
    const bildschirm = fs.readFileSync(
      path.resolve(__dirname, '..', 'app', 'account.tsx'),
      'utf8',
    );
    expect(bildschirm).not.toMatch(/FOTOS SIND NICHT/);
    expect(typeof exportHinweise(1, 1)[0]).toBe('string');
  });
});
