import * as LocalAuthentication from 'expo-local-authentication';

// Stays true for the foreground session; reset by lockBiometricSession() on app background.
let _sessionUnlocked = false;

export function lockBiometricSession(): void {
  _sessionUnlocked = false;
}

export function useBiometric() {
  async function authenticate(prompt = 'unlock your private diary'): Promise<boolean> {
    if (_sessionUnlocked) return true;

    try {
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
    } catch {
      /**
       * Wirft das native Modul (statt `{success:false}` zurückzugeben), lief
       * bisher weder der Erfolgs- noch der Abbruchpfad des Aufrufers: der
       * Kartenbildschirm blieb dauerhaft hinter dem Sichtschutz stehen, und
       * der einzige Ausweg war das Wegwischen des Modals.
       *
       * Ein Fehler heißt hier bewusst NICHT „durchlassen": das wäre ein
       * privates Tagebuch, das sich bei einer Störung von selbst öffnet
       * (MANIFESTO §2). Er heißt „nicht entsperrt" — der Aufrufer behandelt
       * das wie einen Abbruch und geht zurück.
       */
      return false;
    }
  }

  return { authenticate };
}
