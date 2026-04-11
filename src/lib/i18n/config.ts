export const DEFAULT_LOCALE = 'ru';
export const FALLBACK_LOCALE = 'en';
export const DEFAULT_LOCALE_TAG = 'ru-RU';
export const DEFAULT_CURRENCY = 'BYN';

export function resolveLocaleTag(): string {
  const configured = process.env.NEXT_PUBLIC_LOCALE_TAG;
  if (!configured || configured.includes('${')) {
    return DEFAULT_LOCALE_TAG;
  }

  return configured;
}
