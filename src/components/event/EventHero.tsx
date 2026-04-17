'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { dsMotion } from '@ds';
import type { Event } from '@/types/event';
import { getEventImageSrc } from '@/lib/images';

interface EventHeroProps {
  event: Event;
}

export function EventHero({ event }: EventHeroProps) {
  return (
    <section className="relative h-[700px] md:h-[870px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          alt={event.title}
          src={getEventImageSrc(event.image)}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--ds-surface)] via-[var(--ds-surface)]/40 to-transparent" />
      </div>

      <div className="relative h-full max-w-[80rem] mx-auto px-[var(--ds-page-gutter)] flex flex-col justify-end pb-24">
        <div className="space-y-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: dsMotion.duration.normal,
              ease: dsMotion.ease.default,
              delay: 0.1,
            }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="ds-accent-primary ds-chip ds-label-sm px-3 py-1">
              Эксклюзивное событие
            </span>
            <span className="ds-label-sm rounded-full border border-[color:var(--ds-primary-border)] bg-[color:color-mix(in_srgb,var(--ds-surface-container-low)_78%,transparent)] px-3 py-1.5 text-[var(--ds-on-surface)] shadow-[0_12px_32px_-18px_rgba(var(--ds-shadow-rgb),0.7)] backdrop-blur-md">
              {event.displayScheduleLong}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: dsMotion.duration.slow,
              ease: dsMotion.ease.default,
              delay: 0.2,
            }}
            className="ds-display-lg font-extrabold tracking-tighter text-[var(--ds-on-surface)] leading-[0.9]"
          >
            {event.title}
            {event.subtitle && (
              <>
                : <span className="text-[var(--ds-primary)] italic">{event.subtitle}</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: dsMotion.duration.slow,
              ease: dsMotion.ease.default,
              delay: 0.35,
            }}
            className="ds-body-lg text-[var(--ds-on-surface-variant)] max-w-2xl"
          >
            {event.description}
          </motion.p>

          {event.organizerName && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: dsMotion.duration.slow,
                ease: dsMotion.ease.default,
                delay: 0.4,
              }}
              className="ds-label-md text-[var(--ds-on-surface-variant)]"
            >
              Организатор: <span className="text-[var(--ds-on-surface)]">{event.organizerName}</span>
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
