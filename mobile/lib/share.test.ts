import { describe, it, expect } from 'vitest';
import { composeShareText } from './shareText';
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
