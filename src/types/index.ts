// Import types from Supabase
import type { Product as SupabaseProduct, Review as SupabaseReview } from './database'

// Legacy Review type (for compatibility with existing UI components)
export type Review = {
  id: string;
  name: string; // This maps to author_name in Supabase
  rating: number; // 1-5
  comment: string;
  date: string; // This maps to created_at in Supabase
  images?: string[]; // This maps to image_urls in Supabase
};

// Legacy Product type (for compatibility with existing UI components)
export type Product = {
  id: string;
  name: string;
  category: 'Painting' | 'Pots' | 'Canvas' | 'Hand Painted Jewelry' | 'Terracotta Pots' | 'Fabric Painting' | 'Portrait' | 'Wall Hanging';
  price: number;
  originalPrice?: number; // This maps to original_price in Supabase
  slug: string;
  images: string[];
  description: string;
  specification: string;
  size?: string;
  isFeatured?: boolean; // This maps to is_featured in Supabase
  aiHint: string; // This maps to ai_hint in Supabase
  delivery_charge: number; // This maps to delivery_charge in Supabase
  soldOut?: boolean; // This maps to sold_out in Supabase
  reviews?: Review[];
  discountPercentage?: number; // Added for displaying discount percentages
};

// Helper functions to convert between Supabase and legacy types
export function supabaseProductToLegacy(product: SupabaseProduct, reviews?: SupabaseReview[]): Product {
  // Handle case where product might be null or undefined
  if (!product) {
    return {
      id: 'unknown-id',
      name: 'Unnamed Product',
      category: 'Painting',
      price: 0,
      slug: 'unnamed-product',
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center'],
      description: 'No description available',
      specification: 'No specifications available',
      aiHint: '',
      delivery_charge: 0, // Changed from 50 to 0 since column doesn't exist
      soldOut: false
    } as Product;
  }

  // Ensure images array is never null/undefined and contains valid URLs
  let safeImages: string[] = [];
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    safeImages = product.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
  }
  
  // If no valid images, use placeholder
  if (safeImages.length === 0) {
    safeImages = ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center'];
  }

  // Generate slug if missing or invalid
  const productSlug = product.slug && product.slug.trim() !== '' 
    ? product.slug 
    : generateSlug(product.name || 'unnamed-product');

  return {
    id: product.id || 'unknown-id',
    name: product.name || 'Unnamed Product',
    category: product.category as any || 'Painting',
    price: typeof product.price === 'number' ? product.price : 0,
    originalPrice: typeof product.original_price === 'number' ? product.original_price : undefined,
    slug: productSlug,
    images: safeImages,
    description: product.description || 'No description available',
    specification: product.specification || 'No specifications available',
    size: product.size || undefined,
    isFeatured: typeof product.is_featured === 'boolean' ? product.is_featured : false,
    aiHint: product.ai_hint || '',
    delivery_charge: 0, // Always default to 0 since column doesn't exist
    soldOut: typeof product.sold_out === 'boolean' ? product.sold_out : false,
    reviews: reviews?.map(supabaseReviewToLegacy) || []
  }
}

/**
 * Generate a URL-friendly slug from a product name
 */
function generateSlug(name: string): string {
  // Handle edge cases where name might be undefined or null
  if (!name || typeof name !== 'string') {
    return 'unnamed-product';
  }
  
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function supabaseReviewToLegacy(review: SupabaseReview): Review {
  if (!review) {
    return {
      id: 'unknown-id',
      name: 'Anonymous',
      rating: 5,
      comment: '',
      date: new Date().toISOString().split('T')[0],
      images: []
    };
  }
  
  return {
    id: review.id,
    name: review.author_name || 'Anonymous',
    rating: typeof review.rating === 'number' ? review.rating : 5,
    comment: review.comment || '',
    date: review.created_at ? new Date(review.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    images: Array.isArray(review.image_urls) ? review.image_urls : []
  }
}

export type Category = {
  name: string;
  image: string;
  hint: string;
};

export type Testimonial = {
  id: string;
  name: string;
  image: string;
  quote: string;
};

export type BlogPost = {
  id: string;
  title: string;
  image: string;
  excerpt: string;
  hint: string;
};

// Cart and Order types
export type CartItem = Product & { quantity: number };

export type CheckoutData = {
  customerName: string;
  customerPhone?: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  paymentMethod: string;
  paymentId?: string;
};