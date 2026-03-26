import type { Event } from '@/types/event';

export function searchEvents(events: Event[], query: string): Event[] {
  if (!query.trim()) return events;

  const lower = query.toLowerCase();
  return events.filter(
    (e) =>
      e.title.toLowerCase().includes(lower) ||
      e.description.toLowerCase().includes(lower) ||
      e.location.toLowerCase().includes(lower) ||
      e.category.toLowerCase().includes(lower) ||
      e.tags.some((t) => t.toLowerCase().includes(lower)),
  );
}
