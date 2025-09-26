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
  isSignedIn: boolean | null; // null when checking auth state
  userId: string | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Separate component to handle Clerk hooks - only rendered on client
function ClientAuthHandler({ 
  setAuthData
}: { 
  setAuthData: (auth: { isSignedIn: boolean; userId: string | null }) => void;
}) {
  const { isSignedIn, user } = useUser();
  
  useEffect(() => {
    setAuthData({
      isSignedIn: isSignedIn || false,
      userId: user?.id || null
    });
  }, [isSignedIn, user]);
  
  return null;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [authData, setAuthData] = useState<{ isSignedIn: boolean; userId: string | null }>({
    isSignedIn: false,
    userId: null
  });
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch wishlist items and count
  const fetchWishlist = useCallback(async () => {
    if (!authData.isSignedIn || !authData.userId) {
      setWishlistItems([]);
      setWishlistCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch wishlist items
      const { data: wishlistData, error: wishlistError } = await getUserWishlist(authData.userId);
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
      const { count, error: countError } = await getWishlistCount(authData.userId);
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
  }, [authData.isSignedIn, authData.userId, toast]);

  // Refresh wishlist on auth state change with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (authData.isSignedIn && authData.userId) {
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
  }, [fetchWishlist, authData.isSignedIn, authData.userId]);

  const toggleWishlist = useCallback(async (productId: string, productName?: string) => {
    if (!authData.isSignedIn || !authData.userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { isInWishlist: newWishlistStatus, error } = await toggleWishlistItem(authData.userId, productId);
      
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
  }, [authData.isSignedIn, authData.userId, fetchWishlist, toast]);

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
    refreshWishlist,
    isSignedIn: authData.isSignedIn,
    userId: authData.userId
  }), [wishlistItems, wishlistCount, toggleWishlist, isInWishlist, loading, refreshWishlist, authData]);

  return (
    <WishlistContext.Provider value={contextValue}>
      {isClient && (
        <ClientAuthHandler 
          setAuthData={setAuthData}
        />
      )}
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