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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Accents } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { PressableScale } from '../ui/PressableScale';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useReducedMotion } from '../../lib/hooks/useReducedMotion';
import { acknowledgeSelection } from '../../lib/haptics';
import { composeInviteText } from '../../lib/shareText';
import type { Space } from '../../lib/types';

interface SpacePickerProps {
  visible: boolean;
  spaces: Space[];
  activeSpaceId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/** Each space keeps a warm identity colour, stable by position (matches the
 *  rest of the app). */
const SPACE_COLORS = [
  Accents.chili,
  Accents.blossom,
  Accents.sunflower,
  Accents.ember,
  Accents.apricot,
  Accents.terracotta,
  Accents.sage,
] as const;

function colorForSpace(index: number): string {
  return SPACE_COLORS[index % SPACE_COLORS.length];
}

function glyphFor(type: Space['type']): string {
  return type === 'couple' ? '♥' : '✦';
}

/**
 * An Instagram-style account switcher for spaces: tap the space name in the
 * header and this sheet drops in. Switch space, add a new one, or share any
 * space by invite link — all from one calm surface.
 */
export function SpacePicker({ visible, spaces, activeSpaceId, onSelect, onClose }: SpacePickerProps) {
  const { t } = useLanguage();
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
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('Close', 'Schliessen')}>
        <SafeAreaView edges={['top']} style={styles.safe}>
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
                      style={styles.rowMain}
                      scaleTo={0.98}
                      onPress={() => onSelect(space.id)}
                      accessibilityLabel={`${space.name}, ${
                        space.type === 'couple' ? t('couple space', 'Paar-Space') : t('friends space', 'Freunde-Space')
                      }${active ? `, ${t('current', 'aktuell')}` : ''}`}
                      accessibilityRole="button"
                    >
                      <View style={[styles.dot, { backgroundColor: color }]}>
                        {space.avatarUrl ? (
                          <Image source={{ uri: space.avatarUrl }} style={styles.dotImage} />
                        ) : (
                          <Text style={styles.dotGlyph}>
                            {space.emoji ?? glyphFor(space.type)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.rowText}>
                        <Text style={[styles.rowName, active && styles.rowNameActive]} numberOfLines={1}>
                          {space.name.toLowerCase()}
                        </Text>
                        <Text style={styles.rowType}>
                          {space.type === 'couple'
                            ? t('couple space', 'Paar-Space')
                            : t('friends space', 'Freunde-Space')}
                        </Text>
                      </View>
                      {active && (
                        <Ionicons name="checkmark-circle" size={20} color={color} style={styles.check} />
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

                    <Pressable
                      style={styles.iconBtn}
                      onPress={() => shareSpace(space)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel={t(`Share ${space.name} by invite link`, `${space.name} per Einladungslink teilen`)}
                    >
                      <Ionicons name="share-outline" size={16} color={Colors.textMuted} />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>

            <PressableScale
              style={styles.addRow}
              scaleTo={0.98}
              onPress={addSpace}
              accessibilityLabel={t('Add a new space', 'Neuen Space hinzufuegen')}
              accessibilityRole="button"
            >
              <View style={styles.addIcon}>
                <Ionicons name="add" size={20} color={Colors.accent} />
              </View>
              <Text style={styles.addText}>{t('new space', 'neuer Space')}</Text>
            </PressableScale>
          </Animated.View>
        </SafeAreaView>
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
    marginTop: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.sm,
    ...Shadows.float,
    maxHeight: '80%',
  },
  title: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: Colors.textFaint,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
  },
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
  dotGlyph: {
    fontSize: 16,
    color: Colors.white,
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
    fontSize: 10,
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
