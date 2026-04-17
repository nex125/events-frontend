import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ApiRequestError, getEventCategories, listEvents } from '@/lib/api';
import { AllEventsContent } from './AllEventsContent';
import { DateFilters } from './DateFilters';

export const dynamic = 'force-dynamic';
const FETCH_TIMEOUT_MS = 8000;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('eventsCatalog');
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

interface AllEventsPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

const PER_PAGE = 6;
const DEFAULT_EVENTS_META = {
  page: 1,
  limit: PER_PAGE,
  total: 0,
  totalPages: 1,
};

function formatTodayParam(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default async function AllEventsPage({ searchParams }: AllEventsPageProps) {
  const t = await getTranslations('eventsCatalog');
  const { q, page, category, dateFrom, dateTo } = await searchParams;
  const query = q?.trim() ?? '';
  const selectedCategory = category?.trim() ?? '';
  const todayParam = formatTodayParam();
  const selectedDateFrom = dateFrom?.trim() ?? '';
  const selectedDateTo = dateTo?.trim() ?? '';
  const normalizedDateFrom =
    selectedDateFrom.length > 0
      ? (selectedDateFrom < todayParam ? todayParam : selectedDateFrom)
      : '';
  const normalizedDateTo =
    selectedDateTo.length > 0 && selectedDateTo >= todayParam
      ? selectedDateTo
      : '';
  const effectiveDateTo =
    normalizedDateTo && normalizedDateFrom && normalizedDateTo < normalizedDateFrom
      ? ''
      : normalizedDateTo;
  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1);

  const [eventsResult, categories] = await Promise.all([
    listEvents(
      {
        q: query || undefined,
        category: selectedCategory || undefined,
        dateFrom: normalizedDateFrom || todayParam,
        dateTo: effectiveDateTo || undefined,
        page: currentPage,
        limit: PER_PAGE,
        sort: 'date_asc',
      },
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
    )
      .then((response) => ({ response, validationError: null as string | null }))
      .catch((error: unknown) => {
        if (error instanceof ApiRequestError && error.code === 'VALIDATION_ERROR') {
          return { response: null, validationError: error.message };
        }
        throw error;
      }),
    getEventCategories({ next: { revalidate: 60 }, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }),
  ]);

  const pageEvents = eventsResult.response?.data ?? [];
  const meta = eventsResult.response?.meta ?? DEFAULT_EVENTS_META;
  const validationError = eventsResult.validationError;

  function buildCatalogUrl(nextCategory?: string, includeDateRange = true): string {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (nextCategory) params.set('category', nextCategory);
    if (includeDateRange && selectedDateFrom && normalizedDateFrom) params.set('dateFrom', normalizedDateFrom);
    if (includeDateRange && selectedDateTo && effectiveDateTo) params.set('dateTo', effectiveDateTo);
    const qs = params.toString();
    return qs ? `/events?${qs}` : '/events';
  }

  return (
    <div className="pt-32 pb-20 px-[var(--ds-page-gutter)]">
      <div className="max-w-[80rem] mx-auto">
        <header className="mb-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="ds-label-sm text-[var(--ds-primary)] block mb-4 tracking-[0.3em]">
                {t('catalogLabel')}
              </span>
              <h1 className="ds-display-lg font-extrabold tracking-tighter text-[var(--ds-on-surface)]">
                {t('allEventsTitle')}
              </h1>
              {query && (
                <p className="ds-body-md text-[var(--ds-on-surface-variant)] mt-4">
                  {t('searchResultsPrefix')} «{query}» — {t('searchResultsEvents', { count: meta.total })}
                </p>
              )}
            </div>

            <DateFilters
              query={query}
              selectedCategory={selectedCategory}
              dateFrom={selectedDateFrom ? normalizedDateFrom : ''}
              dateTo={selectedDateTo ? effectiveDateTo : ''}
              validationError={validationError}
            />
          </div>

          {categories.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              <Link
                href={buildCatalogUrl()}
                className={
                  selectedCategory
                    ? 'px-4 py-2 rounded-[var(--ds-radius-pill)] ds-label-sm text-[var(--ds-on-surface-variant)] bg-[var(--ds-surface-container-low)] hover:bg-[var(--ds-surface-container-high)] transition-colors'
                    : 'px-4 py-2 rounded-[var(--ds-radius-pill)] ds-label-sm ds-accent-primary'
                }
              >
                {t('allCategories')}
              </Link>
              {categories.map((item) => (
                <Link
                  key={item}
                  href={buildCatalogUrl(item)}
                  className={
                    selectedCategory === item
                      ? 'px-4 py-2 rounded-[var(--ds-radius-pill)] ds-label-sm ds-accent-primary'
                      : 'px-4 py-2 rounded-[var(--ds-radius-pill)] ds-label-sm text-[var(--ds-on-surface-variant)] bg-[var(--ds-surface-container-low)] hover:bg-[var(--ds-surface-container-high)] transition-colors'
                  }
                >
                  {item}
                </Link>
              ))}
            </div>
          )}
        </header>

        <Suspense>
          <AllEventsContent
            events={pageEvents}
            totalPages={meta.totalPages}
            currentPage={meta.page}
          />
        </Suspense>
      </div>
    </div>
  );
}
