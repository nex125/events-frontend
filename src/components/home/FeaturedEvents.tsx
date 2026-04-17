'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { dsMotion } from '@ds';
import type { Event } from '@/types/event';
import { getEventImageSrc } from '@/lib/images';

interface FeaturedEventsProps {
  events: Event[];
}

export function FeaturedEvents({ events }: FeaturedEventsProps) {
  if (events.length === 0) return null;

  return (
    <section className="ds-section bg-[var(--ds-surface)]">
      <div className="ds-section-inner">
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="ds-label-sm text-[var(--ds-primary)] block mb-4 tracking-[0.3em]">
              Подборки
            </span>
            <h2 className="ds-display-md font-extrabold tracking-tight">
              Актуальные события
            </h2>
          </div>
          <Link
            href="/events"
            className="text-[var(--ds-on-surface-variant)] hover:text-[var(--ds-primary)] transition-colors ds-label-sm flex items-center gap-2"
          >
            Все события <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[320px]">
          {events.slice(0, 5).map((event, i) => {
            const spanClass =
              i === 0
                ? 'md:col-span-7'
                : i === 1
                  ? 'md:col-span-5'
                  : 'md:col-span-4';

            return (
              <ScrollReveal
                key={event.id}
                delay={i * dsMotion.stagger.default}
                className={spanClass}
              >
                <Link
                  href={`/events/${event.slug}`}
                  className="relative group overflow-hidden rounded-[var(--ds-radius-structural)] block h-full"
                >
                  <Image
                    alt={event.title}
                    src={getEventImageSrc(event.image)}
                    fill
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="absolute inset-0 object-cover transition-all duration-700 scale-110 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--ds-surface)]/90 via-[var(--ds-surface)]/20 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <span className="ds-label-sm text-[var(--ds-primary)] mb-2 block">
                      {event.category}
                    </span>
                    <h3 className="ds-heading-lg font-bold mb-2">
                      {event.title}
                    </h3>
                    <p className="ds-body-sm text-[var(--ds-on-surface-variant)] max-w-xs">
                      {event.description.slice(0, 80)}...
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
