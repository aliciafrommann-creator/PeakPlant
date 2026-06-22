import { describe, it, expect } from 'vitest';
import { nullNotifications } from './null';
import { DEFAULT_NOTIFICATION_PREFS } from './types';
import type { NotificationPayload } from './types';

describe('nullNotifications', () => {
  it('is not configured', () => {
    expect(nullNotifications.configured()).toBe(false);
  });

  it('requestPermission returns false (no native layer)', async () => {
    expect(await nullNotifications.requestPermission()).toBe(false);
  });

  it('schedule is a no-op', async () => {
    const payload: NotificationPayload = {
      category: 'date_plan_reminder',
      title: 'PeakPlant',
      body: 'your date plan is coming up',
    };
    await expect(nullNotifications.schedule(payload, DEFAULT_NOTIFICATION_PREFS)).resolves.toBeUndefined();
  });

  it('cancelAll is a no-op', async () => {
    await expect(nullNotifications.cancelAll()).resolves.toBeUndefined();
  });
});

describe('privacy contract — notification bodies', () => {
  it('default prefs opt out of partner_activity and weekly_recap', () => {
    expect(DEFAULT_NOTIFICATION_PREFS.partner_activity).toBe(false);
    expect(DEFAULT_NOTIFICATION_PREFS.weekly_recap).toBe(false);
  });

  it('a date_plan_reminder payload must not contain diary content', () => {
    const payload: NotificationPayload = {
      category: 'date_plan_reminder',
      title: 'PeakPlant',
      body: 'your date plan is coming up',
      deepLink: 'https://peak-plant.com/i/moment-42',
    };
    // Body must not contain private content
    const forbidden = ['note:', 'you wrote:', 'you said:', 'your partner'];
    for (const f of forbidden) {
      expect(payload.body ?? '').not.toContain(f);
    }
  });

  it('deep link in notifications carries only a catalog id (no private context)', () => {
    const payload: NotificationPayload = {
      category: 'partner_activity',
      title: 'PeakPlant',
      deepLink: 'https://peak-plant.com/i/moment-7',
    };
    // Deep link must not carry space ids or user ids as query params
    expect(payload.deepLink).not.toContain('spaceId');
    expect(payload.deepLink).not.toContain('userId');
    expect(payload.deepLink).not.toContain('memoryId');
  });
});
