import { describe, expect, test } from 'bun:test';
import type { Venue } from '@nex125/seatmap-core';
import {
  buildSeatCategoryMap,
  buildNoPaymentSeatDetails,
  postNoPaymentCompletionToParent,
  canSelectNoPaymentSeat,
  matchesNoPaymentRequirements,
} from './noPaymentBooking';

const venue = {
  sections: [{
    id: 'section-1',
    label: 'Balcony',
    categoryId: 'vip',
    rows: [{
      id: 'row-1',
      label: 'A',
      seats: [
        { id: 'vip-1', label: '12', categoryId: 'vip' },
        { id: 'vip-2', label: '13', categoryId: 'vip' },
        { id: 'standard-1', label: '14', categoryId: 'standard' },
      ],
    }],
  }],
  tables: [{
    id: 'table-1',
    label: '5',
    categoryId: 'standard',
    seats: [{ id: 'table-seat-1', label: '2', categoryId: 'standard' }],
  }],
} as unknown as Venue;

const requirements = [
  { categoryId: 'vip', count: 2 },
  { categoryId: 'standard', count: 1 },
];

describe('no-payment booking seat requirements', () => {
  const categoryBySeatId = buildSeatCategoryMap(venue);

  test('accepts the exact requested category quantities', () => {
    expect(matchesNoPaymentRequirements(
      ['vip-1', 'standard-1', 'vip-2'],
      categoryBySeatId,
      requirements,
    )).toBe(true);
  });

  test('rejects the correct total with the wrong category mix', () => {
    expect(matchesNoPaymentRequirements(
      ['vip-1', 'vip-2', 'missing-standard'],
      categoryBySeatId,
      requirements,
    )).toBe(false);
  });

  test('prevents selecting more seats than requested for a category', () => {
    expect(canSelectNoPaymentSeat('vip-2', ['vip-1'], categoryBySeatId, requirements)).toBe(true);
    expect(canSelectNoPaymentSeat('vip-2', ['vip-1', 'vip-2'], categoryBySeatId, requirements)).toBe(false);
    expect(canSelectNoPaymentSeat('missing-standard', [], categoryBySeatId, requirements)).toBe(false);
  });
});


describe('no-payment completion seat details', () => {
  test('describes confirmed section and table seats in response order', () => {
    expect(buildNoPaymentSeatDetails(venue, ['table-seat-1', 'vip-1'])).toEqual([
      { id: 'table-seat-1', table: '5', seat: '2', description: 'Table 5, Seat 2' },
      { id: 'vip-1', section: 'Balcony', row: 'A', seat: '12', description: 'Balcony, Row A, Seat 12' },
    ]);
  });

  test('preserves unknown seats and omits empty labels from descriptions', () => {
    const unlabeledVenue = {
      ...venue,
      sections: [{
        ...venue.sections[0],
        label: ' ',
        rows: [{
          ...venue.sections[0].rows[0],
          label: '',
          seats: [
            { ...venue.sections[0].rows[0].seats[0], label: ' 12 ' },
            { ...venue.sections[0].rows[0].seats[1], label: '' },
          ],
        }],
      }],
    };
    expect(buildNoPaymentSeatDetails(unlabeledVenue, ['missing', 'vip-1', 'vip-2'])).toEqual([
      { id: 'missing', description: 'missing' },
      { id: 'vip-1', section: '', row: '', seat: '12', description: 'Seat 12' },
      { id: 'vip-2', section: '', row: '', seat: '', description: 'vip-2' },
    ]);
  });

  test('sends descriptions alongside the unchanged booking fields to the parent', () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const messages: unknown[][] = [];
    try {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: {
          parent: { postMessage: (...args: unknown[]) => messages.push(args) },
          location: { origin: 'https://embed.example' },
        },
      });
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: { referrer: 'https://parent.example/simulator' },
      });
      const response = {
        bookingId: 'booking-1', eventId: 'event-1', status: 'confirmed',
        paymentRequired: false as const, seatCount: 1, seats: ['vip-1'],
      };
      postNoPaymentCompletionToParent(response, 321, venue);
      expect(messages).toEqual([[
        {
          ...response,
          type: 'ticketok-no-payment-booking-complete',
          sourceEventId: 321,
          seatDetails: [{
            id: 'vip-1', section: 'Balcony', row: 'A', seat: '12',
            description: 'Balcony, Row A, Seat 12',
          }],
        },
        'https://parent.example',
      ]]);
    } finally {
      if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
      else Reflect.deleteProperty(globalThis, 'window');
      if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
      else Reflect.deleteProperty(globalThis, 'document');
    }
  });
});
