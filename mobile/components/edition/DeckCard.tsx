import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { DyeField, dyeOf } from '../ui/DyeField';
import { editionInk } from '../../lib/editionInk';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';
import { acknowledgeSelection } from '../../lib/haptics';

interface DeckCardProps {
  editionId: string;
  number: number;
  /** Offen = gescannt oder Beispielkarte. Nur dann steht ein Titel hinten. */
  offen: boolean;
  /** Der Titel — NUR bei offenen Karten übergeben. */
  titel?: string;
  /** Was die gedruckte Karte hinzufügt. Für versiegelte Karten. */
  versiegeltText: string;
  leseText: string;
  onOeffnen?: () => void;
  labelVorne: string;
  labelHinten: string;
  width: number;
}

/**
 * Eine Karte des Decks — wie eine echte: Man dreht sie um.
 *
 * Alicias Idee vom 19.08.2026: „Karten könnten auch wie in echt klickbar sein,
 * also dass sie sich umdrehen und komplett covered im Batik-Design."
 *
 * DIE EHRLICHKEITSGRENZE, die diesen Entwurf formt (Entscheidung 024): Eine
 * VERSIEGELTE Karte darf sich drehen — aber hinten steht nicht ihr Inhalt,
 * sondern was die gedruckte Karte hinzufügt. Das Umdrehen ist eine Geste,
 * kein Schlüssel. Wer hier je den Text einer ungekauften Karte zeigt, hat aus
 * einer Produktgrenze ein Leck gemacht, und der Kauf verliert seinen Sinn.
 *
 * Zwei Tipps, zwei Bedeutungen, in dieser Reihenfolge: umdrehen, dann lesen.
 * Ein einzelner Tipp, der beides täte, wäre zwei Handlungen auf einer Fläche
 * (MANIFESTO §5) — und man könnte die Rückseite nie ansehen, ohne wegzugehen.
 */
export function DeckCard({
  editionId,
  number,
  offen,
  titel,
  versiegeltText,
  leseText,
  onOeffnen,
  labelVorne,
  labelHinten,
  width,
}: DeckCardProps) {
  const [hinten, setHinten] = useState(false);
  const reduced = useReducedMotion();
  const dreh = useRef(new Animated.Value(0)).current;
  const tinte = editionInk(dyeOf(editionId).ground);
  const hoehe = Math.round(width / 0.7); // Proportion einer Spielkarte

  const drehen = () => {
    const ziel = hinten ? 0 : 1;
    setHinten(!hinten);
    void acknowledgeSelection();
    if (reduced) {
      dreh.setValue(ziel);
      return;
    }
    Animated.spring(dreh, { toValue: ziel, friction: 9, tension: 55, useNativeDriver: true }).start();
  };

  const seiteVorn = {
    transform: [
      { perspective: 900 },
      { rotateY: dreh.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
    ],
    opacity: dreh.interpolate({ inputRange: [0, 0.5, 0.5001, 1], outputRange: [1, 1, 0, 0] }),
  };
  const seiteHinten = {
    transform: [
      { perspective: 900 },
      { rotateY: dreh.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] }) },
    ],
    opacity: dreh.interpolate({ inputRange: [0, 0.4999, 0.5, 1], outputRange: [0, 0, 1, 1] }),
  };

  return (
    <Pressable
      onPress={hinten && offen && onOeffnen ? onOeffnen : drehen}
      accessibilityRole="button"
      accessibilityLabel={hinten ? labelHinten : labelVorne}
      style={{ width, height: hoehe }}
    >
      {/* VORDERSEITE: die Färbung der Edition, wie der Rücken eines Decks. */}
      <Animated.View style={[styles.seite, { width, height: hoehe }, seiteVorn]}>
        <DyeField editionId={editionId} style={styles.fuellung}>
          <Text style={[styles.nummer, { color: tinte }]}>
            {String(number).padStart(2, '0')}
          </Text>
        </DyeField>
      </Animated.View>

      {/* RÜCKSEITE: bei offenen Karten der Titel, bei versiegelten das, was
          die gedruckte Karte hinzufügt — nie ihr Inhalt. */}
      <Animated.View
        style={[styles.seite, styles.rueck, { width, height: hoehe }, seiteHinten]}
      >
        <Text style={styles.rueckText} numberOfLines={4}>
          {offen ? titel : versiegeltText}
        </Text>
        {offen && <Text style={styles.lesen}>{leseText}</Text>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  seite: {
    position: 'absolute',
    borderRadius: Radii.sm,
    overflow: 'hidden',
  },
  fuellung: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  nummer: { fontSize: 15, fontWeight: '500', fontVariant: ['tabular-nums'] },
  rueck: {
    backgroundColor: Colors.backgroundCream,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  rueckText: { fontSize: 11, fontWeight: '400', color: Colors.text, lineHeight: 15 },
  lesen: { fontSize: 11, fontWeight: '500', letterSpacing: 0.8, color: Colors.accentInk },
});
