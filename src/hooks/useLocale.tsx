import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { type Locale, type Strings, translations } from '@/lib/i18n';

interface LocaleCtx {
  locale: Locale;
  t: Strings;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  isRTL: boolean;
}

const LocaleContext = createContext<LocaleCtx>({
  locale: 'en',
  t: translations.en,
  setLocale: () => {},
  toggleLocale: () => {},
  isRTL: false,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('ares-locale');
    return saved === 'he' ? 'he' : 'en';
  });

  const isRTL = locale === 'he';
  const t = translations[locale];

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('ares-locale', l);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'he' : 'en');
  }, [locale, setLocale]);

  // Apply dir and lang to <html>
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    html.setAttribute('lang', locale);
  }, [locale, isRTL]);

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale, toggleLocale, isRTL }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
