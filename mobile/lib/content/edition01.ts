import type { MomentCard } from '../types';

/**
 * Edition 01 — Grow Together (The Sunflower Edition)
 * 5 Grow Dates · 5 Small Acts of Growth · 10 Growing Questions
 *
 * Content authored from the finalized edition spec. Physical cards carry the
 * short EN `prompt`; the in-app `content` holds the full after-scan experience.
 * Bilingual fields are added incrementally — strings default to English today.
 */
export const EDITION_01_CARDS: MomentCard[] = [
  // ── GROW DATES ────────────────────────────────────────────────────────────
  {
    id: 'card-01',
    number: 1,
    prompt: 'Find a small plant you both love.',
    type: 'action',
    group: 'date',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'Grow Something Together',
      sections: [
        {
          heading: 'Make a little moment out of it',
          body:
            'Visit a small flower shop or plant market you have never been to before.\n\n' +
            'Take your time. Look around separately at first and notice which plants catch your attention. Then choose one small plant that feels right to both of you.\n\n' +
            'Over the next few weeks, watch it grow.\n\n' +
            'It needs water, light, space and care. People and relationships do too.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What do you currently need in order to grow as an individual?',
            'What helps you feel supported without feeling controlled?',
            'What do you need from each other to keep growing together?',
            'Is there something in your life that currently needs more attention, patience or space?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'photos from the flower shop',
            'a photo of the plant on its first day',
            'the name you give it',
            'a note about what each of you wants to nurture',
            'as many future photos and updates as you like',
          ],
          preserveHere: true,
        },
        {
          heading: 'Come back later',
          body:
            'Add another photo when the plant grows a new leaf, changes or needs extra care.\n\n' +
            'Ask yourselves whether anything has changed for you too.',
        },
      ],
    },
  },
  {
    id: 'card-02',
    number: 2,
    prompt: 'Watch a sunrise or sunset together.',
    type: 'action',
    group: 'date',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'Follow the Light',
      sections: [
        {
          heading: 'Choose a moment that cannot be rushed',
          body:
            'Find a place where you can watch the light change.\n\n' +
            'It could be a hill, a lake, a quiet street, a balcony or simply an open window. Bring something warm to drink, sit next to each other and leave your phones away for a while.\n\n' +
            'You do not need to fill the silence.\n\n' +
            'Let the moment unfold before you begin talking.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What currently gives you energy?',
            'What makes life feel lighter for you?',
            'Is there anything that has felt heavy recently?',
            'How can we create more moments that allow us to slow down?',
            'What are you looking forward to in the next season of our lives?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'the view',
            'a photo of both of you',
            'one sentence each about what currently brings you light',
            'a song that belongs to the moment',
            'anything you noticed while sitting together',
          ],
          preserveHere: true,
        },
        {
          heading: 'Come back later',
          body: 'Return to the same place during another season and notice what has changed.',
        },
      ],
    },
  },
  {
    id: 'card-03',
    number: 3,
    prompt: 'Return to a place that belongs to your story.',
    type: 'action',
    group: 'date',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'Remember Your Roots',
      sections: [
        {
          heading: 'Revisit a shared beginning',
          body: 'Choose a place connected to your relationship.\n\nIt could be:',
          bullets: [
            'where you first met',
            'where you had an important conversation',
            'a place from an early date',
            'the neighbourhood where one of you grew up',
            'somewhere connected to a memory you still mention',
          ],
          footer:
            'Walk around and tell each other what you remember.\n\n' +
            'Your memories may be different. That does not mean one of them is wrong. People often notice and preserve different parts of the same moment.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What do you remember most clearly?',
            'What did you think about me at that time?',
            'What has changed between us since then?',
            'What part of us has remained the same?',
            'What do you appreciate more now than you did at the beginning?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'a new photo at the place',
            'an older photo, if you have one',
            'both versions of the memory',
            'one thing that has grown between you since then',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-04',
    number: 4,
    prompt: 'Create a small place that feels like yours.',
    type: 'action',
    group: 'date',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'Make Space to Bloom',
      sections: [
        {
          heading: 'Create a space for connection',
          body:
            'Choose one small area in your home or somewhere you regularly spend time together.\n\n' +
            'It does not need to be large or perfectly styled.\n\n' +
            'It could be:',
          bullets: [
            'a corner with cushions',
            'a shelf with shared memories',
            'a small breakfast space',
            'a place for phones to be left behind',
            'a box containing cards, photos and notes',
            'a balcony corner with plants or lights',
          ],
          footer:
            'Build or arrange it together using things you already own or find something small that makes it feel special.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What makes a place feel safe to you?',
            'What helps you arrive mentally when you come home?',
            'What atmosphere do we want to create together?',
            'What should this space remind us to make time for?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'photos before and after',
            'a name for the space',
            'a short note about what it should represent',
            'future memories created there',
          ],
          preserveHere: true,
        },
        {
          heading: 'Come back later',
          body: 'Use the space for another PeakPlant card or a quiet evening together.',
        },
      ],
    },
  },
  {
    id: 'card-05',
    number: 5,
    prompt: 'Plan one small thing you want to experience together.',
    type: 'action',
    group: 'date',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'A Date for Future Us',
      sections: [
        {
          heading: 'Give future plans a real shape',
          body:
            'Choose one shared experience you genuinely want to make happen.\n\n' +
            'It does not need to be a major trip or expensive plan.\n\n' +
            'It could be:',
          bullets: [
            'visiting a nearby place',
            'learning something together',
            'cooking a meal from another country',
            'attending a concert',
            'spending a night outdoors',
            'beginning a shared tradition',
            'taking one completely free day together',
          ],
          footer:
            'Talk about what excites you, then turn one idea into a simple plan.\n\n' +
            'Choose a possible date, first step or small amount to save.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What do we keep saying we should do someday?',
            'Which experiences make us feel most connected?',
            'Do we currently need more calm, adventure, play or depth?',
            'What might stop us from making this happen?',
            'What is the smallest first step?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'the idea',
            'photos or inspiration',
            'your first step',
            'a possible date',
            'what each of you hopes to feel or experience',
          ],
          preserveHere: true,
        },
        {
          heading: 'Come back later',
          body: 'Add the photos and memories after you actually do it.',
        },
      ],
    },
  },

  // ── SMALL ACTS OF GROWTH ──────────────────────────────────────────────────
  {
    id: 'card-06',
    number: 6,
    prompt: 'Choose one personal growth intention for this week.',
    type: 'action',
    group: 'act',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'One Small Step',
      sections: [
        {
          heading: 'Keep it small and meaningful',
          body:
            'Each of you chooses one personal intention for the coming week.\n\n' +
            'It does not need to sound impressive.\n\n' +
            'It could be:',
          bullets: [
            'going for a walk twice',
            'setting one boundary at work',
            'sleeping enough',
            'asking for help',
            'making time for something creative',
            'calling someone you miss',
            'taking one evening without work',
            'finally beginning something you have avoided',
          ],
          footer: 'Share your intention with each other.',
        },
        {
          heading: 'Ask before supporting',
          body: 'Ask:',
          bullets: [
            'What could make this easier?',
            'What usually gets in the way?',
            'How would you like me to support you?',
            'Would you like encouragement, a reminder, practical help or simply someone who listens?',
          ],
          footer: 'Support should feel helpful, not like supervision.',
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'both intentions',
            'why they matter',
            'the type of support each person wants',
            'optional updates during the week',
          ],
          preserveHere: true,
        },
        {
          heading: 'Come back later',
          body:
            'Reflect together at the end of the week.\n\n' +
            'Reaching the goal is not the only sign of growth. Understanding what helped or blocked you matters too.',
        },
      ],
    },
  },
  {
    id: 'card-07',
    number: 7,
    prompt: 'Choose one part of your relationship to care for this week.',
    type: 'action',
    group: 'act',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'Water What Matters',
      sections: [
        {
          heading: 'Notice what deserves attention',
          body:
            'Together, choose one small part of your relationship that you want to nurture.\n\n' +
            'It could be:',
          bullets: [
            'listening without multitasking',
            'creating more affectionate moments',
            'having breakfast together',
            'making decisions more calmly',
            'asking more thoughtful questions',
            'sharing responsibilities more clearly',
            'making room for play',
            'spending time without phones',
          ],
          footer:
            'Choose one simple action that supports it.\n\n' +
            'Avoid turning it into a strict rule or measurement.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What currently feels strong between us?',
            'What has received too little attention recently?',
            'What small action would make a real difference?',
            'How can we remind each other gently without creating pressure?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'what you chose to nurture',
            'the small action you agreed on',
            'any moment during the week when you noticed a difference',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-08',
    number: 8,
    prompt: 'Take one small weight off each other’s week.',
    type: 'action',
    group: 'act',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'Make Something Lighter',
      sections: [
        {
          heading: 'Care can be practical',
          body:
            'Ask each other:\n\n' +
            '“What is one small thing that would make this week feel lighter?”\n\n' +
            'The answer might be emotional or practical.\n\n' +
            'It could be:',
          bullets: [
            'taking over one task',
            'preparing food',
            'listening to something that has been on their mind',
            'making an appointment',
            'planning a quiet evening',
            'giving them uninterrupted time alone',
            'handling something they have postponed',
            'simply offering more patience',
          ],
          footer: 'Do not assume what the other person needs. Ask first.',
        },
        {
          heading: 'Talk about it',
          bullets: [
            'What currently takes more energy than it should?',
            'Is there anything I could help with?',
            'Would support, space or company feel better?',
            'What kind of help makes you feel cared for?',
          ],
        },
        {
          heading: 'Keep the moment',
          body:
            'Save a short note about what each of you chose to do.\n\n' +
            'You can also add a photo if the act becomes a meaningful little memory.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-09',
    number: 9,
    prompt: 'Tell each other one way you have seen the other person grow.',
    type: 'action',
    group: 'act',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'Notice the Growth',
      sections: [
        {
          heading: 'Name something that may have gone unnoticed',
          body:
            'Take a moment to think about a change you have observed in your partner.\n\n' +
            'It may be something visible, such as a new skill or achievement. It may also be quiet:',
          bullets: [
            'setting healthier boundaries',
            'becoming more patient',
            'speaking more honestly',
            'treating themselves more kindly',
            'handling uncertainty differently',
            'asking for support',
            'following something they care about',
            'letting go of an old expectation',
          ],
          footer:
            'Be specific.\n\n' +
            'Instead of saying, “You have grown so much,” describe what you noticed and why it matters to you.',
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“I have noticed that you…”',
            '“Something you handle differently now is…”',
            '“I admire the way you have learned to…”',
            '“I do not know if you notice this about yourself, but…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body:
            'Write down what each of you said.\n\n' +
            'These words may become especially meaningful later.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-10',
    number: 10,
    prompt: 'Ask what kind of support feels right today.',
    type: 'action',
    group: 'act',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'Choose Your Support',
      sections: [
        {
          heading: 'Support is not the same for everyone',
          body:
            'When someone shares a problem, the other person may immediately try to solve it.\n\n' +
            'Sometimes that helps. Sometimes it makes the person feel unheard.\n\n' +
            'Each of you completes this sentence:\n\n' +
            '“When I am struggling, I usually need…”\n\n' +
            'Possible answers include:',
          bullets: [
            'someone to listen',
            'practical advice',
            'physical comfort',
            'reassurance',
            'distraction',
            'help making a decision',
            'time alone',
            'support taking the first step',
          ],
          footer: 'Then discuss how this may change depending on the situation.',
        },
        {
          heading: 'Try this sentence',
          body:
            'Before responding to a difficult topic, ask:\n\n' +
            '“Would you like me to listen, help you think, or help you act?”',
        },
        {
          heading: 'Keep the moment',
          body:
            'Save your preferred types of support.\n\n' +
            'You can update them whenever they change.',
          preserveHere: true,
        },
      ],
    },
  },

  // ── GROWING QUESTIONS ─────────────────────────────────────────────────────
  {
    id: 'card-11',
    number: 11,
    prompt: 'Where do you sometimes still feel unseen by me?',
    type: 'question',
    group: 'question',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'Where Do You Feel Unseen?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'This question is not an accusation.\n\n' +
            'Everyday life is full of responsibilities, habits and distractions. Even when we love someone deeply, we may not always notice every part of what they are feeling or becoming.\n\n' +
            'Listen without immediately explaining or defending yourself.\n\n' +
            'Understanding can begin before agreement.',
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“A part of me I would like you to notice more is…”',
            '“I sometimes wish you would ask me about…”',
            '“I feel especially seen by you when…”',
            '“One small thing that would make me feel more understood is…”',
          ],
          footer:
            'Nothing between two people is ever perfectly understood.\n\n' +
            'Growing together also means continuing to discover each other.',
        },
        {
          heading: 'Keep the moment',
          body:
            'Write down one thing each of you would like the other person to notice more.\n\n' +
            'You may also save what already helps you feel seen.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-12',
    number: 12,
    prompt: 'What helps you become more yourself?',
    type: 'question',
    group: 'question',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'What Helps You Grow?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Growth does not always mean becoming more productive, confident or successful.\n\n' +
            'Sometimes growth means becoming softer, clearer, braver, calmer or more honest about what matters.\n\n' +
            'Talk about the people, environments and experiences that help you feel most like yourself.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'When do you feel most energised?',
            'Where do you feel free to experiment?',
            'What makes you trust yourself?',
            'What gives you space to think?',
            'What parts of your life currently help you grow?',
            'What parts make you feel smaller?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'one condition each of you needs for personal growth',
            'one thing you want to create more space for',
            'one way you can protect each other’s individuality',
          ],
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-13',
    number: 13,
    prompt: 'What helps you feel safe enough to grow and change?',
    type: 'question',
    group: 'question',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'Safe Enough to Change',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Change can feel exciting and vulnerable at the same time.\n\n' +
            'People often grow more freely when they know they will still be accepted while they are learning, uncertain or changing direction.\n\n' +
            'This is not about promising that nothing between you will ever feel difficult. It is about understanding what creates trust.',
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“I feel safe to change when…”',
            '“I become cautious when…”',
            '“It helps me when you respond by…”',
            '“One thing I need when I am unsure is…”',
          ],
        },
        {
          heading: 'Talk about it',
          bullets: [
            'How do you usually react when the other person changes?',
            'What helps you share unfinished thoughts?',
            'How can you show curiosity before judgement?',
            'What does emotional safety look like in everyday life?',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Save one sentence each about what helps you feel safe while growing.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-14',
    number: 14,
    prompt: 'Who are you slowly becoming?',
    type: 'question',
    group: 'question',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'What Are You Growing Into?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'You do not need to have a clear plan or final answer.\n\n' +
            'Think about the qualities, choices or ways of living that currently feel important to you.\n\n' +
            'This is less about job titles or achievements and more about the person you are moving towards.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'What quality do you want to strengthen?',
            'What are you learning about yourself?',
            'What no longer feels like you?',
            'What are you becoming more honest about?',
            'What would you like to protect as you change?',
            'What kind of life feels increasingly right?',
          ],
        },
        {
          heading: 'Keep the moment',
          body:
            'Write a short note beginning with:\n\n' +
            '“I am slowly becoming someone who…”\n\n' +
            'Return to it in a few months and see whether the sentence still feels true.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-15',
    number: 15,
    prompt: 'What between us currently needs more light?',
    type: 'question',
    group: 'question',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'What Needs More Light?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Some parts of a relationship receive attention naturally. Others remain in the background because life becomes busy or because neither person knows how to begin the conversation.\n\n' +
            '“More light” does not automatically mean something is wrong.\n\n' +
            'It may simply mean something deserves to be noticed.',
        },
        {
          heading: 'It could be',
          bullets: [
            'an unspoken wish',
            'a shared decision',
            'affection',
            'responsibilities',
            'physical intimacy',
            'time together',
            'time apart',
            'money',
            'future plans',
            'something one of you has been carrying quietly',
          ],
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“Something I would like us to talk about more is…”',
            '“I have not known how to bring up…”',
            '“I think this part of us needs a little more attention…”',
            '“Nothing needs to be solved today, but I would like you to know…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body:
            'Only save what both of you feel comfortable preserving.\n\n' +
            'You may also decide that this conversation should remain entirely offline.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-16',
    number: 16,
    prompt: 'What is already growing beautifully between us?',
    type: 'question',
    group: 'question',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'What Is Already Blooming?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Growth conversations often focus on what could improve.\n\n' +
            'This card asks you to notice what already feels strong, warm or alive.\n\n' +
            'Do not wait for something extraordinary.\n\n' +
            'Small patterns often shape a relationship more than major gestures.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'What feels easier between us than it used to?',
            'Which small habit do you appreciate?',
            'When have you recently felt close to me?',
            'What do we handle well as a team?',
            'What part of our relationship feels especially alive?',
            'What would you never want us to take for granted?',
          ],
        },
        {
          heading: 'Keep the moment',
          body:
            'Save three things that are currently blooming between you.\n\n' +
            'Add a photo that represents one of them, even if it seems ordinary.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-17',
    number: 17,
    prompt: 'What have we outgrown together?',
    type: 'question',
    group: 'question',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'What Have We Outgrown?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Outgrowing something does not mean it was always bad.\n\n' +
            'A habit, expectation or pattern may once have protected you or helped your relationship. It may simply no longer fit who you are now.\n\n' +
            'Approach the question with curiosity rather than blame.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'Is there an old pattern we no longer need?',
            'What assumption about each other has changed?',
            'Is there something we keep doing only because we always have?',
            'What conflict do we now handle differently?',
            'What would we like to leave behind in our next chapter?',
          ],
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“Something that once made sense but no longer does is…”',
            '“I think we have become better at…”',
            '“A pattern I would like us to release is…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body: 'Write down one thing you want to leave behind and one new way you want to move forward.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-18',
    number: 18,
    prompt: 'How can I support your growth without taking over?',
    type: 'question',
    group: 'question',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'How Do You Want to Be Supported?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Support can become unhelpful when it turns into pressure, unsolicited advice or responsibility for another person’s choices.\n\n' +
            'Healthy support leaves ownership with the person who is growing.\n\n' +
            'Ask rather than assume.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'When does encouragement feel good?',
            'When does it begin to feel like pressure?',
            'Do you want me to ask about your goals or wait for you to bring them up?',
            'What kind of reminder feels supportive?',
            'When do you need practical help?',
            'When do you need space to find your own way?',
          ],
        },
        {
          heading: 'You could begin with',
          bullets: [
            '“You help me most when…”',
            '“I feel pressured when…”',
            '“I would like you to ask me…”',
            '“One thing you do that already supports me is…”',
          ],
        },
        {
          heading: 'Keep the moment',
          body:
            'Save one support preference for each person.\n\n' +
            'These preferences can be changed at any time.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-19',
    number: 19,
    prompt: 'What part of your growth should remain entirely yours?',
    type: 'question',
    group: 'question',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'What Should Stay Yours?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Growing together does not mean sharing every interest, goal, friendship or experience.\n\n' +
            'A strong relationship can include closeness and individuality at the same time.\n\n' +
            'This question creates space for the parts of life that belong to each person separately.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'What activity feels deeply personal to you?',
            'Where do you need independence?',
            'Which friendships or spaces help you feel like yourself?',
            'What would you like to explore on your own?',
            'How can we support each other without needing to participate in everything?',
            'What does healthy independence look like to you?',
          ],
        },
        {
          heading: 'Keep the moment',
          body:
            'Save one thing each of you wants to protect as an individual.\n\n' +
            'Then add one way the other person can respect or support it.',
          preserveHere: true,
        },
      ],
    },
  },
  {
    id: 'card-20',
    number: 20,
    prompt: 'What dream would you like me to take seriously?',
    type: 'question',
    group: 'question',
    edition: 'edition-01',
    status: 'sealed',
    content: {
      title: 'What Do You Want Me to Believe In?',
      sections: [
        {
          heading: 'Before you begin',
          body:
            'Some dreams are easy to share. Others feel too uncertain, unrealistic or personal to say aloud.\n\n' +
            'The goal of this card is not to create a plan immediately.\n\n' +
            'It is to give the other person a chance to listen and understand why something matters.',
        },
        {
          heading: 'You could explore',
          bullets: [
            'Is there something you secretly want to try?',
            'What possibility keeps returning to your mind?',
            'What would you pursue if you were less afraid of failing?',
            'What kind of life do you sometimes imagine?',
            'What support would help you take the first step?',
            'Do you want encouragement, practical help or simply to be heard?',
          ],
        },
        {
          heading: 'For the listener',
          body:
            'Do not begin by listing risks or obstacles.\n\n' +
            'Try asking:\n\n' +
            '“What makes this dream meaningful to you?”',
        },
        {
          heading: 'Keep the moment',
          body: 'Save:',
          bullets: [
            'the dream',
            'why it matters',
            'one possible first step, only if the person wants one',
            'a photo or image that represents it',
          ],
          footer: 'Return to this memory whenever the dream begins to feel more real.',
          preserveHere: true,
        },
      ],
    },
  },
];
