import React from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { PressableScale } from '../ui/PressableScale';
import { composeInviteText } from '../../lib/shareText';
import { acknowledgeSelection } from '../../lib/haptics';

interface AloneRowProps {
  inviteCode: string;
  spaceName?: string;
  t: (en: string, de: string) => string;
}

/**
 * „Dein Mensch ist noch nicht da."
 *
 * Warum es das gibt: In der Produktionsdatenbank stehen vier Spaces und
 * KEINER hat je ein zweites Mitglied bekommen. Ein Grund davon liegt hier —
 * nach dem Onboarding fragte die App **nie wieder** nach der zweiten Person.
 * Kein Bildschirm las die Mitgliederzahl; ein Space mit einem Menschen sah
 * exakt aus wie einer mit zweien, während überall „ihr beide" stand.
 *
 * Die Regeln dieser Zeile, damit sie eine Einladung bleibt und kein Drängen
 * (MANIFESTO §3):
 *   - Sie erscheint NUR, solange der Space wirklich eine Person hat.
 *   - Sie zählt nichts, mahnt nichts an und wird nicht lauter mit der Zeit.
 *   - Sie verschwindet von selbst in dem Moment, in dem jemand beitritt.
 *   - Geteilt wird ausschließlich über das System-Blatt, das ein Mensch
 *     antippt — nie automatisch (§2).
 */
export function AloneRow({ inviteCode, spaceName, t }: AloneRowProps) {
  async function invite() {
    void acknowledgeSelection();
    try {
      await Share.share({ message: composeInviteText(inviteCode, spaceName) });
    } catch {
      // Das Teilen-Blatt wurde geschlossen — nichts zu retten, nichts zu melden.
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.line}>
        {t('right now it is just you here.', 'gerade seid ihr hier noch zu einem.')}
      </Text>
      <Text style={styles.hint}>
        {t(
          'everything works on your own — and it gets warmer with your person in it.',
          'allein geht alles — und mit deinem Menschen darin wird es wärmer.',
        )}
      </Text>
      <PressableScale
        containerStyle={styles.ctaSlot}
        style={styles.cta}
        onPress={() => void invite()}
        scaleTo={0.98}
        accessibilityLabel={t('Invite your person', 'Deinen Menschen einladen')}
      >
        <Text style={styles.ctaText}>{t('INVITE YOUR PERSON', 'DEINEN MENSCHEN EINLADEN')}</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.sm,
    backgroundColor: Colors.backgroundCream,
    gap: 6,
  },
  line: {
    ...Typography.editorial,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.text,
  },
  hint: {
    ...Typography.micro,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  ctaSlot: { alignSelf: 'flex-start', marginTop: Spacing.xs },
  cta: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pill,
    backgroundColor: Colors.text,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: Colors.white,
  },
});
