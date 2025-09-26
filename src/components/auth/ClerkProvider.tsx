'use client'

import { ClerkProvider as ClerkReactProvider } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { dark } from '@clerk/themes'
import { useEffect, useState } from 'react'

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [isClient, setIsClient] = useState(false)
  const [clerkError, setClerkError] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Check if we have the required environment variables
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const clerkDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN
  
  // If we don't have the publishable key, render children without Clerk
  if (!publishableKey) {
    console.warn('Missing Clerk publishable key - Clerk will not be available')
    return <>{children}</>
  }
  
  // Don't render Clerk on server-side to prevent hydration mismatches
  if (!isClient) {
    return <>{children}</>
  }
  
  // If there was an error initializing Clerk, render children without Clerk
  if (clerkError) {
    console.warn('Clerk failed to initialize - rendering without Clerk')
    return <>{children}</>
  }
  
  // Try to render Clerk, but catch any errors
  try {
    const clerkProps: any = {
      publishableKey,
      appearance: {
        baseTheme: theme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: '#3b82f6', // Your primary color
        },
        elements: {
          formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
          socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-100',
          socialButtonsBlockButtonText: 'font-medium',
          formFieldInput: 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
        },
      },
      localization: {
        socialButtonsBlockButton: 'Continue with {{provider|titleize}}',
        signUp: {
          start: {
            title: 'Create your account',
            subtitle: 'to continue to Lade Studio',
          },
        },
        signIn: {
          start: {
            title: 'Sign in to your account',
            subtitle: 'to continue to Lade Studio',
          },
        },
      }
    }
    
    // Add domain configuration if available
    if (clerkDomain) {
      clerkProps.domain = clerkDomain
      // Determine if this is a satellite application
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      clerkProps.isSatellite = !!clerkDomain && !isLocalhost
    }
    
    return (
      <ClerkReactProvider {...clerkProps}>
        {children}
      </ClerkReactProvider>
    )
  } catch (error) {
    console.error('ClerkProvider error:', error)
    setClerkError(true)
    return <>{children}</>
  }
}