export const SUPPORTED_LOCALES = ['zh-CN', 'zh-TW', 'ja', 'en'] as const;
export const DEFAULT_LOCALE = 'zh-CN';

const localeByLang: Record<string, string> = {
  zh: DEFAULT_LOCALE,
  'zh-cn': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-tw': 'zh-TW',
  'zh-hk': 'zh-TW',
  'zh-hant': 'zh-TW',
  ja: 'ja',
  en: 'en',
};

function isSupportedLocale(locale: string): boolean {
  return SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number]);
}

export function parseAcceptLanguage(header: string | null): string {
  if (!header) return DEFAULT_LOCALE;

  const ordered = header
    .split(',')
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(';');
      const qValue = params.find((param) => param.trim().startsWith('q='));
      const q = qValue ? Number.parseFloat(qValue.split('=')[1] ?? '1') : 1;
      return { tag: rawTag.toLowerCase(), q: Number.isNaN(q) ? 1 : q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ordered) {
    const normalized = localeByLang[tag] ?? localeByLang[tag.split('-')[0] ?? ''];
    if (normalized && isSupportedLocale(normalized)) return normalized;
  }

  return DEFAULT_LOCALE;
}

export function resolveLocale(
  cookieLocale: string | undefined,
  acceptLanguageHeader: string | null
): string {
  if (cookieLocale && isSupportedLocale(cookieLocale)) return cookieLocale;
  return parseAcceptLanguage(acceptLanguageHeader);
}

export function toLanguageTag(locale: string): string {
  switch (locale) {
    case 'en':
      return 'en-US';
    case 'ja':
      return 'ja-JP';
    case 'zh-TW':
      return 'zh-TW';
    case 'zh-CN':
      return 'zh-CN';
    default:
      return DEFAULT_LOCALE;
  }
}
