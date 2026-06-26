import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { resolveScan } from '../../lib/qr';
import { getRedeemedTokens, markTokenRedeemed } from '../../lib/redeemedTokens';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';
import { confirmSuccess } from '../../lib/haptics';
import { SEED_CARDS } from '../../lib/seed';

const cardExists = (id: string) => SEED_CARDS.some((c) => c.id === id);

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);
  const usedTokens = useRef<Set<string>>(new Set());
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const pulse = useRef(new Animated.Value(0)).current;

  // Gentle breathing pulse on the scan frame — signals "actively looking".
  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reducedMotion]);

  const frameStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }],
  };

  useFocusEffect(
    useCallback(() => {
      handled.current = false;
      setError(null);
      // Refresh the redeemed-token set each time the scanner opens so an
      // already-unlocked card is recognized even across navigations.
      void getRedeemedTokens()
        .then((s) => { usedTokens.current = s; })
        .catch(() => { /* read failure: fall back to empty — never blocks a scan */ });
    }, [])
  );

  const onScanned = useCallback(async ({ data }: { data: string }) => {
    if (handled.current) return;
    const outcome = resolveScan(data, { cardExists, usedTokens: usedTokens.current });

    switch (outcome.status) {
      case 'malformed':
        setError(t("that doesn't look like a PeakPlant card.", 'Das sieht nicht wie eine PeakPlant-Karte aus.'));
        return;
      case 'unknown_card':
        setError(t("this card belongs to an edition that isn't out yet.", 'Diese Karte gehort zu einer Edition, die noch nicht erschienen ist.'));
        return;
      case 'expired':
        setError(t('this unlock code has expired.', 'Dieser Freischalt-Code ist abgelaufen.'));
        return;
      case 'used':
        setError(t('this card has already been unlocked.', 'Diese Karte wurde bereits freigeschaltet.'));
        return;
      case 'ok':
        handled.current = true;
        setError(null);
        void confirmSuccess();
        if (outcome.token) {
          try {
            await markTokenRedeemed(outcome.token);
            usedTokens.current.add(outcome.token);
          } catch {
            // Couldn't record the redemption — let them through this time
            // rather than block a legitimate unlock on a storage hiccup.
          }
        }
        router.push({ pathname: `/card/${outcome.cardId}`, params: { unlocked: 'true' } });
        return;
    }
  }, [t]);

  const granted = permission?.granted ?? false;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{t('SCAN', 'SCANNEN')}</Text>
        <Text style={styles.title}>{t('scan a card', 'Karte scannen')}</Text>
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

        <View style={styles.overlay} pointerEvents="box-none">
          <Animated.View style={[styles.scanFrame, frameStyle]}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </Animated.View>

          {!granted ? (
            <View style={styles.permissionBox}>
              <Text style={styles.cameraText}>
                {permission?.canAskAgain === false
                  ? t('camera access is off. enable it in settings to scan cards.', 'Kamera-Zugriff ist deaktiviert. Aktiviere ihn in den Einstellungen.')
                  : t('allow camera access to scan the QR code on your moment card', 'Kamera-Zugriff erlauben, um den QR-Code auf deiner Momentkarte zu scannen')}
              </Text>
              {permission?.canAskAgain !== false ? (
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={requestPermission}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={t('Allow camera access', 'Kamera-Zugriff erlauben')}
                >
                  <Text style={styles.permissionButtonText}>{t('ALLOW CAMERA', 'KAMERA ERLAUBEN')}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.permissionButton}
                  onPress={() => void Linking.openSettings()}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={t('Open settings to enable camera', 'Einstellungen offnen, um Kamera zu aktivieren')}
                >
                  <Text style={styles.permissionButtonText}>{t('OPEN SETTINGS', 'EINSTELLUNGEN OFFNEN')}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : error ? (
            <View style={styles.permissionBox}>
              <Text style={styles.cameraText}>{error}</Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={() => { handled.current = false; setError(null); }}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('Try scanning again', 'Erneut scannen')}
              >
                <Text style={styles.permissionButtonText}>{t('TRY AGAIN', 'ERNEUT VERSUCHEN')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.cameraText}>
              {t('point at the QR code on your moment card', 'QR-Code auf deiner Momentkarte anvisieren')}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('OR', 'ODER')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => router.push('/card/card-01')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('Try a demo card', 'Demokarte ausprobieren')}
        >
          <Text style={styles.demoButtonText}>{t('TRY DEMO CARD', 'DEMOKARTE TESTEN')}</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          {t(
            'uses Grow Together #01 — "Grow Something Together"',
            'nutzt Grow Together #01 - "Gemeinsam etwas wachsen lassen"',
          )}
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
  title: { ...Typography.editorial, fontSize: 28, lineHeight: 34 },
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
    borderRadius: Radii.pill,
  },
  permissionButtonText: { fontSize: 11, fontWeight: '500', letterSpacing: 2.5, color: Colors.text },
  bottom: { paddingHorizontal: Spacing.screen, paddingVertical: Spacing.xl, gap: Spacing.lg },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 10, fontWeight: '400', letterSpacing: 2, color: Colors.textFaint },
  demoButton: { height: 52, backgroundColor: Colors.text, justifyContent: 'center', alignItems: 'center', borderRadius: Radii.pill },
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
