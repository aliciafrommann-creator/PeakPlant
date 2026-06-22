/**
 * PeakPlant product analytics — privacy-safe, minimum viable funnel.
 *
 * Privacy contracts (PP-023 / SECURITY.md §Analytics):
 *   - NO diary text, note content, prompt answers, or any couple-private data
 *   - NO card content, edition titles, or identifiable moment text
 *   - NO photos, photo URIs, or image metadata
 *   - NO location, device ID, or fingerprinting signals
 *   - Event names and properties describe *actions* and *states*, not content
 *   - All user-controllable text inputs are EXCLUDED from every event
 *   - Space IDs are included ONLY as opaque, rotating session keys
 *
 * Allowed: funnel steps, feature names, error types (no stack traces), counts,
 *          durations, anonymous session ids, and A/B treatment labels.
 *
 * Beta status: nullAnalytics (no-op). Wire a real adapter in analytics/index.ts
 * when a privacy-reviewed provider is chosen.
 */

/**
 * Every tracked action in the app. Extend this union — do not use free-form
 * strings at call sites, so all events are auditable from this file.
 */
export type AnalyticsEvent =
  // Onboarding
  | { name: 'onboarding_started' }
  | { name: 'onboarding_goal_selected'; props: { goalCount: number } }
  | { name: 'onboarding_completed'; props: { language: string } }
  // Auth
  | { name: 'auth_otp_requested' }
  | { name: 'auth_otp_verified' }
  | { name: 'auth_signed_out' }
  | { name: 'auth_account_deleted' }
  // QR / scanning
  | { name: 'qr_scan_started' }
  | { name: 'qr_scan_outcome'; props: { outcome: 'ok' | 'malformed' | 'unknown_card' | 'expired' | 'used' } }
  | { name: 'qr_camera_permission_denied' }
  // Discovery
  | { name: 'discover_recommendation_shown'; props: { source: 'deterministic' | 'ai' | 'fallback' } }
  | { name: 'discover_show_another' }
  | { name: 'discover_filter_applied'; props: { filterKey: string; active: boolean } }
  | { name: 'discover_idea_saved' }
  | { name: 'discover_idea_opened' }
  // Saved ideas / planning
  | { name: 'saved_idea_planned' }
  | { name: 'saved_idea_completed' }
  | { name: 'saved_idea_cancelled' }
  | { name: 'saved_idea_dismissed' }
  | { name: 'saved_idea_shared' }
  | { name: 'saved_calendar_exported' }
  // Memory / diary
  | { name: 'memory_created'; props: { hasPhoto: boolean } }
  | { name: 'memory_edited' }
  | { name: 'memory_deleted' }
  | { name: 'memory_shared' }
  // Feedback (post-completion)
  | { name: 'feedback_submitted'; props: { rating: number; hasTip: boolean } }
  | { name: 'feedback_skipped' }
  // Spaces
  | { name: 'space_created'; props: { spaceType: string } }
  | { name: 'space_joined' }
  | { name: 'space_switched' }
  // Ask PeakPlant
  | { name: 'ask_message_sent' }
  | { name: 'ask_recommendation_tapped' }
  // Errors (no stack traces, no user content)
  | { name: 'error_occurred'; props: { context: string; errorType: string } };

export interface IAnalyticsProvider {
  readonly id: string;
  configured(): boolean;
  track(event: AnalyticsEvent): void;
  /** Called once per session, before any track() calls. */
  identify(anonymousId: string): void;
}
