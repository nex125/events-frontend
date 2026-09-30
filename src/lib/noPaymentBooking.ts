import type { Venue } from '@nex125/seatmap-core';
import type {
  NoPaymentBookingResponse,
  NoPaymentSeatCategoryRequirement,
} from '@/lib/api';

export function buildSeatCategoryMap(venue: Venue): Map<string, string> {
  const categories = new Map<string, string>();

  for (const section of venue.sections) {
    for (const row of section.rows) {
      for (const seat of row.seats) {
        categories.set(seat.id, seat.categoryId || section.categoryId);
      }
    }
  }

  for (const table of venue.tables) {
    for (const seat of table.seats) {
      categories.set(seat.id, seat.categoryId || table.categoryId);
    }
  }

  return categories;
}

export function countSelectedByCategory(
  seatIds: Iterable<string>,
  categoryBySeatId: ReadonlyMap<string, string>,
): Map<string, number> {
  const selected = new Map<string, number>();
  for (const seatId of seatIds) {
    const categoryId = categoryBySeatId.get(seatId);
    if (!categoryId) continue;
    selected.set(categoryId, (selected.get(categoryId) ?? 0) + 1);
  }
  return selected;
}

export function matchesNoPaymentRequirements(
  seatIds: string[],
  categoryBySeatId: ReadonlyMap<string, string>,
  requirements: NoPaymentSeatCategoryRequirement[],
): boolean {
  const required = new Map<string, number>();
  for (const requirement of requirements) {
    required.set(
      requirement.categoryId,
      (required.get(requirement.categoryId) ?? 0) + requirement.count,
    );
  }

  if (seatIds.length !== Array.from(required.values()).reduce((total, count) => total + count, 0)) {
    return false;
  }

  const selected = countSelectedByCategory(seatIds, categoryBySeatId);
  if (selected.size !== required.size) return false;
  for (const [categoryId, count] of required) {
    if (selected.get(categoryId) !== count) return false;
  }

  return true;
}

export function canSelectNoPaymentSeat(
  seatId: string,
  selectedSeatIds: Iterable<string>,
  categoryBySeatId: ReadonlyMap<string, string>,
  requirements: NoPaymentSeatCategoryRequirement[],
): boolean {
  const categoryId = categoryBySeatId.get(seatId);
  if (!categoryId) return false;

  const requiredCount = requirements
    .filter((requirement) => requirement.categoryId === categoryId)
    .reduce((total, requirement) => total + requirement.count, 0);
  if (requiredCount < 1) return false;

  const selected = countSelectedByCategory(selectedSeatIds, categoryBySeatId);
  return (selected.get(categoryId) ?? 0) < requiredCount;
}

export interface NoPaymentSeatDetails {
  id: string;
  section?: string;
  row?: string;
  table?: string;
  seat?: string;
  description: string;
}

export function buildNoPaymentSeatDetails(venue: Venue, seatIds: string[]): NoPaymentSeatDetails[] {
  const detailsById = new Map<string, NoPaymentSeatDetails>();

  for (const section of venue.sections) {
    for (const row of section.rows) {
      for (const seat of row.seats) {
        const sectionLabel = section.label.trim();
        const rowLabel = row.label.trim();
        const seatLabel = seat.label.trim();
        detailsById.set(seat.id, {
          id: seat.id,
          section: sectionLabel,
          row: rowLabel,
          seat: seatLabel,
          description: [sectionLabel, rowLabel && 'Row ' + rowLabel, seatLabel && 'Seat ' + seatLabel]
            .filter(Boolean).join(', ') || seat.id,
        });
      }
    }
  }

  for (const table of venue.tables) {
    for (const seat of table.seats) {
      const tableLabel = table.label.trim();
      const seatLabel = seat.label.trim();
      detailsById.set(seat.id, {
        id: seat.id,
        table: tableLabel,
        seat: seatLabel,
        description: [tableLabel && 'Table ' + tableLabel, seatLabel && 'Seat ' + seatLabel]
          .filter(Boolean).join(', ') || seat.id,
      });
    }
  }

  return seatIds.map((id) => detailsById.get(id) ?? { id, description: id });
}

export function postNoPaymentCompletionToParent(
  response: NoPaymentBookingResponse,
  sourceEventId: number,
  venue: Venue,
): void {
  if (window.parent === window) return;

  let targetOrigin = window.location.origin;
  if (document.referrer) {
    try {
      targetOrigin = new URL(document.referrer).origin;
    } catch {
      // Use same-origin as the safe fallback.
    }
  }

  window.parent.postMessage({
    type: 'ticketok-no-payment-booking-complete',
    bookingId: response.bookingId,
    eventId: response.eventId,
    sourceEventId,
    status: response.status,
    paymentRequired: false,
    seatCount: response.seatCount,
    seats: response.seats,
    seatDetails: buildNoPaymentSeatDetails(venue, response.seats),
  }, targetOrigin);
}
