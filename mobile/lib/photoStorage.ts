import * as FileSystem from 'expo-file-system';
import { isSupabaseConfigured } from './supabase/client';

/**
 * Make a freshly-picked photo survive.
 *
 * expo-image-picker returns a file:// URI inside the app CACHE directory. The
 * OS may evict that file at any time, so persisting the raw URI (local mode)
 * means the photo silently disappears later — the top "my photo is gone" bug.
 *
 * In Supabase mode the photo is uploaded to cloud storage right after picking,
 * so the cache URI only needs to live for seconds — no copy needed. In local
 * mode we copy it into the permanent documentDirectory first and store THAT
 * path. Best-effort: if the copy fails we fall back to the original URI rather
 * than blocking the save.
 */
export async function persistPickedPhoto(uri: string, prefix: string): Promise<string> {
  if (isSupabaseConfigured) return uri; // uploaded to cloud immediately — cache is fine
  const dir = FileSystem.documentDirectory;
  if (!dir || !uri.startsWith('file://')) return uri;
  if (uri.startsWith(dir)) return uri; // already permanent
  const ext = uri.includes('.') ? uri.slice(uri.lastIndexOf('.')).split('?')[0] : '.jpg';
  const to = `${dir}${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  try {
    await FileSystem.copyAsync({ from: uri, to });
    return to;
  } catch {
    return uri;
  }
}
