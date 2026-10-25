import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total_items: 0, subtotal: 0.0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], total_items: 0, subtotal: 0.0 });
      return;
    }
    try {
      setLoading(true);
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      throw new Error('Please login to add items to your cart.');
    }
    const updated = await api.addToCart({ product_id: productId, quantity });
    setCart(updated);
    return updated;
  };

  const updateQuantity = async (itemId, quantity) => {
    const updated = await api.updateCartItem(itemId, { quantity });
    setCart(updated);
  };

  const removeItem = async (itemId) => {
    const updated = await api.deleteCartItem(itemId);
    setCart(updated);
  };

  const clearCart = async () => {
    await api.clearCart();
    setCart({ items: [], total_items: 0, subtotal: 0.0 });
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
