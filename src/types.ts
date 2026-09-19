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

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'card' | 'wallet' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Order {
  id: string;
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
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
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

