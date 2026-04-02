import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedEvents } from '@/components/home/FeaturedEvents';
import { PulseFeed } from '@/components/home/PulseFeed';
import { InnerCircle } from '@/components/home/InnerCircle';
import { listEvents } from '@/lib/api';
import { fetchSeatInfo } from '@/lib/seatInfo';

export default async function HomePage() {
  const [{ data: featured }, { data: pulseEvents }] = await Promise.all([
    listEvents(
      {
        featured: true,
        sort: 'featured',
        limit: 5,
      },
      { next: { revalidate: 60 } },
    ),
    listEvents(
      {
        page: 1,
        limit: 4,
        sort: 'date_desc',
      },
      { next: { revalidate: 60 } },
    ),
  ]);

  const heroEvent = featured[0];

  const seatInfo = heroEvent
    ? await fetchSeatInfo(heroEvent.slug, { next: { revalidate: 60 } })
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
