import * as LocalAuthentication from 'expo-local-authentication';

// Stays true for the foreground session; reset by lockBiometricSession() on app background.
let _sessionUnlocked = false;

export function lockBiometricSession(): void {
  _sessionUnlocked = false;
}

export function useBiometric() {
  async function authenticate(prompt = 'unlock your private diary'): Promise<boolean> {
    if (_sessionUnlocked) return true;

    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);

    // No biometrics / passcode configured on this device — allow through.
    if (!hasHardware || !isEnrolled) {
      _sessionUnlocked = true;
      return true;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      fallbackLabel: 'use passcode',
      cancelLabel: 'cancel',
      disableDeviceFallback: false,
    });

    if (result.success) _sessionUnlocked = true;
    return result.success;
  }

  return { authenticate };
}
