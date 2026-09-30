import { describe, expect, test } from 'bun:test';
import { cartAttemptFor } from './cartIdempotency';

const payload = {
  userId: 'user-1',
  eventId: 'event-1',
  venueId: 'venue-1',
  sessionToken: 'session-1',
  seats: ['seat-2', 'seat-1'],
};

describe('cart idempotency', () => {
  test('reuses a failed attempt regardless of seat ordering', () => {
    const attempt = cartAttemptFor(null, payload);
    expect(cartAttemptFor(attempt, { ...payload, seats: [...payload.seats].reverse() })).toBe(attempt);
    expect(payload.seats).toEqual(['seat-2', 'seat-1']);
  });

  test('starts a new operation after success', () => {
    expect(cartAttemptFor(null, payload).key === cartAttemptFor(null, payload).key).toBe(false);
  });

  test('changes the key when any checkout context changes', () => {
    const attempt = cartAttemptFor(null, payload);
    for (const change of [
      { userId: 'user-2' },
      { eventId: 'event-2' },
      { venueId: 'venue-2' },
      { sessionToken: 'session-2' },
      { seats: ['seat-3'] },
    ]) {
      expect(cartAttemptFor(attempt, { ...payload, ...change }).key === attempt.key).toBe(false);
    }
  });

  test('does not reuse an old key when reverting a submitted cart change', () => {
    const first = cartAttemptFor(null, payload);
    const second = cartAttemptFor(first, { ...payload, seats: ['seat-3'] });
    expect(cartAttemptFor(second, payload).key === first.key).toBe(false);
  });
});
