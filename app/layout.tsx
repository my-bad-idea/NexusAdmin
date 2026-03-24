import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { resolveLocale, toLanguageTag } from '@/lib/locale';
import './globals.css';

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
    <html lang={languageTag} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&family=DM+Mono:wght@400;500&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
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
