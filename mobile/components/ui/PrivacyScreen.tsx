import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

/** Full-screen cover shown when the app backgrounds while sensitive content is visible. */
export function PrivacyScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.mark}>^</Text>
      <Text style={styles.label}>private</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mark: {
    fontSize: 36,
    fontWeight: '200',
    color: Colors.textFaint,
    letterSpacing: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '300',
    color: Colors.textFaint,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
});
