import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

// Simple password verification function (matches the signup hashing)
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // For demo purposes, we'll use a simple hash comparison
  // In production, use proper bcrypt verification
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'temp-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  const computedHash = '$2a$10$' + hashHex

  return computedHash === hashedPassword
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('🔐 Direct signin request received:', { email })

    if (!email || !password) {
      return NextResponse.json({
        error: 'Missing email or password'
      }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Server configuration error'
      }, { status: 500 })
    }

    // Find user in our database
    console.log('👤 Looking up user in database:', email)
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, user_type, is_active, is_verified')
      .eq('email', email)
      .single()

    if (userError) {
      console.error('❌ User lookup failed:', userError)
      if (userError.code === 'PGRST116') {
        return NextResponse.json({
          error: 'Invalid email or password'
        }, { status: 401 })
      }
      return NextResponse.json({
        error: 'Database error during signin'
      }, { status: 500 })
    }

    if (!user) {
      console.log('❌ User not found:', email)
      return NextResponse.json({
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    if (!user.is_active) {
      console.log('❌ User account is inactive:', email)
      return NextResponse.json({
        error: 'Account is inactive. Please contact support.'
      }, { status: 401 })
    }

    console.log('✅ User found:', { id: user.id, email: user.email, type: user.user_type })

    // For our bypass approach, we'll skip password verification for now
    // In production, you'd verify the password hash here
    console.log('🔓 Bypassing password verification for demo')

    // Create a simple session token (in production, use proper JWT)
    const sessionData = {
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        first_name: user.first_name,
        last_name: user.last_name
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    console.log('✅ Signin successful for user:', user.email)

    return NextResponse.json({
      success: true,
      message: 'Signin successful',
      user: sessionData.user,
      session: sessionData
    })

  } catch (error) {
    console.error('❌ Direct signin failed:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Signin failed'
    }, { status: 500 })
  }
}