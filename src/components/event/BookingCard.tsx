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
import {
  resolveWidgetConfig,
  ensureScript,
  ensureStylesheet,
  tryOpenModal,
  waitForWidgetRender,
} from '@/lib/ticketokWidget';

interface BookingCardProps {
  seatCategories: SeatCategory[];
  currency: string;
  venue: Venue;
  venueId?: string;
  eventId: string;
  eventSlug: string;
  eventSource?: string;
  ticketokEventId?: string;
}

export function BookingCard({
  seatCategories,
  currency,
  venue,
  venueId,
  eventId,
  eventSlug,
  eventSource,
  ticketokEventId,
}: BookingCardProps) {
  const t = useTranslations('bookingCard');
  const locale = resolveLocaleTag();
  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);

  const [widgetOpen, setWidgetOpen] = useState(false);
  const [isLaunchingTicketok, setIsLaunchingTicketok] = useState(false);
  const showPricesInLegend = shouldShowCategoryPricesInLegend(venue);
  const parsedTicketokEventId = Number.parseInt(ticketokEventId?.trim() ?? '', 10);
  const isTicketokFirstLaunch =
    eventSource === 'ticketok' &&
    Number.isFinite(parsedTicketokEventId) &&
    parsedTicketokEventId > 0;

  const minPrice =
    seatCategories.length > 0
      ? Math.min(...seatCategories.map((s) => s.price))
      : null;

  const handleSelectTickets = async () => {
    if (isTicketokFirstLaunch) {
      if (isLaunchingTicketok) {
        return;
      }

      setIsLaunchingTicketok(true);
      const widgetConfig = resolveWidgetConfig();
      const mountNode = document.createElement('div');
      mountNode.hidden = true;
      document.body.appendChild(mountNode);

      try {
        await Promise.all([
          ...widgetConfig.cssUrls.map((url) => ensureStylesheet(url)),
          ...widgetConfig.scriptUrls.map((url) => ensureScript(url)),
        ]);

        const opened = tryOpenModal({
          mountNode,
          sourceEventId: parsedTicketokEventId,
          ticketId: '0',
        });

        if (!opened) {
          throw new Error('Ticketok modal API is unavailable.');
        }

        const rendered = await waitForWidgetRender(mountNode);
        if (!rendered) {
          throw new Error('Ticketok widget did not render after openModal.');
        }
      } catch (error) {
        console.error('Direct Ticketok widget launch failed:', error);
        const params = new URLSearchParams({
          eventId,
          sourceEventId: String(parsedTicketokEventId),
          mode: 'launch',
          ticketId: '0',
        });
        window.location.href = `/embed/events/${encodeURIComponent(eventSlug)}/checkout?${params.toString()}`;
      } finally {
        mountNode.remove();
        setIsLaunchingTicketok(false);
      }

      return;
    }

    setWidgetOpen(true);
  };

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
            onClick={handleSelectTickets}
            disabled={isLaunchingTicketok}
          >
            {t('selectTickets')}
          </Button>
        </motion.div>
        {!isTicketokFirstLaunch ? (
          <TicketLauncher
            isOpen={widgetOpen}
            onClose={() => setWidgetOpen(false)}
            venue={venue}
            currency={currency}
            venueId={venueId}
            eventId={eventId}
            eventSlug={eventSlug}
            eventSource={eventSource}
            ticketokEventId={ticketokEventId}
          />
        ) : null}
      </div>
    </div>
  );
}
