import type { PricingCategory, Venue } from '@nex125/seatmap-core';

interface SeatmapLegendConfig {
  showCategoryPrices?: boolean;
}

type VenueWithLegendConfig = Venue & {
  legendConfig?: SeatmapLegendConfig;
};

export function getSeatmapLegendConfig(venue: Venue): SeatmapLegendConfig {
  const config = (venue as VenueWithLegendConfig).legendConfig;
  return config && typeof config === 'object' ? config : {};
}

export function shouldShowCategoryPricesInLegend(venue: Venue): boolean {
  return getSeatmapLegendConfig(venue).showCategoryPrices === true;
}

export function getEffectiveCategoryPrice(category: PricingCategory): number | null {
  if (category.isPriceOverridden && Number.isFinite(category.overriddenPrice)) {
    return category.overriddenPrice ?? null;
  }

  if (Number.isFinite(category.backendPrice)) {
    return category.backendPrice ?? null;
  }

  return null;
}
