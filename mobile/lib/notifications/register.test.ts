import { describe, it, expect, vi } from 'vitest';
import { registerPushToken, type TokenStore } from './register';

function storeThat(result: { error: { message: string } | null }) {
  const upsert = vi.fn().mockResolvedValue(result);
  return { store: { upsert } as TokenStore, upsert };
}

describe('registerPushToken', () => {
  it('stores a real token for a signed-in user', async () => {
    const { store, upsert } = storeThat({ error: null });
    const r = await registerPushToken({
      userId: 'u1',
      token: 'ExponentPushToken[abc]',
      platform: 'ios',
      store,
      now: new Date('2026-08-17T10:00:00Z'),
    });
    expect(r).toEqual({ stored: true });
    expect(upsert).toHaveBeenCalledWith({
      user_id: 'u1',
      token: 'ExponentPushToken[abc]',
      platform: 'ios',
      last_seen_at: '2026-08-17T10:00:00.000Z',
    });
  });

  it('writes nothing when there is no token — permission denied is a normal state', async () => {
    const { store, upsert } = storeThat({ error: null });
    const r = await registerPushToken({ userId: 'u1', token: null, platform: 'ios', store });
    expect(r).toEqual({ stored: false, reason: 'no_token' });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('writes nothing without a signed-in user', async () => {
    const { store, upsert } = storeThat({ error: null });
    const r = await registerPushToken({ userId: null, token: 'ExponentPushToken[abc]', platform: 'android', store });
    expect(r).toEqual({ stored: false, reason: 'no_user' });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('never lets a storage error escape — the login must not break over a push token', async () => {
    const { store } = storeThat({ error: { message: 'permission denied' } });
    const r = await registerPushToken({ userId: 'u1', token: 't', platform: 'ios', store });
    expect(r).toEqual({ stored: false, reason: 'store_failed' });
  });

  it('survives a throwing client just as quietly', async () => {
    const store = { upsert: vi.fn().mockRejectedValue(new Error('offline')) } as TokenStore;
    const r = await registerPushToken({ userId: 'u1', token: 't', platform: 'android', store });
    expect(r).toEqual({ stored: false, reason: 'store_failed' });
  });
});
