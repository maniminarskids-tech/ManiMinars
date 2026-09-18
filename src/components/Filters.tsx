import React, { useState } from 'react';
import { SlidersHorizontal, X, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { FilterState, SortOption } from '../types';
import { CATEGORIES, ALL_SIZES, ALL_COLORS, PRICE_RANGES } from '../data/products';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
  fixedAgeGroup?: 'kids' | 'juniors';
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  sortBy,
  onSortChange,
  totalResults,
  fixedAgeGroup,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleCategoryClick = (catId: string) => {
    onFilterChange({
      ...filters,
      category: filters.category === catId ? 'all' : catId,
    });
  };

  const handleSizeClick = (sz: string) => {
    onFilterChange({
      ...filters,
      size: filters.size === sz ? '' : sz,
    });
  };

  const handleColorClick = (colorName: string) => {
    onFilterChange({
      ...filters,
      color: filters.color === colorName ? '' : colorName,
    });
  };

  const handlePriceClick = (priceId: string) => {
    onFilterChange({
      ...filters,
      priceRange: filters.priceRange === priceId ? 'all' : priceId,
    });
  };

  const handleAgeClick = (age: string) => {
    if (fixedAgeGroup) return;
    onFilterChange({
      ...filters,
      ageGroup: filters.ageGroup === age ? 'all' : age,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      category: 'all',
      size: '',
      color: '',
      priceRange: 'all',
      ageGroup: fixedAgeGroup || 'all',
      searchQuery: '',
    });
  };

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.size !== '' ||
    filters.color !== '' ||
    filters.priceRange !== 'all' ||
    (!fixedAgeGroup && filters.ageGroup !== 'all');

  return (
    <div id="filters-container" className="mb-6 space-y-4">
      {/* Top Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200">
        {/* Left: Filter Toggle & Total count */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-filters-trigger"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#E84D3D]" />
            )}
          </button>

          <span className="text-xs text-neutral-500 font-medium">
            Showing <strong className="text-neutral-900">{totalResults}</strong> items
          </span>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="hidden lg:flex items-center gap-1 text-xs text-neutral-500 hover:text-[#E84D3D] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Right: Quick Sort */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-selector" className="text-xs text-neutral-500 font-medium">
            Sort by:
          </label>
          <div className="relative">
            <select
              id="sort-selector"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-400 cursor-pointer shadow-xs"
            >
              <option value="featured">Featured Picks</option>
              <option value="newest">Newest Drops</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Desktop Horizontal Category Pills */}
      <div className="hidden lg:flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = filters.category === cat.id || (cat.id === 'all' && (!filters.category || filters.category === 'all'));
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-[#1E1E1E] text-white shadow-xs'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-900'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Desktop Filter Row (Size, Color, Price) */}
      <div className="hidden lg:flex items-center justify-between gap-4 p-3.5 bg-white rounded-2xl border border-neutral-200/80">
        <div className="flex items-center gap-6">
          {/* Sizes */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
              Size:
            </span>
            <div className="flex items-center gap-1">
              {ALL_SIZES.slice(2, 9).map((sz) => (
                <button
                  key={sz}
                  onClick={() => handleSizeClick(sz)}
                  className={`text-[11px] px-2 py-1 rounded-md font-semibold transition-all ${
                    filters.size === sz
                      ? 'bg-[#E84D3D] text-white'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1.5 border-l border-neutral-200 pl-6">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
              Shades:
            </span>
            <div className="flex items-center gap-1.5">
              {ALL_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleColorClick(c.name)}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    filters.color === c.name
                      ? 'ring-2 ring-[#1E1E1E] ring-offset-1 scale-110'
                      : 'border-neutral-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-1.5 border-l border-neutral-200 pl-6">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
              Price:
            </span>
            <div className="flex items-center gap-1">
              {PRICE_RANGES.map((pr) => (
                <button
                  key={pr.id}
                  onClick={() => handlePriceClick(pr.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                    filters.priceRange === pr.id
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {pr.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!fixedAgeGroup && (
          <div className="flex items-center gap-1 border-l border-neutral-200 pl-4">
            <button
              onClick={() => handleAgeClick('kids')}
              className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all ${
                filters.ageGroup === 'kids'
                  ? 'bg-[#E84D3D] text-white'
                  : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              Kids 0–10Y
            </button>
            <button
              onClick={() => handleAgeClick('juniors')}
              className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all ${
                filters.ageGroup === 'juniors'
                  ? 'bg-[#F5BE38] text-neutral-900'
                  : 'bg-neutral-100 text-neutral-700'
              }`}
            >
              Juniors 11–16Y
            </button>
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-neutral-400">Active:</span>
          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full font-medium">
              Category: {filters.category}
              <button onClick={() => handleCategoryClick(filters.category)}>
                <X className="w-3 h-3 text-neutral-500 hover:text-black" />
              </button>
            </span>
          )}
          {filters.size && (
            <span className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full font-medium">
              Size: {filters.size}
              <button onClick={() => handleSizeClick(filters.size)}>
                <X className="w-3 h-3 text-neutral-500 hover:text-black" />
              </button>
            </span>
          )}
          {filters.color && (
            <span className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full font-medium">
              Color: {filters.color}
              <button onClick={() => handleColorClick(filters.color)}>
                <X className="w-3 h-3 text-neutral-500 hover:text-black" />
              </button>
            </span>
          )}
          {filters.priceRange !== 'all' && (
            <span className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full font-medium">
              Price: {PRICE_RANGES.find((p) => p.id === filters.priceRange)?.name}
              <button onClick={() => handlePriceClick(filters.priceRange)}>
                <X className="w-3 h-3 text-neutral-500 hover:text-black" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end lg:hidden"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="bg-white w-full max-w-xs h-full p-5 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
                <h3 className="font-logo font-bold text-lg text-neutral-900">Filter By</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Age Group */}
              {!fixedAgeGroup && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Age Group
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAgeClick('kids')}
                      className={`p-2 rounded-xl text-xs font-semibold ${
                        filters.ageGroup === 'kids'
                          ? 'bg-[#E84D3D] text-white'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      Kids (0–10Y)
                    </button>
                    <button
                      onClick={() => handleAgeClick('juniors')}
                      className={`p-2 rounded-xl text-xs font-semibold ${
                        filters.ageGroup === 'juniors'
                          ? 'bg-[#F5BE38] text-neutral-900'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      Juniors (11–16Y)
                    </button>
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Category
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                        filters.category === cat.id
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Sizes
                </h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {ALL_SIZES.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleSizeClick(sz)}
                      className={`text-xs py-1.5 rounded-lg font-medium text-center ${
                        filters.size === sz
                          ? 'bg-[#E84D3D] text-white'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Color Shade
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ALL_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => handleColorClick(c.name)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                        filters.color === c.name
                          ? 'ring-2 ring-black ring-offset-1 scale-110'
                          : 'border-neutral-300'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {filters.color === c.name && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-neutral-100 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-[#1E1E1E] text-white text-xs font-bold uppercase tracking-wider"
              >
                Apply Filters ({totalResults})
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
