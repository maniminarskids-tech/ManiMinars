import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Truck,
  Tag,
  ShieldCheck,
  ChevronLeft,
  MessageCircle,
} from 'lucide-react';
import { buildCartWhatsAppUrl } from '../utils/whatsapp';
import { FALLBACK_GARMENT_IMAGE } from '../context/ProductContext';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    total,
    discount,
    promoCode,
    applyPromoCode,
    removePromoCode,
    freeShippingThreshold,
    remainingForFreeShipping,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const navigate = useNavigate();

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMsg({ text: res.message, isError: !res.success });
    if (res.success) setPromoInput('');
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between mb-6">
          <nav className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
            <Link to="/" className="hover:text-neutral-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">Shopping Bag</span>
          </nav>

          <Link
            to="/kids"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Continue Browsing</span>
          </Link>
        </div>

        <h1 className="font-logo font-bold text-2xl sm:text-3xl text-neutral-900 mb-6">
          Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 max-w-xl mx-auto my-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-logo font-bold text-xl text-neutral-900 mb-2">
              Your shopping bag is completely empty
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mb-6 max-w-sm mx-auto leading-relaxed">
              Looks like you haven't added any Little Loom pieces yet. Browse our soft organic cotton sets and junior streetwear!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/kids"
                className="px-6 py-3 rounded-xl bg-[#E84D3D] hover:bg-[#DF3E2E] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Explore Kids (0–10Y)
              </Link>
              <Link
                to="/juniors"
                className="px-6 py-3 rounded-xl bg-[#F5BE38] hover:bg-[#E8B029] text-neutral-900 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Explore Juniors (11–16Y)
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List (7 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Nationwide Free Shipping Progress Banner */}
              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 mb-2">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#E84D3D]" />
                    {remainingForFreeShipping > 0 ? (
                      <span>
                        Add <strong className="text-[#E84D3D]">PKR {remainingForFreeShipping.toLocaleString()}</strong> more to get <strong>FREE Pakistan Delivery</strong>
                      </span>
                    ) : (
                      <span className="text-green-600 font-bold">
                        Congratulations! You have unlocked FREE Nationwide Shipping 🎉
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-neutral-400">{freeShippingProgress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E84D3D] to-[#F5BE38] rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items Table / Cards */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 divide-y divide-neutral-100 overflow-hidden shadow-xs">
                {cart.map((item) => {
                  const itemImage =
                    item.product.colors?.find((c) => c.name === item.selectedColor?.name)?.image ||
                    item.product.images?.[0] ||
                    FALLBACK_GARMENT_IMAGE;

                  return (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Thumbnail */}
                    <img
                      src={itemImage}
                      alt={item.product.name}
                      className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-xl bg-neutral-100 shrink-0 border border-neutral-100"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src !== FALLBACK_GARMENT_IMAGE) {
                          target.src = FALLBACK_GARMENT_IMAGE;
                        }
                      }}
                    />

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-semibold text-sm sm:text-base text-neutral-900 hover:text-[#E84D3D] transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{item.product.tagline}</p>

                      <div className="flex items-center gap-3 text-xs text-neutral-600 mt-2">
                        <span className="bg-neutral-100 px-2.5 py-0.5 rounded-md font-semibold text-neutral-800">
                          Size: {item.selectedSize}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <span
                            className="w-3 h-3 rounded-full border border-neutral-300"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span>{item.selectedColor.name}</span>
                        </span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center border border-neutral-200 rounded-xl bg-white p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-50 rounded-lg"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-50 rounded-lg"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total item price */}
                    <div className="text-right sm:min-w-[120px]">
                      <span className="text-base font-bold text-neutral-900">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[11px] text-neutral-400">
                          PKR {item.price.toLocaleString()} each
                        </p>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from bag"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={clearCart}
                  className="text-xs text-neutral-400 hover:text-red-600 transition-colors"
                >
                  Clear Entire Bag
                </button>
                <span className="text-xs text-neutral-500">
                  Secure 256-bit checkout • Authentic Pakistani Kidswear
                </span>
              </div>
            </div>

            {/* Order Summary (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-5">
              <h2 className="font-logo font-bold text-lg text-neutral-900 pb-3 border-b border-neutral-100">
                Order Summary
              </h2>

              {/* Shipping Tier Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Shipping Method (Pakistan)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const { setShippingTier } = useCart();
                      setShippingTier('standard');
                    }}
                    className="p-3 rounded-xl border text-left transition-all border-neutral-900 bg-neutral-50/50"
                  >
                    <p className="font-bold text-neutral-900">Standard</p>
                    <p className="text-[11px] text-neutral-500">2–4 business days</p>
                    <p className="text-[11px] font-semibold text-[#E84D3D] mt-1">
                      {subtotal >= freeShippingThreshold ? 'FREE' : 'PKR 250'}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const { setShippingTier } = useCart();
                      setShippingTier('express');
                    }}
                    className="p-3 rounded-xl border text-left transition-all border-neutral-200 hover:border-neutral-300"
                  >
                    <p className="font-bold text-neutral-900">Express Air</p>
                    <p className="text-[11px] text-neutral-500">1–2 business days</p>
                    <p className="text-[11px] font-semibold text-neutral-900 mt-1">
                      {subtotal >= freeShippingThreshold ? 'PKR 200 (Subsidized)' : 'PKR 450'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Promo Code Input & Popular Chips */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                  Promo / Coupon Code
                </label>
                {promoCode ? (
                  <div className="flex items-center justify-between bg-green-50 text-green-800 text-xs px-3 py-2.5 rounded-xl border border-green-200 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-green-600" />
                      {promoCode} applied
                    </span>
                    <button
                      onClick={removePromoCode}
                      className="text-red-500 hover:text-red-700 underline text-xs cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <form onSubmit={handleApply} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. MANI10"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="flex-1 text-xs uppercase px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D] focus:border-transparent"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['MANI10', 'WELCOME500', 'LITTLELOOM'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            const res = applyPromoCode(c);
                            setPromoMsg({ text: res.message, isError: !res.success });
                          }}
                          className="text-[10px] px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-mono font-medium transition-colors cursor-pointer"
                        >
                          Use {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {promoMsg && (
                  <p
                    className={`text-[11px] mt-1.5 ${
                      promoMsg.isError ? 'text-red-500' : 'text-green-600'
                    }`}
                  >
                    {promoMsg.text}
                  </p>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2.5 text-xs sm:text-sm border-t border-neutral-100 pt-4">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    PKR {subtotal.toLocaleString()}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-PKR {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Estimated Delivery</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      `PKR ${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold text-neutral-900 pt-3 border-t border-neutral-100">
                  <span>Total Payable</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                id="proceed-to-checkout-btn"
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 px-6 rounded-xl bg-[#1E1E1E] hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Direct WhatsApp Contact CTA */}
              <a
                id="whatsapp-cart-order-btn"
                href={buildCartWhatsAppUrl(cart, total, deliveryFee)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Contact Us</span>
              </a>

              <div className="p-3 bg-neutral-50 rounded-xl text-center text-xs text-neutral-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Fast nationwide delivery across Pakistan</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
