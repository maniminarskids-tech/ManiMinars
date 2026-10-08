import { Product } from '../types';

/**
 * Standard storefront categories in canonical display order
 */
export const STOREFRONT_CATEGORIES = [
  'casual-shirts',
  'pants',
  't-shirts',
  'cargo',
  'shorts',
  'tops',
  'sets',
  'jackets',
  'accessories',
] as const;

/**
 * Canonical category normalizer ensuring legacy alias values
 * match the exact 9 standard categories.
 */
export function normalizeProductCategory(category: string | undefined | null): string {
  if (!category) return 'sets';
  const lower = category.toLowerCase().trim();
  if (lower === 'hoodies-jackets') return 'jackets';
  if (lower === 'bottoms') return 'pants';
  if (lower === 'dresses' || lower === 'knitwear') return 'tops';
  return lower;
}

/**
 * Selects only the latest `limitPerCategory` (default 2) products for each category.
 * - Groups products by normalized category.
 * - Sorts products inside each category by created_at / createdAt descending (newest first).
 * - Takes up to `limitPerCategory` products per category.
 * - Merges and returns the preview products.
 */
export function getCategoryPreviewProducts(
  products: Product[],
  limitPerCategory: number = 2
): Product[] {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  // 1. Group products by normalized category
  const groups = new Map<string, Product[]>();
  for (const cat of STOREFRONT_CATEGORIES) {
    groups.set(cat, []);
  }

  for (const product of products) {
    const normalized = normalizeProductCategory(product.category);
    if (!groups.has(normalized)) {
      groups.set(normalized, []);
    }
    groups.get(normalized)!.push(product);
  }

  // 2. Sort inside each category by creation date descending (latest first)
  const previewProducts: Product[] = [];

  for (const cat of STOREFRONT_CATEGORIES) {
    const catProducts = groups.get(cat) || [];
    if (catProducts.length === 0) continue;

    catProducts.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      // Stable fallback: newer IDs first if timestamps match
      return String(b.id).localeCompare(String(a.id));
    });

    // 3. Take only the first `limitPerCategory` products
    const topItems = catProducts.slice(0, limitPerCategory);
    previewProducts.push(...topItems);
  }

  // Also catch any products with custom or unlisted categories if present
  for (const [cat, catProducts] of groups.entries()) {
    if ((STOREFRONT_CATEGORIES as readonly string[]).includes(cat)) continue;
    if (catProducts.length === 0) continue;

    catProducts.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    previewProducts.push(...catProducts.slice(0, limitPerCategory));
  }

  return previewProducts;
}
