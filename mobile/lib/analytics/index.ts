/**
 * Active analytics provider.
 *
 * Beta: nullAnalytics — no-op, no network calls, no external SDK.
 *
 * To enable analytics:
 * 1. Choose a privacy-reviewed provider (e.g. PostHog self-hosted, Plausible)
 * 2. Implement IAnalyticsProvider in e.g. analytics/posthog.ts
 * 3. Swap the export below
 * 4. Add EXPO_PUBLIC_ANALYTICS_KEY to env
 * 5. Wire a GDPR consent check before identify() is called
 *
 * NEVER log: diary text, notes, photo URIs, location, or any couple-private data.
 * See analytics/events.ts for the complete allowed-event list.
 */

export { nullAnalytics as analytics } from './null';
export type { IAnalyticsProvider, AnalyticsEvent } from './events';
