import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type Booking } from '@/lib/supabase'

// Query keys for bookings
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...bookingKeys.lists(), { filters }] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  byUser: (userId: string) => [...bookingKeys.all, 'user', userId] as const,
  byCoach: (coachId: string) => [...bookingKeys.all, 'coach', coachId] as const,
}

// Booking creation data
export interface CreateBookingData {
  coach_id: string
  service_id: number
  student_id: string
  court_id: number
  starts_at: string
  duration_minutes: number
  notes?: string
}

// Create booking mutation
async function createBooking(data: CreateBookingData): Promise<Booking> {
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert([{
      ...data,
      status: 'confirmed',
      total_amount: 0, // Will be calculated based on service price
    }])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`)
  }

  return booking
}

// Hook to create a booking
export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBooking,
    onSuccess: (newBooking) => {
      // Invalidate and refetch booking queries
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: bookingKeys.byUser(newBooking.student_id) })
      queryClient.invalidateQueries({ queryKey: bookingKeys.byCoach(newBooking.coach_id) })
    },
    onError: (error) => {
      console.error('Error creating booking:', error)
    },
  })
}

// Hook to get user's bookings
export function useUserBookings(userId: string) {
  return useQuery({
    queryKey: bookingKeys.byUser(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          coach_services (
            name,
            price_per_hour,
            sports (name)
          ),
          courts (name, address),
          coach_profiles!bookings_coach_id_fkey (
            users (first_name, last_name)
          )
        `)
        .eq('student_id', userId)
        .order('starts_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook to get coach's bookings
export function useCoachBookings(coachId: string) {
  return useQuery({
    queryKey: bookingKeys.byCoach(coachId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          coach_services (
            name,
            price_per_hour,
            sports (name)
          ),
          courts (name, address),
          users!bookings_student_id_fkey (first_name, last_name)
        `)
        .eq('coach_id', coachId)
        .order('starts_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!coachId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}