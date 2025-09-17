import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Validation schema
const precreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  user_type: z.enum(['student', 'coach']).optional(),
})

// Create admin client with service role key
function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Precreate user API called')

    const body = await request.json()
    console.log('📋 Request body:', body)

    // Validate request body
    const validation = precreateUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors }, { status: 400 })
    }

    const { email, first_name, last_name, user_type } = validation.data
    console.log('✅ Validation passed:', { email, first_name, last_name, user_type })

    // Create Supabase admin client
    const supabaseAdmin = createSupabaseAdmin()

    // Check if user already exists
    console.log('🔍 Checking if user exists with email:', email)
    const { data: existingUser, error: selectError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, user_type, is_verified')
      .eq('email', email)
      .single()

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ Error checking existing user:', selectError)
      return NextResponse.json(
        { ok: false, error: 'Database error' },
        { status: 500 }
      )
    }

    if (existingUser) {
      console.log('👤 User already exists:', existingUser)
      // If user exists, update their name and user_type
      console.log('🔄 Updating existing user...')
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          first_name: first_name || existingUser.first_name,
          last_name: last_name || existingUser.last_name,
          user_type: user_type || existingUser.user_type,
        })
        .eq('id', existingUser.id)
        .select('id, email, first_name, last_name, user_type, is_verified')
        .single()

      if (updateError) {
        console.error('❌ Error updating user:', updateError)
        return NextResponse.json(
          { ok: false, error: 'Failed to update user record' },
          { status: 500 }
        )
      }
      console.log('✅ User updated successfully:', updatedUser)
      return NextResponse.json({
        ok: true,
        message: 'User record updated successfully',
        user: updatedUser
      })
    }

    // Step 1: Create auth user first (unconfirmed)
    console.log('🔐 Creating auth user...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false, // User is NOT confirmed yet
      user_metadata: {
        first_name: first_name || null,
        last_name: last_name || null,
        user_type: user_type || 'student'
      }
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError)
      return NextResponse.json(
        { ok: false, error: 'Failed to create auth user' },
        { status: 500 }
      )
    }

    console.log('✅ Auth user created:', authData.user?.id)

    // Step 2: Create user record with auth ID and is_verified=false
    console.log('✨ Creating user record...')
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name: first_name || '',
        last_name: last_name || '',
        user_type: user_type || 'student',
        is_verified: false,
        is_active: true
      })
      .select('id, email, first_name, last_name, user_type, is_verified')
      .single()

    if (insertError) {
      console.error('❌ Error inserting user:', insertError)
      return NextResponse.json(
        { ok: false, error: 'Failed to create user record' },
        { status: 500 }
      )
    }

    console.log('✅ User created successfully:', newUser)

    return NextResponse.json({
      ok: true,
      message: 'User record created successfully',
      user: newUser
    })

  } catch (error) {
    console.error('💥 Precreate user API error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}