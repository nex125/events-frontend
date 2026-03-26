import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedEvents } from '@/components/home/FeaturedEvents';
import { PulseFeed } from '@/components/home/PulseFeed';
import { InnerCircle } from '@/components/home/InnerCircle';
import { getFeaturedEvents, getAllEvents } from '@/data/events';
import { fetchSeatInfo } from '@/lib/seatInfo';

export default async function HomePage() {
  const featured = getFeaturedEvents();
  const heroEvent = featured[0];
  const allEvents = getAllEvents();

  const seatInfo = heroEvent ? await fetchSeatInfo(heroEvent.slug) : [];
  const minPrice = seatInfo.length > 0
    ? Math.min(...seatInfo.map((s) => s.price))
    : undefined;

  return (
    <>
      {heroEvent && <HeroSection event={heroEvent} minPrice={minPrice} />}
      <FeaturedEvents events={featured} />
      <PulseFeed events={allEvents.slice(0, 4)} />
      <InnerCircle />
    </>
  );
}
