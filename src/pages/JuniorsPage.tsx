import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Filters from '../components/Filters';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../context/ProductContext';
import { useFilteredProducts } from '../hooks/useFilteredProducts';
import { ArrowRight, Zap } from 'lucide-react';

export const JuniorsPage: React.FC = () => {
  const { products } = useProducts();
  const juniorsProducts = products.filter((p) => p.ageGroup === 'juniors');
  const { filters, setFilters, sortBy, setSortBy, filteredProducts, resetFilters } =
    useFilteredProducts(juniorsProducts, 'juniors');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header currentCategory="juniors" />

      {/* Editorial Header Banner */}
      <section className="bg-gradient-to-r from-[#F5BE38] to-[#F3B322] text-[#1E1E1E] py-12 md:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-black/5 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/20 rounded-full blur-xl pointer-events-none -ml-16 -mb-16" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
                <Zap className="w-3.5 h-3.5 text-[#1E1E1E]" />
                <span>Ages 11 to 16 Years</span>
              </div>
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black tracking-wider text-[#1E1E1E] uppercase mb-3 leading-none">
                Little Loom Juniors
              </h1>
              <p className="text-neutral-900/90 text-sm sm:text-base leading-relaxed">
                Elevated streetwear for older kids and teenagers. Classic varsity bombers, heavyweight tees, relaxed utility cargo pants, and transitional flannel overshirts built for self-expression.
              </p>
            </div>

            {/* Switch to Kids shortcut */}
            <div className="shrink-0">
              <Link
                to="/kids"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-md text-[#1E1E1E] text-xs font-bold uppercase tracking-wider transition-all border border-black/15"
              >
                <span>Explore Kids (0–10Y)</span>
                <ArrowRight className="w-4 h-4 text-[#E84D3D]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Storefront Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-6 font-medium">
          <Link to="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">Little Loom Juniors</span>
        </nav>

        {/* Filters and Sorting Bar */}
        <Filters
          filters={filters}
          onFilterChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredProducts.length}
          fixedAgeGroup="juniors"
        />

        {/* Product Grid */}
        <ProductGrid products={filteredProducts} onResetFilters={resetFilters} />
      </main>

      <Footer />
    </div>
  );
};

export default JuniorsPage;
