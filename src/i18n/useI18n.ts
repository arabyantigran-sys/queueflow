import { useCallback } from 'react';
import { create } from 'zustand';
import { translate } from './translations';
import type { Lang } from './types';

const STORAGE_KEY = 'queueflow_lang';

function readLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === 'hy' || saved === 'ru' || saved === 'en') return saved;
  } catch {
    /* ignore */
  }
  return 'hy';
}

interface I18nState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  lang: typeof window !== 'undefined' ? readLang() : 'hy',
  setLang: (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'hy' ? 'hy' : lang;
    }
    set({ lang });
  },
}));

/** Subscribe to language so UI re-renders on switch. */
export function useI18n() {
  const lang = useI18nStore((s) => s.lang);
  const setLang = useI18nStore((s) => s.setLang);
  const t = useCallback((key: string) => translate(lang, key), [lang]);
  return { lang, setLang, t };
}
