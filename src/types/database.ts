export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          description: string | null
          specification: string | null
          price: number
          original_price: number | null
          category: 'Painting' | 'Pots' | 'Canvas' | 'Hand Painted Jewelry' | 'Terracotta Pots' | 'Fabric Painting' | 'Portrait' | 'Wall Hanging' | null
          category_id: string | null
          size: string | null
          images: string[] | null
          is_featured: boolean | null
          ai_hint: string | null
          delivery_charge: number
          sold_out: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          description?: string | null
          specification?: string | null
          price: number
          original_price?: number | null
          category?: 'Painting' | 'Pots' | 'Canvas' | 'Hand Painted Jewelry' | 'Terracotta Pots' | 'Fabric Painting' | 'Portrait' | 'Wall Hanging' | null
          category_id?: string | null
          size?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          ai_hint?: string | null
          delivery_charge?: number
          sold_out?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          description?: string | null
          specification?: string | null
          price?: number
          original_price?: number | null
          category?: 'Painting' | 'Pots' | 'Canvas' | 'Hand Painted Jewelry' | 'Terracotta Pots' | 'Fabric Painting' | 'Portrait' | 'Wall Hanging' | null
          category_id?: string | null
          size?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          ai_hint?: string | null
          delivery_charge?: number
          sold_out?: boolean | null
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          product_id: string
          rating: number
          comment: string | null
          author_name: string
          image_urls: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          product_id: string
          rating: number
          comment?: string | null
          author_name: string
          image_urls?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          product_id?: string
          rating?: number
          comment?: string | null
          author_name?: string
          image_urls?: string[] | null
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          customer_name: string
          customer_phone: string | null
          shipping_address_line1: string
          shipping_address_line2: string | null
          shipping_city: string
          shipping_state: string
          shipping_pincode: string
          subtotal: number
          shipping_cost: number
          total_amount: number
          payment_method: string
          payment_id: string | null
          status: string
          cancellation_reason: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          shipping_address_line1: string
          shipping_address_line2?: string | null
          shipping_city: string
          shipping_state: string
          shipping_pincode: string
          subtotal: number
          shipping_cost: number
          total_amount: number
          payment_method: string
          payment_id?: string | null
          status?: string
          cancellation_reason?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          shipping_address_line1?: string
          shipping_address_line2?: string | null
          shipping_city?: string
          shipping_state?: string
          shipping_pincode?: string
          subtotal?: number
          shipping_cost?: number
          total_amount?: number
          payment_method?: string
          payment_id?: string | null
          status?: string
          cancellation_reason?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          price_at_purchase: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          price_at_purchase: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          price_at_purchase?: number
        }
      }
      wishlist: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          product_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          product_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          product_id?: string
        }
      }
      user_addresses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          label: string
          full_name: string
          phone: string | null
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          pincode: string
          country: string
          is_default: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          label: string
          full_name: string
          phone?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          pincode: string
          country?: string
          is_default?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          label?: string
          full_name?: string
          phone?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          pincode?: string
          country?: string
          is_default?: boolean
        }
      }
      custom_designs: {
        Row: {
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
        Insert: {
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
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          category_id?: string
          product_id?: string
          design_reference_images?: string[] | null
          quantity?: number
          additional_details?: string | null
          status?: string
          admin_notes?: string | null
          estimated_completion_date?: string | null
          estimated_price?: number | null
          final_price?: number | null
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          image_url: string | null
          is_active: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
        }
      }
      // Add the product_notify_requests table definition
      product_notify_requests: {
        Row: {
          id: string
          created_at: string
          product_id: string
          user_email: string
          user_name: string | null
          notified: boolean
          notified_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          product_id: string
          user_email: string
          user_name?: string | null
          notified?: boolean
          notified_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          product_id?: string
          user_email?: string
          user_name?: string | null
          notified?: boolean
          notified_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      product_category: 'Painting' | 'Pots' | 'Canvas' | 'Hand Painted Jewelry' | 'Terracotta Pots' | 'Fabric Painting' | 'Portrait' | 'Wall Hanging'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']

export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']

export type Wishlist = Database['public']['Tables']['wishlist']['Row']
export type WishlistInsert = Database['public']['Tables']['wishlist']['Insert']

export type UserAddress = Database['public']['Tables']['user_addresses']['Row']
export type UserAddressInsert = Database['public']['Tables']['user_addresses']['Insert']
export type UserAddressUpdate = Database['public']['Tables']['user_addresses']['Update']

export type CustomDesign = Database['public']['Tables']['custom_designs']['Row']
export type CustomDesignInsert = Database['public']['Tables']['custom_designs']['Insert']
export type CustomDesignUpdate = Database['public']['Tables']['custom_designs']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

// Add convenience types for product_notify_requests
export type ProductNotifyRequest = Database['public']['Tables']['product_notify_requests']['Row']
export type ProductNotifyRequestInsert = Database['public']['Tables']['product_notify_requests']['Insert']
export type ProductNotifyRequestUpdate = Database['public']['Tables']['product_notify_requests']['Update']
