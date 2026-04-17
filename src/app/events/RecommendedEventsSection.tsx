'use client';

import { useTranslations } from 'next-intl';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { EventCard } from '@/components/shared/EventCard';
import { dsMotion } from '@ds';
import type { Event } from '@/types/event';

interface RecommendedEventsSectionProps {
  events: Event[];
}

export function RecommendedEventsSection({ events }: RecommendedEventsSectionProps) {
  const t = useTranslations('eventsCatalog');

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="mt-10 mb-14">
      <div className="mb-8">
        <span className="ds-label-sm text-[var(--ds-primary)] block mb-3 tracking-[0.3em]">
          {t('recommendedLabel')}
        </span>
        <h2 className="ds-display-sm font-bold tracking-tighter text-[var(--ds-on-surface)]">
          {t('recommendedTitle')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event, index) => (
          <ScrollReveal key={event.id} delay={index * dsMotion.stagger.default}>
            <EventCard event={event} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
