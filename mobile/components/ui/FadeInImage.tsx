import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, type ImageProps, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';

/**
 * An Image that fades in when its bytes arrive instead of hard-popping —
 * the single biggest "feels premium" cue on photo surfaces. Shows a soft
 * neutral fill while loading (never a white hole). Pure RN Animated, no
 * extra dependency. Respects reduce-motion (instant show).
 */
export function FadeInImage({
  style,
  ...rest
}: Omit<ImageProps, 'style'> & { style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  /**
   * Vorher gab es nur `onLoad`. Lud ein Bild nicht — offline, oder eine
   * signierte URL nach Ablauf ihrer Stunde —, blieb die Deckkraft für immer
   * auf null: ein flacher grauer Kasten, ununterscheidbar von einem gelöschten
   * Foto. Auf der Momente-Wand war offline jede Kachel so einer.
   */
  const [failed, setFailed] = useState(false);

  const onLoad = () => {
    if (reduced) {
      opacity.setValue(1);
      return;
    }
    Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  };

  return (
    // The holder carries the caller's sizing/radius; the image fills it
    // absolutely, so margins/size are never applied twice.
    <View style={[styles.holder, style]}>
      <Animated.Image
        {...rest}
        style={[StyleSheet.absoluteFillObject, { opacity }]}
        onLoad={onLoad}
        onError={() => setFailed(true)}
      />
      {failed && (
        <View style={[StyleSheet.absoluteFillObject, styles.failed]}>
          {/* Kein Fehlersymbol und kein Ausrufezeichen: das Foto ist nicht
              kaputt, es ist gerade nur nicht erreichbar. */}
          <Text style={styles.failedMark}>◌</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  failed: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  failedMark: {
    fontSize: 18,
    /**
     * ACHTUNG, DER GRUND IST NICHT DAS PAPIER: Dieses Zeichen sitzt in
     * `holder`, und der ist `Colors.border` (#E4DFD7). Ein erster Anlauf hat
     * hier auf `textSubtle` gewechselt und dabei gegen den Papierton gerechnet
     * — auf #E4DFD7 sind das nur 3,87:1 und damit weiterhin zu wenig für die
     * 4,5, die der Kommentar selbst verlangte.
     *
     * `textMuted` liefert auf diesem Grund 5,57:1. Und „große Schrift"
     * (3:1 genügt) beginnt erst bei 24 pt normal — 18 pt zählt als klein.
     */
    color: Colors.textMuted,
  },
  // The quiet fill visible until the photo fades in — never a white hole.
  holder: { backgroundColor: Colors.border, overflow: 'hidden' },
});
