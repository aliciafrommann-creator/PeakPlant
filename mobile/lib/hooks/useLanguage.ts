import { useAppStore } from '../store';
import type { Lang } from '../types';

export function useLanguage() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  function t(en: string, de: string): string {
    return language === 'de' ? de : en;
  }

  return { language, setLanguage, t };
}

export type { Lang };
