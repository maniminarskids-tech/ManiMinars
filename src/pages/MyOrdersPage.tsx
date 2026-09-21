import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Package,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  AlertCircle,
  Copy,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  MapPin,
  CreditCard,
  Building,
  Sparkles,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useProducts } from '../context/ProductContext';
import { Order } from '../types';
import {
  extractOrderProducts,
  normalizeOrderStatus,
  normalizePhoneNumber,
  formatOrderDate,
  FALLBACK_GARMENT_IMAGE,
  NormalizedOrderProduct,
} from '../utils/orderUtils';
import { getSupabase } from '../services/supabase';

// Visual timeline steps
const TIMELINE_STEPS = [
  {
    key: 'placed',
    title: 'Order Placed',
    description: 'Received in our system',
    icon: ShoppingBag,
  },
  {
    key: 'pending',
    title: 'Pending Verification',
    description: 'Verifying payment details',
    icon: Clock,
  },
  {
    key: 'approved',
    title: 'Approved',
    description: 'Payment verified & packed',
    icon: CheckCircle2,
  },
  {
    key: 'dispatched',
    title: 'Dispatched',
    description: 'Handed to courier partner',
    icon: Truck,
  },
  {
    key: 'delivered',
    title: 'Delivered',
    description: 'Parcel reached destination',
    icon: Check,
  },
];

export default function MyOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { orders, isOrdersLoading, refreshOrders } = useProducts();

  // Search input state
  const queryParam = searchParams.get('q') || searchParams.get('id') || searchParams.get('phone') || '';
  const [searchInput, setSearchInput] = useState(queryParam);
  const [activeSearchQuery, setActiveSearchQuery] = useState(queryParam);
  const [searchMode, setSearchMode] = useState<'all' | 'phone' | 'order_id'>('all');

  // Interactive UI states
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [selectedOrderTab, setSelectedOrderTab] = useState<string | null>(null);

  // Sync state if URL query param changes
  useEffect(() => {
    if (queryParam && queryParam !== activeSearchQuery) {
      setSearchInput(queryParam);
      setActiveSearchQuery(queryParam);
    }
  }, [queryParam]);

  // Real-time synchronization directly with Supabase for instant admin update propagation
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel('my-orders-realtime-tracker')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Immediately re-fetch orders so the customer sees the updated status
          refreshOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshOrders]);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Copy order ID helper
  const handleCopyOrderId = (orderId: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(orderId);
      setCopiedOrderId(orderId);
      setTimeout(() => setCopiedOrderId(null), 2500);
    }
  };

  // Submit search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    setActiveSearchQuery(trimmed);
    if (trimmed) {
      setSearchParams({ q: trimmed });
      // Save recent query to local storage
      try {
        localStorage.setItem('mani_minars_last_order_query', trimmed);
      } catch {
        // ignore
      }
    } else {
      setSearchParams({});
    }
  };

  // Pre-load last search query if no search query provided
  useEffect(() => {
    if (!activeSearchQuery) {
      try {
        const lastQuery = localStorage.getItem('mani_minars_last_order_query');
        if (lastQuery && !searchInput) {
          setSearchInput(lastQuery);
          setActiveSearchQuery(lastQuery);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Filter orders based on customer search query (Phone or Order ID)
  const filteredOrders = useMemo(() => {
    if (!activeSearchQuery.trim()) {
      return [];
    }

    const rawQuery = activeSearchQuery.trim();
    const queryDigits = normalizePhoneNumber(rawQuery);
    const queryLower = rawQuery.toLowerCase();

    return orders.filter((order) => {
      const orderId = (order.id || order.order_id || '').toLowerCase();
      const customerPhone = normalizePhoneNumber(order.customer?.phone);
      const rawCustomerPhone = (order.customer?.phone || '').toLowerCase();
      const customerName = (order.customer?.fullName || '').toLowerCase();

      // Check if user specifically requested phone mode
      if (searchMode === 'phone') {
        if (queryDigits.length >= 4 && customerPhone.includes(queryDigits)) return true;
        if (rawCustomerPhone.includes(queryLower)) return true;
        return false;
      }

      // Check if user specifically requested order_id mode
      if (searchMode === 'order_id') {
        if (orderId.includes(queryLower)) return true;
        return false;
      }

      // 'all' mode: Match either Order ID OR Phone Number (or customer name fallback)
      const matchesOrderId = orderId.includes(queryLower);
      const matchesPhone =
        (queryDigits.length >= 4 && customerPhone.includes(queryDigits)) ||
        rawCustomerPhone.includes(queryLower);
      const matchesName = queryLower.length >= 3 && customerName.includes(queryLower);

      return matchesOrderId || matchesPhone || matchesName;
    });
  }, [orders, activeSearchQuery, searchMode]);

  // Determine timeline step progression based on normalized status
  const getStepStatus = (orderStatus: string, stepKey: string) => {
    const norm = normalizeOrderStatus(orderStatus);

    if (norm === 'Rejected') {
      if (stepKey === 'placed') return 'completed';
      if (stepKey === 'pending') return 'rejected';
      return 'disabled';
    }

    const orderRankMap: Record<string, number> = {
      placed: 0,
      'Pending Verification': 1,
      Approved: 2,
      Dispatched: 3,
      Delivered: 4,
    };

    const currentRank = orderRankMap[norm] ?? 1;

    const stepRankMap: Record<string, number> = {
      placed: 0,
      pending: 1,
      approved: 2,
      dispatched: 3,
      delivered: 4,
    };

    const targetRank = stepRankMap[stepKey] ?? 0;

    if (currentRank > targetRank) return 'completed';
    if (currentRank === targetRank) return 'current';
    return 'upcoming';
  };

  // Status Badge Helper
  const renderStatusBadge = (rawStatus: string) => {
    const status = normalizeOrderStatus(rawStatus);

    switch (status) {
      case 'Pending Verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pending Verification
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Approved
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            Dispatched
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            Delivered
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800">
            {rawStatus}
          </span>
        );
    }
  };

  // Payment Method Label Helper
  const getPaymentMethodDisplay = (order: Order) => {
    const method = order.paymentMethod;
    if (method === 'raast') {
      return {
        label: 'Raast Instant Pay (03046466815)',
        type: 'raast',
        icon: Sparkles,
        sub: order.paymentReference ? `Ref: ${order.paymentReference}` : 'Mani Minars Raast ID',
      };
    }
    if (method === 'bank_transfer') {
      return {
        label: 'Meezan Bank Direct Transfer',
        type: 'bank',
        icon: Building,
        sub: order.paymentReference ? `Ref: ${order.paymentReference}` : 'Account #01080108920194',
      };
    }
    if (method === 'cod') {
      return {
        label: 'Cash on Delivery (COD)',
        type: 'cod',
        icon: CreditCard,
        sub: 'Pay courier cash upon parcel arrival',
      };
    }
    return {
      label: method?.replace(/_/g, ' ').toUpperCase() || 'Bank Transfer',
      type: 'other',
      icon: CreditCard,
      sub: order.paymentReference || 'Direct Payment',
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1E1E1E]">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Breadcrumbs & Header Title */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-neutral-500 mb-2">
            <Link to="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-900 font-semibold">My Orders</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-logo font-bold text-3xl sm:text-4xl text-neutral-900 tracking-tight">
                My Orders & Live Tracking
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl">
                Check live verification status, parcel logistics, and ordered garments in real-time.
              </p>
            </div>

            {/* Live Realtime Indicator */}
            <div className="flex items-center justify-center sm:justify-end gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200 shadow-2xs text-xs font-semibold text-neutral-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Cloud Updates Active</span>
              </div>

              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isRefreshing || isOrdersLoading}
                className="p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh live status from Supabase"
                aria-label="Refresh status"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing || isOrdersLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Panel Card */}
        <section
          id="order-search-section"
          className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-5 sm:p-7 mb-8 transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-base sm:text-lg text-neutral-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#E84D3D]" />
              <span>Find Your Order</span>
            </h2>

            {/* Search Type Filter Buttons */}
            <div className="flex items-center rounded-xl bg-neutral-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSearchMode('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  searchMode === 'all'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Auto Detect
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('order_id')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  searchMode === 'order_id'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Order ID
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('phone')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  searchMode === 'phone'
                    ? 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Phone Number
              </button>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  {searchMode === 'phone' ? (
                    <Phone className="w-4 h-4" />
                  ) : (
                    <Package className="w-4 h-4" />
                  )}
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={
                    searchMode === 'phone'
                      ? 'Enter mobile number e.g. 0300 1234567 or +923001234567'
                      : searchMode === 'order_id'
                      ? 'Enter Order ID e.g. MM-94821'
                      : 'Search by Order ID (e.g. MM-94821) or Phone (e.g. 03001234567)...'
                  }
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-neutral-300 outline-none focus:ring-2 focus:ring-[#E84D3D] focus:border-transparent transition-all bg-neutral-50/50 focus:bg-white text-neutral-900 placeholder:text-neutral-400"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#E84D3D] hover:bg-[#DF3E2E] text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Track Order</span>
              </button>
            </div>

            {/* Quick Helper / Example chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-neutral-500">
              <span className="font-medium">Try searching:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('MM-94821');
                  setActiveSearchQuery('MM-94821');
                  setSearchParams({ q: 'MM-94821' });
                }}
                className="text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              >
                MM-94821
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('03004829182');
                  setActiveSearchQuery('03004829182');
                  setSearchParams({ q: '03004829182' });
                }}
                className="text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              >
                03004829182
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('03219482019');
                  setActiveSearchQuery('03219482019');
                  setSearchParams({ q: '03219482019' });
                }}
                className="text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              >
                03219482019
              </button>
            </div>
          </form>
        </section>

        {/* Search Results / Order Tracking Content */}
        {activeSearchQuery.trim() === '' ? (
          /* Empty Search Initial State */
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-[#E84D3D] flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900">Track Your Mani Minars Order</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Enter your <strong>Phone Number</strong> (e.g., 0300 1234567) or your <strong>Order ID</strong> (e.g., MM-94821) in the search box above to view real-time verification and parcel progress.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://wa.me/923046466815?text=Assalam-o-Alaikum%20Mani%20Minars!%20I%20need%20help%20tracking%20my%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Need Help? Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Not Found State */
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900">No Orders Found</h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              We couldn't find any orders matching <strong>"{activeSearchQuery}"</strong>. Please verify the mobile number or Order ID provided during checkout.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setActiveSearchQuery('');
                  setSearchParams({});
                }}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear Search
              </button>
              <a
                href={`https://wa.me/923046466815?text=Assalam-o-Alaikum%20Mani%20Minars!%20I%20could%20not%20find%20my%20order%20for%20query:%20${encodeURIComponent(
                  activeSearchQuery
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Verify on WhatsApp (+92 304 6466815)</span>
              </a>
            </div>
          </div>
        ) : (
          /* Found Orders List */
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-semibold text-neutral-600">
                Found {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} for{' '}
                <strong className="text-neutral-900">"{activeSearchQuery}"</strong>
              </p>
            </div>

            {filteredOrders.map((order) => {
              const products = extractOrderProducts(order);
              const statusNormalized = normalizeOrderStatus(order.status);
              const paymentInfo = getPaymentMethodDisplay(order);

              return (
                <article
                  key={order.id}
                  id={`order-card-${order.id}`}
                  className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm overflow-hidden transition-all duration-200 hover:border-neutral-300"
                >
                  {/* Order Card Header */}
                  <div className="bg-neutral-50/90 px-5 sm:px-7 py-4 border-b border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-extrabold text-base sm:text-lg text-neutral-900">
                          #{order.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderId(order.id)}
                          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
                          title="Copy Order ID"
                        >
                          {copiedOrderId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {renderStatusBadge(order.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          {formatOrderDate(order.createdAt)}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-neutral-700">{order.customer?.fullName}</span>
                        <span>•</span>
                        <span className="font-mono text-neutral-600">{order.customer?.phone}</span>
                      </div>
                    </div>

                    {/* Total Amount & WhatsApp Support Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200/60">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                        Total Amount
                      </span>
                      <span className="font-extrabold text-lg sm:text-xl text-[#E84D3D] font-mono">
                        PKR {order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 1. VISUAL PROGRESS TRACKER (Status Timeline) */}
                  <div className="p-5 sm:p-7 border-b border-neutral-100 bg-white">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-[#E84D3D]" />
                        <span>Live Order Status Timeline</span>
                      </h4>

                      {order.trackingNumber && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 bg-neutral-100 px-2.5 py-1 rounded-lg">
                          <span>{order.courier || 'Courier'}:</span>
                          <span className="font-mono text-[#E84D3D]">{order.trackingNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* If status is Rejected, display special alert notice */}
                    {statusNormalized === 'Rejected' ? (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-rose-900">
                            Verification Rejected by Admin
                          </p>
                          <p className="text-rose-700 leading-relaxed">
                            Payment verification could not be confirmed for this order. If you have already made the transfer via Meezan Bank or Raast, please send your receipt screenshot to our team on WhatsApp for prompt resolution.
                          </p>
                          <div className="pt-2">
                            <a
                              href={`https://wa.me/923046466815?text=Assalam-o-Alaikum%20Mani%20Minars!%20My%20order%20%23${order.id}%20shows%20rejected.%20Here%20is%20my%20payment%20proof.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Send Receipt on WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Standard 5-Step Visual Stepper (Mobile & Desktop Responsive) */
                      <div className="relative">
                        {/* Desktop Horizontal Stepper */}
                        <div className="hidden md:grid md:grid-cols-5 gap-2 relative">
                          {/* Connecting Bar */}
                          <div className="absolute top-5 left-8 right-8 h-1 bg-neutral-200 -z-0" />

                          {TIMELINE_STEPS.map((step, idx) => {
                            const stepState = getStepStatus(order.status, step.key);
                            const IconComponent = step.icon;

                            const isCompleted = stepState === 'completed';
                            const isCurrent = stepState === 'current';

                            return (
                              <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    isCompleted
                                      ? 'bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-50'
                                      : isCurrent
                                      ? 'bg-[#E84D3D] text-white shadow-md ring-4 ring-orange-100 animate-pulse'
                                      : 'bg-neutral-100 text-neutral-400 border border-neutral-300'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <Check className="w-5 h-5 stroke-[3]" />
                                  ) : (
                                    <IconComponent className="w-5 h-5" />
                                  )}
                                </div>
                                <span
                                  className={`text-xs font-bold mt-2.5 block leading-tight ${
                                    isCurrent
                                      ? 'text-[#E84D3D]'
                                      : isCompleted
                                      ? 'text-neutral-900'
                                      : 'text-neutral-400'
                                  }`}
                                >
                                  {step.title}
                                </span>
                                <span className="text-[10px] text-neutral-500 mt-0.5 block max-w-[110px]">
                                  {step.description}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Mobile Vertical Stepper */}
                        <div className="md:hidden space-y-4 relative pl-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                          {TIMELINE_STEPS.map((step, idx) => {
                            const stepState = getStepStatus(order.status, step.key);
                            const IconComponent = step.icon;
                            const isCompleted = stepState === 'completed';
                            const isCurrent = stepState === 'current';

                            return (
                              <div key={step.key} className="relative">
                                {/* Dot Indicator */}
                                <div
                                  className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                    isCompleted
                                      ? 'bg-emerald-500 text-white'
                                      : isCurrent
                                      ? 'bg-[#E84D3D] text-white ring-2 ring-orange-200'
                                      : 'bg-neutral-200 text-neutral-400'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  ) : (
                                    <IconComponent className="w-3 h-3" />
                                  )}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xs font-bold ${
                                        isCurrent
                                          ? 'text-[#E84D3D]'
                                          : isCompleted
                                          ? 'text-neutral-900'
                                          : 'text-neutral-400'
                                      }`}
                                    >
                                      {step.title}
                                    </span>
                                    {isCurrent && (
                                      <span className="text-[10px] px-1.5 py-0.2 bg-orange-100 text-[#E84D3D] rounded font-semibold uppercase">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-neutral-500 mt-0.5">
                                    {step.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. ORDER DETAILS (Customer Info, Delivery, Payment) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-7 border-b border-neutral-100 bg-neutral-50/50">
                    {/* Customer & Delivery Address */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#E84D3D]" />
                        <span>Delivery Destination</span>
                      </h4>
                      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 space-y-1 text-xs">
                        <p className="font-bold text-neutral-900 text-sm">{order.customer?.fullName}</p>
                        <p className="font-mono text-neutral-600">{order.customer?.phone}</p>
                        {order.customer?.email && (
                          <p className="text-neutral-500">{order.customer.email}</p>
                        )}
                        <p className="text-neutral-700 pt-1 leading-relaxed">
                          {order.customer?.address}, <strong>{order.customer?.city}</strong>
                        </p>
                        {order.customer?.notes && (
                          <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 border border-amber-200/60">
                            <strong>Note:</strong> {order.customer.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#E84D3D]" />
                        <span>Payment & Verification</span>
                      </h4>
                      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900">{paymentInfo.label}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                            {order.paymentStatus || 'Verified'}
                          </span>
                        </div>
                        <p className="text-neutral-500 text-[11px]">{paymentInfo.sub}</p>

                        {/* Payment Proof / Receipt link */}
                        {(order.paymentProofUrl || order.paymentProofImage) && (
                          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-neutral-500 text-[11px]">Payment Proof Uploaded:</span>
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  url: order.paymentProofUrl || order.paymentProofImage || '',
                                  title: `Payment Receipt for Order #${order.id}`,
                                })
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E84D3D] hover:underline cursor-pointer"
                            >
                              <span>View Receipt Image</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. PRODUCTS ORDERED TABLE */}
                  <div className="p-5 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-[#E84D3D]" />
                        <span>Products Ordered ({products.length})</span>
                      </h4>
                      <span className="text-xs text-neutral-400 font-medium">PKR Currency</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
                      <table className="w-full text-left text-xs min-w-[580px]">
                        <thead className="bg-neutral-50/90 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                          <tr>
                            <th className="py-2.5 px-4">Garment</th>
                            <th className="py-2.5 px-3">Size</th>
                            <th className="py-2.5 px-3">Color</th>
                            <th className="py-2.5 px-3 text-center">Qty</th>
                            <th className="py-2.5 px-3 text-right">Price</th>
                            <th className="py-2.5 px-4 text-right">Line Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {products.map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-neutral-50/40 transition-colors">
                              {/* Product Image & Name */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = FALLBACK_GARMENT_IMAGE;
                                    }}
                                    onClick={() =>
                                      setPreviewImage({
                                        url: item.image,
                                        title: item.name,
                                      })
                                    }
                                    className="w-12 h-12 rounded-xl object-cover border border-neutral-200 bg-neutral-100 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                                    title="Click to zoom image"
                                  />
                                  <div>
                                    <span className="font-bold text-neutral-900 block leading-snug">
                                      {item.name}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                                      Item #{idx + 1}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Size */}
                              <td className="py-3 px-3">
                                <span className="inline-block px-2.5 py-1 rounded-lg font-bold text-xs bg-neutral-100 text-neutral-800 border border-neutral-200/80">
                                  {item.size}
                                </span>
                              </td>

                              {/* Color */}
                              <td className="py-3 px-3">
                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs">
                                  {item.colorHex ? (
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                                      style={{ backgroundColor: item.colorHex }}
                                    />
                                  ) : (
                                    <span className="w-3 h-3 rounded-full bg-neutral-400 shrink-0" />
                                  )}
                                  <span className="font-medium">{item.colorName}</span>
                                </div>
                              </td>

                              {/* Quantity */}
                              <td className="py-3 px-3 text-center">
                                <span className="inline-flex items-center justify-center min-w-[26px] px-2 py-0.5 rounded-full font-bold text-xs bg-neutral-100 text-neutral-800">
                                  {item.quantity}
                                </span>
                              </td>

                              {/* Unit Price */}
                              <td className="py-3 px-3 text-right font-mono text-neutral-600">
                                PKR {item.unitPrice.toLocaleString()}
                              </td>

                              {/* Line Total */}
                              <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">
                                PKR {item.lineTotal.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {/* Financial Summary Footer */}
                        <tfoot className="bg-neutral-50/80 border-t border-neutral-200">
                          <tr>
                            <td colSpan={3} className="py-3.5 px-4 text-neutral-500 font-medium">
                              <span className="text-[11px]">Nationwide Delivery by {order.courier || 'Trax & TCS'}</span>
                            </td>
                            <td colSpan={3} className="py-3.5 px-4">
                              <div className="space-y-1.5 max-w-xs ml-auto">
                                <div className="flex justify-between text-neutral-600 text-xs">
                                  <span>Subtotal:</span>
                                  <span className="font-mono">PKR {order.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-neutral-600 text-xs">
                                  <span>Delivery Fee:</span>
                                  <span className="font-mono">PKR {order.deliveryFee.toLocaleString()}</span>
                                </div>
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-rose-600 font-semibold text-xs">
                                    <span>Discount:</span>
                                    <span className="font-mono">-PKR {order.discount.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-sm text-neutral-900 pt-1.5 border-t border-neutral-200">
                                  <span>Total Paid / Payable:</span>
                                  <span className="text-base font-extrabold text-[#E84D3D] font-mono">
                                    PKR {order.total.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Order Card Footer: Help / WhatsApp Action */}
                  <div className="bg-neutral-50 px-5 sm:px-7 py-3.5 border-t border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <span>Have questions about this order?</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/923046466815?text=Assalam-o-Alaikum%20Mani%20Minars!%20I%20would%20like%20an%20update%20on%20my%20order%20%23${order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h4 className="font-bold text-xs text-neutral-900 truncate pr-2">
                {previewImage.title}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-xs font-bold text-neutral-500 hover:text-neutral-900 px-2 py-1 rounded-md"
              >
                Close
              </button>
            </div>
            <div className="p-4 bg-neutral-900 flex items-center justify-center min-h-[300px] max-h-[70vh]">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[65vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
