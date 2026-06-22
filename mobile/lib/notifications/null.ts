/**
 * Null notification provider — no-op.
 *
 * Active during the beta (expo-notifications not yet integrated).
 * To enable real notifications:
 *   1. Add expo-notifications to package.json + run eas build
 *   2. Implement INotificationProvider wrapping expo-notifications
 *   3. Add FCM/APNs keys and config to app.json
 *   4. Add GDPR consent check before requestPermission()
 *   5. Swap the export in notifications/index.ts
 *   6. Apply user prefs before any schedule() call (always check prefs.category)
 *
 * Privacy: when implementing, NEVER put diary/note/prompt text in the body.
 * See notifications/types.ts for the per-category privacy contracts.
 */

import type { INotificationProvider, NotificationPayload, NotificationPreferences, NotificationCategory } from './types';

export const nullNotifications: INotificationProvider = {
  id: 'null:notifications',
  configured() { return false; },
  async requestPermission() { return false; },
  async schedule(_payload: NotificationPayload, _prefs: NotificationPreferences) { /* no-op */ },
  async cancelCategory(_category: NotificationCategory) { /* no-op */ },
  async cancelAll() { /* no-op */ },
};
