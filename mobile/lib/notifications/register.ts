/**
 * Den Gerätetoken hinterlegen, damit der Server das Telefon des *anderen*
 * Menschen erreichen kann.
 *
 * Zwei Regeln, die hier sichtbar bleiben sollen:
 *  - Es wird nur gespeichert, was es wirklich gibt. Kein Token → keine Zeile.
 *  - Ein Fehler beim Speichern darf niemals den Login oder den Start der App
 *    kippen. Push ist ein Zusatz; wer sich anmelden will, soll sich anmelden
 *    können, auch wenn gerade kein Token durchgeht.
 *
 * Reine Logik über einem schmalen Client-Interface — damit unter Vitest
 * prüfbar ist, was wirklich in die Datenbank geht (und was nicht).
 */

export type PushPlatform = 'ios' | 'android';

export type TokenStore = {
  upsert(row: { user_id: string; token: string; platform: PushPlatform; last_seen_at: string }): Promise<{ error: { message: string } | null }>;
};

export type RegisterResult =
  | { stored: true }
  | { stored: false; reason: 'no_token' | 'no_user' | 'store_failed' };

export async function registerPushToken(input: {
  userId: string | null | undefined;
  token: string | null;
  platform: PushPlatform;
  store: TokenStore;
  now?: Date;
}): Promise<RegisterResult> {
  const { userId, token, platform, store, now } = input;

  if (!userId) return { stored: false, reason: 'no_user' };
  if (!token) return { stored: false, reason: 'no_token' };

  try {
    const { error } = await store.upsert({
      user_id: userId,
      token,
      platform,
      last_seen_at: (now ?? new Date()).toISOString(),
    });
    if (error) {
      // Laut, aber folgenlos: der Login läuft weiter.
      console.warn('[push] token not stored:', error.message);
      return { stored: false, reason: 'store_failed' };
    }
    return { stored: true };
  } catch (err) {
    console.warn('[push] token store threw:', err);
    return { stored: false, reason: 'store_failed' };
  }
}
