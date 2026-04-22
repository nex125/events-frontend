import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedEvents } from '@/components/home/FeaturedEvents';
import { PulseFeed } from '@/components/home/PulseFeed';
import { InnerCircle } from '@/components/home/InnerCircle';
import { buildContentFetchInit } from '@/lib/fetchPolicy';
import { getHomepageContent } from '@/lib/api';
import { fetchSeatInfo } from '@/lib/seatInfo';
import type { Event } from '@/types/event';

export const dynamic = 'force-dynamic';

const FETCH_TIMEOUT_MS = 8000;

export default async function HomePage() {
  const homepageResult = await getHomepageContent(
    buildContentFetchInit(AbortSignal.timeout(FETCH_TIMEOUT_MS)),
  ).catch(() => ({ featuredEvents: [] as Event[], posterEvents: [] as Event[], recommendedEvents: [] as Event[] }));

  const featured = homepageResult.featuredEvents;
  const pulseEvents = homepageResult.posterEvents;
  const heroEvent = featured[0];

  const seatInfo = heroEvent
    ? await fetchSeatInfo(
      heroEvent.slug,
      buildContentFetchInit(AbortSignal.timeout(FETCH_TIMEOUT_MS)),
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
