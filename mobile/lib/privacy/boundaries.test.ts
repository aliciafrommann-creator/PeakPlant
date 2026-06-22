import { describe, it, expect } from 'vitest';
import {
  validateFeedbackTip,
  sanitiseTip,
  assertNotPrivateContent,
  validateShareableLink,
  TIP_MAX_LENGTH,
} from './boundaries';

describe('validateFeedbackTip', () => {
  it('accepts an undefined tip (no feedback)', () => {
    expect(validateFeedbackTip(undefined).ok).toBe(true);
  });

  it('accepts an empty string tip', () => {
    expect(validateFeedbackTip('').ok).toBe(true);
  });

  it('accepts a short practical tip', () => {
    expect(validateFeedbackTip('bring a blanket — it gets cold').ok).toBe(true);
  });

  it(`rejects a tip longer than ${TIP_MAX_LENGTH} chars`, () => {
    const long = 'a'.repeat(TIP_MAX_LENGTH + 1);
    const result = validateFeedbackTip(long);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('280');
  });

  it('accepts a tip of exactly the maximum length', () => {
    const exact = 'a'.repeat(TIP_MAX_LENGTH);
    expect(validateFeedbackTip(exact).ok).toBe(true);
  });
});

describe('sanitiseTip', () => {
  it('trims whitespace', () => {
    expect(sanitiseTip('  great spot  ')).toBe('great spot');
  });

  it('returns undefined for empty or whitespace-only', () => {
    expect(sanitiseTip('')).toBeUndefined();
    expect(sanitiseTip('   ')).toBeUndefined();
    expect(sanitiseTip(undefined)).toBeUndefined();
  });

  it('truncates at TIP_MAX_LENGTH', () => {
    const over = 'b'.repeat(TIP_MAX_LENGTH + 50);
    const result = sanitiseTip(over);
    expect(result?.length).toBe(TIP_MAX_LENGTH);
  });
});

describe('assertNotPrivateContent', () => {
  it('passes when the public value does not match any private field', () => {
    const result = assertNotPrivateContent(
      'bring a blanket',
      { planningNotes: 'book the restaurant at 7pm', diaryNote: 'i love you so much' },
    );
    expect(result.ok).toBe(true);
  });

  it('fails when the public value is identical to a private field', () => {
    const privateNote = 'this is our private reflection';
    const result = assertNotPrivateContent(
      privateNote,
      { diaryNote: privateNote },
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('diaryNote');
  });

  it('passes for undefined public value', () => {
    expect(assertNotPrivateContent(undefined, { note: 'secret' }).ok).toBe(true);
  });
});

describe('validateShareableLink', () => {
  it('accepts a card link', () => {
    expect(validateShareableLink('https://peak-plant.com/c/card-01').ok).toBe(true);
  });

  it('accepts an idea link', () => {
    expect(validateShareableLink('https://peak-plant.com/i/moment-42').ok).toBe(true);
  });

  it('rejects a link with a space id or member id in the path', () => {
    expect(validateShareableLink('https://peak-plant.com/space/abc123').ok).toBe(false);
  });

  it('rejects a link with query parameters (could carry private context)', () => {
    expect(validateShareableLink('https://peak-plant.com/c/card-01?spaceId=xyz').ok).toBe(false);
  });

  it('rejects non-URLs', () => {
    expect(validateShareableLink('not-a-url').ok).toBe(false);
  });

  it('shareable links from the codebase pass validation (links.ts contract)', () => {
    const cardLink = 'https://peak-plant.com/c/card-01';
    const ideaLink = 'https://peak-plant.com/i/moment-42';
    expect(validateShareableLink(cardLink).ok).toBe(true);
    expect(validateShareableLink(ideaLink).ok).toBe(true);
  });
});
