import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ApiRequestError, getEventCategories, getHomepageContent, listEvents } from '@/lib/api';
import { buildContentFetchInit } from '@/lib/fetchPolicy';
import { AllEventsContent } from './AllEventsContent';
import { DateFilters } from './DateFilters';
import { RecommendedEventsSection } from './RecommendedEventsSection';

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
    city?: string;
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

function matchesEventQuery(event: Awaited<ReturnType<typeof listEvents>>['data'][number], query: string): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;

  return [
    event.title,
    event.subtitle,
    event.description,
    event.longDescription,
    event.location,
    event.category,
    ...(event.tags ?? []),
  ]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .some((value) => value.toLocaleLowerCase().includes(needle));
}

function formatTodayParam(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default async function AllEventsPage({ searchParams }: AllEventsPageProps) {
  const t = await getTranslations('eventsCatalog');
  const { q, page, category, city, dateFrom, dateTo } = await searchParams;
  const query = q?.trim() ?? '';
  const selectedCategory = category?.trim() ?? '';
  const selectedCity = city?.trim() ?? '';
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
  const usesBackendCityFilter = selectedCity.length > 0;
  const needsLocalQueryFilter = usesBackendCityFilter && query.length > 0;
  const requestLimit = usesBackendCityFilter ? 500 : PER_PAGE;
  const requestPage = usesBackendCityFilter ? 1 : currentPage;
  const requestQuery = usesBackendCityFilter ? selectedCity : query;

  const [eventsResult, categories, homepageContent] = await Promise.all([
    listEvents(
      {
        q: requestQuery || undefined,
        category: selectedCategory || undefined,
        dateFrom: normalizedDateFrom || todayParam,
        dateTo: effectiveDateTo || undefined,
        page: requestPage,
        limit: requestLimit,
        sort: 'date_asc',
      },
      buildContentFetchInit(AbortSignal.timeout(FETCH_TIMEOUT_MS)),
    )
      .then((response) => ({ response, validationError: null as string | null }))
      .catch((error: unknown) => {
        if (error instanceof ApiRequestError && error.code === 'VALIDATION_ERROR') {
          return { response: null, validationError: error.message };
        }
        throw error;
      }),
    getEventCategories(buildContentFetchInit(AbortSignal.timeout(FETCH_TIMEOUT_MS))),
    getHomepageContent(buildContentFetchInit(AbortSignal.timeout(FETCH_TIMEOUT_MS))).catch(() => ({
      featuredEvents: [],
      posterEvents: [],
      recommendedEvents: [],
    })),
  ]);

  const allEvents = eventsResult.response?.data ?? [];
  const filteredEvents = needsLocalQueryFilter
    ? allEvents.filter((event) => matchesEventQuery(event, query))
    : allEvents;
  const filteredTotal = filteredEvents.length;
  const filteredTotalPages = Math.max(1, Math.ceil(filteredTotal / PER_PAGE));
  const resolvedPage = usesBackendCityFilter ? Math.min(currentPage, filteredTotalPages) : currentPage;
  const pageSliceStart = (resolvedPage - 1) * PER_PAGE;
  const pageEvents = usesBackendCityFilter
    ? filteredEvents.slice(pageSliceStart, pageSliceStart + PER_PAGE)
    : allEvents;
  const meta = usesBackendCityFilter
    ? {
      page: resolvedPage,
      limit: PER_PAGE,
      total: filteredTotal,
      totalPages: filteredTotalPages,
    }
    : (eventsResult.response?.meta ?? DEFAULT_EVENTS_META);
  const validationError = eventsResult.validationError;

  function buildCatalogUrl(nextCategory?: string, includeDateRange = true): string {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (nextCategory) params.set('category', nextCategory);
    if (selectedCity) params.set('city', selectedCity);
    if (includeDateRange && selectedDateFrom && normalizedDateFrom) params.set('dateFrom', normalizedDateFrom);
    if (includeDateRange && selectedDateTo && effectiveDateTo) params.set('dateTo', effectiveDateTo);
    const qs = params.toString();
    return qs ? `/events?${qs}` : '/events';
  }

  return (
    <div className="pt-32 pb-20 px-[var(--ds-page-gutter)]">
      <div className="max-w-[80rem] mx-auto">
        <header className="mb-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="ds-label-sm text-[var(--ds-primary)] block mb-4 tracking-[0.3em]">
                {t('catalogLabel')}
              </span>
              <h1 className="ds-display-lg font-extrabold tracking-tighter text-[var(--ds-on-surface)]">
                {t('allEventsTitle')}
              </h1>
              {(query || selectedCity) && (
                <p className="ds-body-md text-[var(--ds-on-surface-variant)] mt-4">
                  {query ? `${t('searchResultsPrefix')} «${query}» — ` : ''}
                  {t('searchResultsEvents', { count: meta.total })}
                </p>
              )}
            </div>

            <div className="lg:flex lg:justify-end lg:self-end">
              <DateFilters
                query={query}
                selectedCategory={selectedCategory}
                selectedCity={selectedCity}
                dateFrom={selectedDateFrom ? normalizedDateFrom : ''}
                dateTo={selectedDateTo ? effectiveDateTo : ''}
                validationError={validationError}
              />
            </div>
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

        <RecommendedEventsSection events={homepageContent.recommendedEvents} />

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
