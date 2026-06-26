import { storage } from './storage';

/** The collectible a couple earns per completed challenge, if they pick nothing. */
export const DEFAULT_COLLECTIBLE_EMOJI = '🌶️';

function emojiKey(spaceId: string) {
  return `space_emoji_${spaceId}`;
}

function collectibleKey(spaceId: string) {
  return `space_collectible_${spaceId}`;
}

export async function getSpaceEmoji(spaceId: string): Promise<string | undefined> {
  return (await storage.get<string>(emojiKey(spaceId))) ?? undefined;
}

export async function setSpaceEmoji(spaceId: string, emoji: string): Promise<void> {
  await storage.set(emojiKey(spaceId), emoji);
}

/** The couple's freely-chosen collectible emoji, stamped per completed challenge. */
export async function getCollectibleEmoji(spaceId: string): Promise<string | undefined> {
  return (await storage.get<string>(collectibleKey(spaceId))) ?? undefined;
}

export async function setCollectibleEmoji(spaceId: string, emoji: string): Promise<void> {
  await storage.set(collectibleKey(spaceId), emoji);
}
