/**
 * PeakPlant push notification type system.
 *
 * Privacy contracts (PP-031):
 *  - Notification BODY must never contain: diary notes, card prompt text,
 *    partner messages, photo references, or any intimate couple content.
 *  - Titles are generic (e.g. "PeakPlant") or category-level ("your date plan").
 *  - Deep-link payloads carry only catalog ids (card id, moment id) or
 *    stable resource ids (space id for routing) — never private content.
 *  - If a notification would require private content in the body to be useful,
 *    do not send it. The user opens the app to see the content.
 *
 * Categories and their privacy limits are documented at each type.
 */

/**
 * All notification categories. Each corresponds to a user preference toggle.
 * Users can opt out of any category without affecting app functionality.
 */
export type NotificationCategory =
  | 'date_plan_reminder'   // "you have a date plan coming up"
  | 'streak_at_risk'       // "your streak is at risk"
  | 'partner_activity'     // "your partner added a moment" (no content)
  | 'weekly_recap';        // "your week in PeakPlant" (no content, open app to see)

/** User preferences for each notification category. */
export type NotificationPreferences = Record<NotificationCategory, boolean>;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  date_plan_reminder: true,
  streak_at_risk: true,
  partner_activity: false,   // opt-in by default (privacy-first)
  weekly_recap: false,       // opt-in by default
};

/**
 * A notification payload. The `body` must comply with privacy contracts —
 * see the per-category limits above. The `deepLink` carries only ids.
 */
export interface NotificationPayload {
  category: NotificationCategory;
  title: string;
  /** Generic body — no private content. If body would require private content, omit it. */
  body?: string;
  /** Catalog id or routing id only — no note text, no photo refs. */
  deepLink?: string;
  /** When to deliver. Omit for immediate. */
  scheduledFor?: string;
}

export interface INotificationProvider {
  readonly id: string;
  configured(): boolean;
  /** Request permission and return whether it was granted. */
  requestPermission(): Promise<boolean>;
  /** Schedule or send a notification, respecting user prefs. */
  schedule(payload: NotificationPayload, prefs: NotificationPreferences): Promise<void>;
  /** Cancel all scheduled notifications for this category. */
  cancelCategory(category: NotificationCategory): Promise<void>;
  /** Cancel all scheduled notifications. */
  cancelAll(): Promise<void>;
}
