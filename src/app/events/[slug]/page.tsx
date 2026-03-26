import { notFound } from 'next/navigation';
import { getEventBySlug, getAllEvents } from '@/data/events';
import { fetchSeatInfo } from '@/lib/seatInfo';
import { EventHero } from '@/components/event/EventHero';
import { EventDetails } from '@/components/event/EventDetails';
import { BookingCard } from '@/components/event/BookingCard';
import { SeatMap } from '@/components/event/SeatMap';
import { TicketPromo } from '@/components/event/TicketPromo';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllEvents()
    .filter((e) => !e.isMock)
    .map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: 'Событие не найдено' };
  return {
    title: `${event.title} | Ticketok`,
    description: event.description,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event || event.isMock) {
    notFound();
  }

  const seatCategories = await fetchSeatInfo(slug);

  return (
    <>
      <EventHero event={event} />

      <section className="max-w-[80rem] mx-auto px-[var(--ds-page-gutter)] py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            <EventDetails event={event} />
            <SeatMap />
          </div>
          <div className="lg:col-span-4">
            <BookingCard seatCategories={seatCategories} />
          </div>
        </div>
      </section>

      <TicketPromo />
    </>
  );
}
