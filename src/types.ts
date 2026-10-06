export type AgeGroup = 'kids' | 'juniors';

export type Category = 
  | 'casual-shirts'
  | 'pants'
  | 't-shirts'
  | 'cargo'
  | 'shorts'
  | 'tops'
  | 'sets'
  | 'jackets'
  | 'accessories'
  // Legacy values preserved for backward-compatibility with existing stored data
  | 'dresses'
  | 'hoodies-jackets'
  | 'knitwear'
  | 'bottoms';

export const PRODUCT_CATEGORIES = [
  { id: 'casual-shirts', label: 'Casual Shirts' },
  { id: 'pants', label: 'Pants' },
  { id: 't-shirts', label: 'T-Shirts' },
  { id: 'cargo', label: 'Cargo' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'tops', label: 'Tops' },
  { id: 'sets', label: 'Sets' },
  { id: 'jackets', label: 'Jackets' },
  { id: 'accessories', label: 'Accessories' },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  'casual-shirts': 'Casual Shirts',
  pants: 'Pants',
  't-shirts': 'T-Shirts',
  cargo: 'Cargo',
  shorts: 'Shorts',
  tops: 'Tops',
  sets: 'Sets',
  jackets: 'Jackets',
  accessories: 'Accessories',
  // Backward compatibility labels for existing legacy records
  'hoodies-jackets': 'Jackets',
  bottoms: 'Pants',
  dresses: 'Tops',
  knitwear: 'Tops',
};

export function formatCategory(cat: string | undefined | null): string {
  if (!cat) return 'Sets';
  const lower = cat.toLowerCase();
  if (CATEGORY_LABELS[lower]) {
    return CATEGORY_LABELS[lower];
  }
  return cat
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export interface ProductColor {
  name: string;
  hex: string;
  image: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  isNew?: boolean;
  isSale?: boolean;
  ageGroup: AgeGroup;
  category: Category;
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  description: string;
  details: string[];
  fabric: string;
  rating: number;
  reviewCount: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  inStock?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  selectedSize: string;
  selectedColor: {
    name: string;
    hex: string;
    image?: string;
  };
  quantity: number;
  price: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  description: string;
  isActive: boolean;
}

export type ShippingTier = 'standard' | 'express';

export interface ShippingOption {
  id: ShippingTier;
  name: string;
  price: number;
  estimatedDays: string;
  description: string;
}

export interface FilterState {
  category: string;
  size: string;
  color: string;
  priceRange: string;
  ageGroup: string;
  searchQuery: string;
}

export type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high';

export type OrderStatus =
  | 'Pending Verification'
  | 'Approved'
  | 'Rejected'
  | 'pending'
  | 'confirmed'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'raast' | 'cod' | 'card' | 'wallet';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Order {
  id: string;
  order_id?: string;
  createdAt: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    notes?: string;
  };
  items: CartItem[];
  products_json?: any;
  customer_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  total_amount?: number;
  paymentMethod: PaymentMethod;
  payment_method?: string;
  paymentReference?: string;
  payment_reference?: string;
  paymentProofImage?: string;
  paymentProofUrl?: string;
  payment_proof_url?: string;
  payment_proof_image?: string;
  paymentStatus?: PaymentStatus;
  shippingTier?: ShippingTier;
  couponCode?: string;
  status: OrderStatus;
  trackingNumber?: string;
  courier?: string;
}

export interface DeliverySettings {
  standardDeliveryFee: number;
  expressDeliveryFee: number;
  freeShippingThreshold: number;
  courierName: string;
  estimatedDeliveryDays: string;
  expressDeliveryDays: string;
}

