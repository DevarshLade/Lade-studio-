'use client'

import { ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Lock } from 'lucide-react'
import { SignInButton } from '@clerk/nextjs'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
  title?: string
  description?: string
}

export function ProtectedRoute({ 
  children, 
  fallback,
  requireAuth = true,
  title = "Authentication Required",
  description = "Please sign in to access this page."
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useUser()

  // Show loading state while auth is being determined
  if (!isLoaded) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If auth is required and user is not authenticated
  if (requireAuth && !isSignedIn) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <SignInButton mode="modal">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                Sign In
              </button>
            </SignInButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User is authenticated or auth is not required
  return <>{children}</>
}

// Higher-order component version
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}