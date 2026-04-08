const DEFAULT_EVENT_TIME_ZONE = 'Europe/Bratislava';

function resolveEventTimeZone(): string {
  const configured = process.env.NEXT_PUBLIC_EVENT_TIME_ZONE;
  if (!configured) return DEFAULT_EVENT_TIME_ZONE;

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: configured });
    return configured;
  } catch {
    return DEFAULT_EVENT_TIME_ZONE;
  }
}

const EVENT_TIME_ZONE = resolveEventTimeZone();

export function formatEventDateShort(datetimeUtc: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: EVENT_TIME_ZONE,
    day: 'numeric',
    month: 'short',
  }).format(new Date(datetimeUtc));
}

export function formatEventDateLong(datetimeUtc: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: EVENT_TIME_ZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(datetimeUtc));
}

export function formatEventTime(datetimeUtc: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: EVENT_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(datetimeUtc));
}
