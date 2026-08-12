import { Platform } from 'react-native';

/**
 * Editorial voice = the website's light Helvetica: airy, tight-set, lowercase.
 * Helvetica Neue ships with iOS; Android falls back to the system sans
 * (Roboto Light via fontWeight) — no bundled font asset required.
 */
const editorialSans = Platform.select({ ios: 'Helvetica Neue', android: undefined, default: undefined });

export const Typography = {
  /** Big editorial moment — screen openings, onboarding statements. Light sans. */
  display: {
    fontFamily: editorialSans,
    fontSize: 40,
    fontWeight: '300' as const,
    letterSpacing: -0.8,
    color: '#1E1C1A',
    lineHeight: 44,
  },
  /** Editorial title — idea/memory titles, section openings. Light sans. */
  editorial: {
    fontFamily: editorialSans,
    fontSize: 26,
    fontWeight: '300' as const,
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
