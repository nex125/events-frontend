import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CatalogEventsPage, type CatalogSearchParams } from './CatalogEventsPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('eventsCatalog');
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

interface AllEventsPageProps {
  searchParams: Promise<CatalogSearchParams>;
}

export default async function AllEventsPage({ searchParams }: AllEventsPageProps) {
  return <CatalogEventsPage searchParams={searchParams} basePath="/events" />;
}
