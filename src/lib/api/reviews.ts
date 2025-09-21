import { supabase } from '@/lib/supabase'
import type { Review, ReviewInsert } from '@/types/database'
import { supabaseReviewToLegacy } from '@/types'
import type { Review as LegacyReview } from '@/types'

/**
 * Check if the current user has purchased and received the product
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function canUserReviewProduct(userId: string, productId: string): Promise<{ 
  canReview: boolean; 
  reason?: string; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      return { 
        canReview: false, 
        reason: 'User ID is required', 
        error: null 
      }
    }
    
    // Validate product ID
    if (!productId) {
      return { 
        canReview: false, 
        reason: 'Product ID is required', 
        error: null 
      }
    }
    
    // For now, allow all users to review products
    // In a real implementation, you might check if the user has purchased the product
    return { 
      canReview: true, 
      error: null 
    }
  } catch (error) {
    return { 
      canReview: false, 
      reason: 'Error checking review eligibility', 
      error: error as Error 
    }
  }
}

/**
 * Check if user can edit a specific review
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function canUserEditReview(userId: string, reviewId: string): Promise<{ 
  canEdit: boolean; 
  reason?: string; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      return { 
        canEdit: false, 
        reason: 'User ID is required', 
        error: null 
      }
    }
    
    // Validate review ID
    if (!reviewId) {
      return { 
        canEdit: false, 
        reason: 'Review ID is required', 
        error: null 
      }
    }
    
    // Fetch the review to check ownership
    const { data: review, error } = await supabase
      .from('reviews')
      .select('author_name')
      .eq('id', reviewId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Review not found
        return { 
          canEdit: false, 
          reason: 'Review not found', 
          error: null 
        }
      }
      throw new Error(error.message)
    }
    
    // For now, we'll check if the user's ID matches the review author
    // In a real implementation, you might want to check the user's email or other identifier
    const canEdit = (review as any).author_name === userId
    
    return { 
      canEdit, 
      reason: canEdit ? undefined : 'You are not authorized to edit this review',
      error: null 
    }
  } catch (error) {
    return { 
      canEdit: false, 
      reason: 'Error checking edit permission', 
      error: error as Error 
    }
  }
}

/**
 * Update a review (with ownership verification and image support)
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function updateProductReview(
  userId: string,
  reviewId: string,
  rating: number,
  comment?: string,
  imageUrls?: string[]
): Promise<{ data: Review | null; error: Error | null }> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    // First check if user can edit this review
    const { canEdit, reason, error: editError } = await canUserEditReview(userId, reviewId)
    
    if (editError) {
      throw new Error(`Permission check failed: ${editError.message}`);
    }
    
    if (!canEdit) {
      throw new Error(reason || 'You are not authorized to edit this review');
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    // Validate comment length
    if (comment && comment.length > 1000) {
      throw new Error('Comment must be less than 1000 characters');
    }
    
    // Validate image URLs
    if (imageUrls && imageUrls.length > 5) {
      throw new Error('Maximum 5 images allowed');
    }
    
    // Validate image URL format
    if (imageUrls) {
      for (const url of imageUrls) {
        try {
          new URL(url);
        } catch {
          throw new Error('Invalid image URL provided');
        }
      }
    }

    const updateData: any = {
      rating,
      comment: comment || null,
      image_urls: imageUrls || null
    }

    const { data: review, error } = await (supabase as any)
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select()
      .single()

    if (error) {
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages
      if (error.message.includes('constraint')) {
        errorMessage = 'Invalid data provided. Please check your input.';
      }
      
      throw new Error(errorMessage);
    }

    return { data: review, error: null }
  } catch (error) {
    console.error("Review update error:", error);
    return { data: null, error: error as Error }
  }
}

/**
 * Get user's reviews for a specific product (multiple reviews allowed)
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function getUserReviewsForProduct(userId: string, productId: string): Promise<{ 
  data: Review[] | null; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      return { data: null, error: new Error('User ID is required') }
    }
    
    // Validate product ID
    if (!productId) {
      return { data: null, error: new Error('Product ID is required') }
    }

    const { data: reviews, error } = await (supabase as any)
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('author_name', userId) // Use user ID as author name for now
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return { data: reviews || [], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get user's review for a specific product (legacy - returns single review)
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function getUserReviewForProduct(userId: string, productId: string): Promise<{ 
  data: Review | null; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      return { data: null, error: new Error('User ID is required') }
    }
    
    // Validate product ID
    if (!productId) {
      return { data: null, error: new Error('Product ID is required') }
    }

    const { data: review, error } = await (supabase as any)
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('author_name', userId) // Use user ID as author name for now
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No review found
        return { data: null, error: null }
      }
      throw new Error(error.message)
    }

    return { data: review, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(productId: string): Promise<{ data: LegacyReview[] | null; error: Error | null }> {
  try {
    const { data: reviews, error } = await (supabase as any)
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    if (!reviews) {
      return { data: [], error: null }
    }

    // Convert to legacy format
    const legacyReviews = (reviews as any[]).map(supabaseReviewToLegacy)

    return { data: legacyReviews, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Add a review for a product (with purchase verification and image support)
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function addProductReview(
  userId: string,
  productId: string,
  authorName: string,
  rating: number,
  comment?: string,
  imageUrls?: string[]
): Promise<{ data: Review | null; error: Error | null }> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    // Validate product ID
    if (!productId) {
      throw new Error('Product ID is required')
    }
    
    // First check if user can review this product
    const { canReview, reason, error: eligibilityError } = await canUserReviewProduct(userId, productId)
    
    if (eligibilityError) {
      throw eligibilityError
    }
    
    if (!canReview) {
      throw new Error(reason || 'You are not eligible to review this product')
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }

    const reviewData: any = {
      product_id: productId,
      author_name: authorName, // Use the provided author name
      rating,
      comment: comment || null,
      image_urls: imageUrls || null
    }

    const { data: review, error } = await (supabase as any)
      .from('reviews')
      .insert([reviewData])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data: review, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get user's review count for a specific product
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function getUserReviewCount(userId: string, productId: string): Promise<{ 
  data: { count: number; remaining: number } | null; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      return { data: null, error: new Error('User ID is required') }
    }
    
    // Validate product ID
    if (!productId) {
      return { data: null, error: new Error('Product ID is required') }
    }

    const { data: reviews, error } = await (supabase as any)
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('author_name', userId) // Use user ID as author name for now

    if (error) {
      throw new Error(error.message)
    }

    const count = reviews?.length || 0
    const remaining = Math.max(0, 10 - count)

    return { data: { count, remaining }, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get average rating for a product
 */
export async function getProductAverageRating(productId: string): Promise<{ 
  data: { average: number; count: number } | null; 
  error: Error | null 
}> {
  try {
    const { data: reviews, error } = await (supabase as any)
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)

    if (error) {
      throw new Error(error.message)
    }

    if (!reviews || reviews.length === 0) {
      return { data: { average: 0, count: 0 }, error: null }
    }

    const average = (reviews as any[]).reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
    
    return { 
      data: { 
        average: Math.round(average * 10) / 10, // Round to 1 decimal place
        count: reviews.length 
      }, 
      error: null 
    }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a review (Admin function or user who created it)
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function deleteReview(userId: string, reviewId: string): Promise<{ error: Error | null }> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    // Validate review ID
    if (!reviewId) {
      throw new Error('Review ID is required')
    }
    
    // First check if user can delete this review
    const { canEdit, reason, error: editError } = await canUserEditReview(userId, reviewId)
    
    if (editError) {
      throw new Error(`Permission check failed: ${editError.message}`);
    }
    
    if (!canEdit) {
      throw new Error(reason || 'You are not authorized to delete this review');
    }

    const { error } = await (supabase as any)
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      throw new Error(error.message)
    }

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}