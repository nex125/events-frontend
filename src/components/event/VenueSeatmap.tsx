'use client';

import { SeatmapCanvas, SeatmapProvider, TooltipOverlay, useSeatmapContext } from '@nex125/seatmap-react';
import type { SeatStatus, Venue } from '@nex125/seatmap-core';
import { useSeatStatus } from '@nex125/seatmap-react';
import { useEffect, useRef, useState } from 'react';
import { connectMercure } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface VenueSeatmapProps {
  venue: Venue;
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

      <aside className="pointer-events-none absolute top-2 left-2 z-10 max-w-[170px] rounded-md border border-[var(--ds-ghost-border)] bg-[var(--ds-surface)]/95 p-2 text-[11px] leading-tight text-[var(--ds-on-surface)] md:top-3 md:left-3 md:max-w-[220px] md:rounded-lg md:p-3 md:text-xs">
        <div className="font-semibold mb-1.5 md:mb-2">{t('legendTitle')}</div>

        {venue.seatStatuses.length > 0 && (
          <div className={venue.categories.length > 0 ? 'mb-2' : ''}>
            <div className="text-[var(--ds-on-surface-variant)] mb-1">{t('statusesTitle')}</div>
            {venue.seatStatuses.map((status) => (
              <div key={status.id} className="flex items-center gap-1.5 mb-0.5 md:mb-1">
                <span className="inline-block h-2 w-2 rounded-[2px] md:h-2.5 md:w-2.5" style={{ background: status.color }} />
                <span>{status.name}</span>
              </div>
            ))}
          </div>
        )}

        {venue.categories.length > 0 && (
          <div>
            <div className="text-[var(--ds-on-surface-variant)] mb-1">{t('categoriesTitle')}</div>
            {venue.categories.map((category) => (
              <div key={category.id} className="flex items-center gap-1.5 mb-0.5 md:mb-1">
                <span className="inline-block h-2 w-2 rounded-[2px] md:h-2.5 md:w-2.5" style={{ background: category.color }} />
                <span>{category.name}</span>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

export function VenueSeatmap({ venue }: VenueSeatmapProps) {
  return (
    <div className="aspect-[16/9] rounded-[var(--ds-radius-structural)] overflow-hidden">
      <SeatmapProvider venue={venue}>
        <LiveSeatStatusSync venueId={venue.id} />
        <PreviewSeatmapCanvas venue={venue} />
      </SeatmapProvider>
    </div>
  );
}
