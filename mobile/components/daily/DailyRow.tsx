import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { PressableScale } from '../../components/ui/PressableScale';
import { FlipCard } from './FlipCard';
import type { Daily } from '../../lib/types';

const KARTE = 116;

interface DailyRowProps {
  /** Die Karten von HEUTE, eigene zuerst (`tagesReihe` in lib/daily.ts). */
  heute: readonly Daily[];
  /** Hat die eigene Person heute schon etwas dagelassen? */
  eigeneDa: boolean;
  t: (en: string, de: string) => string;
}

/**
 * Die Tagesreihe: was die Menschen in diesem Space heute dagelassen haben.
 *
 * DER LEERE PLATZ IST DIE EINLADUNG. Er steht vorn und sagt „lass eine Sache
 * da" — nicht „du hast heute noch nicht". Der Unterschied ist der ganze
 * Unterschied: Das eine ist ein Angebot, das andere ein Vorwurf, und
 * MANIFESTO §3 erlaubt nur das eine.
 *
 * Wenn niemand etwas dagelassen hat, steht hier trotzdem der leere Platz —
 * aber keine Zeile darüber, die das Fehlen benennt. Ein stiller Tag ist kein
 * Ereignis, über das die App etwas sagen müsste.
 */
export function DailyRow({ heute, eigeneDa, t }: DailyRowProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>{t('TODAY', 'HEUTE')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.reihe}
      >
        {!eigeneDa && (
          <PressableScale
            style={styles.leer}
            onPress={() => router.push('/daily/today')}
            scaleTo={0.97}
            accessibilityLabel={t('Leave a photo and a note', 'Ein Foto und eine Notiz dalassen')}
          >
            <Text style={styles.leerZeichen}>+</Text>
            <Text style={styles.leerText}>
              {t('leave one thing', 'lass eine Sache da')}
            </Text>
          </PressableScale>
        )}

        {heute.map((k) => (
          <FlipCard
            key={k.id}
            photoUri={k.photoUri}
            note={k.note}
            authorName={k.authorName}
            size={KARTE}
            labelVorne={t(
              `Photo from ${k.authorName} — tap to read the note`,
              `Foto von ${k.authorName} — tippen, um die Notiz zu lesen`,
            )}
            labelHinten={t(
              `Note from ${k.authorName} — tap to turn back`,
              `Notiz von ${k.authorName} — tippen, um zurückzudrehen`,
            )}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: Spacing.lg, gap: Spacing.xs },
  kicker: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.screen,
  },
  reihe: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingLeft: Spacing.screen,
    paddingRight: Spacing.xl,
    paddingTop: 4,
  },
  leer: {
    width: KARTE,
    height: KARTE,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
  },
  leerZeichen: { fontSize: 22, fontWeight: '300', color: Colors.textMuted },
  leerText: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
});
