import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** Returns true whenever the app is not in the foreground (inactive or backgrounded). */
export function usePrivacyOverlay(): boolean {
  const [obscured, setObscured] = useState(false);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      setObscured(state !== 'active');
    });
    return () => sub.remove();
  }, []);

  return obscured;
}
