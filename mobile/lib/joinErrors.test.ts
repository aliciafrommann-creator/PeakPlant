import { describe, it, expect } from 'vitest';
import { classifyJoinError } from './joinErrors';

describe('classifyJoinError', () => {
  it('recognises the couple cap from migration 0018', () => {
    expect(classifyJoinError(new Error('space is full'))).toBe('space_full');
    // Postgres wraps the raise in its own prefix when it reaches PostgREST.
    expect(classifyJoinError({ message: 'P0001: space is full' })).toBe('space_full');
  });

  it('recognises the attempt limit', () => {
    expect(classifyJoinError(new Error('too many attempts'))).toBe('too_many_attempts');
  });

  it('still recognises a genuinely wrong code', () => {
    expect(classifyJoinError(new Error('invalid invite code'))).toBe('invalid_code');
  });

  it('recognises a missing session', () => {
    expect(classifyJoinError({ message: 'not authenticated' })).toBe('not_authenticated');
  });

  it('falls back to unknown for anything else, including a dropped connection', () => {
    expect(classifyJoinError(new Error('Network request failed'))).toBe('unknown');
    expect(classifyJoinError(null)).toBe('unknown');
    expect(classifyJoinError(undefined)).toBe('unknown');
    expect(classifyJoinError({})).toBe('unknown');
  });

  it('reads the message out of a PostgREST-shaped error object', () => {
    expect(classifyJoinError({ details: null, message: 'space is full' })).toBe('space_full');
    expect(classifyJoinError('too many attempts')).toBe('too_many_attempts');
  });
});
