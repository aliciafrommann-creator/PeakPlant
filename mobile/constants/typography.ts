import { Platform } from 'react-native';

/**
 * Editorial voice = geometric modern-clean, with a little air (Alicia,
 * 11.08.: "am liebsten futura oder so, mit etwas abstand und modern clean").
 * Futura ships with iOS (Medium is its lightest cut); Android falls back to
 * the system sans — no bundled asset, no licence risk. For pixel-identical
 * Android parity later: bundle Jost (free Futura-alike) via expo-font.
 */
const editorialSans = Platform.select({ ios: 'Futura', android: undefined, default: undefined });

export const Typography = {
  /** Big editorial moment — screen openings, onboarding statements.
   *  Geometric, slightly tracked-out — never cramped. */
  display: {
    fontFamily: editorialSans,
    fontSize: 38,
    fontWeight: '500' as const,
    letterSpacing: 0.6,
    color: '#1E1C1A',
    lineHeight: 46,
  },
  /** Editorial title — idea/memory titles, section openings. */
  editorial: {
    fontFamily: editorialSans,
    fontSize: 25,
    fontWeight: '500' as const,
    letterSpacing: 0.4,
    color: '#1E1C1A',
    lineHeight: 32,
  },
  hero: {
    fontSize: 42,
    fontWeight: '300' as const,
    letterSpacing: -0.5,
    color: '#1E1C1A',
    lineHeight: 50,
  },
  heading: {
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: -0.3,
    color: '#1E1C1A',
    lineHeight: 34,
  },
  subheading: {
    fontSize: 20,
    fontWeight: '400' as const,
    letterSpacing: -0.2,
    color: '#1A1A1A',
    lineHeight: 26,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  label: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 2,
    color: '#777777',
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    color: '#777777',
    lineHeight: 18,
  },
  mono: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 1,
    color: '#555555',
    fontFamily: 'monospace',
  },
};
