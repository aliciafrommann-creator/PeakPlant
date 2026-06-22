import { describe, it, expect } from 'vitest';
import {
  INVITE_CODE_PATTERN,
  generateInviteCode,
  isValidInviteCode,
  normalizeInviteCode,
} from './invite';

describe('invite codes — the pairing key', () => {
  it('generates codes that the DB create_space regex accepts', () => {
    for (let i = 0; i < 500; i++) {
      const code = generateInviteCode();
      expect(code).toMatch(INVITE_CODE_PATTERN);
      // round-trip: a generated code is already canonical, so normalize is a no-op
      expect(normalizeInviteCode(code)).toBe(code);
    }
  });

  it('never emits ambiguous characters (no O/0, I/1, etc.)', () => {
    const body = generateInviteCode().slice('PEAK-'.length);
    expect(body).not.toMatch(/[O0I1]/);
  });

  it('normalizes what the partner types so a sloppy paste still matches', () => {
    expect(normalizeInviteCode('  peak-abc234 ')).toBe('PEAK-ABC234');
    expect(isValidInviteCode('  peak-abc234 ')).toBe(true);
  });

  it('rejects malformed codes the partner might type', () => {
    expect(isValidInviteCode('')).toBe(false);
    expect(isValidInviteCode('PEAK-ABC23')).toBe(false); // too short
    expect(isValidInviteCode('PEAK-ABC2345')).toBe(false); // too long
    expect(isValidInviteCode('ABC234')).toBe(false); // missing prefix
    expect(isValidInviteCode('PEAK-ABCD01')).toBe(false); // contains 0/1
  });
});
