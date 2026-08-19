/**
 * Auskunft und Mitnahme — Artikel 15 und 20 DSGVO.
 *
 * WARUM ES DAS GIBT: Die App konnte ein Konto LÖSCHEN, aber nicht sagen, was
 * sie über einen Menschen weiß. Das ist die Hälfte der Betroffenenrechte, und
 * es war die unangenehmere Hälfte, die fehlte: Löschen ist ein Knopf, Auskunft
 * ist Arbeit. Artikel 15 gibt das Recht zu erfahren, WAS gespeichert ist;
 * Artikel 20 das Recht, es in einem „strukturierten, gängigen und
 * maschinenlesbaren Format" MITZUNEHMEN. Deshalb JSON und kein PDF.
 *
 * DIESE DATEI IST REIN. Sie holt nichts und schreibt nichts — sie bekommt die
 * Daten und formt daraus das Paket. So lässt sie sich ohne Gerät prüfen, und
 * die Frage „ist wirklich alles drin?" ist ein Test statt einer Behauptung.
 *
 * DIE EHRLICHKEITS-ENTSCHEIDUNG (MANIFESTO §1): Ein Export, der „deine Daten"
 * heißt und die Fotos stillschweigend weglässt, ist eine Falschaussage in
 * Dateiform. Fotos sind Binärdateien und liegen nicht im JSON. Das Paket sagt
 * das deshalb SELBST — in `hinweise`, im Klartext, an erster Stelle.
 */
import type {
  Space,
  SpaceMember,
  Memory,
  PartnerNote,
  SavedDate,
  DateFeedback,
} from './types';

/** Was die App über EINEN Space weiß, aus Sicht des fragenden Menschen. */
export interface SpaceExport {
  space: Space;
  mitglieder: SpaceMember[];
  momente: Memory[];
  notizen: PartnerNote[];
  gemerkteIdeen: SavedDate[];
  bewertungen: DateFeedback[];
}

export interface ExportInput {
  userId: string;
  email: string | null;
  name: string | null;
  /** Wann das Paket erstellt wurde. Wird hereingegeben, nie hier erzeugt. */
  erstelltAm: string;
  spaces: SpaceExport[];
}

export interface DataExport {
  format: 'peakplant-datenauskunft';
  version: 1;
  erstelltAm: string;
  person: { userId: string; email: string | null; name: string | null };
  hinweise: string[];
  spaces: SpaceExport[];
  zusammenfassung: {
    spaces: number;
    momente: number;
    notizen: number;
    gemerkteIdeen: number;
    bewertungen: number;
    fotosNichtEnthalten: number;
  };
}

/**
 * Die Sätze, die das Paket über sich selbst sagt.
 *
 * Sie stehen hier als Funktion und nicht als Zeichenkette im Bildschirm, damit
 * ein Test sie halten kann. Genau dieser Fehler ist bei den Beispielkarten
 * schon einmal passiert: Der Hinweistext stand im JSX, man konnte ihn löschen,
 * ohne dass ein Test rot wurde — und die Dokumentation behauptete trotzdem, er
 * sei gesichert.
 */
export function exportHinweise(fotos: number, geteilteSpaces: number): string[] {
  const h: string[] = [];
  h.push(
    fotos > 0
      ? `FOTOS SIND NICHT IN DIESER DATEI. Sie sind Bilddateien und liegen nicht im JSON. ${fotos} Moment${fotos === 1 ? '' : 'e'} in diesem Paket verweis${fotos === 1 ? 't' : 'en'} auf ein Foto; die Bilder selbst bekommst du über die Adresse in der Datenschutzerklärung.`
      : 'FOTOS: In diesem Paket ist kein Moment mit Foto. Wären welche dabei, stünden hier nur die Verweise — Bilddateien liegen nicht im JSON.',
  );
  if (geteilteSpaces > 0) {
    // anrede-ok: Dieser Satz entsteht NUR, wenn `geteilteSpaces > 0` — also
    // wenn es die zweite Person nachweislich gibt. In einem Solo-Space wird
    // er nie gebaut; das hält der Test „benennt geteilte Spaces als geteilt".
    h.push(
      `GETEILTE SPACES: ${geteilteSpaces} dieser Spaces gehört dir nicht allein. Was dort steht, habt ihr gemeinsam festgehalten — es ist deshalb auch hier, betrifft aber ebenso die andere Person. Löschst du dein Konto, bleibt das Gemeinsame bei ihr; nur dein Name kommt davon ab.`,
    );
  }
  h.push(
    'VOLLSTÄNDIGKEIT: Dieses Paket enthält, was die App unter deinem Konto führt. Was bei Dienstleistern zusätzlich anfällt (Zugriffsprotokolle beim Hosting, Zahlungsdaten beim Zahlungsanbieter), steht in der Datenschutzerklärung und ist dort gesondert anzufragen.',
  );
  return h;
}

/** Baut das Auskunftspaket. Reine Funktion, keine Seiteneffekte. */
export function buildDataExport(input: ExportInput): DataExport {
  const zaehle = <T,>(w: (s: SpaceExport) => T[]) =>
    input.spaces.reduce((n, s) => n + w(s).length, 0);

  const fotos = input.spaces.reduce(
    (n, s) => n + s.momente.filter((m) => !!m.photoUri).length,
    0,
  );
  const geteilt = input.spaces.filter((s) => s.mitglieder.length > 1).length;

  return {
    format: 'peakplant-datenauskunft',
    version: 1,
    erstelltAm: input.erstelltAm,
    person: { userId: input.userId, email: input.email, name: input.name },
    hinweise: exportHinweise(fotos, geteilt),
    spaces: input.spaces,
    zusammenfassung: {
      spaces: input.spaces.length,
      momente: zaehle((s) => s.momente),
      notizen: zaehle((s) => s.notizen),
      gemerkteIdeen: zaehle((s) => s.gemerkteIdeen),
      bewertungen: zaehle((s) => s.bewertungen),
      fotosNichtEnthalten: fotos,
    },
  };
}

/** Der Dateiname. Ohne Doppelpunkte, damit ihn jedes Dateisystem annimmt. */
export function exportDateiname(erstelltAm: string): string {
  return `peakplant-datenauskunft-${erstelltAm.slice(0, 10)}.json`;
}
