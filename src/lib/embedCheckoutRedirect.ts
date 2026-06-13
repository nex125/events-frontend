export interface EmbedCheckoutContinuationInput {
  eventId: string;
  sourceEventId: number;
  locale: string;
  slug: string;
  returnUrl?: string;
  origin: string;
  referrer?: string;
}

interface EmbedCheckoutContinuationMessage {
  type: 'ticketok-seatmap-cart-ready';
  eventId: string;
  sourceEventId: number;
  locale: string;
}

interface EmbedCheckoutPostMessageContinuation {
  kind: 'postMessage';
  message: EmbedCheckoutContinuationMessage;
  targetOrigin: string;
}

interface EmbedCheckoutNavigateContinuation {
  kind: 'navigate';
  target: string;
}

export type EmbedCheckoutContinuation =
  | EmbedCheckoutPostMessageContinuation
  | EmbedCheckoutNavigateContinuation;

export function buildEmbedCheckoutContinuation({
  eventId,
  sourceEventId,
  locale,
  slug,
  returnUrl,
  origin,
  referrer,
}: EmbedCheckoutContinuationInput): EmbedCheckoutContinuation {
  const targetOrigin = resolvePostMessageTargetOrigin(returnUrl, referrer, origin);
  if (targetOrigin) {
    return {
      kind: 'postMessage',
      targetOrigin,
      message: {
        type: 'ticketok-seatmap-cart-ready',
        eventId,
        sourceEventId,
        locale,
      },
    };
  }

  return {
    kind: 'navigate',
    target: buildEmbedCheckoutTarget({
      eventId,
      sourceEventId,
      locale,
      slug,
      returnUrl,
      origin,
    }),
  };
}

export function buildEmbedCheckoutTarget({
  eventId,
  sourceEventId,
  locale,
  slug,
  returnUrl,
  origin,
}: EmbedCheckoutContinuationInput): string {
  const trimmedReturnUrl = returnUrl?.trim() || '';
  if (trimmedReturnUrl) {
    try {
      const target = new URL(trimmedReturnUrl, origin);
      target.searchParams.set('eventId', eventId);
      target.searchParams.set('sourceEventId', String(sourceEventId));
      target.searchParams.set('locale', locale);
      return target.toString();
    } catch {
      // Fall through to the internal checkout route when returnUrl is malformed.
    }
  }

  const params = new URLSearchParams({
    eventId,
    sourceEventId: String(sourceEventId),
    locale,
  });

  return `/embed/events/${encodeURIComponent(slug)}/checkout?${params.toString()}`;
}

function resolvePostMessageTargetOrigin(
  returnUrl: string | undefined,
  referrer: string | undefined,
  origin: string,
): string {
  const referrerOrigin = readOrigin(referrer, origin);
  if (referrerOrigin && referrerOrigin !== origin) {
    return referrerOrigin;
  }

  const returnUrlOrigin = readOrigin(returnUrl, origin);
  if (returnUrlOrigin && returnUrlOrigin !== origin) {
    return returnUrlOrigin;
  }

  return '';
}

function readOrigin(value: string | undefined, origin: string): string {
  const trimmed = value?.trim() || '';
  if (!trimmed) {
    return '';
  }

  try {
    return new URL(trimmed, origin).origin;
  } catch {
    return '';
  }
}
