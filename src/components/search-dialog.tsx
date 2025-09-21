"use client";

import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchProducts } from "@/lib/api/products";
import type { Product } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length > 1) {
        setLoading(true);
        setError(null);
        
        try {
          const { data, error } = await searchProducts(searchQuery, 10);
          
          if (error) {
            setError(error.message);
            setResults([]);
          } else if (data) {
            setResults(data);
          } else {
            setResults([]);
          }
        } catch (err) {
          setError("An unexpected error occurred while searching");
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setError(null);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  // Add keyboard shortcut to open search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleLinkClick = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
         <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Search Products</DialogTitle>
          <DialogDescription className="sr-only">
            Search for products by name, category, or description. Results will appear below as you type.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for paintings, pots, jewelry..."
              className="pl-10 h-11"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <ScrollArea className="max-h-[60vh]">
            <div className="p-6 pt-0">
            {loading ? (
              <div className="mt-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-2 rounded-lg">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>Error: {error}</p>
              </div>
            ) : results.length > 0 ? (
                <div className="mt-4 space-y-4">
                {results.map(product => (
                    <Link key={product.id} href={`/product/${product.slug}`} onClick={handleLinkClick} className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent">
                        <Image 
                          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center'} 
                          alt={product.name} 
                          width={60} 
                          height={60} 
                          className="rounded-md object-cover" 
                          data-ai-hint={product.aiHint}
                        />
                        <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <p className="ml-auto font-semibold text-primary">₹{product.price.toLocaleString()}</p>
                    </Link>
                ))}
                </div>
            ) : query.length > 1 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No products found for "{query}"</p>
                </div>
            ) : (
                 <div className="text-center py-8 text-muted-foreground">
                    <p>Search for art, pots, and more.</p>
                </div>
            )}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Debounce function to limit API calls
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}