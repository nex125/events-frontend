'use client';

import type { SeatStatus, Venue } from '@nex125/seatmap-core';
import { SeatmapViewer } from '@nex125/seatmap-viewer';
import type { SeatmapCartEvent } from '@nex125/seatmap-viewer';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { checkVirtualQueue, connectMercure, lockSeat, proceedCart, releaseSeat } from '@/lib/api';

interface TicketLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  venue: Venue;
  eventId: string;
}

interface QueueState {
  phase: 'checking' | 'waiting' | 'ready' | 'error';
  remainingMs: number;
}

function getOrCreateClientId(): string {
  if (typeof window === 'undefined') {
    return 'events-frontend-user';
  }

  const raw = localStorage.getItem('ticketing_client_id');
  if (raw) return raw.replace(/^"|"$/g, '');

  const id = nanoid();
  localStorage.setItem('ticketing_client_id', id);
  return id;
}

export function TicketLauncher({
  isOpen,
  onClose,
  venue,
  eventId,
}: TicketLauncherProps) {
  const [liveVenue, setLiveVenue] = useState(venue);
  const clientId = useMemo(() => getOrCreateClientId(), []);
  const [queueState, setQueueState] = useState<QueueState>({
    phase: 'checking',
    remainingMs: 0,
  });
  const [cartStatus, setCartStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cartMessage, setCartMessage] = useState('');
  const [viewerResetToken, setViewerResetToken] = useState(0);
  const [pendingSeatIds, setPendingSeatIds] = useState<Set<string>>(new Set());
  const lockSetRef = useRef<Set<string>>(new Set());
  const queueKeyRef = useRef<string>('');

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setCartStatus('idle');
      setCartMessage('');
    }
  }, [isOpen]);

  useEffect(() => {
    setLiveVenue(venue);
  }, [venue]);

  useEffect(() => {
    lockSetRef.current = pendingSeatIds;
  }, [pendingSeatIds]);

  useEffect(() => {
    if (!isOpen) return;
    const eventSource = connectMercure(liveVenue.id, (seatId, status) => {
      setLiveVenue((prev) => patchSeatStatus(prev, seatId, mapBackendStatus(status)));
    });
    return () => eventSource.close();
  }, [isOpen, liveVenue.id]);

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    let timerId: number | null = null;

    queueKeyRef.current = `${eventId}:${clientId}:${Date.now()}`;

    const poll = async () => {
      try {
        const response = await checkVirtualQueue({
          clientId,
          eventId,
          queueKey: queueKeyRef.current,
        });
        if (isCancelled) return;

        if (response.allowed) {
          setQueueState({ phase: 'ready', remainingMs: 0 });
          return;
        }

        setQueueState({
          phase: 'waiting',
          remainingMs: response.remainingMs,
        });
        timerId = window.setTimeout(poll, Math.min(1000, Math.max(response.remainingMs, 250)));
      } catch {
        if (isCancelled) return;
        setQueueState((prev) => ({
          phase: 'error',
          remainingMs: prev.remainingMs,
        }));
        timerId = window.setTimeout(poll, 1500);
      }
    };

    setQueueState({ phase: 'checking', remainingMs: 0 });
    poll();

    return () => {
      isCancelled = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [clientId, eventId, isOpen]);

  const remainingSeconds = Math.max(1, Math.ceil(queueState.remainingMs / 1000));

  const handleSeatClick = useCallback(
    async (seatId: string) => {
      if (cartStatus === 'loading') return;
      if (lockSetRef.current.has(seatId)) return;

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
        console.error('Seat toggle failed in launcher:', error);
      } finally {
        setPendingSeatIds((prev) => {
          const next = new Set(prev);
          next.delete(seatId);
          return next;
        });
      }
    },
    [cartStatus, clientId, liveVenue],
  );

  const handleCartEvent = useCallback(
    async (event: SeatmapCartEvent) => {
      if (event.type !== 'cart-proceed-clicked') return;
      if (cartStatus === 'loading') return;

      const selectedSeatIds = event.payload.seats.map((seat) => seat.seatId);
      if (selectedSeatIds.length === 0) {
        return;
      }

      setCartStatus('loading');
      setCartMessage('Создаем бронирование...');
      try {
        const response = await proceedCart({
          userId: clientId,
          venueId: liveVenue.id,
          seats: selectedSeatIds,
        });
        setCartStatus('success');
        setCartMessage(`Бронирование ${response.bookingId} создано.`);
        setViewerResetToken((current) => current + 1);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось создать бронирование.';
        setCartStatus('error');
        setCartMessage(message);
      }
    },
    [cartStatus, clientId, liveVenue.id],
  );

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Panel — shares layoutId with the button, morphs between them */}
          <motion.div
            layoutId="ticket-launcher"
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative z-10 bg-[var(--ds-surface)] overflow-hidden rounded-[var(--ds-radius-structural)] shadow-[var(--ds-shadow-ambient-lg)] w-full max-w-2xl"
            style={{ height: 'min(92vh, 860px)' }}
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ delay: 0.2, duration: 0.2 }}
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[var(--ds-surface-container-high)] hover:bg-[var(--ds-surface-container-highest)] transition-colors"
            >
              <X size={18} />
            </motion.button>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ delay: 0.22, duration: 0.3 }}
              className="flex flex-col w-full h-full"
            >
              <div className="flex items-center gap-3 px-8 py-6 border-b border-[var(--ds-border-subtle)] shrink-0">
                <Ticket size={22} className="text-[var(--ds-primary)]" />
                <h2 className="ds-heading-md tracking-tight">Выбор билетов</h2>
              </div>

              <div className="flex-1 overflow-hidden">
                {queueState.phase === 'ready' ? (
                  <div className="relative h-full" aria-busy={cartStatus === 'loading'}>
                    <SeatmapViewer
                      key={`${liveVenue.id}-${viewerResetToken}`}
                      venue={liveVenue}
                      onSeatClick={handleSeatClick}
                      onCartEvent={handleCartEvent}
                    />
                    {cartStatus === 'loading' && (
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="rounded-xl bg-[var(--ds-surface)] px-4 py-3 text-sm shadow-[var(--ds-shadow-ambient-md)]">
                          {cartMessage}
                        </div>
                      </div>
                    )}
                    {(cartStatus === 'success' || cartStatus === 'error') && (
                      <div
                        className="absolute left-4 right-4 bottom-4 z-10 rounded-xl px-4 py-3 text-sm shadow-[var(--ds-shadow-ambient-md)] bg-[var(--ds-surface)] border border-[var(--ds-ghost-border)]"
                        role={cartStatus === 'error' ? 'alert' : 'status'}
                      >
                        {cartMessage}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full px-8 py-10 flex flex-col items-center justify-center text-center gap-4">
                    <Ticket size={36} className="text-[var(--ds-primary)]" />
                    <h3 className="ds-heading-sm">
                      {queueState.phase === 'error'
                        ? 'Пробуем подключиться к очереди...'
                        : 'Вы в виртуальной очереди'}
                    </h3>
                    <p className="ds-body-sm text-[var(--ds-on-surface-variant)] max-w-md">
                      {queueState.phase === 'checking'
                        ? 'Проверяем доступ к выбору мест.'
                        : queueState.phase === 'error'
                          ? 'Временная ошибка проверки очереди. Продолжаем попытки автоматически.'
                          : `Ожидайте ${remainingSeconds} сек., после чего откроется выбор мест.`}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
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
