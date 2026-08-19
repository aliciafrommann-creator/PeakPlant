/**
 * Die Tageskarte — ein Foto und eine Notiz, einmal am Tag, je Person.
 *
 * ENTSCHEIDUNG (Alicia, 19.08.2026): „in Freundesgruppen und bei Partner-
 * Spaces jede Person ein Foto und eine Notiz am Tag … man klickt das Foto,
 * Anzeige dreht sich um, man sieht die Notiz." Und auf die Rückfrage, ob das
 * die bestehende Momente-Wand mit Tageslimit sei: **eigenständig, wie BeReal.**
 *
 * Eine Tageskarte ist deshalb KEIN Moment. Ein Moment hängt an einer Karte
 * oder einer Idee und kann jederzeit entstehen, beliebig oft. Eine Tageskarte
 * hängt an einem TAG und an einer PERSON. Beides nebeneinander ist Absicht:
 * Das eine bewahrt etwas Besonderes, das andere zeigt den gewöhnlichen Tag.
 *
 * DIE GRENZE, die vor dem ersten Zeichen Code stand (MANIFESTO §3):
 * „Einmal am Tag" ist ein ANGEBOT, keine Pflicht. Es gibt hier deshalb
 * bewusst NICHT: eine Serie, ein „du hast heute noch nicht", eine Zahl
 * verpasster Tage, eine Erinnerung mit Druck, einen Vergleich zwischen zwei
 * Menschen. Wer eines davon hinzufügt, baut die Mechanik ein, gegen die
 * dieses Produkt geschrieben ist — und nicht bloß eine Funktion.
 *
 * Diese Datei ist rein: kein React, keine Datenbank. Der Tag kommt von außen
 * herein, damit er in Tests festgehalten werden kann.
 */
import type { Daily } from './types';

/**
 * Der Tagesschlüssel `YYYY-MM-DD` aus einem Zeitpunkt — in ORTSZEIT.
 *
 * Absichtlich nicht UTC: Wer abends um 23 Uhr in Deutschland etwas ablegt,
 * legt es an DIESEM Abend ab, nicht am nächsten Tag. Der Fehler entsteht
 * lautlos und lässt sich später nicht mehr korrigieren, weil dann bereits
 * zwei Karten desselben Menschen an einem Tag stehen.
 */
export function tagesSchluessel(zeitpunkt: Date): string {
  const j = zeitpunkt.getFullYear();
  const m = String(zeitpunkt.getMonth() + 1).padStart(2, '0');
  const t = String(zeitpunkt.getDate()).padStart(2, '0');
  return `${j}-${m}-${t}`;
}

/** Die Tageskarte einer Person an einem Tag, oder `undefined`. */
export function karteVon(
  karten: readonly Daily[],
  autorId: string,
  tag: string,
): Daily | undefined {
  return karten.find((k) => k.authorId === autorId && k.day === tag);
}

/**
 * Die Karten eines Tages, sortiert: die eigene zuerst, dann die anderen in
 * der Reihenfolge, in der sie entstanden sind.
 *
 * Warum die eigene zuerst: Man soll sehen, ob man selbst schon etwas abgelegt
 * hat, OHNE dass die App danach fragen muss. Ein leerer erster Platz ist eine
 * Einladung; ein Satz „du hast heute noch nicht" wäre ein Vorwurf.
 */
export function tagesReihe(
  karten: readonly Daily[],
  tag: string,
  eigeneId: string,
): Daily[] {
  return karten
    .filter((k) => k.day === tag)
    .sort((a, b) => {
      if (a.authorId === eigeneId) return -1;
      if (b.authorId === eigeneId) return 1;
      return a.createdAt.localeCompare(b.createdAt);
    });
}

/**
 * Die Tage, an denen im Space etwas abgelegt wurde — neueste zuerst.
 * Für den Rückblick. Lücken sind Lücken und werden NICHT gefüllt: Ein Tag
 * ohne Karte ist kein Ereignis, über das die App etwas sagen müsste.
 */
export function tageMitKarten(karten: readonly Daily[]): string[] {
  return [...new Set(karten.map((k) => k.day))].sort().reverse();
}

/** Wie viele Zeichen eine Notiz auf der Rückseite tragen darf. */
export const NOTIZ_MAX = 240;

/**
 * Passt die Notiz auf die Rückseite?
 *
 * Alicia dazu: „bitte dann aber Schrift kleiner für Notiz, sonst passt nicht
 * rein." Die Schrift ist kleiner — aber eine Karte, die man umdreht, hat eine
 * feste Größe, und ein Text, der darüber hinausgeht, wird abgeschnitten. Die
 * Grenze steht deshalb in der Eingabe, nicht in der Anzeige: Lieber beim
 * Schreiben sehen, dass es knapp wird, als hinterher etwas Abgeschnittenes.
 */
export function notizPasst(text: string): boolean {
  return text.length <= NOTIZ_MAX;
}
