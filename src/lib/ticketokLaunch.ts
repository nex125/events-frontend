import crypto from 'node:crypto';

export const HANDOFF_COOKIE_PREFIX = 'ticketok_seatmap_launch_';
export const HANDOFF_TTL_SECONDS = 5 * 60;
const HANDOFF_MAX_AGE_MS = HANDOFF_TTL_SECONDS * 1000;

export interface TicketokLaunchPayload {
  eventId: string;
  sessionToken: string;
  state: string;
  requestId: string;
  timestamp: string;
  signature: string;
  lang: string;
  locale: string;
  currency: string;
  ticketId: string;
  expiresAt: string;
  returnUrl: string;
}

export function readLaunchValue(source: FormData | Record<string, unknown>, key: string): string {
  if (source instanceof FormData) {
    const value = source.get(key);
    return typeof value === 'string' ? value.trim() : '';
  }

  const value = source[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeLaunchPayload(source: FormData | Record<string, unknown>): TicketokLaunchPayload {
  return {
    eventId: readLaunchValue(source, 'eventId'),
    sessionToken: readLaunchValue(source, 'sessionToken'),
    state: readLaunchValue(source, 'state'),
    requestId: readLaunchValue(source, 'requestId'),
    timestamp: readLaunchValue(source, 'timestamp'),
    signature: readLaunchValue(source, 'signature'),
    lang: readLaunchValue(source, 'lang'),
    locale: readLaunchValue(source, 'locale'),
    currency: readLaunchValue(source, 'currency'),
    ticketId: readLaunchValue(source, 'ticketId'),
    expiresAt: readLaunchValue(source, 'expiresAt'),
    returnUrl:
      readLaunchValue(source, 'returnUrl') ||
      readLaunchValue(source, 'return_url'),
  };
}

export function encodeLaunchPayload(payload: TicketokLaunchPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeLaunchPayload(value: string | undefined): TicketokLaunchPayload | null {
  if (!value) {
    return null;
  }

  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    return normalizeLaunchPayload(parsed);
  } catch {
    return null;
  }
}

export function resolveLaunchState(payload: Pick<TicketokLaunchPayload, 'state' | 'requestId'>): string {
  return payload.state || payload.requestId;
}

export function hasRequiredLaunchFields(payload: TicketokLaunchPayload): boolean {
  return (
    payload.eventId.length > 0 &&
    payload.sessionToken.length > 0 &&
    resolveLaunchState(payload).length > 0 &&
    payload.timestamp.length > 0 &&
    payload.signature.length > 0
  );
}

export function isLaunchExpired(payload: TicketokLaunchPayload, now = Date.now()): boolean {
  const timestampSeconds = Number.parseInt(payload.timestamp, 10);
  if (!Number.isFinite(timestampSeconds) || timestampSeconds <= 0) {
    return true;
  }

  const launchTimeMs = timestampSeconds * 1000;
  if (launchTimeMs > now + 30_000) {
    return true;
  }

  if (now - launchTimeMs > HANDOFF_MAX_AGE_MS) {
    return true;
  }

  if (payload.expiresAt.trim()) {
    const expiresAtMs = Date.parse(payload.expiresAt);
    if (Number.isFinite(expiresAtMs) && expiresAtMs <= now) {
      return true;
    }
  }

  return false;
}

function buildCanonicalPayload(payload: TicketokLaunchPayload, path: string): string {
  return [
    payload.timestamp,
    'POST',
    path,
    '',
    JSON.stringify({
      eventId: payload.eventId,
      requestId: payload.requestId,
      sessionToken: payload.sessionToken,
      state: payload.state,
      timestamp: payload.timestamp,
    }),
  ].join('\n');
}

export function verifyLaunchSignature(
  payload: TicketokLaunchPayload,
  secret: string | undefined,
  path: string,
): boolean {
  const normalizedSecret = secret?.trim() ?? '';
  if (!normalizedSecret || !hasRequiredLaunchFields(payload)) {
    return false;
  }

  const mac = crypto.createHmac('sha256', normalizedSecret);
  mac.update(buildCanonicalPayload(payload, path));
  const expected = mac.digest('hex');

  const actualBuffer = Buffer.from(payload.signature.toLowerCase(), 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

export function resolveTicketokLocale(payload: Pick<TicketokLaunchPayload, 'locale' | 'lang'>): string {
  return payload.locale || payload.lang;
}
