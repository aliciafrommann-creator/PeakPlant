import { storage } from './storage';

/**
 * Single-use activation tokens (rare / collectible unlock cards) that have
 * already been redeemed on this device. Everyday prompt cards are reusable and
 * never land here — only `PP1...` activation tokens are recorded, so a second
 * scan of an unlock card is honestly reported as already used.
 *
 * Local-first for the beta: redemption is device-scoped. A server-side ledger
 * (so a token can't be reused across a reinstall) is a documented post-beta
 * hardening step (see docs/QR_FORMAT.md).
 */
const KEY = 'redeemedTokens';

export async function getRedeemedTokens(): Promise<Set<string>> {
  const list = (await storage.get<string[]>(KEY)) ?? [];
  return new Set(list);
}

export async function markTokenRedeemed(token: string): Promise<void> {
  const list = (await storage.get<string[]>(KEY)) ?? [];
  if (list.includes(token)) return;
  // Throws StorageWriteError on failure — the caller must not claim success.
  await storage.set(KEY, [...list, token]);
}
