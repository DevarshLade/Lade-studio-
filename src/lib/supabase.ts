import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Use environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if we have the required environment variables
const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey)

if (!hasSupabaseConfig) {
  console.warn('Missing Supabase environment variables - Supabase client will not be available')
}

// Get the app URL for CORS configuration
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Client for browser/client-side operations
export const supabase = hasSupabaseConfig 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'X-Client-Info': 'lade-studio-web'
        }
      },
      db: {
        schema: 'public'
      }
    })
  : null

// Server-side client with service role key (for admin operations)
export const supabaseAdmin = hasSupabaseConfig && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            'X-Client-Info': 'lade-studio-admin'
          }
        },
        db: {
          schema: 'public'
        }
      }
    )
  : null

// Type guard functions
export function isSupabaseConfigured(): boolean {
  return hasSupabaseConfig
}

export function hasSupabaseAdmin(): boolean {
  return supabaseAdmin !== null
}