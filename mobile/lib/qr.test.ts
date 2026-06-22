import { describe, it, expect } from 'vitest';
import {
  parseCardQr,
  parseActivationToken,
  parseScan,
  resolveScan,
} from './qr';

describe('parseCardQr', () => {
  it('accepts a bare card id', () => {
    expect(parseCardQr('card-04')).toBe('card-04');
    expect(parseCardQr('card-20')).toBe('card-20');
  });

  it('accepts the custom scheme deep link', () => {
    expect(parseCardQr('peakplant://card/card-12')).toBe('card-12');
  });

  it('accepts an https url with a long or short path', () => {
    expect(parseCardQr('https://peak-plant.com/card/card-07')).toBe('card-07');
    expect(parseCardQr('https://peak-plant.com/c/card-01')).toBe('card-01');
  });

  it('ignores query strings and fragments', () => {
    expect(parseCardQr('https://peak-plant.com/c/card-03?ref=box#x')).toBe('card-03');
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

describe('parseActivationToken', () => {
  it('parses a bare token', () => {
    const tok = parseActivationToken('PP1.card-12.20271231.a3f9c2');
    expect(tok).toEqual({
      raw: 'PP1.card-12.20271231.a3f9c2',
      version: 'PP1',
      cardId: 'card-12',
      expiry: '20271231',
      nonce: 'a3f9c2',
    });
  });

  it('unwraps a token from a custom-scheme or https route', () => {
    expect(parseActivationToken('peakplant://t/PP1.card-12.20271231.a3f9c2')?.cardId).toBe('card-12');
    expect(parseActivationToken('https://peak-plant.com/t/PP1.card-05.20300101.deadbeef')?.cardId).toBe('card-05');
  });

  it('rejects wrong version, bad card id, bad expiry, bad nonce', () => {
    expect(parseActivationToken('PP0.card-12.20271231.a3f9c2')).toBeNull();
    expect(parseActivationToken('PP1.cardX.20271231.a3f9c2')).toBeNull();
    expect(parseActivationToken('PP1.card-12.2027.a3f9c2')).toBeNull();
    expect(parseActivationToken('PP1.card-12.20271231.!!')).toBeNull();
    expect(parseActivationToken('PP1.card-12.20271231')).toBeNull();
    expect(parseActivationToken('card-12')).toBeNull();
    expect(parseActivationToken('')).toBeNull();
    expect(parseActivationToken(null)).toBeNull();
  });
});

describe('parseScan', () => {
  it('classifies a card reference', () => {
    expect(parseScan('card-04')).toEqual({ kind: 'card', cardId: 'card-04' });
    expect(parseScan('peakplant://card/card-04')).toEqual({ kind: 'card', cardId: 'card-04' });
  });

  it('classifies an activation token', () => {
    const r = parseScan('PP1.card-12.20271231.a3f9c2');
    expect(r.kind).toBe('token');
  });

  it('classifies junk as invalid', () => {
    expect(parseScan('https://example.com')).toEqual({ kind: 'invalid' });
    expect(parseScan('')).toEqual({ kind: 'invalid' });
  });
});

describe('resolveScan', () => {
  const exists = (id: string) => ['card-01', 'card-04', 'card-12'].includes(id);
  const now = new Date('2026-06-22T12:00:00Z');

  it('opens a known card reference', () => {
    expect(resolveScan('card-04', { cardExists: exists, now })).toEqual({
      status: 'ok',
      cardId: 'card-04',
    });
  });

  it('reports an unknown card reference', () => {
    expect(resolveScan('card-99', { cardExists: exists, now })).toEqual({
      status: 'unknown_card',
      cardId: 'card-99',
    });
  });

  it('reports malformed payloads', () => {
    expect(resolveScan('https://example.com', { cardExists: exists, now })).toEqual({ status: 'malformed' });
    expect(resolveScan(null, { cardExists: exists, now })).toEqual({ status: 'malformed' });
  });

  it('opens a valid activation token and reports its token for redemption', () => {
    expect(resolveScan('PP1.card-12.20271231.a3f9c2', { cardExists: exists, now })).toEqual({
      status: 'ok',
      cardId: 'card-12',
      token: 'PP1.card-12.20271231.a3f9c2',
    });
  });

  it('reports an expired token', () => {
    // expired the day before "now"
    expect(resolveScan('PP1.card-12.20260621.a3f9c2', { cardExists: exists, now })).toEqual({ status: 'expired' });
  });

  it('treats the expiry day as still valid (inclusive)', () => {
    expect(resolveScan('PP1.card-12.20260622.a3f9c2', { cardExists: exists, now }).status).toBe('ok');
  });

  it('reports an already-used token', () => {
    const usedTokens = new Set(['PP1.card-12.20271231.a3f9c2']);
    expect(resolveScan('PP1.card-12.20271231.a3f9c2', { cardExists: exists, now, usedTokens })).toEqual({
      status: 'used',
    });
  });

  it('reports an unknown card before checking expiry or use', () => {
    const usedTokens = new Set(['PP1.card-77.20200101.aaaa']);
    expect(resolveScan('PP1.card-77.20200101.aaaa', { cardExists: exists, now, usedTokens })).toEqual({
      status: 'unknown_card',
      cardId: 'card-77',
    });
  });
});
