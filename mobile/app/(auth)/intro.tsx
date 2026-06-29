import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { acknowledgeSelection } from '../../lib/haptics';

/**
 * A 60–90 second explainer shown once, right after language: what PeakPlant is,
 * why it's better with a partner, and what to do first. Three calm slides, then
 * straight into setting up the space. Skippable — never a wall before the app.
 */
type Slide = { mark: string; title: [string, string]; body: [string, string] };

const SLIDES: Slide[] = [
  {
    mark: '✦',
    title: ['a space for\nthe two of you', 'ein Ort für\neuch zwei'],
    body: [
      'PeakPlant is a private little place to collect the real moments you make together — not a feed, not a follower count.',
      'PeakPlant ist ein privater kleiner Ort, um die echten Momente zu sammeln, die ihr zusammen erlebt — kein Feed, keine Follower.',
    ],
  },
  {
    mark: '♥',
    title: ['better\nshared', 'gemeinsam\nschöner'],
    body: [
      'one space, two people. ideas to do together and moments kept just between you. invite your person and it comes alive.',
      'ein Space, zwei Menschen. Ideen für gemeinsam und Momente nur für euch. Lade deinen Menschen ein, dann wird es lebendig.',
    ],
  },
  {
    mark: '🌱',
    title: ['your first\nmoment', 'euer erster\nMoment'],
    body: [
      'pick a card or an idea, do it together, then keep it. that’s the whole loop — small, real, yours.',
      'wählt eine Karte oder Idee, macht sie zusammen, dann haltet sie fest. das ist der ganze Kreis — klein, echt, eurer.',
    ],
  },
];

export default function IntroScreen() {
  const { t, language } = useLanguage();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const idx = language === 'de' ? 1 : 0;
  const isLast = page >= SLIDES.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / Math.max(1, width));
    if (next !== page) setPage(next);
  };

  const finish = () => router.replace('/(auth)/onboarding');

  const next = () => {
    void acknowledgeSelection();
    if (isLast) {
      finish();
      return;
    }
    scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
    setPage(page + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity
          onPress={finish}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={t('Skip intro', 'Intro überspringen')}
        >
          <Text style={styles.skip}>{t('skip', 'überspringen')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={styles.markCircle}>
              <Text style={styles.mark}>{slide.mark}</Text>
            </View>
            <Text style={styles.title}>{slide.title[idx]}</Text>
            <Text style={styles.body}>{slide.body[idx]}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.cta}
          onPress={next}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={isLast ? t('Set up your space', 'Space einrichten') : t('Next', 'Weiter')}
        >
          <Text style={styles.ctaText}>
            {isLast ? t('SET UP YOUR SPACE', 'SPACE EINRICHTEN') : t('NEXT', 'WEITER')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.text, width: 20 },
  skip: { fontSize: 11, fontWeight: '400', letterSpacing: 1, color: Colors.textSubtle },
  pager: { flex: 1 },
  slide: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  markCircle: {
    width: 72,
    height: 72,
    borderRadius: Radii.pill,
    backgroundColor: Colors.backgroundCream,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { fontSize: 32 },
  title: { ...Typography.editorial, fontSize: 40, lineHeight: 46 },
  body: { fontSize: 16, fontWeight: '300', color: Colors.textMuted, lineHeight: 24, maxWidth: 360 },
  bottom: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing.xl, paddingTop: Spacing.md },
  cta: {
    height: 54,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.pill,
  },
  ctaText: { fontSize: 11, fontWeight: '500', letterSpacing: 3, color: Colors.white },
});
