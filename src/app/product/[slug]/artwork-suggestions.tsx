
"use client";

import { useEffect, useState } from "react";
import { artworkSuggestions, ArtworkSuggestionsInput } from "@/ai/flows/artwork-suggestions";
import { getProducts } from "@/lib/api/products";
import type { Product } from "@/types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export function ArtworkSuggestions({ currentArtworkId }: { currentArtworkId: string }) {
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSuggestions() {
      setLoading(true);
      try {
        // Fetch products from database
        const { data: allProducts } = await getProducts({ limit: 20 });
        
        if (!allProducts || allProducts.length === 0) {
          setSuggestedProducts([]);
          setLoading(false);
          return;
        }

        // In a real app, viewing and purchase history would come from user data.
        const userViewingHistory = ['prod-2', 'prod-5'];
        const userPurchaseHistory = ['prod-7'];

        const input: ArtworkSuggestionsInput = {
          currentArtworkId,
          userViewingHistory,
          userPurchaseHistory,
        };

        const result = await artworkSuggestions(input);
        
        // Filter products from database based on AI suggestions
        const suggestions = allProducts.filter(p => result.suggestedArtworkIds.includes(p.id));
        
        // Fallback to random products if AI gives no suggestions
        if (suggestions.length === 0) {
            const fallback = allProducts
                .filter(p => p.id !== currentArtworkId)
                .sort(() => 0.5 - Math.random())
                .slice(0, 5);
            setSuggestedProducts(fallback);
        } else {
            setSuggestedProducts(suggestions);
        }
      } catch (error) {
        console.error("Error fetching artwork suggestions:", error);
        // Fallback to fetching random products from database
        try {
          const { data: allProducts } = await getProducts({ limit: 10 });
          if (allProducts && allProducts.length > 0) {
            const fallback = allProducts
              .filter(p => p.id !== currentArtworkId)
              .sort(() => 0.5 - Math.random())
              .slice(0, 5);
            setSuggestedProducts(fallback);
          } else {
            setSuggestedProducts([]);
          }
        } catch (fallbackError) {
          console.error("Error fetching fallback products:", fallbackError);
          setSuggestedProducts([]);
        }
      } finally {
        setLoading(false);
      }
    }

    getSuggestions();
  }, [currentArtworkId]);

  return (
    <div className="mt-16 md:mt-24">
      <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">You Might Also Like</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({length: 4}).map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                </div>
            ))}
        </div>
      ) : suggestedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No related products available at the moment.</p>
          <p className="text-muted-foreground">Check back later for new arrivals!</p>
        </div>
      ) : (
        <Carousel opts={{ loop: true, align: "start" }} className="w-full">
            <CarouselContent className="-ml-4">
            {suggestedProducts.map((product) => (
                <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                <div className="p-1">
                    <ProductCard product={product} />
                </div>
                </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
      )}
    </div>
  );
}
