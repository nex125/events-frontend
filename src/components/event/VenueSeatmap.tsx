'use client';

import { SeatmapCanvas, SeatmapProvider, TooltipOverlay, useSeatmapContext } from '@nex125/seatmap-react';
import type { SeatStatus, Venue } from '@nex125/seatmap-core';
import { useSeatStatus } from '@nex125/seatmap-react';
import { useEffect, useRef, useState } from 'react';
import { connectMercure } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { SeatmapLegend } from './SeatmapLegend';

interface VenueSeatmapProps {
  venue: Venue;
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

function PreviewSeatmapCanvas({ venue }: { venue: Venue }) {
  const t = useTranslations('venueSeatmap');
  const { viewport } = useSeatmapContext();
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{ dragging: boolean; x: number; y: number }>({
    dragging: false,
    x: 0,
    y: 0,
  });

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
      <TooltipOverlay />

      <SeatmapLegend
        venue={venue}
        title={t('legendTitle')}
        className="pointer-events-none absolute top-2 left-2 z-10 max-w-[170px] rounded-md border border-[var(--ds-ghost-border)] bg-[var(--ds-surface)]/95 p-2 text-[11px] leading-tight text-[var(--ds-on-surface)] md:top-3 md:left-3 md:max-w-[220px] md:rounded-lg md:p-3 md:text-xs"
      />
    </div>
  );
}

export function VenueSeatmap({ venue, venueId }: VenueSeatmapProps) {
  const liveVenueId = venueId?.trim() || venue.id;

  return (
    <div className="aspect-[16/9] rounded-[var(--ds-radius-structural)] overflow-hidden">
      <SeatmapProvider venue={venue}>
        <LiveSeatStatusSync venueId={liveVenueId} />
        <PreviewSeatmapCanvas venue={venue} />
      </SeatmapProvider>
    </div>
  );
}
