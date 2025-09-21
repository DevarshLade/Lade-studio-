import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/database'

export interface Category {
  id: string
  created_at: string
  updated_at: string
  name: string
  description: string | null
  image_url: string | null
  is_active: boolean
}

export interface CustomDesign {
  id: string
  created_at: string
  updated_at: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  category_id: string
  product_id: string
  design_reference_images: string[] | null
  quantity: number
  additional_details: string | null
  status: string
  admin_notes: string | null
  estimated_completion_date: string | null
  estimated_price: number | null
  final_price: number | null
}

export interface CustomDesignInsert {
  id?: string
  created_at?: string
  updated_at?: string
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  category_id: string
  product_id: string
  design_reference_images?: string[] | null
  quantity: number
  additional_details?: string | null
  status?: string
  admin_notes?: string | null
  estimated_completion_date?: string | null
  estimated_price?: number | null
  final_price?: number | null
}

export interface CustomDesignFormData {
  customerName: string
  customerEmail: string
  customerPhone?: string
  categoryId: string
  productId: string
  designReferenceImages?: string[]
  quantity: number
  additionalDetails?: string
}

// Get all categories
export async function getCategories(): Promise<{ data: Category[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error fetching categories:', error)
    return { data: null, error: error as Error }
  }
}

// Get products by category
export async function getProductsByCategory(categoryId: string): Promise<{ data: Product[] | null; error: Error | null }> {
  try {
    // First, let's verify the category exists
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .single();

    if (categoryError) {
      console.error('Error verifying category:', categoryError);
      return { data: null, error: new Error(`Category not found: ${categoryId}`) };
    }

    // Try to fetch products by category_id first (foreign key approach)
    const { data: productsData1, error: error1 } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');

    if (!error1) {
      return { data: productsData1, error: null };
    }

    // If that fails, try to fetch products by category enum value
    console.warn('Failed to fetch products by category_id, trying category enum:', error1);
    
    const { data: productsData2, error: error2 } = await supabase
      .from('products')
      .select('*')
      .eq('category', (categoryData as any).name)
      .order('name');
      
    if (!error2) {
      return { data: productsData2, error: null };
    }

    // If both approaches fail, return an empty array (no products for this category)
    console.warn('Failed to fetch products by both category_id and category enum:', error2);
    return { data: [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching products by category:', error);
    return { data: null, error: error as Error };
  }
}

// Submit custom design request
export async function submitCustomDesignRequest(
  formData: CustomDesignFormData
): Promise<{ data: CustomDesign | null; error: Error | null }> {
  try {
    const designData: CustomDesignInsert = {
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      customer_phone: formData.customerPhone || null,
      category_id: formData.categoryId,
      product_id: formData.productId,
      design_reference_images: formData.designReferenceImages || [],
      quantity: formData.quantity,
      additional_details: formData.additionalDetails || null,
      status: 'pending'
    }

    const { data, error } = await (supabase as any)
      .from('custom_designs')
      .insert(designData)
      .select()
      .single()

    if (error) {
      console.error('Error submitting custom design request:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error submitting custom design request:', error)
    return { data: null, error: error as Error }
  }
}

// Get custom design requests for a customer
export async function getCustomDesignRequests(
  customerEmail: string
): Promise<{ data: CustomDesign[] | null; error: Error | null }> {
  try {
    const { data, error } = await (supabase as any)
      .from('custom_designs')
      .select(`
        *,
        categories:category_id (
          id,
          name
        ),
        products:product_id (
          id,
          name,
          price
        )
      `)
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching custom design requests:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error fetching custom design requests:', error)
    return { data: null, error: error as Error }
  }
}

// Get custom design request by ID
export async function getCustomDesignRequest(
  id: string
): Promise<{ data: CustomDesign | null; error: Error | null }> {
  try {
    const { data, error } = await (supabase as any)
      .from('custom_designs')
      .select(`
        *,
        categories:category_id (
          id,
          name
        ),
        products:product_id (
          id,
          name,
          price
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching custom design request:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error fetching custom design request:', error)
    return { data: null, error: error as Error }
  }
}

// Update custom design request status (admin function)
export async function updateCustomDesignStatus(
  id: string,
  status: string,
  adminNotes?: string,
  estimatedPrice?: number,
  finalPrice?: number,
  estimatedCompletionDate?: string
): Promise<{ data: CustomDesign | null; error: Error | null }> {
  try {
    const updateData: any = { status }
    
    if (adminNotes) updateData.admin_notes = adminNotes
    if (estimatedPrice) updateData.estimated_price = estimatedPrice
    if (finalPrice) updateData.final_price = finalPrice
    if (estimatedCompletionDate) updateData.estimated_completion_date = estimatedCompletionDate

    const { data, error } = await (supabase as any)
      .from('custom_designs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating custom design status:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Unexpected error updating custom design status:', error)
    return { data: null, error: error as Error }
  }
}