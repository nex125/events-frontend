'use client';

import type { SeatStatus, Venue } from '@nex125/seatmap-core';
import { AVAILABLE_STATUS_ID } from '@nex125/seatmap-core';
import {
  SeatmapViewer,
  seatmapViewerSharedThemeRootClassName,
  seatmapViewerSharedThemeClassNames,
} from '@nex125/seatmap-viewer';
import type { SeatmapCartEvent } from '@nex125/seatmap-viewer';
import type { TooltipData } from '@nex125/seatmap-react';
import { AlertTriangle } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  connectMercure,
  lockSeat,
  proceedCart,
  releaseSeat,
} from '@/lib/api';
import {
  buildEmbedCheckoutContinuation,
  buildEmbedCheckoutTarget,
} from '@/lib/embedCheckoutRedirect';
import { resolveLocaleTag } from '@/lib/i18n/config';
import { useMaxSeatsPerBooking } from '@/lib/useTicketingConfig';
import { SeatmapLegend } from './SeatmapLegend';
import { SeatmapStatusMessage } from './SeatmapStatusMessage';

interface EmbedSeatmapProps {
  slug: string;
  eventId: string;
  venueId: string;
  sourceEventId: number;
  venue: Venue;
  currency: string;
  ticketokContext: {
    sessionToken: string;
    state: string;
    requestId?: string;
    timestamp: string;
    locale?: string;
    currency?: string;
    ticketId?: string;
    expiresAt?: string;
    returnUrl?: string;
  };
}

type SeatmapViewerMessageOverrides = {
  uncategorizedCategoryName: string;
  sectionFallbackLabel: string;
  tableLabel: (tableLabel: string) => string;
  tooltipSeatLabel: (rowLabel: string, seatLabel: string) => string;
  tooltipStatusAvailable: string;
  tooltipPriceLabel: (price: string) => string;
  tooltipPriceUnavailable: string;
  legendAriaLabel: string;
  legendStatusesTitle: string;
  legendPricesTitle: string;
  cartChipLabel: (count: number) => string;
  cartAriaLabel: string;
  cartHeaderTitle: string;
  cartCloseLabel: string;
  cartEmptyState: string;
  cartGroupMeta: (count: number, unitPrice: string) => string;
  cartGroupFee: (basePrice: string, serviceFee: string, serviceFeePercent: string | null) => string;
  cartRemoveOneAriaLabel: (categoryName: string) => string;
  cartAddOneAriaLabel: (categoryName: string) => string;
  cartRemoveSeatTitle: string;
  cartRemoveSeatAriaLabel: (seatLabel: string) => string;
  cartServiceFeeSummary: (serviceFeeTotal: string) => string;
  cartSummary: (count: number, totalCost: string) => string;
  cartProceedButton: string;
};

interface SeatmapAvailabilityState {
  phase: 'ready' | 'error';
}

function buildSeatmapMessages(
  tSeatmap: ReturnType<typeof useTranslations<'ticketLauncher.seatmap'>>,
): SeatmapViewerMessageOverrides {
  return {
    uncategorizedCategoryName: tSeatmap('uncategorizedCategoryName'),
    sectionFallbackLabel: tSeatmap('sectionFallbackLabel'),
    tableLabel: (tableLabel: string) => tSeatmap('tableLabel', { tableLabel }),
    tooltipSeatLabel: (rowLabel: string, seatLabel: string) => tSeatmap('tooltipSeatLabel', { rowLabel, seatLabel }),
    tooltipStatusAvailable: tSeatmap('tooltipStatusAvailable'),
    tooltipPriceLabel: (price: string) => tSeatmap('tooltipPriceLabel', { price }),
    tooltipPriceUnavailable: tSeatmap('tooltipPriceUnavailable'),
    legendAriaLabel: tSeatmap('legendAriaLabel'),
    legendStatusesTitle: tSeatmap('legendStatusesTitle'),
    legendPricesTitle: tSeatmap('legendPricesTitle'),
    cartChipLabel: (count: number) => tSeatmap('cartChipLabel', { count }),
    cartAriaLabel: tSeatmap('cartAriaLabel'),
    cartHeaderTitle: tSeatmap('cartHeaderTitle'),
    cartCloseLabel: tSeatmap('cartCloseLabel'),
    cartEmptyState: tSeatmap('cartEmptyState'),
    cartGroupMeta: (count: number, unitPrice: string) => tSeatmap('cartGroupMeta', { count, unitPrice }),
    cartGroupFee: (basePrice: string, serviceFee: string, serviceFeePercent: string | null) =>
      tSeatmap('cartGroupFee', {
        basePrice,
        serviceFee,
        serviceFeePercent: serviceFeePercent ? ` (${serviceFeePercent})` : '',
      }),
    cartRemoveOneAriaLabel: (categoryName: string) => tSeatmap('cartRemoveOneAriaLabel', { categoryName }),
    cartAddOneAriaLabel: (categoryName: string) => tSeatmap('cartAddOneAriaLabel', { categoryName }),
    cartRemoveSeatTitle: tSeatmap('cartRemoveSeatTitle'),
    cartRemoveSeatAriaLabel: (seatLabel: string) => tSeatmap('cartRemoveSeatAriaLabel', { seatLabel }),
    cartServiceFeeSummary: (serviceFeeTotal: string) => tSeatmap('cartServiceFeeSummary', { serviceFeeTotal }),
    cartSummary: (count: number, totalCost: string) => tSeatmap('cartSummary', { count, totalCost }),
    cartProceedButton: tSeatmap('cartProceedButton'),
  };
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

export function EmbedSeatmap({
  slug,
  eventId,
  venueId,
  sourceEventId,
  venue,
  currency,
  ticketokContext,
}: EmbedSeatmapProps) {
  const t = useTranslations('ticketLauncher');
  const tSeatmap = useTranslations('ticketLauncher.seatmap');
  const tEmbed = useTranslations('embedSeatmap');
  const clientId = useMemo(() => getOrCreateClientId(), []);
  const locale = resolveLocaleTag();
  const seatmapMessages = useMemo<SeatmapViewerMessageOverrides>(
    () => buildSeatmapMessages(tSeatmap),
    [tSeatmap],
  );
  const seatmapViewerI18nProps = useMemo(
    () => ({ locale, messages: seatmapMessages }) as Record<string, unknown>,
    [locale, seatmapMessages],
  );
  const formatTooltipPrice = useCallback(
    (value: number) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
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
          <div style={{ color: 'var(--seatmap-tooltip-muted-text, var(--seatmap-on-surface-variant, #9a9694))', fontSize: 12, marginTop: 2 }}>
            {translatedStatus}
          </div>
          <div style={{ color: 'var(--seatmap-tooltip-muted-text, var(--seatmap-on-surface-variant, #9a9694))', fontSize: 12, marginTop: 2 }}>
            {priceLabel}
          </div>
        </div>
      );
    },
    [formatTooltipPrice, tSeatmap],
  );

  const [queueState] = useState<SeatmapAvailabilityState>({
    phase: 'ready',
  });
  const [liveVenue, setLiveVenue] = useState<Venue>(venue);
  const [cartStatus, setCartStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [cartMessage, setCartMessage] = useState('');
  const [viewerResetToken, setViewerResetToken] = useState(0);
  const [pendingSeatIds, setPendingSeatIds] = useState<Set<string>>(new Set());
  const maxSeatsPerBooking = useMaxSeatsPerBooking();
  const lockSetRef = useRef<Set<string>>(new Set());
  const selectingSeatIdsRef = useRef<Set<string>>(new Set());
  const ownedSeatIdsRef = useRef<Set<string>>(new Set());
  const seatStatusByIdRef = useRef<Map<string, SeatStatus>>(buildSeatStatusMap(venue));
  const dismissCartError = useCallback(() => {
    if (cartStatus !== 'error') return;

    setCartStatus('idle');
    setCartMessage('');
  }, [cartStatus]);

  useEffect(() => {
    setLiveVenue(venue);
  }, [venue]);

  useEffect(() => {
    seatStatusByIdRef.current = buildSeatStatusMap(liveVenue);
  }, [liveVenue]);

  useEffect(() => {
    lockSetRef.current = pendingSeatIds;
  }, [pendingSeatIds]);

  useEffect(() => {
    const eventSource = connectMercure(venueId, (seatId, status) => {
      const mappedStatus = mapBackendStatus(status);
      if (mappedStatus !== 'locked') {
        ownedSeatIdsRef.current.delete(seatId);
      }
      seatStatusByIdRef.current.set(seatId, mappedStatus);
      setLiveVenue((currentVenue) => updateVenueSeatStatus(currentVenue, seatId, mappedStatus));
    });

    return () => {
      eventSource.close();
    };
  }, [venueId]);

  const navigateTopLevel = useCallback((target: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (window.top && window.top !== window) {
        window.top.location.href = target;
        return;
      }
    } catch {
      // Fallback to same-frame navigation when top-level access is blocked.
    }

    window.location.href = target;
  }, []);

  const continueToCheckout = useCallback(
    () => {
      const continuationLocale = ticketokContext.locale?.trim() || locale;
      const continuation = buildEmbedCheckoutContinuation({
        eventId,
        sourceEventId,
        locale: continuationLocale,
        slug,
        returnUrl: ticketokContext.returnUrl,
        origin: window.location.origin,
        referrer: document.referrer,
      });

      if (continuation.kind === 'postMessage' && window.parent && window.parent !== window) {
        window.parent.postMessage(continuation.message, continuation.targetOrigin);
        return;
      }

      if (continuation.kind === 'navigate') {
        navigateTopLevel(continuation.target);
        return;
      }

      navigateTopLevel(buildEmbedCheckoutTarget({
        eventId,
        sourceEventId,
        locale: continuationLocale,
        slug,
        returnUrl: ticketokContext.returnUrl,
        origin: window.location.origin,
      }));
    },
    [eventId, locale, navigateTopLevel, slug, sourceEventId, ticketokContext.locale, ticketokContext.returnUrl],
  );

  const handleSeatClick = useCallback(
    async (seatId: string) => {
      if (cartStatus === 'loading') return;
      if (lockSetRef.current.has(seatId)) return;

      const currentStatus = seatStatusByIdRef.current.get(seatId) ?? findSeatStatus(liveVenue, seatId);
      if (currentStatus !== 'available' && currentStatus !== 'locked') return;
      if (currentStatus === 'locked' && !ownedSeatIdsRef.current.has(seatId)) return;

      setPendingSeatIds((prev) => new Set(prev).add(seatId));
      try {
        if (currentStatus === 'available') {
          if (
            ownedSeatIdsRef.current.size + selectingSeatIdsRef.current.size >=
            maxSeatsPerBooking
          ) {
            setCartStatus('error');
            setCartMessage(t('seatLimitReached', { count: maxSeatsPerBooking }));
            return;
          }

          selectingSeatIdsRef.current.add(seatId);
          await lockSeat(seatId, clientId, venueId);
          ownedSeatIdsRef.current.add(seatId);
          seatStatusByIdRef.current.set(seatId, 'locked');
          setLiveVenue((currentVenue) => updateVenueSeatStatus(currentVenue, seatId, 'locked'));
        } else {
          await releaseSeat(seatId, clientId, venueId);
          ownedSeatIdsRef.current.delete(seatId);
          seatStatusByIdRef.current.set(seatId, 'available');
          setLiveVenue((currentVenue) => updateVenueSeatStatus(currentVenue, seatId, 'available'));
        }
      } catch (error) {
        console.error('Seat toggle failed in embed seatmap:', error);
      } finally {
        selectingSeatIdsRef.current.delete(seatId);
        setPendingSeatIds((prev) => {
          const next = new Set(prev);
          next.delete(seatId);
          return next;
        });
      }
    },
    [cartStatus, clientId, liveVenue, maxSeatsPerBooking, t, venueId],
  );

  const handleCartEvent = useCallback(
    async (event: SeatmapCartEvent) => {
      if (event.type !== 'cart-proceed-clicked') return;
      if (cartStatus === 'loading') return;

      const selectedSeatIds = event.payload.seats.map((seat) => seat.seatId);
      if (selectedSeatIds.length === 0) {
        return;
      }
      if (selectedSeatIds.length > maxSeatsPerBooking) {
        setCartStatus('error');
        setCartMessage(t('seatLimitReached', { count: maxSeatsPerBooking }));
        return;
      }

      const proceedSeatIds = selectedSeatIds.filter((seatId) => ownedSeatIdsRef.current.has(seatId));
      if (proceedSeatIds.length !== selectedSeatIds.length) {
        setCartStatus('error');
        setCartMessage(t('bookingFailed'));
        setViewerResetToken((current) => current + 1);
        return;
      }

      setCartStatus('loading');
      setCartMessage(t('creatingBooking'));
      try {
        await proceedCart({
          userId: clientId,
          eventId,
          venueId,
          seats: proceedSeatIds,
          sessionToken: ticketokContext.sessionToken,
        });
        setCartStatus('success');
        setCartMessage(tEmbed('cartForwarding'));
        continueToCheckout();
      } catch (error) {
        const message = error instanceof Error ? error.message : t('bookingFailed');
        setCartStatus('error');
        setCartMessage(message);
      }
    },
    [cartStatus, clientId, continueToCheckout, maxSeatsPerBooking, t, tEmbed, ticketokContext.sessionToken, venueId],
  );

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(223,205,114,0.18),_transparent_42%),linear-gradient(180deg,_rgba(20,20,18,0.98),_rgba(8,8,7,1))] text-[var(--ds-on-surface)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-stretch px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex w-full flex-col overflow-hidden rounded-[var(--ds-radius-structural)] border border-[var(--ds-ghost-border)] bg-[color-mix(in_srgb,var(--ds-surface)_92%,transparent)] shadow-[var(--ds-shadow-ambient-lg)]">
          <div className="border-b border-[var(--ds-ghost-border)] px-5 py-4 sm:px-6">
            <h1 className="ds-heading-md tracking-tight">{tEmbed('title')}</h1>
          </div>

          <div className="flex min-h-[min(78vh,760px)] flex-1 flex-col">
            {queueState.phase === 'ready' ? (
              <div className="ticket-launcher-seatmap relative h-full" aria-busy={cartStatus === 'loading'}>
                <SeatmapViewer
                  key={`${venue.id}-${viewerResetToken}`}
                  className={seatmapViewerSharedThemeRootClassName}
                  classNames={seatmapViewerSharedThemeClassNames}
                  venue={liveVenue}
                  currency={currency}
                  renderTooltip={renderSeatmapTooltip}
                  onSeatClick={handleSeatClick}
                  onCartEvent={handleCartEvent}
                  showLabels
                  {...seatmapViewerI18nProps}
                />
                <SeatmapLegend
                  venue={liveVenue}
                  currency={currency}
                  title={tSeatmap('legendPricesTitle')}
                  className="pointer-events-none absolute top-3 left-3 z-10 max-w-[220px] rounded-lg border border-[var(--ds-ghost-border)] bg-[var(--ds-surface)]/95 p-3 text-xs leading-tight text-[var(--ds-on-surface)]"
                />
                <div className="pointer-events-none absolute top-3 right-3 z-10 max-w-[240px] rounded-lg border border-[var(--ds-ghost-border)] bg-[var(--ds-surface)]/95 px-3 py-2 text-xs text-[var(--ds-on-surface-variant)]">
                  {t('seatLimitHint', { count: maxSeatsPerBooking })}
                </div>
                {cartStatus === 'loading' && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                    <div className="rounded-xl bg-[var(--ds-surface)] px-4 py-3 text-sm shadow-[var(--ds-shadow-ambient-md)]">
                      {cartMessage}
                    </div>
                  </div>
                )}
                <SeatmapStatusMessage
                  status={cartStatus}
                  message={cartMessage}
                  onDismissError={dismissCartError}
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-8 py-10 text-center">
                <div className="rounded-full border border-red-200 bg-red-50 p-3 text-red-700">
                  <AlertTriangle size={28} />
                </div>
                <div className="space-y-2">
                  <h2 className="ds-heading-sm">{tEmbed('seatmapUnavailable')}</h2>
                  <p className="mx-auto max-w-xl text-sm text-[var(--ds-on-surface-variant)]">
                    {tEmbed('seatmapUnavailableDescription')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
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

function buildSeatStatusMap(venue: Venue): Map<string, SeatStatus> {
  const next = new Map<string, SeatStatus>();

  for (const section of venue.sections) {
    for (const row of section.rows) {
      for (const seat of row.seats) {
        next.set(seat.id, seat.status);
      }
    }
  }

  for (const table of venue.tables) {
    for (const seat of table.seats) {
      next.set(seat.id, seat.status);
    }
  }

  return next;
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

function updateVenueSeatStatus(
  venue: Venue,
  seatId: string,
  status: SeatStatus,
): Venue {
  for (let sectionIndex = 0; sectionIndex < venue.sections.length; sectionIndex += 1) {
    const section = venue.sections[sectionIndex];
    for (let rowIndex = 0; rowIndex < section.rows.length; rowIndex += 1) {
      const row = section.rows[rowIndex];
      const seatIndex = row.seats.findIndex((seat) => seat.id === seatId);
      if (seatIndex !== -1) {
        const seats = [...row.seats];
        seats[seatIndex] = { ...seats[seatIndex], status };
        const rows = [...section.rows];
        rows[rowIndex] = { ...row, seats };
        const sections = [...venue.sections];
        sections[sectionIndex] = { ...section, rows };
        return { ...venue, sections };
      }
    }
  }

  for (let tableIndex = 0; tableIndex < venue.tables.length; tableIndex += 1) {
    const table = venue.tables[tableIndex];
    const seatIndex = table.seats.findIndex((seat) => seat.id === seatId);
    if (seatIndex !== -1) {
      const seats = [...table.seats];
      seats[seatIndex] = { ...seats[seatIndex], status };
      const tables = [...venue.tables];
      tables[tableIndex] = { ...table, seats };
      return { ...venue, tables };
    }
  }

  return venue;
}
