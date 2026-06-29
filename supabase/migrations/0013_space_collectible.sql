-- Shared collectible emoji: the mark a couple earns per completed challenge.
-- Additive, forward-only. The member-scoped UPDATE policy from 0012 already
-- covers writes to this column, so no new policy is needed.

alter table public.spaces add column if not exists collectible_emoji text;
