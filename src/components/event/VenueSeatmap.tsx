'use client';

import { SeatmapViewer } from '@nex125/seatmap-viewer';
import type { SeatStatus, Venue } from '@nex125/seatmap-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { connectMercure, lockSeat, releaseSeat } from '@/lib/api';

interface VenueSeatmapProps {
  venue: Venue;
  onSeatSelect?: (seatId: string, sectionId: string) => void;
}

function getOrCreateClientId(): string {
  if (typeof window === 'undefined') {
    return 'events-frontend-user';
  }

  const raw = localStorage.getItem('ticketing_client_id');
  if (raw) return raw.replace(/^"|"$/g, '');
  const id = crypto.randomUUID();
  localStorage.setItem('ticketing_client_id', id);
  return id;
}

function findSeatStatus(venue: Venue, seatId: string): SeatStatus | null {
  for (const section of venue.sections) {
    for (const row of section.rows) {
      const seat = row.seats.find((candidate) => candidate.id === seatId);
      if (seat) return seat.status;
    }
  }

  return null;
}

function patchSeatStatus(venue: Venue, seatId: string, status: SeatStatus): Venue {
  return {
    ...venue,
    sections: venue.sections.map((section) => ({
      ...section,
      rows: section.rows.map((row) => ({
        ...row,
        seats: row.seats.map((seat) => (seat.id === seatId ? { ...seat, status } : seat)),
      })),
    })),
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
  const [pendingSeatIds, setPendingSeatIds] = useState<Set<string>>(new Set());
  const clientId = useMemo(() => getOrCreateClientId(), []);

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
    async (seatId: string, sectionId: string) => {
      if (pendingSeatIds.has(seatId)) return;
      onSeatSelect?.(seatId, sectionId);

      const currentStatus = findSeatStatus(liveVenue, seatId);
      if (currentStatus !== 'available' && currentStatus !== 'locked') return;

      setPendingSeatIds((prev) => new Set(prev).add(seatId));

      try {
        if (currentStatus === 'available') {
          await lockSeat(seatId, clientId, liveVenue.id);
          setLiveVenue((prev) => patchSeatStatus(prev, seatId, 'locked'));
        } else {
          await releaseSeat(seatId, clientId, liveVenue.id);
          setLiveVenue((prev) => patchSeatStatus(prev, seatId, 'available'));
        }
      } catch (error) {
        console.error('Seat toggle failed:', error);
      } finally {
        setPendingSeatIds((prev) => {
          const next = new Set(prev);
          next.delete(seatId);
          return next;
        });
      }
    },
    [clientId, liveVenue, onSeatSelect, pendingSeatIds],
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
