/**
 * Custom places — "unser Ort". A couple/friends space can add its own places
 * (the café where you met, your bench, the kiosk on the corner) so the loop
 * plan → done → moment works for places WE know, not only curated or live
 * ones. Stored locally, space-scoped; no coordinates (nothing is guessed —
 * a custom place lives in the list, not on the map, until real coords exist).
 */
import { storage } from './storage';
import type { LocalPlace } from './together';

const KEY = 'customPlaces';

interface StoredCustomPlace {
  id: string;
  name: string;
  /** Free-text area/address the person typed — shown verbatim. */
  area: string;
  createdAt: string;
}

type CustomPlaceMap = Record<string, StoredCustomPlace[]>;

function toLocalPlace(p: StoredCustomPlace): LocalPlace {
  return {
    id: p.id,
    name: p.name,
    category: 'custom',
    area: p.area,
    isPartner: false,
    priceBand: 'free',
    accessibility: [],
    tags: ['custom'],
    // The person themselves is the source — never presented as verified.
    provenance: 'needs-confirmation',
    lastVerifiedAt: p.createdAt,
  };
}

export async function getCustomPlaces(spaceId: string): Promise<LocalPlace[]> {
  const all = (await storage.get<CustomPlaceMap>(KEY)) ?? {};
  return (all[spaceId] ?? []).map(toLocalPlace);
}

export async function addCustomPlace(
  spaceId: string,
  name: string,
  area: string,
): Promise<LocalPlace> {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error('name required');
  const entry: StoredCustomPlace = {
    id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: trimmedName,
    area: area.trim(),
    createdAt: new Date().toISOString(),
  };
  const all = (await storage.get<CustomPlaceMap>(KEY)) ?? {};
  all[spaceId] = [...(all[spaceId] ?? []), entry];
  await storage.set(KEY, all);
  return toLocalPlace(entry);
}

export async function removeCustomPlace(spaceId: string, placeId: string): Promise<void> {
  const all = (await storage.get<CustomPlaceMap>(KEY)) ?? {};
  all[spaceId] = (all[spaceId] ?? []).filter((p) => p.id !== placeId);
  await storage.set(KEY, all);
}
