import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Filters from '../components/Filters';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../context/ProductContext';
import { useFilteredProducts } from '../hooks/useFilteredProducts';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

export const KidsPage: React.FC = () => {
  const { products } = useProducts();
  const kidsProducts = products.filter((p) => p.ageGroup === 'kids');
  const { filters, setFilters, sortBy, setSortBy, filteredProducts, resetFilters } =
    useFilteredProducts(kidsProducts, 'kids');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header currentCategory="kids" />

      {/* Editorial Header Banner */}
      <section className="bg-gradient-to-r from-[#E84D3D] to-[#F16556] text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/5 rounded-full blur-xl pointer-events-none -ml-16 -mb-16" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#F5BE38]" />
                <span>Ages 0 to 10 Years</span>
              </div>
              <h1 className="font-handwritten text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-3">
                Little Loom Kids
              </h1>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                Joyful silhouettes crafted from breathable, hypoallergenic combed Pakistani cotton. Designed to withstand every sandbox escapade, birthday party, and cozy afternoon nap.
              </p>
            </div>

            {/* Switch to Juniors shortcut */}
            <div className="shrink-0">
              <Link
                to="/juniors"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/30"
              >
                <span>Explore Juniors (11–16Y)</span>
                <ArrowRight className="w-4 h-4 text-[#F5BE38]" />
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
          <span className="text-neutral-900 font-semibold">Little Loom Kids</span>
        </nav>

        {/* Filters and Sorting Bar */}
        <Filters
          filters={filters}
          onFilterChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredProducts.length}
          fixedAgeGroup="kids"
        />

        {/* Product Grid */}
        <ProductGrid products={filteredProducts} onResetFilters={resetFilters} />
      </main>

      <Footer />
    </div>
  );
};

export default KidsPage;
