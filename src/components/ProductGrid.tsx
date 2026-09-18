import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { Sparkles, RefreshCw } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-3 border border-neutral-100 animate-pulse space-y-3"
          >
            <div className="aspect-[4/5] bg-neutral-200 rounded-xl" />
            <div className="h-4 bg-neutral-200 rounded w-3/4" />
            <div className="h-3 bg-neutral-200 rounded w-1/2" />
            <div className="h-5 bg-neutral-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-2xl border border-neutral-100 my-4">
        <div className="w-14 h-14 rounded-full bg-orange-50 text-[#E84D3D] flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="font-logo font-bold text-lg text-neutral-900 mb-1">
          No matches found for your filter
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5">
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
