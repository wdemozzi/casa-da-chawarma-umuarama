import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariation, ProductAddon, Coupon } from '../types/menu';
import { sounds } from '../lib/soundEffects';

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity: number,
    selectedVariation?: ProductVariation,
    selectedAddons?: ProductAddon[],
    notes?: string
  ) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  coupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('chawarma_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('chawarma_active_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('chawarma_cart_v1', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (coupon) {
        localStorage.setItem('chawarma_active_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('chawarma_active_coupon');
      }
    } catch (e) {
      console.error(e);
    }
  }, [coupon]);

  const addItem = (
    product: Product,
    quantity: number,
    selectedVariation?: ProductVariation,
    selectedAddons: ProductAddon[] = [],
    notes: string = ''
  ) => {
    sounds.playSizzle(); // Hot grill sizzling ASMR feedback on add to cart!

    const uniqueId = `${product.id}-${selectedVariation?.id || 'base'}-${selectedAddons.map(a => a.id).sort().join(',')}-${notes.trim()}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === uniqueId);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      } else {
        return [
          ...prev,
          {
            id: uniqueId,
            product,
            quantity,
            selectedVariation,
            selectedAddons,
            notes,
          },
        ];
      }
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    sounds.playCrispClick();
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (itemId: string) => {
    sounds.playCrispClick();
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const applyCoupon = (newCoupon: Coupon) => {
    sounds.playCoin();
    setCoupon(newCoupon);
  };

  const removeCoupon = () => {
    sounds.playCrispClick();
    setCoupon(null);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotalCents = items.reduce((sum, item) => {
    const basePrice = item.selectedVariation ? item.selectedVariation.price_cents : item.product.price_cents;
    const addonsPrice = item.selectedAddons.reduce((acc, a) => acc + a.price_cents, 0);
    return sum + (basePrice + addonsPrice) * item.quantity;
  }, 0);

  let discountCents = 0;
  if (coupon) {
    if (coupon.discount_cents) {
      discountCents = Math.min(coupon.discount_cents, subtotalCents);
    } else if (coupon.discount_percent) {
      discountCents = Math.round((subtotalCents * coupon.discount_percent) / 100);
    }
  }

  const totalCents = Math.max(0, subtotalCents - discountCents);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalCount,
        subtotalCents,
        discountCents,
        totalCents,
        coupon,
        applyCoupon,
        removeCoupon,
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

