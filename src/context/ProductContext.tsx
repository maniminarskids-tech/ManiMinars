import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, OrderStatus, DeliverySettings } from '../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products';

interface ProductContextType {
  products: Product[];
  addProduct: (newProduct: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetProductsToDefault: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    courier?: string
  ) => void;
  deleteOrder: (orderId: string) => void;
  deliverySettings: DeliverySettings;
  updateDeliverySettings: (settings: Partial<DeliverySettings>) => void;
}

const DEFAULT_DELIVERY: DeliverySettings = {
  standardDeliveryFee: 250,
  freeShippingThreshold: 4000,
  courierName: 'Trax Logistics & TCS',
  estimatedDeliveryDays: '2–4 Business Days',
};

export const FALLBACK_GARMENT_IMAGE =
  'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80';

const URL_REPLACEMENTS: Record<string, string> = {
  'photo-1471286174890-9c112ffca564':
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
  'photo-1520012218364-3bfae6b8c8d3':
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
};

export function sanitizeGarmentImageUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return FALLBACK_GARMENT_IMAGE;
  }
  for (const [needle, fixedUrl] of Object.entries(URL_REPLACEMENTS)) {
    if (url.includes(needle)) {
      return fixedUrl;
    }
  }
  return url;
}

export function sanitizeProducts(prods: Product[]): Product[] {
  if (!Array.isArray(prods) || prods.length === 0) return DEFAULT_PRODUCTS;
  return prods.map((p) => ({
    ...p,
    colors: (p.colors || []).map((c) => ({
      ...c,
      image: sanitizeGarmentImageUrl(c.image),
    })),
    images: (p.images && p.images.length > 0 ? p.images : [FALLBACK_GARMENT_IMAGE]).map((img) =>
      sanitizeGarmentImageUrl(img)
    ),
  }));
}

// Initial realistic Pakistani mock orders for the admin portal
const INITIAL_ORDERS: Order[] = [
  {
    id: 'MM-94821',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    customer: {
      fullName: 'Ayesha Tariq',
      phone: '+923004829182',
      email: 'ayesha.tariq@gmail.com',
      city: 'Lahore',
      address: 'House 14-B, Gulberg III',
      notes: 'Please ring bell twice upon arrival',
    },
    items: [
      {
        id: 'cart-1',
        productId: 'kids-cotton-set',
        product: DEFAULT_PRODUCTS[0],
        selectedSize: '3–4Y',
        selectedColor: { name: 'Sunset Coral', hex: '#E84D3D' },
        quantity: 1,
        price: 2450,
      },
      {
        id: 'cart-2',
        productId: 'kids-rainbow-dress',
        product: DEFAULT_PRODUCTS[1],
        selectedSize: '4–5Y',
        selectedColor: { name: 'Warm Marigold', hex: '#F5BE38' },
        quantity: 1,
        price: 3200,
      },
    ],
    subtotal: 5650,
    deliveryFee: 0,
    discount: 0,
    total: 5650,
    paymentMethod: 'cod',
    status: 'dispatched',
    trackingNumber: 'TRX-7482910',
    courier: 'Trax Logistics',
  },
  {
    id: 'MM-94822',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    customer: {
      fullName: 'Kamran Ali Khan',
      phone: '+923219482019',
      email: 'kamran.khan@yahoo.com',
      city: 'Karachi',
      address: 'Apartment 402, Creek Vistas, Phase 8, DHA',
    },
    items: [
      {
        id: 'cart-3',
        productId: 'juniors-varsity-jacket',
        product: DEFAULT_PRODUCTS[6],
        selectedSize: '13–14Y',
        selectedColor: { name: 'Goldenrod & Black', hex: '#F5BE38' },
        quantity: 1,
        price: 5450,
      },
    ],
    subtotal: 5450,
    deliveryFee: 0,
    discount: 0,
    total: 5450,
    paymentMethod: 'card',
    status: 'delivered',
    trackingNumber: 'TCS-902184',
    courier: 'TCS Express',
  },
  {
    id: 'MM-94823',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer: {
      fullName: 'Zainab Bilal',
      phone: '+923335198273',
      email: 'zainab.b@hotmail.com',
      city: 'Islamabad',
      address: 'Street 9, Sector F-7/2',
      notes: 'Call before dispatching rider',
    },
    items: [
      {
        id: 'cart-4',
        productId: 'juniors-cargo-pant',
        product: DEFAULT_PRODUCTS[7],
        selectedSize: '11–12Y',
        selectedColor: { name: 'Utility Olive', hex: '#5B6E52' },
        quantity: 2,
        price: 3450,
      },
    ],
    subtotal: 6900,
    deliveryFee: 0,
    discount: 0,
    total: 6900,
    paymentMethod: 'cod',
    status: 'pending',
  },
];

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Products state (auto-healed and sanitized against broken or stale URLs)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('mani_minars_products_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        return sanitizeProducts(parsed);
      }
    } catch (e) {
      console.error('Error loading products from storage', e);
    }
    return DEFAULT_PRODUCTS;
  });

  // 2. Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('mani_minars_orders_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading orders from storage', e);
    }
    return INITIAL_ORDERS;
  });

  // 3. Delivery Settings state
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(() => {
    try {
      const stored = localStorage.getItem('mani_minars_delivery_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading delivery settings', e);
    }
    return DEFAULT_DELIVERY;
  });

  // Persist products
  useEffect(() => {
    try {
      localStorage.setItem('mani_minars_products_v2', JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to storage', e);
    }
  }, [products]);

  // Persist orders
  useEffect(() => {
    try {
      localStorage.setItem('mani_minars_orders_v1', JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders to storage', e);
    }
  }, [orders]);

  // Persist delivery settings
  useEffect(() => {
    try {
      localStorage.setItem('mani_minars_delivery_v1', JSON.stringify(deliverySettings));
    } catch (e) {
      console.error('Error saving delivery settings', e);
    }
  }, [deliverySettings]);

  // Add Product
  const addProduct = (newProductData: Omit<Product, 'id'>): Product => {
    const newId = `product-${Date.now()}`;
    const fullProduct: Product = {
      ...newProductData,
      id: newId,
    };
    setProducts((prev) => [fullProduct, ...prev]);
    return fullProduct;
  };

  // Update Product
  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, ...updated } : prod))
    );
  };

  // Delete Product
  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
  };

  // Reset to default catalog
  const resetProductsToDefault = () => {
    setProducts(DEFAULT_PRODUCTS);
  };

  // Orders methods
  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    courier?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber,
            courier: courier !== undefined ? courier : o.courier,
          };
        }
        return o;
      })
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const updateDeliverySettings = (settings: Partial<DeliverySettings>) => {
    setDeliverySettings((prev) => ({ ...prev, ...settings }));
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProductsToDefault,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        deliverySettings,
        updateDeliverySettings,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
