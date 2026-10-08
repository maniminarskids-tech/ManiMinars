import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading: propIsLoading,
  onResetFilters,
}) => {
  // If isLoading is passed as prop, prioritize it; otherwise fallback to global ProductContext isLoading
  const { isLoading: contextIsLoading } = useProducts();
  const effectiveIsLoading = propIsLoading !== undefined ? propIsLoading : contextIsLoading;

  // 1. While products are loading from Supabase, show product skeleton cards
  if (effectiveIsLoading) {
    return (
      <div className="space-y-4">
        {/* Subtle loading indicator header */}
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-neutral-400 font-medium animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E84D3D]" />
          <span>Fetching handcrafted catalog...</span>
        </div>

        {/* 8 Realistic Skeleton Product Cards */}
        <div
          id="product-grid-skeleton"
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-neutral-100 shadow-2xs animate-pulse flex flex-col justify-between"
            >
              {/* Image Skeleton */}
              <div className="aspect-[4/5] bg-neutral-200/80 rounded-xl mb-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              </div>

              {/* Swatches Skeleton */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="w-4 h-4 rounded-full bg-neutral-200" />
                <div className="w-4 h-4 rounded-full bg-neutral-200" />
                <div className="w-4 h-4 rounded-full bg-neutral-200" />
              </div>

              {/* Title & Tagline Skeleton */}
              <div className="space-y-1.5 mb-3">
                <div className="h-4 bg-neutral-200 rounded-md w-4/5" />
                <div className="h-3 bg-neutral-100 rounded-md w-3/5" />
              </div>

              {/* Price & Rating Skeleton */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <div className="h-4 bg-neutral-200 rounded-md w-1/3" />
                <div className="h-3 bg-neutral-100 rounded-md w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Only show "No matches found" when loading is finished AND products.length === 0
  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-2xl border border-neutral-100 my-4 shadow-2xs">
        <div className="w-14 h-14 rounded-full bg-orange-50 text-[#E84D3D] flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="font-logo font-bold text-lg text-neutral-900 mb-1">
          No matches found for your filter
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5 leading-relaxed">
          Try loosening your size or category selection to explore other everyday essentials.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E1E1E] text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  // 3. Render active products catalog
  return (
    <div
      id="product-grid"
      className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
