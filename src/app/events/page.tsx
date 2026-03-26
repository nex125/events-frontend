import { Suspense } from 'react';
import { getAllEvents } from '@/data/events';
import { searchEvents } from '@/lib/search';
import { AllEventsContent } from './AllEventsContent';

interface AllEventsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export const metadata = {
  title: 'Все события | Ticketok',
  description: 'Каталог всех событий на Ticketok',
};

const PER_PAGE = 6;

export default async function AllEventsPage({ searchParams }: AllEventsPageProps) {
  const { q, page } = await searchParams;
  const query = q ?? '';
  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1);

  const allEvents = getAllEvents();
  const filtered = query ? searchEvents(allEvents, query) : allEvents;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageEvents = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div className="pt-32 pb-20 px-[var(--ds-page-gutter)]">
      <div className="max-w-[80rem] mx-auto">
        <header className="mb-16">
          <span className="ds-label-sm text-[var(--ds-primary)] block mb-4 tracking-[0.3em]">
            Каталог
          </span>
          <h1 className="ds-display-lg font-extrabold tracking-tighter text-[var(--ds-on-surface)]">
            Все события
          </h1>
          {query && (
            <p className="ds-body-md text-[var(--ds-on-surface-variant)] mt-4">
              Результаты поиска: «{query}» — {filtered.length}{' '}
              {filtered.length === 1 ? 'событие' : 'событий'}
            </p>
          )}
        </header>

        <Suspense>
          <AllEventsContent
            events={pageEvents}
            totalPages={totalPages}
            currentPage={safePage}
          />
        </Suspense>
      </div>
    </div>
  );
}
