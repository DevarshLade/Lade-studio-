import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { getFeaturedProducts, getLatestProducts, getHighDiscountProducts } from "@/lib/api/products";
import { testimonials, blogPosts, categories } from "@/lib/data";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import ProductCard to reduce bundle size
const ProductCard = dynamic(() => import('@/components/product-card'), {
  ssr: true, // Enable SSR for better SEO
  loading: () => (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="w-full h-64 bg-gray-200 animate-pulse" />
      </CardContent>
      <CardFooter className="p-4">
        <div className="space-y-2 w-full">
          <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
          <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded" />
          <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded" />
        </div>
      </CardFooter>
    </Card>
  )
});

// Loading skeletons for better UX
function CategorySkeleton() {
  return (
    <Card className="overflow-hidden border-2 border-transparent">
      <CardContent className="p-0">
        <div className="w-full h-64 bg-gray-200 animate-pulse" />
      </CardContent>
      <CardFooter className="p-6 bg-background">
        <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="w-full h-64 bg-gray-200 animate-pulse" />
      </CardContent>
      <CardFooter className="p-4">
        <div className="space-y-2 w-full">
          <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
          <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded" />
          <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded" />
        </div>
      </CardFooter>
    </Card>
  );
}

function BlogSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="w-full h-48 bg-gray-200 animate-pulse" />
      <CardContent className="flex-grow p-4 space-y-2">
        <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
      </CardContent>
      <CardFooter className="p-4">
        <div className="h-10 w-24 bg-gray-200 animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}

// Async components for better streaming
async function FeaturedCollections() {
  const { data: latestProducts } = await getLatestProducts(8);
  
  return (
    <section className="py-16 md:py-24 bg-accent/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">Latest Releases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {latestProducts?.slice(0, 8).map((product) => (
            <Suspense key={product.id} fallback={<ProductSkeleton />}>
              <ProductCard product={product} />
            </Suspense>
          ))}
        </div>
      </div>
    </section>
  );
}

async function DiscountProducts() {
  const { data: highDiscountProducts } = await getHighDiscountProducts(8);
  
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">Biggest Discounts</h2>
        <Carousel opts={{ loop: true, align: "start" }} className="w-full">
          <CarouselContent className="-ml-4">
            {highDiscountProducts?.slice(0, 8).map((product) => (
              <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Suspense fallback={<ProductSkeleton />}>
                    <ProductCard product={product} />
                  </Suspense>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}

export default async function Home() {
  // Fetch latest released products for Featured Collections
  const { data: latestProducts } = await getLatestProducts(8);
  
  // Fetch high discounted products for Discount section
  const { data: highDiscountProducts } = await getHighDiscountProducts(8);
  
  const homeCategories = categories.slice(0, 3);
  
  return (
    <div className="flex flex-col">
      {/* Hero Section - Replaced image banner with responsive hero */}
      <section className="relative w-full bg-gradient-to-r from-primary/10 to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            {/* Text Content */}
            <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
              <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 text-foreground">
                Handcrafted Artistry for Your Home
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
                Discover unique handmade paintings, hand-painted pots, and terracotta jewelry created with passion and attention to detail.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link href="/products">
                    Shop Now
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Link href="/custom-design">
                    Custom Design
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Visual Element */}
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-lg">
                <div className="absolute -top-6 -left-6 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
                <div className="relative bg-white rounded-2xl shadow-xl p-6 border">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                    </div>
                    <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                    </div>
                    <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                    </div>
                    <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-headline font-bold text-lg">Unique Handcrafted Pieces</p>
                    <p className="text-sm text-muted-foreground">Each item tells its own story</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">Explore Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {homeCategories.map((category) => (
              <Link href={`/products?category=${category.name.toLowerCase().replace(/ /g, '-')}`} key={category.name} className="group">
                <Card className="overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-0">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={400}
                      height={500}
                      className="w-full h-auto object-cover aspect-[4/5] group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={category.hint}
                      loading="lazy"
                      quality={80}
                    />
                  </CardContent>
                  <CardFooter className="p-6 bg-background">
                    <h3 className="text-xl font-headline w-full text-center">{category.name}</h3>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Releases - Featured Collections */}
      <Suspense 
        fallback={
          <section className="py-16 md:py-24 bg-accent/50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">Latest Releases</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            </div>
          </section>
        }
      >
        <FeaturedCollections />
      </Suspense>

      {/* High Discount Products - Discount on Original Artworks */}
      <Suspense 
        fallback={
          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">Biggest Discounts</h2>
              <Carousel opts={{ loop: true, align: "start" }} className="w-full">
                <CarouselContent className="-ml-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <div className="p-1">
                        <ProductSkeleton />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
              </Carousel>
            </div>
          </section>
        }
      >
        <DiscountProducts />
      </Suspense>

      {/* Blog & Videos */}
      <section className="py-16 md:py-24 bg-accent/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">From the Studio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={250}
                  className="w-full h-auto object-cover"
                  data-ai-hint={post.hint}
                  loading="lazy"
                  quality={80}
                />
                <CardContent className="flex-grow p-4">
                  <h3 className="font-headline text-xl mb-2">{post.title}</h3>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="p-4">
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/blog">Read More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials section removed as requested */}
    </div>
  );
}