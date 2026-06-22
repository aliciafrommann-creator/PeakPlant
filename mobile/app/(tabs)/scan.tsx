import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { parseCardQr } from '../../lib/qr';
import { SEED_CARDS } from '../../lib/seed';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  // Guard against the scanner firing many times for one physical code.
  const handled = useRef(false);

  // Re-arm the scanner every time the tab regains focus.
  useFocusEffect(
    useCallback(() => {
      handled.current = false;
      setError(null);
    }, [])
  );

  const onScanned = useCallback(({ data }: { data: string }) => {
    if (handled.current) return;
    const cardId = parseCardQr(data);
    if (!cardId) {
      setError("that doesn't look like a PeakPlant card.");
      return;
    }
    if (!SEED_CARDS.some((c) => c.id === cardId)) {
      setError('this card belongs to an edition that isn\'t out yet.');
      return;
    }
    handled.current = true;
    setError(null);
    router.push(`/card/${cardId}`);
  }, []);

  const granted = permission?.granted ?? false;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>SCAN</Text>
        <Text style={styles.title}>scan a card</Text>
      </View>

      <View style={styles.cameraArea}>
        {granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={onScanned}
          />
        ) : null}

        {/* Framing overlay sits on top of the camera (or the dark placeholder). */}
        <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          {!granted ? (
            <View style={styles.permissionBox}>
              <Text style={styles.cameraText}>
                {permission?.canAskAgain === false
                  ? 'camera access is off. enable it in settings to scan cards.'
                  : 'allow camera access to scan the QR code on your moment card'}
              </Text>
              {permission?.canAskAgain !== false ? (
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermission}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Allow camera access"
                >
                  <Text style={styles.permissionButtonText}>ALLOW CAMERA</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={() => void Linking.openSettings()}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Open settings to enable camera"
                >
                  <Text style={styles.permissionButtonText}>OPEN SETTINGS</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.cameraText}>
              {error ?? 'point at the QR code on your moment card'}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => router.push('/card/card-01')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Try a demo card"
        >
          <Text style={styles.demoButtonText}>TRY DEMO CARD</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          uses Grow Together #01 — "Grow Something Together"
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  label: { fontSize: 10, fontWeight: '500', letterSpacing: 3, color: Colors.textFaint },
  title: { fontSize: 28, fontWeight: '200', color: Colors.text, letterSpacing: -0.5 },
  cameraArea: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  scanFrame: { width: 200, height: 200, position: 'relative' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: Colors.accent, borderWidth: 2 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  cameraText: {
    fontSize: 13,
    fontWeight: '300',
    color: Colors.textSubtle,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  permissionBox: { alignItems: 'center', gap: Spacing.lg },
  permissionButton: {
    height: 48,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionButtonText: { fontSize: 11, fontWeight: '500', letterSpacing: 2.5, color: Colors.accent },
  bottom: { paddingHorizontal: Spacing.screen, paddingVertical: Spacing.xl, gap: Spacing.lg },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 10, fontWeight: '400', letterSpacing: 2, color: Colors.textFaint },
  demoButton: { height: 52, backgroundColor: Colors.text, justifyContent: 'center', alignItems: 'center' },
  demoButtonText: { fontSize: 11, fontWeight: '500', letterSpacing: 3, color: Colors.white },
  hint: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
});
