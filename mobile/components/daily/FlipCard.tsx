import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { FadeInImage } from '../ui/FadeInImage';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';
import { acknowledgeSelection } from '../../lib/haptics';

interface FlipCardProps {
  /** Die Vorderseite. Fehlt sie, trägt die Karte nur die Notiz. */
  photoUri?: string;
  /** Die Rückseite. Darf leer sein — ein Foto allein ist auch ein Tag. */
  note: string;
  /** Wer das abgelegt hat. Steht auf beiden Seiten, damit man es nie sucht. */
  authorName: string;
  labelVorne: string;
  labelHinten: string;
  size: number;
}

/**
 * Die Tageskarte: Foto vorn, Notiz hinten, ein Tipp dreht sie um.
 *
 * Alicias Entwurf vom 19.08.2026: „man klickt das Foto, Anzeige dreht sich um,
 * man sieht die Notiz — beautiful."
 *
 * DREI DINGE, DIE HIER LEICHT SCHIEFGEHEN:
 *
 * 1. BEIDE SEITEN LIEGEN IMMER ÜBEREINANDER. Sie werden nicht getauscht,
 *    sondern gedreht — sonst gibt es mitten in der Bewegung einen Moment ohne
 *    Inhalt, und die Karte blinkt.
 * 2. `backfaceVisibility` ist auf Android unzuverlässig. Deshalb wird die
 *    Deckkraft zusätzlich hart geschaltet: Was hinten liegt, ist wirklich
 *    unsichtbar, nicht nur weggedreht.
 * 3. REDUCE MOTION. Wer Bewegung abgeschaltet hat, bekommt keinen Dreh,
 *    sondern einen Wechsel. Die Funktion bleibt, die Drehung geht (§6).
 *
 * Die Notiz ist kleiner gesetzt als sonstiger Fließtext — eine Karte, die man
 * umdreht, hat eine feste Größe, und Alicia hat genau das vorhergesehen:
 * „bitte dann aber Schrift kleiner für Notiz, sonst passt nicht rein."
 */
export function FlipCard({
  photoUri,
  note,
  authorName,
  labelVorne,
  labelHinten,
  size,
}: FlipCardProps) {
  const [hinten, setHinten] = useState(false);
  const reduced = useReducedMotion();
  const dreh = useRef(new Animated.Value(0)).current;

  const drehen = () => {
    const ziel = hinten ? 0 : 1;
    setHinten(!hinten);
    void acknowledgeSelection();
    if (reduced) {
      dreh.setValue(ziel);
      return;
    }
    Animated.spring(dreh, {
      toValue: ziel,
      friction: 9,
      tension: 55,
      useNativeDriver: true,
    }).start();
  };

  const vorne = {
    transform: [
      { perspective: 1000 },
      { rotateY: dreh.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
    ],
    opacity: dreh.interpolate({ inputRange: [0, 0.5, 0.5001, 1], outputRange: [1, 1, 0, 0] }),
  };
  const rueck = {
    transform: [
      { perspective: 1000 },
      { rotateY: dreh.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] }) },
    ],
    opacity: dreh.interpolate({ inputRange: [0, 0.4999, 0.5, 1], outputRange: [0, 0, 1, 1] }),
  };

  return (
    <Pressable
      onPress={drehen}
      accessibilityRole="button"
      accessibilityLabel={hinten ? labelHinten : labelVorne}
      style={{ width: size, height: size }}
    >
      <Animated.View style={[styles.seite, { width: size, height: size }, vorne]}>
        {photoUri ? (
          <FadeInImage source={{ uri: photoUri }} style={styles.foto} />
        ) : (
          <View style={styles.ohneFoto}>
            <Text style={styles.ohneFotoText} numberOfLines={6}>
              {note}
            </Text>
          </View>
        )}
        <View style={styles.namensband}>
          <Text style={styles.name} numberOfLines={1}>
            {authorName.toLowerCase()}
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.seite, styles.rueckseite, { width: size, height: size }, rueck]}
      >
        <Text style={styles.notiz} numberOfLines={9}>
          {note.trim() || labelHinten}
        </Text>
        <Text style={styles.nameHinten} numberOfLines={1}>
          {authorName.toLowerCase()}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  seite: {
    position: 'absolute',
    borderRadius: Radii.md,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundWarm,
    ...(Platform.OS === 'ios' ? Shadows.subtle : {}),
  },
  foto: { width: '100%', height: '100%' },
  ohneFoto: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCream,
  },
  ohneFotoText: { ...Typography.micro, color: Colors.textMuted, lineHeight: 17 },
  namensband: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    // Deckend, nicht halbdurchsichtig: Über einem Foto ist der Untergrund
    // unbekannt, und ein Schleier hat hier schon einmal 1,07:1 ergeben.
    backgroundColor: Colors.backgroundDark,
  },
  name: { fontSize: 11, fontWeight: '500', letterSpacing: 0.6, color: Colors.onDarkStrong },
  rueckseite: {
    padding: Spacing.md,
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundCream,
  },
  /** Kleiner als Fließtext — die Rückseite hat eine feste Größe. */
  notiz: { fontSize: 13, fontWeight: '300', color: Colors.text, lineHeight: 18 },
  nameHinten: { fontSize: 11, fontWeight: '500', letterSpacing: 0.6, color: Colors.textSubtle },
});
