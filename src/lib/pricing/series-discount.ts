// The curated "50 books" list (book_categories groups books.poster_number
// 1-50 into 9 named series, per the printed poster/order form) carries two
// bundle discounts: 5% off when an order has 2+ distinct titles from the
// same series, and 10% off when it has one of every book in the full set.
// Only books with both category_id and poster_number set participate —
// everything else in the catalog is unaffected.

export const SERIES_DISCOUNT_MULTIPLIER = 0.95; // 同一系列購買 → 95折
export const FULL_SET_DISCOUNT_MULTIPLIER = 0.9; // 整個系列（50本）購買 → 9折
export const SERIES_DISCOUNT_MIN_DISTINCT_TITLES = 2;

export type SeriesDiscountItem = {
  bookId: string;
  categoryId: string | null;
  posterNumber: number | null;
};

export type SeriesDiscountResult = {
  multiplier: number;
  label: string | null;
};

/** Given every item in an order/cart and the total number of active books in
 * the curated series (all 9 categories combined), returns each qualifying
 * book's discount multiplier and a short label explaining it. Books outside
 * the series (no category_id or poster_number) always get multiplier 1. */
export function computeSeriesDiscounts(
  items: SeriesDiscountItem[],
  totalSeriesBookCount: number,
): Map<string, SeriesDiscountResult> {
  const qualifying = items.filter((i) => i.categoryId != null && i.posterNumber != null);

  const distinctPosterNumbers = new Set(qualifying.map((i) => i.posterNumber));
  const isFullSet =
    totalSeriesBookCount > 0 && distinctPosterNumbers.size >= totalSeriesBookCount;

  const distinctBooksByCategory = new Map<string, Set<string>>();
  for (const item of qualifying) {
    const set = distinctBooksByCategory.get(item.categoryId!) ?? new Set<string>();
    set.add(item.bookId);
    distinctBooksByCategory.set(item.categoryId!, set);
  }

  const results = new Map<string, SeriesDiscountResult>();
  for (const item of items) {
    if (item.categoryId == null || item.posterNumber == null) {
      results.set(item.bookId, { multiplier: 1, label: null });
      continue;
    }
    if (isFullSet) {
      results.set(item.bookId, {
        multiplier: FULL_SET_DISCOUNT_MULTIPLIER,
        label: `全套${totalSeriesBookCount}本 9折`,
      });
      continue;
    }
    const distinctInCategory = distinctBooksByCategory.get(item.categoryId)?.size ?? 0;
    if (distinctInCategory >= SERIES_DISCOUNT_MIN_DISTINCT_TITLES) {
      results.set(item.bookId, { multiplier: SERIES_DISCOUNT_MULTIPLIER, label: "同系列 95折" });
      continue;
    }
    results.set(item.bookId, { multiplier: 1, label: null });
  }
  return results;
}
