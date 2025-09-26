import { NextResponse } from 'next/server'

export async function GET() {
  // Check if we're in a serverless environment
  const isServerless = typeof process.env.VERCEL !== 'undefined' || typeof process.env.NOW_REGION !== 'undefined'
  
  // Gather detailed environment information
  const debugInfo = {
    timestamp: new Date().toISOString(),
    platform: isServerless ? 'Vercel' : 'Other',
    environment: process.env.NODE_ENV || 'unknown',
    region: process.env.VERCEL_REGION || process.env.NOW_REGION || 'unknown',
    // Required environment variables
    requiredEnvVars: {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
        status: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
        value: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '***REDACTED***' : null
      },
      CLERK_SECRET_KEY: {
        status: process.env.CLERK_SECRET_KEY ? 'SET' : 'MISSING',
        value: process.env.CLERK_SECRET_KEY ? '***REDACTED***' : null
      },
      NEXT_PUBLIC_SUPABASE_URL: {
        status: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? '***REDACTED***' : null
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        status: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***REDACTED***' : null
      }
    },
    // Optional environment variables
    optionalEnvVars: {
      NEXT_PUBLIC_CLERK_DOMAIN: {
        status: process.env.NEXT_PUBLIC_CLERK_DOMAIN ? 'SET' : 'MISSING',
        value: process.env.NEXT_PUBLIC_CLERK_DOMAIN || null
      },
      NEXT_PUBLIC_APP_URL: {
        status: process.env.NEXT_PUBLIC_APP_URL ? 'SET' : 'MISSING',
        value: process.env.NEXT_PUBLIC_APP_URL || null
      },
      CLERK_WEBHOOK_SECRET: {
        status: process.env.CLERK_WEBHOOK_SECRET ? 'SET' : 'MISSING',
        value: process.env.CLERK_WEBHOOK_SECRET ? '***REDACTED***' : null
      }
    },
    // Process information
    processInfo: {
      versions: process.versions,
      platform: process.platform,
      arch: process.arch
    }
  }

  return NextResponse.json(debugInfo, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}