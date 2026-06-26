/**
 * Private photo storage.
 *
 * Memory photos go to the member-scoped 'memory-photos' bucket (migration 0003)
 * at "<spaceId>/<file>.jpg". Space avatars go to the separate member-scoped
 * 'space-avatars' bucket (migration 0012) — a shared identity image, kept apart
 * from private memories. Both re-encode (stripping EXIF/GPS) and downscale
 * before upload; reads use short-lived signed URLs.
 */

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';
import { supabase } from './client';

const BUCKET = 'memory-photos';
const AVATAR_BUCKET = 'space-avatars';
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

/** Remove a private memory photo by its storage path. */
export async function deleteMemoryPhoto(path: string): Promise<void> {
  const { error } = await client().storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

/** Short-lived signed URL for a stored path, or undefined. */
export async function signedPhotoUrl(path: string): Promise<string | undefined> {
  const { data, error } = await client().storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  if (error) throw error;
  return data?.signedUrl;
}

// ── Space avatars (shared identity, member-scoped) ───────────────────────────

/**
 * Re-encode (strip EXIF), crop to a square-ish avatar, upload. Returns the
 * storage path. One avatar per space — old files are overwritten by a fresh
 * timestamped path; the caller updates `spaces.avatar_path` to point at it.
 */
export async function uploadSpaceAvatar(spaceId: string, localUri: string): Promise<string> {
  const processed = await manipulateAsync(localUri, [{ resize: { width: 512, height: 512 } }], {
    compress: 0.8,
    format: SaveFormat.JPEG,
    base64: true,
  });
  if (!processed.base64) throw new Error('Could not process image');

  const path = `${spaceId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await client()
    .storage.from(AVATAR_BUCKET)
    .upload(path, decode(processed.base64), { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return path;
}

/** Remove a space avatar by its storage path. Best-effort. */
export async function deleteSpaceAvatar(path: string): Promise<void> {
  const { error } = await client().storage.from(AVATAR_BUCKET).remove([path]);
  if (error) throw error;
}

/** Short-lived signed URL for a space avatar path, or undefined. */
export async function signedAvatarUrl(path: string): Promise<string | undefined> {
  const { data, error } = await client()
    .storage.from(AVATAR_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error) throw error;
  return data?.signedUrl;
}
