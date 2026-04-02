'use client';

import { SeatmapViewer } from '@nex125/seatmap-viewer';
import type { Venue } from '@nex125/seatmap-core';

interface VenueSeatmapProps {
  venue: Venue;
  onSeatSelect?: (seatId: string, sectionId: string) => void;
}

export function VenueSeatmap({ venue, onSeatSelect }: VenueSeatmapProps) {
  return (
    <div className="aspect-[16/9] rounded-[var(--ds-radius-structural)] overflow-hidden">
      <SeatmapViewer
        venue={venue}
        onSeatClick={onSeatSelect}
      />
    </div>
  );
}
