import { describe, it, expect } from 'vitest';
import {
  decideDelivery,
  composePartnerMomentPush,
  composePartnerJoinedPush,
  MAX_PER_DAY_PER_SPACE,
} from './policy';
import { DEFAULT_NOTIFICATION_PREFS } from './types';
import type { NotificationPreferences } from './types';

const optedIn: NotificationPreferences = { ...DEFAULT_NOTIFICATION_PREFS, partner_activity: true };
const midday = new Date('2026-08-17T12:00:00');

describe('decideDelivery', () => {
  it('delivers a wanted notification at a sane hour', () => {
    const d = decideDelivery({
      payload: composePartnerMomentPush(false),
      prefs: optedIn,
      history: [],
      now: midday,
    });
    expect(d.deliver).toBe(true);
  });

  it('respects the opt-out — partner_activity is off by default', () => {
    const d = decideDelivery({
      payload: composePartnerMomentPush(false),
      prefs: DEFAULT_NOTIFICATION_PREFS,
      history: [],
      now: midday,
    });
    expect(d).toEqual({ deliver: false, reason: 'opted_out' });
  });

  it('sends at most one per day per space — a busy evening stays one notification', () => {
    const history = [{ category: 'partner_activity' as const, at: '2026-08-17T09:15:00' }];
    const d = decideDelivery({
      payload: composePartnerMomentPush(false),
      prefs: optedIn,
      history,
      now: midday,
    });
    expect(d).toEqual({ deliver: false, reason: 'daily_cap' });
    expect(MAX_PER_DAY_PER_SPACE).toBe(1);
  });

  it('counts the cap across categories, not per category', () => {
    // A date reminder this morning already used today's one slot.
    const history = [{ category: 'date_plan_reminder' as const, at: '2026-08-17T08:30:00' }];
    const d = decideDelivery({
      payload: composePartnerMomentPush(false),
      prefs: { ...optedIn, date_plan_reminder: true },
      history,
      now: midday,
    });
    expect(d).toEqual({ deliver: false, reason: 'daily_cap' });
  });

  it('yesterday does not count against today', () => {
    const history = [{ category: 'partner_activity' as const, at: '2026-08-16T20:00:00' }];
    const d = decideDelivery({
      payload: composePartnerMomentPush(false),
      prefs: optedIn,
      history,
      now: midday,
    });
    expect(d.deliver).toBe(true);
  });

  it('defers instead of waking someone at night', () => {
    const night = new Date('2026-08-17T03:00:00');
    const d = decideDelivery({
      payload: composePartnerJoinedPush(false),
      prefs: optedIn,
      history: [],
      now: night,
    });
    expect(d.deliver).toBe(false);
    if (d.deliver === false && d.reason === 'quiet_hours') {
      const at = new Date(d.deferUntil);
      expect(at.getHours()).toBe(8);
      expect(at.getDate()).toBe(17); // same morning
    } else {
      throw new Error('expected quiet_hours');
    }
  });

  it('late evening defers to the next morning, not the same one', () => {
    const late = new Date('2026-08-17T23:30:00');
    const d = decideDelivery({
      payload: composePartnerJoinedPush(false),
      prefs: optedIn,
      history: [],
      now: late,
    });
    if (d.deliver === false && d.reason === 'quiet_hours') {
      const at = new Date(d.deferUntil);
      expect(at.getDate()).toBe(18);
      expect(at.getHours()).toBe(8);
    } else {
      throw new Error('expected quiet_hours');
    }
  });

  it('an unreadable timestamp in the history never blocks a delivery silently', () => {
    const d = decideDelivery({
      payload: composePartnerMomentPush(false),
      prefs: optedIn,
      history: [{ category: 'partner_activity', at: 'not-a-date' }],
      now: midday,
    });
    expect(d.deliver).toBe(true);
  });
});

describe('push copy (PP-031: the lock screen is a public surface)', () => {
  const privateStrings = [
    'sunday morning, coffee, your feet on my lap.',
    'what makes our relationship feel warm?',
    'Alicia',
  ];

  it('carries no moment content in either language', () => {
    for (const isDE of [true, false]) {
      for (const p of [composePartnerMomentPush(isDE), composePartnerJoinedPush(isDE)]) {
        const text = `${p.title} ${p.body ?? ''}`;
        for (const secret of privateStrings) {
          expect(text.includes(secret)).toBe(false);
        }
        // No note, no prompt, no photo reference can even be passed in —
        // the composers take a language flag and nothing else.
        expect(p.body && p.body.length).toBeGreaterThan(0);
        expect(p.deepLink).toBeUndefined();
      }
    }
  });

  it('never uses pressure or guilt (MANIFESTO §3)', () => {
    const forbidden = [
      'don’t forget', 'dont forget', 'vergiss nicht', 'verpasst',
      'streak', 'serie', 'letzte chance', 'last chance', 'still waiting', 'wartet schon',
    ];
    for (const isDE of [true, false]) {
      for (const p of [composePartnerMomentPush(isDE), composePartnerJoinedPush(isDE)]) {
        const text = `${p.title} ${p.body ?? ''}`.toLowerCase();
        for (const f of forbidden) expect(text.includes(f)).toBe(false);
      }
    }
  });
});
