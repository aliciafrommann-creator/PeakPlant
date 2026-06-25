import { Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { composeShareText, composeIdeaShareText, composeDatePlanShareText } from './shareText';
import { ideaLink, placeLink } from './links';
import type { Memory, MomentCard, SavedDate } from './types';

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

/**
 * Open the native share sheet for a saved date idea or plan. A planned date
 * shares its "when"; anything else shares the idea. Only the public idea + its
 * stable link are sent — never private notes or space data.
 */
export async function shareSavedDate(saved: SavedDate): Promise<void> {
  const link = saved.momentId.startsWith('place:')
    ? placeLink(saved.momentId.slice('place:'.length))
    : ideaLink(saved.momentId);
  const message =
    saved.status === 'planned'
      ? composeDatePlanShareText(saved, link)
      : composeIdeaShareText(saved.title, saved.concept, link);
  await Share.share({ message });
}
