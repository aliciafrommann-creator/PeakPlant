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

export function buildPlaceMapHtml(places: LocalPlace[], selectedId?: string): string {
  const points = mappablePlaces(places).map((place) => ({
    id: place.id,
    name: place.name,
    lat: place.lat,
    lng: place.lng,
    partner: place.isPartner,
  }));

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
      width: 24px; height: 24px; border-radius: 50%;
      background: #3D3830; border: 3px solid #FAF7F0;
      box-shadow: 0 2px 10px rgba(0,0,0,.14);
    }
    .peak-pin.partner { background: #CF4B2C; border-color: #FAF7F0; }
    .peak-pin.selected { width: 30px; height: 30px; margin: -3px; border-width: 4px; border-color: #CF4B2C; background: #1E1C1A; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script>
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
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);
    const bounds = [];
    points.forEach((point) => {
      const classes = ['peak-pin', point.partner ? 'partner' : '', point.id === selectedId ? 'selected' : '']
        .filter(Boolean).join(' ');
      const icon = L.divIcon({ className: '', html: '<div class="' + classes + '"></div>', iconSize: [30, 30], iconAnchor: [15, 15] });
      const marker = L.marker([point.lat, point.lng], { icon, title: point.name }).addTo(map);
      marker.on('click', () => window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'select-place', id: point.id })));
      bounds.push([point.lat, point.lng]);
    });
    const selected = points.find((point) => point.id === selectedId);
    if (selected) map.setView([selected.lat, selected.lng], 14);
    else if (bounds.length) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
    else map.setView([47.2692, 11.4041], 12);
    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'map-ready' }));
  </script>
</body>
</html>`;
}

export function directionsUrl(place: LocalPlace): string | null {
  if (typeof place.lat !== 'number' || typeof place.lng !== 'number') return null;
  const destination = `${place.lat},${place.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=walking`;
}
