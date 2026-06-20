import { SEED_COUPLE, SEED_USER } from '../seed';
import type { Couple, User } from '../types';

export function useCouple(): { couple: Couple; user: User } {
  return { couple: SEED_COUPLE, user: SEED_USER };
}
