import type { Metadata } from 'next';
import { EmbedCheckout } from '@/components/event/EmbedCheckout';

interface EmbedCheckoutPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Ticketok Checkout',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EmbedCheckoutPage({
  params,
  searchParams,
}: EmbedCheckoutPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  return <EmbedCheckout slug={slug} searchParams={resolvedSearchParams} />;
}
