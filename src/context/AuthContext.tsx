'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useAuth, useSignIn, useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { getCurrentUserSupabaseData, isSupabaseConfigured } from '@/lib/services/userService'

interface AuthContextType {
  user: any | null
  supabaseUser: any | null
  session: any | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ user: any | null; error: any | null }>
  signUp: (email: string, password: string, name?: string) => Promise<{ user: any | null; error: any | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any | null }>
  updatePassword: (password: string) => Promise<{ error: any | null }>
  isAuthenticated: boolean
  clearError: () => void
  refreshSupabaseUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Separate component to handle Clerk hooks - only rendered on client
function ClientAuthHandler({ 
  setUserData,
  setAuthData,
  setSignInData,
  setSignUpData,
  setIsLoaded
}: { 
  setUserData: (user: any) => void,
  setAuthData: (auth: any) => void,
  setSignInData: (signIn: any) => void,
  setSignUpData: (signUp: any) => void,
  setIsLoaded: (loaded: boolean) => void
}) {
  // These hooks will only be called on the client side
  const { user, isLoaded } = useUser()
  const auth = useAuth()
  const signIn = useSignIn()
  const signUp = useSignUp()
  
  useEffect(() => {
    setUserData(user)
    setAuthData(auth)
    setSignInData(signIn)
    setSignUpData(signUp)
    setIsLoaded(isLoaded)
  }, [user, auth, signIn, signUp, isLoaded])
  
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  // State for Clerk data
  const [clerkUser, setClerkUser] = useState<any>(null)
  const [clerkAuth, setClerkAuth] = useState<any>(null)
  const [clerkSignIn, setClerkSignIn] = useState<any>(null)
  const [clerkSignUp, setClerkSignUp] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // State to track if we're on the client side
  const [isClient, setIsClient] = useState(false)
  
  // Auth state
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // This effect only runs on the client side
    setIsClient(true)
  }, [])

  // Fetch Supabase user data when Clerk user is loaded
  useEffect(() => {
    const fetchSupabaseUser = async () => {
      // Only fetch on client side when Clerk is loaded
      if (isLoaded && clerkUser && isClient) {
        // If Supabase is not configured, skip fetching Supabase user data
        if (!isSupabaseConfigured()) {
          setSupabaseUser(null)
          setLoading(false)
          return
        }

        try {
          setLoading(true)
          const result = await getCurrentUserSupabaseData(clerkUser.id)
          if (result.success) {
            setSupabaseUser(result.data)
          } else {
            console.error('Failed to fetch Supabase user data:', result.error)
          }
        } catch (err) {
          console.error('Error fetching Supabase user data:', err)
        } finally {
          setLoading(false)
        }
      } else if (isLoaded && isClient) {
        // No Clerk user, so no Supabase user
        setSupabaseUser(null)
        setLoading(false)
      }
    }

    fetchSupabaseUser()
  }, [clerkUser, isLoaded, isClient])

  const clearError = () => {
    setError(null)
  }

  const refreshSupabaseUser = async () => {
    if (clerkUser && isSupabaseConfigured() && isClient) {
      try {
        const result = await getCurrentUserSupabaseData(clerkUser.id)
        if (result.success) {
          setSupabaseUser(result.data)
        }
      } catch (err) {
        console.error('Error refreshing Supabase user data:', err)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    // If not on client side or Clerk is not available, return an error
    if (!isClient || !clerkSignIn) {
      return { user: null, error: new Error('Authentication not available') }
    }

    try {
      setError(null)
      setLoading(true)
      
      const result = await clerkSignIn.create({
        identifier: email,
        password,
      })
      
      if (result.status === 'complete') {
        router.push('/') // Redirect to home page after successful sign in
        return { user: result.createdSessionId, error: null }
      } else {
        throw new Error('Sign in failed')
      }
    } catch (err: any) {
      console.error('Sign in error:', err)
      const errorMessage = err.errors?.[0]?.message || err.message || 'Sign in failed'
      setError(errorMessage)
      return { user: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    // If not on client side or Clerk is not available, return an error
    if (!isClient || !clerkSignUp) {
      return { user: null, error: new Error('Authentication not available') }
    }

    try {
      setError(null)
      setLoading(true)
      
      const result = await clerkSignUp.create({
        emailAddress: email,
        password,
        firstName: name?.split(' ')[0],
        lastName: name?.split(' ').slice(1).join(' '),
      })
      
      if (result.status === 'complete') {
        router.push('/') // Redirect to home page after successful sign up
        return { user: result.createdSessionId, error: null }
      } else {
        throw new Error('Sign up failed')
      }
    } catch (err: any) {
      console.error('Sign up error:', err)
      const errorMessage = err.errors?.[0]?.message || err.message || 'Sign up failed'
      setError(errorMessage)
      return { user: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    // If not on client side, return
    if (!isClient) {
      return
    }

    try {
      setError(null)
      setLoading(true)
      // Clerk handles sign out automatically with their components
      router.push('/') // Redirect to home page after sign out
    } catch (err: any) {
      console.error('Sign out error:', err)
      setError(err.message || 'Sign out failed')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    // If not on client side, return an error
    if (!isClient) {
      return { error: new Error('Authentication not available') }
    }

    try {
      setError(null)
      // Clerk handles password reset with their components
      return { error: null }
    } catch (err: any) {
      console.error('Password reset error:', err)
      const errorMessage = err.errors?.[0]?.message || err.message || 'Password reset failed'
      setError(errorMessage)
      return { error: err }
    }
  }

  const updatePassword = async (password: string) => {
    // If not on client side, return an error
    if (!isClient) {
      return { error: new Error('Authentication not available') }
    }

    try {
      setError(null)
      // Clerk handles password update with their components
      return { error: null }
    } catch (err: any) {
      console.error('Password update error:', err)
      const errorMessage = err.errors?.[0]?.message || err.message || 'Password update failed'
      setError(errorMessage)
      return { error: err }
    }
  }

  // Determine if we should use Clerk data (only on client after initialization)
  const shouldUseClerkData = isClient && isLoaded;
  
  const user = shouldUseClerkData ? clerkUser : null;
  const session = shouldUseClerkData ? clerkAuth?.sessionId : null;
  const isAuthenticated = shouldUseClerkData ? !!clerkUser : false;
  const isLoading = !isClient || !isLoaded || loading;

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser: supabaseUser || null,
        session,
        loading: isLoading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        isAuthenticated,
        clearError,
        refreshSupabaseUser,
      }}
    >
      {/* Only render the ClientAuthHandler on the client side after mounting */}
      {isClient && (
        <ClientAuthHandler 
          setUserData={setClerkUser}
          setAuthData={setClerkAuth}
          setSignInData={setClerkSignIn}
          setSignUpData={setClerkSignUp}
          setIsLoaded={setIsLoaded}
        />
      )}
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}