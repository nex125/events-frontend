'use client';

import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { dsMotion } from '@ds';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import type { Event } from '@/types/event';
import { formatEventDateShort, formatEventTime } from '@/lib/datetime';

interface TicketPromoProps {
  event: Event;
}

function buildDecorativeTicketNumber(event: Event): string {
  const seed = `${event.id}:${event.slug}`;
  let hash = 0;

  for (const ch of seed) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }

  const sectionA = hash.toString(36).toUpperCase().slice(0, 4).padStart(4, '0');
  const sectionB = event.id.replace(/-/g, '').slice(0, 4).toUpperCase().padEnd(4, 'X');
  const sectionC = event.slug
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');

  return `#${sectionA}-${sectionB}-${sectionC}`;
}

export function TicketPromo({ event }: TicketPromoProps) {
  const decorativeTicketNumber = buildDecorativeTicketNumber(event);
  const ticketHeadline = event.title.toLocaleUpperCase('ru-RU');
  const ticketMeta = `${event.location} · ${formatEventDateShort(
    event.datetimeUtc,
  )} · ${formatEventTime(event.datetimeUtc)}`;

  return (
    <section className="ds-section overflow-hidden">
      <div className="ds-section-inner flex flex-col lg:flex-row items-center gap-20">
        <ScrollReveal className="lg:w-1/2">
          <h2 className="ds-display-md font-bold tracking-tight mb-8">
            Современные билеты для вашего{' '}
            <span className="text-[var(--ds-primary)] italic">комфорта</span>.
          </h2>
          <p className="ds-body-lg text-[var(--ds-on-surface-variant)] leading-relaxed mb-10">
            Наши билеты — это не просто пропуск, а цифровое подтверждение
            вашего участия в событии. Безопасно, быстро и всегда под рукой.
          </p>
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="ds-icon-primary rounded-[var(--ds-radius-functional)] p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <span className="ds-heading-sm block">Полная безопасность</span>
                <span className="ds-body-sm text-[var(--ds-on-surface-variant)]">
                  Каждый билет защищен уникальным шифрованием.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="ds-icon-primary rounded-[var(--ds-radius-functional)] p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <span className="ds-heading-sm block">Цифровой формат</span>
                <span className="ds-body-sm text-[var(--ds-on-surface-variant)]">
                  Удобный доступ к билету через личный кабинет в любое время.
                </span>
              </div>
            </li>
          </ul>
        </ScrollReveal>

        <ScrollReveal className="lg:w-1/2 relative" delay={0.15}>
          <div className="absolute left-1/2 top-1/2 h-[82%] w-[82%] -translate-x-1/2 -translate-y-1/2 bg-[var(--ds-primary-wash)] blur-[108px] rounded-full" />
          <motion.div
            whileHover={{ rotate: 0 }}
            initial={{ rotate: 3 }}
            transition={dsMotion.spring.smooth}
            className="relative overflow-hidden ds-glass ds-ghost-border rounded-[var(--ds-radius-structural)] p-8 w-full max-w-md mx-auto"
          >
            {/* Side notches to mimic a physical ticket shape */}
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
              <span className="h-8 w-8 -translate-x-1/2 rounded-full bg-[var(--ds-surface)] ring-1 ring-[var(--ds-ghost-border)]" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
              <span className="h-8 w-8 translate-x-1/2 rounded-full bg-[var(--ds-surface)] ring-1 ring-[var(--ds-ghost-border)]" />
            </div>

            <div className="flex justify-between items-start mb-12">
              <div className="ds-heading-lg ds-gradient-primary-text tracking-tighter">
                Ticketok
              </div>
              <div className="text-right">
                <span className="ds-label-sm text-[var(--ds-on-surface-variant)] block">
                  Номер билета
                </span>
                <span className="font-mono ds-body-sm">{decorativeTicketNumber}</span>
              </div>
            </div>
            <div className="mb-12">
              <h3 className="ds-heading-lg mb-1">{ticketHeadline}</h3>
              <p className="ds-label-sm text-[var(--ds-on-surface-variant)]">
                {ticketMeta}
              </p>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <span className="ds-label-sm text-[var(--ds-on-surface-variant)]">
                  Ключ входа
                </span>
                <div className="w-32 h-12 bg-[var(--ds-surface-container-highest)] rounded-[var(--ds-radius-functional)] flex items-center justify-center gap-1 px-4">
                  {[
                    { h: 24, accent: false },
                    { h: 18, accent: false },
                    { h: 24, accent: false },
                    { h: 30, accent: true },
                    { h: 18, accent: false },
                    { h: 24, accent: false },
                    { h: 30, accent: true },
                  ].map((bar, i) => (
                    <div
                      key={i}
                      className={bar.accent ? 'w-0.5 bg-[var(--ds-primary)]' : 'w-0.5 bg-[var(--ds-on-surface-variant)]'}
                      style={{ height: bar.h }}
                    />
                  ))}
                </div>
              </div>
              <Fingerprint size={36} className="text-[var(--ds-primary)]" />
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
