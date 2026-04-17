import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ApiRequestError, getEventBySlug, getVenueEventGrid } from '@/lib/api';
import { fetchSeatInfo } from '@/lib/seatInfo';
import { EventHero } from '@/components/event/EventHero';
import { EventDetails, EventLocationNotes } from '@/components/event/EventDetails';
import { BookingCard } from '@/components/event/BookingCard';
import { TicketPromo } from '@/components/event/TicketPromo';
import { VenueSeatmap } from '@/components/event/VenueSeatmap';
import { DEFAULT_CURRENCY } from '@/lib/i18n/config';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

const getEvent = cache(async (slug: string) =>
  getEventBySlug(slug, { next: { revalidate: 60 } }),
);

function isEventNotFoundError(error: unknown): boolean {
  return (
    error instanceof ApiRequestError &&
    (error.code === 'EVENT_NOT_FOUND' || error.status === 404)
  );
}

export async function generateMetadata({ params }: EventPageProps) {
  const t = await getTranslations('eventPage');
  const { slug } = await params;
  try {
    const event = await getEvent(slug);
    return {
      title: `${event.title} | Ticketok`,
      description: event.description,
    };
  } catch (error) {
    if (isEventNotFoundError(error)) {
      return { title: t('notFoundTitle') };
    }
    throw error;
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEvent(slug).catch((error: unknown) => {
    if (isEventNotFoundError(error)) {
      notFound();
    }
    throw error;
  });

  const seatCategories = await fetchSeatInfo(slug, { next: { revalidate: 60 } });
  const seatCurrency = seatCategories.find((category) => category.currency.trim().length > 0)?.currency ?? DEFAULT_CURRENCY;

  const venue = event.venueEventId
    ? await getVenueEventGrid(event.venueEventId).catch(() => null)
    : null;

  return (
    <>
      <EventHero event={event} />

      <section className="max-w-[80rem] mx-auto px-[var(--ds-page-gutter)] py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            <EventDetails event={event} />
            {venue ? (
              <VenueSeatmap venue={venue} currency={seatCurrency} venueId={event.venueId} />
            ) : (
              <div className="rounded-[var(--ds-radius-structural)] border border-[var(--ds-ghost-border)] bg-[var(--ds-surface-container)] p-6">
                <h3 className="ds-heading-sm mb-2">Схема зала недоступна</h3>
                <p className="ds-body-sm text-[var(--ds-on-surface-variant)]">
                  Для этого события не назначена рассадка. Обратитесь к организатору.
                </p>
              </div>
            )}
            <EventLocationNotes event={event} />
          </div>
          <div className="lg:col-span-4">
            {venue ? (
              <BookingCard
                seatCategories={seatCategories}
                currency={seatCurrency}
                venue={venue}
                venueId={event.venueId}
                eventId={event.id}
                ticketokEventId={event.sourceEventId}
              />
            ) : null}
          </div>
        </div>
      </section>

      <TicketPromo event={event} />
    </>
  );
}
