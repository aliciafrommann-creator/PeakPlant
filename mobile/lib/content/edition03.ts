import type { MomentCard } from '../types';

/**
 * Edition 03 — Love Languages (The Marigold Edition)
 * 5 Love Language Dates · 5 Small Acts · 10 Translation Questions
 *
 * Die eine Frage dieser Edition: **Wie zeige ich Liebe — und kommt sie so an?**
 *
 * Abgrenzung, damit sich nichts doppelt (alle 40 Karten aus 01 und 02 wurden
 * dafür durchgesehen): Edition 01 fragt, wie zwei Menschen *wachsen* — nach
 * vorn gerichtet, entwicklungsbezogen. Edition 02 fragt nach *Nähe und
 * Begehren*. Diese hier fragt nach der **Übersetzung**: Jeder Mensch gibt Liebe
 * in seiner eigenen Sprache und hört sie in einer anderen. Der Kern der Edition
 * ist Karte 53 — „Welche meiner Arten, dich zu lieben, hat dich fast verfehlt?"
 * Diese Frage könnte in keiner anderen Edition stehen.
 *
 * Physical cards carry the short EN `prompt`; the in-app `content` holds the
 * full after-scan experience. Card ids continue the global card-NN sequence so
 * a single QR format covers every edition.
 */
export const EDITION_03_CARDS: MomentCard[] = [
  // ── LOVE LANGUAGE DATES ───────────────────────────────────────────────────
  {
    id: 'card-41',
    number: 1,
    prompt: 'Spend an evening speaking only in each other’s language.',
    type: 'action',
    group: 'date',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'Trade Languages For One Evening',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'Most people give love the way they would like to receive it. That is why so much care arrives quietly and goes unnoticed.\n\n' +
            'Tonight you swap.\n\n' +
            'Each of you names one way you most easily feel loved — being listened to, being helped, being touched, being told, being given time. Then, for one evening, you each do the other person’s way instead of your own.\n\n' +
            'It will feel slightly unfamiliar. That feeling is the point: it is what your partner has been receiving all along.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'Which of the two ways came more naturally to you?',
            'What did it feel like to receive love in your own language, on purpose?',
            'Was there a moment tonight where something landed differently than usual?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'the two words or sentences you each named as your language',
            'one thing the other did tonight that you want to remember',
            'a photo from the evening, if there is one',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-42',
    number: 2,
    prompt: 'Cook something one of you grew up with, and tell why.',
    type: 'action',
    group: 'date',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'The Food You Come From',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'Pick a dish from one of your childhoods. Not the most impressive one — the most familiar one.\n\n' +
            'Cook it together. While you cook, the person it belongs to tells the story: who made it, in which kitchen, on which kind of day.\n\n' +
            'Food is often the first language love is spoken in. Many people learned that they were cared for long before anyone said it out loud.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'Who fed you when you were small, and how did they show it mattered?',
            'What did care look like in your family when nobody used the word?',
            'Is there something from that kitchen you would like to keep in ours?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save a photo of the dish, the name it has in your family, and one sentence about the person it came from.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-43',
    number: 3,
    prompt: 'Give each other one hour, planned entirely by the other.',
    type: 'action',
    group: 'date',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'One Hour, Their Way',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'Each of you gets one hour that the other person plans. No negotiating, no improving it, no “are you sure”.\n\n' +
            'The rule for the planner: choose something you would love to receive. The rule for the receiver: say yes to all of it, including the parts you would not have chosen.\n\n' +
            'You will learn more about what your partner longs for from the hour they *give* you than from a hundred questions.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What did the hour you were given tell you about the person who planned it?',
            'Was there anything you enjoyed more than you expected?',
            'What would you plan differently now that you have seen theirs?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Write down what each of you planned — and one thing it revealed.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-44',
    number: 4,
    prompt: 'Go somewhere your partner has always wanted to show you.',
    type: 'action',
    group: 'date',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'Let Them Show You',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'Everyone carries a place they would like someone to see with them: a street, a viewpoint, a bar, a bench, a shop that smells right.\n\n' +
            'One of you leads today, entirely. The other follows and asks questions.\n\n' +
            'Being shown something that matters to someone is a form of being trusted. Letting yourself be led is a form of love too.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'Why this place, out of all of them?',
            'What did you hope I would notice here?',
            'Is there a place you have wanted to show me but never did? Why not?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save a photo of the place and the sentence they used to explain why it matters.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-45',
    number: 5,
    prompt: 'Write each other a letter and read them out loud.',
    type: 'action',
    group: 'date',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'Written, Then Spoken',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'Take twenty minutes in different rooms. On paper, not on a screen.\n\n' +
            'Write down three things: something you have never quite managed to say out loud, something you are grateful for, and something you hope for.\n\n' +
            'Then come back and read them to each other. Out loud, all the way through, without interrupting.\n\n' +
            'Some things only become real once they are spoken in your own voice.',
        },
        {
          heading: 'If it feels difficult',
          body:
            'Reading your own words aloud is harder than writing them. That is normal.\n\n' +
            'You are allowed to pause. The other person does not answer until you are finished.',
        },
        {
          heading: 'Keep the moment',
          body: 'Photograph both letters, or write the one sentence from each that landed hardest.',
          preserveHere: true,
        },
      ],
    },
  },

  // ── SMALL ACTS ────────────────────────────────────────────────────────────
  {
    id: 'card-46',
    number: 6,
    prompt: 'Do the thing they never ask for but always notice.',
    type: 'action',
    group: 'act',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'The Thing They Never Ask For',
      sections: [
        {
          heading: 'This week',
          body:
            'There is something your partner never requests and always registers. The bed made a certain way. The phone put down. Their coffee, their way. The thing you usually do half.\n\n' +
            'Do it once this week, without announcing it.\n\n' +
            'The absence of an announcement is part of the gift.',
        },
        {
          heading: 'Keep the moment',
          body: 'Afterwards, write down what you chose — and whether they noticed.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-47',
    number: 7,
    prompt: 'Say the thing you usually only think.',
    type: 'action',
    group: 'act',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'Out Loud, Once',
      sections: [
        {
          heading: 'This week',
          body:
            'Most affection stays inside. You notice how they laugh, how they handled something hard, how they look in that jacket — and you keep it to yourself, because they surely know.\n\n' +
            'They do not surely know.\n\n' +
            'Say one of those thoughts out loud this week. Specific, not general. Not “you are great” but the actual thing you noticed.',
        },
        {
          heading: 'Keep the moment',
          body: 'Write down the sentence you said — exactly as you said it.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-48',
    number: 8,
    prompt: 'Take one task off their list without mentioning it.',
    type: 'action',
    group: 'act',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'One Less Thing',
      sections: [
        {
          heading: 'This week',
          body:
            'Pick one thing you know is sitting on their mental list — the call, the form, the appointment, the corner of the flat.\n\n' +
            'Do it. Do not mention it, do not collect credit for it.\n\n' +
            'For some people this is the loudest sentence there is: I noticed what you were carrying, and I put some of it down for you.',
        },
        {
          heading: 'A note',
          body:
            'This works when it lightens a load, not when it takes over something they wanted to do themselves. If in doubt, choose the boring task, not the meaningful one.',
        },
        {
          heading: 'Keep the moment',
          body: 'Note what you took over — and how it felt to say nothing about it.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-49',
    number: 9,
    prompt: 'Touch them the way they like to be touched — not the way you do.',
    type: 'action',
    group: 'act',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'Their Way, Not Yours',
      sections: [
        {
          heading: 'This week',
          body:
            'We touch others roughly the way we like to be touched. Firmer or lighter, longer or shorter, more or less often.\n\n' +
            'Ask once, plainly: how do you actually like it? Then follow that, even where it differs from your instinct.\n\n' +
            'This is about everyday closeness — a hand, a shoulder, a greeting at the door.',
        },
        {
          heading: 'Keep the moment',
          body: 'Write down what you learned. One sentence is enough.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-50',
    number: 10,
    prompt: 'Give them your full attention for ten uninterrupted minutes.',
    type: 'action',
    group: 'act',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'Ten Minutes, Nothing Else',
      sections: [
        {
          heading: 'This week',
          body:
            'Ten minutes. Phones in another room, screens off, nothing cooking, nothing running in the background.\n\n' +
            'One of you talks, the other listens without solving anything. Then swap, if you want to.\n\n' +
            'For many people, undivided attention is the rarest thing they are ever given — and the one they most reliably recognise as love.',
        },
        {
          heading: 'Keep the moment',
          body: 'Note what was said in those ten minutes that might not have come up otherwise.',
          preserveHere: true,
        },
      ],
    },
  },

  // ── TRANSLATION QUESTIONS ─────────────────────────────────────────────────
  {
    id: 'card-51',
    number: 11,
    prompt: 'How did the people who raised you show love?',
    type: 'question',
    group: 'question',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'Where Your Language Comes From',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Nobody chooses their first language of love. You learn it by watching, long before you can name it.\n\n' +
            'Some were fed. Some were driven places. Some were praised, some were held, some were simply left in peace.\n\n' +
            'This is not about judging how you were raised. It is about noticing which vocabulary you were handed.',
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“In my family, care mostly looked like…”',
            '“Nobody said it out loud, but I knew I mattered when…”',
            '“Something I missed and only understood much later is…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Write down one sentence each about the language you grew up with.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-52',
    number: 12,
    prompt: 'What makes you feel loved when nothing is said?',
    type: 'question',
    group: 'question',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'Without Words',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Words are the easiest part to get right and often the smallest.\n\n' +
            'Think about the wordless moments: how someone stands next to you, waits for you, remembers something, hands you a cup.\n\n' +
            'Be as concrete as you can. “Attention” is not an answer. “When you wait for me at the top of the stairs” is.',
        },
        {
          heading: 'Keep the moment',
          body: 'Save both answers, as concretely as they were said.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-53',
    number: 13,
    prompt: 'Which of my ways of loving you almost missed you?',
    type: 'question',
    group: 'question',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'The One That Almost Missed',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'This is the heart of this edition, and it takes some courage on both sides.\n\n' +
            'Something you do out of love may be arriving faintly, or not at all — not because it is wrong, but because it is spoken in a language the other person does not hear well.\n\n' +
            'For the person answering: this is not a complaint, and you are not ungrateful.\n' +
            'For the person listening: this is not a verdict on your love. It is a map.',
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“I know you mean it lovingly when you…, and it reaches me less than you think.”',
            '“What reaches me much more than you would guess is…”',
            '“I have never said this because I did not want to seem ungrateful:…”',
          ],
          footer:
            'Two people can love each other completely and still miss each other daily.\n\n' +
            'Almost every long relationship has one of these — and almost none of them ever gets said out loud.',
        },
        {
          heading: 'Keep the moment',
          body:
            'Write down what each of you named. Come back to this card in a few months and see whether it changed.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-54',
    number: 14,
    prompt: 'What do you do for me that I might not have noticed?',
    type: 'question',
    group: 'question',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'The Unseen Half',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'This question is allowed to be uncomfortable. Most of what people do for each other happens invisibly, and quiet resentment often starts exactly there.\n\n' +
            'Say it plainly and without the bill attached. The other person listens without defending themselves.',
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“Something I take care of that you may not see is…”',
            '“It would mean a lot if you noticed…”',
            '“I actually enjoy doing this, I would just like it to be seen:…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Write down one invisible thing each of you does — so it is invisible no longer.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-55',
    number: 15,
    prompt: 'When did you last feel truly chosen by me?',
    type: 'question',
    group: 'question',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'Chosen, Not Just Kept',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'There is a difference between being loved and being chosen. Love can become a habit; being chosen is an act.\n\n' +
            'Try to recall a specific moment rather than a general feeling.',
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“I felt chosen when you…”',
            '“Small things that feel like being chosen to me are…”',
            '“I would like to be chosen more often in situations like…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save both moments.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-56',
    number: 16,
    prompt: 'What kind of attention feels like a gift to you?',
    type: 'question',
    group: 'question',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'The Shape Of Attention',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Attention comes in very different shapes. Being asked. Being left alone. Being watched while you do something you are good at. Being remembered days later.\n\n' +
            'Which shape actually reaches you — and which one only looks like attention from the outside?',
        },
        {
          heading: 'Keep the moment',
          body: 'Write down the shape that works for each of you.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-57',
    number: 17,
    prompt: 'Is there a way of loving you that you have never asked for?',
    type: 'question',
    group: 'question',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'The Unasked Wish',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Many people carry a wish they never voice, because asking for it would feel like it no longer counts once it arrives.\n\n' +
            'It still counts. Something given because it was wished for is not worth less.\n\n' +
            'Name one thing you have never asked for.',
        },
        {
          heading: 'For the person listening',
          body:
            'Do not promise anything immediately. Just take it in.\n\n' +
            'A wish that has been heard has already changed something.',
        },
        {
          heading: 'Keep the moment',
          body: 'Save both wishes.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-58',
    number: 18,
    prompt: 'What did you learn about love before you met me?',
    type: 'question',
    group: 'question',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'What You Brought With You',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Everyone arrives with a history: what worked, what hurt, what they promised themselves never to repeat.\n\n' +
            'This is not about ranking former relationships. It is about the conclusions you drew — because those conclusions are in the room with us today.',
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“Something I learned that still helps me is…”',
            '“Something I concluded back then that may no longer be true is…”',
            '“I promised myself I would never again…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Write down one conclusion each — and whether it still fits.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-59',
    number: 19,
    prompt: 'Which small thing would mean more than a big gesture?',
    type: 'question',
    group: 'question',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'Smaller Than You Think',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Big gestures are easier: they are rare, visible, and over quickly. Small things have to be repeated, which is exactly why they mean more.\n\n' +
            'Name something small enough to happen this week.',
        },
        {
          heading: 'Keep the moment',
          body: 'Save both answers — and treat them as an invitation, not a to-do list.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-60',
    number: 20,
    prompt: 'How do you want to be loved when you are not at your best?',
    type: 'question',
    group: 'question',
    edition: 'edition-03',
    status: 'sealed',
    content: {
      title: 'On The Bad Days',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'It is easy to love someone on a good day. The language that really matters is the one for the other days — tired, irritable, sad, unfair.\n\n' +
            'What helps you then? Closeness or space? Questions or silence? Being taken care of, or being treated completely normally?\n\n' +
            'Say it now, while everything is calm. In the middle of a bad day, nobody can explain it.',
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“When I am doing badly, it helps me when you…”',
            '“What definitely does not help me, even if it is well meant, is…”',
            '“You can tell I am not okay by…”',
          ],
          footer:
            'This is the most useful card in the edition — and the one you will be glad you filled in on a good day.',
        },
        {
          heading: 'Keep the moment',
          body:
            'Write both answers down and keep them where you will find them again.\n\n' +
            'On the day you need them, nobody wants to search for them.',
          preserveHere: true,
        },
      ],
    },
  },
];
