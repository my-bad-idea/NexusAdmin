'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { toLanguageTag } from '@/lib/locale';

/**
 * Syncs <html lang="..."> with the current locale from next-intl.
 * Ensures native controls (date pickers, form validation messages, etc.)
 * render in the correct language.
 */
export function HtmlLangSync() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = toLanguageTag(locale);
  }, [locale]);

  return null;
}
