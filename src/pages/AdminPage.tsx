import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, FALLBACK_GARMENT_IMAGE } from '../context/ProductContext';
import { Product, Order, OrderStatus, Category, AgeGroup, Coupon } from '../types';
import { logoutAdmin, ADMIN_PASSCODE } from '../utils/security';
export { ADMIN_PASSCODE };
import { AVAILABLE_COUPONS } from '../context/CartContext';
import {
  Package,
  Truck,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  ExternalLink,
  MessageCircle,
  DollarSign,
  ShoppingBag,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  FileUp,
  RefreshCw,
  Link as LinkIcon,
  Ruler,
  Tag,
  Boxes,
  Minus,
  LogOut,
  AlertTriangle,
  Database,
} from 'lucide-react';

const KIDS_PRESET_SIZES = ['1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y'];
const JUNIORS_PRESET_SIZES = ['11-12Y', '12-13Y', '13-14Y', '14-15Y', '15-16Y'];
const SPECIALTY_PRESET_SIZES = ['0-6M', '6-12M', 'Free Size', 'One Size'];

/**
 * Automatically compress and scale uploaded garment images so they load instantly
 * and fit comfortably inside browser storage without quality degradation.
 */
function processUploadedImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload an image file (PNG, JPG, WEBP, or HEIC).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const MAX_DIMENSION = 1200;
          let { width, height } = img;

          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.88);
            resolve(compressed);
          } else {
            resolve(rawDataUrl);
          }
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => reject(new Error('Unable to read image file from disk.'));
    reader.readAsDataURL(file);
  });
}

export const AdminPage: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    resetProductsToDefault,
    orders,
    updateOrderStatus,
    deleteOrder,
    deliverySettings,
    updateDeliverySettings,
    isCloudConnected,
    refreshProducts,
  } = useProducts();

  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await refreshProducts();
    setTimeout(() => setIsSyncing(false), 800);
  };

  // Tab State: 'products' | 'inventory' | 'deliveries' | 'coupons' | 'settings'
  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'deliveries' | 'coupons' | 'settings'>('products');

  // Product management modal / form state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // New/Edit Product Form state
  const [productForm, setProductForm] = useState({
    name: '',
    tagline: '',
    price: 2500,
    originalPrice: 3200,
    isSale: false,
    isNew: true,
    ageGroup: 'kids' as AgeGroup,
    category: 'sets' as Category,
    sizes: ['2-3Y', '3-4Y', '4-5Y'],
    fabric: '100% Combed Pakistani Cotton',
    imageUrl:
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
    colorName: 'Sunset Coral',
    colorHex: '#E84D3D',
    stockQuantity: 25,
    sku: 'MM-KID-101',
    lowStockThreshold: 5,
    description:
      'Soft and breathable organic cotton silhouette handcrafted for active, joyful days.',
    details: [
      'Pure combed cotton yarn',
      'Gentle elasticized waistband',
      'Hypoallergenic pre-washed fabric',
    ],
  });

  // Image upload and drag & drop state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);

  // Size editing state
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [editingSizeIndex, setEditingSizeIndex] = useState<number | null>(null);
  const [editingSizeText, setEditingSizeText] = useState('');

  // Product search filter
  const [productSearch, setProductSearch] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Delivery settings form
  const [deliveryForm, setDeliveryForm] = useState({
    standardDeliveryFee: deliverySettings.standardDeliveryFee,
    freeShippingThreshold: deliverySettings.freeShippingThreshold,
    courierName: deliverySettings.courierName,
    estimatedDeliveryDays: deliverySettings.estimatedDeliveryDays,
  });
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  const handleLogout = () => {
    logoutAdmin();
    window.location.reload();
  };

  const handleStartEditSize = (index: number, currentText: string) => {
    setEditingSizeIndex(index);
    setEditingSizeText(currentText);
  };

  const handleSaveEditedSize = (index: number) => {
    const clean = editingSizeText.trim();
    if (clean) {
      setProductForm((prev) => {
        const nextSizes = [...prev.sizes];
        nextSizes[index] = clean;
        return { ...prev, sizes: nextSizes };
      });
    }
    setEditingSizeIndex(null);
    setEditingSizeText('');
  };

  const handleCancelEditSize = () => {
    setEditingSizeIndex(null);
    setEditingSizeText('');
  };

  // Image Upload handler (processes file, scales/compresses, sets preview)
  const handleFileUpload = async (file: File) => {
    setImageUploadError(null);
    setIsProcessingImage(true);
    try {
      const dataUrl = await processUploadedImage(file);
      setProductForm((prev) => ({ ...prev, imageUrl: dataUrl }));
    } catch (err: any) {
      setImageUploadError(err.message || 'Error processing photo. Please select another image.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileUpload(e.target.files[0]);
      e.target.value = ''; // Reset input so same file can be re-selected if needed
    }
  };

  // Size manipulation helper methods
  const handleToggleSize = (sz: string) => {
    setProductForm((prev) => {
      const exists = prev.sizes.includes(sz);
      const updated = exists ? prev.sizes.filter((s) => s !== sz) : [...prev.sizes, sz];
      return { ...prev, sizes: updated };
    });
  };

  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customSizeInput.trim();
    if (!clean) return;
    if (!productForm.sizes.includes(clean)) {
      setProductForm((prev) => ({
        ...prev,
        sizes: [...prev.sizes, clean],
      }));
    }
    setCustomSizeInput('');
  };

  const handleRemoveSize = (sz: string) => {
    setProductForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== sz),
    }));
  };

  const handleSelectAllKidsSizes = () => {
    setProductForm((prev) => {
      const merged = Array.from(new Set([...prev.sizes, ...KIDS_PRESET_SIZES]));
      return { ...prev, sizes: merged };
    });
  };

  const handleSelectAllJuniorsSizes = () => {
    setProductForm((prev) => {
      const merged = Array.from(new Set([...prev.sizes, ...JUNIORS_PRESET_SIZES]));
      return { ...prev, sizes: merged };
    });
  };

  const handleClearAllSizes = () => {
    setProductForm((prev) => ({ ...prev, sizes: [] }));
  };

  // Open modal to add product
  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setImageUploadError(null);
    setShowUrlFallback(false);
    setCustomSizeInput('');
    setProductForm({
      name: '',
      tagline: '',
      price: 2500,
      originalPrice: 0,
      isSale: false,
      isNew: true,
      ageGroup: 'kids',
      category: 'sets',
      sizes: ['2-3Y', '3-4Y', '4-5Y', '5-6Y'],
      fabric: '100% Combed Pakistani Cotton',
      imageUrl: '',
      colorName: 'Sunset Coral',
      colorHex: '#E84D3D',
      stockQuantity: 25,
      sku: `MM-KID-${Math.floor(100 + Math.random() * 900)}`,
      lowStockThreshold: 5,
      description:
        'Soft, breathable organic cotton silhouette handcrafted for active, joyful days in Pakistan.',
      details: [
        'Pure combed cotton yarn',
        'Gentle elasticized waistband',
        'Hypoallergenic pre-washed fabric',
      ],
    });
    setIsProductModalOpen(true);
  };

  // Open modal to edit product
  const handleOpenEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setImageUploadError(null);
    setShowUrlFallback(false);
    setCustomSizeInput('');
    setProductForm({
      name: product.name,
      tagline: product.tagline,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      isSale: !!product.isSale,
      isNew: !!product.isNew,
      ageGroup: product.ageGroup,
      category: product.category,
      sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ['3-4Y', '5-6Y'],
      fabric: product.fabric,
      imageUrl: product.images[0] || '',
      colorName: product.colors[0]?.name || 'Natural',
      colorHex: product.colors[0]?.hex || '#E84D3D',
      stockQuantity: product.stockQuantity ?? 20,
      sku: product.sku || `MM-${product.category.toUpperCase().slice(0, 3)}-${product.id.slice(-3)}`,
      lowStockThreshold: product.lowStockThreshold ?? 5,
      description: product.description,
      details: product.details,
    });
    setIsProductModalOpen(true);
  };

  // Save product (Add or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (productForm.sizes.length === 0) {
      alert('Please select or add at least one available size for this garment before publishing.');
      return;
    }

    // Ensure there is an image (or fallback to elegant garment placeholder)
    const finalImage =
      productForm.imageUrl ||
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80';

    const stockQty = Number(productForm.stockQuantity ?? 25);
    const productPayload = {
      name: productForm.name,
      tagline: productForm.tagline,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      isSale: productForm.isSale,
      isNew: productForm.isNew,
      ageGroup: productForm.ageGroup,
      category: productForm.category,
      sizes: productForm.sizes,
      stockQuantity: stockQty,
      sku: productForm.sku || undefined,
      lowStockThreshold: Number(productForm.lowStockThreshold ?? 5),
      inStock: stockQty > 0,
      colors: [
        {
          name: productForm.colorName,
          hex: productForm.colorHex,
          image: finalImage,
        },
      ],
      images: [
        finalImage,
        'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&w=800&q=80',
      ],
      description: productForm.description,
      details: productForm.details,
      fabric: productForm.fabric,
      rating: 5.0,
      reviewCount: 12,
    };

    if (editingProductId) {
      updateProduct(editingProductId, productPayload);
    } else {
      addProduct(productPayload);
    }

    setIsProductModalOpen(false);
  };

  // Save Delivery settings
  const handleSaveDeliverySettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeliverySettings({
      standardDeliveryFee: Number(deliveryForm.standardDeliveryFee),
      freeShippingThreshold: Number(deliveryForm.freeShippingThreshold),
      courierName: deliveryForm.courierName,
      estimatedDeliveryDays: deliveryForm.estimatedDeliveryDays,
    });
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 2500);
  };

  // Filtered products list
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.ageGroup.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filtered inventory list
  const filteredInventory = products.filter(
    (p) =>
      p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      p.category.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(inventorySearch.toLowerCase()))
  );

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.city.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.phone.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingDeliveries = orders.filter((o) => o.status === 'pending' || o.status === 'dispatched')
    .length;
  const lowStockCount = products.filter(
    (p) => (p.stockQuantity ?? 20) <= (p.lowStockThreshold ?? 5)
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5F2] text-neutral-900">
      {/* Top Admin Navigation Header */}
      <header className="bg-white border-b border-neutral-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="w-9 h-9 rounded-xl bg-[#E84D3D] text-white flex items-center justify-center font-bold text-sm shadow-xs"
            title="View Storefront"
          >
            MM
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-logo font-bold text-lg text-neutral-900 leading-tight">
                Mani Minars Portal
              </h1>
              <span className="text-[10px] bg-red-100 text-[#E84D3D] font-bold px-2 py-0.5 rounded-full">
                Secret Admin
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">Inventory, Deliveries & WhatsApp Logistics</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Supabase Cloud Connection Status */}
          <div
            title={
              isCloudConnected
                ? 'Supabase Cloud Database connected and listening for real-time changes'
                : 'Running on local offline cache. Set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY to enable multi-device sync.'
            }
            className={`hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isCloudConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <Database className="w-3 h-3" />
            <span>{isCloudConnected ? 'Supabase Synced' : 'Offline Cache'}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            title="Sync products with Supabase Cloud"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#E84D3D]' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-200"
          >
            Lock Portal
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Products</span>
              <Package className="w-4 h-4 text-[#E84D3D]" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{products.length}</div>
            <span className="text-[11px] text-neutral-500">Live in Kids & Juniors Catalog</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-[#F5BE38]" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{orders.length}</div>
            <span className="text-[11px] text-neutral-500">Recorded across Pakistan</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Deliveries</span>
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{pendingDeliveries}</div>
            <span className="text-[11px] text-blue-600 font-semibold">Pending / In Transit</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Order Value</span>
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              PKR {totalRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-green-600 font-semibold">COD & Card volume</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 rounded-2xl shadow-2xs">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'border-[#E84D3D] text-[#E84D3D]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Garments & Products ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('deliveries')}
              className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'deliveries'
                  ? 'border-[#E84D3D] text-[#E84D3D]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Deliveries & Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-[#E84D3D] text-[#E84D3D]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Delivery Rates & Couriers</span>
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E84D3D] hover:bg-[#DF3E2E] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PRODUCT MANAGEMENT                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Search and Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by title, category, age group..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 text-xs outline-none focus:ring-2 focus:ring-[#E84D3D]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={resetProductsToDefault}
                  className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50"
                  title="Restore default catalog"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Initial Catalog</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Item & Details</th>
                      <th className="py-3.5 px-4">Age Line</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price (PKR)</th>
                      <th className="py-3.5 px-4">Sizes Available</th>
                      <th className="py-3.5 px-4">Badges</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <img
                            src={prod.colors?.[0]?.image || prod.images?.[0] || FALLBACK_GARMENT_IMAGE}
                            alt={prod.name}
                            className="w-12 h-14 object-cover rounded-lg bg-neutral-100 shrink-0 border border-neutral-100"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              if (target.src !== FALLBACK_GARMENT_IMAGE) {
                                target.src = FALLBACK_GARMENT_IMAGE;
                              }
                            }}
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/product/${prod.id}`}
                              target="_blank"
                              className="font-bold text-neutral-900 hover:text-[#E84D3D] transition-colors truncate block"
                            >
                              {prod.name}
                            </Link>
                            <span className="text-[11px] text-neutral-400 line-clamp-1">
                              {prod.tagline}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                              prod.ageGroup === 'kids'
                                ? 'bg-red-50 text-[#E84D3D]'
                                : 'bg-yellow-50 text-neutral-800'
                            }`}
                          >
                            {prod.ageGroup === 'kids' ? 'Kids (0–10Y)' : 'Juniors (11–16Y)'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-neutral-600 uppercase text-[11px]">
                          {prod.category}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                          PKR {prod.price.toLocaleString()}
                          {prod.originalPrice && (
                            <span className="block text-[10px] text-neutral-400 line-through font-normal">
                              PKR {prod.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(prod)}
                            title="Click to edit sizes for this garment"
                            className="flex flex-wrap gap-1 max-w-xs text-left group/sz cursor-pointer"
                          >
                            {prod.sizes.map((s) => (
                              <span
                                key={s}
                                className="bg-neutral-100 group-hover/sz:bg-neutral-200 px-1.5 py-0.5 rounded text-[10px] text-neutral-700 font-semibold transition-colors"
                              >
                                {s}
                              </span>
                            ))}
                            {prod.sizes.length === 0 && (
                              <span className="text-[10px] text-amber-600 font-semibold">
                                None (Click to add)
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {prod.isNew && (
                              <span className="text-[10px] bg-neutral-900 text-white font-bold px-2 py-0.5 rounded">
                                New
                              </span>
                            )}
                            {prod.isSale && (
                              <span className="text-[10px] bg-red-100 text-[#E84D3D] font-bold px-2 py-0.5 rounded">
                                Sale
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(`Are you sure you want to remove "${prod.name}" from the store?`)
                                ) {
                                  deleteProduct(prod.id);
                                }
                              }}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DELIVERIES & ORDERS MANAGEMENT ("devely etc")                     */}
        {/* ========================================================================= */}
        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            {/* Filter and search bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, phone, city..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 text-xs outline-none focus:ring-2 focus:ring-[#E84D3D]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-neutral-500">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-white outline-none focus:ring-2 focus:ring-[#E84D3D] cursor-pointer"
                >
                  <option value="all">All Deliveries</option>
                  <option value="pending">Pending Dispatch</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="dispatched">Dispatched / In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Deliveries Cards List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-neutral-200/80 text-center">
                  <Truck className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-neutral-800">No matching deliveries found</p>
                  <p className="text-xs text-neutral-400">Try adjusting your search criteria</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  // Pre-format WhatsApp message for courier update
                  const waCustomerMsg = `Salam ${order.customer.fullName}! 👋 
This is Mani Minars Customer Logistics regarding your order #${order.id}.
Status: ${order.status.toUpperCase()}
Tracking Number: ${order.trackingNumber || 'Pending Courier Scan'}
Courier: ${order.courier || 'Trax Logistics'}
Total Payable: PKR ${order.total.toLocaleString()} (${order.paymentMethod.toUpperCase()})
Delivery Address: ${order.customer.address}, ${order.customer.city}`;

                  const cleanCustomerPhone = order.customer.phone.replace(/[^0-9]/g, '');

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-5 sm:p-6 space-y-4 transition-all hover:shadow-xs"
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-base text-neutral-900">{order.id}</span>
                          <span className="text-[11px] text-neutral-400">
                            {new Date(order.createdAt).toLocaleDateString('en-PK', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Current Status Pill */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'dispatched'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'confirmed'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {order.status === 'delivered' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {order.status === 'dispatched' && <Truck className="w-3.5 h-3.5" />}
                            {order.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                            <span>{order.status}</span>
                          </span>

                          <button
                            onClick={() => {
                              if (confirm(`Remove order ${order.id} from records?`)) {
                                deleteOrder(order.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content: Customer details + Items */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Customer & Destination info (5 cols) */}
                        <div className="md:col-span-5 space-y-1.5 text-xs">
                          <h4 className="font-bold text-neutral-900 text-sm">
                            {order.customer.fullName}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-500">{order.customer.phone}</span>
                            {/* WhatsApp button to message customer directly! */}
                            <a
                              href={`https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(
                                waCustomerMsg
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2 py-0.5 rounded-full transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp Customer</span>
                            </a>
                          </div>
                          <p className="text-neutral-500">{order.customer.email}</p>
                          <p className="text-neutral-700 font-medium pt-1">
                            📍 {order.customer.address}, <strong className="text-neutral-900">{order.customer.city}</strong>
                          </p>
                          {order.customer.notes && (
                            <p className="text-neutral-500 bg-neutral-50 p-2 rounded-lg border border-neutral-100 text-[11px]">
                              Note: {order.customer.notes}
                            </p>
                          )}
                        </div>

                        {/* Items ordered (4 cols) */}
                        <div className="md:col-span-4 text-xs space-y-2 border-t md:border-t-0 md:border-l border-neutral-100 md:pl-4">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-neutral-400">
                            Bag Contents ({order.items.length})
                          </span>
                          <div className="space-y-1.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px]">
                                <span className="font-medium text-neutral-800 line-clamp-1 max-w-[180px]">
                                  {item.quantity}x {item.product.name} ({item.selectedSize})
                                </span>
                                <span className="font-semibold text-neutral-900">
                                  PKR {(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-neutral-100 flex justify-between font-bold text-xs text-neutral-900">
                            <span>Total Payable ({order.paymentMethod.toUpperCase()}):</span>
                            <span>PKR {order.total.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Delivery fulfillment actions (3 cols) */}
                        <div className="md:col-span-3 text-xs space-y-2.5 border-t md:border-t-0 md:border-l border-neutral-100 md:pl-4">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-neutral-400 block">
                            Update Delivery Status
                          </span>

                          <div>
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-[#E84D3D]"
                            >
                              <option value="pending">Pending Dispatch</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="dispatched">Dispatched / In Transit</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>

                          {/* Courier tracking */}
                          <div>
                            <input
                              type="text"
                              placeholder="Tracking # (e.g. TRX-90412)"
                              value={order.trackingNumber || ''}
                              onChange={(e) =>
                                updateOrderStatus(order.id, order.status, e.target.value, order.courier)
                              }
                              className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              placeholder="Courier (Trax / TCS)"
                              value={order.courier || ''}
                              onChange={(e) =>
                                updateOrderStatus(order.id, order.status, order.trackingNumber, e.target.value)
                              }
                              className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DELIVERY & LOGISTICS SETTINGS ("devely etc")                      */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-6 space-y-6">
            <div>
              <h2 className="font-logo font-bold text-lg text-neutral-900">
                Nationwide Delivery Rates & Thresholds
              </h2>
              <p className="text-xs text-neutral-500">
                Adjust shipping fees and free delivery rules that display across the storefront and calculate at checkout.
              </p>
            </div>

            <form onSubmit={handleSaveDeliverySettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Standard Delivery Fee (PKR)
                  </label>
                  <div className="flex rounded-xl border border-neutral-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#E84D3D]">
                    <span className="bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-500 border-r border-neutral-200">
                      PKR
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={deliveryForm.standardDeliveryFee}
                      onChange={(e) =>
                        setDeliveryForm({
                          ...deliveryForm,
                          standardDeliveryFee: Number(e.target.value),
                        })
                      }
                      className="flex-1 text-xs px-3 py-2 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Free Delivery Threshold (PKR)
                  </label>
                  <div className="flex rounded-xl border border-neutral-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#E84D3D]">
                    <span className="bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-500 border-r border-neutral-200">
                      PKR
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={deliveryForm.freeShippingThreshold}
                      onChange={(e) =>
                        setDeliveryForm({
                          ...deliveryForm,
                          freeShippingThreshold: Number(e.target.value),
                        })
                      }
                      className="flex-1 text-xs px-3 py-2 outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    Orders above this amount unlock 100% Free Shipping.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Primary Courier Services
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryForm.courierName}
                    onChange={(e) =>
                      setDeliveryForm({ ...deliveryForm, courierName: e.target.value })
                    }
                    placeholder="e.g. Trax Logistics & TCS"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Estimated Delivery Window
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryForm.estimatedDeliveryDays}
                    onChange={(e) =>
                      setDeliveryForm({
                        ...deliveryForm,
                        estimatedDeliveryDays: e.target.value,
                      })
                    }
                    placeholder="e.g. 2–4 Business Days"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1E1E1E] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Save Delivery Settings
                </button>

                {settingsSavedMessage && (
                  <span className="text-xs text-green-600 font-bold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Settings Updated Successfully!</span>
                  </span>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* PRODUCT ADD / EDIT MODAL                                                  */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 my-8 border border-neutral-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="font-logo font-bold text-xl text-neutral-900">
                  {editingProductId ? 'Edit Product' : 'Add New Garment'}
                </h3>
                <p className="text-xs text-neutral-400">
                  Fill in the design details to publish to the catalog
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Garment Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Embroidered Kurta & Pajama Set"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Short Tagline *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.tagline}
                    onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                    placeholder="e.g. Breathable organic cotton coordinate"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                  />
                </div>
              </div>

              {/* Age Group & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Age Group Line *
                  </label>
                  <select
                    value={productForm.ageGroup}
                    onChange={(e) =>
                      setProductForm({ ...productForm, ageGroup: e.target.value as AgeGroup })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D] bg-white cursor-pointer"
                  >
                    <option value="kids">Little Loom Kids (0–10 Years)</option>
                    <option value="juniors">Little Loom Juniors (11–16 Years)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({ ...productForm, category: e.target.value as Category })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D] bg-white cursor-pointer"
                  >
                    <option value="sets">Sets & Coordinates</option>
                    <option value="dresses">Dresses & Frocks</option>
                    <option value="tops">Tees & Polos</option>
                    <option value="hoodies-jackets">Hoodies & Jackets</option>
                    <option value="knitwear">Knitwear</option>
                    <option value="bottoms">Bottoms & Cargos</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              {/* Garment Sizes (Fully Editable & Customizable) */}
              <div className="space-y-3 p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-[#E84D3D] shrink-0">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-neutral-800 text-xs">
                        Garment Sizes *
                      </label>
                      <p className="text-[11px] text-neutral-500">
                        Select available sizes or add custom sizing for this piece.
                      </p>
                    </div>
                  </div>

                  {/* Preset quick actions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSelectAllKidsSizes}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-100 text-neutral-700 text-[11px] font-semibold border border-neutral-200 transition-colors cursor-pointer"
                    >
                      + All Kids (1–10Y)
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAllJuniorsSizes}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-100 text-neutral-700 text-[11px] font-semibold border border-neutral-200 transition-colors cursor-pointer"
                    >
                      + All Juniors (11–16Y)
                    </button>
                    {productForm.sizes.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllSizes}
                        className="px-2 py-1 rounded-lg text-neutral-500 hover:text-red-600 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Standard Kids & Juniors size toggle chips */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {productForm.ageGroup === 'juniors' ? 'Recommended Juniors Sizes:' : 'Recommended Kids Sizes:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(productForm.ageGroup === 'juniors' ? JUNIORS_PRESET_SIZES : KIDS_PRESET_SIZES).map((sz) => {
                        const isSelected = productForm.sizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleToggleSize(sz)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-[#E84D3D] text-white border-[#E84D3D] shadow-xs scale-[1.02]'
                                : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            <span>{sz}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Secondary sizes (other age group + specialty sizes) */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {productForm.ageGroup === 'juniors' ? 'Kids & Specialty Sizes:' : 'Juniors & Specialty Sizes:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(productForm.ageGroup === 'juniors'
                        ? [...KIDS_PRESET_SIZES, ...SPECIALTY_PRESET_SIZES]
                        : [...JUNIORS_PRESET_SIZES, ...SPECIALTY_PRESET_SIZES]
                      ).map((sz) => {
                        const isSelected = productForm.sizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleToggleSize(sz)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border flex items-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-[#E84D3D] text-white border-[#E84D3D] shadow-xs'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            <span>{sz}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Add Custom Size Input */}
                <div className="pt-2 border-t border-neutral-200/60 flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSize();
                        }
                      }}
                      placeholder="Add custom size (e.g. 10-11Y, XL, Custom)..."
                      className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D] bg-white text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddCustomSize()}
                    disabled={!customSizeInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size</span>
                  </button>
                </div>

                {/* Active Selected Sizes List */}
                <div className="pt-2 border-t border-neutral-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                      Currently Active Sizes ({productForm.sizes.length})
                    </span>
                    {productForm.sizes.length === 0 && (
                      <span className="text-[11px] font-semibold text-amber-600">
                        ⚠️ Please select at least one size
                      </span>
                    )}
                  </div>
                  {productForm.sizes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {productForm.sizes.map((sz, idx) => (
                        <span
                          key={`${sz}-${idx}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-xs font-bold"
                        >
                          {editingSizeIndex === idx ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editingSizeText}
                                onChange={(e) => setEditingSizeText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveEditedSize(idx);
                                  } else if (e.key === 'Escape') {
                                    handleCancelEditSize();
                                  }
                                }}
                                autoFocus
                                className="w-16 px-1.5 py-0.5 text-xs bg-neutral-800 text-white border border-neutral-600 rounded outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEditedSize(idx)}
                                className="text-green-400 hover:text-green-300 p-0.5 cursor-pointer"
                                title="Save size"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEditSize}
                                className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span>{sz}</span>
                              <button
                                type="button"
                                onClick={() => handleStartEditSize(idx, sz)}
                                className="text-neutral-400 hover:text-[#F5BE38] p-0.5 transition-colors cursor-pointer"
                                title={`Edit size ${sz}`}
                              >
                                <Edit className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSize(sz)}
                                className="text-neutral-400 hover:text-red-400 rounded p-0.5 transition-colors cursor-pointer"
                                title={`Remove ${sz}`}
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">
                      No sizes selected yet. Click any size chip above or type a custom size.
                    </p>
                  )}
                </div>
              </div>

              {/* Pricing & Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Original / Strikethrough Price (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.originalPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, originalPrice: Number(e.target.value) })
                    }
                    placeholder="Optional"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isSale}
                      onChange={(e) => setProductForm({ ...productForm, isSale: e.target.checked })}
                      className="rounded text-[#E84D3D] focus:ring-[#E84D3D]"
                    />
                    <span className="font-bold">Sale Event</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isNew}
                      onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                      className="rounded text-[#E84D3D] focus:ring-[#E84D3D]"
                    />
                    <span className="font-bold">New Arrival</span>
                  </label>
                </div>
              </div>

              {/* Inventory & Stock Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Warehouse Stock Units *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stockQuantity}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D] bg-white text-xs font-bold"
                  />
                  <span className="text-[10px] text-neutral-400">Total units available</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Low Stock Alert Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.lowStockThreshold}
                    onChange={(e) =>
                      setProductForm({ ...productForm, lowStockThreshold: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D] bg-white text-xs font-bold"
                  />
                  <span className="text-[10px] text-neutral-400">Triggers low-stock warning</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    SKU / Tracking Code
                  </label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. MM-KID-104"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D] bg-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-neutral-400">Warehouse code</span>
                </div>
              </div>

              {/* Garment Image Upload & Color Swatch */}
              <div className="space-y-3 p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-neutral-800 text-xs">
                      Garment Photograph *
                    </label>
                    <p className="text-[11px] text-neutral-500">
                      Upload garment photo from your phone or computer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUrlFallback(!showUrlFallback)}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{showUrlFallback ? 'Switch to Upload Image' : 'Or paste web image URL'}</span>
                  </button>
                </div>

                {/* Native hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="garment-file-upload-input"
                />

                {!showUrlFallback ? (
                  <div>
                    {productForm.imageUrl ? (
                      /* Preview of uploaded image with replace and remove actions */
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs">
                        <div className="relative w-24 h-28 shrink-0 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shadow-xs">
                          <img
                            src={productForm.imageUrl}
                            alt="Garment Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => {
                              setImageUploadError('Garment photo preview failed to load. Please re-upload or select another photo.');
                            }}
                          />
                        </div>

                        <div className="flex-1 space-y-1.5 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-green-700">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>Photo uploaded & ready</span>
                          </div>
                          <p className="text-[11px] text-neutral-500">
                            Garment photo is optimized and will appear on the catalog & product pages.
                          </p>
                          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Replace Photo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductForm((p) => ({ ...p, imageUrl: '' }))}
                              className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Drag & drop upload dropzone */
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                          isDragging
                            ? 'border-[#E84D3D] bg-red-50/60 scale-[1.01]'
                            : 'border-neutral-300 hover:border-[#E84D3D] bg-white hover:bg-neutral-50/60'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[#E84D3D]">
                          {isProcessingImage ? (
                            <RefreshCw className="w-6 h-6 animate-spin" />
                          ) : (
                            <Upload className="w-6 h-6" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-neutral-800">
                            {isProcessingImage
                              ? 'Optimizing garment image...'
                              : 'Click to upload image or drag & drop photo here'}
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            Supports PNG, JPG, WEBP, or HEIC (Auto-optimized for store speed)
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase tracking-wider">
                          <FileUp className="w-3 h-3 text-neutral-500" />
                          <span>Browse Device / Photos</span>
                        </span>
                      </div>
                    )}

                    {imageUploadError && (
                      <p className="text-xs text-red-600 font-medium mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{imageUploadError}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  /* Web Image URL fallback */
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://example.com/garment-photo.jpg"
                      value={productForm.imageUrl}
                      onChange={(e) =>
                        setProductForm({ ...productForm, imageUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D] bg-white text-xs"
                    />
                    {productForm.imageUrl && (
                      <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-neutral-200">
                        <img
                          src={productForm.imageUrl}
                          alt="Preview"
                          className="w-12 h-14 object-cover rounded-md"
                          referrerPolicy="no-referrer"
                          onError={() => setImageUploadError('Image failed to load from this URL.')}
                        />
                        <span className="text-[11px] text-neutral-500">URL preview</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Color Name & Swatch */}
                <div className="pt-2 border-t border-neutral-200/60">
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 text-xs mb-1.5">
                    Garment Color & Tone
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={productForm.colorHex}
                      onChange={(e) =>
                        setProductForm({ ...productForm, colorHex: e.target.value })
                      }
                      className="w-9 h-9 rounded-xl border border-neutral-200 p-0.5 cursor-pointer bg-white"
                      title="Select garment hex color"
                    />
                    <input
                      type="text"
                      value={productForm.colorName}
                      onChange={(e) =>
                        setProductForm({ ...productForm, colorName: e.target.value })
                      }
                      placeholder="e.g. Sunset Coral or Powder Mint"
                      className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 outline-none bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Fabric & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Fabric Composition
                  </label>
                  <input
                    type="text"
                    value={productForm.fabric}
                    onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Product Description
                  </label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#E84D3D]"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E84D3D] hover:bg-[#DF3E2E] text-white font-bold uppercase tracking-wider shadow-xs"
                >
                  {editingProductId ? 'Update Garment' : 'Publish to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
