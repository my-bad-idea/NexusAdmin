import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from 'sonner';
import Providers from './providers';
import { HtmlLangSync } from '@/components/common/HtmlLangSync';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <HtmlLangSync />
      <Providers>{children}</Providers>
      <Toaster position="top-right" richColors />
    </NextIntlClientProvider>
  );
}
