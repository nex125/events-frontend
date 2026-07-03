import { Suspense } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ApiRequestError, getEventCategories, getHomepageContent, listEvents } from '@/lib/api';
import { buildContentFetchInit } from '@/lib/fetchPolicy';
import { AllEventsContent } from './AllEventsContent';
import { DateFilters } from './DateFilters';
import { RecommendedEventsSection } from './RecommendedEventsSection';

const FETCH_TIMEOUT_MS = 8000;
const PER_PAGE = 6;
const DEFAULT_EVENTS_META = {
  page: 1,
  limit: PER_PAGE,
  total: 0,
  totalPages: 1,
};

export interface CatalogSearchParams {
  q?: string;
  page?: string;
  category?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface CatalogEventsPageProps {
  searchParams: Promise<CatalogSearchParams>;
  basePath: '/events' | '/search';
  titleKey?: 'allEventsTitle' | 'searchTitle';
  defaultToUpcoming?: boolean;
}

function formatTodayParam(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function CatalogEventsPage({
  searchParams,
  basePath,
  titleKey = 'allEventsTitle',
  defaultToUpcoming = true,
}: CatalogEventsPageProps) {
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

  const [eventsResult, categories, homepageContent] = await Promise.all([
    listEvents(
      {
        q: query || undefined,
        city: selectedCity || undefined,
        category: selectedCategory || undefined,
        dateFrom: normalizedDateFrom || (defaultToUpcoming ? todayParam : undefined),
        dateTo: effectiveDateTo || undefined,
        page: currentPage,
        limit: PER_PAGE,
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

  const events = eventsResult.response?.data ?? [];
  const meta = eventsResult.response?.meta ?? DEFAULT_EVENTS_META;
  const validationError = eventsResult.validationError;

  function buildCatalogUrl(nextCategory?: string): string {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (nextCategory) params.set('category', nextCategory);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedDateFrom && normalizedDateFrom) params.set('dateFrom', normalizedDateFrom);
    if (selectedDateTo && effectiveDateTo) params.set('dateTo', effectiveDateTo);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
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
                {t(titleKey)}
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
                basePath={basePath}
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

        <Suspense>
          <AllEventsContent
            events={events}
            totalPages={meta.totalPages}
            currentPage={meta.page}
          />
        </Suspense>

        <RecommendedEventsSection events={homepageContent.recommendedEvents} />
      </div>
    </div>
  );
}
