import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useProducts, FALLBACK_GARMENT_IMAGE } from '../context/ProductContext';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const matched = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
    setResults(matched);
  }, [query, products]);

  if (!isOpen) return null;

  const handleSelectProduct = (productId: string) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  const trendingTags = ['Everyday Cotton Set', 'Varsity Jacket', 'Bloom Frock', 'Denim', 'Hoodie'];

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 md:p-10 transition-opacity"
      onClick={onClose}
    >
      <div
        id="search-modal-content"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-neutral-100 mt-12 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search kids, juniors, hoodies, sets, frocks..."
            className="w-full text-base sm:text-lg outline-none bg-transparent text-neutral-900 placeholder:text-neutral-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs uppercase font-semibold text-neutral-500 hover:text-neutral-800 px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 ml-2"
          >
            Esc
          </button>
        </div>

        {/* Trending or Results */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {!query ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F5BE38]" />
                Trending Collections
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {trendingTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Quick Navigation
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/kids');
                    }}
                    className="p-3 rounded-xl bg-orange-50/60 hover:bg-orange-50 text-left flex items-center justify-between"
                  >
                    <span className="font-semibold text-neutral-800">Little Loom Kids (0-10Y)</span>
                    <ArrowRight className="w-4 h-4 text-[#E84D3D]" />
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/juniors');
                    }}
                    className="p-3 rounded-xl bg-yellow-50/60 hover:bg-yellow-50 text-left flex items-center justify-between"
                  >
                    <span className="font-semibold text-neutral-800">Little Loom Juniors (11-16Y)</span>
                    <ArrowRight className="w-4 h-4 text-[#F5BE38]" />
                  </button>
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-neutral-500 mb-2">
                Found {results.length} result{results.length > 1 ? 's' : ''}
              </p>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product.id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors border border-transparent hover:border-neutral-200"
                >
                  <img
                    src={product.colors?.[0]?.image || product.images?.[0] || FALLBACK_GARMENT_IMAGE}
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded-lg bg-neutral-100 shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src !== FALLBACK_GARMENT_IMAGE) {
                        target.src = FALLBACK_GARMENT_IMAGE;
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-neutral-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-neutral-500 truncate">{product.tagline}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-neutral-900">
                        PKR {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[11px] text-neutral-400 line-through">
                          PKR {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-neutral-100 text-neutral-600">
                    {product.ageGroup === 'kids' ? 'Kids' : 'Juniors'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400">
              <p className="text-sm font-medium">No clothes found for "{query}"</p>
              <p className="text-xs mt-1 text-neutral-400">Try searching "Cotton", "Dress", or "Jacket"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
