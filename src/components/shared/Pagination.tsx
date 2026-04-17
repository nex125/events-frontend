'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@ds/utils/cn';
import { useCallback } from 'react';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const t = useTranslations('pagination');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams],
  );

  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav aria-label={t('navAriaLabel')} className="flex items-center justify-center gap-2 mt-16">
      <button
        disabled={currentPage <= 1}
        onClick={() => router.push(createUrl(currentPage - 1))}
        className={cn(
          'w-10 h-10 flex items-center justify-center rounded-[var(--ds-radius-functional)] transition-colors',
          currentPage <= 1
            ? 'text-[var(--ds-outline-variant)] cursor-not-allowed'
            : 'text-[var(--ds-on-surface-variant)] hover:bg-[var(--ds-surface-container-high)]',
        )}
        aria-label={t('previousPage')}
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => router.push(createUrl(page))}
          className={cn(
            'w-10 h-10 flex items-center justify-center rounded-[var(--ds-radius-pill)] ds-label transition-colors',
            page === currentPage
              ? 'ds-accent-primary'
              : 'text-[var(--ds-on-surface-variant)] hover:bg-[var(--ds-surface-container-high)]',
          )}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage >= totalPages}
        onClick={() => router.push(createUrl(currentPage + 1))}
        className={cn(
          'w-10 h-10 flex items-center justify-center rounded-[var(--ds-radius-functional)] transition-colors',
          currentPage >= totalPages
            ? 'text-[var(--ds-outline-variant)] cursor-not-allowed'
            : 'text-[var(--ds-on-surface-variant)] hover:bg-[var(--ds-surface-container-high)]',
        )}
        aria-label={t('nextPage')}
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
