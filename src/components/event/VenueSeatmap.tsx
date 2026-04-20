'use client';

import { SeatmapCanvas, SeatmapProvider, TooltipOverlay, useSeatmapContext } from '@nex125/seatmap-react';
import type { TooltipData } from '@nex125/seatmap-react';
import { AVAILABLE_STATUS_ID, type SeatStatus, type Venue } from '@nex125/seatmap-core';
import { useSeatStatus } from '@nex125/seatmap-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { connectMercure } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { resolveLocaleTag } from '@/lib/i18n/config';
import { SeatmapLegend } from './SeatmapLegend';

interface VenueSeatmapProps {
  venue: Venue;
  currency?: string;
  venueId?: string;
}

function mapBackendStatus(status: string): SeatStatus {
  switch (status.toUpperCase()) {
    case 'LOCKED':
    case 'HELD':
    case 'BLOCKED':
      return 'locked';
    case 'BOOKED':
    case 'SOLD':
      return 'booked';
    default:
      return 'available';
  }
}

function LiveSeatStatusSync({ venueId }: { venueId: string }) {
  const { updateSeatStatus } = useSeatStatus();

  useEffect(() => {
    const eventSource = connectMercure(venueId, (seatId, status) => {
      updateSeatStatus(seatId, mapBackendStatus(status));
    });

    return () => {
      eventSource.close();
    };
  }, [venueId, updateSeatStatus]);

  return null;
}

function PreviewSeatmapCanvas({ venue, currency }: { venue: Venue; currency?: string }) {
  const t = useTranslations('venueSeatmap');
  const tSeatmap = useTranslations('ticketLauncher.seatmap');
  const { viewport } = useSeatmapContext();
  const [isDragging, setIsDragging] = useState(false);
  const locale = resolveLocaleTag();
  const dragStateRef = useRef<{ dragging: boolean; x: number; y: number }>({
    dragging: false,
    x: 0,
    y: 0,
  });
  const formatTooltipPrice = useCallback(
    (value: number) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency ?? 'BYN',
      }).format(value),
    [currency, locale],
  );
  const renderSeatmapTooltip = useCallback(
    (data: TooltipData) => {
      const translatedStatus =
        data.seat.status === AVAILABLE_STATUS_ID
          ? tSeatmap('tooltipStatusAvailable')
          : data.seat.status === 'locked'
            ? tSeatmap('tooltipStatusLocked')
            : data.seat.status === 'booked'
              ? tSeatmap('tooltipStatusBooked')
              : data.statusName ?? data.seat.status;
      const priceLabel =
        typeof data.price === 'number'
          ? tSeatmap('tooltipPriceLabel', { price: formatTooltipPrice(data.price) })
          : tSeatmap('tooltipPriceUnavailable');

      return (
        <div
          style={{
            background:
              'var(--seatmap-tooltip-surface, color-mix(in srgb, var(--seatmap-surface-container-low, #181818) 94%, transparent))',
            border: '1px solid var(--seatmap-tooltip-border, var(--seatmap-outline, #353331))',
            borderRadius: 10,
            padding: '8px 14px',
            color: 'var(--seatmap-tooltip-text, var(--seatmap-on-surface, #e5e2e1))',
            fontSize: 13,
            fontFamily: 'system-ui',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{data.section.label}</div>
          <div>{tSeatmap('tooltipSeatLabel', { rowLabel: data.row.label, seatLabel: data.seat.label })}</div>
          <div
            style={{
              color: 'var(--seatmap-tooltip-muted-text, var(--seatmap-on-surface-variant, #9a9694))',
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {translatedStatus}
          </div>
          <div
            style={{
              color: 'var(--seatmap-tooltip-muted-text, var(--seatmap-on-surface-variant, #9a9694))',
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {priceLabel}
          </div>
        </div>
      );
    },
    [formatTooltipPrice, tSeatmap],
  );

  return (
    <div
      className={`w-full h-full relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        dragStateRef.current = { dragging: true, x: event.clientX, y: event.clientY };
        setIsDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!dragStateRef.current.dragging) return;
        const dx = event.clientX - dragStateRef.current.x;
        const dy = event.clientY - dragStateRef.current.y;
        dragStateRef.current = { dragging: true, x: event.clientX, y: event.clientY };
        viewport.pan(dx, dy);
      }}
      onPointerUp={(event) => {
        dragStateRef.current = { ...dragStateRef.current, dragging: false };
        setIsDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={(event) => {
        dragStateRef.current = { ...dragStateRef.current, dragging: false };
        setIsDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
    >
      <SeatmapCanvas
        showSectionLabels
        enableSeatHover
        panOnLeftClick={false}
      />
      <TooltipOverlay renderTooltip={renderSeatmapTooltip} />

      <SeatmapLegend
        venue={venue}
        currency={currency}
        title={t('legendTitle')}
        className="pointer-events-none absolute top-2 left-2 z-10 max-w-[170px] rounded-md border border-[var(--ds-ghost-border)] bg-[var(--ds-surface)]/95 p-2 text-[11px] leading-tight text-[var(--ds-on-surface)] md:top-3 md:left-3 md:max-w-[220px] md:rounded-lg md:p-3 md:text-xs"
      />
    </div>
  );
}

export function VenueSeatmap({ venue, currency, venueId }: VenueSeatmapProps) {
  const liveVenueId = venueId?.trim() || venue.id;

  return (
    <div className="aspect-[16/9] rounded-[var(--ds-radius-structural)] overflow-hidden">
      <SeatmapProvider venue={venue}>
        <LiveSeatStatusSync venueId={liveVenueId} />
        <PreviewSeatmapCanvas venue={venue} currency={currency} />
      </SeatmapProvider>
    </div>
  );
}
