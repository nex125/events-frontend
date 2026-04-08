'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@ds';
import { TicketLauncher } from './TicketLauncher';
import type { SeatCategory } from '@/types/event';
import type { Venue } from '@nex125/seatmap-core';

interface BookingCardProps {
  seatCategories: SeatCategory[];
  venue: Venue;
  eventId: string;
}

function pluralSeats(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return `${n} мест`;
  if (mod10 === 1) return `${n} место`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} места`;
  return `${n} мест`;
}

export function BookingCard({
  seatCategories,
  venue,
  eventId,
}: BookingCardProps) {
  const [widgetOpen, setWidgetOpen] = useState(false);

  const minPrice =
    seatCategories.length > 0
      ? Math.min(...seatCategories.map((s) => s.price))
      : null;

  return (
    <div className="sticky top-32 ds-glass ds-ghost-border rounded-[var(--ds-radius-structural)] p-8 space-y-8">
      <div>
        <h2 className="ds-heading-lg tracking-tight mb-2">Купить билеты</h2>
        <p className="ds-body-sm text-[var(--ds-on-surface-variant)]">
          Ограниченное количество мест.
        </p>
      </div>

      {seatCategories.length > 0 && (
        <div className="space-y-3">
          <span className="ds-label-sm text-[var(--ds-on-surface-variant)]">
            Категории мест
          </span>
          <div className="space-y-2">
            {seatCategories.map((cat) => (
              <div
                key={cat.name}
                className="flex justify-between items-center py-3 border-b border-[var(--ds-ghost-border)]"
              >
                <div className="flex items-center gap-2">
                  {cat.color && (
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                  )}
                  <span className="ds-body-sm text-[var(--ds-on-surface)]">
                    {cat.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="ds-heading-sm">{cat.price} BYN</span>
                  <p className="ds-label-sm text-[var(--ds-on-surface-variant)]">
                    {cat.available > 0 ? (
                      <span className="text-[var(--ds-primary)]">
                        {pluralSeats(cat.available)} свободно
                      </span>
                    ) : (
                      <span className="text-[var(--ds-outline-variant)]">
                        Распродано
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-[var(--ds-ghost-border)] space-y-4">
        {minPrice && (
          <div className="flex justify-between items-center">
            <span className="ds-body-sm text-[var(--ds-on-surface-variant)]">
              От
            </span>
            <span className="ds-heading-lg tracking-tight">
              {minPrice} BYN
            </span>
          </div>
        )}
        <motion.div layoutId="ticket-launcher" className="w-full rounded-[var(--ds-radius-interactive)]">
          <Button
            variant="primary"
            size="lg"
            className="w-full gap-2"
            onClick={() => setWidgetOpen(true)}
          >
            Выбрать билеты
          </Button>
        </motion.div>
        <TicketLauncher
          isOpen={widgetOpen}
          onClose={() => setWidgetOpen(false)}
          venue={venue}
          eventId={eventId}
        />
      </div>
    </div>
  );
}
