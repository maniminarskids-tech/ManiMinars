import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Filters from '../components/Filters';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../context/ProductContext';
import { useFilteredProducts } from '../hooks/useFilteredProducts';
import { Sparkles } from 'lucide-react';

export const NewArrivalsPage: React.FC = () => {
  const { products } = useProducts();
  const newProducts = products.filter((p) => p.isNew);
  const { filters, setFilters, sortBy, setSortBy, filteredProducts, resetFilters } =
    useFilteredProducts(newProducts);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header />

      {/* Editorial Header Banner */}
      <section className="bg-neutral-900 text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-[#F5BE38] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Seasonal Drops</span>
          </div>
          <h1 className="font-logo text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
            Fresh Arrivals
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-xl">
            The latest wardrobe additions across Little Loom Kids and Juniors. Soft combed waffle knits, breathable matching sets, and statement outerwear.
          </p>
        </div>
      </section>

      {/* Main Storefront Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-6 font-medium">
          <Link to="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">New Arrivals</span>
        </nav>

        <Filters
          filters={filters}
          onFilterChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredProducts.length}
        />

        <ProductGrid products={filteredProducts} onResetFilters={resetFilters} />
      </main>

      <Footer />
    </div>
  );
};

export default NewArrivalsPage;
