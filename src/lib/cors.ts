import { NextRequest, NextFetchEvent } from 'next/server'

// CORS headers configuration
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
}

// Handle CORS preflight requests
export function handleCorsPreflight(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }
  return null
}

// Add CORS headers to response
export function withCorsHeaders(response: Response) {
  const headers = new Headers(response.headers)
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value)
  })
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  })
}