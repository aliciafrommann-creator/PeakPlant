import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { PressableScale } from '../ui/PressableScale';
import { FadeInImage } from '../ui/FadeInImage';
import { relativeDay } from '../../lib/relativeTime';
import type { Memory, MomentCard, Lang } from '../../lib/types';

interface MomentWallProps {
  memories: Memory[];
  cardById: Map<string, MomentCard>;
  language: Lang;
  onOpen: (memory: Memory) => void;
  onShare: (memory: Memory) => void;
  /**
   * How many slots the wall shows at minimum. Below that it fills up with
   * quiet empty tiles — see the note on `EmptySlot`.
   */
  minSlots?: number;
}

const DEFAULT_MIN_SLOTS = 6;

/**
 * Die Momente-Wand — das Hauptobjekt des Startbildschirms.
 *
 * ENTSCHEIDUNG (Alicia, 17.08.2026): Der Startbildschirm führte vorher mit
 * einem Vorschlag für etwas noch nicht Getanes, stellte danach eine Frage
 * („was wollt ihr zusammen machen?") und bot drei weitere Wege an, sie zu
 * beantworten. Dreizehn Abschnitts-Überschriften, und die festgehaltenen
 * Momente kamen an dritter Stelle, auf drei begrenzt.
 *
 * Strava, Instagram und BeReal machen strukturell dasselbe und nur das: EIN
 * Objekt, groß, wiederholt. Die Haupthandlung liegt außerhalb der Liste. Auf
 * dem Startbildschirm steht keine einzige Abschnitts-Überschrift. Klarheit
 * entsteht dort nicht durchs Erklären, sondern dadurch, dass eine Sache so
 * oft gezeigt wird, bis sie sich von selbst versteht.
 *
 * PeakPlants Objekt ist der festgehaltene Moment. Also zeigt der
 * Startbildschirm den — und sonst nichts Lautes.
 */
export function MomentWall({
  memories,
  cardById,
  language,
  onOpen,
  onShare,
  minSlots = DEFAULT_MIN_SLOTS,
}: MomentWallProps) {
  const { width } = useWindowDimensions();
  // Zwei Spalten, an der echten Bildschirmbreite gerechnet statt an einem
  // geratenen Wert — sonst bricht die Wand auf schmalen Geräten oder im
  // Querformat.
  const tile = Math.floor((width - Spacing.screen * 2 - Spacing.sm) / 2);

  const emptyCount = Math.max(0, minSlots - memories.length);

  return (
    <View style={styles.wall}>
      {memories.map((m) => {
        const card = m.cardId ? cardById.get(m.cardId) : undefined;
        return (
          <PressableScale
            key={m.id}
            containerStyle={{ width: tile }}
            style={[styles.tile, { width: tile, height: tile }]}
            onPress={() => onOpen(m)}
            onLongPress={() => onShare(m)}
            scaleTo={0.97}
            accessibilityLabel={`Moment ${relativeDay(m.createdAt, language)}${
              m.note ? `: ${m.note.slice(0, 60)}` : ''
            }`}
          >
            {m.photoUri ? (
              <FadeInImage
                source={{ uri: m.photoUri }}
                style={StyleSheet.absoluteFillObject}
                accessibilityLabel="Moment photo"
              />
            ) : (
              // Ein Moment ohne Foto ist kein halber Moment. Er zeigt seine
              // Worte — nicht ein Platzhalter-Symbol, das nichts erzählt.
              <View style={styles.words}>
                <Text style={styles.wordsText} numberOfLines={5}>
                  {m.note?.trim() || '✦'}
                </Text>
              </View>
            )}

            <View style={styles.footer}>
              {card ? (
                <Text style={styles.cardNo}>{String(card.number).padStart(2, '0')}</Text>
              ) : null}
              <Text style={styles.date} numberOfLines={1}>
                {relativeDay(m.createdAt, language)}
              </Text>
            </View>
          </PressableScale>
        );
      })}

      {/* Leere Plätze. Bewusst NICHT antippbar: die eine laute Handlung ist der
          Knopf unten (MANIFESTO §5). Sie stehen hier, weil eine leere Wand
          trotzdem die FORM des Objekts zeigen soll — man sieht, was hier
          entsteht, bevor man das erste selbst angelegt hat. Ein erklärender
          Absatz kann das nicht. */}
      {Array.from({ length: emptyCount }, (_, i) => (
        <View
          key={`slot-${i}`}
          style={[styles.slot, { width: tile, height: tile }]}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wall: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screen,
  },
  tile: {
    borderRadius: Radii.sm,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundWarm,
    justifyContent: 'flex-end',
  },
  words: {
    ...StyleSheet.absoluteFillObject,
    padding: Spacing.md,
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCream,
  },
  wordsText: {
    ...Typography.editorial,
    fontSize: 15,
    lineHeight: 21,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    // Der Streifen liegt ÜBER einem Foto. Bei 0,92 blieb ein dunkles Foto mit
    // 8 % durch und zog den Grund auf #E0DED9 — dort steht `accentInk` bei
    // 3,79:1 statt der 4,51 auf Papier. Voll deckend ist der Grund bekannt.
    backgroundColor: Colors.background,
  },
  cardNo: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: Colors.accentInk,
  },
  date: {
    flex: 1,
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  slot: {
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
});
