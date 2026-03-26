'use client';

import { EventCard } from '@/components/shared/EventCard';
import { Pagination } from '@/components/shared/Pagination';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { dsMotion } from '@ds';
import type { Event } from '@/types/event';

interface AllEventsContentProps {
  events: Event[];
  totalPages: number;
  currentPage: number;
}

export function AllEventsContent({
  events,
  totalPages,
  currentPage,
}: AllEventsContentProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event, i) => (
          <ScrollReveal key={event.id} delay={i * dsMotion.stagger.default}>
            <EventCard event={event} />
          </ScrollReveal>
        ))}
      </div>

      {events.length === 0 && (
        <div className="py-20 text-center">
          <p className="ds-body-lg text-[var(--ds-on-surface-variant)]">
            Событий не найдено
          </p>
        </div>
      )}

      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </>
  );
}
