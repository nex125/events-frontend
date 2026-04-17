'use client';

import type { Venue } from '@nex125/seatmap-core';
import { DEFAULT_CURRENCY, resolveLocaleTag } from '@/lib/i18n/config';
import { getEffectiveCategoryPrice, shouldShowCategoryPricesInLegend } from '@/lib/seatmapLegend';

interface SeatmapLegendProps {
  venue: Venue;
  title: string;
  currency?: string;
  className?: string;
}

export function SeatmapLegend({ venue, title, currency = DEFAULT_CURRENCY, className }: SeatmapLegendProps) {
  const locale = resolveLocaleTag();
  const showCategoryPrices = shouldShowCategoryPricesInLegend(venue);
  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);

  if (venue.categories.length === 0) {
    return null;
  }

  return (
    <aside className={className}>
      <div className="font-semibold mb-1.5 md:mb-2">{title}</div>
      <div>
        {venue.categories.map((category) => {
          const effectivePrice = getEffectiveCategoryPrice(category);
          const label = showCategoryPrices && effectivePrice !== null
            ? `${category.name} · ${formatPrice(effectivePrice)}`
            : category.name;

          return (
            <div key={category.id} className="flex items-center gap-1.5 mb-0.5 md:mb-1">
              <span className="inline-block h-2 w-2 rounded-[2px] md:h-2.5 md:w-2.5" style={{ background: category.color }} />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
