import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateSlug } from '@/lib/api/products'

export async function GET() {
  try {
    console.log('Fixing product slugs...')
    
    // Get all products
    const { data: products, error } = await (supabaseAdmin as any)
      .from('products')
      .select('id, name, slug')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    console.log(`Found ${products.length} products`)

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

    console.log(`\n🎉 Fix completed. Fixed ${fixedCount} products.`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Fixed ${fixedCount} products out of ${products.length} total products.`,
      fixedCount,
      totalProducts: products.length
    })
  } catch (error) {
    console.error('Error fixing product slugs:', error)
    return NextResponse.json({ 
      success: false, 
      message: (error as Error).message 
    }, { status: 500 })
  }
}