'use client';

import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { dsMotion } from '@ds';
import { ScrollReveal } from '@/components/shared/ScrollReveal';

export function TicketPromo() {
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
          <div className="absolute inset-0 bg-[var(--ds-primary-wash)] blur-[120px] rounded-full" />
          <motion.div
            whileHover={{ rotate: 0 }}
            initial={{ rotate: 3 }}
            transition={dsMotion.spring.smooth}
            className="relative ds-glass ds-ghost-border rounded-[var(--ds-radius-structural)] p-8 w-full max-w-md mx-auto"
          >
            <div className="flex justify-between items-start mb-12">
              <div className="ds-heading-lg ds-gradient-primary-text tracking-tighter">
                Ticketok
              </div>
              <div className="text-right">
                <span className="ds-label-sm text-[var(--ds-on-surface-variant)] block">
                  Номер билета
                </span>
                <span className="font-mono ds-body-sm">#AX-9920-LXR</span>
              </div>
            </div>
            <div className="mb-12">
              <h3 className="ds-heading-lg mb-1">NOCTURNE ELITE</h3>
              <p className="ds-label-sm text-[var(--ds-on-surface-variant)]">
                Главный зал · Ряд A · Место 01
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
