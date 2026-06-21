import type { MomentCard } from '../types';

/**
 * Edition 02 — Soft & Wild (The Spicy Edition)
 * 5 Intimacy Dates · 5 Small Sparks · 10 Closer Questions
 *
 * Intimacy without pressure. Desire without performance. Curiosity with consent.
 * This is a `sensitive` edition (see Edition.sensitive) — the UI treats its
 * content more privately. Card ids continue the global card-NN sequence so a
 * single QR format (card-NN) covers every edition.
 */
export const EDITION_02_CARDS: MomentCard[] = [
  // ── INTIMACY DATES ────────────────────────────────────────────────────────
  {
    id: 'card-21',
    number: 1,
    prompt: 'Choose one sense and create an evening around it.',
    type: 'action',
    group: 'date',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'A Night for the Senses',
      sections: [
        {
          heading: 'Slow the moment down',
          body: 'Choose one sense together:',
          bullets: ['touch', 'taste', 'sound', 'scent', 'sight'],
          footer: 'Then build a small evening around it.',
        },
        {
          heading: 'Build the evening',
          body: 'You could:',
          bullets: [
            'create a playlist and listen with your eyes closed',
            'prepare different foods and take time tasting them',
            'choose comforting or exciting textures',
            'create a softer atmosphere with light',
            'use scents that make the room feel different',
            'take turns choosing what the other person experiences',
          ],
          footer:
            'The goal is not to make anything happen.\n\n' +
            'It is simply to notice what feels good, interesting or connecting.',
        },
        {
          heading: 'Before you begin',
          body: 'Ask each other:',
          bullets: [
            'What kind of mood feels right tonight?',
            'Would you like this to feel soft, playful, exciting or calming?',
            'Is there anything you do not want?',
            'How would you like us to check in with each other?',
          ],
        },
        {
          heading: 'Talk about it',
          bullets: [
            'Which sense affects your mood most strongly?',
            'What makes an atmosphere feel intimate to you?',
            'What helps you slow down and become present?',
            'What would you like to repeat another time?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'photos of the atmosphere',
            'music, scents or tastes you chose',
            'what each of you enjoyed',
            'something that surprised you',
            'anything you would like to remember for another night',
          ],
          footer: 'Only save photos that both of you feel comfortable preserving.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-22',
    number: 2,
    prompt: 'Create an evening with no destination.',
    type: 'action',
    group: 'date',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'Take It Slowly',
      sections: [
        {
          heading: 'Let go of the next step',
          body:
            'Choose a quiet evening where neither of you needs to rush.\n\n' +
            'Make the room comfortable and decide together that there is no goal to reach.\n\n' +
            'You might:',
          bullets: [
            'lie close together',
            'kiss slowly',
            'give each other a massage',
            'talk in low light',
            'listen to music',
            'hold each other',
            'explore touch without deciding what it should lead to',
          ],
          footer:
            'There is no expectation that the moment becomes more intense.\n\n' +
            'Try noticing what changes when nothing needs to happen next.',
        },
        {
          heading: 'Before you begin',
          body: 'Ask:',
          bullets: [
            'What would help you relax tonight?',
            'Is there any kind of touch you do or do not want?',
            'Would you like more talking or more quiet?',
            'How can we make it easy to pause or change direction?',
          ],
        },
        {
          heading: 'Talk about it',
          bullets: [
            'When do you feel most present during intimacy?',
            'What makes you feel rushed?',
            'What allows you to enjoy closeness without thinking ahead?',
            'What kind of pace feels natural to you?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'the music or atmosphere',
            'one thing that helped you slow down',
            'one kind of closeness you enjoyed',
            'a private note about what you would like more of',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-23',
    number: 3,
    prompt: 'Create a private place for closeness.',
    type: 'action',
    group: 'date',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'Build Your Hideout',
      sections: [
        {
          heading: 'Make intimacy feel intentional',
          body:
            'Transform one small space into a temporary hideout for the two of you.\n\n' +
            'It could be:',
          bullets: [
            'a blanket setup on the floor',
            'a softly lit bedroom',
            'a living-room corner with pillows',
            'a bath with music',
            'a balcony at night',
            'a tent indoors',
            'a hotel-style evening at home',
          ],
          footer:
            'Use what you already have.\n\n' +
            'The space does not need to look perfect. It should simply feel separate from everyday life.',
        },
        {
          heading: 'Bring in what helps',
          body: 'Bring in anything that helps the atmosphere:',
          bullets: [
            'blankets',
            'music',
            'drinks',
            'snacks',
            'softer lighting',
            'a scent',
            'a PeakPlant card',
            'phones placed somewhere else',
          ],
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What makes a place feel private to you?',
            'What helps you leave everyday responsibilities outside?',
            'Do you prefer intimacy to feel spontaneous or intentionally prepared?',
            'What atmosphere helps you open up?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'photos of the space',
            'the name you give your hideout',
            'your playlist',
            'one detail each of you chose',
            'future memories created there',
          ],
          preserveHere: true,
        },
        {
          heading: 'Come back later',
          body: 'Recreate the hideout on another evening and notice what you want to keep or change.',
        },
      ],
    },
  },
  {
    id: 'card-24',
    number: 4,
    prompt: 'Turn down the lights and notice each other differently.',
    type: 'action',
    group: 'date',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'An Evening in the Dark',
      sections: [
        {
          heading: 'Reduce what distracts you',
          body: 'Create an evening with very little light.\n\nYou might use:',
          bullets: [
            'candles',
            'a small lamp',
            'moonlight',
            'closed curtains',
            'sleeping masks, only if both of you feel comfortable',
            'music without screens',
          ],
          footer:
            'Spend time talking, touching, sitting close or moving around the room slowly.\n\n' +
            'When one sense becomes quieter, others may become stronger.\n\n' +
            'Do not surprise the other person with touch.\n\n' +
            'Ask or guide each other, especially when visibility is limited.',
        },
        {
          heading: 'Before you begin',
          body: 'Choose simple check-in words such as:',
          bullets: ['more', 'less', 'slower', 'different', 'pause', 'stay here'],
        },
        {
          heading: 'Talk about it',
          bullets: [
            'Does low light make you feel more relaxed or more vulnerable?',
            'What helps you trust the moment?',
            'Which kinds of touch become more noticeable?',
            'What do you enjoy when visual pressure disappears?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'the atmosphere',
            'the playlist',
            'what helped you feel comfortable',
            'something you noticed differently',
            'anything you would like to repeat',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-25',
    number: 5,
    prompt: 'Try one new form of closeness together.',
    type: 'action',
    group: 'date',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'Choose a New First',
      sections: [
        {
          heading: 'New does not need to mean extreme',
          body: 'Choose one small thing that neither of you has tried together before.\n\nIt could be:',
          bullets: [
            'a new type of date',
            'a different way of initiating closeness',
            'a massage',
            'sharing a fantasy without acting on it',
            'dancing together at home',
            'choosing music for each other',
            'trying a new kind of kiss',
            'staying somewhere different',
            'dressing in a way that makes you feel attractive',
            'talking openly about something you usually avoid',
          ],
          footer:
            'The new experience should feel interesting to both of you.\n\n' +
            'Curiosity is enough. Bravery is not required.',
        },
        {
          heading: 'Before you choose',
          body: 'Each person can answer:',
          bullets: [
            'I am curious about…',
            'I would feel comfortable trying…',
            'I am not interested in…',
            'I would like to go slowly with…',
            'I would rather only talk about…',
          ],
          footer: 'Choose something inside the overlap.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What made this feel exciting?',
            'What made it feel safe?',
            'Was there anything you would change?',
            'Would you like to repeat it?',
            'What did you learn about each other?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'what you chose',
            'why it felt interesting',
            'any photo connected to the date',
            'how each of you felt before and after',
            'whether you would like to revisit it',
          ],
          preserveHere: true,
        },
      ],
    },
  },

  // ── SMALL SPARKS ──────────────────────────────────────────────────────────
  {
    id: 'card-26',
    number: 6,
    prompt: 'Show each other what feels comforting, playful and exciting.',
    type: 'action',
    group: 'act',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'Three Kinds of Touch',
      sections: [
        {
          heading: 'Explore without guessing',
          body: 'Take turns choosing three forms of touch:',
          bullets: [
            'one that feels comforting',
            'one that feels playful',
            'one that feels exciting',
          ],
          footer: 'These can be very simple.',
        },
        {
          heading: 'Examples',
          body: 'Examples might include:',
          bullets: [
            'holding hands',
            'resting against each other',
            'stroking someone’s hair',
            'tracing a hand along an arm',
            'a kiss on the forehead',
            'a longer kiss',
            'sitting closely',
            'playful nudging',
            'a massage',
            'being held firmly or gently',
          ],
          footer: 'The categories may feel completely different for each person.',
        },
        {
          heading: 'Use clear words',
          body: 'You can say:',
          bullets: ['more', 'less', 'slower', 'softer', 'firmer', 'different', 'stay here', 'pause'],
          footer:
            'The point is not to guess correctly.\n\n' +
            'It is to become more comfortable showing and asking.',
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'one comforting touch each',
            'one playful touch each',
            'one exciting touch each',
            'anything that surprised you',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-27',
    number: 7,
    prompt: 'Share one kiss that does not need to lead anywhere.',
    type: 'action',
    group: 'act',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'The Long Kiss',
      sections: [
        {
          heading: 'Let the kiss be the whole moment',
          body:
            'Choose a moment when neither of you needs to rush.\n\n' +
            'Kiss each other slowly and let that be enough.\n\n' +
            'There is no next step to reach.\n\n' +
            'Notice:',
          bullets: [
            'pace',
            'breathing',
            'closeness',
            'pressure',
            'pauses',
            'where you place your hands',
            'what helps you stay present',
          ],
          footer: 'You may laugh, pause, begin again or stop whenever it feels right.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What makes a kiss feel intimate to you?',
            'Do you like kisses to begin softly or confidently?',
            'What helps you feel desired while kissing?',
            'Is there something small you would enjoy more often?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'You may save:',
          bullets: [
            'where the moment happened',
            'a short note about how it felt',
            'one thing each of you enjoyed',
            'a private photo before or after, only if both want one',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-28',
    number: 8,
    prompt: 'Give each other something to look forward to.',
    type: 'action',
    group: 'act',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'Create Anticipation',
      sections: [
        {
          heading: 'Let desire begin before the moment',
          body: 'Choose one small way to create anticipation for later.\n\nYou could:',
          bullets: [
            'send a playful message',
            'choose a song for the evening',
            'leave a note',
            'describe one thing you are looking forward to',
            'plan what you will wear',
            'choose a drink or snack',
            'prepare the room',
            'tell your partner when you want time together',
            'give a hint without revealing everything',
          ],
          footer:
            'Anticipation should feel inviting, not demanding.\n\n' +
            'The other person should still feel free to say what kind of evening they want.',
        },
        {
          heading: 'Try this',
          body: 'Complete one sentence:',
          bullets: [
            '“Later, I would love to…”',
            '“Something I am looking forward to is…”',
            '“Tonight, I would like us to feel…”',
            '“I keep thinking about…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'the message or note',
            'what you planned',
            'how the anticipation felt',
            'whether you would enjoy more playful communication like this',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-29',
    number: 9,
    prompt: 'Guide one kind of touch you enjoy.',
    type: 'action',
    group: 'act',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'Show Me How',
      sections: [
        {
          heading: 'Replace guessing with guidance',
          body:
            'Choose one simple kind of touch.\n\n' +
            'Place your hand over your partner’s hand or use words to show:',
          bullets: [
            'where',
            'how slowly',
            'how much pressure',
            'what rhythm',
            'when to stay',
            'when to change',
          ],
          footer:
            'Then switch roles.\n\n' +
            'This can be anywhere that both of you feel comfortable touching.\n\n' +
            'It does not need to be sexual.\n\n' +
            'The exercise is about learning how to guide without embarrassment and receive guidance without taking it as criticism.',
        },
        {
          heading: 'Helpful phrases',
          bullets: [
            '“A little slower.”',
            '“Stay there.”',
            '“Softer feels better.”',
            '“Can you try this?”',
            '“I like it when…”',
            '“That feels good.”',
            '“I would rather change.”',
          ],
        },
        {
          heading: 'Talk about it',
          bullets: [
            'Is it easy or difficult for you to guide?',
            'What makes asking feel comfortable?',
            'How do you prefer to receive feedback?',
            'What helps correction feel playful rather than critical?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save one thing each of you learned.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-30',
    number: 10,
    prompt: 'Decide how you want closeness to feel today.',
    type: 'action',
    group: 'act',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'Choose the Mood',
      sections: [
        {
          heading: 'Intimacy does not always need the same energy',
          body:
            'Each of you chooses one or two words for the kind of closeness you want today.\n\n' +
            'Examples:',
          bullets: [
            'soft',
            'playful',
            'calm',
            'affectionate',
            'exciting',
            'slow',
            'curious',
            'comforting',
            'passionate',
            'silly',
            'quiet',
            'spontaneous',
          ],
          footer:
            'Compare your answers.\n\n' +
            'You do not need to choose the same word.\n\n' +
            'Look for a combination that respects both.',
        },
        {
          heading: 'For example',
          bullets: ['soft and playful', 'calm and affectionate', 'curious and slow', 'exciting and safe'],
        },
        {
          heading: 'Ask',
          bullets: [
            'What would help create that mood?',
            'Is there anything that would make the mood disappear?',
            'Do you want more initiative or more space?',
            'How can we check in during the moment?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'the words you chose',
            'what helped create the mood',
            'whether the combination felt right',
            'words you might choose another time',
          ],
          preserveHere: true,
        },
      ],
    },
  },

  // ── CLOSER QUESTIONS ──────────────────────────────────────────────────────
  {
    id: 'card-31',
    number: 11,
    prompt: 'When do you feel most desired by me?',
    type: 'question',
    group: 'question',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'When Do You Feel Desired?',
      sections: [
        {
          heading: 'Before you begin',
          body: 'Feeling desired can mean many different things.\n\nIt may come from:',
          bullets: [
            'a look',
            'a compliment',
            'physical touch',
            'someone initiating closeness',
            'full attention',
            'playful messages',
            'affection in everyday life',
            'being accepted in your body',
            'being chosen intentionally',
            'being remembered during the day',
          ],
          footer: 'Do not assume desire looks the same for both of you.',
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“I feel desired by you when…”',
            '“A small thing that creates attraction for me is…”',
            '“Something you already do that I love is…”',
            '“I would enjoy more…”',
            '“I sometimes miss…”',
          ],
          footer:
            'The listener does not need to promise every wish immediately.\n\n' +
            'Begin by understanding what the moment means to the other person.',
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'one thing that already makes each person feel desired',
            'one thing each person would enjoy more often',
            'anything you want to remember for later',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-32',
    number: 12,
    prompt: 'What helps you feel safe enough to let go?',
    type: 'question',
    group: 'question',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'Safe Enough to Let Go',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Letting go may mean relaxing, becoming playful, being emotionally open or feeling free to express desire.\n\n' +
            'It is difficult to be present when part of you is worried about judgement, pressure or doing something wrong.\n\n' +
            'Safety does not remove excitement.\n\n' +
            'For many people, it makes excitement possible.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'What helps you relax into intimacy?',
            'What makes you feel accepted?',
            'How do you like someone to check in?',
            'What makes it easier to express what you want?',
            'What causes you to become self-conscious?',
            'What helps you return to the moment?',
          ],
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“I feel safest when…”',
            '“I find it easier to let go if…”',
            '“I become tense when…”',
            '“It helps me when you…”',
            '“One thing I never want to feel pressured about is…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save one condition each of you needs for intimacy to feel safe and free.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-33',
    number: 13,
    prompt: 'How do you like desire to be initiated?',
    type: 'question',
    group: 'question',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'How Do You Like Desire to Begin?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Initiation can feel exciting, vulnerable or difficult.\n\n' +
            'Different people enjoy different signals.\n\n' +
            'Some prefer direct words. Others enjoy touch, affection, playfulness, time, atmosphere or anticipation.\n\n' +
            'A person’s preference may also change depending on the day.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'Do you like direct or subtle initiation?',
            'Do words, touch or actions feel most natural?',
            'What kind of initiation makes you feel chosen?',
            'What kind can feel like pressure?',
            'How do you communicate when you are interested?',
            'How do you prefer to say “not tonight” while keeping closeness intact?',
          ],
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“I like it when you initiate by…”',
            '“A signal I sometimes miss is…”',
            '“Something that feels inviting is…”',
            '“Something that can make me withdraw is…”',
            '“When I am not in the mood, I still appreciate…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'one preferred way of initiating for each person',
            'one respectful way to decline',
            'one form of closeness that still feels good when desire does not align',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-34',
    number: 14,
    prompt: 'Where do you sometimes feel pressure around intimacy?',
    type: 'question',
    group: 'question',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'Where Does Pressure Appear?',
      sections: [
        {
          heading: 'Before you begin',
          body: 'Pressure can enter intimate moments quietly.\n\nIt may come from:',
          bullets: [
            'expectations',
            'previous experiences',
            'comparison',
            'media',
            'fear of disappointing someone',
            'assumptions about frequency',
            'body image',
            'feeling responsible for the other person’s feelings',
            'believing a moment must progress',
            'thinking you should want something',
          ],
          footer:
            'This question is not about blaming each other.\n\n' +
            'It is about noticing what makes intimacy harder to enjoy freely.',
        },
        {
          heading: 'Listen without defending',
          body: 'You could begin with:',
          bullets: [
            '“I sometimes feel pressure when…”',
            '“A thought that takes me out of the moment is…”',
            '“I worry that you might think…”',
            '“I would feel freer if…”',
            '“One expectation I would like us to release is…”',
          ],
        },
        {
          heading: 'Talk about it',
          bullets: [
            'How can we make “no” or “not now” feel safe?',
            'How can we avoid treating affection as a promise of more?',
            'What helps us separate desire from obligation?',
            'What would make our intimate moments feel lighter?',
          ],
        },
        {
          heading: 'Keep the moment',
          body:
            'Save only what both of you feel comfortable preserving.\n\n' +
            'This conversation may also remain completely offline.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-35',
    number: 15,
    prompt: 'What makes you feel close to me before we even touch?',
    type: 'question',
    group: 'question',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'Before We Even Touch',
      sections: [
        {
          heading: 'Before you begin',
          body: 'Physical intimacy often begins long before physical contact.\n\nCloseness may grow through:',
          bullets: [
            'being listened to',
            'shared humour',
            'feeling appreciated',
            'practical care',
            'eye contact',
            'trust',
            'emotional honesty',
            'feeling chosen',
            'anticipation',
            'spending unhurried time together',
            'resolving tension',
            'being supported',
          ],
          footer: 'Understanding these moments can make intimacy feel more connected to everyday life.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'When do you feel emotionally closest to me?',
            'What creates attraction outside intimate moments?',
            'Which everyday gestures make you feel connected?',
            'What makes you feel distant?',
            'What helps you transition from daily life into closeness?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save three things that create closeness before touch.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-36',
    number: 16,
    prompt: 'What kind of intimacy would you like more of?',
    type: 'question',
    group: 'question',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'What Would You Like More Of?',
      sections: [
        {
          heading: 'Before you begin',
          body: '“More” does not need to mean more frequent or more intense.\n\nIt could mean:',
          bullets: [
            'more affection',
            'more playful moments',
            'more time',
            'more slowness',
            'more direct communication',
            'more kissing',
            'more emotional closeness',
            'more initiation',
            'more comfort',
            'more variety',
            'more quiet',
            'more touch without expectation',
          ],
          footer: 'Try to describe what you miss without presenting it as a failure.',
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“I would love more moments where…”',
            '“Something I miss is…”',
            '“I feel especially close when…”',
            '“A small change that would mean a lot is…”',
            '“I do not need this every time, but I would enjoy…”',
          ],
        },
        {
          heading: 'For the listener',
          body: 'Try asking:',
          bullets: [
            '“What part of that matters most to you?”',
            '“What would make that feel natural?”',
            '“Is there a small way we could begin?”',
            '“Is this something you want often, occasionally or only when it feels right?”',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save one wish each and one possible gentle first step.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-37',
    number: 17,
    prompt: 'What would you like to explore slowly together?',
    type: 'question',
    group: 'question',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'What Would You Explore Slowly?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Curiosity does not create an obligation.\n\n' +
            'You may be curious about something and still decide never to try it.\n\n' +
            'You may also want to explore an idea only through conversation.\n\n' +
            'This card is about openness, not immediate action.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'a new kind of date',
            'a fantasy',
            'a different pace',
            'new forms of touch',
            'new ways of communicating',
            'something playful',
            'a different environment',
            'being more direct',
            'being more vulnerable',
            'allowing more time',
            'expressing desire differently',
          ],
        },
        {
          heading: 'Use three categories',
          body: 'Each person may place ideas into:',
          bullets: [
            'Yes — something I would enjoy.',
            'Maybe — something I might explore slowly or with more conversation.',
            'Not for me — something I do not want.',
          ],
          footer: 'All three answers are equally valid.',
        },
        {
          heading: 'Keep the moment',
          body:
            'Save only the ideas both of you want to remember.\n\n' +
            'Do not save anything one person wishes to keep private.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-38',
    number: 18,
    prompt: 'What helps you stay present in intimate moments?',
    type: 'question',
    group: 'question',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'What Keeps You Present?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'It is normal for attention to move.\n\n' +
            'Thoughts about work, appearance, time, expectations or what comes next can pull someone away from the moment.\n\n' +
            'Presence does not mean having no thoughts.\n\n' +
            'It means noticing what helps you return.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'What helps you relax into your body?',
            'Do you prefer eye contact or closed eyes?',
            'Does talking help or distract you?',
            'Does music help?',
            'What kind of pace keeps you present?',
            'What makes you begin analysing yourself?',
            'How can your partner help you come back without creating pressure?',
          ],
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“I feel most present when…”',
            '“I leave the moment when I start thinking about…”',
            '“It helps me return when…”',
            '“One thing I would like less of is…”',
            '“One thing I would like more of is…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save a small “presence list” for each person.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-39',
    number: 19,
    prompt: 'What would you like me to understand better about your desire?',
    type: 'question',
    group: 'question',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'What Should I Understand About Your Desire?',
      sections: [
        {
          heading: 'Before you begin',
          body: 'Desire is not always spontaneous, constant or predictable.\n\nIt can be affected by:',
          bullets: [
            'stress',
            'sleep',
            'emotional connection',
            'confidence',
            'time',
            'feeling safe',
            'hormones',
            'health',
            'medication',
            'conflict',
            'anticipation',
            'body image',
            'how the day has felt',
            'the kind of closeness being offered',
          ],
          footer: 'Differences in desire do not automatically mean a lack of love or attraction.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'What tends to awaken desire for you?',
            'What tends to quiet it?',
            'Does desire usually appear before closeness or after closeness begins?',
            'How do stress and tiredness affect you?',
            'What misunderstandings would you like to avoid?',
            'What helps you communicate honestly when desire differs?',
          ],
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“My desire often appears when…”',
            '“I sometimes need… before I can feel interested.”',
            '“When I am not in the mood, it does not mean…”',
            '“Something I want you to understand is…”',
            '“I feel most accepted when…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save one thing each of you wants the other person to remember.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-40',
    number: 20,
    prompt: 'How do you want to feel after an intimate moment?',
    type: 'question',
    group: 'question',
    edition: 'edition-02',
    status: 'sealed',
    content: {
      title: 'How Do You Want to Feel Afterwards?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'The moments after closeness can matter just as much as the build-up.\n\n' +
            'Different people need different things.\n\n' +
            'You may want:',
          bullets: [
            'to be held',
            'to talk',
            'to laugh',
            'to stay quiet',
            'to sleep',
            'to drink water',
            'to have space',
            'to feel reassured',
            'to share affection',
            'to continue the evening together',
            'to return slowly to everyday life',
          ],
          footer: 'These preferences may change depending on the moment.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'What helps you feel emotionally close afterwards?',
            'Do you prefer talking or quiet?',
            'What makes you feel cared for?',
            'Is there anything that can make you feel suddenly distant?',
            'How can we check in without making the moment feel clinical?',
            'What kind of affection feels good afterwards?',
          ],
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“After intimacy, I usually enjoy…”',
            '“I feel especially connected when…”',
            '“Sometimes I need…”',
            '“One small gesture that matters to me is…”',
            '“If I become quiet, it usually means…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body:
            'Save an “afterwards” preference for each person.\n\n' +
            'You can update it whenever it changes.',
          preserveHere: true,
        },
      ],
    },
  },
];
