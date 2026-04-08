'use client';

import { SeatmapViewer } from '@nex125/seatmap-viewer';
import type { SeatStatus, Venue } from '@nex125/seatmap-core';
import { useCallback, useEffect, useState } from 'react';
import { connectMercure } from '@/lib/api';

interface VenueSeatmapProps {
  venue: Venue;
  onSeatSelect?: (seatId: string, sectionId: string) => void;
}

function patchSeatStatus(venue: Venue, seatId: string, status: SeatStatus): Venue {
  let sectionChanged = false;
  const nextSections = venue.sections.map((section) => {
    let rowChanged = false;

    const nextRows = section.rows.map((row) => {
      let seatChanged = false;

      const nextSeats = row.seats.map((seat) => {
        if (seat.id !== seatId || seat.status === status) {
          return seat;
        }

        seatChanged = true;
        return { ...seat, status };
      });

      if (!seatChanged) {
        return row;
      }

      rowChanged = true;
      return { ...row, seats: nextSeats };
    });

    if (!rowChanged) {
      return section;
    }

    sectionChanged = true;
    return { ...section, rows: nextRows };
  });

  if (!sectionChanged) {
    return venue;
  }

  return {
    ...venue,
    sections: nextSections,
  };
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

export function VenueSeatmap({ venue, onSeatSelect }: VenueSeatmapProps) {
  const [liveVenue, setLiveVenue] = useState(venue);

  useEffect(() => {
    setLiveVenue(venue);
  }, [venue]);

  useEffect(() => {
    const eventSource = connectMercure(liveVenue.id, (seatId, status) => {
      setLiveVenue((prev) => patchSeatStatus(prev, seatId, mapBackendStatus(status)));
    });

    return () => {
      eventSource.close();
    };
  }, [liveVenue.id]);

  const handleSeatClick = useCallback(
    (seatId: string, sectionId: string) => {
      onSeatSelect?.(seatId, sectionId);
    },
    [onSeatSelect],
  );

  return (
    <div className="aspect-[16/9] rounded-[var(--ds-radius-structural)] overflow-hidden">
      <SeatmapViewer
        venue={liveVenue}
        onSeatClick={handleSeatClick}
      />
    </div>
  );
}
