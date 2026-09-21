import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product, Order, OrderStatus, DeliverySettings, AgeGroup, Category } from '../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products';
import { getSupabase, isSupabaseConfigured } from '../services/supabase';

interface ProductContextType {
  products: Product[];
  addProduct: (newProduct: Omit<Product, 'id'>) => Promise<Product> | Product;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void> | void;
  updateProductStock: (id: string, newStock: number) => Promise<void> | void;
  reduceStockForOrder: (order: Order) => Promise<void> | void;
  deleteProduct: (id: string) => Promise<void> | void;
  resetProductsToDefault: () => Promise<void> | void;
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
  isLoading: boolean;
  isCloudConnected: boolean;
  refreshProducts: () => Promise<void>;
}

const DEFAULT_DELIVERY: DeliverySettings = {
  standardDeliveryFee: 250,
  expressDeliveryFee: 450,
  freeShippingThreshold: 4000,
  courierName: 'Trax Logistics & TCS Express',
  estimatedDeliveryDays: '2–4 Business Days',
  expressDeliveryDays: '1–2 Business Days',
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
  return prods.map((p, idx) => {
    const stock = typeof p.stockQuantity === 'number' ? p.stockQuantity : Math.max(4, 20 - idx * 2);
    return {
      ...p,
      sku: p.sku || `MM-${p.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'GARMENT'}`,
      stockQuantity: stock,
      lowStockThreshold: p.lowStockThreshold || 5,
      inStock: stock > 0,
      colors: (p.colors || []).map((c) => ({
        ...c,
        image: sanitizeGarmentImageUrl(c.image),
      })),
      images: (p.images && p.images.length > 0 ? p.images : [FALLBACK_GARMENT_IMAGE]).map((img) =>
        sanitizeGarmentImageUrl(img)
      ),
    };
  });
}

/**
 * Bidirectional mapper: Supabase row -> Product object
 * Handles both snake_case (Postgres standard) and camelCase columns
 */
export function rowToProduct(row: any): Product {
  const stock =
    typeof (row.stock_quantity ?? row.stockQuantity) === 'number'
      ? row.stock_quantity ?? row.stockQuantity
      : 15;

  const rawColors = row.colors;
  const colors = Array.isArray(rawColors)
    ? rawColors.map((c: any) => ({
        name: String(c?.name || 'Default'),
        hex: String(c?.hex || '#000000'),
        image: sanitizeGarmentImageUrl(c?.image),
      }))
    : [];

  const rawImages = row.images;
  const images =
    Array.isArray(rawImages) && rawImages.length > 0
      ? rawImages.map((img: string) => sanitizeGarmentImageUrl(img))
      : [FALLBACK_GARMENT_IMAGE];

  return {
    id: String(row.id),
    sku: row.sku || `MM-${String(row.id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`,
    name: String(row.name || 'Untitled Product'),
    tagline: String(row.tagline || ''),
    price: Number(row.price) || 0,
    originalPrice:
      row.original_price != null
        ? Number(row.original_price)
        : row.originalPrice != null
        ? Number(row.originalPrice)
        : undefined,
    isNew: Boolean(row.is_new ?? row.isNew ?? false),
    isSale: Boolean(row.is_sale ?? row.isSale ?? false),
    ageGroup: (row.age_group ?? row.ageGroup ?? 'kids') as AgeGroup,
    category: (row.category || 'sets') as Category,
    sizes: Array.isArray(row.sizes) ? row.sizes.map(String) : ['2–3Y', '3–4Y', '4–5Y'],
    colors,
    images,
    description: String(row.description || ''),
    details: Array.isArray(row.details) ? row.details.map(String) : [],
    fabric: String(row.fabric || '100% Breathable Cotton'),
    rating: Number(row.rating) || 5.0,
    reviewCount: Number(row.review_count ?? row.reviewCount) || 12,
    stockQuantity: stock,
    lowStockThreshold: Number(row.low_stock_threshold ?? row.lowStockThreshold) || 5,
    inStock: Boolean(row.in_stock ?? row.inStock ?? stock > 0),
  };
}

/**
 * Bidirectional mapper: Product object -> Supabase database row
 */
export function productToRow(product: Product): Record<string, any> {
  const stock = typeof product.stockQuantity === 'number' ? product.stockQuantity : 15;
  return {
    id: product.id,
    sku: product.sku || `MM-${product.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`,
    name: product.name,
    tagline: product.tagline || '',
    price: product.price,
    original_price: product.originalPrice ?? null,
    is_new: Boolean(product.isNew),
    is_sale: Boolean(product.isSale),
    age_group: product.ageGroup,
    category: product.category,
    sizes: product.sizes || [],
    colors: product.colors || [],
    images: product.images && product.images.length > 0 ? product.images : [FALLBACK_GARMENT_IMAGE],
    description: product.description || '',
    details: product.details || [],
    fabric: product.fabric || '100% Breathable Cotton',
    rating: product.rating ?? 5.0,
    review_count: product.reviewCount ?? 12,
    stock_quantity: stock,
    low_stock_threshold: product.lowStockThreshold ?? 5,
    in_stock: stock > 0,
    updated_at: new Date().toISOString(),
  };
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
  // 1. Products state: loads from cache initially for fast render, then synchronizes with Supabase
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('mani_minars_products_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        return sanitizeProducts(parsed);
      }
    } catch (e) {
      console.error('Error loading products from local storage fallback:', e);
    }
    return DEFAULT_PRODUCTS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const isInitialMount = useRef(true);

  // Helper: Persist local cache
  const saveToLocalCache = useCallback((prods: Product[]) => {
    try {
      localStorage.setItem('mani_minars_products_v2', JSON.stringify(prods));
    } catch (e) {
      console.error('Error saving products cache', e);
    }
  }, []);

  // 2. Fetch products from Supabase
  const refreshProducts = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsCloudConnected(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase query error, retaining cached catalog:', error.message);
        setIsCloudConnected(false);
        return;
      }

      setIsCloudConnected(true);

      if (!data || data.length === 0) {
        // Table is empty on fresh Supabase setup: auto-seed catalog from defaults
        console.info('Fresh Supabase setup detected. Auto-seeding initial catalog to Supabase...');
        const seedRows = DEFAULT_PRODUCTS.map(productToRow);
        const { error: seedError } = await supabase.from('products').upsert(seedRows);
        if (seedError) {
          console.error('Error auto-seeding products into Supabase:', seedError);
        } else {
          console.info('Auto-seeded products to Supabase successfully!');
          setProducts(DEFAULT_PRODUCTS);
          saveToLocalCache(DEFAULT_PRODUCTS);
        }
      } else {
        const loaded = sanitizeProducts(data.map(rowToProduct));
        setProducts(loaded);
        saveToLocalCache(loaded);
      }
    } catch (err) {
      console.error('Failed to sync products with Supabase:', err);
      setIsCloudConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [saveToLocalCache]);

  // 3. Mount effect: load from Supabase and subscribe to real-time events across all devices
  useEffect(() => {
    refreshProducts();

    const supabase = getSupabase();
    if (!supabase) return;

    // Listen to real-time database changes across devices
    const channel = supabase
      .channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const newProd = rowToProduct(payload.new);
            setProducts((prev) => {
              if (prev.some((p) => p.id === newProd.id)) {
                return prev.map((p) => (p.id === newProd.id ? newProd : p));
              }
              const updated = [newProd, ...prev];
              saveToLocalCache(updated);
              return updated;
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedProd = rowToProduct(payload.new);
            setProducts((prev) => {
              const updated = prev.map((p) => (p.id === updatedProd.id ? updatedProd : p));
              saveToLocalCache(updated);
              return updated;
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deletedId = String(payload.old.id);
            setProducts((prev) => {
              const updated = prev.filter((p) => p.id !== deletedId);
              saveToLocalCache(updated);
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsCloudConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshProducts, saveToLocalCache]);

  // Sync state to local cache when updated locally
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    saveToLocalCache(products);
  }, [products, saveToLocalCache]);

  // 4. Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('mani_minars_orders_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading orders from storage', e);
    }
    return INITIAL_ORDERS;
  });

  // 5. Delivery Settings state
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(() => {
    try {
      const stored = localStorage.getItem('mani_minars_delivery_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading delivery settings', e);
    }
    return DEFAULT_DELIVERY;
  });

  useEffect(() => {
    try {
      localStorage.setItem('mani_minars_orders_v1', JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders to storage', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('mani_minars_delivery_v1', JSON.stringify(deliverySettings));
    } catch (e) {
      console.error('Error saving delivery settings', e);
    }
  }, [deliverySettings]);

  // 6. Admin Add Product - saves directly to Supabase & syncs everywhere
  const addProduct = async (newProductData: Omit<Product, 'id'>): Promise<Product> => {
    const newId = `product-${Date.now()}`;
    const fullProduct: Product = {
      ...newProductData,
      id: newId,
      images: newProductData.images && newProductData.images.length > 0
        ? newProductData.images.map(sanitizeGarmentImageUrl)
        : [FALLBACK_GARMENT_IMAGE],
      colors: (newProductData.colors || []).map((c) => ({
        ...c,
        image: sanitizeGarmentImageUrl(c.image),
      })),
      stockQuantity: typeof newProductData.stockQuantity === 'number' ? newProductData.stockQuantity : 15,
      inStock: (newProductData.stockQuantity ?? 15) > 0,
    };

    // Optimistically update local view immediately
    setProducts((prev) => [fullProduct, ...prev]);

    const supabase = getSupabase();
    if (supabase) {
      try {
        const row = productToRow(fullProduct);
        const { error } = await supabase.from('products').insert([row]);
        if (error) {
          console.error('Failed to insert product into Supabase:', error.message);
        } else {
          setIsCloudConnected(true);
        }
      } catch (err) {
        console.error('Network error saving product to Supabase:', err);
      }
    }

    return fullProduct;
  };

  // 7. Update Product - syncs to Supabase
  const updateProduct = async (id: string, updated: Partial<Product>) => {
    let updatedFullProduct: Product | undefined;

    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod;
        const next = { ...prod, ...updated };
        if (typeof next.stockQuantity === 'number') {
          next.inStock = next.stockQuantity > 0;
        }
        updatedFullProduct = next;
        return next;
      })
    );

    const supabase = getSupabase();
    if (supabase && updatedFullProduct) {
      try {
        const row = productToRow(updatedFullProduct);
        const { error } = await supabase.from('products').update(row).eq('id', id);
        if (error) {
          console.error('Failed to update product in Supabase:', error.message);
        }
      } catch (err) {
        console.error('Error updating product in Supabase:', err);
      }
    }
  };

  // 8. Update specific product stock
  const updateProductStock = async (id: string, newStock: number) => {
    const safeStock = Math.max(0, Math.floor(newStock));
    const inStock = safeStock > 0;

    setProducts((prev) =>
      prev.map((prod) =>
        prod.id === id
          ? {
              ...prod,
              stockQuantity: safeStock,
              inStock,
            }
          : prod
      )
    );

    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('products')
          .update({
            stock_quantity: safeStock,
            in_stock: inStock,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      } catch (err) {
        console.error('Error updating stock in Supabase:', err);
      }
    }
  };

  // 9. Deduct inventory when an order is placed
  const reduceStockForOrder = async (order: Order) => {
    if (!order.items || order.items.length === 0) return;

    const itemMap = new Map<string, number>();
    order.items.forEach((item) => {
      const cur = itemMap.get(item.productId) || 0;
      itemMap.set(item.productId, cur + item.quantity);
    });

    const updates: { id: string; stockQuantity: number; inStock: boolean }[] = [];

    setProducts((prev) => {
      return prev.map((prod) => {
        const orderedQty = itemMap.get(prod.id);
        if (!orderedQty) return prod;

        const currentStock = prod.stockQuantity ?? 15;
        const remainingStock = Math.max(0, currentStock - orderedQty);
        const inStock = remainingStock > 0;

        updates.push({ id: prod.id, stockQuantity: remainingStock, inStock });

        return {
          ...prod,
          stockQuantity: remainingStock,
          inStock,
        };
      });
    });

    const supabase = getSupabase();
    if (supabase && updates.length > 0) {
      for (const update of updates) {
        try {
          await supabase
            .from('products')
            .update({
              stock_quantity: update.stockQuantity,
              in_stock: update.inStock,
              updated_at: new Date().toISOString(),
            })
            .eq('id', update.id);
        } catch (err) {
          console.error('Error reducing stock in Supabase for product', update.id, err);
        }
      }
    }
  };

  // 10. Delete Product - syncs to Supabase
  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id));

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          console.error('Failed to delete product from Supabase:', error.message);
        }
      } catch (err) {
        console.error('Error deleting product from Supabase:', err);
      }
    }
  };

  // 11. Reset to default catalog
  const resetProductsToDefault = async () => {
    setProducts(DEFAULT_PRODUCTS);
    saveToLocalCache(DEFAULT_PRODUCTS);

    const supabase = getSupabase();
    if (supabase) {
      try {
        // Delete existing and insert defaults
        await supabase.from('products').delete().neq('id', 'placeholder_non_existent');
        const rows = DEFAULT_PRODUCTS.map(productToRow);
        await supabase.from('products').upsert(rows);
      } catch (err) {
        console.error('Error resetting products in Supabase:', err);
      }
    }
  };

  // Orders methods
  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    reduceStockForOrder(order);
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
        updateProductStock,
        reduceStockForOrder,
        deleteProduct,
        resetProductsToDefault,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        deliverySettings,
        updateDeliverySettings,
        isLoading,
        isCloudConnected,
        refreshProducts,
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
