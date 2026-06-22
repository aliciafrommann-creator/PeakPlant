import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildCreateSpaceRpcArgs } from './spaceCreation';

describe('buildCreateSpaceRpcArgs', () => {
  it('never sends the client-provided user id to the database function', () => {
    const args = buildCreateSpaceRpcArgs(
      {
        type: 'couple',
        name: '  ',
        ownerUserId: 'client-controlled-user-id',
        ownerName: ' Alicia ',
      },
      'PEAK-ABC234',
    );

    expect(args).toEqual({
      p_type: 'couple',
      p_name: 'Our space',
      p_owner_name: 'Alicia',
      p_invite_code: 'PEAK-ABC234',
    });
    expect(args).not.toHaveProperty('ownerUserId');
    expect(args).not.toHaveProperty('p_owner_user_id');
  });

  it('uses the friends fallback name for an empty friends-space name', () => {
    expect(
      buildCreateSpaceRpcArgs(
        {
          type: 'friends',
          name: '',
          ownerUserId: 'ignored',
          ownerName: '',
        },
        'PEAK-XYZ789',
      ).p_name,
    ).toBe('Friends');
  });
});

describe('create_space migration security contract', () => {
  const sql = readFileSync('../supabase/migrations/0008_create_space.sql', 'utf8').toLowerCase();

  it('derives ownership from the authenticated database session', () => {
    expect(sql).toContain('security definer');
    expect(sql).toContain('auth.uid()');
    expect(sql).not.toContain('p_owner_user_id');
  });

  it('creates the profile, space, and owner membership inside one function', () => {
    expect(sql).toContain('insert into public.profiles');
    expect(sql).toContain('insert into public.spaces');
    expect(sql).toContain('insert into public.space_members');
  });
});
