import { Platform } from 'react-native';

/** Platform editorial serif — no bundled font asset required. */
const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export const Typography = {
  /** Big editorial moment — screen openings, onboarding statements. Serif. */
  display: {
    fontFamily: serif,
    fontSize: 40,
    fontWeight: '500' as const,
    letterSpacing: -0.8,
    color: '#1E1C1A',
    lineHeight: 44,
  },
  /** Editorial title — idea/memory titles, section openings. Serif. */
  editorial: {
    fontFamily: serif,
    fontSize: 26,
    fontWeight: '500' as const,
    letterSpacing: -0.4,
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
