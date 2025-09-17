import { create } from 'zustand'

interface UIState {
  // Navigation state
  currentPage: string
  previousPage: string | null

  // Modal/Dialog states
  isBookingModalOpen: boolean
  isProfileModalOpen: boolean
  isMobileMenuOpen: boolean

  // Filter states (for coach directory)
  filters: {
    sport: string | null
    location: string | null
    priceRange: [number, number] | null
    rating: number | null
    availability: 'today' | 'tomorrow' | 'this-week' | 'any' | null
  }

  // Search state
  searchQuery: string

  // Theme and preferences
  theme: 'light' | 'dark' | 'system'

  // Loading states for UI components
  isNavigating: boolean

  // Actions
  setCurrentPage: (page: string) => void
  openBookingModal: () => void
  closeBookingModal: () => void
  openProfileModal: () => void
  closeProfileModal: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  setFilters: (filters: Partial<UIState['filters']>) => void
  clearFilters: () => void
  setSearchQuery: (query: string) => void
  setTheme: (theme: UIState['theme']) => void
  setNavigating: (isNavigating: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  currentPage: '/',
  previousPage: null,
  isBookingModalOpen: false,
  isProfileModalOpen: false,
  isMobileMenuOpen: false,
  filters: {
    sport: null,
    location: null,
    priceRange: null,
    rating: null,
    availability: null,
  },
  searchQuery: '',
  theme: 'system',
  isNavigating: false,

  // Actions
  setCurrentPage: (page: string) => {
    const currentPage = get().currentPage
    set({
      previousPage: currentPage,
      currentPage: page,
    })
  },

  openBookingModal: () => set({ isBookingModalOpen: true }),
  closeBookingModal: () => set({ isBookingModalOpen: false }),

  openProfileModal: () => set({ isProfileModalOpen: true }),
  closeProfileModal: () => set({ isProfileModalOpen: false }),

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  setFilters: (newFilters: Partial<UIState['filters']>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }))
  },

  clearFilters: () => {
    set({
      filters: {
        sport: null,
        location: null,
        priceRange: null,
        rating: null,
        availability: null,
      }
    })
  },

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  setTheme: (theme: UIState['theme']) => set({ theme }),

  setNavigating: (isNavigating: boolean) => set({ isNavigating }),
}))