'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@ds';
import { TicketLauncher } from './TicketLauncher';
import type { SeatCategory } from '@/types/event';
import type { Venue } from '@nex125/seatmap-core';
import { resolveLocaleTag } from '@/lib/i18n/config';
import { shouldShowCategoryPricesInLegend } from '@/lib/seatmapLegend';

interface BookingCardProps {
  seatCategories: SeatCategory[];
  currency: string;
  venue: Venue;
  venueId?: string;
  eventId: string;
  ticketokEventId?: string;
}

export function BookingCard({
  seatCategories,
  currency,
  venue,
  venueId,
  eventId,
  ticketokEventId,
}: BookingCardProps) {
  const t = useTranslations('bookingCard');
  const locale = resolveLocaleTag();
  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  const pluralSeats = (n: number): string => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return t('seat_many', { count: n });
    if (mod10 === 1) return t('seat_one', { count: n });
    if (mod10 >= 2 && mod10 <= 4) return t('seat_few', { count: n });
    return t('seat_many', { count: n });
  };

  const [widgetOpen, setWidgetOpen] = useState(false);
  const showPricesInLegend = shouldShowCategoryPricesInLegend(venue);

  const minPrice =
    seatCategories.length > 0
      ? Math.min(...seatCategories.map((s) => s.price))
      : null;

  return (
    <div className="sticky top-32 ds-glass ds-ghost-border rounded-[var(--ds-radius-structural)] p-8 space-y-8">
      <div>
        <h2 className="ds-heading-lg tracking-tight mb-2">{t('title')}</h2>
        <p className="ds-body-sm text-[var(--ds-on-surface-variant)]">
          {t('limitedSeats')}
        </p>
      </div>

      <div className="pt-4 border-t border-[var(--ds-ghost-border)] space-y-4">
        {!showPricesInLegend && minPrice && (
          <div className="flex justify-between items-center">
            <span className="ds-body-sm text-[var(--ds-on-surface-variant)]">
              {t('from')}
            </span>
            <span className="ds-heading-lg tracking-tight">
              {formatPrice(minPrice)}
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
            {t('selectTickets')}
          </Button>
        </motion.div>
        <TicketLauncher
          isOpen={widgetOpen}
          onClose={() => setWidgetOpen(false)}
          venue={venue}
          currency={currency}
          venueId={venueId}
          eventId={eventId}
          ticketokEventId={ticketokEventId}
        />
      </div>
    </div>
  );
}
