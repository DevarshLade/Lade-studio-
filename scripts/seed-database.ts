import { config } from 'dotenv'
import { supabaseAdmin } from '@/lib/supabase'
import { products as staticProducts } from '@/lib/data'
import type { ProductInsert, ReviewInsert } from '@/types/database'

// Load environment variables
config({ path: '.env.local' })

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

/**
 * Seed the database with initial product data
 */
export async function seedProducts() {
  try {
    console.log('🌱 Starting to seed products...')

    // Convert static products to Supabase format
    const productsToInsert: ProductInsert[] = staticProducts.map(product => {
      // Validate product name
      if (!product.name || typeof product.name !== 'string') {
        throw new Error('Product name is required and must be a string');
      }
      
      return {
        name: product.name,
        slug: product.slug || generateSlug(product.name), // Generate slug if not provided
        description: product.description,
        specification: product.specification,
        price: product.price,
        original_price: product.originalPrice || null,
        category: product.category as any,
        size: product.size || null,
        images: product.images,
        is_featured: product.isFeatured || false,
        ai_hint: product.aiHint,
        delivery_charge: (product as any).delivery_charge || 50,
        sold_out: (product as any).soldOut || false
      };
    })

    // Insert products
    const { data: insertedProducts, error: productError } = await (supabaseAdmin as any)
      .from('products')
      .insert(productsToInsert)
      .select()

    if (productError) {
      throw new Error(`Failed to insert products: ${productError.message}`)
    }

    console.log(`✅ Inserted ${insertedProducts.length} products`)

    // Now insert reviews for products that have them
    const reviewsToInsert: ReviewInsert[] = []
    
    for (let i = 0; i < staticProducts.length; i++) {
      const staticProduct = staticProducts[i]
      const insertedProduct = insertedProducts[i]
      
      if (staticProduct.reviews && staticProduct.reviews.length > 0) {
        for (const review of staticProduct.reviews) {
          reviewsToInsert.push({
            product_id: insertedProduct.id,
            author_name: review.name,
            rating: review.rating,
            comment: review.comment,
            created_at: new Date(review.date).toISOString()
          })
        }
      }
    }

    if (reviewsToInsert.length > 0) {
      const { data: insertedReviews, error: reviewError } = await (supabaseAdmin as any)
        .from('reviews')
        .insert(reviewsToInsert)
        .select()

      if (reviewError) {
        throw new Error(`Failed to insert reviews: ${reviewError.message}`)
      }

      console.log(`✅ Inserted ${insertedReviews.length} reviews`)
    }

    console.log('🎉 Database seeding completed successfully!')
    return { success: true, message: 'Database seeded successfully' }
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    return { success: false, message: (error as Error).message }
  }
}

/**
 * Clear all data from the database (for testing purposes)
 */
export async function clearDatabase() {
  try {
    console.log('🧹 Clearing database...')

    // Delete in order to respect foreign key constraints
    await supabaseAdmin.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('✅ Database cleared successfully')
    return { success: true, message: 'Database cleared successfully' }
  } catch (error) {
    console.error('❌ Error clearing database:', error)
    return { success: false, message: (error as Error).message }
  }
}

/**
 * Reset database (clear and then seed)
 */
export async function resetDatabase() {
  console.log('🔄 Resetting database...')
  
  const clearResult = await clearDatabase()
  if (!clearResult.success) {
    return clearResult
  }

  const seedResult = await seedProducts()
  return seedResult
}

// Script to run when called directly
if (require.main === module) {
  const action = process.argv[2]
  
  switch (action) {
    case 'seed':
      seedProducts().then(result => {
        console.log(result.message)
        process.exit(result.success ? 0 : 1)
      })
      break
    case 'clear':
      clearDatabase().then(result => {
        console.log(result.message)
        process.exit(result.success ? 0 : 1)
      })
      break
    case 'reset':
      resetDatabase().then(result => {
        console.log(result.message)
        process.exit(result.success ? 0 : 1)
      })
      break
    default:
      console.log('Usage: tsx scripts/seed-database.ts [seed|clear|reset]')
      process.exit(1)
  }
}