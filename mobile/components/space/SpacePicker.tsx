import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Share,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { PressableScale } from '../ui/PressableScale';
import { FadeInImage } from '../ui/FadeInImage';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';
import { acknowledgeSelection } from '../../lib/haptics';
import { bestInk } from '../../lib/contrast';
import { colorForSpace } from '../../lib/spaceColors';
import { composeInviteText } from '../../lib/shareText';
import type { Space } from '../../lib/types';

interface SpacePickerProps {
  visible: boolean;
  spaces: Space[];
  activeSpaceId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

function glyphFor(type: Space['type']): string {
  if (type === 'couple') return '♥';
  // Der Stein aus `lib/spaceTheme.ts` — dasselbe Bild wie beim Sammelstück.
  // Vorher fiel `solo` in den Else-Zweig und bekam ✦, das Zeichen für
  // „geteilt". Ein binäres Ternär mit drei Werten ist der klassische Fehler
  // beim Erweitern eines Enums.
  if (type === 'solo') return '🪨';
  return '✦';
}

/** Die Art in Worten. Ein Solo-Space war hier bis 18.08.2026 „Freunde-Space". */
function typeLabel(type: Space['type'], t: (en: string, de: string) => string): string {
  if (type === 'couple') return t('couple space', 'Paar-Space');
  if (type === 'solo') return t('just you', 'nur du');
  return t('friends space', 'Freunde-Space');
}

/**
 * An Instagram-style account switcher for spaces: tap the space name in the
 * header and this sheet drops in. Switch space, add a new one, or share any
 * space by invite link — all from one calm surface.
 */
export function SpacePicker({ visible, spaces, activeSpaceId, onSelect, onClose }: SpacePickerProps) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    if (reduced) {
      anim.setValue(1);
      return;
    }
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, reduced, anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });

  async function shareSpace(space: Space) {
    void acknowledgeSelection();
    try {
      await Share.share({ message: composeInviteText(space.inviteCode, space.name) });
    } catch {
      // Share sheet dismissed/unavailable — nothing to recover.
    }
  }

  function addSpace() {
    onClose();
    router.push('/space/new');
  }

  function editSpace(spaceId: string) {
    onClose();
    router.push({ pathname: '/space/edit', params: { id: spaceId } });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('Close', 'Schließen')}>
        {/* AUSDRÜCKLICHER SICHERHEITSABSTAND statt `SafeAreaView`.
            In einem `Modal` rendert iOS außerhalb des Anbieters, der die
            Einzüge kennt — `SafeAreaView` bekam dort eine Null und die
            Überschrift „DEINE SPACES" verschwand hinter der Uhrzeit.
            (Alicia, 19.08.2026: „Space wechseln ist sehr verdeckt.") */}
        <View style={[styles.safe, { paddingTop: insets.top + Spacing.sm }]}>
          <Animated.View
            style={[styles.sheet, { opacity: anim, transform: [{ translateY }] }]}
            // Stop taps inside the sheet from closing it.
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.title}>{t('YOUR SPACES', 'DEINE SPACES')}</Text>

            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {spaces.map((space, index) => {
                const active = space.id === activeSpaceId;
                const color = colorForSpace(index);
                return (
                  <View key={space.id} style={styles.row}>
                    <PressableScale
                      containerStyle={styles.rowMainSlot}
                      style={styles.rowMain}
                      scaleTo={0.98}
                      onPress={() => onSelect(space.id)}
                      accessibilityLabel={`${space.name}, ${typeLabel(space.type, t)}${
                        active ? `, ${t('current', 'aktuell')}` : ''
                      }`}
                      accessibilityRole="button"
                    >
                      <View style={[styles.dot, { backgroundColor: color }]}>
                        {space.avatarUrl ? (
                          <FadeInImage source={{ uri: space.avatarUrl }} style={styles.dotImage} />
                        ) : (
                          // Die Tinte wird gerechnet, nicht gesetzt: Der Punkt
                          // trägt eine von sieben Akzentfarben, und weiß
                          // erreichte auf sechs davon keine 4,5:1 (Sonnenblume
                          // 1,96). Das Zeichen trägt Bedeutung, ♥ heißt Paar.
                          //
                          // Dunkle Tinte ist `Colors.black`, nicht `Colors.text`:
                          // Mit dem wärmeren `text` blieben Chili (3,80) und
                          // Blossom (4,17) unter der Latte — auf zwei von sieben
                          // Farben hätte KEINE der beiden Tinten gereicht. Mit
                          // Schwarz sind es 4,70 und 5,15. `lib/spaceInk.test.ts`
                          // hält das für jede künftige Farbe fest.
                          <Text style={[styles.dotGlyph, { color: bestInk(color, Colors.black, Colors.white) }]}>
                            {space.emoji ?? glyphFor(space.type)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.rowText}>
                        <Text style={[styles.rowName, active && styles.rowNameActive]} numberOfLines={1}>
                          {space.name.toLowerCase()}
                        </Text>
                        <Text style={styles.rowType}>{typeLabel(space.type, t)}</Text>
                      </View>
                      {/* Das Häkchen NICHT in der Punktfarbe: Es sitzt auf
                          `Colors.surface`, und Sonnenblume erreicht dort 1,9:1
                          — unter den 3:1, die WCAG 1.4.11 für ein
                          bedeutungstragendes Symbol verlangt. */}
                      {active && (
                        <Ionicons name="checkmark-circle" size={20} color={Colors.text} style={styles.check} />
                      )}
                    </PressableScale>

                    <Pressable
                      style={styles.iconBtn}
                      onPress={() => editSpace(space.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel={t(`Edit ${space.name}`, `${space.name} bearbeiten`)}
                    >
                      <Ionicons name="pencil-outline" size={16} color={Colors.textMuted} />
                    </Pressable>

                    {/* Kein Teilen an einem Solo-Space: Der Code lässt dort
                        niemanden herein (Migration 0024). Wer trotzdem tippte,
                        verschickte eine Einladung, die beim Empfänger in
                        „dieser Space ist für eine Person" endet — ein Weg, der
                        garantiert scheitert, angeboten von uns. */}
                    {space.type !== 'solo' && (
                      <Pressable
                        style={styles.iconBtn}
                        onPress={() => shareSpace(space)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel={t(`Share ${space.name} by invite link`, `${space.name} per Einladungslink teilen`)}
                      >
                        <Ionicons name="share-outline" size={16} color={Colors.textMuted} />
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            <PressableScale
              style={styles.addRow}
              scaleTo={0.98}
              onPress={addSpace}
              accessibilityLabel={t('Add a new space', 'Neuen Space hinzufügen')}
              accessibilityRole="button"
            >
              <View style={styles.addIcon}>
                <Ionicons name="add" size={20} color={Colors.accent} />
              </View>
              <Text style={styles.addText}>{t('new space', 'neuer Space')}</Text>
            </PressableScale>
          </Animated.View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,28,26,0.35)',
  },
  safe: {
    paddingHorizontal: Spacing.md,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.sm,
    ...Shadows.float,
    maxHeight: '80%',
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textSubtle,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  list: {
    // Die Liste durfte vorher nicht wachsen und wurde mitten in der zweiten
    // Zeile abgeschnitten — es sah aus, als gäbe es nur einen Space.
    flexGrow: 0,
    maxHeight: 320,
  },
  listContent: {
    paddingVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
  },
  /** Breitenanteil gehört ans äußere Pressable, nicht an die skalierende Fläche. */
  rowMainSlot: { flex: 1 },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  dot: {
    width: 38,
    height: 38,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Ohne `color`: Die Farbe kommt beim Rendern aus `bestInk(…)`. (Kein
  // `kontrast-ok`-Marker — der Block hat keine Farbe, der Wächter überspringt
  // ihn ohnehin, und ein Marker, der nichts entschuldigt, täuscht eine
  // Ausnahme vor, die es nicht gibt.)
  dotGlyph: {
    fontSize: 16,
  },
  dotImage: {
    width: 38,
    height: 38,
    borderRadius: Radii.pill,
  },
  rowText: { flex: 1, gap: 2 },
  rowName: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.text,
  },
  rowNameActive: {
    fontWeight: '600',
  },
  rowType: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    color: Colors.textSubtle,
    textTransform: 'uppercase',
  },
  check: {
    marginLeft: Spacing.sm,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundWarm,
    marginRight: 4,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addIcon: {
    width: 38,
    height: 38,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addText: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.text,
  },
});
