import { cache } from 'react';
import { notFound } from 'next/navigation';
import { ApiRequestError, getEventBySlug } from '@/lib/api';
import { fetchSeatInfo } from '@/lib/seatInfo';
import { EventHero } from '@/components/event/EventHero';
import { EventDetails, EventLocationNotes } from '@/components/event/EventDetails';
import { BookingCard } from '@/components/event/BookingCard';
import { SeatMap } from '@/components/event/SeatMap';
import { TicketPromo } from '@/components/event/TicketPromo';
import { VenueSeatmap } from '@/components/event/VenueSeatmap';
import { generateVenue } from '@/types/venue';

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
  const { slug } = await params;
  try {
    const event = await getEvent(slug);
    return {
      title: `${event.title} | Ticketok`,
      description: event.description,
    };
  } catch (error) {
    if (isEventNotFoundError(error)) {
      return { title: 'Событие не найдено' };
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

  const venue = generateVenue(5000);

  return (
    <>
      <EventHero event={event} />

      <section className="max-w-[80rem] mx-auto px-[var(--ds-page-gutter)] py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            <EventDetails event={event} />
            <VenueSeatmap venue={venue} />
            {/* <SeatMap /> */}
            <EventLocationNotes event={event} />
          </div>
          <div className="lg:col-span-4">
            <BookingCard seatCategories={seatCategories} />
          </div>
        </div>
      </section>

      <TicketPromo event={event} />
    </>
  );
}
