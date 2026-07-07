import { describe, expect, it } from 'vitest';
import type { LocalPlace } from '../together';
import { buildPlaceMapHtml, directionsUrl, mappablePlaces } from './placeMap';

const place: LocalPlace = {
  id: 'p-1',
  name: 'Test Place',
  category: 'park',
  area: 'Innsbruck',
  isPartner: false,
  priceBand: 'free',
  accessibility: [],
  tags: [],
  provenance: 'curated',
  lastVerifiedAt: '2026-06-01',
  lat: 47.2,
  lng: 11.4,
};

describe('place map', () => {
  it('keeps only places with real coordinates', () => {
    expect(mappablePlaces([place, { ...place, id: 'p-2', lat: undefined }]).map((p) => p.id)).toEqual(['p-1']);
  });

  it('builds an attributed map with selectable markers', () => {
    const html = buildPlaceMapHtml([place], place.id);
    expect(html).toContain('openstreetmap.org');
    expect(html).toContain('basemaps.cartocdn.com');
    expect(html).toContain('select-place');
    expect(html).toContain('"p-1"');
    expect(html).toContain('selected');
  });

  it('reports readiness honestly — ready only when tiles paint, failure surfaced', () => {
    const html = buildPlaceMapHtml([place]);
    // "map-ready" must be tied to a painted tile, not Leaflet merely booting:
    // exactly one post site (inside markReady), guarded by the tileload hook.
    expect(html).toContain('tileload');
    expect((html.match(/post\('map-ready'\)/g) ?? []).length).toBe(1);
    // Hard failures (Leaflet blocked, both tile providers down) must surface.
    expect(html).toContain('map-failed');
    expect(html).toContain('catch');
  });

  it('escapes markup embedded in static place names', () => {
    const html = buildPlaceMapHtml([{ ...place, name: '</script><script>alert(1)</script>' }]);
    expect(html).not.toContain('</script><script>alert(1)</script>');
    expect(html).toContain('\\u003c/script>');
  });

  it('creates an external directions URL only for positioned places', () => {
    expect(directionsUrl(place)).toContain('destination=47.2%2C11.4');
    expect(directionsUrl({ ...place, lat: undefined })).toBeNull();
  });
});
