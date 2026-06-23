import { useState, useEffect } from 'react';
import { MONETIZATION_ENABLED, type GatedFeature } from '../monetization/config';
import {
  hasFeature,
  resolveEntitlement,
  freeEntitlement,
  type EntitlementState,
} from '../monetization/entitlements';
import { billing } from '../monetization/billing';
import { useAppStore } from '../store';

interface EntitlementResult {
  /** Whether the current space can use this feature. Always true when M_ENABLED=false. */
  allowed: boolean;
  /** True while async entitlement check is in flight. False immediately when disabled. */
  loading: boolean;
  /** Whether the active space is on Plus tier. Always true when M_ENABLED=false. */
  isPlus: boolean;
}

/**
 * Returns whether the active space can use a gated feature.
 * When MONETIZATION_ENABLED is false (current M0 state) this always returns
 * allowed=true and never calls the billing provider — zero behavioral impact.
 */
export function useHasFeature(feature: GatedFeature): EntitlementResult {
  const activeSpaceId = useAppStore((s) => s.activeSpaceId);
  const [entitlement, setEntitlement] = useState<EntitlementState>(
    freeEntitlement(activeSpaceId ?? ''),
  );
  const [loading, setLoading] = useState(MONETIZATION_ENABLED && !!activeSpaceId);

  useEffect(() => {
    if (!MONETIZATION_ENABLED || !activeSpaceId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void billing.getActiveEntitlement(activeSpaceId).then((state) => {
      if (cancelled) return;
      setEntitlement(state ?? freeEntitlement(activeSpaceId));
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setEntitlement(freeEntitlement(activeSpaceId));
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [activeSpaceId]);

  if (!MONETIZATION_ENABLED) {
    return { allowed: true, loading: false, isPlus: true };
  }

  const resolved = resolveEntitlement(entitlement, { monetizationEnabled: MONETIZATION_ENABLED });
  return {
    allowed: hasFeature(resolved, feature, MONETIZATION_ENABLED),
    loading,
    isPlus: resolved.tier === 'plus',
  };
}
