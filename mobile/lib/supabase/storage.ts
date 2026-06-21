/**
 * Private photo storage for memories.
 *
 * Uploads go to the member-scoped 'memory-photos' bucket (migration 0003) at
 * "<spaceId>/<file>.jpg". Images are re-encoded (which strips EXIF/GPS) and
 * downscaled before upload. Reads use short-lived signed URLs.
 */

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';
import { supabase } from './client';

const BUCKET = 'memory-photos';
const SIGNED_URL_TTL = 60 * 60; // 1 hour

function client() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

/** Re-encode (strip EXIF), downscale, upload. Returns the storage path. */
export async function uploadMemoryPhoto(spaceId: string, localUri: string): Promise<string> {
  const processed = await manipulateAsync(localUri, [{ resize: { width: 1600 } }], {
    compress: 0.8,
    format: SaveFormat.JPEG,
    base64: true,
  });
  if (!processed.base64) throw new Error('Could not process image');

  const path = `${spaceId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await client()
    .storage.from(BUCKET)
    .upload(path, decode(processed.base64), { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return path;
}

/** Short-lived signed URL for a stored path, or undefined. */
export async function signedPhotoUrl(path: string): Promise<string | undefined> {
  const { data } = await client().storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl;
}
