'use client';

import { useEffect, useState } from 'react';
import { getTicketingConfig } from '@/lib/api';

const DEFAULT_MAX_SEATS_PER_BOOKING = 10;

export function useMaxSeatsPerBooking(): number {
  const [maxSeatsPerBooking, setMaxSeatsPerBooking] = useState(
    DEFAULT_MAX_SEATS_PER_BOOKING,
  );

  useEffect(() => {
    const controller = new AbortController();
    getTicketingConfig({ signal: controller.signal })
      .then((config) => {
        if (Number.isInteger(config.maxSeatsPerBooking) && config.maxSeatsPerBooking > 0) {
          setMaxSeatsPerBooking(config.maxSeatsPerBooking);
        }
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Failed to load booking configuration:', error);
        }
      });

    return () => controller.abort();
  }, []);

  return maxSeatsPerBooking;
}
