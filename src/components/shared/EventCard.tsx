import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { Event } from '@/types/event';
import { cn } from '@ds/utils/cn';
import { getEventImageSrc } from '@/lib/images';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const dateLabel =
    event.displayDateShort && event.displayEndDateShort && event.displayEndDateShort !== event.displayDateShort
      ? `${event.displayDateShort} - ${event.displayEndDateShort}`
      : event.displayDateShort;

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        'group cursor-pointer block',
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--ds-radius-structural)] mb-5">
        <Image
          alt={event.title}
          src={getEventImageSrc(event.image)}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 ds-glass ds-ghost-border rounded-[var(--ds-radius-pill)] px-3 py-1">
          <span className="ds-label-sm text-[var(--ds-primary)]">
            {dateLabel}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <span className="ds-label-sm text-[var(--ds-primary)]">
          {event.category}
        </span>
        <h4 className="ds-heading-md text-[var(--ds-on-surface)] group-hover:text-[var(--ds-primary)] transition-colors">
          {event.title}
        </h4>
        <div className="flex items-center gap-2 text-[var(--ds-on-surface-variant)] ds-body-sm">
          <MapPin size={14} />
          <span>{event.location}</span>
        </div>
      </div>
    </Link>
  );
}
