import { config } from 'dotenv'
import { supabaseAdmin } from '@/lib/supabase'

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
 * Check and fix product slugs in the database
 */
export async function checkAndFixProductSlugs() {
  try {
    console.log('🔍 Checking product slugs...')

    // Get all products
    const { data: products, error } = await (supabaseAdmin as any)
      .from('products')
      .select('id, name, slug')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    console.log(`📋 Found ${products.length} products`)

    let fixedCount = 0
    const productsToFix: { id: string; slug: string }[] = []

    // Check each product for missing or invalid slugs
    for (const product of products) {
      console.log(`\nProduct ID: ${product.id}`)
      console.log(`  Name: ${product.name}`)
      console.log(`  Current slug: ${product.slug}`)

      // Check if slug is missing or invalid
      if (!product.slug || typeof product.slug !== 'string' || product.slug.trim() === '') {
        const newSlug = generateSlug(product.name)
        console.log(`  ❌ Missing slug - generating: ${newSlug}`)
        productsToFix.push({ id: product.id, slug: newSlug })
      } else {
        // Check if slug is properly formatted
        const expectedSlug = generateSlug(product.name)
        if (product.slug !== expectedSlug) {
          console.log(`  ⚠️  Slug mismatch - expected: ${expectedSlug}`)
          // We won't fix this automatically to avoid breaking existing links
        } else {
          console.log(`  ✅ Slug is valid`)
        }
      }
    }

    // Fix products with missing slugs
    if (productsToFix.length > 0) {
      console.log(`\n🔧 Fixing ${productsToFix.length} products with missing slugs...`)
      
      for (const product of productsToFix) {
        const { error: updateError } = await (supabaseAdmin as any)
          .from('products')
          .update({ slug: product.slug })
          .eq('id', product.id)

        if (updateError) {
          console.error(`  ❌ Failed to update product ${product.id}: ${updateError.message}`)
        } else {
          console.log(`  ✅ Updated product ${product.id} with slug: ${product.slug}`)
          fixedCount++
        }
      }
    }

    console.log(`\n🎉 Check completed. Fixed ${fixedCount} products.`)
    return { success: true, fixedCount, totalProducts: products.length }
  } catch (error) {
    console.error('❌ Error checking product slugs:', error)
    return { success: false, message: (error as Error).message }
  }
}

// Script to run when called directly
if (require.main === module) {
  checkAndFixProductSlugs().then(result => {
    if (result.success) {
      console.log(`\n✅ Process completed successfully.`)
      console.log(`📊 Summary: ${result.fixedCount} products fixed out of ${result.totalProducts} total products.`)
    } else {
      console.log(`\n❌ Process failed: ${result.message}`)
    }
    process.exit(result.success ? 0 : 1)
  })
}