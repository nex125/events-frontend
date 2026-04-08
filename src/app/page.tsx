import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedEvents } from '@/components/home/FeaturedEvents';
import { PulseFeed } from '@/components/home/PulseFeed';
import { InnerCircle } from '@/components/home/InnerCircle';
import { listEvents } from '@/lib/api';
import { fetchSeatInfo } from '@/lib/seatInfo';
import type { Event } from '@/types/event';

export const dynamic = 'force-dynamic';

const EMPTY_LIST = { data: [] as Event[], meta: { page: 1, limit: 12, total: 0, totalPages: 1 } };
const FETCH_TIMEOUT_MS = 8000;

export default async function HomePage() {
  const [featuredResult, pulseResult] = await Promise.all([
    listEvents(
      { featured: true, sort: 'featured', limit: 5 },
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
    ).catch(() => EMPTY_LIST),
    listEvents(
      { page: 1, limit: 4, sort: 'date_desc' },
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
    ).catch(() => EMPTY_LIST),
  ]);

  const featured = featuredResult.data;
  const pulseEvents = pulseResult.data;
  const heroEvent = featured[0];

  const seatInfo = heroEvent
    ? await fetchSeatInfo(
      heroEvent.slug,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
    ).catch(() => [])
    : [];
  const minPrice =
    seatInfo.length > 0 ? Math.min(...seatInfo.map((s) => s.price)) : undefined;

  return (
    <>
      {heroEvent && <HeroSection event={heroEvent} minPrice={minPrice} />}
      <FeaturedEvents events={featured} />
      <PulseFeed events={pulseEvents} />
      <InnerCircle />
    </>
  );
}
