/**
 * "Ask PeakPlant" — conversational date discovery.
 *
 * In the beta this is backed by the deterministic curated recommender
 * (the AI Edge Function is a 501 stub). All results are labeled with their
 * source. When the AI is active, the source changes to 'ai' and the label
 * updates. The user always sees where the suggestion came from.
 *
 * Honesty contract: never claims to be AI when it's curated.
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useLanguage } from '../../lib/hooks/useLanguage';
import { useSpaces } from '../../lib/hooks/useSpaces';
import { askGateway } from '../../lib/ai/askGateway';
import { assessSafety } from '../../lib/ai/safety';
import type { DateRecommendation } from '../../lib/discovery/types';
import type { DateConstraints } from '../../lib/discovery/types';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  recommendations?: DateRecommendation[];
  sourceLabel?: string;
  /** When true this is the neutral crisis-help response, not a playful one. */
  crisis?: boolean;
}

export default function AskScreen() {
  const { t } = useLanguage();
  const { activeSpace } = useSpaces();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: t(
        "what kind of date are you in the mood for? tell me what you're feeling and I'll find something that fits.",
        'Worauf hast du Lust? Erzahl mir wie du dich fuhlst und ich finde etwas Passendes.',
      ),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMessage: Message = { role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);

    // Crisis route (AI_SAFETY): if the text credibly signals immediate danger,
    // suppress any playful/recommendation response and surface neutral help.
    // The input is not stored, logged, or used for personalization.
    const safety = assessSafety(text);
    if (safety.kind === 'crisis') {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          crisis: true,
          text: t(
            "it sounds like you might be going through something serious. PeakPlant can't help with this, but people who can are available right now. In an emergency call 112. You can reach the Telefonseelsorge anytime, free and confidential, at 0800 111 0 111 or 0800 111 0 222. You are not alone.",
            "Es klingt, als würdest du gerade etwas Ernstes durchmachen. PeakPlant kann dabei nicht helfen, aber Menschen, die das können, sind jetzt für dich da. Im Notfall wähle 112. Die Telefonseelsorge erreichst du jederzeit, kostenlos und vertraulich, unter 0800 111 0 111 oder 0800 111 0 222. Du bist nicht allein.",
          ),
        },
      ]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    setLoading(true);
    try {
      const constraints: DateConstraints = {
        spaceType: activeSpace?.type ?? 'couple',
      };
      const result = await askGateway(constraints, text, false);
      const recs = result.recommendations.slice(0, 3);

      const replyText =
        recs.length > 0
          ? t(
              `here ${recs.length === 1 ? 'is' : 'are'} ${recs.length > 1 ? 'a few ideas' : 'an idea'} that might fit.`,
              `hier ${recs.length === 1 ? 'ist' : 'sind'} ${recs.length > 1 ? 'ein paar Ideen' : 'eine Idee'}, die passen konnte.`,
            )
          : t(
              "I couldn't find anything that fits right now. try adjusting your idea.",
              'Im Moment habe ich leider nichts Passendes gefunden. Versuch es anders zu beschreiben.',
            );

      const assistantMessage: Message = {
        role: 'assistant',
        text: replyText,
        recommendations: recs,
        sourceLabel: result.sourceLabel,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: t(
            "something went wrong. please try again.",
            'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
          ),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, loading, activeSpace, t]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('Back', 'Zuruck')}
          >
            <Text style={styles.back}>{'<-'} {t('BACK', 'ZURUCK')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('ASK PEAKPLANT', 'PEAKPLANT FRAGEN')}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((msg, i) => (
            <View key={i} style={msg.role === 'user' ? styles.userBubble : styles.assistantBlock}>
              {msg.role === 'user' ? (
                <Text style={styles.userText}>{msg.text}</Text>
              ) : msg.crisis ? (
                <View style={styles.crisisBlock} accessibilityLiveRegion="polite">
                  <Text style={styles.crisisText}>{msg.text}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.assistantText}>{msg.text}</Text>
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <View style={styles.recs}>
                      {msg.recommendations.map((rec) => (
                        <TouchableOpacity
                          key={rec.id}
                          style={styles.recCard}
                          onPress={() => router.push(`/together/${rec.momentId}`)}
                          accessibilityRole="button"
                          accessibilityLabel={rec.title}
                        >
                          <Text style={styles.recTitle}>{rec.title}</Text>
                          <Text style={styles.recConcept}>{rec.concept}</Text>
                          <View style={styles.recMeta}>
                            <Text style={styles.recMetaText}>{rec.estDurationMin} min</Text>
                            <Text style={styles.recMetaDot}>·</Text>
                            <Text style={styles.recMetaText}>{rec.priceBand}</Text>
                          </View>
                          <Text style={styles.recWhy}>{rec.why}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {msg.sourceLabel && (
                    <Text style={styles.sourceLabel}>{msg.sourceLabel}</Text>
                  )}
                </>
              )}
            </View>
          ))}
          {loading && (
            <View style={styles.assistantBlock}>
              <ActivityIndicator color={Colors.accent} size="small" />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t('what are you in the mood for?', 'Worauf hast du Lust?')}
            placeholderTextColor={Colors.textFaint}
            value={input}
            onChangeText={setInput}
            returnKeyType="send"
            onSubmitEditing={() => void handleSend()}
            multiline={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => void handleSend()}
            disabled={!input.trim() || loading}
            accessibilityRole="button"
            accessibilityLabel={t('Send', 'Senden')}
          >
            <Text style={styles.sendBtnText}>{'->'}</Text>
          </TouchableOpacity>
        </View>
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
  back: { fontSize: 10, fontWeight: '500', letterSpacing: 2, color: Colors.textMuted, width: 60 },
  headerTitle: { fontSize: 10, fontWeight: '500', letterSpacing: 2.5, color: Colors.text },
  messages: { padding: Spacing.screen, gap: Spacing.lg, paddingBottom: Spacing.xl },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: '80%',
  },
  userText: { fontSize: 15, fontWeight: '300', color: Colors.white, lineHeight: 22 },
  assistantBlock: { gap: Spacing.md, maxWidth: '100%' },
  crisisBlock: {
    backgroundColor: Colors.backgroundCream,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    padding: Spacing.md,
  },
  crisisText: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.text,
    lineHeight: 23,
  },
  assistantText: {
    fontSize: 15,
    fontWeight: '300',
    color: Colors.text,
    lineHeight: 22,
  },
  recs: { gap: Spacing.sm },
  recCard: {
    backgroundColor: Colors.backgroundCream,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  recTitle: { fontSize: 17, fontWeight: '200', color: Colors.text, letterSpacing: -0.2 },
  recConcept: { fontSize: 13, fontWeight: '300', color: Colors.textMuted, lineHeight: 18 },
  recMeta: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  recMetaText: { fontSize: 11, fontWeight: '400', color: Colors.textMuted },
  recMetaDot: { fontSize: 11, color: Colors.textFaint },
  recWhy: { fontSize: 11, fontWeight: '300', color: Colors.accent, lineHeight: 17 },
  sourceLabel: {
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 1,
    color: Colors.textFaint,
    marginTop: -Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '300',
    color: Colors.text,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.3 },
  sendBtnText: { fontSize: 14, fontWeight: '500', color: Colors.white },
});
