import { supabase } from '@/lib/supabase'
import type { Wishlist, WishlistInsert } from '@/types/database'
import type { Product } from '@/types'

// Type guard to check if supabase is configured
function isSupabaseConfigured(): boolean {
  return supabase !== null
}

/**
 * Get user's wishlist with product details
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function getUserWishlist(userId: string): Promise<{ 
  data: (Wishlist & { products: Product })[] | null; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required to fetch wishlist')
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured')
    }

    // First get the wishlist items for the user
    const { data: wishlistItems, error: wishlistError } = await supabase!
      .from('wishlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (wishlistError) {
      throw new Error(wishlistError.message)
    }

    // If no wishlist items, return empty array
    if (!wishlistItems || wishlistItems.length === 0) {
      return { data: [], error: null }
    }

    // Get product IDs from wishlist items
    const productIds = (wishlistItems as any[]).map(item => item.product_id)

    // Fetch products separately
    const { data: products, error: productsError } = await supabase!
      .from('products')
      .select('*')
      .in('id', productIds)

    if (productsError) {
      throw new Error(productsError.message)
    }

    // Combine wishlist items with product data
    const wishlistWithProducts = (wishlistItems as any[]).map(wishlistItem => {
      const product = (products as any[]).find(p => p.id === wishlistItem.product_id)
      return {
        ...wishlistItem,
        products: product || ({} as Product)
      }
    })

    return { data: wishlistWithProducts as any, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Add product to wishlist
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function addToWishlist(userId: string, productId: string): Promise<{ 
  data: Wishlist | null; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required to add items to wishlist')
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured')
    }

    const wishlistItem: WishlistInsert = {
      user_id: userId,
      product_id: productId
    }

    const { data, error } = await (supabase! as any)
      .from('wishlist')
      .insert(wishlistItem)
      .select()
      .single()

    if (error) {
      // Check if it's a duplicate entry error
      if (error.code === '23505') {
        throw new Error('Product is already in your wishlist')
      }
      throw new Error(error.message)
    }

    return { data: data as Wishlist, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Remove product from wishlist
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function removeFromWishlist(userId: string, productId: string): Promise<{ 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required to remove items from wishlist')
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured')
    }

    const { error } = await supabase!
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) {
      throw new Error(error.message)
    }

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Toggle product in wishlist (add if not present, remove if present)
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function toggleWishlistItem(userId: string, productId: string): Promise<{ 
  isInWishlist: boolean; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      throw new Error('User ID is required to manage wishlist')
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured')
    }

    // First try to use the database function for atomic toggle operation
    try {
      const { data, error } = await (supabase! as any).rpc('toggle_wishlist_item', {
        user_uuid: userId,
        product_uuid: productId
      })

      if (error) {
        throw new Error(error.message)
      }

      return { isInWishlist: data, error: null }
    } catch (rpcError) {
      // If the RPC function fails, fall back to manual implementation
      console.warn('RPC function failed, using fallback implementation:', rpcError)
      
      // Check if item is already in wishlist
      const { isInWishlist: currentlyInWishlist, error: checkError } = await isProductInWishlist(userId, productId)
      
      if (checkError) {
        throw new Error(checkError.message)
      }
      
      if (currentlyInWishlist) {
        // Remove from wishlist
        const { error: removeError } = await removeFromWishlist(userId, productId)
        if (removeError) {
          throw new Error(removeError.message)
        }
        return { isInWishlist: false, error: null }
      } else {
        // Add to wishlist
        const { error: addError } = await addToWishlist(userId, productId)
        if (addError) {
          throw new Error(addError.message)
        }
        return { isInWishlist: true, error: null }
      }
    }
  } catch (error) {
    return { isInWishlist: false, error: error as Error }
  }
}

/**
 * Check if product is in user's wishlist
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function isProductInWishlist(userId: string, productId: string): Promise<{ 
  isInWishlist: boolean; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      return { isInWishlist: false, error: null }
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return { isInWishlist: false, error: new Error('Supabase is not configured') }
    }

    const { data, error } = await supabase!
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found - not in wishlist
        return { isInWishlist: false, error: null }
      }
      throw new Error(error.message)
    }

    return { isInWishlist: !!data, error: null }
  } catch (error) {
    return { isInWishlist: false, error: error as Error }
  }
}

/**
 * Get wishlist count for user
 * For Clerk migration, this function now accepts user ID as a parameter
 */
export async function getWishlistCount(userId: string): Promise<{ 
  count: number; 
  error: Error | null 
}> {
  try {
    // Validate user ID
    if (!userId) {
      return { count: 0, error: null }
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return { count: 0, error: new Error('Supabase is not configured') }
    }

    const { count, error } = await supabase!
      .from('wishlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }

    return { count: count || 0, error: null }
  } catch (error) {
    return { count: 0, error: error as Error }
  }
}