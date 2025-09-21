'use client'

import { ClerkProvider as ClerkReactProvider } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { dark } from '@clerk/themes'

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  
  // Check if we have the required environment variables
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const clerkDomain = process.env.NEXT_PUBLIC_CLERK_DOMAIN
  
  // Get the app URL for domain-specific configuration
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // If we don't have the publishable key, render children without Clerk
  if (!publishableKey) {
    console.warn('Missing Clerk publishable key - Clerk will not be available')
    return <>{children}</>
  }
  
  return (
    <ClerkReactProvider
      publishableKey={publishableKey}
      domain={clerkDomain || appUrl.replace('https://', '').replace('http://', '')}
      appearance={{
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
      }}
      localization={{
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
      }}
      // Add domain-specific configuration
      isSatellite={!!process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')}
    >
      {children}
    </ClerkReactProvider>
  )
}