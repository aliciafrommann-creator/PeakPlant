/**
 * Wie die App über den Space spricht — „ihr" oder „du".
 *
 * WARUM ES DAS GIBT: Bis zum 18.08.2026 kannte die Oberfläche nur eine
 * Anrede. Über dreißig Stellen sagten „privat in eurem Space", „das ist euer
 * Space", „was zwischen euch gewachsen ist" — auch dann, wenn dort genau ein
 * Mensch saß. Für einen Solo-Space ist das keine Kleinigkeit: Es ist die App,
 * die eine zweite Person behauptet, die es nicht gibt (MANIFESTO §1), und bei
 * jedem Satz daran erinnert (§3).
 *
 * Statt an jeder Stelle ein `type === 'solo' ? … : …` stehen die Formulierungen
 * hier zusammen. Zwei Gründe: Ein Satzpaar an einer Stelle lässt sich lesen und
 * beurteilen; und wer eine neue Fläche baut, findet die Anrede, statt sie neu
 * zu erfinden.
 *
 * Englisch braucht die Unterscheidung meist nicht („your space" stimmt für
 * beide) — deshalb ist dort oft derselbe Satz hinterlegt. Wo Englisch doch
 * zwei Menschen behauptet („between you two"), steht auch dort eine eigene
 * Fassung.
 */
import type { SpaceType } from './types';

export interface Phrase {
  en: string;
  de: string;
}

export interface Voice {
  /** „privat in eurem Space" — der meistbenutzte Satz der App. */
  privateToSpace: Phrase;
  /** Ersatzname, wenn der Space keinen hat. */
  spaceFallbackName: Phrase;
  /** Die Begrüßung auf der leeren Momente-Wand. */
  thisIsYourSpace: Phrase;
  /** Der Satz darunter. */
  keepWhatMatters: Phrase;
  /** Der Weg ins Rückblick-Kapitel. */
  whatGrew: Phrase;
  /** Ein gemerkter Ort/Plan. */
  plannedForSpace: Phrase;
  /** Die Überschrift der eigenen Orte. */
  aPlaceOfYours: Phrase;
  /** Notiz-Hinweis. */
  noteStaysHere: Phrase;
  /** Kicker über dem Rückblick. */
  ourStoryKicker: Phrase;
  /** Rückblick, noch leer. */
  storyStartsHere: Phrase;
  storyStartsHint: Phrase;
  /** Kurzform auf dem Sammlung-Reiter. */
  privateBadge: Phrase;
  /** An wen eine Notiz geht, wenn der Space keinen Namen hat. */
  noteAddresseeFallback: Phrase;
  /** Was das Löschen einer Notiz bedeutet. */
  noteDeleteWarning: Phrase;
  /** Der ruhige Satz über einer Fragekarte. */
  cardQuietQuestion: Phrase;
  /** Der ruhige Satz über einer Handlungs-/Datekarte. */
  cardQuietAct: Phrase;
  /** Bestätigung beim Merken einer Idee. */
  savedToSpace: Phrase;
  /** Unter dem Foto beim Festhalten eines Moments. */
  staysPrivate: Phrase;
  /** Fußnote unter den gezählten Dingen im Rückblick. */
  countedFromWhatYouKept: Phrase;
  /** Was beim Teilen einer Zeile NICHT rausgeht. */
  sharingBoundary: Phrase;
  /** Über der eigenen Bewertung eines Ortes. */
  spaceRecommends: Phrase;
}

const GETEILT: Voice = {
  privateToSpace: { en: 'private to your space', de: 'privat in eurem Space' },
  spaceFallbackName: { en: 'your space', de: 'euer Space' },
  thisIsYourSpace: { en: 'this is your space.', de: 'das ist euer Space.' },
  keepWhatMatters: {
    en: 'keep what should stay — a photo, a few words. it stays private to your space.',
    de: 'haltet fest, was euch bleiben soll — ein Foto, ein paar Worte. Es bleibt privat in eurem Space.',
  },
  whatGrew: { en: 'what grew between you', de: 'was zwischen euch gewachsen ist' },
  plannedForSpace: { en: '◷ planned for your space', de: '◷ für euren Space geplant' },
  aPlaceOfYours: { en: 'a place that is yours', de: 'ein Ort, der euch gehört' },
  noteStaysHere: {
    en: 'nothing written yet. what you write stays here — in your space.',
    de: 'noch nichts geschrieben. Was du schreibst, bleibt hier — in eurem Space.',
  },
  ourStoryKicker: { en: 'OUR STORY', de: 'EURE GESCHICHTE' },
  storyStartsHere: { en: 'your story starts here.', de: 'eure Geschichte beginnt hier.' },
  storyStartsHint: {
    en: 'once you keep your first moment, this is where you will see what grew between you.',
    de: 'sobald ihr euren ersten Moment festhaltet, seht ihr hier, was zwischen euch gewachsen ist.',
  },
  privateBadge: { en: 'private to your space', de: 'privat — nur für euch' },
  noteAddresseeFallback: { en: 'partner', de: 'partner' },
  noteDeleteWarning: {
    en: 'it is gone for everyone in your space.',
    de: 'sie ist dann für alle in eurem Space weg.',
  },
  cardQuietQuestion: {
    en: 'Take your time. You can pause, skip or return to this card whenever it feels right.',
    de: 'Lasst euch Zeit. Ihr könnt jederzeit pausieren, überspringen oder später zurückkommen.',
  },
  cardQuietAct: {
    en: 'Choose what feels right for both of you. You can pause, change or stop at any time.',
    de: 'Macht, was sich für euch richtig anfühlt. Ihr könnt jederzeit pausieren, ändern oder aufhören.',
  },
  savedToSpace: { en: 'saved to your space ♥', de: 'in eurem Space gemerkt ♥' },
  staysPrivate: { en: 'stays private to your space.', de: 'bleibt privat in eurem Space.' },
  countedFromWhatYouKept: {
    en: 'all of this is counted from what you kept — nothing guessed, nothing leaves your space.',
    de: 'all das ist aus dem gezählt, was ihr festgehalten habt — nichts geraten, nichts verlässt euren Space.',
  },
  sharingBoundary: {
    en: 'only this line goes out. your note, your photo, your names and your space stay here.',
    de: 'nur diese Zeile geht raus. Eure Notiz, euer Foto, eure Namen und euer Space bleiben hier.',
  },
  spaceRecommends: { en: 'YOUR SPACE RECOMMENDS THIS', de: 'EUER SPACE EMPFIEHLT DIESEN ORT' },
};

const ALLEIN: Voice = {
  privateToSpace: { en: 'private to your space', de: 'privat in deinem Space' },
  spaceFallbackName: { en: 'your space', de: 'dein Space' },
  thisIsYourSpace: { en: 'this is your space.', de: 'das ist dein Space.' },
  keepWhatMatters: {
    en: 'keep what should stay — a photo, a few words. it stays private to your space.',
    de: 'halte fest, was dir bleiben soll — ein Foto, ein paar Worte. Es bleibt privat in deinem Space.',
  },
  whatGrew: { en: 'what grew here', de: 'was hier gewachsen ist' },
  plannedForSpace: { en: '◷ planned for your space', de: '◷ für deinen Space geplant' },
  aPlaceOfYours: { en: 'a place that is yours', de: 'ein Ort, der dir gehört' },
  noteStaysHere: {
    en: 'nothing written yet. what you write stays here — in your space.',
    de: 'noch nichts geschrieben. Was du schreibst, bleibt hier — in deinem Space.',
  },
  ourStoryKicker: { en: 'YOUR STORY', de: 'DEINE GESCHICHTE' },
  storyStartsHere: { en: 'your story starts here.', de: 'deine Geschichte beginnt hier.' },
  storyStartsHint: {
    en: 'once you keep your first moment, this is where you will see what grew.',
    de: 'sobald du deinen ersten Moment festhältst, siehst du hier, was gewachsen ist.',
  },
  privateBadge: { en: 'private to your space', de: 'privat — nur für dich' },
  // Eine Notiz an sich selbst ist kein Widerspruch — der Brief an das eigene
  // Zukunfts-Ich steht sogar im Kartenmaterial. Nur die Anrede stimmt nicht.
  noteAddresseeFallback: { en: 'a note to yourself', de: 'eine Notiz an dich' },
  noteDeleteWarning: { en: 'it is gone.', de: 'sie ist dann weg.' },
  // Die Karten selbst sind für zwei geschrieben — das ist das gedruckte
  // Produkt und wird hier nicht umgedichtet. Der Rahmen der App darf aber
  // keine zweite Person behaupten, die es in diesem Space nicht gibt.
  cardQuietQuestion: {
    en: 'Take your time. You can pause, skip or return to this card whenever it feels right.',
    de: 'Lass dir Zeit. Du kannst jederzeit pausieren, überspringen oder später zurückkommen.',
  },
  cardQuietAct: {
    en: 'Choose what feels right. You can pause, change or stop at any time.',
    de: 'Mach, was sich richtig anfühlt. Du kannst jederzeit pausieren, ändern oder aufhören.',
  },
  savedToSpace: { en: 'saved to your space ♥', de: 'in deinem Space gemerkt ♥' },
  staysPrivate: { en: 'stays private to your space.', de: 'bleibt privat in deinem Space.' },
  countedFromWhatYouKept: {
    en: 'all of this is counted from what you kept — nothing guessed, nothing leaves your space.',
    de: 'all das ist aus dem gezählt, was du festgehalten hast — nichts geraten, nichts verlässt deinen Space.',
  },
  sharingBoundary: {
    en: 'only this line goes out. your note, your photo, your name and your space stay here.',
    de: 'nur diese Zeile geht raus. Deine Notiz, dein Foto, dein Name und dein Space bleiben hier.',
  },
  spaceRecommends: { en: 'YOUR SPACE RECOMMENDS THIS', de: 'DU EMPFIEHLST DIESEN ORT' },
};

/**
 * Die Anrede für diesen Space.
 *
 * `undefined` (noch nicht geladen) ergibt bewusst die geteilte Fassung: Sie
 * ist die alte Vorgabe, und ein kurzer Moment mit „eurem" ist harmloser als
 * ein Flackern zwischen zwei Anreden bei jedem Laden.
 */
export function voice(type: SpaceType | undefined): Voice {
  return type === 'solo' ? ALLEIN : GETEILT;
}
