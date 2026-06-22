import { describe, it, expect } from 'vitest';
import { composeShareText, composeInviteText } from './shareText';
import type { Memory, MomentCard } from './types';

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
    const text = composeInviteText('  PEAK-ABC123  ');
    expect(text).toContain('Your invite code: PEAK-ABC123\n');
  });

  it('tells the recipient how to redeem the code', () => {
    const text = composeInviteText('PEAK-ABC123');
    expect(text.toLowerCase()).toContain('join with code');
  });
});
