import { useEffect, useMemo, useState, useCallback } from 'react';

export type Lang = 'en' | 'ar';

const LS_LANG = 'servly_lang';

// Overloads:
// 1) t("English", "Arabic", vars?)
// 2) t("Key", vars?)  <-- optional backward compatibility
type Vars = Record<string, string>;

export function useMerchantLang() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = (localStorage.getItem(LS_LANG) as Lang | null) || null;
    return saved === 'ar' ? 'ar' : 'en';
  });

  // keep in sync with other pages/toggles
  useEffect(() => {
    const onLang = (e: any) => {
      const next = (e?.detail as Lang) || null;
      if (next === 'ar' || next === 'en') setLang(next);
    };

    window.addEventListener('servly:lang', onLang as EventListener);

    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== LS_LANG) return;
      const next = (ev.newValue as Lang | null) || null;
      if (next === 'ar' || next === 'en') setLang(next);
    };

    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('servly:lang', onLang as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const dir = useMemo(() => (lang === 'ar' ? 'rtl' : 'ltr'), [lang]);

  // optional dictionary for "t('Key')" usage if any old pages exist
  const dict = useMemo(() => {
    return {
      en: {} as Record<string, string>,
      ar: {} as Record<string, string>,
    };
  }, []);

  const applyVars = useCallback((text: string, vars?: Vars) => {
    if (!vars) return text;
    return Object.keys(vars).reduce((acc, k) => acc.replace(`{${k}}`, vars[k]), text);
  }, []);

  const t = useCallback(
    (a: string, b?: string | Vars, c?: Vars) => {
      // Case 1: t("English","Arabic",vars?)
      if (typeof b === 'string') {
        const chosen = lang === 'ar' ? b : a;
        return applyVars(chosen, c);
      }

      // Case 2: t("Key", vars?) - backward compatible
      const key = a;
      const vars = b as Vars | undefined;
      const fromDict = (lang === 'ar' ? dict.ar[key] : dict.en[key]) ?? key;
      return applyVars(fromDict, vars);
    },
    [applyVars, dict.ar, dict.en, lang]
  );

  const setLanguage = useCallback((next: Lang) => {
    localStorage.setItem(LS_LANG, next);
    window.dispatchEvent(new CustomEvent('servly:lang', { detail: next }));
    setLang(next);
  }, []);

  const toggleLang = useCallback(() => {
    const next = lang === 'en' ? 'ar' : 'en';
    setLanguage(next);
  }, [lang, setLanguage]);

  return { lang, dir, t, setLanguage, toggleLang };
}
