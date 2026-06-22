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

  /** Inline bilingual literal: t('Back', 'Zurück'). */
  function t(en: string, de: string): string {
    return language === 'de' ? de : en;
  }

  /** Resolve a LocalizedText value (string or { en, de }) for the active language. */
  function l(text: LocalizedText | undefined): string {
    return loc(text, language);
  }

  return { language, setLanguage, t, l };
}

export type { Lang };
