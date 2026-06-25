import { supabase } from '../../supabase/client';
import type { GeoCoords, IPlacesProvider, LivePlace, ProviderResult } from './interface';

type RawLivePlace = Partial<LivePlace>;

function cleanLivePlaces(input: unknown): LivePlace[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((place): place is RawLivePlace => Boolean(place && typeof place === 'object'))
    .map((place) => ({
      id: typeof place.id === 'string' ? place.id : '',
      name: typeof place.name === 'string' ? place.name : '',
      address: typeof place.address === 'string' ? place.address : '',
      lat: typeof place.lat === 'number' ? place.lat : Number.NaN,
      lng: typeof place.lng === 'number' ? place.lng : Number.NaN,
      category: typeof place.category === 'string' ? place.category : undefined,
      mapsUrl: typeof place.mapsUrl === 'string' ? place.mapsUrl : undefined,
      aiWhy: typeof place.aiWhy === 'string' ? place.aiWhy : undefined,
      signalsUsed: Array.isArray(place.signalsUsed)
        ? place.signalsUsed.filter((signal): signal is string => typeof signal === 'string').slice(0, 5)
        : undefined,
      provenance: place.provenance === 'cached' ? 'cached' as const : 'live' as const,
      fetchedAt: typeof place.fetchedAt === 'string' ? place.fetchedAt : new Date().toISOString(),
      sourceId: typeof place.sourceId === 'string' ? place.sourceId : 'supabase-discover',
    }))
    .filter((place) => (
      place.id.length > 0
      && place.name.length > 0
      && Number.isFinite(place.lat)
      && Number.isFinite(place.lng)
    ));
}

function reasonFromData(data: unknown): ProviderResult<LivePlace[]> | null {
  if (!data || typeof data !== 'object') return null;
  const error = (data as { error?: unknown }).error;
  const reason = (data as { reason?: unknown }).reason;
  if (error === 'not_configured' || reason === 'not_configured') return { ok: false, reason: 'not_configured' };
  if (error === 'rate_limited' || reason === 'rate_limited') return { ok: false, reason: 'rate_limited' };
  if (error === 'no_results' || reason === 'no_results') return { ok: false, reason: 'no_results' };
  return null;
}

export const supabasePlacesProvider: IPlacesProvider = {
  id: 'supabase:google-places',
  configured() {
    return Boolean(supabase);
  },
  async search(query: string, near?: GeoCoords, radiusKm = 3): Promise<ProviderResult<LivePlace[]>> {
    if (!supabase || !near) return { ok: false, reason: 'not_configured' };
    try {
      const { data, error } = await supabase.functions.invoke('discover', {
        body: {
          mode: 'live_places',
          query,
          near,
          radiusKm,
          limit: 6,
          constraints: {
            vibe: 'welcoming, easy, cute date-friendly places',
          },
        },
      });
      if (error) return { ok: false, reason: 'network_error' };
      const explicitReason = reasonFromData(data);
      if (explicitReason) return explicitReason;
      const places = cleanLivePlaces((data as { places?: unknown } | null)?.places);
      if (places.length === 0) return { ok: false, reason: 'no_results' };
      return { ok: true, data: places };
    } catch {
      return { ok: false, reason: 'network_error' };
    }
  },
};
