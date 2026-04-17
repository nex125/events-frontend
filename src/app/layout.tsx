import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DEFAULT_LOCALE, resolveLocaleTag } from '@/lib/i18n/config';
import { getI18nMessages } from '@/lib/i18n/messages';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('layout');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = DEFAULT_LOCALE;
  const localeTag = resolveLocaleTag();
  const messages = getI18nMessages(locale);
  const t = await getTranslations('layout');

  return (
    <html
      lang={localeTag}
      data-theme="dark"
      className={`${manrope.variable} ${inter.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a href="#main" className="ds-skip-link">
            {t('skipToContent')}
          </a>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
