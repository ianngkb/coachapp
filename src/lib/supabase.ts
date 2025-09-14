import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'coach-booking-marketplace'
    }
  }
})

// Server-side client with service role key for administrative operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types will be generated from Supabase CLI
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone_number: string | null
          user_type: 'student' | 'coach'
          profile_image_url: string | null
          location_state: 'Kuala Lumpur' | 'Selangor' | null
          location_city: string | null
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
          full_name: string
          phone_number?: string | null
          user_type: 'student' | 'coach'
          profile_image_url?: string | null
          location_state?: 'Kuala Lumpur' | 'Selangor' | null
          location_city?: string | null
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
          full_name?: string
          phone_number?: string | null
          user_type?: 'student' | 'coach'
          profile_image_url?: string | null
          location_state?: 'Kuala Lumpur' | 'Selangor' | null
          location_city?: string | null
          preferred_language?: 'en' | 'ms' | 'zh'
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
      }
      // Additional table types will be added as we create the schema
    }
  }
}