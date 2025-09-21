// Utility functions for user management with Clerk and Supabase integration

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// Export the isSupabaseConfigured function
export { isSupabaseConfigured } from '@/lib/supabase';

// Get current user's Supabase data using their Clerk ID
export async function getCurrentUserSupabaseData(clerkUserId: string) {
  // If Supabase is not configured, return null
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, cannot fetch user data');
    return { success: false, error: new Error('Supabase not configured') };
  }

  // If supabase is not available, return early
  if (!supabase) {
    console.log('Supabase client not available, cannot fetch user data');
    return { success: false, error: new Error('Supabase client not available') };
  }

  try {
    const result = await (supabase as SupabaseClient)
      .from('users')
      .select('*')
      .eq('id', clerkUserId)
      .single();
      
    if (result.error) {
      console.error('Error fetching user from Supabase:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error getting user from Supabase:', error);
    return { success: false, error };
  }
}

// Update user profile in Supabase
export async function updateUserProfile(clerkUserId: string, profileData: Partial<{
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
}>) {
  // If Supabase is not configured, return null
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, cannot update user profile');
    return { success: false, error: new Error('Supabase not configured') };
  }

  // If supabase is not available, return early
  if (!supabase) {
    console.log('Supabase client not available, cannot update user profile');
    return { success: false, error: new Error('Supabase client not available') };
  }

  try {
    const result = await (supabase as SupabaseClient)
      .from('users')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', clerkUserId)
      .select()
      .single();
      
    if (result.error) {
      console.error('Error updating user profile:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
}

// Get user's orders from Supabase
export async function getUserOrders(clerkUserId: string) {
  // If Supabase is not configured, return null
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, cannot fetch user orders');
    return { success: false, error: new Error('Supabase not configured') };
  }

  // If supabase is not available, return early
  if (!supabase) {
    console.log('Supabase client not available, cannot fetch user orders');
    return { success: false, error: new Error('Supabase client not available') };
  }

  try {
    const result = await (supabase as SupabaseClient)
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            price,
            image_url
          )
        )
      `)
      .eq('user_id', clerkUserId)
      .order('created_at', { ascending: false });
      
    if (result.error) {
      console.error('Error fetching user orders:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error getting user orders:', error);
    return { success: false, error };
  }
}

// Get user's reviews from Supabase
export async function getUserReviews(clerkUserId: string) {
  // If Supabase is not configured, return null
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, cannot fetch user reviews');
    return { success: false, error: new Error('Supabase not configured') };
  }

  // If supabase is not available, return early
  if (!supabase) {
    console.log('Supabase client not available, cannot fetch user reviews');
    return { success: false, error: new Error('Supabase client not available') };
  }

  try {
    const result = await (supabase as SupabaseClient)
      .from('reviews')
      .select(`
        *,
        products (
          name,
          image_url
        )
      `)
      .eq('user_id', clerkUserId)
      .order('created_at', { ascending: false });
      
    if (result.error) {
      console.error('Error fetching user reviews:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error getting user reviews:', error);
    return { success: false, error };
  }
}

// Create a new review for a product
export async function createReview(clerkUserId: string, productId: string, rating: number, comment: string) {
  // If Supabase is not configured, return null
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, cannot create review');
    return { success: false, error: new Error('Supabase not configured') };
  }

  // If supabase is not available, return early
  if (!supabase) {
    console.log('Supabase client not available, cannot create review');
    return { success: false, error: new Error('Supabase client not available') };
  }

  try {
    const result = await (supabase as SupabaseClient)
      .from('reviews')
      .insert({
        user_id: clerkUserId,
        product_id: productId,
        rating: rating,
        comment: comment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (result.error) {
      console.error('Error creating review:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error creating review:', error);
    return { success: false, error };
  }
}

// Update an existing review
export async function updateReview(reviewId: string, clerkUserId: string, rating: number, comment: string) {
  // If Supabase is not configured, return null
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, cannot update review');
    return { success: false, error: new Error('Supabase not configured') };
  }

  // If supabase is not available, return early
  if (!supabase) {
    console.log('Supabase client not available, cannot update review');
    return { success: false, error: new Error('Supabase client not available') };
  }

  try {
    const result = await (supabase as SupabaseClient)
      .from('reviews')
      .update({
        rating: rating,
        comment: comment,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .eq('user_id', clerkUserId)
      .select()
      .single();
      
    if (result.error) {
      console.error('Error updating review:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error updating review:', error);
    return { success: false, error };
  }
}

// Delete a review
export async function deleteReview(reviewId: string, clerkUserId: string) {
  // If Supabase is not configured, return null
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, cannot delete review');
    return { success: false, error: new Error('Supabase not configured') };
  }

  // If supabase is not available, return early
  if (!supabase) {
    console.log('Supabase client not available, cannot delete review');
    return { success: false, error: new Error('Supabase client not available') };
  }

  try {
    const result = await (supabase as SupabaseClient)
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', clerkUserId);
      
    if (result.error) {
      console.error('Error deleting review:', result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, error };
  }
}