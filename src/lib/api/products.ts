import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { Product, ProductInsert, ProductUpdate, Review } from '@/types/database'
import { supabaseProductToLegacy, supabaseReviewToLegacy } from '@/types'
import type { Product as LegacyProduct } from '@/types'

/**
 * Get all products with optional filtering
 */
export async function getProducts(options: {
  category?: string
  featured?: boolean
  limit?: number
  offset?: number
} = {}): Promise<{ data: LegacyProduct[] | null; error: Error | null }> {
  try {
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        category,
        price,
        original_price,
        slug,
        images,
        description,
        specification,
        size,
        is_featured,
        ai_hint,
        sold_out,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (options.category) {
      query = query.eq('category', options.category)
    }

    if (options.featured !== undefined) {
      query = query.eq('is_featured', options.featured)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data: products, error } = await (query as any)

    if (error) {
      throw new Error(error.message)
    }

    if (!products) {
      return { data: null, error: null }
    }

    // Convert to legacy format (without reviews for better performance)
    const legacyProducts = (products as any[]).map((product: any) => 
      supabaseProductToLegacy(product, [])
    )

    return { data: legacyProducts, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get all products - for debugging purposes
 */
export async function getAllProducts(): Promise<{ data: any[] | null; error: Error | null }> {
  try {
    const { data, error } = await (supabase as any)
      .from('products')
      .select('id, name, category, price, slug')

    if (error) {
      throw new Error(error.message);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Generate a URL-friendly slug from a product name
 */
export function generateSlug(name: string): string {
  // Handle edge cases where name might be undefined or null
  if (!name || typeof name !== 'string') {
    return 'unnamed-product';
  }
  
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Ensure all products have valid slugs
 */
export async function ensureProductSlugs(): Promise<void> {
  try {
    // Get all products that don't have slugs or have invalid slugs
    const { data: products, error } = await (supabase as any)
      .from('products')
      .select('id, name, slug')
      .or('slug.is.null,slug.eq.')

    if (error) {
      console.error('Error fetching products for slug validation:', error);
      return;
    }

    // Update products that need slugs
    for (const product of products) {
      if (!product.slug || product.slug.trim() === '') {
        const newSlug = generateSlug(product.name);
        const { error: updateError } = await (supabase as any)
          .from('products')
          .update({ slug: newSlug })
          .eq('id', product.id);
          
        if (updateError) {
          console.error(`Failed to update slug for product ${product.id}:`, updateError);
        } else {
          console.log(`Updated slug for product ${product.id}: ${newSlug}`);
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring product slugs:', error);
  }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<{ data: LegacyProduct | null; error: Error | null }> {
  try {
    // Try exact match first
    let { data: product, error } = await (supabase as any)
      .from('products')
      .select(`
        *,
        reviews (
          id,
          product_id,
          author_name,
          rating,
          comment,
          created_at
        )
      `)
      .eq('slug', slug)
      .single();

    // If not found, try ID match (in case slug is actually an ID)
    if (error && error.code === 'PGRST116') {
      let { data: productById, error: idError } = await (supabase as any)
        .from('products')
        .select(`
          *,
          reviews (
            id,
            product_id,
            author_name,
            rating,
            comment,
            created_at
          )
        `)
        .eq('id', slug)
        .single();
        
      if (!idError && productById) {
        product = productById;
        error = null;
      }
    }

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      throw new Error(error.message);
    }

    if (!product) {
      return { data: null, error: null };
    }

    // Ensure the product has a slug, generate one if missing
    if (!product.slug) {
      product.slug = generateSlug(product.name);
    }

    // Convert to legacy format
    const legacyProduct = supabaseProductToLegacy(product, product.reviews || [])

    return { data: legacyProduct, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string): Promise<{ data: LegacyProduct | null; error: Error | null }> {
  try {
    const { data: product, error } = await (supabase as any)
      .from('products')
      .select(`
        *,
        reviews (
          id,
          product_id,
          author_name,
          rating,
          comment,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null } // Not found
      }
      throw new Error(error.message)
    }

    if (!product) {
      return { data: null, error: null }
    }

    // Convert to legacy format
    const legacyProduct = supabaseProductToLegacy(product, product.reviews || [])

    return { data: legacyProduct, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 6): Promise<{ data: LegacyProduct[] | null; error: Error | null }> {
  return getProducts({ featured: true, limit })
}

/**
 * Get latest released products
 */
export async function getLatestProducts(limit: number = 8): Promise<{ data: LegacyProduct[] | null; error: Error | null }> {
  try {
    const { data: products, error } = await (supabase as any)
      .from('products')
      .select(`
        id,
        name,
        category,
        price,
        original_price,
        slug,
        images,
        description,
        specification,
        size,
        is_featured,
        ai_hint,
        sold_out,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(error.message)
    }

    if (!products) {
      return { data: null, error: null }
    }

    // Convert to legacy format (without reviews for better performance)
    const legacyProducts = (products as any[]).map((product: any) => 
      supabaseProductToLegacy(product, [])
    )

    return { data: legacyProducts, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Get products with highest discount percentages
 */
export async function getHighDiscountProducts(limit: number = 8): Promise<{ data: LegacyProduct[] | null; error: Error | null }> {
  try {
    const { data: products, error } = await (supabase as any)
      .from('products')
      .select(`
        id,
        name,
        category,
        price,
        original_price,
        slug,
        images,
        description,
        specification,
        size,
        is_featured,
        ai_hint,
        sold_out,
        created_at
      `)
      .not('original_price', 'is', null)
      .gt('original_price', 0)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(error.message)
    }

    if (!products) {
      return { data: null, error: null }
    }

    // Calculate discount percentage and sort by highest discount
    const productsWithDiscount = (products as any[]).map((product: any) => {
      const legacyProduct = supabaseProductToLegacy(product, [])
      const discountPercentage = product.original_price && product.price 
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
        : 0
      return { ...legacyProduct, discountPercentage }
    })

    // Sort by discount percentage (highest first)
    productsWithDiscount.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))

    return { data: productsWithDiscount, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Search products by name or description
 */
export async function searchProducts(query: string, limit: number = 20): Promise<{ data: LegacyProduct[] | null; error: Error | null }> {
  try {
    const { data: products, error } = await (supabase as any)
      .from('products')
      .select(`
        id,
        name,
        category,
        price,
        original_price,
        slug,
        images,
        description,
        specification,
        size,
        is_featured,
        ai_hint,
        sold_out,
        created_at
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      throw new Error(error.message)
    }

    if (!products) {
      return { data: null, error: null }
    }

    // Convert to legacy format (without reviews for better performance)
    const legacyProducts = (products as any[]).map((product: any) => 
      supabaseProductToLegacy(product, [])
    )

    return { data: legacyProducts, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Create a new product (Admin function)
 */
export async function createProduct(productData: ProductInsert): Promise<{ data: Product | null; error: Error | null }> {
  try {
    const { data: product, error } = await (supabaseAdmin as any)
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data: product, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Update a product (Admin function)
 */
export async function updateProduct(id: string, productData: ProductUpdate): Promise<{ data: Product | null; error: Error | null }> {
  try {
    const { data: product, error } = await (supabaseAdmin as any)
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data: product, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Delete a product (Admin function)
 */
export async function deleteProduct(id: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}