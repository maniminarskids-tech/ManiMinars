import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { FALLBACK_GARMENT_IMAGE } from '../context/ProductContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickAddSuccess, setQuickAddSuccess] = useState(false);

  const activeColor = product.colors[selectedColorIndex] || product.colors[0];
  const activeImage = activeColor?.image || product.images[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickAdding(true);

    // Default to first available size
    const defaultSize = product.sizes[0] || 'Standard';
    addToCart(product, defaultSize, {
      name: activeColor.name,
      hex: activeColor.hex,
    });

    setQuickAddSuccess(true);
    setTimeout(() => {
      setQuickAddSuccess(false);
      setIsQuickAdding(false);
    }, 1200);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-white rounded-2xl p-2.5 sm:p-3 border border-neutral-200/60 hover:border-neutral-300 hover:shadow-md transition-all duration-200"
    >
      {/* Image Container with Badges & Hover Quick Add */}
      <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100 mb-3">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={activeImage}
            alt={`${product.name} in ${activeColor.name}`}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (target.src !== FALLBACK_GARMENT_IMAGE) {
                target.src = FALLBACK_GARMENT_IMAGE;
              }
            }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isSale && (
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E84D3D] text-white shadow-sm">
              Sale
            </span>
          )}
          {product.isNew && (
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F5BE38] text-neutral-900 shadow-sm">
              New Drop
            </span>
          )}
        </div>

        {/* Age group tag */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-neutral-700 shadow-xs">
            {product.ageGroup === 'kids' ? '0–10Y' : '11–16Y'}
          </span>
        </div>

        {/* Quick Add Overlay on Hover (Desktop) */}
        <div className="absolute inset-x-2.5 bottom-2.5 hidden sm:flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-20">
          <button
            onClick={handleQuickAdd}
            disabled={isQuickAdding}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-all ${
              quickAddSuccess
                ? 'bg-green-600 text-white'
                : 'bg-[#1E1E1E] hover:bg-black text-white'
            }`}
            aria-label={`Quick add ${product.name} to bag`}
          >
            {quickAddSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add ({product.sizes[0]})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1">
        {/* Color Swatches */}
        <div className="flex items-center gap-1.5 mb-2">
          {product.colors.map((color, idx) => (
            <button
              key={color.name}
              onClick={(e) => {
                e.preventDefault();
                setSelectedColorIndex(idx);
              }}
              className={`w-4 h-4 rounded-full border transition-all ${
                selectedColorIndex === idx
                  ? 'ring-2 ring-[#1E1E1E] ring-offset-1 scale-110'
                  : 'border-neutral-300 hover:scale-105'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Select color ${color.name}`}
            />
          ))}
          {product.colors.length > 1 && (
            <span className="text-[10px] text-neutral-400 font-medium ml-1">
              {product.colors.length} shades
            </span>
          )}
        </div>

        {/* Title */}
        <Link
          to={`/product/${product.id}`}
          className="font-semibold text-sm text-neutral-900 hover:text-[#E84D3D] transition-colors line-clamp-1 mb-0.5"
        >
          {product.name}
        </Link>

        {/* Tagline */}
        <p className="text-xs text-neutral-500 line-clamp-1 mb-2 font-normal">
          {product.tagline}
        </p>

        {/* Price and Mobile Action */}
        <div className="mt-auto pt-1 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm sm:text-base text-neutral-900">
              PKR {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-neutral-400 line-through">
                PKR {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Mobile Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            className="sm:hidden p-2 rounded-lg bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors"
            aria-label="Quick add"
          >
            {quickAddSuccess ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
