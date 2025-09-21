import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasClerkPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
    clerkSecretKey: process.env.CLERK_SECRET_KEY ? 'SET' : 'MISSING',
  }

  return NextResponse.json(envVars)
}