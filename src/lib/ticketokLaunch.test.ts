import { describe, expect, test } from 'bun:test';

import {
  decodeLaunchPayload,
  encodeLaunchPayload,
  hasRequiredLaunchFields,
  resolveLaunchState,
} from './ticketokLaunch';

describe('ticketok launch handoff', () => {
  test('round-trips the session token used by updated cart requests', () => {
    const encoded = encodeLaunchPayload({
      eventId: '321',
      sessionToken: 'launch-session-token',
      state: '',
      requestId: 'request-1',
      timestamp: String(Math.floor(Date.now() / 1000)),
      lang: 'ru',
      locale: 'ru',
      currency: 'BYN',
      ticketId: '0',
      expiresAt: '',
      returnUrl: 'https://ticketok.test/checkout',
    });

    const payload = decodeLaunchPayload(encoded);

    expect(payload?.sessionToken).toBe('launch-session-token');
    expect(payload?.eventId).toBe('321');
    expect(payload && hasRequiredLaunchFields(payload)).toBe(true);
    expect(payload && resolveLaunchState(payload)).toBe('request-1');
  });
});
