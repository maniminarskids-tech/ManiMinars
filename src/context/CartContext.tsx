import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, Coupon, ShippingTier } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    selectedSize: string,
    selectedColor: { name: string; hex: string },
    quantity?: number
  ) => { success: boolean; message?: string };
  updateQuantity: (itemId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  shippingTier: ShippingTier;
  setShippingTier: (tier: ShippingTier) => void;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
  discount: number;
  promoCode: string;
  appliedCoupon: Coupon | null;
  availableCoupons: Coupon[];
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  total: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mani_minars_cart_v2';
const FREE_SHIPPING_THRESHOLD = 4000;
const STANDARD_DELIVERY_FEE = 250;
const EXPRESS_DELIVERY_FEE = 450;

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'MANI10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    description: '10% off your entire kidswear order',
    isActive: true,
  },
  {
    code: 'LITTLELOOM',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 5000,
    description: '15% off premium cotton sets on orders above PKR 5,000',
    isActive: true,
  },
  {
    code: 'WELCOME500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderAmount: 4000,
    description: 'Flat PKR 500 off on your first order above PKR 4,000',
    isActive: true,
  },
  {
    code: 'EIDVIBES',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 7500,
    maxDiscount: 2000,
    description: '20% festive discount on orders above PKR 7,500',
    isActive: true,
  },
];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [shippingTier, setShippingTier] = useState<ShippingTier>('standard');

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cart]);

  const addToCart = (
    product: Product,
    selectedSize: string,
    selectedColor: { name: string; hex: string },
    quantity = 1
  ): { success: boolean; message?: string } => {
    const availableStock = product.stockQuantity ?? 15;
    if (availableStock <= 0) {
      return { success: false, message: 'This item is currently sold out.' };
    }

    let success = true;
    let message: string | undefined;

    setCart((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor.name === selectedColor.name
      );

      if (existingItemIndex > -1) {
        const currentQty = prev[existingItemIndex].quantity;
        const targetQty = currentQty + quantity;

        if (targetQty > availableStock) {
          success = false;
          message = `Only ${availableStock} units available in stock.`;
          return prev;
        }

        const updated = [...prev];
        updated[existingItemIndex].quantity = targetQty;
        return updated;
      } else {
        if (quantity > availableStock) {
          success = false;
          message = `Only ${availableStock} units available in stock.`;
          return prev;
        }

        const newItem: CartItem = {
          id: `${product.id}-${selectedSize}-${selectedColor.name}-${Date.now()}`,
          productId: product.id,
          product,
          selectedSize,
          selectedColor,
          quantity,
          price: product.price,
        };
        return [...prev, newItem];
      }
    });

    if (success) {
      setIsCartDrawerOpen(true);
    }

    return { success, message };
  };

  const updateQuantity = (itemId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return { success: true };
    }

    let errorMsg: string | undefined;

    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const availableStock = item.product.stockQuantity ?? 15;
        if (quantity > availableStock) {
          errorMsg = `Maximum ${availableStock} items in stock for this garment.`;
          return { ...item, quantity: availableStock };
        }
        return { ...item, quantity };
      })
    );

    return errorMsg ? { success: false, message: errorMsg } : { success: true };
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode('');
    setAppliedCoupon(null);
  };

  const applyPromoCode = (code: string): { success: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === trimmed && c.isActive);

    if (!found) {
      return {
        success: false,
        message: 'Invalid promo code. Try "MANI10" for 10% off your order.',
      };
    }

    if (subtotal < found.minOrderAmount) {
      return {
        success: false,
        message: `This coupon requires a minimum subtotal of PKR ${found.minOrderAmount.toLocaleString()}.`,
      };
    }

    setPromoCode(trimmed);
    setAppliedCoupon(found);
    return {
      success: true,
      message: `Coupon "${found.code}" applied! ${found.description}`,
    };
  };

  const removePromoCode = () => {
    setPromoCode('');
    setAppliedCoupon(null);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Auto-invalidate coupon if subtotal falls below minimum threshold
  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.minOrderAmount) {
      setAppliedCoupon(null);
      setPromoCode('');
    }
  }, [subtotal, appliedCoupon]);

  // Calculate discount
  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderAmount) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  // Delivery Fee Calculation based on shipping tier
  let deliveryFee = 0;
  if (subtotal > 0) {
    if (shippingTier === 'express') {
      deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 200 : EXPRESS_DELIVERY_FEE;
    } else {
      deliveryFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
    }
  }

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const total = Math.max(0, subtotal - discount + deliveryFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        shippingTier,
        setShippingTier,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        remainingForFreeShipping,
        discount,
        promoCode,
        appliedCoupon,
        availableCoupons: AVAILABLE_COUPONS,
        applyPromoCode,
        removePromoCode,
        total,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

