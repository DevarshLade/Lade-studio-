"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';

type CartItem = Product & { quantity: number };

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product: Product, quantity: number) => {
    // Check if product is sold out
    if (product.soldOut) {
      toast({
        title: "Product Unavailable",
        description: `${product.name || 'This product'} is currently sold out.`,
        variant: "destructive"
      });
      return;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
    
    toast({
      title: "Added to Cart!",
      description: `${product.name || 'Product'} has been added to your cart.`
    });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({
        title: "Item Removed",
        description: "The item has been removed from your cart."
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
        removeFromCart(productId);
        return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}