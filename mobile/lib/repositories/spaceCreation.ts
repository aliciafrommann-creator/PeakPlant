import type { CreateSpaceInput } from './interfaces';

export interface CreateSpaceRpcArgs {
  p_type: CreateSpaceInput['type'];
  p_name: string;
  p_owner_name: string;
  p_invite_code: string;
}


/**
 * Vorgabename je Art. Muss mit `create_space` in Migration 0024
 * übereinstimmen — dort steht dieselbe Fallunterscheidung in SQL.
 */
export function defaultSpaceName(type: CreateSpaceInput['type']): string {
  if (type === 'couple') return 'Our space';
  if (type === 'solo') return 'My space';
  return 'Friends';
}

/**
 * Build the create_space RPC payload without trusting a client-provided user id.
 * The database function derives ownership exclusively from auth.uid().
 */
export function buildCreateSpaceRpcArgs(
  input: CreateSpaceInput,
  inviteCode: string,
): CreateSpaceRpcArgs {
  return {
    p_type: input.type,
    p_name: input.name.trim() || defaultSpaceName(input.type),
    p_owner_name: input.ownerName.trim(),
    p_invite_code: inviteCode,
  };
}
