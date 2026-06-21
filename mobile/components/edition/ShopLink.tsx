import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SHOP_URL } from '../../lib/config';

interface ShopLinkProps {
  /** 'card' = prominent block (end of a diary); 'inline' = quiet text link. */
  variant?: 'card' | 'inline';
  label?: string;
}

/** Sends people to the shop to get a new physical edition. */
export function ShopLink({ variant = 'card', label }: ShopLinkProps) {
  const text = label ?? (variant === 'card' ? 'GET YOUR NEXT EDITION' : 'get more editions →');
  const open = () => {
    Linking.openURL(SHOP_URL).catch(() => {});
  };

  if (variant === 'inline') {
    return (
      <TouchableOpacity
        onPress={open}
        accessibilityRole="link"
        accessibilityLabel="Get more editions in the shop"
      >
        <Text style={styles.inline}>{text}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={open}
      activeOpacity={0.85}
      accessibilityRole="link"
      accessibilityLabel="Get your next edition in the shop"
    >
      <Text style={styles.cardText}>{text}</Text>
      <Text style={styles.cardHint}>collected a deck? there's always a new one.</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardText: { fontSize: 11, fontWeight: '500', letterSpacing: 2.5, color: Colors.accent },
  cardHint: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  inline: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: Colors.accent,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
