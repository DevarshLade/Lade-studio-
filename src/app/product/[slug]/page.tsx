
"use client";

import { useState, useEffect } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getProductBySlug, getProductById } from "@/lib/api/products";
import { supabase } from "@/lib/supabase";
import { supabaseProductToLegacy } from "@/types";
import { addProductReview, canUserReviewProduct, getUserReviewsForProduct, getUserReviewCount } from "@/lib/api/reviews";
import { useUser } from "@clerk/nextjs";
import { EditReviewDialog } from "@/components/review/EditReviewDialog";
import { ImageUpload } from "@/components/review/ImageUpload";
import type { Product, Review } from "@/types";
import { Button } from "@/components/ui/button";
import { Heart, Minus, Plus, ShoppingCart, Star, Loader2, AlertCircle, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import Link from "next/link";
import { Edit2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { NotifyButton } from "@/components/NotifyButton";

const ArtworkSuggestions = dynamic(
  () => import('./artwork-suggestions').then(mod => mod.ArtworkSuggestions),
  {
    loading: () => (
      <div className="mt-16 md:mt-24">
        <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({length: 4}).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
);


function StarRating({ rating, onRatingChange, readOnly = false }: { rating: number, onRatingChange?: (rating: number) => void, readOnly?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${rating >= star ? 'text-primary fill-primary' : 'text-muted-foreground'} ${!readOnly && 'cursor-pointer'}`}
          onClick={() => onRatingChange && onRatingChange(star)}
        />
      ))}
    </div>
  );
}

function ProductReviews({ product }: { product: Product }) {
  const { toast } = useToast();
  const { isSignedIn: isAuthenticated, user } = useUser();
  const [newRating, setNewRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>(product.reviews || []);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewEligibilityReason, setReviewEligibilityReason] = useState<string>('');
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [reviewCount, setReviewCount] = useState({ count: 0, remaining: 10 });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditReview, setCurrentEditReview] = useState<Review | null>(null);
  const [reviewImages, setReviewImages] = useState<string[]>([]);

  // Check if user can review this product and get their existing reviews
  useEffect(() => {
    async function checkReviewEligibility() {
      if (!isAuthenticated || !user) {
        setCanReview(false);
        setReviewEligibilityReason('Please sign in to write a review');
        setCheckingEligibility(false);
        return;
      }

      // Get user's existing reviews for this product
      const { data: existingReviews, error: reviewsError } = await getUserReviewsForProduct(user.id, product.id);
      
      if (existingReviews && existingReviews.length > 0) {
        // Convert to legacy format
        const legacyReviews: Review[] = existingReviews.map(review => ({
          id: review.id,
          name: review.author_name,
          rating: review.rating,
          comment: review.comment || '',
          date: new Date(review.created_at).toISOString().split('T')[0]
        }));
        setUserReviews(legacyReviews);
      }

      // Get review count and remaining
      const { data: countData, error: countError } = await getUserReviewCount(user.id, product.id);
      if (countData) {
        setReviewCount(countData);
      }

      // Check eligibility (now based on 10 review limit)
      const { canReview: eligible, reason } = await canUserReviewProduct(user.id, product.id);
      setCanReview(eligible);
      setReviewEligibilityReason(reason || '');
      setCheckingEligibility(false);
    }

    checkReviewEligibility();
  }, [product.id, isAuthenticated, user]);

  const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0;

  // Check if a review belongs to the current user
  const isUserReview = (review: Review) => {
    if (!isAuthenticated || !user) return false;
    // Use Clerk user properties correctly
    const userName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 
                    user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Anonymous';
    const userEmail = user.emailAddresses[0]?.emailAddress;
    return review.name === userName || review.name === userEmail;
  };

  // Handle edit review
  const handleEditReview = (review: Review) => {
    setCurrentEditReview(review);
    setEditDialogOpen(true);
  };

  // Handle review update from dialog
  const handleReviewUpdated = (updatedReview: Review) => {
    // Update the review in userReviews
    setUserReviews(prev => prev.map(review => 
      review.id === updatedReview.id ? updatedReview : review
    ));
    // Update the review in the main reviews list
    setReviews(prev => prev.map(review => 
      review.id === updatedReview.id ? updatedReview : review
    ));
    setCurrentEditReview(null);
  };
  
  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    // Use Clerk user properties correctly
    const authorName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 
                      user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Anonymous';
    const comment = formData.get('review-comment') as string;
    
    if (newRating === 0) {
      toast({
        title: "Please select a rating",
        description: "You must provide a rating from 1 to 5 stars.",
        variant: "destructive"
      });
      setSubmitting(false);
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to submit a review.",
        variant: "destructive"
      });
      setSubmitting(false);
      return;
    }
    
    const { data, error } = await addProductReview(user.id, product.id, authorName, newRating, comment, reviewImages);
    
    if (error) {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });
      
      // Add the new review to the local state
      const newReview: Review = {
        id: data?.id || Math.random().toString(),
        name: authorName,
        rating: newRating,
        comment,
        date: new Date().toISOString().split('T')[0],
        images: reviewImages
      };
      setReviews(prev => [newReview, ...prev]);
      setUserReviews(prev => [newReview, ...prev]);
      
      // Update review count
      setReviewCount(prev => ({
        count: prev.count + 1,
        remaining: prev.remaining - 1
      }));
      
      // Reset form
      (e.target as HTMLFormElement).reset();
      setNewRating(0);
      setReviewImages([]);
    }
    
    setSubmitting(false);
  };

  if (!product) {
    return null;
  }

  return (
    <div className="mt-16 md:mt-24">
      <h2 className="text-3xl md:text-4xl font-headline text-center mb-12">Ratings & Reviews</h2>
      <div className="grid md:grid-cols-2 gap-12">
        {/* Existing Reviews */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-4">
                <span>{reviews.length || 0} Reviews</span>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={averageRating} readOnly />
                    <span className="text-lg font-bold text-primary">{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 max-h-96 overflow-y-auto">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                        <p className="font-semibold">{review.name}</p>
                        <StarRating rating={review.rating} readOnly />
                       </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                        {isUserReview(review) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditReview(review)}
                            className="h-8 px-3"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                        {review.images.map((imageUrl, imageIndex) => (
                          <div key={imageIndex} className="aspect-square bg-muted rounded-lg overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={`Review image ${imageIndex + 1}`}
                              width={150}
                              height={150}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(imageUrl, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to share your thoughts!</p>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Add a Review Form */}
        <div>
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              {checkingEligibility ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Checking eligibility...</span>
                </div>
              ) : userReviews.length >= 10 ? (
                <div className="text-center py-8">
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Review Limit Reached</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      You have reached the maximum limit of 10 reviews for this product.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You can edit your existing reviews below.
                    </p>
                  </div>
                </div>
              ) : userReviews.length > 0 ? (
                <div className="space-y-6">
                  {/* Show user's existing reviews */}
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Your Reviews ({userReviews.length}/10)</h3>
                    <div className="space-y-4">
                      {userReviews.map((review) => (
                        <div key={review.id} className="flex items-center justify-between bg-background p-4 rounded-lg">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <StarRating rating={review.rating} readOnly />
                              <span className="text-sm text-muted-foreground">{review.date}</span>
                            </div>
                            <p className="text-sm">{review.comment}</p>
                            {review.images && review.images.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                {review.images.map((imageUrl, imageIndex) => (
                                  <div key={imageIndex} className="aspect-square bg-muted rounded-md overflow-hidden">
                                    <Image
                                      src={imageUrl}
                                      alt={`Review image ${imageIndex + 1}`}
                                      width={100}
                                      height={100}
                                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => window.open(imageUrl, '_blank')}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditReview(review)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Add Another Review Form */}
                  {canReview && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Add Another Review ({reviewCount.remaining} remaining)</h3>
                      <form className="space-y-4" onSubmit={handleReviewSubmit}>
                        <div className="space-y-2">
                          <Label>Your Rating</Label>
                          <StarRating rating={newRating} onRatingChange={setNewRating} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="review-name">Your Name</Label>
                          <Input id="review-name" name="review-name" placeholder="Your name" required/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="review-comment">Your Review</Label>
                          <Textarea id="review-comment" name="review-comment" placeholder="Share your thoughts about the product..." rows={4} required/>
                        </div>
                        <ImageUpload
                          onImagesChange={setReviewImages}
                          maxImages={5}
                          disabled={submitting}
                        />
                        <Button type="submit" className="w-full" disabled={submitting}>
                          {submitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              ) : !canReview ? (
                <div className="text-center py-8">
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground font-medium mb-2">Unable to Write Review</p>
                    <p className="text-sm text-muted-foreground">{reviewEligibilityReason}</p>
                    {!isAuthenticated && (
                      <Button asChild className="mt-4">
                        <Link href="/auth">Sign In to Review</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleReviewSubmit}>
                  <div className="space-y-2">
                    <Label>Your Rating</Label>
                    <StarRating rating={newRating} onRatingChange={setNewRating} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-name">Your Name</Label>
                    <Input id="review-name" name="review-name" placeholder="Your name" required/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-comment">Your Review</Label>
                    <Textarea id="review-comment" name="review-comment" placeholder="Share your thoughts about the product..." rows={4} required/>
                  </div>
                  <ImageUpload
                    onImagesChange={setReviewImages}
                    maxImages={5}
                    disabled={submitting}
                  />
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit Review Dialog */}
      {currentEditReview && (
        <EditReviewDialog
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          review={currentEditReview}
          onUpdated={handleReviewUpdated}
        />
      )}
    </div>
  )
}


export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [reviewCount, setReviewCount] = useState({ count: 0, remaining: 10 });
  const { isSignedIn: isAuthenticated, user } = useUser();

  // Ensure all hooks are called at the top level
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      // Validate slug parameter
      if (!params?.slug || typeof params.slug !== 'string') {
        console.log('Invalid slug parameter:', params?.slug);
        setError('Invalid product identifier');
        setLoading(false);
        return;
      }

      console.log('=== PRODUCT PAGE DEBUG ===');
      console.log('Slug parameter:', params.slug);

      try {
        // First, let's try to fetch all products to see what we have
        console.log('Fetching all products for debugging...');
        const { data: allProducts, error: allProductsError } = await (supabase as any)
          .from('products')
          .select('*')
          .limit(10);

        if (allProductsError) {
          console.error('Error fetching all products:', allProductsError);
        } else {
          console.log(`Found ${allProducts?.length || 0} products in database:`);
          allProducts?.forEach((p: any, index: number) => {
            console.log(`${index + 1}. ID: ${p.id}, Name: "${p.name}", Slug: "${p.slug}"`);
          });
        }

        // Now try to find the specific product
        // Try exact match first
        console.log('Trying exact slug match...');
        let { data: product, error } = await (supabase as any)
          .from('products')
          .select(`
            *,
            reviews (*)
          `)
          .eq('slug', params.slug)
          .single();

        console.log('Exact slug match result:', { product, error });

        // If not found, try with URL decoding
        if (error && error.code === 'PGRST116') {
          console.log('Trying URL decoded slug match...');
          const decodedSlug = decodeURIComponent(params.slug);
          console.log('Decoded slug:', decodedSlug);
          
          let { data: productByDecodedSlug, error: decodedError } = await (supabase as any)
            .from('products')
            .select(`
              *,
              reviews (*)
            `)
            .eq('slug', decodedSlug)
            .single();
            
          console.log('Decoded slug match result:', { productByDecodedSlug, decodedError });
          
          if (!decodedError && productByDecodedSlug) {
            product = productByDecodedSlug;
            error = null;
          }
        }

        // If still not found, try ID match
        if (error && error.code === 'PGRST116') {
          console.log('Trying ID match...');
          let { data: productById, error: idError } = await (supabase as any)
            .from('products')
            .select(`
              *,
              reviews (*)
            `)
            .eq('id', params.slug)
            .single();
            
          console.log('ID match result:', { productById, idError });
          
          if (!idError && productById) {
            product = productById;
            error = null;
          }
        }

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('Product not found after all search attempts');
            setError('Product not found');
            setLoading(false);
            return;
          }
          console.error('Database error:', error);
          setError('Database connection error: ' + error.message);
          setLoading(false);
          return;
        }

        if (!product) {
          console.log('No product found');
          setError('Product not found');
          setLoading(false);
          return;
        }

        console.log('Product found before processing:', product);

        // Convert to legacy format
        const legacyProduct = supabaseProductToLegacy(product, product.reviews || []);
        
        console.log('Converted legacy product:', legacyProduct);

        setProduct(legacyProduct);
        setReviews(legacyProduct.reviews || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred while fetching the product: ' + (err as Error).message);
      }
      
      setLoading(false);
    }
    
    if (params?.slug) {
      fetchProduct();
    }
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Product...</h1>
          <p className="text-muted-foreground">Please wait while we fetch the product details.</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Showing error page:', error);
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!product) {
    console.log('Showing not found page: no product');
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground">The requested product could not be found.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Added to Cart!",
      description: `${quantity} x ${product.name}`,
    });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/checkout');
  };

  // Update the review submission handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    const formData = new FormData(e.target as HTMLFormElement);
    const authorName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 
                      user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Anonymous';
    const comment = formData.get('review-comment') as string;
    
    if (newRating === 0) {
      toast({
        title: "Please select a rating",
        description: "You must provide a rating from 1 to 5 stars.",
        variant: "destructive"
      });
      return;
    }
    
    const { data, error } = await addProductReview(user!.id, product.id, authorName, newRating, comment, reviewImages);
    
    if (error) {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });
      
      // Add the new review to the local state
      const newReview: Review = {
        id: data?.id || Math.random().toString(),
        name: authorName,
        rating: newRating,
        comment,
        date: new Date().toISOString().split('T')[0],
        images: reviewImages
      };
      setReviews(prev => [newReview, ...prev]);
      setUserReviews(prev => [newReview, ...prev]);
      
      // Update review count
      setReviewCount(prev => ({
        count: prev.count + 1,
        remaining: prev.remaining - 1
      }));
      
      // Reset form
      (e.target as HTMLFormElement).reset();
      setNewRating(0);
      setReviewImages([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left Column: Image Gallery */}
        <div>
          <div 
            className="aspect-square w-full overflow-hidden rounded-lg mb-4 border relative cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
          >
            {product.soldOut && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-red-600 text-white text-lg py-2 px-4">Sold Out</Badge>
              </div>
            )}
            <Image
              src={product.images && product.images.length > 0 ? product.images[selectedImageIndex] : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center'}
              alt={product.name || 'Product image'}
              width={600}
              height={600}
              className="w-full h-full object-cover"
              data-ai-hint={product.aiHint}
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images && product.images.length > 0 ? (
              product.images.map((img, index) => (
                <div 
                  key={index} 
                  className={`aspect-square w-full overflow-hidden rounded-md border-2 cursor-pointer transition-all duration-200 ${
                    index === selectedImageIndex ? 'border-primary scale-105' : 'border-transparent hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={img}
                    alt={`${product.name || 'Product'} thumbnail ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                    data-ai-hint={product.aiHint}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-4">
                <p className="text-muted-foreground text-center">No images available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Product Details */}
        <div>
          <h1 className="text-4xl md:text-5xl font-headline mb-4">{product.name || 'Unnamed Product'}</h1>
          <div className="flex items-center gap-4 mb-6">
            <p className="text-3xl font-bold text-primary">₹{(product.price || 0).toLocaleString()}</p>
            {product.originalPrice && (
              <p className="text-xl text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</p>
            )}
            {product.soldOut && (
              <Badge className="bg-red-600 text-white">Sold Out</Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground mb-8">{product.description || 'No description available'}</p>
        
          <div className="flex items-center gap-4 mb-8">
            <p>Quantity:</p>
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={product.soldOut}><Minus className="h-4 w-4" /></Button>
              <span className="w-10 text-center">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)} disabled={product.soldOut}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {product.soldOut ? (
              <NotifyButton
                productId={product.id}
                productName={product.name || 'Unnamed Product'}
                size="lg"
                className="flex-1"
              />
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="flex-1" 
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" /> 
                  Add to Cart
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="flex-1" 
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </>
            )}
            <WishlistButton 
              productId={product.id}
              productName={product.name || 'Unnamed Product'}
              size="lg"
              variant="outline"
              className="px-4"
            />
          </div>

          <Accordion type="single" collapsible defaultValue="description" className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger className="font-headline text-lg">Full Description</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {product.description || 'No description available'}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="specifications">
              <AccordionTrigger className="font-headline text-lg">Specifications</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {product.specification || 'No specifications available'}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
          >
            <X className="h-6 w-6" />
          </button>
          
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square w-full">
              <Image
                src={product.images && product.images.length > 0 ? product.images[selectedImageIndex] : 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center'}
                alt={product.name || 'Product image'}
                fill
                className="object-contain"
              />
            </div>
            
            {/* Navigation arrows */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-3 hover:bg-black/75 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(prev => prev === 0 ? product.images!.length - 1 : prev - 1);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-3 hover:bg-black/75 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(prev => prev === product.images!.length - 1 ? 0 : prev + 1);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 rounded-full px-3 py-1 text-sm">
              {selectedImageIndex + 1} / {product.images?.length || 1}
            </div>
          </div>
        </div>
      )}

      <Separator className="my-16" />
      
      {/* Ratings and Reviews Section */}
      <ProductReviews product={product} />
      
      {/* Similar Artwork Section */}
      <ArtworkSuggestions currentArtworkId={product.id} />
    </div>
  );
}
