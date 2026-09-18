import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductGallery from '../components/ProductGallery';
import SizeGuideModal from '../components/SizeGuideModal';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { buildProductWhatsAppUrl } from '../utils/whatsapp';
import {
  Star,
  Truck,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Check,
  ChevronDown,
  ShoppingBag,
  Heart,
  Share2,
  MessageCircle,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === id);

  // If not found, show error state
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <h2 className="font-logo font-bold text-2xl text-neutral-900 mb-2">Item Not Found</h2>
          <p className="text-sm text-neutral-500 mb-6">
            The piece you are looking for may have sold out or moved.
          </p>
          <button
            onClick={() => navigate('/kids')}
            className="px-6 py-3 rounded-xl bg-[#E84D3D] text-white text-xs font-bold uppercase tracking-wider"
          >
            Explore Kids Collection
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '');
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('shipping');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const currentColor = product.colors[selectedColorIndex] || product.colors[0];

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize, currentColor, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const toggleAccordion = (section: string) => {
    setExpandedAccordion(expandedAccordion === section ? null : section);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Related products from same ageGroup or category
  const relatedProducts = products
    .filter(
      (p) => p.id !== product.id && (p.ageGroup === product.ageGroup || p.category === product.category)
    )
    .slice(0, 4);

  // Active gallery images, putting selected color image first
  const activeGalleryImages = [
    currentColor?.image,
    ...(product.images || []),
    ...(product.colors || []).map((c) => c.image),
  ].filter(Boolean) as string[];
  const uniqueGalleryImages = Array.from(new Set(activeGalleryImages));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-6 font-medium">
          <Link to="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            to={product.ageGroup === 'kids' ? '/kids' : '/juniors'}
            className="hover:text-neutral-900 transition-colors"
          >
            {product.ageGroup === 'kids' ? 'Little Loom Kids' : 'Little Loom Juniors'}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-semibold truncate">{product.name}</span>
        </nav>

        {/* Product Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Left: Gallery (7 Cols on desktop) */}
          <div className="lg:col-span-7">
            <ProductGallery images={uniqueGalleryImages} productName={product.name} />
          </div>

          {/* Right: Actions & Buying Box (5 Cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Badges & Rating */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                  {product.ageGroup === 'kids' ? 'Kids (0–10Y)' : 'Juniors (11–16Y)'}
                </span>
                {product.isSale && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-[#E84D3D]">
                    Sale Event
                  </span>
                )}
              </div>

              {/* Rating stars */}
              <div className="flex items-center gap-1 text-xs text-neutral-600">
                <div className="flex text-[#F5BE38]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-semibold text-neutral-900">({product.reviewCount})</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-logo font-bold text-2xl sm:text-3xl text-neutral-900 leading-snug mb-2">
              {product.name}
            </h1>

            {/* Tagline */}
            <p className="text-xs sm:text-sm text-neutral-500 mb-4">{product.tagline}</p>

            {/* Price block */}
            <div className="flex items-baseline gap-3 p-3.5 rounded-2xl bg-white border border-neutral-200/80 mb-6">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-900">
                PKR {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-sm sm:text-base text-neutral-400 line-through">
                    PKR {product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-[#E84D3D] bg-red-50 px-2 py-0.5 rounded-md">
                    Save PKR {(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Color Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Color Shade: <strong className="text-neutral-900">{currentColor.name}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {product.colors.map((color, idx) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColorIndex === idx
                        ? 'border-[#1E1E1E] scale-110 shadow-sm ring-2 ring-neutral-300 ring-offset-2'
                        : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={`Select color ${color.name}`}
                  >
                    {selectedColorIndex === idx && (
                      <Check className="w-4 h-4 text-white drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Select Age / Size:
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-[#E84D3D] hover:underline font-semibold"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center border ${
                      selectedSize === sz
                        ? 'border-[#1E1E1E] bg-[#1E1E1E] text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Bag */}
            <div className="flex items-center gap-3 mb-6">
              {/* Quantity Changer */}
              <div className="flex items-center border border-neutral-300 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm font-bold"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-9 text-center text-sm font-bold text-neutral-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded-lg text-sm font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Bag CTA */}
              <button
                id="add-to-bag-cta-btn"
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#1E1E1E] hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 transition-colors"
                title="Share link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            {/* DIRECT WHATSAPP ORDER BUTTON */}
            <a
              id="whatsapp-direct-order-btn"
              href={buildProductWhatsAppUrl(product, selectedSize, currentColor.name, quantity)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mb-6 py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Direct WhatsApp Order (COD)</span>
            </a>

            {/* Key Delivery Perks */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-100/70 rounded-xl mb-6 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E84D3D]" />
                <span>Nationwide Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7E9F85]" />
                <span>Cash on Delivery</span>
              </div>
            </div>

            {/* Accordion Sections: Description, Fabric, Shipping & Returns */}
            <div className="border-t border-neutral-200 divide-y divide-neutral-200">
              {/* Description */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('desc')}
                  className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-800"
                >
                  <span>Description & Fit Details</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedAccordion === 'desc' ? 'rotate-180 text-neutral-900' : 'text-neutral-400'
                    }`}
                  />
                </button>
                {expandedAccordion === 'desc' && (
                  <div className="pt-3 text-xs text-neutral-600 space-y-2 leading-relaxed">
                    <p>{product.description}</p>
                    <ul className="list-disc pl-4 space-y-1 pt-1 text-neutral-700">
                      {product.details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Fabric & Care */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('fabric')}
                  className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-800"
                >
                  <span>Fabric & Gentle Care</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedAccordion === 'fabric' ? 'rotate-180 text-neutral-900' : 'text-neutral-400'
                    }`}
                  />
                </button>
                {expandedAccordion === 'fabric' && (
                  <div className="pt-3 text-xs text-neutral-600 space-y-2 leading-relaxed">
                    <p>
                      <strong>Material:</strong> {product.fabric}
                    </p>
                    <p>
                      • Machine wash cold on gentle cycle with like colors.<br />
                      • Do not bleach or tumble dry high to protect natural cotton fibers.<br />
                      • Warm iron inside-out if required.
                    </p>
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-neutral-800"
                >
                  <span>Shipping Across Pakistan & 14-Day Exchange</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedAccordion === 'shipping' ? 'rotate-180 text-neutral-900' : 'text-neutral-400'
                    }`}
                  />
                </button>
                {expandedAccordion === 'shipping' && (
                  <div className="pt-3 text-xs text-neutral-600 space-y-2 leading-relaxed">
                    <p>
                      • <strong>Delivery Time:</strong> 2 to 4 working days for major cities (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad) and 3 to 5 days for other nationwide locations.
                    </p>
                    <p>
                      • <strong>Couriers:</strong> Shipped reliably via Trax Logistics, Call Courier, and TCS.
                    </p>
                    <p>
                      • <strong>Hassle-Free Returns:</strong> 14-day exchange window on unworn garments with tags attached. Contact our WhatsApp care helpline at{' '}
                      <a
                        href="https://wa.me/923046466815"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-neutral-900 font-bold hover:text-[#E84D3D]"
                      >
                        +923046466815
                      </a>
                      .
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="pt-8 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-logo font-bold text-xl text-neutral-900">
                You May Also Adore
              </h3>
              <Link
                to={product.ageGroup === 'kids' ? '/kids' : '/juniors'}
                className="text-xs font-semibold text-[#E84D3D] hover:underline"
              >
                View Full Line
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sizing Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        ageGroup={product.ageGroup}
      />

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
