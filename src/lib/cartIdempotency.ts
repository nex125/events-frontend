export interface CartAttempt {
  fingerprint: string;
  key: string;
}

interface CartPayload {
  userId: string;
  eventId: string;
  venueId: string;
  seats: string[];
  sessionToken: string;
}

// Keep the last attempt on failure; clear it after a successful checkout.
export function cartAttemptFor(previous: CartAttempt | null, payload: CartPayload): CartAttempt {
  const fingerprint = JSON.stringify([
    payload.userId,
    payload.eventId,
    payload.venueId,
    payload.sessionToken,
    [...payload.seats].sort(),
  ]);
  return previous?.fingerprint === fingerprint
    ? previous
    : { fingerprint, key: crypto.randomUUID() };
}
