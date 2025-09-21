
"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/lib/api/products";
import { categories } from "@/lib/data";
import type { Product } from "@/types";
import ProductCard from "@/components/product-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const SIZES = ["Small", "Medium", "Large"];

function ProductFilters({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  
  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const applyFilters = () => {
    onFilterChange({ category, priceRange, sizes: selectedSizes });
  };
  
  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, priceRange, selectedSizes]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Category Filter */}
        <div className="space-y-4">
          <Label className="text-lg font-headline">Category</Label>
          <RadioGroup value={category} onValueChange={setCategory}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="cat-all" />
              <Label htmlFor="cat-all">All</Label>
            </div>
            {categories.map(cat => (
                <div className="flex items-center space-x-2" key={cat.name}>
                    <RadioGroupItem value={cat.name.toLowerCase().replace(/ /g, '-')} id={`cat-${cat.name.toLowerCase().replace(/ /g, '-')}`} />
                    <Label htmlFor={`cat-${cat.name.toLowerCase().replace(/ /g, '-')}`}>{cat.name}</Label>
                </div>
            ))}
          </RadioGroup>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-4">
          <Label className="text-lg font-headline">Price Range</Label>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
          <Slider 
            defaultValue={priceRange} 
            max={10000} 
            step={100} 
            onValueCommit={setPriceRange}
          />
        </div>

        {/* Size Filter */}
        <div className="space-y-4">
          <Label className="text-lg font-headline">Size</Label>
          {SIZES.map(size => (
            <div className="flex items-center space-x-2" key={size}>
              <Checkbox id={`size-${size.toLowerCase()}`} onCheckedChange={() => handleSizeChange(size)} />
              <Label htmlFor={`size-${size.toLowerCase()}`}>{size}</Label>
            </div>
          ))}
        </div>
        
        <Button className="w-full" onClick={applyFilters}>Apply Filters</Button>
      </CardContent>
    </Card>
  );
}

export default function ProductGrid() {
  const [filters, setFilters] = useState<{
    category: string;
    priceRange: number[];
    sizes: string[];
  }>({
    category: 'all',
    priceRange: [0, 10000],
    sizes: [],
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from Supabase
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      
      const categoryFilter = filters.category !== 'all' 
        ? filters.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : undefined;
      
      const { data, error } = await getProducts({
        category: categoryFilter,
        limit: 100 // Fetch more products for filtering
      });
      
      if (error) {
        setError(error.message);
      } else {
        setProducts(data || []);
      }
      
      setLoading(false);
    }
    
    fetchProducts();
  }, [filters.category]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const priceMatch = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const sizeMatch = filters.sizes.length === 0 || (product.size && filters.sizes.includes(product.size));
      
      return priceMatch && sizeMatch;
    });
  }, [products, filters.priceRange, filters.sizes]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <div className="sticky top-20">
            <ProductFilters onFilterChange={setFilters} />
          </div>
        </aside>
        <main className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-64 w-full bg-gray-200 animate-pulse rounded"></div>
                <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-6 w-1/4 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error loading products: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <div className="sticky top-20">
            <ProductFilters onFilterChange={setFilters} />
          </div>
        </aside>
        <main className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
                <p className="col-span-full text-center text-muted-foreground">No products match the selected filters.</p>
            )}
          </div>
        </main>
      </div>
  );
}
