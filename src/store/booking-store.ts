import { create } from 'zustand'
import { type CoachService, type Court } from '@/lib/supabase'

interface BookingFlowState {
  // Selected booking details
  selectedCoachId: string | null
  selectedService: CoachService | null
  selectedDate: Date | null
  selectedTime: string | null
  selectedCourt: Court | null
  notes: string

  // Multi-step flow state
  currentStep: 'service' | 'datetime' | 'location' | 'confirm'
  isFlowActive: boolean

  // Form data
  formData: {
    duration: number // in minutes
    specialRequests: string
    paymentMethod: 'card' | 'ewallet' | null
  }

  // Availability data cache (temporary storage)
  availableTimeSlots: string[]
  availableDates: Date[]

  // Error states
  bookingError: string | null
  validationErrors: Record<string, string>

  // Actions
  startBookingFlow: (coachId: string) => void
  setSelectedService: (service: CoachService) => void
  setSelectedDate: (date: Date) => void
  setSelectedTime: (time: string) => void
  setSelectedCourt: (court: Court) => void
  setNotes: (notes: string) => void
  setCurrentStep: (step: BookingFlowState['currentStep']) => void
  setFormData: (data: Partial<BookingFlowState['formData']>) => void
  setAvailableTimeSlots: (slots: string[]) => void
  setAvailableDates: (dates: Date[]) => void
  setBookingError: (error: string | null) => void
  setValidationErrors: (errors: Record<string, string>) => void
  clearBookingFlow: () => void
  canProceedToNextStep: () => boolean
  getBookingData: () => {
    coach_id: string
    service_id: number
    starts_at: string
    duration_minutes: number
    court_id: number
    notes: string
  } | null
}

export const useBookingStore = create<BookingFlowState>((set, get) => ({
  // Initial state
  selectedCoachId: null,
  selectedService: null,
  selectedDate: null,
  selectedTime: null,
  selectedCourt: null,
  notes: '',
  currentStep: 'service',
  isFlowActive: false,
  formData: {
    duration: 60, // Default 1 hour
    specialRequests: '',
    paymentMethod: null,
  },
  availableTimeSlots: [],
  availableDates: [],
  bookingError: null,
  validationErrors: {},

  // Actions
  startBookingFlow: (coachId: string) => {
    set({
      selectedCoachId: coachId,
      isFlowActive: true,
      currentStep: 'service',
      // Reset previous selections
      selectedService: null,
      selectedDate: null,
      selectedTime: null,
      selectedCourt: null,
      notes: '',
      bookingError: null,
      validationErrors: {},
    })
  },

  setSelectedService: (service: CoachService) => {
    set({
      selectedService: service,
      // Reset dependent selections
      selectedDate: null,
      selectedTime: null,
      formData: {
        ...get().formData,
        duration: service.default_duration_minutes || 60,
      }
    })
  },

  setSelectedDate: (date: Date) => {
    set({
      selectedDate: date,
      selectedTime: null, // Reset time when date changes
    })
  },

  setSelectedTime: (time: string) => {
    set({ selectedTime: time })
  },

  setSelectedCourt: (court: Court) => {
    set({ selectedCourt: court })
  },

  setNotes: (notes: string) => {
    set({ notes })
  },

  setCurrentStep: (step: BookingFlowState['currentStep']) => {
    set({ currentStep: step })
  },

  setFormData: (data: Partial<BookingFlowState['formData']>) => {
    set((state) => ({
      formData: { ...state.formData, ...data }
    }))
  },

  setAvailableTimeSlots: (slots: string[]) => {
    set({ availableTimeSlots: slots })
  },

  setAvailableDates: (dates: Date[]) => {
    set({ availableDates: dates })
  },

  setBookingError: (error: string | null) => {
    set({ bookingError: error })
  },

  setValidationErrors: (errors: Record<string, string>) => {
    set({ validationErrors: errors })
  },

  clearBookingFlow: () => {
    set({
      selectedCoachId: null,
      selectedService: null,
      selectedDate: null,
      selectedTime: null,
      selectedCourt: null,
      notes: '',
      currentStep: 'service',
      isFlowActive: false,
      formData: {
        duration: 60,
        specialRequests: '',
        paymentMethod: null,
      },
      availableTimeSlots: [],
      availableDates: [],
      bookingError: null,
      validationErrors: {},
    })
  },

  canProceedToNextStep: () => {
    const state = get()

    switch (state.currentStep) {
      case 'service':
        return !!state.selectedService
      case 'datetime':
        return !!state.selectedDate && !!state.selectedTime
      case 'location':
        return !!state.selectedCourt
      case 'confirm':
        return true // Can always proceed from confirm (to booking)
      default:
        return false
    }
  },

  getBookingData: () => {
    const state = get()

    if (
      !state.selectedCoachId ||
      !state.selectedService ||
      !state.selectedDate ||
      !state.selectedTime ||
      !state.selectedCourt
    ) {
      return null
    }

    // Combine date and time into ISO string
    const [hours, minutes] = state.selectedTime.split(':').map(Number)
    const startDateTime = new Date(state.selectedDate)
    startDateTime.setHours(hours, minutes, 0, 0)

    return {
      coach_id: state.selectedCoachId,
      service_id: state.selectedService.id,
      starts_at: startDateTime.toISOString(),
      duration_minutes: state.formData.duration,
      court_id: state.selectedCourt.id,
      notes: state.notes || '',
    }
  },
}))