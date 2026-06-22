/**
 * Active notification provider.
 * Beta: nullNotifications — no-op, expo-notifications not integrated.
 * Swap the export here when the real provider is implemented.
 */
export { nullNotifications as notifications } from './null';
export type {
  INotificationProvider,
  NotificationPayload,
  NotificationCategory,
  NotificationPreferences,
} from './types';
export { DEFAULT_NOTIFICATION_PREFS } from './types';
