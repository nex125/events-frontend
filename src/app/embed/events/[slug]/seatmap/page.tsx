import { cache } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ApiRequestError, getEmbedEventContext } from '@/lib/api';
import { DEFAULT_CURRENCY } from '@/lib/i18n/config';
import {
  decodeLaunchPayload,
  HANDOFF_COOKIE_PREFIX,
  hasRequiredLaunchFields,
  isLaunchExpired,
  resolveLaunchState,
  resolveTicketokLocale,
} from '@/lib/ticketokLaunch';
import { EmbedSeatmap } from '@/components/event/EmbedSeatmap';

interface EmbedSeatmapPageProps {
  params: Promise<{ slug: string }>;
}

const getEvent = cache(async (slug: string) =>
  getEmbedEventContext(slug, { next: { revalidate: 60 } }),
);

function isEventNotFoundError(error: unknown): boolean {
  return (
    error instanceof ApiRequestError &&
    (error.code === 'EVENT_NOT_FOUND' || error.status === 404)
  );
}

export const metadata: Metadata = {
  title: 'Ticketok Seatmap',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EmbedSeatmapPage({
  params,
}: EmbedSeatmapPageProps) {
  const { slug } = await params;
  const context = await getEvent(slug).catch((error: unknown) => {
    if (isEventNotFoundError(error)) {
      notFound();
    }
    throw error;
  });
  const event = context.event;

  if (event.source !== 'ticketok' || !event.venueEventId || !event.venueId) {
    notFound();
  }

  const cookieStore = await cookies();
  const handoff = decodeLaunchPayload(cookieStore.get(`${HANDOFF_COOKIE_PREFIX}${slug}`)?.value);
  if (!handoff || !hasRequiredLaunchFields(handoff) || isLaunchExpired(handoff)) {
    notFound();
  }

  const eventIdParam = handoff.eventId ?? '';
  const sessionToken = handoff.sessionToken ?? '';
  const state = resolveLaunchState(handoff);
  const timestamp = handoff.timestamp ?? '';
  const signature = handoff.signature ?? '';
  const sourceEventId = Number.parseInt(event.sourceEventId?.trim() ?? '', 10);
  const handoffEventId = Number.parseInt(eventIdParam, 10);

  if (
    !Number.isFinite(sourceEventId) ||
    sourceEventId <= 0 ||
    !Number.isFinite(handoffEventId) ||
    handoffEventId <= 0 ||
    handoffEventId !== sourceEventId ||
    sessionToken.length === 0 ||
    state.length === 0 ||
    timestamp.length === 0 ||
    signature.length === 0
  ) {
    notFound();
  }

  const seatCurrency =
    (handoff.currency ?? '') ||
    context.seatCategories.find((category) => category.currency.trim().length > 0)?.currency ||
    DEFAULT_CURRENCY;

  return (
    <EmbedSeatmap
      slug={slug}
      eventId={event.id}
      venueId={event.venueId}
      sourceEventId={sourceEventId}
      venue={context.venue}
      currency={seatCurrency}
      ticketokContext={{
        sessionToken,
        state,
        requestId: handoff.requestId ?? '',
        timestamp,
        signature,
        locale: resolveTicketokLocale(handoff),
        currency: handoff.currency ?? '',
        ticketId: handoff.ticketId ?? '',
        expiresAt: handoff.expiresAt ?? '',
        returnUrl: handoff.returnUrl ?? '',
      }}
    />
  );
}
