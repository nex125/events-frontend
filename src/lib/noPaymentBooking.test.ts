import { describe, expect, test } from 'bun:test';
import type { Venue } from '@nex125/seatmap-core';
import {
  buildSeatCategoryMap,
  canSelectNoPaymentSeat,
  matchesNoPaymentRequirements,
} from './noPaymentBooking';

const venue = {
  sections: [{
    id: 'section-1',
    categoryId: 'vip',
    rows: [{
      id: 'row-1',
      seats: [
        { id: 'vip-1', categoryId: 'vip' },
        { id: 'vip-2', categoryId: 'vip' },
        { id: 'standard-1', categoryId: 'standard' },
      ],
    }],
  }],
  tables: [],
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
