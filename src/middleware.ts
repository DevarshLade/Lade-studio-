import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define which routes are public (don't require authentication)
const isPublicRoute = createRouteMatcher([
  '/',
  '/products(.*)',
  '/product(.*)',
  '/about(.*)',
  '/blog(.*)',
  '/api(.*)',
])

// Define which routes should be ignored by the middleware
const isIgnoredRoute = createRouteMatcher([
  '/api/webhooks(.*)',
])

export default clerkMiddleware((auth, req) => {
  // Skip middleware for ignored routes
  if (isIgnoredRoute(req)) return
  
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    auth.protect()
  }
})

// Always export the config, Next.js will handle missing environment variables
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}