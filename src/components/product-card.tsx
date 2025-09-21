"use client";

import { useState, memo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { NotifyButton } from "@/components/NotifyButton";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";
import { useProtectedAction } from "@/hooks/useProtectedAction";
import dynamic from 'next/dynamic';

// Dynamically import AuthModal and WishlistButton to reduce bundle size
const AuthModal = dynamic(() => import('@/components/auth/AuthModal').then(mod => ({ default: mod.AuthModal })), { 
  ssr: false,
  loading: () => <div className="h-10 w-10" /> // Add loading placeholder
});

const WishlistButton = dynamic(() => import('@/components/wishlist/WishlistButton').then(mod => ({ default: mod.WishlistButton })), { 
  ssr: false,
  loading: () => <div className="h-8 w-8" /> // Add loading placeholder
});

type ProductCardProps = {
  product: Product & { discountPercentage?: number };
};

// Memoized components for better performance
const ProductImage = memo(({ 
  src, 
  alt,
  aiHint
}: { 
  src: string; 
  alt: string;
  aiHint?: string;
}) => (
  <Image
    src={src}
    alt={alt}
    width={400}
    height={400}
    className="w-full h-auto object-cover aspect-square group-hover:scale-105 transition-transform duration-300"
    data-ai-hint={aiHint}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    loading="lazy"
    quality={80}
  />
));
ProductImage.displayName = 'ProductImage';

const ProductInfo = memo(({ 
  category, 
  name, 
  price, 
  originalPrice 
}: { 
  category?: string | null; 
  name: string; 
  price: number; 
  originalPrice?: number | null; 
}) => (
  <div className="p-4 flex-grow">
    <p className="text-sm text-muted-foreground">{category || 'Uncategorized'}</p>
    <h3 className="mt-1 text-lg font-headline leading-tight line-clamp-2">
      {name}
    </h3>
  </div>
));
ProductInfo.displayName = 'ProductInfo';

const PriceInfo = memo(({ 
  price, 
  originalPrice 
}: { 
  price: number; 
  originalPrice?: number | null; 
}) => (
  <div>
    <p className="text-lg font-bold text-primary">₹{price.toLocaleString()}</p>
    {originalPrice && (
      <p className="text-sm text-muted-foreground line-through">₹{originalPrice.toLocaleString()}</p>
    )}
  </div>
));
PriceInfo.displayName = 'PriceInfo';

const ProductCard = memo(({ product }: ProductCardProps) => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { executeProtectedAction, showAuthModal, setShowAuthModal } = useProtectedAction();

  // Safe image URL handling with fallback
  const getImageUrl = useCallback(() => {
    if (product.images && product.images.length > 0 && product.images[0]) {
      return product.images[0];
    }
    // Fallback to a placeholder image
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center';
  }, [product.images]);

  // Safe price handling with fallback
  const getPrice = useCallback(() => {
    return product.price || 0;
  }, [product.price]);

  // Safe name handling with fallback
  const getName = useCallback(() => {
    return product.name || 'Unnamed Product';
  }, [product.name]);

  // Calculate discount percentage if not provided
  const getDiscountPercentage = useCallback(() => {
    if (product.discountPercentage !== undefined) {
      return product.discountPercentage;
    }
    
    if (product.originalPrice && product.price && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    
    return 0;
  }, [product.discountPercentage, product.originalPrice, product.price]);

  const handleAddToCart = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // prevent link navigation
    e.stopPropagation();
    
    // Check if product is sold out
    if (product.soldOut) {
      toast({
        title: "Product Unavailable",
        description: `${getName()} is currently sold out.`,
        variant: "destructive"
      });
      return;
    }
    
    executeProtectedAction(() => {
      addToCart(product, 1);
      toast({
        title: "Added to Cart!",
        description: `${getName()} has been added to your cart.`,
      });
    });
  }, [product, getName, toast, executeProtectedAction, addToCart]);

  const discountPercentage = getDiscountPercentage();
  const imageUrl = getImageUrl();
  const price = getPrice();
  const name = getName();

  return (
    <>
      <Card className="group relative flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-xl">
        <Link href={`/product/${product.slug || 'unnamed-product'}`} className="absolute inset-0 z-10" aria-label={`View ${name}`}>
          <span className="sr-only">View {name}</span>
        </Link>
        <CardHeader className="p-0 relative">
          <div className="overflow-hidden">
            <ProductImage 
              src={imageUrl} 
              alt={name} 
              aiHint={product.aiHint} 
            />
          </div>
          {discountPercentage > 0 && (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
              {discountPercentage}% OFF
            </Badge>
          )}
          {product.soldOut && (
            <Badge className="absolute top-3 right-3 bg-red-600 text-white">Sold Out</Badge>
          )}
          <div className="absolute top-3 left-3 z-20">
            <WishlistButton 
              productId={product.id}
              productName={name}
              size="sm"
              variant="ghost"
              className="bg-white/80 hover:bg-white"
            />
          </div>
        </CardHeader>
        <ProductInfo 
          category={product.category} 
          name={name} 
          price={price} 
          originalPrice={product.originalPrice} 
        />
        <CardFooter className="p-4 flex justify-between items-center">
          <PriceInfo 
            price={price} 
            originalPrice={product.originalPrice} 
          />
          {product.soldOut ? (
            <NotifyButton
              productId={product.id}
              productName={name}
              size="icon"
              variant="outline"
            />
          ) : (
            <Button 
              size="icon" 
              variant="outline" 
              className="z-20 relative" 
              aria-label="Add to cart" 
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        title="Sign in to Add to Cart"
        description={`Please sign in to add ${name} to your cart.`}
      />
    </>
  );
});

ProductCard.displayName = 'ProductCard';

// Memoize the component to prevent unnecessary re-renders
export default memo(ProductCard);