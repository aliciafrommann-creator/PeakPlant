/**
 * Active live-data providers.
 *
 * Beta: all three are null providers (return not_configured, never fabricate data).
 * To enable a real provider, implement the interface and swap the export here —
 * no changes to recommend.ts or any UI code required.
 *
 * Required env vars (none needed for beta, all null):
 *   EXPO_PUBLIC_PLACES_PROVIDER   — 'google' | 'here' | 'osm' | unset
 *   EXPO_PUBLIC_PLACES_API_KEY    — provider API key (publishable)
 *   EXPO_PUBLIC_EVENTS_PROVIDER   — 'ticketmaster' | 'eventbrite' | unset
 *   EXPO_PUBLIC_EVENTS_API_KEY    — provider API key (publishable)
 *   EXPO_PUBLIC_WEATHER_PROVIDER  — 'openweather' | 'weatherapi' | unset
 *   EXPO_PUBLIC_WEATHER_API_KEY   — provider API key (publishable)
 */

export { nullPlacesProvider as placesProvider } from './null';
export { nullEventsProvider as eventsProvider } from './null';
export { nullWeatherProvider as weatherProvider } from './null';

export type { IPlacesProvider, IEventsProvider, IWeatherProvider, ProviderResult, LivePlace, LiveEvent, LiveWeather, GeoCoords } from './interface';
