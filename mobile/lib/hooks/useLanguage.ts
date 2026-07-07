import { useCallback } from 'react';
import { useAppStore } from '../store';
import type { Lang, LocalizedText } from '../types';

/** Resolve a possibly-bilingual string for the given language. */
export function loc(text: LocalizedText | undefined, lang: Lang): string {
  if (text == null) return '';
  if (typeof text === 'string') return text;
  return lang === 'de' ? text.de : text.en;
}

export function useLanguage() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  // Stable identities (per language) so t/l are safe in effect/callback deps —
  // fresh functions every render caused focus-effects downstream to re-subscribe
  // on every render.
  /** Inline bilingual literal: t('Back', 'Zurück'). */
  const t = useCallback(
    (en: string, de: string): string => (language === 'de' ? de : en),
    [language],
  );

  /** Resolve a LocalizedText value (string or { en, de }) for the active language. */
  const l = useCallback(
    (text: LocalizedText | undefined): string => loc(text, language),
    [language],
  );

  return { language, setLanguage, t, l };
}

export type { Lang };
