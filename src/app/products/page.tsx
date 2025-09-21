
import { Suspense } from "react";
import ProductGrid from "./product-grid";
import { Skeleton } from "@/components/ui/skeleton";

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 9 }).map((_, i) => (
         <div key={i} className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
        </div>
      ))}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-headline text-center mb-12">Our Collection</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}
