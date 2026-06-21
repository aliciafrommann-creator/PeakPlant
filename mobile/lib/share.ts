import { Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { composeShareText } from './shareText';
import type { Memory, MomentCard } from './types';

export { composeShareText };

/**
 * Resolve a memory photo to a local file uri suitable for the share sheet.
 * Local file uris are returned as-is; a remote (signed) url is downloaded to the
 * cache first so we share the image itself, not a short-lived private link.
 * Returns null if there's no photo or the download fails.
 */
async function resolveLocalPhoto(photoUri?: string): Promise<string | null> {
  if (!photoUri) return null;
  if (!/^https?:\/\//i.test(photoUri)) return photoUri; // already a local file://
  try {
    const target = `${FileSystem.cacheDirectory}peakplant-share.jpg`;
    const { uri } = await FileSystem.downloadAsync(photoUri, target);
    return uri;
  } catch {
    return null;
  }
}

/** Open the native share sheet for a preserved moment. */
export async function shareMemory(memory: Memory, card?: MomentCard): Promise<void> {
  const message = composeShareText(memory, card);
  const url = await resolveLocalPhoto(memory.photoUri);
  await Share.share(url ? { message, url } : { message });
}
