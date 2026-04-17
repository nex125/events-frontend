'use client';

import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { EventCard } from '@/components/shared/EventCard';
import { dsMotion } from '@ds';
import type { Event } from '@/types/event';

interface PulseFeedProps {
  events: Event[];
}

export function PulseFeed({ events }: PulseFeedProps) {
  return (
    <section className="ds-section bg-[var(--ds-surface-container-low)]">
      <div className="ds-section-inner">
        <div className="mb-20 text-center">
          <h2 className="ds-display-md font-bold tracking-tighter mb-4">
            Афиша
          </h2>
          <p className="ds-label-sm text-[var(--ds-on-surface-variant)] tracking-[0.4em]">
            Предстоящие мероприятия
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {events.map((event, i) => (
            <ScrollReveal
              key={event.id}
              delay={i * dsMotion.stagger.default}
            >
              <EventCard event={event} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
