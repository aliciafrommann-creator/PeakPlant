import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/spacing';
import { useLanguage } from '../../../lib/hooks/useLanguage';
import { useSpaces } from '../../../lib/hooks/useSpaces';
import { feedbackRepository } from '../../../lib/repositories';
import { acknowledgeSelection, confirmSuccess } from '../../../lib/haptics';

const MAX_TIP = 280;

export default function FeedbackScreen() {
  const { id: savedDateId, memoryId, title, momentId } = useLocalSearchParams<{
    id: string;
    memoryId: string;
    title?: string;
    momentId?: string;
  }>();
  const { t } = useLanguage();
  const { activeSpace } = useSpaces();

  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [tip, setTip] = useState('');
  const [saving, setSaving] = useState(false);

  const goToMemory = () => {
    if (memoryId) {
      router.replace(`/memory/${memoryId}`);
    } else {
      router.replace('/(tabs)/discover');
    }
  };

  const handleSave = async () => {
    if (!rating || saving || !activeSpace || !momentId) {
      goToMemory();
      return;
    }
    setSaving(true);
    try {
      await feedbackRepository.save({
        savedDateId,
        spaceId: activeSpace.id,
        momentId,
        rating,
        tip: tip.trim() || undefined,
      });
      await confirmSuccess();
    } catch {
      Alert.alert(
        t('could not save feedback', 'Feedback konnte nicht gespeichert werden'),
        t('your memory has been saved. the rating was not.', 'deine Erinnerung wurde gespeichert. Die Bewertung nicht.'),
      );
    } finally {
      goToMemory();
    }
  };

  const STARS: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goToMemory}
            accessibilityRole="button"
            accessibilityLabel={t('Skip', 'Uberspringen')}
          >
            <Text style={styles.skip}>{t('SKIP', 'UBERSPRINGEN')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('HOW WAS IT?', 'WIE WAR ES?')}</Text>
          <TouchableOpacity
            onPress={() => void handleSave()}
            disabled={saving || !rating}
            accessibilityRole="button"
            accessibilityLabel={t('Save feedback', 'Feedback speichern')}
          >
            {saving ? (
              <ActivityIndicator color={Colors.accent} size="small" />
            ) : (
              <Text style={[styles.saveBtn, !rating && styles.saveBtnDisabled]}>
                {t('SAVE', 'SPEICHERN')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {title ? (
            <Text style={styles.ideaTitle}>{title}</Text>
          ) : null}

          <Text style={styles.sectionLabel}>{t('YOUR RATING', 'DEINE BEWERTUNG')}</Text>
          <View style={styles.stars}>
            {STARS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => {
                  setRating(s);
                  void acknowledgeSelection();
                }}
                accessibilityRole="button"
                accessibilityLabel={t(`${s} star${s > 1 ? 's' : ''}`, `${s} Stern${s > 1 ? 'e' : ''}`)}
                style={styles.starBtn}
              >
                <Text style={[styles.star, rating !== null && s <= rating && styles.starFilled]}>
                  {rating !== null && s <= rating ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tipBlock}>
            <Text style={styles.sectionLabel}>{t('PRACTICAL TIP', 'PRAKTISCHER TIPP')}</Text>
            <Text style={styles.tipNote}>
              {t(
                'optional · what worked, what to bring, how long it really took. private on this device for now.',
                'optional · was hat geklappt, was mitbringen, wie lange es wirklich dauerte. Bleibt vorerst privat auf diesem Gerät.',
              )}
            </Text>
            <TextInput
              style={styles.tipInput}
              placeholder={t('your practical takeaway...', 'dein praktisches Fazit...')}
              placeholderTextColor={Colors.textFaint}
              multiline
              maxLength={MAX_TIP}
              value={tip}
              onChangeText={setTip}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {tip.length}/{MAX_TIP}
            </Text>
          </View>

          <Text style={styles.privacyNote}>
            {t(
              'your diary memory stays separate and private. PeakPlant will ask before any future community sharing.',
              'Eure Tagebucherinnerung bleibt getrennt und privat. Vor einer späteren Community-Freigabe fragt PeakPlant ausdrücklich nach.',
            )}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  skip: { fontSize: 10, fontWeight: '400', letterSpacing: 2, color: Colors.textFaint },
  headerTitle: { fontSize: 10, fontWeight: '500', letterSpacing: 2.5, color: Colors.text },
  saveBtn: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.text },
  saveBtnDisabled: { opacity: 0.3 },
  content: { padding: Spacing.screen, gap: Spacing.xl, paddingBottom: Spacing.xxxl },
  ideaTitle: {
    fontSize: 22,
    fontWeight: '200',
    color: Colors.text,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 3,
    color: Colors.textFaint,
    marginBottom: -Spacing.sm,
  },
  stars: { flexDirection: 'row', gap: Spacing.md },
  starBtn: { padding: Spacing.xs },
  star: { fontSize: 36, color: Colors.border },
  starFilled: { color: Colors.accent },
  tipBlock: { gap: Spacing.sm },
  tipNote: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  tipInput: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    minHeight: 80,
    lineHeight: 22,
  },
  charCount: { fontSize: 10, fontWeight: '300', color: Colors.textFaint, alignSelf: 'flex-end' },
  privacyNote: {
    fontSize: 11,
    fontWeight: '300',
    color: Colors.textFaint,
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
