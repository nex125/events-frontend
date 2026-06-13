import { describe, expect, test } from 'bun:test';

import {
  buildEmbedCheckoutContinuation,
  buildEmbedCheckoutTarget,
} from './embedCheckoutRedirect';

describe('buildEmbedCheckoutContinuation', () => {
  test('uses postMessage for a cross-origin returnUrl continuation', () => {
    const continuation = buildEmbedCheckoutContinuation({
      eventId: 'event-123',
      sourceEventId: 456,
      locale: 'pl',
      slug: 'summer-show',
      returnUrl: 'https://checkout.ticketok.test/continue?existing=1',
      origin: 'https://events.example.test',
    });

    expect(continuation).toEqual({
      kind: 'postMessage',
      targetOrigin: 'https://checkout.ticketok.test',
      message: {
        type: 'ticketok-seatmap-cart-ready',
        eventId: 'event-123',
        sourceEventId: 456,
        locale: 'pl',
      },
    });
  });

  test('uses postMessage for a cross-origin referrer when returnUrl is absent', () => {
    const continuation = buildEmbedCheckoutContinuation({
      eventId: 'event-123',
      sourceEventId: 456,
      locale: 'pl',
      slug: 'summer-show',
      origin: 'https://events.example.test',
      referrer: 'https://widget.ticketok.test/frame',
    });

    expect(continuation).toEqual({
      kind: 'postMessage',
      targetOrigin: 'https://widget.ticketok.test',
      message: {
        type: 'ticketok-seatmap-cart-ready',
        eventId: 'event-123',
        sourceEventId: 456,
        locale: 'pl',
      },
    });
  });

  test('prefers referrer over returnUrl for the postMessage target origin', () => {
    const continuation = buildEmbedCheckoutContinuation({
      eventId: 'event-123',
      sourceEventId: 456,
      locale: 'pl',
      slug: 'summer-show',
      returnUrl: 'https://checkout.ticketok.test/continue',
      origin: 'https://events.example.test',
      referrer: 'https://widget.ticketok.test/frame',
    });

    expect(continuation).toEqual({
      kind: 'postMessage',
      targetOrigin: 'https://widget.ticketok.test',
      message: {
        type: 'ticketok-seatmap-cart-ready',
        eventId: 'event-123',
        sourceEventId: 456,
        locale: 'pl',
      },
    });
  });

  test('falls back to navigation when no parent origin is known', () => {
    const continuation = buildEmbedCheckoutContinuation({
      eventId: 'event-123',
      sourceEventId: 456,
      locale: 'pl',
      slug: 'summer show',
      returnUrl: 'https://%',
      origin: 'https://events.example.test',
    });

    expect(continuation).toEqual({
      kind: 'navigate',
      target: '/embed/events/summer%20show/checkout?eventId=event-123&sourceEventId=456&locale=pl',
    });
  });
});

describe('buildEmbedCheckoutTarget', () => {
  test('redirects to returnUrl when postMessage is not available', () => {
    const target = buildEmbedCheckoutTarget({
      eventId: 'event-123',
      sourceEventId: 456,
      locale: 'pl',
      slug: 'summer-show',
      returnUrl: 'https://checkout.ticketok.test/continue?existing=1',
      origin: 'https://events.example.test',
    });

    expect(target).toBe(
      'https://checkout.ticketok.test/continue?existing=1&eventId=event-123&sourceEventId=456&locale=pl',
    );
  });

  test('falls back to the internal checkout route when returnUrl is malformed', () => {
    const target = buildEmbedCheckoutTarget({
      eventId: 'event-123',
      sourceEventId: 456,
      locale: 'pl',
      slug: 'summer show',
      returnUrl: 'https://%',
      origin: 'https://events.example.test',
    });

    expect(target).toBe('/embed/events/summer%20show/checkout?eventId=event-123&sourceEventId=456&locale=pl');
  });
});
