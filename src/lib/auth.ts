import { supabase } from './supabase'
import { User } from './supabase'

export type AuthUser = {
  id: string
  email: string
  user_type?: 'student' | 'coach'
  first_name?: string
  last_name?: string
}

// Password Authentication
export const signInWithPassword = async (email: string, password: string) => {
  try {
    console.log('🔑 Signing in with password:', { email });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('✅ Sign in result:', { data, error });

    if (error) {
      console.error('❌ Supabase auth error:', error);
      throw error;
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('❌ Sign in error:', error)
    return {
      success: false,
      error: error.message || 'Invalid email or password. Please try again.'
    }
  }
}

export const signUpWithPassword = async (email: string, password: string, userRole: 'student' | 'coach') => {
  try {
    console.log('🔑 Signing up with Supabase Auth:', { email, userRole });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userRole,
          first_name: email.split('@')[0], // Use email prefix as default name
          last_name: ''
        },
      },
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("Sign up completed but no user data returned.");
    }
    
    // The user profile will be created by a trigger in Supabase.
    // If not, we might need to create it manually here.
    // For now, we assume the trigger exists.

    console.log('✅ Sign up successful:', data);

    return {
      success: true,
      data: { session: data.session, user: data.user, needsEmailVerification: true }
    };

  } catch (error: any) {
    console.error('❌ Sign up error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create account. Please try again.'
    }
  }
}

// Get current user session
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get additional user data from our users table
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user data:', error)
    }

    return {
      id: user.id,
      email: user.email!,
      user_type: userData?.user_type,
      first_name: userData?.first_name,
      last_name: userData?.last_name
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Sign out error:', error)
    return { success: false, error: error.message }
  }
}

// Note: User profile creation is now handled in the API endpoints

// Demo login functions for testing
export const demoSignIn = async (userType: 'coach' | 'student') => {
  try {
    const testEmails = {
      coach: 'john.coach@example.com',
      student: 'mike.student@example.com'
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmails[userType],
      password: 'password123'
    })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Demo sign in error:', error)
    return { success: false, error: error.message }
  }
}

export const createOrUpdateUserProfile = async (
  userId: string,
  profileData: {
    email?: string
    first_name: string
    last_name: string
    user_type: 'student' | 'coach'
    phone_number?: string
    city_id?: string
  }
) => {
  try {
    console.log('🔄 Creating/updating user profile:', { userId, profileData })

    // Update the user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: profileData.email || '',
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        user_type: profileData.user_type,
        phone_number: profileData.phone_number || null,
        city_id: profileData.city_id || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ User update error:', userError)
      throw userError
    }

    // If coach, create coach profile
    if (profileData.user_type === 'coach') {
      const { data: coachData, error: coachError } = await supabase
        .from('coach_profiles')
        .upsert({
          user_id: userId,
          bio: 'Welcome to my coaching profile!',
          years_experience: 0,
          certifications: [],
          specializations: [],
          rating_average: 0,
          rating_count: 0,
          total_sessions_completed: 0,
          is_featured: false,
          is_available: true,
          listing_status: 'active',
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (coachError) {
        console.error('❌ Coach profile error:', coachError)
        throw coachError
      }

      return { success: true, data: { user: userData, coach: coachData } }
    }

    return { success: true, data: { user: userData } }
  } catch (error: any) {
    console.error('❌ Profile creation error:', error)
    return { success: false, error: error.message }
  }
}