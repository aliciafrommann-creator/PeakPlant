/**
 * Invite codes — the shared key that pairs two people into one space.
 *
 * The generator's alphabet and the validator's pattern MUST stay in lockstep
 * with the database `create_space` check constraint
 * (`^PEAK-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$`, migration 0008): a code the
 * client generates has to pass the server's regex, and a code the partner types
 * has to match what was stored. This module is the single source of truth so the
 * two repository implementations (local + supabase) cannot drift apart.
 */

/** Unambiguous alphabet — no O/0, I/1, etc. so a code is easy to read aloud. */
export const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Must mirror the DB check constraint in migration 0008 (create_space). */
export const INVITE_CODE_PATTERN = /^PEAK-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

/** A fresh `PEAK-XXXXXX` code (~1e9 combos — a 4-digit code was brute-forceable). */
export function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += INVITE_ALPHABET[Math.floor(Math.random() * INVITE_ALPHABET.length)];
  }
  return `PEAK-${code}`;
}

/**
 * Normalize whatever the partner typed into the canonical stored form so a
 * lowercase paste or stray spaces still match. Returns the trimmed/upper code;
 * pair with `isValidInviteCode` to decide whether it is worth sending.
 */
export function normalizeInviteCode(raw: string): string {
  return raw.trim().toUpperCase();
}

/** True when `raw` (after normalization) is a well-formed invite code. */
export function isValidInviteCode(raw: string): boolean {
  return INVITE_CODE_PATTERN.test(normalizeInviteCode(raw));
}
