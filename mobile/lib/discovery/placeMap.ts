import type { LocalPlace } from '../together';

type MappablePlace = LocalPlace & { lat: number; lng: number };

export function mappablePlaces(places: LocalPlace[]): MappablePlace[] {
  return places.filter((place): place is MappablePlace => (
    typeof place.lat === 'number' && typeof place.lng === 'number'
  ));
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/** Playful, on-brand pin identity per category: a warm fill + a glyph.
 *  The map should feel alive — every pin says what it is at a glance. */
const CATEGORY_STYLE: Record<string, { emoji: string; color: string }> = {
  food: { emoji: '🍴', color: '#CF4B2C' },
  cafe: { emoji: '☕', color: '#B5532E' },
  market: { emoji: '🧺', color: '#E2683C' },
  calm: { emoji: '🍵', color: '#E3B23C' },
  park: { emoji: '🌳', color: '#7C8A66' },
  outdoors: { emoji: '⛰️', color: '#7C8A66' },
  lake: { emoji: '💧', color: '#E08A4F' },
  culture: { emoji: '🎭', color: '#D9477E' },
  create: { emoji: '🎨', color: '#D9477E' },
  play: { emoji: '🎲', color: '#E2683C' },
};
const DEFAULT_STYLE = { emoji: '📍', color: '#3D3830' };

export function buildPlaceMapHtml(places: LocalPlace[], selectedId?: string): string {
  const points = mappablePlaces(places).map((place) => {
    const style = CATEGORY_STYLE[place.category] ?? DEFAULT_STYLE;
    return {
      id: place.id,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      partner: place.isPartner,
      emoji: style.emoji,
      color: place.isPartner ? '#CF4B2C' : style.color,
    };
  });

  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=3, user-scalable=yes" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIINfQ3ynhJb+uPCCp7D5L4itfPpAqjQH3Q=" crossorigin="" />
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; background: #f9f6ef; }
    .leaflet-control-attribution { font: 9px system-ui, sans-serif; }
    .leaflet-control-zoom a {
      color: #1A1A1A;
      border-color: rgba(26,26,26,.12);
    }
    .peak-pin {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; line-height: 1;
      background: #3D3830; border: 3px solid #FAF7F0;
      box-shadow: 0 3px 10px rgba(0,0,0,.18);
      transition: transform .12s ease;
    }
    .peak-pin.partner { border-color: #E3B23C; box-shadow: 0 0 0 2px rgba(227,178,60,.45), 0 3px 10px rgba(0,0,0,.18); }
    .peak-pin.selected { width: 40px; height: 40px; margin: -4px; font-size: 19px; border-width: 4px; border-color: #FAF7F0; box-shadow: 0 0 0 3px #CF4B2C, 0 6px 16px rgba(0,0,0,.24); transform: translateY(-2px); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script>
    // Honest readiness: "map-ready" is only posted once a real tile has painted
    // — not when Leaflet merely initialised. Any hard failure (Leaflet script
    // blocked, both tile providers down) posts "map-failed" so the app can show
    // its connection message instead of a silent grey pane.
    function post(type) { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: type })); }
    try {
      if (typeof L === 'undefined') throw new Error('leaflet blocked');
      const points = ${safeJson(points)};
      const selectedId = ${safeJson(selectedId ?? null)};
      const map = L.map('map', {
        zoomControl: true,
        attributionControl: true,
        dragging: true,
        tap: true,
        touchZoom: true,
        scrollWheelZoom: false
      });
      let tilesShown = false;
      function markReady() {
        if (tilesShown) return;
        tilesShown = true;
        post('map-ready');
      }
      // CARTO can fail to serve tiles (network, rate limit) — fall back to
      // OpenStreetMap on the first tile error; if OSM also never paints, fail.
      let usingFallbackTiles = false;
      const cartoTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);
      const osmTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
      cartoTiles.on('tileload', markReady);
      osmTiles.on('tileload', markReady);
      cartoTiles.on('tileerror', () => {
        if (usingFallbackTiles) return;
        usingFallbackTiles = true;
        map.removeLayer(cartoTiles);
        osmTiles.addTo(map);
      });
      osmTiles.on('tileerror', () => {
        if (!tilesShown) post('map-failed');
      });
      const bounds = [];
      points.forEach((point) => {
        const classes = ['peak-pin', point.partner ? 'partner' : '', point.id === selectedId ? 'selected' : '']
          .filter(Boolean).join(' ');
        const html = '<div class="' + classes + '" style="background:' + point.color + '">' + point.emoji + '</div>';
        const icon = L.divIcon({ className: '', html: html, iconSize: [40, 40], iconAnchor: [20, 20] });
        const marker = L.marker([point.lat, point.lng], { icon, title: point.name }).addTo(map);
        marker.on('click', () => window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'select-place', id: point.id })));
        bounds.push([point.lat, point.lng]);
      });
      const selected = points.find((point) => point.id === selectedId);
      if (selected) map.setView([selected.lat, selected.lng], 14);
      else if (bounds.length) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
      else map.setView([47.2692, 11.4041], 12);
    } catch (e) {
      post('map-failed');
    }
  </script>
</body>
</html>`;
}

export function directionsUrl(place: LocalPlace): string | null {
  if (typeof place.lat !== 'number' || typeof place.lng !== 'number') return null;
  const destination = `${place.lat},${place.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=walking`;
}
