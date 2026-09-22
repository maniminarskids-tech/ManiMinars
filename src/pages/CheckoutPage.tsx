import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useProducts, FALLBACK_GARMENT_IMAGE } from '../context/ProductContext';
import { MANI_MINARS_WHATSAPP_NUMBER } from '../utils/whatsapp';
import { Order, PaymentMethod } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  MessageCircle,
  Landmark,
  Zap,
  Copy,
  Check,
  UploadCloud,
  FileCheck,
  AlertCircle,
  X,
  Info,
  Package,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, deliveryFee, total, discount, promoCode, shippingTier, clearCart } = useCart();
  const { addOrder, deliverySettings } = useProducts();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    notes: '',
  });

  const [submittedCustomer, setSubmittedCustomer] = useState<{
    fullName: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    notes?: string;
  } | null>(null);

  // Allowed Payment Methods ONLY: 'bank_transfer' or 'raast'
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'raast'>('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [submittedReference, setSubmittedReference] = useState('');
  const [submittedScreenshot, setSubmittedScreenshot] = useState<string | null>(null);

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

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPaymentError('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setPaymentError('Image size should be under 8MB.');
      return;
    }

    setPaymentError('');
    setScreenshotFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPaymentScreenshot(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setPaymentScreenshot(null);
    setScreenshotFileName('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate customer form fields
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.city.trim()) {
      setPaymentError('Please fill in all required customer details (Full Name, Phone Number, City, and Delivery Address).');
      return;
    }

    // Strict validation: Require payment proof or reference number
    const trimmedRef = paymentReference.trim();
    if (!trimmedRef && !paymentScreenshot) {
      setPaymentError(
        'Payment proof is required. Please enter your Payment Reference / Transaction ID or upload a screenshot of your transfer.'
      );
      // Scroll to payment section
      const elem = document.getElementById('payment-method-section');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setPaymentError('');
    setIsProcessing(true);

    const generatedId = `MM-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);
    setSubmittedReference(trimmedRef);
    setSubmittedScreenshot(paymentScreenshot);

    const snapshotCustomer = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
      notes: formData.notes.trim() || undefined,
    };
    setSubmittedCustomer(snapshotCustomer);

    // Save phone for My Orders lookup so order persists across refresh & browser restart
    if (snapshotCustomer.phone) {
      try {
        localStorage.setItem('mm_customer_phone', snapshotCustomer.phone);
        localStorage.setItem('mani_minars_customer_phone', snapshotCustomer.phone);
      } catch {
        // ignore
      }
    }

    // Save order to Supabase immediately with payment reference & screenshot
    const newOrder: Order = {
      id: generatedId,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: snapshotCustomer.fullName,
        phone: `+92${snapshotCustomer.phone.replace(/^0+/, '')}`,
        email: snapshotCustomer.email,
        city: snapshotCustomer.city,
        address: snapshotCustomer.address,
        notes: snapshotCustomer.notes,
      },
      items: [...cart],
      subtotal,
      deliveryFee,
      discount,
      total,
      paymentMethod,
      paymentReference: trimmedRef || undefined,
      paymentProofImage: paymentScreenshot || undefined,
      paymentStatus: 'pending',
      shippingTier,
      couponCode: promoCode || undefined,
      status: 'Pending Verification',
      courier: deliverySettings.courierName,
    };

    // FIX #2 Requirement 7: After successful order placement, clear all fields
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      city: '',
      address: '',
      notes: '',
    });
    setPaymentReference('');
    setPaymentScreenshot(null);
    setScreenshotFileName('');

    // Save immediately to Supabase and local cache
    try {
      await addOrder(newOrder);
    } catch (err) {
      console.error('Error saving order:', err);
    }

    // Micro-animation: Trigger button success checkmark state and subtle celebration
    setIsProcessing(false);
    setIsSubmittedSuccess(true);

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10B981', '#E84D3D', '#F5BE38'],
        disableForReducedMotion: true,
      });
    } catch {
      // ignore
    }

    // Smooth transition: Allow the customer to clearly perceive the checkmark feedback before swapping views
    setTimeout(() => {
      setOrderComplete(true);
      clearCart();
    }, 800);
  };

  // Order Complete Screen
  if (orderComplete) {
    const paymentMethodLabel =
      paymentMethod === 'bank_transfer'
        ? 'Meezan Bank Transfer (A/C: 02240104372309)'
        : 'Raast Payment (ID: 03046466815)';

    const customerDisplayName = submittedCustomer?.fullName || 'Valued Customer';
    const customerDisplayPhone = submittedCustomer?.phone
      ? `+92${submittedCustomer.phone.replace(/^0+/, '')}`
      : '';
    const customerDisplayAddress = submittedCustomer
      ? `${submittedCustomer.address}, ${submittedCustomer.city}`
      : '';

    const whatsappMessage = `Assalam-o-Alaikum Mani Minars! 👋
I have placed Order #${orderId} on your store:

💰 *Total Amount:* PKR ${total.toLocaleString()}
💳 *Payment Method:* ${paymentMethodLabel}
${submittedReference ? `🔖 *Payment Reference / TID:* ${submittedReference}\n` : ''}👤 *Customer:* ${customerDisplayName}
📞 *Phone:* ${customerDisplayPhone}
📍 *Delivery Address:* ${customerDisplayAddress}

I am attaching my payment proof screenshot for verification. Please confirm my order dispatch. Shukriya!`;

    const whatsappConfirmUrl = `https://wa.me/${MANI_MINARS_WHATSAPP_NUMBER}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    return (
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/80 shadow-md"
          >
            {/* Elegant Spring-Animated Success Checkmark */}
            <div className="relative mx-auto mb-5 w-20 h-20 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-emerald-100"
              />
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 18,
                  delay: 0.1,
                }}
                className="relative z-10 w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 ring-4 ring-emerald-50"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.25 }}
                >
                  <Check className="w-8 h-8 stroke-[3]" />
                </motion.div>
              </motion.div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Order Received • Verification Pending</span>
            </div>

            <h1 className="font-logo font-bold text-2xl sm:text-3xl text-neutral-900 mb-2">
              Order #{orderId} Submitted
            </h1>

            {/* Mandatory Instruction Alert Banner */}
            <div className="my-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-left flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-amber-900 mb-1">
                  Important: Send Payment Proof on WhatsApp
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Please complete payment first and send payment proof on WhatsApp. Your order will be confirmed after payment verification.
                </p>
              </div>
            </div>

            {/* Order details summary card */}
            <div className="bg-neutral-50 rounded-2xl p-4 sm:p-5 text-left text-xs space-y-2.5 mb-6 border border-neutral-200">
              <div className="flex justify-between">
                <span className="text-neutral-500">Order Reference:</span>
                <span className="font-bold text-neutral-900 font-mono text-sm">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment Mode:</span>
                <span className="font-semibold text-neutral-800">{paymentMethodLabel}</span>
              </div>
              {submittedReference && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment Reference / TID:</span>
                  <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                    {submittedReference}
                  </span>
                </div>
              )}
              {submittedScreenshot && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-neutral-500">Payment Screenshot:</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={submittedScreenshot}
                      alt="Payment Proof"
                      className="w-10 h-10 object-cover rounded-lg border border-neutral-300 shadow-xs"
                    />
                    <span className="text-[11px] font-semibold text-emerald-700">Uploaded</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Delivery Address:</span>
                <span className="font-semibold text-neutral-800 text-right max-w-xs truncate">
                  {submittedCustomer?.address || ''}, {submittedCustomer?.city || ''}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2.5 text-sm font-bold text-neutral-900">
                <span>Total Amount Payable:</span>
                <span className="text-[#E84D3D]">PKR {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Direct WhatsApp Confirmation Button */}
            <a
              id="whatsapp-order-confirm-btn"
              href={whatsappConfirmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 mb-3"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Send Payment Proof on WhatsApp (+92 304 6466815)</span>
            </a>

            {/* Track Order Live Button */}
            <button
              type="button"
              onClick={() => {
                const phoneQuery = submittedCustomer?.phone ? `&phone=${encodeURIComponent(submittedCustomer.phone)}` : '';
                navigate(`/my-orders?q=${orderId}${phoneQuery}`);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 mb-5 cursor-pointer"
            >
              <Package className="w-4 h-4 text-[#E84D3D]" />
              <span>Track Live Order Status (#{orderId})</span>
            </button>

            <p className="text-xs text-neutral-500 mb-6">
              Our fulfillment team in Lahore will verify your transfer and dispatch via Trax / TCS Express within 24 hours.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate('/kids')}
                className="px-6 py-3 rounded-xl bg-[#E84D3D] hover:bg-[#DF3E2E] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                Shop Kids (0–10Y)
              </button>
              <button
                onClick={() => navigate('/juniors')}
                className="px-6 py-3 rounded-xl bg-[#F5BE38] hover:bg-[#E8B029] text-neutral-900 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                Shop Juniors (11–16Y)
              </button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Active Checkout Form
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Page Title & Breadcrumb */}
        <div className="mb-6">
          <nav className="text-xs text-neutral-500 mb-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>{' '}
            /
            <Link to="/cart" className="hover:underline mx-1">
              Bag
            </Link>{' '}
            /
            <span className="text-neutral-900 font-semibold ml-1">Checkout</span>
          </nav>
          <h1 className="font-logo font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight">
            Secure Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Checkout Steps & Payment (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Customer Contact & Shipping Details */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-logo font-bold text-base text-neutral-900">
                    Contact & Delivery Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Receiver's Full Name"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      WhatsApp / Mobile # *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-neutral-200 bg-neutral-50 text-neutral-600 text-xs font-mono font-semibold">
                        +92
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="3001234567"
                        className="w-full text-xs px-3 py-2.5 rounded-r-xl border border-neutral-200 outline-none font-mono focus:ring-2 focus:ring-[#E84D3D]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@domain.com"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                      City (Pakistan) *
                    </label>
                    <select
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D] bg-white cursor-pointer"
                    >
                      <option value="">Select City (Pakistan)</option>
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
                    Complete Street Address *
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

              {/* Step 2: Payment Method (Bank Transfer or Raast ONLY) */}
              <div
                id="payment-method-section"
                className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h2 className="font-logo font-bold text-base text-neutral-900">
                      Payment Method
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-green-600" />
                    Direct Transfer
                  </span>
                </div>

                {/* Prominent Required Instructions Alert */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-left">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                        Payment Instruction
                      </h4>
                      <p className="text-xs text-amber-800 font-medium mt-0.5 leading-relaxed">
                        Please complete payment first and send payment proof on WhatsApp. Your order will be confirmed after payment verification.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Option Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Bank Transfer (Meezan Bank) */}
                  <label
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all text-left ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-[#E84D3D] bg-orange-50/40 ring-2 ring-[#E84D3D]'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={() => setPaymentMethod('bank_transfer')}
                          className="text-[#E84D3D] focus:ring-[#E84D3D]"
                        />
                        <span className="font-bold text-xs sm:text-sm text-neutral-900 flex items-center gap-1.5">
                          <Landmark className="w-4 h-4 text-[#E84D3D]" />
                          Bank Transfer
                        </span>
                      </div>
                      <span className="text-[10px] bg-neutral-100 text-neutral-700 font-bold px-2 py-0.5 rounded">
                        Meezan Bank
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Interbank transfer (IBFT) from any Pakistani bank app or ATM.
                    </p>
                  </label>

                  {/* 2. Raast Payment */}
                  <label
                    onClick={() => setPaymentMethod('raast')}
                    className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all text-left ${
                      paymentMethod === 'raast'
                        ? 'border-[#E84D3D] bg-orange-50/40 ring-2 ring-[#E84D3D]'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'raast'}
                          onChange={() => setPaymentMethod('raast')}
                          className="text-[#E84D3D] focus:ring-[#E84D3D]"
                        />
                        <span className="font-bold text-xs sm:text-sm text-neutral-900 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-[#F5BE38]" />
                          Raast Payment
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Instant (0% Fee)
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">
                      Instant transfer via State Bank Raast ID from any banking app.
                    </p>
                  </label>
                </div>

                {/* Account Details Display Card */}
                {paymentMethod === 'bank_transfer' ? (
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          MB
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900">Meezan Bank Limited</h4>
                          <p className="text-[11px] text-neutral-500">Official Business Account</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-neutral-200">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">
                          Account Title
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900">Muhammad Ramzan</span>
                          <button
                            type="button"
                            onClick={() => handleCopy('Muhammad Ramzan', 'title')}
                            className="text-neutral-500 hover:text-neutral-800 text-[11px] flex items-center gap-1 cursor-pointer"
                            title="Copy Title"
                          >
                            {copiedKey === 'title' ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-neutral-200">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">
                          Account Number
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-neutral-900 tracking-wider">
                            02240104372309
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy('02240104372309', 'acc_num')}
                            className="text-neutral-500 hover:text-neutral-800 text-[11px] flex items-center gap-1 cursor-pointer font-sans"
                            title="Copy Account Number"
                          >
                            {copiedKey === 'acc_num' ? (
                              <span className="text-green-600 font-bold flex items-center gap-0.5">
                                <Check className="w-3.5 h-3.5" /> Copied
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-[#E84D3D] font-semibold">
                                <Copy className="w-3.5 h-3.5" /> Copy
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-600 bg-white p-2.5 rounded-lg border border-neutral-200">
                      <strong>Amount to transfer:</strong>{' '}
                      <span className="font-bold text-[#E84D3D] text-xs">
                        PKR {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#F5BE38]/20 text-neutral-900 flex items-center justify-center font-bold text-xs">
                          <Zap className="w-4 h-4 text-[#F5BE38]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900">
                            State Bank Raast Instant Transfer
                          </h4>
                          <p className="text-[11px] text-neutral-500">Fast & Zero Transaction Fees</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Instant
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-neutral-200">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">
                          Raast ID / Mobile Number
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-neutral-900 text-sm tracking-wider">
                            03046466815
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy('03046466815', 'raast_id')}
                            className="text-neutral-500 hover:text-neutral-800 text-[11px] flex items-center gap-1 cursor-pointer font-sans"
                            title="Copy Raast ID"
                          >
                            {copiedKey === 'raast_id' ? (
                              <span className="text-green-600 font-bold flex items-center gap-0.5">
                                <Check className="w-3.5 h-3.5" /> Copied
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-[#E84D3D] font-semibold">
                                <Copy className="w-3.5 h-3.5" /> Copy
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-neutral-200">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block mb-0.5">
                          Account Title
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900">Muhammad Ramzan</span>
                          <button
                            type="button"
                            onClick={() => handleCopy('Muhammad Ramzan', 'raast_title')}
                            className="text-neutral-500 hover:text-neutral-800 text-[11px] flex items-center gap-1 cursor-pointer"
                            title="Copy Title"
                          >
                            {copiedKey === 'raast_title' ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-600 bg-white p-2.5 rounded-lg border border-neutral-200">
                      <strong>Amount to transfer:</strong>{' '}
                      <span className="font-bold text-[#E84D3D] text-xs">
                        PKR {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Required Fields: Payment Reference Number & Screenshot Upload */}
                <div className="pt-2 border-t border-neutral-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        Proof of Payment *
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Enter your transaction reference or upload a screenshot (at least one is required).
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      Required
                    </span>
                  </div>

                  {paymentError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* 1. Reference Number / TID Input */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Payment Reference / Transaction ID (TID)
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => {
                        setPaymentReference(e.target.value);
                        if (paymentError) setPaymentError('');
                      }}
                      placeholder="e.g. 984210349182 or Raast Ref #"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-neutral-300 font-mono outline-none focus:ring-2 focus:ring-[#E84D3D]"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      You can find this in your bank transfer receipt or SMS confirmation.
                    </p>
                  </div>

                  {/* 2. File Upload for Screenshot */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Upload Payment Screenshot
                    </label>

                    {paymentScreenshot ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={paymentScreenshot}
                            alt="Screenshot preview"
                            className="w-12 h-12 object-cover rounded-lg border border-emerald-300 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-emerald-900 block truncate">
                              {screenshotFileName || 'Payment_Proof.jpg'}
                            </span>
                            <span className="text-[10px] text-emerald-700">
                              Screenshot successfully attached
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveScreenshot}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                          title="Remove Screenshot"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-neutral-300 hover:border-[#E84D3D] rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50 hover:bg-orange-50/20">
                        <UploadCloud className="w-8 h-8 text-neutral-400 mb-1" />
                        <span className="text-xs font-bold text-neutral-700">
                          Click to upload payment screenshot
                        </span>
                        <span className="text-[10px] text-neutral-500 mt-0.5">
                          Supports PNG, JPG, JPEG or WEBP (Max 8MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Sidebar (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h2 className="font-logo font-bold text-base text-neutral-900">
                  Review Bag ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                </h2>
                <Link to="/cart" className="text-xs text-[#E84D3D] hover:underline font-semibold">
                  Edit Bag
                </Link>
              </div>

              {/* Items preview */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-neutral-100">
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
                  <span>Nationwide Delivery</span>
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
                  <span className="text-[#E84D3D]">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit CTA with micro-animation & success checkmark feedback */}
              <motion.button
                id="place-order-submit-btn"
                type="submit"
                disabled={isProcessing || isSubmittedSuccess}
                animate={{
                  backgroundColor: isSubmittedSuccess ? '#10B981' : '#E84D3D',
                  scale: isSubmittedSuccess ? [1, 1.02, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                className="w-full py-4 px-6 rounded-xl text-white text-xs sm:text-sm font-bold uppercase tracking-widest shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-95 overflow-hidden relative"
              >
                {isSubmittedSuccess ? (
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </div>
                    <span>Order Placed Successfully!</span>
                  </motion.div>
                ) : isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying & Submitting...</span>
                  </div>
                ) : (
                  <>
                    <span>Submit Order (PKR {total.toLocaleString()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <div className="p-3 bg-neutral-50 rounded-xl text-center text-xs text-neutral-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Orders confirmed upon payment verification</span>
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
