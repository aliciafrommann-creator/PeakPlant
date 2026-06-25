import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Tracks the OS "reduce motion" setting so animated components can fall back to
 * instant state changes. Motion is polish — never required for a flow to work.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => { if (active) setReduced(v); })
      .catch(() => { /* default: motion on */ });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setReduced(v));
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
