"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { getUserWishlist, toggleWishlistItem, getWishlistCount } from '@/lib/api/wishlist';

interface WishlistContextType {
  wishlistItems: Product[];
  wishlistCount: number;
  toggleWishlist: (productId: string, productName?: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isSignedIn, user } = useUser();
  const { toast } = useToast();

  // Fetch wishlist items and count
  const fetchWishlist = useCallback(async () => {
    if (!isSignedIn || !user) {
      setWishlistItems([]);
      setWishlistCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch wishlist items
      const { data: wishlistData, error: wishlistError } = await getUserWishlist(user.id);
      if (wishlistError) {
        console.error("Error fetching wishlist:", wishlistError);
        toast({
          title: "Error",
          description: "Failed to load your wishlist. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Extract product data from wishlist items
      const products = (wishlistData || []).map(item => item.products);
      setWishlistItems(products);

      // Fetch wishlist count
      const { count, error: countError } = await getWishlistCount(user.id);
      if (!countError) {
        setWishlistCount(count || 0);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to load your wishlist. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user?.id, toast]);

  // Refresh wishlist on auth state change with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isSignedIn && user) {
      // Debounce the fetch to prevent multiple rapid calls
      timeoutId = setTimeout(() => {
        fetchWishlist();
      }, 100);
    } else {
      // Clear wishlist when user signs out
      setWishlistItems([]);
      setWishlistCount(0);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchWishlist, isSignedIn, user?.id]);

  const toggleWishlist = useCallback(async (productId: string, productName?: string) => {
    if (!isSignedIn || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { isInWishlist: newWishlistStatus, error } = await toggleWishlistItem(user.id, productId);
      
      if (error) {
        throw new Error(error.message);
      }

      // Refresh the wishlist after toggle
      await fetchWishlist();
      
      toast({
        title: newWishlistStatus ? "Added to Wishlist" : "Removed from Wishlist",
        description: newWishlistStatus 
          ? `${productName || 'Product'} has been added to your wishlist.`
          : `${productName || 'Product'} has been removed from your wishlist.`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update wishlist",
        variant: "destructive"
      });
    }
  }, [isSignedIn, user?.id, fetchWishlist, toast]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  const refreshWishlist = useCallback(async () => {
    await fetchWishlist();
  }, [fetchWishlist]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    wishlistItems,
    wishlistCount,
    toggleWishlist,
    isInWishlist,
    loading,
    refreshWishlist
  }), [wishlistItems, wishlistCount, toggleWishlist, isInWishlist, loading, refreshWishlist]);

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}