import { useState, useMemo } from 'react';
import { Product, FilterState, SortOption } from '../types';
import { PRICE_RANGES } from '../data/products';

export function useFilteredProducts(
  initialProducts: Product[],
  fixedAgeGroup?: 'kids' | 'juniors'
) {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    size: '',
    color: '',
    priceRange: 'all',
    ageGroup: fixedAgeGroup || 'all',
    searchQuery: '',
  });

  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by Age Group
    if (fixedAgeGroup) {
      result = result.filter((p) => p.ageGroup === fixedAgeGroup);
    } else if (filters.ageGroup && filters.ageGroup !== 'all') {
      result = result.filter((p) => p.ageGroup === filters.ageGroup);
    }

    // Filter by Category
    if (filters.category && filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }

    // Filter by Size
    if (filters.size) {
      result = result.filter((p) => p.sizes.includes(filters.size));
    }

    // Filter by Color
    if (filters.color) {
      result = result.filter((p) =>
        p.colors.some((c) => c.name.toLowerCase().includes(filters.color.toLowerCase()))
      );
    }

    // Filter by Price Range
    if (filters.priceRange && filters.priceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === filters.priceRange);
      if (range) {
        if (range.min !== undefined && range.max !== undefined) {
          result = result.filter((p) => p.price >= range.min! && p.price <= range.max!);
        } else if (range.min !== undefined) {
          result = result.filter((p) => p.price >= range.min!);
        } else if (range.max !== undefined) {
          result = result.filter((p) => p.price <= range.max!);
        }
      }
    }

    // Search Query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'featured':
      default:
        // Keep order or sort by rating
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [initialProducts, filters, sortBy, fixedAgeGroup]);

  return {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    filteredProducts,
    resetFilters: () =>
      setFilters({
        category: 'all',
        size: '',
        color: '',
        priceRange: 'all',
        ageGroup: fixedAgeGroup || 'all',
        searchQuery: '',
      }),
  };
}
