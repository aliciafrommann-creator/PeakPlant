import { storage } from './storage';

function emojiKey(spaceId: string) {
  return `space_emoji_${spaceId}`;
}

export async function getSpaceEmoji(spaceId: string): Promise<string | undefined> {
  return (await storage.get<string>(emojiKey(spaceId))) ?? undefined;
}

export async function setSpaceEmoji(spaceId: string, emoji: string): Promise<void> {
  await storage.set(emojiKey(spaceId), emoji);
}
