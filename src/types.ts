export type AgeGroup = 'kids' | 'juniors';

export type Category = 
  | 'sets'
  | 'dresses'
  | 'tops'
  | 'hoodies-jackets'
  | 'knitwear'
  | 'bottoms'
  | 'accessories';

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
  colors: {
    name: string;
    hex: string;
    image: string;
  }[];
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

