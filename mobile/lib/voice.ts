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
  /** „in eurem Space" — ohne das „privat" davor. */
  inYourSpace: Phrase;
  /** Reiter „Momente": Kicker, Titel, leerer Zustand. */
  momentsKicker: Phrase;
  momentsEmptyTitle: Phrase;
  momentsEmptyHint: Phrase;
  /** Sammlung: die Zeile über den Editionen. */
  editionsLead: Phrase;
  /** Der Satz unter dem Scanner. */
  scanHint: Phrase;
  /** Challenges: der Kicker und der Sinn. */
  challengeKicker: Phrase;
  challengePurpose: Phrase;
  /** Space-Einstellungen: das Sammelstück. */
  collectibleLabel: Phrase;
  collectibleHint: Phrase;
  /** Was beim Löschen eines Moments passiert. */
  memoryDeleteWarning: Phrase;
  /** Push: die zwei erlaubten Anlässe. */
  pushNewMoment: Phrase;

  // ── Ladefehler ────────────────────────────────────────────────────────
  // Diese Sätze sind Zusagen („deine Sachen sind sicher"). Ein Versprechen,
  // das eine zweite Person mitmeint, die es nicht gibt, ist genau die Sorte
  // Satz, bei der die falsche Anrede am meisten wiegt (MANIFESTO §1).
  /** Startbildschirm: die Momente-Wand lädt nicht. */
  loadMomentsFailedHint: Phrase;
  /** Sammlung: der Stand einer Edition lässt sich nicht lesen. */
  editionProgressFailed: Phrase;
  /** Rückblick: lädt nicht. */
  storyLoadFailedTitle: Phrase;
  storyLoadFailedHint: Phrase;
  /** Editions-Tagebuch: lädt nicht. */
  diaryLoadFailedTitle: Phrase;
  diaryLoadFailedHint: Phrase;
  /** Gemerkte Ideen: laden nicht. */
  savedIdeasLoadFailed: Phrase;
  /** Entdecken: keine Idee geholt. */
  discoverConnectionHint: Phrase;
  /** Challenge: der Fortschritt lässt sich nicht lesen. */
  challengeProgressFailed: Phrase;

  // ── Überschriften und Wege ────────────────────────────────────────────
  /** Die Fläche über dem Editions-Tagebuch. */
  diaryLabel: Phrase;
  /** Vorlesehinweis auf dem Weg zu allen Momenten. */
  /** Vorlesehinweis auf dem Weg zu allen Momenten. */
  openAllMoments: Phrase;
  /** Der Name des Startreiters. */
  homeTabTitle: Phrase;
  /** Profil: der Weg zu den Ritualen. */
  ritualsLink: Phrase;
  /** Entdecken: Kicker und Frage über dem Ideen-Generator. */
  discoverKicker: Phrase;
  discoverQuestion: Phrase;
  /** Entdecken: der Weg zu einer Idee. */
  toDoTogetherLabel: Phrase;
  /** Idee: die eigene Bewertung. */
  ownFeedbackNote: Phrase;
  /** Idee: der Satz über dem Knopf. */
  saveMakePlanKeep: Phrase;
  /** Idee/Liste: die Knöpfe am fertigen Plan. */
  viewYourMemory: Phrase;
  preserveYourMemory: Phrase;
  openYourPlan: Phrase;
  savedToYourList: Phrase;
  /** Startbildschirm: die Einladung, eine Notiz zu schreiben. */
  writeNoteInvite: Phrase;

  // ── Sätze, die vom Tagebuch des Space sprechen ────────────────────────
  /** Sammlung: warum ein Deck nichts freischaltet. */
  deckOptionalLead: Phrase;
  /** Editions-Tagebuch, noch leer: wie ein Moment hineinkommt. */
  addToDiaryHint: Phrase;
  /** Plus: was frei bleibt. */
  plusFreeNote: Phrase;
  /** Rituale sind ausgeschaltet. */
  ritualsOffHint: Phrase;
  /** Orts-Feedback: die Grenze zum Tagebuch. */
  feedbackPrivacyNote: Phrase;
  /**
   * Die Challenge-Zeile auf dem Startbildschirm.
   *
   * Die einzige Wendung mit einem Platzhalter: `{n}` wird an der Stelle
   * ersetzt. Ein Satz mit Zahl lässt sich nicht in zwei Hälften zerlegen,
   * ohne dass eine der beiden Sprachen schief wird.
   */
  challengeCountLine: Phrase;

  // ── Moment teilen und Challenge ───────────────────────────────────────
  /** Teilen: die Challenge ist noch nicht offen. */
  shareNotOpenYet: Phrase;
  /** Teilen: die Verbindung hat nicht getragen. */
  shareFailedNote: Phrase;
  /** Teilen zurücknehmen. */
  shareRevokeNote: Phrase;
  /** Challenge: was der Fortschritt zählt. */
  challengeProgressNote: Phrase;
  /** Challenge: das Abzeichen ist verdient. */
  challengeEarned: Phrase;

  // ── Orte-Reiter ───────────────────────────────────────────────────────
  /** Bestätigung nach einer eigenen Bewertung. */
  placeDoneNote: Phrase;
  /** Woher die private Bewertung kommt. */
  privateFeedbackSource: Phrase;
  /** Was passiert, wenn noch keine eigene Bewertung da ist. */
  privateFeedbackEmpty: Phrase;
  /** Der Haken an einem schon erlebten Ort. */
  placeAlreadyDone: Phrase;
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
  inYourSpace: { en: 'in your space', de: 'in eurem Space' },
  momentsKicker: { en: 'YOUR MOMENTS', de: 'EURE MOMENTE' },
  momentsEmptyTitle: { en: 'your story starts here.', de: 'eure Geschichte beginnt hier.' },
  momentsEmptyHint: {
    en: 'live a card together, scan its QR — and the moment lands here, with your photo and your words.',
    de: 'erlebt eine Karte zusammen, scannt ihren QR-Code — und der Moment landet hier, mit eurem Foto und euren Worten.',
  },
  editionsLead: {
    en: 'each edition is a printed deck. everything else in the app works without one.',
    de: 'jede Edition ist ein gedrucktes Deck. Alles andere in der App geht auch ohne — eure Momente, Ideen und Orte.',
  },
  scanHint: {
    en: 'scan the QR on a card to open the guided evening behind it.',
    de: 'scannt den QR-Code auf einer Karte, dann öffnet sich der geführte Abend dahinter — gemeinsam erlebt, hier festgehalten.',
  },
  challengeKicker: { en: 'YOUR CHALLENGES', de: 'EURE CHALLENGES' },
  challengePurpose: {
    en: 'a gentle reason to do something — no score, no ranking.',
    de: 'ein sanfter Anlass, gemeinsam etwas zu tun — keine Wertung, keine Rangliste.',
  },
  collectibleLabel: { en: 'YOUR COLLECTIBLE', de: 'EUER SAMMELZEICHEN' },
  collectibleHint: {
    en: 'you earn one every time a challenge is complete.',
    de: 'ihr verdient eins, jedes Mal wenn ihr eine Challenge zusammen abschließt.',
  },
  memoryDeleteWarning: {
    en: 'this takes it out of the diary for both of you.',
    de: 'Das nimmt ihn für euch beide aus dem Tagebuch.',
  },
  pushNewMoment: { en: 'There is a new moment in your space.', de: 'In eurem Space liegt ein neuer Moment.' },
  loadMomentsFailedHint: {
    en: 'your memories are safe — this is just a connection hiccup.',
    de: 'eure Erinnerungen sind sicher — wir versuchen es gleich nochmal.',
  },
  editionProgressFailed: {
    en: 'we could not read how far you are. your cards are safe — tap to try again.',
    de: 'wir konnten euren Stand nicht lesen. Eure Karten sind sicher — tippen zum erneut Versuchen.',
  },
  storyLoadFailedTitle: {
    en: "couldn't load your story.",
    de: 'eure Geschichte konnte nicht geladen werden.',
  },
  storyLoadFailedHint: {
    en: 'everything you kept is safe — this was the connection.',
    de: 'alles, was ihr behalten habt, ist sicher — das war die Verbindung.',
  },
  diaryLoadFailedTitle: {
    en: "couldn't load your diary.",
    de: 'euer Tagebuch konnte nicht geladen werden.',
  },
  diaryLoadFailedHint: {
    en: 'your moments are safe — this is just a connection hiccup.',
    de: 'eure Momente sind sicher — das ist nur ein Verbindungsproblem.',
  },
  savedIdeasLoadFailed: {
    en: 'we could not load your saved ideas.',
    de: 'wir konnten eure gemerkten Ideen nicht laden.',
  },
  discoverConnectionHint: {
    en: 'that was the connection, not your filters — your saved ideas are safe.',
    de: 'das war die Verbindung, nicht eure Filter — eure gemerkten Ideen sind sicher.',
  },
  challengeProgressFailed: {
    en: 'we could not read your progress — nothing of yours is lost.',
    de: 'wir konnten euren Stand nicht lesen — nichts von euch ist weg.',
  },
  diaryLabel: { en: 'YOUR DIARY', de: 'EUER TAGEBUCH' },
  openAllMoments: { en: 'Open all your moments', de: 'Alle eure Momente öffnen' },
  homeTabTitle: { en: 'Together', de: 'Zusammen' },
  ritualsLink: { en: 'your rituals', de: 'eure Rituale' },
  discoverKicker: {
    en: 'SURPRISE YOURSELVES · DATE GENERATOR',
    de: 'LASST EUCH ÜBERRASCHEN · DATE GENERATOR',
  },
  discoverQuestion: { en: 'what could you do\ntogether?', de: 'was könntet\nihr zusammen tun?' },
  toDoTogetherLabel: { en: 'TO DO TOGETHER', de: 'GEMEINSAM TUN' },
  ownFeedbackNote: {
    en: 'from your own feedback — private on this device',
    de: 'aus eurem eigenen Feedback – privat auf diesem Gerät',
  },
  saveMakePlanKeep: {
    en: 'save it, make a plan, then keep the memory when it becomes yours.',
    de: 'Merkt es euch, macht einen Plan und bewahrt danach euren Moment.',
  },
  viewYourMemory: { en: 'VIEW YOUR MEMORY', de: 'EUREN MOMENT ANSEHEN' },
  preserveYourMemory: { en: 'PRESERVE YOUR MEMORY', de: 'EUREN MOMENT FESTHALTEN' },
  openYourPlan: { en: 'OPEN YOUR PLAN', de: 'EUREN PLAN ÖFFNEN' },
  savedToYourList: { en: 'saved ✓ · your list', de: 'gemerkt ✓ · eure Liste' },
  deckOptionalLead: {
    en: 'everything in PeakPlant works without a deck — ideas, places, challenges, your diary. an edition is the printed version: real cards on seed paper, to pull together and scan.',
    de: 'alles in PeakPlant geht ohne Deck — Ideen, Orte, Challenges, euer Tagebuch. Eine Edition ist die gedruckte Fassung: echte Karten auf Saatpapier, zum gemeinsamen Ziehen und Scannen.',
  },
  addToDiaryHint: {
    en: 'complete a card, then scan its QR code to add it to your diary.',
    de: 'Schließt eine Karte ab, dann scannt ihren QR-Code, um sie eurem Tagebuch hinzuzufügen.',
  },
  plusFreeNote: {
    en: 'Plus is not available yet — everything in your diary stays free.',
    de: 'Plus gibt es noch nicht zu kaufen — alles in eurem Tagebuch bleibt frei.',
  },
  ritualsOffHint: {
    en: 'turn them on in Settings to start keeping the moments you return to.',
    de: 'schalte sie in den Einstellungen ein, um eure wiederkehrenden Momente zu sammeln.',
  },
  feedbackPrivacyNote: {
    en: 'your diary memory stays separate and private. anonymous place sharing only happens when you turn it on above.',
    de: 'Eure Tagebucherinnerung bleibt getrennt und privat. Anonymes Orte-Teilen passiert nur, wenn du es oben aktivierst.',
  },
  challengeCountLine: { en: '{n} together', de: '{n} zusammen' },
  shareNotOpenYet: {
    en: "this week's challenge isn't open for sharing yet. your moment stays as it is.",
    de: 'die Challenge dieser Woche ist noch nicht zum Teilen offen. Euer Moment bleibt, wie er ist.',
  },
  shareFailedNote: {
    en: 'that was the connection — nothing changed, and your moment is untouched.',
    de: 'das war die Verbindung — es hat sich nichts geändert, und euer Moment ist unberührt.',
  },
  shareRevokeNote: {
    en: 'it disappears for everyone. your moment stays exactly where it is.',
    de: 'es verschwindet für alle. Euer Moment bleibt genau da, wo er ist.',
  },
  challengeProgressNote: {
    en: 'progress counts moments you preserve after joining. use photo/note when you actually did it together. leaving keeps every moment — only the challenge goes away.',
    de: 'Fortschritt zählt Momente, die ihr nach dem Beitritt bewahrt. Nutzt Foto/Notiz, wenn ihr es wirklich zusammen gemacht habt. Verlassen behält jeden Moment — nur die Challenge verschwindet.',
  },
  challengeEarned: { en: 'earned. lovely work, together.', de: 'verdient. wunderbare Arbeit, gemeinsam.' },
  placeDoneNote: { en: 'lovely — done together ♥', de: 'schön — zusammen erlebt ♥' },
  privateFeedbackSource: {
    en: 'from your own private feedback on this device — not a public community rating.',
    de: 'Aus eurem privaten Feedback auf diesem Gerät – keine öffentliche Community-Bewertung.',
  },
  privateFeedbackEmpty: {
    en: 'after you complete an idea here, your rating and practical tip will appear privately on this device.',
    de: 'Wenn ihr hier eine Idee erlebt habt, erscheinen eure Bewertung und euer praktischer Tipp privat auf diesem Gerät.',
  },
  placeAlreadyDone: { en: '✓ you’ve done this together', de: '✓ ihr habt das zusammen gemacht' },
  writeNoteInvite: {
    en: 'leave a note for them',
    de: 'lass ihnen eine Notiz da',
  },
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
  inYourSpace: { en: 'in your space', de: 'in deinem Space' },
  momentsKicker: { en: 'YOUR MOMENTS', de: 'DEINE MOMENTE' },
  momentsEmptyTitle: { en: 'your story starts here.', de: 'deine Geschichte beginnt hier.' },
  momentsEmptyHint: {
    en: 'live a card, scan its QR — and the moment lands here, with your photo and your words.',
    de: 'erlebe eine Karte, scanne ihren QR-Code — und der Moment landet hier, mit deinem Foto und deinen Worten.',
  },
  editionsLead: {
    en: 'each edition is a printed deck. everything else in the app works without one.',
    de: 'jede Edition ist ein gedrucktes Deck. Alles andere in der App geht auch ohne — deine Momente, Ideen und Orte.',
  },
  scanHint: {
    en: 'scan the QR on a card to open the guided evening behind it.',
    de: 'scanne den QR-Code auf einer Karte, dann öffnet sich der geführte Abend dahinter — erlebt und hier festgehalten.',
  },
  challengeKicker: { en: 'YOUR CHALLENGES', de: 'DEINE CHALLENGES' },
  challengePurpose: {
    en: 'a gentle reason to do something — no score, no ranking.',
    de: 'ein sanfter Anlass, etwas zu tun — keine Wertung, keine Rangliste.',
  },
  collectibleLabel: { en: 'YOUR COLLECTIBLE', de: 'DEIN SAMMELZEICHEN' },
  collectibleHint: {
    en: 'you earn one every time a challenge is complete.',
    de: 'du verdienst eins, jedes Mal wenn du eine Challenge abschließt.',
  },
  memoryDeleteWarning: {
    en: 'this takes it out of the diary.',
    de: 'Das nimmt ihn aus dem Tagebuch.',
  },
  pushNewMoment: { en: 'There is a new moment in your space.', de: 'In deinem Space liegt ein neuer Moment.' },
  loadMomentsFailedHint: {
    en: 'your memories are safe — this is just a connection hiccup.',
    de: 'deine Erinnerungen sind sicher — wir versuchen es gleich nochmal.',
  },
  editionProgressFailed: {
    en: 'we could not read how far you are. your cards are safe — tap to try again.',
    de: 'wir konnten deinen Stand nicht lesen. Deine Karten sind sicher — tippen zum erneut Versuchen.',
  },
  storyLoadFailedTitle: {
    en: "couldn't load your story.",
    de: 'deine Geschichte konnte nicht geladen werden.',
  },
  storyLoadFailedHint: {
    en: 'everything you kept is safe — this was the connection.',
    de: 'alles, was du behalten hast, ist sicher — das war die Verbindung.',
  },
  diaryLoadFailedTitle: {
    en: "couldn't load your diary.",
    de: 'dein Tagebuch konnte nicht geladen werden.',
  },
  diaryLoadFailedHint: {
    en: 'your moments are safe — this is just a connection hiccup.',
    de: 'deine Momente sind sicher — das ist nur ein Verbindungsproblem.',
  },
  savedIdeasLoadFailed: {
    en: 'we could not load your saved ideas.',
    de: 'wir konnten deine gemerkten Ideen nicht laden.',
  },
  discoverConnectionHint: {
    en: 'that was the connection, not your filters — your saved ideas are safe.',
    de: 'das war die Verbindung, nicht deine Filter — deine gemerkten Ideen sind sicher.',
  },
  challengeProgressFailed: {
    en: 'we could not read your progress — nothing of yours is lost.',
    de: 'wir konnten deinen Stand nicht lesen — nichts von dir ist weg.',
  },
  diaryLabel: { en: 'YOUR DIARY', de: 'DEIN TAGEBUCH' },
  openAllMoments: { en: 'Open all your moments', de: 'Alle deine Momente öffnen' },
  homeTabTitle: { en: 'Today', de: 'Heute' },
  ritualsLink: { en: 'your rituals', de: 'deine Rituale' },
  discoverKicker: {
    en: 'SURPRISE YOURSELF · IDEA GENERATOR',
    de: 'LASS DICH ÜBERRASCHEN · IDEEN-GENERATOR',
  },
  discoverQuestion: { en: 'what could you do\ntoday?', de: 'was könntest\ndu heute tun?' },
  toDoTogetherLabel: { en: 'TO DO', de: 'ETWAS TUN' },
  ownFeedbackNote: {
    en: 'from your own feedback — private on this device',
    de: 'aus deinem eigenen Feedback – privat auf diesem Gerät',
  },
  saveMakePlanKeep: {
    en: 'save it, make a plan, then keep the memory when it becomes yours.',
    de: 'Merk es dir, mach einen Plan und bewahre danach deinen Moment.',
  },
  viewYourMemory: { en: 'VIEW YOUR MEMORY', de: 'DEINEN MOMENT ANSEHEN' },
  preserveYourMemory: { en: 'PRESERVE YOUR MEMORY', de: 'DEINEN MOMENT FESTHALTEN' },
  openYourPlan: { en: 'OPEN YOUR PLAN', de: 'DEINEN PLAN ÖFFNEN' },
  savedToYourList: { en: 'saved ✓ · your list', de: 'gemerkt ✓ · deine Liste' },
  deckOptionalLead: {
    en: 'everything in PeakPlant works without a deck — ideas, places, challenges, your diary. an edition is the printed version: real cards on seed paper, to pull and scan.',
    de: 'alles in PeakPlant geht ohne Deck — Ideen, Orte, Challenges, dein Tagebuch. Eine Edition ist die gedruckte Fassung: echte Karten auf Saatpapier, zum Ziehen und Scannen.',
  },
  addToDiaryHint: {
    en: 'complete a card, then scan its QR code to add it to your diary.',
    de: 'Schließ eine Karte ab, dann scann ihren QR-Code, um sie deinem Tagebuch hinzuzufügen.',
  },
  plusFreeNote: {
    en: 'Plus is not available yet — everything in your diary stays free.',
    de: 'Plus gibt es noch nicht zu kaufen — alles in deinem Tagebuch bleibt frei.',
  },
  ritualsOffHint: {
    en: 'turn them on in Settings to start keeping the moments you return to.',
    de: 'schalte sie in den Einstellungen ein, um deine wiederkehrenden Momente zu sammeln.',
  },
  feedbackPrivacyNote: {
    en: 'your diary memory stays separate and private. anonymous place sharing only happens when you turn it on above.',
    de: 'Deine Tagebucherinnerung bleibt getrennt und privat. Anonymes Orte-Teilen passiert nur, wenn du es oben aktivierst.',
  },
  challengeCountLine: { en: '{n}', de: '{n}' },
  shareNotOpenYet: {
    en: "this week's challenge isn't open for sharing yet. your moment stays as it is.",
    de: 'die Challenge dieser Woche ist noch nicht zum Teilen offen. Dein Moment bleibt, wie er ist.',
  },
  shareFailedNote: {
    en: 'that was the connection — nothing changed, and your moment is untouched.',
    de: 'das war die Verbindung — es hat sich nichts geändert, und dein Moment ist unberührt.',
  },
  shareRevokeNote: {
    en: 'it disappears for everyone. your moment stays exactly where it is.',
    de: 'es verschwindet für alle. Dein Moment bleibt genau da, wo er ist.',
  },
  challengeProgressNote: {
    en: 'progress counts moments you preserve after joining. use photo/note when you actually did it. leaving keeps every moment — only the challenge goes away.',
    de: 'Fortschritt zählt Momente, die du nach dem Beitritt bewahrst. Nutz Foto/Notiz, wenn du es wirklich gemacht hast. Verlassen behält jeden Moment — nur die Challenge verschwindet.',
  },
  challengeEarned: { en: 'earned. lovely work.', de: 'verdient. wunderbare Arbeit.' },
  placeDoneNote: { en: 'lovely — done ♥', de: 'schön — erlebt ♥' },
  privateFeedbackSource: {
    en: 'from your own private feedback on this device — not a public community rating.',
    de: 'Aus deinem privaten Feedback auf diesem Gerät – keine öffentliche Community-Bewertung.',
  },
  privateFeedbackEmpty: {
    en: 'after you complete an idea here, your rating and practical tip will appear privately on this device.',
    de: 'Wenn du hier eine Idee erlebt hast, erscheinen deine Bewertung und dein praktischer Tipp privat auf diesem Gerät.',
  },
  placeAlreadyDone: { en: '✓ you’ve done this', de: '✓ du hast das gemacht' },
  writeNoteInvite: {
    en: 'leave a note for yourself',
    de: 'lass dir selbst eine Notiz da',
  },
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
