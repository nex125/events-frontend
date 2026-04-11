import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
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

export const metadata: Metadata = {
  title: 'Ticketok - Билеты на события',
  description: 'Актуальная информация о предстоящих событиях и возможность покупки билетов',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = DEFAULT_LOCALE;
  const localeTag = resolveLocaleTag();
  const messages = getI18nMessages(locale);

  return (
    <html
      lang={localeTag}
      data-theme="dark"
      className={`${manrope.variable} ${inter.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a href="#main" className="ds-skip-link">
            {locale === 'ru' ? 'Перейти к содержимому' : 'Skip to content'}
          </a>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
