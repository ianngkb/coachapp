import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Sign in user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return NextResponse.json({
        error: authError.message
      }, { status: 400 })
    }

    if (authData.user) {
      // Get user profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError) {
        console.error('Error fetching user profile:', userError)
      }

      // If user is a coach, get coach profile
      let coachProfile = null
      if (userData?.user_type === 'coach') {
        const { data: coachData, error: coachError } = await supabase
          .from('coach_profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single()

        if (coachError) {
          console.error('Error fetching coach profile:', coachError)
        } else {
          coachProfile = coachData
        }
      }

      return NextResponse.json({
        message: 'Signed in successfully',
        user: authData.user,
        session: authData.session,
        profile: userData,
        coachProfile
      })
    }

    return NextResponse.json({
      error: 'Sign in failed'
    }, { status: 400 })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}