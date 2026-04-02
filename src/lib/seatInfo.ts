import type { SeatCategory } from '@/types/event';
import { getSeatCategoriesByEventSlug } from '@/lib/api';

export async function fetchSeatInfo(
  eventSlug: string,
  init?: RequestInit,
): Promise<SeatCategory[]> {
  return getSeatCategoriesByEventSlug(eventSlug, init);
}
