import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

export async function GET() {
  try {
    console.log('=== Fixing Product Slugs ===')
    
    // Fetch all products
    const { data: products, error } = await (supabaseAdmin as any)
      .from('products')
      .select('id, name, slug')

    if (error) {
      console.error('❌ Error fetching products:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Found ${products.length} products`)

    let fixedCount = 0
    const fixedProducts: any[] = []

    // Check each product
    for (const product of products) {
      console.log(`\nProduct ID: ${product.id}`)
      console.log(`  Name: "${product.name}"`)
      console.log(`  Current slug: "${product.slug}"`)

      // Generate the proper slug
      const properSlug = generateSlug(product.name)
      console.log(`  Proper slug should be: "${properSlug}"`)

      // Check if slug needs to be fixed
      if (product.slug !== properSlug) {
        console.log(`  ❌ Slug needs fixing`)
        
        // Update the slug
        const { error: updateError } = await (supabaseAdmin as any)
          .from('products')
          .update({ slug: properSlug })
          .eq('id', product.id)

        if (updateError) {
          console.error(`    ❌ Failed to update: ${updateError.message}`)
        } else {
          console.log(`    ✅ Updated successfully`)
          fixedCount++
          fixedProducts.push({
            id: product.id,
            oldSlug: product.slug,
            newSlug: properSlug
          })
        }
      } else {
        console.log(`  ✅ Slug is already correct`)
      }
    }

    console.log(`\n=== Summary ===`)
    console.log(`Fixed ${fixedCount} products out of ${products.length} total products`)
    
    return NextResponse.json({ 
      success: true,
      message: `Fixed ${fixedCount} products out of ${products.length} total products`,
      fixedCount,
      totalProducts: products.length,
      fixedProducts
    })
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}