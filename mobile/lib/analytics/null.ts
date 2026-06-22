/**
 * Null analytics provider — no-op, no network calls, no external SDK.
 * Active during the beta. Swap to a real provider in analytics/index.ts
 * once a privacy-reviewed vendor is chosen and the GDPR consent flow is built.
 */
import type { IAnalyticsProvider, AnalyticsEvent } from './events';

export const nullAnalytics: IAnalyticsProvider = {
  id: 'null:analytics',
  configured() { return false; },
  track(_event: AnalyticsEvent) { /* no-op */ },
  identify(_anonymousId: string) { /* no-op */ },
};
