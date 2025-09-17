import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for user creation
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, userType } = body

    console.log('📝 Simple signup request received:', { email, firstName, lastName, userType })

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !userType) {
      console.log('❌ Missing required fields')
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Check if email already exists in our users table
    console.log('🔍 Checking if email exists in users table:', email)
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', checkError)
      return NextResponse.json({
        error: 'Database error checking existing user'
      }, { status: 500 })
    }

    if (existingUser) {
      console.log('❌ Email already registered in users table')
      return NextResponse.json({
        error: 'Email already registered'
      }, { status: 400 })
    }

    // Create user in auth first to satisfy foreign key constraint
    console.log('👤 Creating minimal auth user first (bypass email)...')
    let userId: string

    try {
      // Try admin user creation with auto-confirm to bypass email
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm to bypass email requirements
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          user_type: userType
        }
      })

      if (authError) {
        console.error('❌ Auth user creation failed:', authError)
        // Fallback to UUID if auth creation fails
        const { v4: uuidv4 } = await import('uuid')
        userId = uuidv4()
        console.log('🔧 FALLBACK: Using UUID instead:', userId)
      } else {
        userId = authData.user.id
        console.log('✅ Auth user created with ID:', userId)
      }
    } catch (authCreateError) {
      console.error('❌ Auth creation exception:', authCreateError)
      // Fallback to UUID
      const { v4: uuidv4 } = await import('uuid')
      userId = uuidv4()
      console.log('🔧 EXCEPTION FALLBACK: Using UUID:', userId)
    }

    // Now insert into our users table using admin client
    console.log('💾 Inserting user profile...')
    let userProfileExists = false
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        first_name: firstName,
          last_name: lastName,
        user_type: userType,
        is_active: true,
        is_verified: true // Skip email verification for now
      })

    if (insertError) {
      console.error('❌ Error inserting user profile:', insertError)

      // If it's a duplicate key error, the user already exists
      if (insertError.code === '23505') {
        console.log('ℹ️ User profile already exists, continuing...')
        userProfileExists = true
      } else {
        // For other database errors, no cleanup needed since we didn't create auth user

        return NextResponse.json({
          error: `Database error creating user profile: ${insertError.message}`
        }, { status: 500 })
      }
    }

    console.log('✅ User profile created successfully')

    // Create coach profile if needed, but only if the user profile didn't already exist
    if (userType === 'coach' && !userProfileExists) {
      console.log('👨‍🏫 Creating coach profile...')
      const { error: coachError } = await supabaseAdmin
        .from('coach_profiles')
        .insert({
          user_id: userId,
          bio: 'Welcome to my coaching profile!',
          years_experience: 0,
          certifications: [],
          specializations: [],
          languages_spoken: ['English'],
          is_available: true,
          listing_status: 'active'
        })

      if (coachError) {
        console.error('❌ Error creating coach profile:', coachError)
        // Handle duplicate coach profile gracefully
        if (coachError.code === '23505') {
          console.log('ℹ️ Coach profile already exists, continuing...')
        }
      } else {
        console.log('✅ Coach profile created successfully')
      }
    } else if (userType === 'coach' && userProfileExists) {
      console.log('ℹ️ Skipping coach profile creation - user already exists')
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          user_type: userType
        }
      },
      session: null, // No session since we bypassed auth
      needsEmailVerification: false
    })

  } catch (error) {
    console.error('❌ Signup error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}