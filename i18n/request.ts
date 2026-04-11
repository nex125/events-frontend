import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE } from '../src/lib/i18n/config';
import { getI18nMessages } from '../src/lib/i18n/messages';

export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  messages: getI18nMessages(DEFAULT_LOCALE),
}));
