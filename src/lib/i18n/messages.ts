import enMessages from '@/lib/i18n/messages/en.json';
import ruMessages from '@/lib/i18n/messages/ru.json';
import { DEFAULT_LOCALE, FALLBACK_LOCALE } from '@/lib/i18n/config';

type MessageTree = Record<string, unknown>;

function mergeMessages(base: MessageTree, override: MessageTree): MessageTree {
  const merged: MessageTree = { ...base };

  for (const [key, overrideValue] of Object.entries(override)) {
    const baseValue = merged[key];

    if (
      baseValue !== null &&
      typeof baseValue === 'object' &&
      !Array.isArray(baseValue) &&
      overrideValue !== null &&
      typeof overrideValue === 'object' &&
      !Array.isArray(overrideValue)
    ) {
      merged[key] = mergeMessages(baseValue as MessageTree, overrideValue as MessageTree);
      continue;
    }

    merged[key] = overrideValue;
  }

  return merged;
}

export function getI18nMessages(locale = DEFAULT_LOCALE): MessageTree {
  const fallback = enMessages as MessageTree;
  const active = locale === FALLBACK_LOCALE ? fallback : (ruMessages as MessageTree);

  return mergeMessages(fallback, active);
}
