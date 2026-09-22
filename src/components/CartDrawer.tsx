import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck, Tag, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { buildCartWhatsAppUrl } from '../utils/whatsapp';
import { FALLBACK_GARMENT_IMAGE } from '../context/ProductContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
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

  const [codeInputValue, setCodeInputValue] = React.useState('');
  const [promoMessage, setPromoMessage] = React.useState<{ text: string; isError: boolean } | null>(null);
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInputValue.trim()) return;
    const res = applyPromoCode(codeInputValue);
    setPromoMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setCodeInputValue('');
    }
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end transition-opacity duration-300"
      onClick={() => setIsCartDrawerOpen(false)}
    >
      <div
        id="cart-drawer-panel"
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-800" />
            <h3 className="font-logo font-bold text-lg text-neutral-900">Your Shopping Bag</h3>
            <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-semibold">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            id="close-cart-drawer-btn"
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-100">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#E84D3D]" />
              {remainingForFreeShipping > 0 ? (
                <>
                  Add <span className="text-[#E84D3D]">PKR {remainingForFreeShipping.toLocaleString()}</span> more for FREE Pakistan shipping!
                </>
              ) : (
                <span className="text-green-600 font-bold">You qualify for FREE nationwide delivery! 🎉</span>
              )}
            </span>
            <span className="text-[11px] text-neutral-400">{freeShippingProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E84D3D] to-[#F5BE38] transition-all duration-300 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Drawer Body - Items or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-neutral-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-logo font-bold text-lg text-neutral-800 mb-1">Your bag is empty</h4>
              <p className="text-xs text-neutral-500 max-w-[220px] mb-6">
                Explore Little Loom Kids and Juniors collections to find wardrobe favorites.
              </p>
              <div className="flex flex-col w-full gap-2.5">
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/kids');
                  }}
                  className="w-full py-3 rounded-xl bg-[#E84D3D] hover:bg-[#DF3E2E] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Shop Little Loom Kids (0–10Y)
                </button>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/juniors');
                  }}
                  className="w-full py-3 rounded-xl bg-[#F5BE38] hover:bg-[#E8B029] text-neutral-900 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Shop Little Loom Juniors (11–16Y)
                </button>
              </div>
            </div>
          ) : (
            cart.map((item) => {
              const itemImage =
                item.product.colors?.find((c) => c.name === item.selectedColor?.name)?.image ||
                item.product.images?.[0] ||
                FALLBACK_GARMENT_IMAGE;

              return (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                {/* Product Thumbnail */}
                <img
                  src={itemImage}
                  alt={item.product.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-neutral-100 shrink-0 border border-neutral-100"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== FALLBACK_GARMENT_IMAGE) {
                      target.src = FALLBACK_GARMENT_IMAGE;
                    }
                  }}
                />

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        to={`/product/${item.productId}`}
                        onClick={() => setIsCartDrawerOpen(false)}
                        className="font-semibold text-sm text-neutral-900 hover:text-[#E84D3D] transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                      <span className="font-medium bg-neutral-100 px-2 py-0.5 rounded">
                        Size: {item.selectedSize}
                      </span>
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        <span>{item.selectedColor.name}</span>
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <div className="flex items-center border border-neutral-200 rounded-lg bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-50 rounded-l-lg"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-neutral-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-50 rounded-r-lg"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-neutral-900">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-neutral-400">
                          PKR {item.price.toLocaleString()} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-100 bg-white space-y-3">
            {/* Promo Code Toggle & Quick Apply Chips */}
            <div>
              {promoCode ? (
                <div className="flex items-center justify-between bg-green-50 text-green-800 text-xs px-3 py-2 rounded-xl font-medium border border-green-200">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Code <strong>{promoCode}</strong> applied
                  </span>
                  <button
                    onClick={removePromoCode}
                    className="text-red-500 hover:text-red-700 text-xs underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code..."
                      value={codeInputValue}
                      onChange={(e) => setCodeInputValue(e.target.value)}
                      className="flex-1 uppercase text-xs px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                    <button
                      type="submit"
                      className="text-xs px-3.5 py-2 bg-neutral-900 hover:bg-black text-white font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                  {/* Quick coupon suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                      Popular:
                    </span>
                    {['MANI10', 'WELCOME500'].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          const res = applyPromoCode(code);
                          setPromoMessage({ text: res.message, isError: !res.success });
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono font-bold transition-colors cursor-pointer"
                      >
                        +{code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {promoMessage && (
                <p
                  className={`text-[11px] mt-1 ${
                    promoMessage.isError ? 'text-red-500' : 'text-green-600'
                  }`}
                >
                  {promoMessage.text}
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs">
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
                <span>Estimated Delivery (Pakistan)</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    `PKR ${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-100">
                <span>Estimated Total</span>
                <span>PKR {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/cart"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="py-3 px-4 rounded-xl border border-neutral-300 text-center text-xs font-bold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1"
                >
                  View Bag
                </Link>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/checkout');
                  }}
                  className="py-3 px-4 rounded-xl bg-[#1E1E1E] hover:bg-black text-white text-center text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Direct WhatsApp Order CTA */}
              <a
                href={buildCartWhatsAppUrl(cart, total, deliveryFee)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-center text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Order via WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
