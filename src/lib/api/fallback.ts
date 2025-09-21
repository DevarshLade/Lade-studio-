// Fallback functions that use static data when Supabase is not configured
import { products } from '@/lib/data'
import type { Product, Review } from '@/types'

export async function getFallbackProducts(options: {
  category?: string
  featured?: boolean
  limit?: number
  offset?: number
} = {}): Promise<{ data: Product[] | null; error: Error | null }> {
  try {
    let filteredProducts = [...products]

    if (options.category) {
      const categoryName = options.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      filteredProducts = filteredProducts.filter(p => p.category === categoryName)
    }

    if (options.featured !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.isFeatured === options.featured)
    }

    if (options.offset) {
      filteredProducts = filteredProducts.slice(options.offset)
    }

    if (options.limit) {
      filteredProducts = filteredProducts.slice(0, options.limit)
    }

    return { data: filteredProducts, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getFallbackProductBySlug(slug: string): Promise<{ data: Product | null; error: Error | null }> {
  try {
    const product = products.find(p => p.slug === slug)
    return { data: product || null, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getFallbackFeaturedProducts(limit: number = 6): Promise<{ data: Product[] | null; error: Error | null }> {
  return getFallbackProducts({ featured: true, limit })
}