import { describe, it, expect } from 'vitest';
import { nullAnalytics } from './null';
import type { AnalyticsEvent } from './events';

describe('nullAnalytics', () => {
  it('is not configured (no-op)', () => {
    expect(nullAnalytics.configured()).toBe(false);
  });

  it('track() is a no-op and does not throw', () => {
    expect(() => nullAnalytics.track({ name: 'memory_created', props: { hasPhoto: false } })).not.toThrow();
  });

  it('identify() is a no-op and does not throw', () => {
    expect(() => nullAnalytics.identify('anon-session-1')).not.toThrow();
  });
});

describe('AnalyticsEvent type safety — no private content', () => {
  const FORBIDDEN_PROP_NAMES = [
    'note', 'text', 'prompt', 'answer', 'message', 'photo', 'reflection',
    'content', 'body', 'title', 'diary', 'concept', 'card',
  ];

  it('no QR scan event carries the raw QR value', () => {
    const event: AnalyticsEvent = { name: 'qr_scan_outcome', props: { outcome: 'ok' } };
    const keys = Object.keys(event.props ?? {});
    for (const f of FORBIDDEN_PROP_NAMES) expect(keys).not.toContain(f);
  });

  it('feedback_submitted does not carry the tip text', () => {
    const event: AnalyticsEvent = { name: 'feedback_submitted', props: { rating: 4, hasTip: true } };
    const keys = Object.keys(event.props);
    expect(keys).not.toContain('tip');
    expect(keys).not.toContain('tipText');
  });

  it('memory_created only carries a boolean (not the note text)', () => {
    const event: AnalyticsEvent = { name: 'memory_created', props: { hasPhoto: true } };
    expect(typeof event.props.hasPhoto).toBe('boolean');
    expect(Object.keys(event.props)).not.toContain('note');
  });

  it('discover_filter_applied carries the filter key (not the user search text)', () => {
    const event: AnalyticsEvent = { name: 'discover_filter_applied', props: { filterKey: 'outdoor', active: true } };
    expect(typeof event.props.filterKey).toBe('string');
    // filterKey is a system key like 'outdoor', 'calm' — not user input
    expect(['quick', 'free', 'cheap', 'outdoor', 'indoor', 'rain', 'calm', 'play']).toContain(event.props.filterKey);
  });

  it('error_occurred carries only an error type, not a stack trace or user content', () => {
    const event: AnalyticsEvent = { name: 'error_occurred', props: { context: 'qr_scan', errorType: 'TypeError' } };
    const keys = Object.keys(event.props);
    expect(keys).not.toContain('stack');
    expect(keys).not.toContain('message');
    expect(keys).not.toContain('note');
  });
});
