import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for user creation
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, userType } = body

    console.log('📝 Signup request received:', { email, fullName, userType })

    // Validate required fields
    if (!email || !password || !fullName || !userType) {
      console.log('❌ Missing required fields')
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // If admin is available, use admin path
    if (supabaseAdmin) {
      // Check if email already exists
      console.log('🔍 Checking if email exists:', email)
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('email', email)
        .single()

      if (checkError && (checkError as any).code !== 'PGRST116') {
        console.error('❌ Error checking existing user:', checkError)
        return NextResponse.json({
          error: 'Database error checking existing user'
        }, { status: 500 })
      }

      if (existingUser) {
        console.log('❌ Email already registered')
        return NextResponse.json({
          error: 'Email already registered'
        }, { status: 400 })
      }

      // First check for an existing auth user by email (handles partial signups)
      const existingAuth = await (async () => {
        try {
          const { data: usersPage } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
          return usersPage?.users?.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase()) || null
        } catch (e) {
          console.warn('⚠️ Unable to list auth users:', e)
          return null
        }
      })()

      let authData = { user: existingAuth, session: null } as any

      if (existingAuth) {
        console.log('ℹ️ Auth user already exists, updating password/metadata and confirming email')
        const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existingAuth.id, {
          password,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            user_type: userType
          }
        })
        if (updateErr) {
          console.error('❌ Failed to update existing auth user:', updateErr)
          return NextResponse.json({ error: 'Failed to update existing account. Try a different email.' }, { status: 400 })
        }
        authData.user = updated.user
      } else {
        // Create user in Supabase Auth with metadata to drive DB trigger
        console.log('👤 Creating Supabase Auth user (admin)')
        const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            user_type: userType
          }
        })

        if (authError) {
          console.error('❌ Auth creation failed (admin):', {
            message: authError.message,
            status: (authError as any).status,
            code: (authError as any).code
          })

          // Re-check if user now exists despite error (race/partial create)
          const { data: usersPage2 } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
          const maybeUser = usersPage2?.users?.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase())
          if (!maybeUser) {
            // Fallback to anon signup if admin creation fails
            console.warn('⚠️ Admin auth creation failed, falling back to anon signup...')
            const supabaseAnon = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            const { data: anonSignUpData, error: anonSignUpError } = await supabaseAnon.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: undefined, // Disable email confirmation
                data: {
                  first_name: firstName,
                  last_name: lastName,
                  user_type: userType
                }
              }
            })

            if (anonSignUpError) {
              console.error('❌ Anon signup also failed:', anonSignUpError)
              return NextResponse.json({
                error: `Failed to create account: ${anonSignUpError.message}`
              }, { status: 400 })
            }

            // Use the anon signup result
            authData = anonSignUpData
            console.log('✅ Fallback anon signup successful:', authData.user?.id)
          } else {
            authData.user = maybeUser
          }
        } else {
          authData = created
        }
      }

      console.log('✅ Auth user created:', authData.user?.id)

      // Insert user profile (redundant when trigger exists, but keeps cloud parity)
      // Only attempt if we have supabaseAdmin and a user ID
      if (supabaseAdmin && authData.user?.id) {
        console.log('💾 Inserting user profile...')
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            user_type: userType,
            is_active: true,
            is_verified: authData.user.email_confirmed_at ? true : false
          })

        if (insertError) {
          // If insert fails, check if profile already exists (might be created by trigger)
          const { data: existingProfile } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('id', authData.user.id)
            .single()

          if (!existingProfile) {
            console.error('❌ Error inserting user profile and no existing profile found:', insertError)
            return NextResponse.json({
              error: 'Database error creating user profile'
            }, { status: 500 })
          } else {
            console.log('ℹ️ User profile already exists (likely created by trigger)')
          }
        } else {
          console.log('✅ User profile created successfully')
        }
      } else {
        console.log('ℹ️ Skipping profile insertion (using anon signup or no admin client)')
      }

      // Create coach profile if needed
      if (userType === 'coach' && supabaseAdmin && authData.user?.id) {
        console.log('👨‍🏫 Creating coach profile...')
        const { error: coachError } = await supabaseAdmin
          .from('coach_profiles')
          .insert({
            user_id: authData.user.id,
            bio: 'Welcome to my coaching profile!',
            years_experience: 0,
            certifications: [],
            specializations: [],
            languages_spoken: ['English'],
            is_available: true,
            listing_status: 'active'
          })

        if (coachError) {
          // Check if coach profile already exists
          const { data: existingCoach } = await supabaseAdmin
            .from('coach_profiles')
            .select('user_id')
            .eq('user_id', authData.user.id)
            .single()

          if (!existingCoach) {
            console.error('❌ Error creating coach profile:', coachError)
          } else {
            console.log('ℹ️ Coach profile already exists')
          }
        } else {
          console.log('✅ Coach profile created successfully')
        }
      } else if (userType === 'coach') {
        console.log('ℹ️ Skipping coach profile creation (using anon signup)')
      }

      return NextResponse.json({
        message: 'User created successfully',
        user: authData.user,
        session: authData.session,
        needsEmailVerification: !authData.user?.email_confirmed_at
      })
    }

    // Fallback: no service role key in env, use anon client to sign up
    console.warn('⚠️ Service role key missing. Falling back to anon signup flow')
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          user_type: userType
        }
      }
    })

    if (signUpError) {
      console.error('❌ Anon signup failed:', signUpError)
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'User created successfully (anon flow)',
      user: signUpData.user,
      session: signUpData.session
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}