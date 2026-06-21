import { describe, it, expect } from 'vitest';
import { parseCardQr } from './qr';

describe('parseCardQr', () => {
  it('accepts a bare card id', () => {
    expect(parseCardQr('card-04')).toBe('card-04');
    expect(parseCardQr('card-20')).toBe('card-20');
  });

  it('accepts the custom scheme deep link', () => {
    expect(parseCardQr('peakplant://card/card-12')).toBe('card-12');
  });

  it('accepts an https url with a long or short path', () => {
    expect(parseCardQr('https://peakplant.app/card/card-07')).toBe('card-07');
    expect(parseCardQr('https://peakplant.app/c/card-01')).toBe('card-01');
  });

  it('ignores query strings and fragments', () => {
    expect(parseCardQr('https://peakplant.app/card/card-03?ref=box#x')).toBe('card-03');
  });

  it('trims surrounding whitespace', () => {
    expect(parseCardQr('  card-09  ')).toBe('card-09');
  });

  it('rejects unrelated or malformed payloads', () => {
    expect(parseCardQr('https://example.com/login')).toBeNull();
    expect(parseCardQr('cardXYZ')).toBeNull();
    expect(parseCardQr('card-')).toBeNull();
    expect(parseCardQr('')).toBeNull();
    expect(parseCardQr(null)).toBeNull();
    expect(parseCardQr(undefined)).toBeNull();
  });
});
