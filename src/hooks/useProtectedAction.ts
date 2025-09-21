'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'

export function useProtectedAction() {
  const { isSignedIn } = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const executeProtectedAction = (action: () => void, requireAuth: boolean = true) => {
    if (requireAuth && !isSignedIn) {
      setShowAuthModal(true)
      return false
    }
    
    action()
    return true
  }

  return {
    executeProtectedAction,
    showAuthModal,
    setShowAuthModal,
    isAuthenticated: !!isSignedIn
  }
}