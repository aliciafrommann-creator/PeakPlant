/**
 * Active live-data providers.
 *
 * Places go through the Supabase `discover` Edge Function so provider keys stay
 * server-side. Events remain null. Weather uses Open-Meteo (no API key).
 *
 * Required secrets / env:
 *   GOOGLE_PLACES_API_KEY                  — Supabase secret, never public
 *   ANTHROPIC_API_KEY                      — optional Supabase secret for ranking
 *   EXPO_PUBLIC_LIVE_PLACES_MONTHLY_LIMIT  — optional local per-device guardrail
 *   EXPO_PUBLIC_EVENTS_PROVIDER   — 'ticketmaster' | 'eventbrite' | unset
 *   EXPO_PUBLIC_EVENTS_API_KEY    — provider API key (publishable)
 *   EXPO_PUBLIC_WEATHER_PROVIDER  — 'openweather' | 'weatherapi' | unset
 *   EXPO_PUBLIC_WEATHER_API_KEY   — provider API key (publishable)
 */

export { supabasePlacesProvider as placesProvider } from './supabasePlaces';
export { nullEventsProvider as eventsProvider } from './null';
// Weather is LIVE: Open-Meteo needs no API key.
export { openMeteoWeather as weatherProvider } from './openMeteo';

export type { IPlacesProvider, IEventsProvider, IWeatherProvider, ProviderResult, LivePlace, LiveEvent, LiveWeather, GeoCoords } from './interface';
