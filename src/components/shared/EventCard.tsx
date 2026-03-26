import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Hourglass, Lock, CalendarDays } from 'lucide-react';
import type { Event } from '@/types/event';
import { cn } from '@ds/utils/cn';
import { formatEventDateShort } from '@/lib/datetime';
import { getEventImageSrc } from '@/lib/images';

const mockIcons: Record<string, typeof Hourglass> = {
  Классика: CalendarDays,
  Мода: Lock,
  Вечера: Hourglass,
};

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  if (event.isMock) {
    return (
      <div className="relative overflow-hidden rounded-[var(--ds-radius-structural)] bg-[var(--ds-surface-container-low)] ds-ghost-border flex flex-col items-center justify-center aspect-[3/4] p-8 text-center">
        {(() => {
          const Icon = mockIcons[event.category] || Hourglass;
          return (
            <Icon
              size={36}
              className="text-[var(--ds-outline-variant)] mb-4"
            />
          );
        })()}
        <h3 className="ds-heading-md text-[var(--ds-on-surface-variant)] mb-2">
          {event.title}
        </h3>
        <p className="ds-label-sm text-[var(--ds-on-surface-variant)]">
          {event.subtitle}
        </p>
      </div>
    );
  }

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
            {formatEventDateShort(event.datetimeUtc)}
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
