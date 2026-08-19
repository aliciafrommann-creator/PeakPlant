import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { PressableScale } from './PressableScale';
import { acknowledgeSelection } from '../../lib/haptics';

/**
 * Der Umschalter zwischen den zwei Hälften von „Entdecken": IDEEN und ORTE.
 *
 * WARUM ES DAS GIBT (Alicia, 19.08.2026): „manche Wege sollten glaube ich
 * prominenter sein und nicht random irgendwo als Button."
 *
 * Die Orte-Hälfte — Karte, eigene Orte anlegen, Bewertungen, „hier ein Date
 * planen" — hing bis dahin an EINEM Chip in einer waagerechten Wischreihe,
 * gleichberechtigt neben zwei Filter-Knöpfen. Und weil diese Reihe bis heute
 * Mittag gar nicht wischbar war, ragte genau dieser Chip über den Rand: Ein
 * ganzer Bereich der App war unerreichbar, ohne dass irgendetwas kaputt war.
 *
 * Ein Bereich ist kein Filter. Er bekommt deshalb einen festen Platz ganz
 * oben, auf BEIDEN Bildschirmen, immer sichtbar — und man sieht, wo man ist.
 */
export type Modus = 'ideen' | 'orte';

export function ModeSwitch({ aktiv, t }: { aktiv: Modus; t: (en: string, de: string) => string }) {
  const gehe = (ziel: Modus) => {
    if (ziel === aktiv) return;
    void acknowledgeSelection();
    router.replace(ziel === 'ideen' ? '/(tabs)/discover' : '/(tabs)/community');
  };

  return (
    <View style={styles.leiste}>
      {(
        [
          ['ideen', t('IDEAS', 'IDEEN')],
          ['orte', t('PLACES', 'ORTE')],
        ] as [Modus, string][]
      ).map(([schluessel, label]) => {
        const an = schluessel === aktiv;
        return (
          <PressableScale
            key={schluessel}
            containerStyle={styles.haelfte}
            style={[styles.knopf, an && styles.knopfAn]}
            onPress={() => gehe(schluessel)}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel={an ? `${label} — ${t('selected', 'ausgewählt')}` : label}
          >
            <Text style={[styles.text, an && styles.textAn]}>{label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  leiste: {
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.md,
    padding: 3,
    borderRadius: Radii.pill,
    backgroundColor: Colors.backgroundWarm,
  },
  haelfte: { flex: 1 },
  knopf: {
    paddingVertical: 9,
    borderRadius: Radii.pill,
    alignItems: 'center',
  },
  knopfAn: { backgroundColor: Colors.background },
  text: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    color: Colors.textMuted,
  },
  textAn: { color: Colors.text },
});
