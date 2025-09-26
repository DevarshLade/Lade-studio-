import { NextResponse } from 'next/server'

export async function GET() {
  const debugInfo = {
    environment: process.env.NODE_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
    clerkDomain: process.env.NEXT_PUBLIC_CLERK_DOMAIN ? 'SET' : 'MISSING',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    timestamp: new Date().toISOString(),
    platform: 'Vercel',
  }

  return NextResponse.json(debugInfo)
}