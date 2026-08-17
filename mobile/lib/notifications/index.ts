/**
 * Der aktive Provider.
 *
 * Er wählt sich selbst: Ist `expo-notifications` im Build vorhanden (also nach
 * einem EAS-/TestFlight-Build), stellt der echte Provider zu; sonst bleibt der
 * No-op-Provider aktiv. So gibt es keinen Schalter, den jemand vergessen kann
 * — und in Tests, in Expo Go und im Web passiert garantiert nichts.
 *
 * Die Regeln, WANN gesendet werden darf, stehen in ./policy (Frequenz,
 * Nachtruhe, Abmeldung, keine Inhalte im Sperrbildschirm) — freigegeben von
 * Alicia am 17.08.2026.
 */
import { expoNotifications } from './expo';
import { nullNotifications } from './null';

export const notifications = expoNotifications.configured() ? expoNotifications : nullNotifications;

export { expoNotifications, getExpoPushToken } from './expo';
export { nullNotifications } from './null';
export {
  decideDelivery,
  composePartnerMomentPush,
  composePartnerJoinedPush,
  MAX_PER_DAY_PER_SPACE,
  QUIET_HOURS,
} from './policy';
export type { Decision, SendRecord } from './policy';
export { registerPushToken } from './register';
export type { PushPlatform, TokenStore, RegisterResult } from './register';
export type {
  INotificationProvider,
  NotificationPayload,
  NotificationCategory,
  NotificationPreferences,
} from './types';
export { DEFAULT_NOTIFICATION_PREFS } from './types';
