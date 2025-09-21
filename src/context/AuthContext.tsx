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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Check if Clerk is available
  const hasClerk = typeof window !== 'undefined' && 
    typeof useUser === 'function' && 
    typeof useAuth === 'function'
  
  const { user: clerkUser, isLoaded } = hasClerk ? useUser() : { user: null, isLoaded: true }
  const { sessionId } = hasClerk ? useAuth() : { sessionId: null }
  const { signIn: clerkSignIn } = hasClerk ? useSignIn() : { signIn: null }
  const { signUp: clerkSignUp } = hasClerk ? useSignUp() : { signUp: null }
  const router = useRouter()
  
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch Supabase user data when Clerk user is loaded
  useEffect(() => {
    const fetchSupabaseUser = async () => {
      if (isLoaded && clerkUser) {
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
      } else if (isLoaded) {
        // No Clerk user, so no Supabase user
        setSupabaseUser(null)
        setLoading(false)
      }
    }

    fetchSupabaseUser()
  }, [clerkUser, isLoaded])

  const clearError = () => {
    setError(null)
  }

  const refreshSupabaseUser = async () => {
    if (clerkUser && isSupabaseConfigured()) {
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
    // If Clerk is not available, return an error
    if (!hasClerk || !clerkSignIn) {
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
    // If Clerk is not available, return an error
    if (!hasClerk || !clerkSignUp) {
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
    // If Clerk is not available, return
    if (!hasClerk) {
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
    // If Clerk is not available, return an error
    if (!hasClerk) {
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
    // If Clerk is not available, return an error
    if (!hasClerk) {
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

  return (
    <AuthContext.Provider
      value={{
        user: clerkUser || null,
        supabaseUser: supabaseUser || null,
        session: sessionId || null,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        isAuthenticated: !!clerkUser,
        clearError,
        refreshSupabaseUser,
      }}
    >
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