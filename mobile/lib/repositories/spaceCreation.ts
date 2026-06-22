import type { CreateSpaceInput } from './interfaces';

export interface CreateSpaceRpcArgs {
  p_type: CreateSpaceInput['type'];
  p_name: string;
  p_owner_name: string;
  p_invite_code: string;
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
    p_name: input.name.trim() || (input.type === 'couple' ? 'Our space' : 'Friends'),
    p_owner_name: input.ownerName.trim(),
    p_invite_code: inviteCode,
  };
}
