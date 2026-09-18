import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { FALLBACK_GARMENT_IMAGE } from '../context/ProductContext';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // If the images array changes (e.g. user selected another color or switched products), reset index to 0
  useEffect(() => {
    setCurrentIndex(0);
    setIsZoomed(false);
  }, [images]);

  const validImages = images && images.length > 0 ? images : [FALLBACK_GARMENT_IMAGE];

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3 sm:gap-4">
      {/* Thumbnails (desktop left, mobile bottom) */}
      <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto shrink-0 pb-1 md:pb-0">
        {validImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
              currentIndex === idx
                ? 'border-[#1E1E1E] scale-95 shadow-sm'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
            aria-label={`View photo ${idx + 1} of ${productName}`}
          >
            <img
              src={img}
              alt={`${productName} view ${idx + 1}`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.src !== FALLBACK_GARMENT_IMAGE) {
                  target.src = FALLBACK_GARMENT_IMAGE;
                }
              }}
            />
          </button>
        ))}
      </div>

      {/* Main Large Display Image */}
      <div className="relative flex-1 aspect-[4/5] bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200/70 group">
        <img
          src={validImages[currentIndex] || validImages[0]}
          alt={`${productName} main view`}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (target.src !== FALLBACK_GARMENT_IMAGE) {
              target.src = FALLBACK_GARMENT_IMAGE;
            }
          }}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Zoom Hint */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-neutral-800 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
          title="Toggle Zoom"
          aria-label="Toggle Image Zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Navigation Arrows if more than 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-xs text-neutral-800 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-xs text-neutral-800 shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Counter Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
