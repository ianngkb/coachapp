import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'

export const useAuth = () => {
  const {
    user,
    isLoading,
    isInitialized,
    isAuthenticated,
    isCoach,
    isStudent,
    initialize,
    signIn,
    signOut,
  } = useAuthStore()

  // Initialize auth store on first render
  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  return {
    user,
    isLoading,
    isAuthenticated,
    isCoach,
    isStudent,
    signIn,
    signOut,
  }
}