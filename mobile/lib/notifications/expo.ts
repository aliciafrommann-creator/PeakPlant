import type {
  INotificationProvider,
  NotificationPayload,
  NotificationPreferences,
  NotificationCategory,
} from './types';

/**
 * Der echte Provider (expo-notifications).
 *
 * Er ist bewusst dumm: Er stellt zu, was ihm gegeben wird, und prüft davor nur
 * die eine Sache, die er selbst wissen kann — hat dieser Mensch diese Kategorie
 * überhaupt erlaubt. Die Frequenz-Obergrenze und die Nachtruhe entscheidet
 * `policy.ts`, weil sie den Verlauf eines ganzen Space kennen muss, nicht nur
 * dieses eine Gerät. Wer hier eine zweite, halbe Regel einbaut, bekommt zwei
 * Wahrheiten — und irgendwann schickt eine davon nachts.
 *
 * Frequenzregel freigegeben von Alicia am 17.08.2026: höchstens eine Nachricht
 * pro Space und Tag, nichts zwischen 22 und 8 Uhr, nur zwei Anlässe, nie
 * Inhalt im Sperrbildschirm.
 *
 * `expo-notifications` ist ein nativer Baustein: Er existiert erst nach einem
 * neuen Build (EAS/TestFlight). Fehlt er — im Unit-Test, in Expo Go ohne
 * Modul —, meldet dieser Provider ehrlich `configured() === false`, statt zu
 * behaupten, er könne zustellen. Eine App, die "gesendet" sagt und nichts
 * sendet, ist genau die Sorte Lüge, die MANIFESTO §1 verbietet.
 */

type ExpoNotificationsModule = {
  getPermissionsAsync(): Promise<{ status: string }>;
  requestPermissionsAsync(): Promise<{ status: string }>;
  scheduleNotificationAsync(input: {
    content: { title: string; body?: string; data?: Record<string, unknown> };
    trigger: null | { date: Date };
  }): Promise<string>;
  cancelAllScheduledNotificationsAsync(): Promise<void>;
  getAllScheduledNotificationsAsync(): Promise<
    { identifier: string; content: { data?: Record<string, unknown> } }[]
  >;
  cancelScheduledNotificationAsync(id: string): Promise<void>;
  getExpoPushTokenAsync(options?: { projectId?: string }): Promise<{ data: string }>;
};

let Expo: ExpoNotificationsModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Expo = require('expo-notifications');
} catch {
  Expo = null;
}

export const expoNotifications: INotificationProvider = {
  id: 'expo:notifications',

  configured() {
    return Expo !== null;
  },

  async requestPermission() {
    if (!Expo) return false;
    const current = await Expo.getPermissionsAsync();
    if (current.status === 'granted') return true;
    const asked = await Expo.requestPermissionsAsync();
    return asked.status === 'granted';
  },

  async schedule(payload: NotificationPayload, prefs: NotificationPreferences) {
    if (!Expo) return;
    // Die einzige Prüfung, die hier hingehört. Alles Weitere: policy.ts.
    if (!prefs[payload.category]) return;
    await Expo.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        // Nur Kategorie und Ziel-Id — nie Notiz, Frage oder Foto (PP-031).
        data: { category: payload.category, deepLink: payload.deepLink },
      },
      trigger: payload.scheduledFor ? { date: new Date(payload.scheduledFor) } : null,
    });
  },

  async cancelCategory(category: NotificationCategory) {
    if (!Expo) return;
    const scheduled = await Expo.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter(n => n.content.data?.category === category)
        .map(n => Expo!.cancelScheduledNotificationAsync(n.identifier)),
    );
  },

  async cancelAll() {
    if (!Expo) return;
    await Expo.cancelAllScheduledNotificationsAsync();
  },
};

/**
 * Der Gerätetoken, über den der Server dieses Telefon erreicht.
 *
 * Gibt `null` zurück, wenn das Modul fehlt oder die Erlaubnis nicht erteilt
 * wurde — beides sind normale Zustände, keine Fehler. Der Aufrufer speichert
 * nur, was er wirklich bekommen hat.
 */
export async function getExpoPushToken(projectId?: string): Promise<string | null> {
  if (!Expo) return null;
  try {
    const granted = await expoNotifications.requestPermission();
    if (!granted) return null;
    const { data } = await Expo.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return data || null;
  } catch (err) {
    console.warn('[push] could not obtain a device token:', err);
    return null;
  }
}
