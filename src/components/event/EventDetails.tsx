import { MapPin, Info } from 'lucide-react';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import type { Event } from '@/types/event';
import { getEventImageSrc } from '@/lib/images';

interface EventDetailsProps {
  event: Event;
}

export function EventDetails({ event }: EventDetailsProps) {
  const hasVideo = Boolean(event.videoUrl?.trim());

  return (
    <div className="space-y-16">
      <ScrollReveal>
        <div className={hasVideo ? 'grid grid-cols-1 md:grid-cols-2 gap-12' : 'grid grid-cols-1 gap-12'}>
          <div className="space-y-6">
            <h3 className="ds-heading-lg text-[var(--ds-primary)]">Описание</h3>
            <p className="ds-body-md text-[var(--ds-on-surface-variant)] leading-relaxed">
              {event.longDescription || event.description}
            </p>
            {event.organizerName && (
              <div className="rounded-[var(--ds-radius-functional)] border border-[var(--ds-ghost-border)] bg-[var(--ds-surface-container-low)] p-4">
                <p className="ds-label-sm text-[var(--ds-on-surface-variant)] mb-2">Организатор</p>
                <p className="ds-heading-sm text-[var(--ds-on-surface)]">{event.organizerName}</p>
                {event.organizerDescription && (
                  <p className="ds-body-sm text-[var(--ds-on-surface-variant)] mt-2">{event.organizerDescription}</p>
                )}
              </div>
            )}
            {event.duration && (
              <div className="flex items-center gap-8 py-4">
                <div className="flex flex-col">
                  <span className="ds-label-sm text-[var(--ds-on-surface-variant)]">
                    Длительность
                  </span>
                  <span className="ds-heading-sm">{event.duration}</span>
                </div>
                {event.ageRestriction && (
                  <>
                    <div className="w-px h-8 bg-[var(--ds-ghost-border)]" />
                    <div className="flex flex-col">
                      <span className="ds-label-sm text-[var(--ds-on-surface-variant)]">
                        Возраст
                      </span>
                      <span className="ds-heading-sm">
                        {event.ageRestriction}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {hasVideo && (
            <div className="bg-[var(--ds-surface-container-low)] rounded-[var(--ds-radius-structural)] overflow-hidden relative group aspect-video">
              <video
                src={event.videoUrl}
                controls
                preload="metadata"
                poster={getEventImageSrc(event.image)}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </ScrollReveal>

    </div>
  );
}

export function EventLocationNotes({ event }: EventDetailsProps) {
  return (
    <ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-[var(--ds-surface-container-low)] rounded-[var(--ds-radius-structural)] ds-ghost-border">
          <h4 className="ds-heading-md mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-[var(--ds-primary)]" />
            Место проведения
          </h4>
          <p className="ds-body-sm text-[var(--ds-on-surface-variant)] leading-relaxed mb-4">
            {event.location}
          </p>
          <div className="aspect-video bg-[var(--ds-surface-container-highest)] rounded-[var(--ds-radius-functional)] overflow-hidden grayscale opacity-50">
            <div className="w-full h-full flex items-center justify-center">
              <MapPin size={32} className="text-[var(--ds-on-surface-variant)]" />
            </div>
          </div>
        </div>

        {event.importantInfo && (
          <div className="p-8 bg-[var(--ds-surface-container-low)] rounded-[var(--ds-radius-structural)] ds-ghost-border">
            <h4 className="ds-heading-md mb-4 flex items-center gap-2">
              <Info size={20} className="text-[var(--ds-primary)]" />
              Важная информация
            </h4>
            <ul className="space-y-4 ds-body-sm text-[var(--ds-on-surface-variant)]">
              {event.importantInfo.split('. ').filter(Boolean).map((line, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[var(--ds-primary)] shrink-0">•</span>
                  <span>{line.endsWith('.') ? line : `${line}.`}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
