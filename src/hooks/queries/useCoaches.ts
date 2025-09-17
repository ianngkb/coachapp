import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, type CoachProfile, type CoachService, type Review, type Court, type User, type Sport } from '@/lib/supabase'

// Types for the combined coach data
export interface CoachData {
  profile: CoachProfile & { users: User }
  services: (CoachService & { sports: Sport })[]
  reviews: (Review & { users: User })[]
  courts: Court[]
  ratingStats: {
    total_reviews: number
    average_rating: number
    rating_distribution: { [key: string]: number }
  }
}

// Query keys for consistency
export const coachKeys = {
  all: ['coaches'] as const,
  lists: () => [...coachKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...coachKeys.lists(), { filters }] as const,
  details: () => [...coachKeys.all, 'detail'] as const,
  detail: (id: string) => [...coachKeys.details(), id] as const,
  services: (coachId: string) => [...coachKeys.detail(coachId), 'services'] as const,
  reviews: (coachId: string) => [...coachKeys.detail(coachId), 'reviews'] as const,
  ratingStats: (coachId: string) => [...coachKeys.detail(coachId), 'rating-stats'] as const,
}

// Fetch coach profile by email (current implementation compatibility)
async function fetchCoachProfile(coachEmail: string): Promise<CoachData> {
  try {
    // Step 1: Get user by email
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', coachEmail)
      .eq('user_type', 'coach')
      .single()

    if (userError || !users) {
      throw new Error(`Coach not found: ${coachEmail}`)
    }

    // Step 2: Get coach profile
    const { data: profile, error: profileError } = await supabase
      .from('coach_profiles')
      .select('*')
      .eq('user_id', users.id)
      .single()

    if (profileError || !profile) {
      throw new Error(`Coach profile not found for user: ${users.id}`)
    }

    // Step 3: Get coach services with sports
    const { data: services, error: servicesError } = await supabase
      .from('coach_services')
      .select(`
        *,
        sports (*)
      `)
      .eq('coach_id', users.id)
      .eq('is_active', true)

    if (servicesError) {
      throw new Error(`Failed to fetch services: ${servicesError.message}`)
    }

    // Step 4: Get reviews with user names
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        users (id, first_name, last_name)
      `)
      .eq('coach_id', users.id)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      throw new Error(`Failed to fetch reviews: ${reviewsError.message}`)
    }

    // Step 5: Get courts
    const { data: courts, error: courtsError } = await supabase
      .from('courts')
      .select('*')
      .eq('is_active', true)

    if (courtsError) {
      throw new Error(`Failed to fetch courts: ${courtsError.message}`)
    }

    // Step 6: Get rating statistics
    const { data: ratingStats, error: ratingError } = await supabase
      .rpc('get_coach_rating_stats', { coach_id_param: users.id })

    const stats = ratingStats || {
      total_reviews: 0,
      average_rating: 0,
      rating_distribution: {}
    }

    return {
      profile: { ...profile, users },
      services: services || [],
      reviews: reviews || [],
      courts: courts || [],
      ratingStats: stats
    }
  } catch (error) {
    console.error('Error fetching coach profile:', error)
    throw error
  }
}

// Hook to get coach profile data
export function useCoachProfile(coachEmail: string) {
  return useQuery({
    queryKey: coachKeys.detail(coachEmail),
    queryFn: () => fetchCoachProfile(coachEmail),
    enabled: !!coachEmail,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to get all courts
export function useCourts() {
  return useQuery({
    queryKey: ['courts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - courts don't change often
  })
}

// Hook to get all sports
export function useSports() {
  return useQuery({
    queryKey: ['sports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data
    },
    staleTime: 60 * 60 * 1000, // 1 hour - sports rarely change
  })
}