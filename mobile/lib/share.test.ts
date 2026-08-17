import { describe, it, expect } from 'vitest';
import {
  composeShareText,
  composeInviteText,
  composeIdeaShareText,
  composeDatePlanShareText,
} from './shareText';
import { cardLink, ideaLink, placeLink, inviteLink, APP_BASE_URL } from './links';
import type { Memory, MomentCard, SavedDate } from './types';

const memory: Memory = {
  id: 'm1',
  cardId: 'card-04',
  spaceId: 's1',
  note: 'sunday morning, coffee, your feet on my lap.',
  createdAt: '2026-06-16T09:30:00Z',
  updatedAt: '2026-06-16T09:30:00Z',
};

const card: MomentCard = {
  id: 'card-04',
  number: 4,
  prompt: 'what makes our relationship feel warm?',
  type: 'question',
  edition: 'edition-01',
  status: 'activated',
};

describe('composeShareText', () => {
  it('includes the prompt, the note, and the attribution', () => {
    const text = composeShareText(memory, card);
    expect(text).toContain('what makes our relationship feel warm?');
    expect(text).toContain('sunday morning');
    expect(text).toContain('PeakPlant');
  });

  it('still works without a card', () => {
    const text = composeShareText(memory);
    expect(text).toContain('sunday morning');
    expect(text).toContain('PeakPlant');
    expect(text).not.toContain('warm?');
  });

  it('omits an empty note', () => {
    const text = composeShareText({ ...memory, note: '   ' }, card);
    expect(text).toContain('warm?');
    expect(text).toContain('PeakPlant');
    // no blank note paragraph
    expect(text).not.toMatch(/\n\n\n/);
  });

  it('separates paragraphs with a blank line', () => {
    const text = composeShareText(memory, card);
    expect(text.split('\n\n').length).toBe(3);
  });
});

describe('composeInviteText', () => {
  it('always includes the invite code verbatim', () => {
    const text = composeInviteText('PEAK-ABC123', 'you & me');
    expect(text).toContain('PEAK-ABC123');
  });

  it('names the space when provided', () => {
    const text = composeInviteText('PEAK-ABC123', 'you & me');
    expect(text).toContain('you & me');
  });

  it('works without a space name', () => {
    const text = composeInviteText('PEAK-ABC123');
    expect(text).toContain('PEAK-ABC123');
    expect(text).toContain('PeakPlant');
  });

  it('trims surrounding whitespace from the code', () => {
    // Ein kopierter Code schleppt oft Leerzeichen mit. Beide Stellen müssen
    // trimmen: der Link (sonst entsteht %20 in der URL) und der Klartext.
    const text = composeInviteText('  PEAK-ABC123  ');
    expect(text).toContain(`${APP_BASE_URL}/j/PEAK-ABC123`);
    expect(text).not.toContain('%20');
    expect(text).toContain('(or enter the code by hand: PEAK-ABC123)');
  });

  it('leads with a tappable link that carries the code', () => {
    // Der ganze Sinn einer Einladung ist, jemanden zu erreichen, der noch
    // nicht hier ist. Vorher trug die Nachricht nur den Code: die eingeladene
    // Person musste ihn abtippen, korrekt, in ein Feld neun Bildschirme hinter
    // der Anmeldung. Vier Spaces in Produktion, kein einziger mit einer
    // zweiten Person.
    const text = composeInviteText('PEAK-ABC123');
    expect(text).toContain(inviteLink('PEAK-ABC123'));
    expect(text).toContain(`${APP_BASE_URL}/j/PEAK-ABC123`);
  });

  it('keeps the bare code as a fallback for reading aloud', () => {
    // Links zerbrechen in manchen Chats, und manche Menschen geben den Code
    // am Telefon durch. Der Code bleibt — als Rückfallebene, nicht als Weg.
    const text = composeInviteText('PEAK-ABC123');
    expect(text).toContain('PEAK-ABC123');
  });

  it('does not send anyone hunting for a button', () => {
    // Die alte Anleitung nannte einen Knopf auf einem Bildschirm, auf dem er
    // nicht steht. Jetzt gibt es keine Anleitung mehr, weil es keinen Schritt
    // mehr gibt: der Link tut es.
    const text = composeInviteText('PEAK-ABC123').toLowerCase();
    expect(text).not.toContain('join with code');
    expect(text).not.toContain('welcome screen');
  });

  it('says what the thing is, without overpromising', () => {
    const text = composeInviteText('PEAK-ABC123').toLowerCase();
    expect(text).toContain('nothing in it is public');
  });
});

describe('links', () => {
  it('builds stable card and idea links under the public origin', () => {
    expect(cardLink('card-04')).toBe(`${APP_BASE_URL}/c/card-04`);
    expect(ideaLink('tm-8')).toBe(`${APP_BASE_URL}/i/tm-8`);
    expect(placeLink('google:abc')).toBe(`${APP_BASE_URL}/places/google%3Aabc`);
  });

  it('url-encodes ids defensively', () => {
    expect(ideaLink('a b')).toBe(`${APP_BASE_URL}/i/a%20b`);
  });
});

const planned: SavedDate = {
  id: 'sd1',
  spaceId: 's1',
  momentId: 'tm-8',
  title: 'Sunset walk',
  concept: 'find the highest bench and watch the light go.',
  priceBand: 'free',
  estDurationMin: 60,
  status: 'planned',
  savedAt: '2026-06-20T00:00:00Z',
  plannedFor: 'this Saturday',
  planningNotes: 'I will bring the thermos',
};

describe('composeIdeaShareText', () => {
  it('includes the title, concept, and link', () => {
    const text = composeIdeaShareText('Sunset walk', 'watch the light go.', ideaLink('tm-8'));
    expect(text).toContain('Sunset walk');
    expect(text).toContain('watch the light go.');
    expect(text).toContain(`${APP_BASE_URL}/i/tm-8`);
  });

  it('omits an empty concept without leaving a blank paragraph', () => {
    const text = composeIdeaShareText('Sunset walk', '   ', ideaLink('tm-8'));
    expect(text).not.toMatch(/\n\n\n/);
  });
});

describe('composeDatePlanShareText', () => {
  it('shares title, the when, and the link', () => {
    const text = composeDatePlanShareText(planned, ideaLink(planned.momentId));
    expect(text).toContain('Sunset walk');
    expect(text).toContain('this Saturday');
    expect(text).toContain(`${APP_BASE_URL}/i/tm-8`);
  });

  it('never leaks private planning notes', () => {
    const text = composeDatePlanShareText(planned, ideaLink(planned.momentId));
    expect(text).not.toContain('thermos');
  });

  it('omits the when line when there is no planned time', () => {
    const text = composeDatePlanShareText({ ...planned, plannedFor: undefined }, ideaLink('tm-8'));
    expect(text).not.toContain('When:');
  });
});
