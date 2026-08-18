import type { MomentCard } from '../types';

/**
 * Eine Beispielkarte je Edition.
 *
 * WARUM ES DAS GIBT (Alicia, 18.08.2026): Die Editionsseite zeigte Karten als
 * nummerierte Umrisse. Wer kein Deck hat — und das sind bis Oktober alle —
 * sah zwölf Rechtecke und keinen einzigen Satz davon, was auf einer Karte
 * eigentlich steht. „Jede Karte bringt einen geführten Abend in die App" ist
 * eine Behauptung; eine lesbare Karte ist ein Beleg.
 *
 * Das widerspricht Entscheidung 024 NICHT: Der Kauf bringt weiterhin mehr
 * Inhalt. Bei den erschienenen Editionen ist die Beispielkarte eine der
 * zwanzig — neunzehn bleiben. Bei den angekündigten Editionen ist sie das
 * einzige, was es überhaupt schon gibt, und sagt das auch.
 *
 * Ehrlichkeitsgrenze: Eine Beispielkarte wird als solche beschriftet. Sie
 * täuscht nie vor, freigeschaltet zu sein — „versiegelt" ist eine
 * Produktgrenze und keine Verschlüsselung (siehe AGENTS.md, Entscheidung 024),
 * und eine Karte, die man liest, ohne sie zu besitzen, darf nicht so aussehen
 * wie eine, die man sich verdient hat.
 */

/**
 * Die Karten für die angekündigten Editionen 04–12.
 *
 * Sie sind ECHTE Karten, kein Marketing-Text: gleiche Struktur, gleicher Ton,
 * gleicher Aufbau (etwas tun · darüber sprechen · festhalten). Wenn eine
 * Edition erscheint, wandert die Karte unverändert in ihre Datei; die Nummer 1
 * ist dafür freigehalten.
 */
export const SAMPLE_CARDS: MomentCard[] = [
  {
    id: 'card-e04-s',
    number: 1,
    prompt: 'One hour, both phones in another room.',
    type: 'action',
    group: 'date',
    edition: 'edition-04',
    status: 'sealed',
    content: {
      title: 'The Hour Nobody Interrupts',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'Put both phones in another room. Not face down on the table — in another room, door closed.\n\n' +
            'Set a timer on something that is not a phone, or simply agree on an hour and let it be approximate.\n\n' +
            'Then do nothing in particular. Sit, talk, cook, lie on the floor. The point is not the activity. The point is that for one hour, nothing can arrive.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'When did you last have someone’s undivided attention?',
            'What do you reach for your phone to avoid?',
            'What did the first ten minutes feel like — and the last ten?',
            'Would you want this again, and how often?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Afterwards, write one line each:',
          bullets: [
            'what you noticed that you would have missed',
            'the hardest minute',
            'whether the hour felt long or short',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-e05-s',
    number: 1,
    prompt: 'Watch the same thing at the same time, apart.',
    type: 'action',
    group: 'date',
    edition: 'edition-05',
    status: 'sealed',
    content: {
      title: 'Same Window, Different City',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'Pick a time you are both free. Pick one thing to watch, read or listen to — a film, an album, the same chapter.\n\n' +
            'Start it at the same second. Stay on a call if you like, muted, or do not — being alone together is the point.\n\n' +
            'Distance is usually described as what is missing. This is one hour where it is not.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'Which moment did you both react to?',
            'What is easier at a distance than it would be in the same room?',
            'What do you save up to tell each other, and what gets lost?',
            'What would make the next weeks feel less far?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'a photo out of each of your windows, taken at the same minute',
            'what you watched',
            'one line each about the moment you both noticed',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-e06-s',
    number: 1,
    prompt: 'Name the small thing that always lands.',
    type: 'question',
    group: 'question',
    edition: 'edition-06',
    status: 'sealed',
    content: {
      title: 'The Small Thing That Always Lands',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'This is not a test of who notices more. If nothing comes to mind straight away, that is normal — the small things are small precisely because nobody announces them.',
        },
        {
          heading: 'Make a little moment out of it',
          body:
            'Sit somewhere without a screen. Each of you thinks of the smallest thing the other does that reliably makes the day better.\n\n' +
            'Not the grand gesture. The tea that appears. The message at the right hour. The way they take the heavy bag without asking.\n\n' +
            'Say it out loud, specifically. Then do it for each other this week, on purpose.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'Which small thing did you not know was noticed?',
            'Which one have you stopped doing without deciding to?',
            'What would you like more of that costs almost nothing?',
            'What do you do that you think lands, but might not?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Write both answers down, exactly as they were said:',
          bullets: [
            'the small thing they named',
            'the small thing you named',
            'the date — so you can read it again in a year',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-e07-s',
    number: 1,
    prompt: 'An evening on the thing only you care about.',
    type: 'action',
    group: 'act',
    edition: 'edition-07',
    status: 'sealed',
    content: {
      title: 'The Thing That Is Only Yours',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'Each of you takes one evening this week for something that is entirely your own. Not a shared plan, not a favour. The thing you would do if nobody were watching.\n\n' +
            'The other one protects it — no plans on top, no guilt, no checking in.\n\n' +
            'Then swap: the following week the other one gets the evening.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What did you do, and why that?',
            'When did you last take an evening like this without apologising for it?',
            'What have you quietly given up since becoming a pair?',
            'What would you need to take one of these every month?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Keep it as two separate things in one moment:',
          bullets: [
            'a photo from your evening',
            'one line about what it gave back',
            'the date of the other person’s evening, agreed now',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-e08-s',
    number: 1,
    prompt: 'Say yes to the next thing you would normally decline.',
    type: 'action',
    group: 'act',
    edition: 'edition-08',
    status: 'sealed',
    content: {
      title: 'The Yes You Have Been Saving',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'Each of you names one thing the other has suggested before that you quietly said no to. Nothing unsafe, nothing expensive, nothing that costs a whole weekend.\n\n' +
            'Then do both. This week, or the next one.\n\n' +
            'The rule is simple: no complaining while it happens. Complain afterwards, generously.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What did you assume it would be like, and what was it actually like?',
            'What else do you say no to out of habit rather than dislike?',
            'Which of the two would you do again?',
            'Who finds it easier to say yes, and what makes it easier?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save the evidence:',
          bullets: [
            'the worst photo from each of the two things',
            'one sentence each, written before the other reads it',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-e09-s',
    number: 1,
    prompt: 'Build somewhere to hide for one evening.',
    type: 'action',
    group: 'date',
    edition: 'edition-09',
    status: 'sealed',
    content: {
      title: 'A Room Inside the Room',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'Take blankets, cushions, whatever is in the flat, and build somewhere small to sit. Properly small — smaller than feels sensible.\n\n' +
            'One lamp — not candles, this is a room made of blankets. Something warm to drink. No overhead light, no screens inside the fort.\n\n' +
            'Stay in it for the whole evening. Leaving it to fetch snacks is allowed and encouraged.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'Where did you hide as a child?',
            'What makes a place feel safe to you — is it the size, the light, the people?',
            'What is currently loud in your life that you would like a smaller room from?',
            'What would you keep from this evening as a habit?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Before you take it apart:',
          bullets: [
            'one photo from inside, at eye level',
            'the name you gave it',
            'one line about what you talked about in there',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-e10-s',
    number: 1,
    prompt: 'Tell the story of a scar, a nickname, or a photo.',
    type: 'question',
    group: 'question',
    edition: 'edition-10',
    status: 'sealed',
    content: {
      title: 'Three Ways In',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'You pick which of the three you tell, and how much of it. Some scars have a long story behind them and some have none — either answer is a full answer, and swapping to a different one is not a failure.\n\n' +
            'The person listening asks questions and does not push.',
        },
        {
          heading: 'Make a little moment out of it',
          body:
            'Somewhere unhurried — a long walk, a table with no rush. Each of you picks one of the three: a scar, a nickname, or a photo on your phone that is older than five years.\n\n' +
            'Tell as much of it as you want to. The other one listens.\n\n' +
            'Then swap. Then, if it is going well, pick a second one.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What surprised you in the story?',
            'What did you almost leave out, and why?',
            'Who in the story do you still speak to?',
            'What would you want the other to ask you about next time?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Keep the beginning of knowing each other:',
          bullets: [
            'the photo, or a photo of the place you were sitting',
            'the two things you each chose',
            'one line you want to remember from what they said',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-e11-s',
    number: 1,
    prompt: 'Fifteen minutes, before either of you is free.',
    type: 'action',
    group: 'act',
    edition: 'edition-11',
    status: 'sealed',
    content: {
      title: 'Fifteen Minutes That Do Not Exist',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'Find fifteen minutes that are not in either calendar — before the alarm, after the last email, on a platform waiting for a train.\n\n' +
            'No logistics allowed in those fifteen minutes. No shopping list, no who-picks-up-what, no diary.\n\n' +
            'Set the timer. When it goes off, go back to the day.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What did you talk about when logistics were banned?',
            'How long has it been since a conversation that was not admin?',
            'Which fifteen minutes could be this, every week?',
            'What would a longer version cost, and is it worth it to you?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Keep it small, like the moment:',
          bullets: [
            'where you were',
            'the first thing you talked about once logistics were out',
            'the day and time you are claiming for next week',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-e12-s',
    number: 1,
    prompt: 'After bedtime, one hour that is not about them.',
    type: 'action',
    group: 'date',
    edition: 'edition-12',
    status: 'sealed',
    content: {
      title: 'The Hour After the Door Closes',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'When the children are down and the flat goes quiet, do not start the tidying. Not yet.\n\n' +
            'One hour, one rule: nothing about the children. Not school, not sleep, not who is doing the morning.\n\n' +
            'Eat something proper if you can. Sit somewhere that is not the sofa you fall asleep on.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What did you talk about before you were parents?',
            'What have you been meaning to tell each other for weeks?',
            'What is one thing you miss that is nobody’s fault?',
            'What would make this hour possible twice a week?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Two lines and a photo, then go to bed:',
          bullets: [
            'what you ate or drank',
            'the thing you finally said out loud',
            'a photo of the table, mess included',
          ],
          preserveHere: true,
        },
      ],
    },
  },
];

/**
 * Welche Karte je Edition als Beispiel offen liegt.
 *
 * Für die erschienenen Editionen ist es eine der zwanzig echten Karten (die
 * erste ihrer Gruppe „Date"); für die angekündigten die Karte oben. So gibt es
 * für JEDE Edition genau eine lesbare Karte — und keine Edition, bei der man
 * nur Rechtecke sieht.
 */
export const SAMPLE_CARD_BY_EDITION: Record<string, string> = {
  'edition-01': 'card-01',
  'edition-02': 'card-21',
  'edition-03': 'card-41',
  'edition-04': 'card-e04-s',
  'edition-05': 'card-e05-s',
  'edition-06': 'card-e06-s',
  'edition-07': 'card-e07-s',
  'edition-08': 'card-e08-s',
  'edition-09': 'card-e09-s',
  'edition-10': 'card-e10-s',
  'edition-11': 'card-e11-s',
  'edition-12': 'card-e12-s',
};

/**
 * Der Hinweis, den eine offen gelesene Beispielkarte trägt.
 *
 * Als reine Funktion, damit ein Test sie halten kann: Ein Wächter, der eine
 * Zeile JSX nicht sieht, hat am 18.08.2026 genau diese Beschriftung als
 * „gehalten" gemeldet, während man sie löschen konnte, ohne dass ein Test rot
 * wurde (MANIFESTO §1 — eine Abwägung, die kein Test hält, ist nicht gehalten).
 *
 * Der Text unterscheidet nach dem Zustand der Edition, weil sonst eine der
 * beiden Aussagen falsch wäre: Bei einer angekündigten Edition gibt es kein
 * gedrucktes Deck, das „den Rest bringt" — es gibt genau diese eine Karte.
 */
export function sampleNotice(
  editionName: string,
  editionStatus: 'available' | 'upcoming',
): { en: string; de: string } {
  if (editionStatus === 'available') {
    return {
      en: `a sample card from ${editionName} — open to everyone. the printed deck brings the rest.`,
      de: `eine Beispielkarte aus ${editionName} — offen für alle. Das gedruckte Deck bringt den Rest.`,
    };
  }
  return {
    en: `a sample card from ${editionName} — this edition is still in the making, and this card is all there is of it so far.`,
    de: `eine Beispielkarte aus ${editionName} — diese Edition entsteht noch, und mehr als diese Karte gibt es davon bisher nicht.`,
  };
}
