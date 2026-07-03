import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CatalogEventsPage, type CatalogSearchParams } from '../events/CatalogEventsPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('eventsCatalog');
  return {
    title: t('searchPageTitle'),
    description: t('searchPageDescription'),
  };
}

interface SearchPageProps {
  searchParams: Promise<CatalogSearchParams>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <CatalogEventsPage
      searchParams={searchParams}
      basePath="/search"
      titleKey="searchTitle"
      defaultToUpcoming={false}
    />
  );
}
