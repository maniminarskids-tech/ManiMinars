import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useProducts, FALLBACK_GARMENT_IMAGE } from '../context/ProductContext';
import { MANI_MINARS_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { Order } from '../types';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Package,
  CreditCard,
  Banknote,
  Smartphone,
  MessageCircle,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, deliveryFee, total, discount, promoCode, shippingTier, clearCart } = useCart();
  const { addOrder, deliverySettings } = useProducts();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: 'Fatima Malik',
    phone: '3046466815',
    email: 'maniminarskids@gmail.com',
    city: 'Lahore',
    address: 'House 42, Block D, Phase 5, DHA',
    notes: 'Please call before delivery.',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'wallet' | 'bank_transfer'>('cod');
  const [walletProvider, setWalletProvider] = useState<'JazzCash' | 'EasyPaisa' | 'SadaPay'>('JazzCash');
  const [walletPhone, setWalletPhone] = useState('03046466815');
  const [cardDetails, setCardDetails] = useState({
    name: 'Fatima Malik',
    number: '•••• •••• •••• 4242',
    expiry: '12/28',
    cvv: '•••',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const pakistanCities = [
    'Lahore',
    'Karachi',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Sialkot',
    'Gujranwala',
    'Hyderabad',
    'Abbottabad',
    'Bahawalpur',
    'Sargodha',
    'Sukkur',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const generatedId = `MM-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);

      // Save order to live system so it reflects in Secret Admin portal & stock automatically decreases
      const newOrder: Order = {
        id: generatedId,
        createdAt: new Date().toISOString(),
        customer: {
          fullName: formData.fullName,
          phone: `+92${formData.phone.replace(/^0+/, '')}`,
          email: formData.email,
          city: formData.city,
          address: formData.address,
          notes: formData.notes,
        },
        items: [...cart],
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
        shippingTier,
        couponCode: promoCode || undefined,
        status: 'pending',
        courier: deliverySettings.courierName,
      };
      addOrder(newOrder);

      setIsProcessing(false);
      setOrderComplete(true);
      clearCart();
    }, 1200);
  };

  if (orderComplete) {
    const whatsappConfirmUrl = `https://wa.me/${MANI_MINARS_WHATSAPP_NUMBER}?text=${encodeURIComponent(
      `Salam Mani Minars! 👋 I just placed order #${orderId} on your store for PKR ${total.toLocaleString()} (${paymentMethod.toUpperCase()}).\nDelivery to: ${formData.fullName}, ${formData.address}, ${formData.city}.\nPlease confirm item dispatch. Shukriya!`
    )}`;

    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-md">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-800 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Shukriya! Order Confirmed</span>
            </div>

            <h1 className="font-logo font-bold text-2xl sm:text-3xl text-neutral-900 mb-2">
              Your Mani Minars Order Is Placed
            </h1>

            <p className="text-sm text-neutral-600 mb-6">
              We're preparing your little ones' garments with love and care in our Lahore fulfillment studio.
            </p>

            {/* Order details summary card */}
            <div className="bg-neutral-50 rounded-2xl p-4 text-left text-xs space-y-2.5 mb-6 border border-neutral-100">
              <div className="flex justify-between">
                <span className="text-neutral-500">Order Reference:</span>
                <span className="font-bold text-neutral-900">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Estimated Delivery:</span>
                <span className="font-semibold text-neutral-800">2–3 Business Days (Trax Logistics)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment Method:</span>
                <span className="font-semibold text-neutral-800">
                  {paymentMethod === 'cod'
                    ? 'Cash on Delivery (COD)'
                    : paymentMethod === 'card'
                    ? 'Credit / Debit Card'
                    : 'JazzCash / EasyPaisa'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Delivery Address:</span>
                <span className="font-semibold text-neutral-800 text-right max-w-xs">
                  {formData.address}, {formData.city}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-sm font-bold text-neutral-900">
                <span>Total Amount:</span>
                <span>PKR {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Direct WhatsApp Confirmation Button */}
            <a
              id="whatsapp-order-confirm-btn"
              href={whatsappConfirmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 mb-4"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Confirm / Inquire on WhatsApp</span>
            </a>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate('/kids')}
                className="px-6 py-3 rounded-xl bg-[#E84D3D] hover:bg-[#DF3E2E] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Shop Kids (0–10Y)
              </button>
              <button
                onClick={() => navigate('/juniors')}
                className="px-6 py-3 rounded-xl bg-[#F5BE38] hover:bg-[#E8B029] text-neutral-900 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Shop Juniors (11–16Y)
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <h2 className="font-logo font-bold text-2xl text-neutral-900 mb-2">No items to checkout</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Please add your favorite items to your bag before proceeding to checkout.
          </p>
          <button
            onClick={() => navigate('/kids')}
            className="px-6 py-3 rounded-xl bg-[#E84D3D] text-white text-xs font-bold uppercase tracking-wider"
          >
            Explore Little Loom Kids
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top title */}
        <div className="mb-8">
          <h1 className="font-logo font-bold text-2xl sm:text-3xl text-neutral-900 mb-1">
            Express Checkout
          </h1>
          <p className="text-xs text-neutral-500">
            Fulfilling orders nationwide across Pakistan via premium tracked couriers.
          </p>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Customer Information & Delivery Form (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                  <Truck className="w-5 h-5 text-[#E84D3D]" />
                  <h2 className="font-logo font-bold text-base text-neutral-900">
                    Delivery Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Contact Number (Pakistan) *
                    </label>
                    <div className="flex rounded-xl border border-neutral-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#E84D3D]">
                      <span className="bg-neutral-100 px-3 py-2.5 text-xs text-neutral-500 font-bold border-r border-neutral-200">
                        +92
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="300 1234567"
                        className="flex-1 text-xs px-3 py-2.5 outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Email Address (for tracking receipt) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      City *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D] bg-white cursor-pointer"
                    >
                      {pakistanCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Street Address & Nearest Landmark *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House / Flat #, Street, Sector / Area"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Courier Notes / Special Instructions
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Optional (e.g. deliver after 2pm, ring bell twice)"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                  <Lock className="w-5 h-5 text-neutral-800" />
                  <h2 className="font-logo font-bold text-base text-neutral-900">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#E84D3D] bg-orange-50/40 ring-1 ring-[#E84D3D]'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-0.5 text-[#E84D3D] focus:ring-[#E84D3D]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-green-600" />
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                          Most Popular
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Pay cash to the courier representative upon doorstep delivery.
                      </p>
                    </div>
                  </label>

                  {/* Debit / Credit Card */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#E84D3D] bg-orange-50/40 ring-1 ring-[#E84D3D]'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mt-0.5 text-[#E84D3D] focus:ring-[#E84D3D]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          Credit / Debit Card (Visa / Mastercard)
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">3D Secure 2.0</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Instant, secure 3D-verified transaction via Pakistani & International banks.
                      </p>

                      {/* Interactive Card Details Form */}
                      {paymentMethod === 'card' && (
                        <div className="mt-3 pt-3 border-t border-orange-200/60 space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                              Cardholder Name
                            </label>
                            <input
                              type="text"
                              value={cardDetails.name}
                              onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                              placeholder="Name on card"
                              className="w-full text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#E84D3D]"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                                Card Number
                              </label>
                              <input
                                type="text"
                                value={cardDetails.number}
                                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                className="w-full text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg outline-none focus:ring-1 focus:ring-[#E84D3D] font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                                Expiry / CVV
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={cardDetails.expiry}
                                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  className="w-1/2 text-xs px-1.5 py-1.5 bg-white border border-neutral-300 rounded-lg outline-none text-center font-mono"
                                />
                                <input
                                  type="password"
                                  value={cardDetails.cvv}
                                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                  placeholder="CVV"
                                  maxLength={4}
                                  className="w-1/2 text-xs px-1.5 py-1.5 bg-white border border-neutral-300 rounded-lg outline-none text-center font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* JazzCash / EasyPaisa */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'wallet'
                        ? 'border-[#E84D3D] bg-orange-50/40 ring-1 ring-[#E84D3D]'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'wallet'}
                      onChange={() => setPaymentMethod('wallet')}
                      className="mt-0.5 text-[#E84D3D] focus:ring-[#E84D3D]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-[#F5BE38]" />
                          Mobile Wallet (JazzCash / EasyPaisa / SadaPay)
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Direct authorization from your mobile wallet account.
                      </p>

                      {/* Interactive Mobile Wallet Setup */}
                      {paymentMethod === 'wallet' && (
                        <div className="mt-3 pt-3 border-t border-orange-200/60 space-y-2">
                          <div className="flex gap-2">
                            {(['JazzCash', 'EasyPaisa', 'SadaPay'] as const).map((prov) => (
                              <button
                                key={prov}
                                type="button"
                                onClick={() => setWalletProvider(prov)}
                                className={`text-[11px] px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                                  walletProvider === prov
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-white border border-neutral-200 text-neutral-700'
                                }`}
                              >
                                {prov}
                              </button>
                            ))}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                              Registered Mobile Account Number
                            </label>
                            <input
                              type="tel"
                              value={walletPhone}
                              onChange={(e) => setWalletPhone(e.target.value)}
                              placeholder="03001234567"
                              className="w-full text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg outline-none font-mono focus:ring-1 focus:ring-[#E84D3D]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Sidebar (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h2 className="font-logo font-bold text-base text-neutral-900">
                  Review Bag ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                </h2>
                <Link to="/cart" className="text-xs text-[#E84D3D] hover:underline font-semibold">
                  Edit Bag
                </Link>
              </div>

              {/* Items preview */}
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1 divide-y divide-neutral-100">
                {cart.map((item) => {
                  const itemImage =
                    item.product.colors?.find((c) => c.name === item.selectedColor?.name)?.image ||
                    item.product.images?.[0] ||
                    FALLBACK_GARMENT_IMAGE;

                  return (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <img
                      src={itemImage}
                      alt={item.product.name}
                      className="w-12 h-14 object-cover rounded-lg bg-neutral-100 shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src !== FALLBACK_GARMENT_IMAGE) {
                          target.src = FALLBACK_GARMENT_IMAGE;
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-neutral-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Size: {item.selectedSize} • {item.selectedColor.name} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-neutral-900">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
              </div>

              {/* Totals breakdown */}
              <div className="space-y-2 text-xs border-t border-neutral-100 pt-4">
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
                  <span>Nationwide Courier (Pakistan)</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      `PKR ${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-neutral-900 pt-3 border-t border-neutral-100">
                  <span>Total Amount</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                id="place-order-submit-btn"
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-xl bg-[#E84D3D] hover:bg-[#DF3E2E] text-white text-xs sm:text-sm font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <span>Place Order (PKR {total.toLocaleString()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="p-3 bg-neutral-50 rounded-xl text-center text-xs text-neutral-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>100% Risk-Free Guarantee with 14-Day Exchange</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
