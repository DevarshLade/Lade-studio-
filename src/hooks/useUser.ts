// Custom hook to access both Clerk and Supabase user data
import { useAuthContext } from '@/context/AuthContext';

export function useUser() {
  const context = useAuthContext();
  
  return {
    // Clerk user data
    clerkUser: context.user,
    // Supabase user data
    supabaseUser: context.supabaseUser,
    // Combined user data (Supabase data with Clerk fallback)
    user: context.supabaseUser || context.user,
    // Authentication state
    isAuthenticated: context.isAuthenticated,
    // Session information
    session: context.session,
    // Loading state
    loading: context.loading,
    // Error state
    error: context.error,
    // Refresh Supabase user data
    refreshUser: context.refreshSupabaseUser,
    // Clear errors
    clearError: context.clearError,
  };
}