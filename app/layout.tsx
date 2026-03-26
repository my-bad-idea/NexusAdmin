import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { Bricolage_Grotesque, DM_Mono, Instrument_Sans } from 'next/font/google';
import { resolveLocale, toLanguageTag } from '@/lib/locale';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-display-custom',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-custom',
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NexusAdmin',
  description: 'Modern admin dashboard',
};

// Root layout — Next.js 16 requires <html> and <body> in root layout.
// Keep lang resolution aligned with middleware:
// NEXT_LOCALE cookie first, then Accept-Language fallback.
// HtmlLangSync in [locale]/layout.tsx keeps lang synced during client-side navigation.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const headerList = await headers();
  const locale = resolveLocale(
    cookieStore.get('NEXT_LOCALE')?.value,
    headerList.get('accept-language')
  );
  const languageTag = toLanguageTag(locale);
  return (
    <html lang={languageTag} className={`${bricolage.variable} ${dmMono.variable} ${instrumentSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('nexus-theme');var mode=s?JSON.parse(s).state?.mode:'system';var isDark=mode==='dark'||(mode!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(isDark)document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
