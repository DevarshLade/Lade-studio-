'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import context providers to reduce bundle size
const CartProvider = dynamic(() => import('@/context/cart-context').then(mod => mod.CartProvider), { 
  ssr: false,
  loading: () => <div className="h-4 w-full" /> // Minimal loading placeholder
});

const WishlistProvider = dynamic(() => import('@/context/wishlist-context').then(mod => mod.WishlistProvider), { 
  ssr: false,
  loading: () => <div className="h-4 w-full" /> // Minimal loading placeholder
});

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-4 w-full" />}>
      <WishlistProvider>
        <Suspense fallback={<div className="h-4 w-full" />}>
          <CartProvider>
            {children}
          </CartProvider>
        </Suspense>
      </WishlistProvider>
    </Suspense>
  );
}