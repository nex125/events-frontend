'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { dsMotion } from '@ds';
import type { Event } from '@/types/event';
import { getEventImageSrc } from '@/lib/images';
import { DEFAULT_CURRENCY, resolveLocaleTag } from '@/lib/i18n/config';

interface HeroSectionProps {
  event: Event;
  minPrice?: number;
}

export function HeroSection({ event, minPrice }: HeroSectionProps) {
  const t = useTranslations('hero');
  const locale = resolveLocaleTag();
  const eventSchedule = event.displayScheduleLong ?? event.displayDateLong ?? event.displayDateShort;
  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: DEFAULT_CURRENCY }).format(value);

  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  return (
    <header
      ref={containerRef}
      className="relative min-h-screen flex items-end pt-32 pb-20 px-[var(--ds-page-gutter)] overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 z-0"
        style={
          shouldReduceMotion
            ? undefined
            : { scale: imageScale, y: imageY }
        }
      >
        <Image
          alt={event.title}
          src={getEventImageSrc(event.image)}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--ds-surface)] via-[var(--ds-surface)]/40 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--ds-surface)]/80 via-transparent to-transparent z-[1]" />

      <div className="relative z-10 max-w-[80rem] w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: dsMotion.duration.slow,
            ease: dsMotion.ease.default,
            delay: 0.1,
          }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-[var(--ds-radius-pill)] ds-glass ds-ghost-border"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--ds-primary)] animate-pulse" />
          <span className="ds-label-sm text-[var(--ds-primary)]">
            {t('headlineTag')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: dsMotion.duration.slow,
            ease: dsMotion.ease.default,
            delay: 0.2,
          }}
          className="ds-display-hero font-extrabold tracking-tighter leading-[0.85] text-[var(--ds-on-surface)] mb-8"
        >
          {event.title.split(' ').map((word, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {i === event.title.split(' ').length - 1 ? (
                <span className="text-[var(--ds-primary)]">{word}</span>
              ) : (
                word
              )}
            </span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: dsMotion.duration.slow,
            ease: dsMotion.ease.default,
            delay: 0.35,
          }}
          className="flex flex-col md:flex-row md:items-center gap-12 max-w-4xl"
        >
          <div className="max-w-md space-y-3">
            {eventSchedule && (
              <div className="flex items-center gap-2 ds-label-md text-[var(--ds-primary)]">
                <CalendarDays size={18} />
                <span>{eventSchedule}</span>
              </div>
            )}
            <p className="ds-body-lg text-[var(--ds-on-surface-variant)]">
              {event.description}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href={`/events/${event.slug}`}
              className="group flex items-center gap-4 ds-btn ds-btn-primary ds-btn-lg"
            >
              {t('buyTicket')}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            {minPrice && (
              <div className="flex flex-col">
                <span className="ds-label-sm text-[var(--ds-on-surface-variant)]">
                  {t('from')}
                </span>
                <span className="ds-heading-lg">{formatPrice(minPrice)}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  );
}
