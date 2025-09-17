import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)

// Server-side client with service role key for administrative operations
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

// Updated Database Types - Current Schema (Post-Migration)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone_number: string | null
          user_type: 'student' | 'coach'
          profile_image_url: string | null
          city_id: string | null
          preferred_language: 'en' | 'ms' | 'zh'
          is_active: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone_number?: string | null
          user_type: 'student' | 'coach'
          profile_image_url?: string | null
          city_id?: string | null
          preferred_language?: 'en' | 'ms' | 'zh'
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone_number?: string | null
          user_type?: 'student' | 'coach'
          profile_image_url?: string | null
          city_id?: string | null
          preferred_language?: 'en' | 'ms' | 'zh'
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
      }
      coach_profiles: {
        Row: {
          user_id: string
          business_name: string | null
          bio: string
          tagline: string | null
          short_bio: string | null
          years_experience: number
          certifications: string[]
          specializations: string[]
          rating_average: number
          rating_count: number
          total_sessions_completed: number
          base_hourly_rate: number | null
          is_featured: boolean
          is_available: boolean
          listing_status: 'active' | 'inactive' | 'suspended'
          google_calendar_connected: boolean
          google_calendar_sync_token: string | null
          whatsapp_number: string | null
          instagram_handle: string | null
          website_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          business_name?: string | null
          bio: string
          tagline?: string | null
          short_bio?: string | null
          years_experience?: number
          certifications?: string[]
          specializations?: string[]
          rating_average?: number
          rating_count?: number
          total_sessions_completed?: number
          base_hourly_rate?: number | null
          is_featured?: boolean
          is_available?: boolean
          listing_status?: 'active' | 'inactive' | 'suspended'
          google_calendar_connected?: boolean
          google_calendar_sync_token?: string | null
          whatsapp_number?: string | null
          instagram_handle?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          business_name?: string | null
          bio?: string
          tagline?: string | null
          short_bio?: string | null
          years_experience?: number
          certifications?: string[]
          specializations?: string[]
          rating_average?: number
          rating_count?: number
          total_sessions_completed?: number
          base_hourly_rate?: number | null
          is_featured?: boolean
          is_available?: boolean
          listing_status?: 'active' | 'inactive' | 'suspended'
          google_calendar_connected?: boolean
          google_calendar_sync_token?: string | null
          whatsapp_number?: string | null
          instagram_handle?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sports: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          category: string | null
          equipment_required: string[]
          typical_duration_minutes: number | null
          min_participants: number
          max_participants: number
          is_popular: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          category?: string | null
          equipment_required?: string[]
          typical_duration_minutes?: number | null
          min_participants?: number
          max_participants?: number
          is_popular?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          category?: string | null
          equipment_required?: string[]
          typical_duration_minutes?: number | null
          min_participants?: number
          max_participants?: number
          is_popular?: boolean
          display_order?: number
          created_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          name: string
          state: string
          country: string
          is_popular: boolean
          display_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          state: string
          country?: string
          is_popular?: boolean
          display_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          state?: string
          country?: string
          is_popular?: boolean
          display_order?: number | null
          created_at?: string
        }
      }
      courts: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string
          city_id: string
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          phone_number: string | null
          website_url: string | null
          supported_sports: string[]
          amenities: string[]
          operating_hours: any
          pricing_info: any
          is_featured: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address: string
          city_id: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          phone_number?: string | null
          website_url?: string | null
          supported_sports?: string[]
          amenities?: string[]
          operating_hours?: any
          pricing_info?: any
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string
          city_id?: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          phone_number?: string | null
          website_url?: string | null
          supported_sports?: string[]
          amenities?: string[]
          operating_hours?: any
          pricing_info?: any
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
        }
      }
      coach_services: {
        Row: {
          id: string
          coach_id: string
          sport_id: string
          service_name: string
          description: string
          duration_minutes: number
          price_myr: number
          max_participants: number
          skill_levels: string[]
          included_equipment: string[]
          location_types: string[]
          buffer_time_before: number
          buffer_time_after: number
          min_advance_booking_hours: number
          max_advance_booking_days: number
          cancellation_policy: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          coach_id: string
          sport_id: string
          service_name: string
          description: string
          duration_minutes: number
          price_myr: number
          max_participants?: number
          skill_levels?: string[]
          included_equipment?: string[]
          location_types?: string[]
          buffer_time_before?: number
          buffer_time_after?: number
          min_advance_booking_hours?: number
          max_advance_booking_days?: number
          cancellation_policy?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          coach_id?: string
          sport_id?: string
          service_name?: string
          description?: string
          duration_minutes?: number
          price_myr?: number
          max_participants?: number
          skill_levels?: string[]
          included_equipment?: string[]
          location_types?: string[]
          buffer_time_before?: number
          buffer_time_after?: number
          min_advance_booking_hours?: number
          max_advance_booking_days?: number
          cancellation_policy?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          student_id: string
          coach_id: string
          service_id: string
          court_id: string
          session_date: string
          start_time: string
          end_time: string
          duration_minutes: number
          service_price_myr: number
          travel_fee_myr: number
          total_price_myr: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          booking_reference: string
          student_phone: string | null
          student_notes: string | null
          coach_notes: string | null
          admin_notes: string | null
          booked_at: string
          confirmed_at: string | null
          completed_at: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          coach_id: string
          service_id: string
          court_id: string
          session_date: string
          start_time: string
          end_time: string
          duration_minutes: number
          service_price_myr: number
          travel_fee_myr?: number
          total_price_myr: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          booking_reference?: string
          student_phone?: string | null
          student_notes?: string | null
          coach_notes?: string | null
          admin_notes?: string | null
          booked_at?: string
          confirmed_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          coach_id?: string
          service_id?: string
          court_id?: string
          session_date?: string
          start_time?: string
          end_time?: string
          duration_minutes?: number
          service_price_myr?: number
          travel_fee_myr?: number
          total_price_myr?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          booking_reference?: string
          student_phone?: string | null
          student_notes?: string | null
          coach_notes?: string | null
          admin_notes?: string | null
          booked_at?: string
          confirmed_at?: string | null
          completed_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          student_id: string
          coach_id: string
          rating: number
          review_text: string | null
          is_anonymous: boolean
          is_public: boolean
          coach_response: string | null
          coach_response_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          student_id: string
          coach_id: string
          rating: number
          review_text?: string | null
          is_anonymous?: boolean
          is_public?: boolean
          coach_response?: string | null
          coach_response_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          student_id?: string
          coach_id?: string
          rating?: number
          review_text?: string | null
          is_anonymous?: boolean
          is_public?: boolean
          coach_response?: string | null
          coach_response_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      languages: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
      }
      coach_sports: {
        Row: {
          coach_id: string
          sport_id: string
        }
        Insert: {
          coach_id: string
          sport_id: string
        }
        Update: {
          coach_id?: string
          sport_id?: string
        }
      }
      coach_preferred_courts: {
        Row: {
          coach_id: string
          court_id: string
        }
        Insert: {
          coach_id: string
          court_id: string
        }
        Update: {
          coach_id?: string
          court_id?: string
        }
      }
      coach_languages: {
        Row: {
          coach_id: string
          language_code: string
        }
        Insert: {
          coach_id: string
          language_code: string
        }
        Update: {
          coach_id?: string
          language_code?: string
        }
      }
    }
    Views: {
      coach_directory: {
        Row: {
          user_id: string
          first_name: string
          last_name: string
          profile_image_url: string | null
          location_city: string | null
          location_state: string | null
          tagline: string | null
          short_bio: string | null
          years_experience: number
          rating_average: number
          rating_count: number
          total_sessions_completed: number
          base_hourly_rate: number | null
          is_available: boolean
          listing_status: string
          sports: any | null
          languages: any | null
        }
      }
      student_profiles: {
        Row: {
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone_number: string | null
          profile_image_url: string | null
          location_city: string | null
          location_state: string | null
          preferred_language: string
          created_at: string
          updated_at: string
        }
      }
      booking_summary: {
        Row: {
          id: string
          booking_reference: string
          session_date: string
          start_time: string
          end_time: string
          status: string
          total_price_myr: number
          student_name: string
          student_phone: string | null
          coach_name: string
          coach_business: string | null
          service_name: string
          sport_name: string
          court_name: string
          court_address: string
          created_at: string
          updated_at: string
        }
      }
    }
    Functions: {
      validate_booking_slot: {
        Args: {
          p_coach_id: string
          p_session_date: string
          p_start_time: string
          p_end_time: string
          p_exclude_booking_id?: string
        }
        Returns: boolean
      }
      get_available_slots: {
        Args: {
          p_coach_id: string
          p_service_id: string
          p_date: string
        }
        Returns: {
          start_time: string
          end_time: string
          is_available: boolean
        }[]
      }
      get_coach_rating_stats: {
        Args: {
          p_coach_id: string
        }
        Returns: {
          total_reviews: number
          average_rating: number
          rating_distribution: any
        }[]
      }
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type Functions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]

// Specific table types for easier use
export type User = Tables<'users'>
export type CoachProfile = Tables<'coach_profiles'>
export type CoachService = Tables<'coach_services'>
export type Booking = Tables<'bookings'>
export type Review = Tables<'reviews'>
export type Sport = Tables<'sports'>
export type Court = Tables<'courts'>
export type City = Tables<'cities'>