import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, type AuthUser } from '@/lib/auth'

interface AuthState {
  // State
  user: AuthUser | null
  isLoading: boolean
  isInitialized: boolean

  // Computed properties
  isAuthenticated: boolean
  isCoach: boolean
  isStudent: boolean

  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: true,
      isInitialized: false,

      // Computed properties
      get isAuthenticated() {
        return !!get().user
      },
      get isCoach() {
        return get().user?.user_type === 'coach'
      },
      get isStudent() {
        return get().user?.user_type === 'student'
      },

      // Actions
      initialize: async () => {
        try {
          set({ isLoading: true })

          // Get current user from Supabase
          const currentUser = await getCurrentUser()

          set({
            user: currentUser,
            isLoading: false,
            isInitialized: true
          })

          // Set up auth state listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                const user = await getCurrentUser()
                set({ user, isLoading: false })
              } else if (event === 'SIGNED_OUT') {
                set({ user: null, isLoading: false })
              }
            }
          )

          // Store subscription for cleanup (if needed)
          return () => subscription.unsubscribe()
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({ user: null, isLoading: false, isInitialized: true })
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true })

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ isLoading: false })
            return { success: false, error: error.message }
          }

          // Get the full user profile
          const currentUser = await getCurrentUser()
          set({ user: currentUser, isLoading: false })

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Sign in failed'
          }
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true })

          await supabase.auth.signOut()

          set({
            user: null,
            isLoading: false
          })
        } catch (error) {
          console.error('Sign out error:', error)
          set({ isLoading: false })
        }
      },

      setUser: (user: AuthUser | null) => {
        set({ user })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist user data, not loading states
        user: state.user,
        isInitialized: state.isInitialized,
      }),
    }
  )
)