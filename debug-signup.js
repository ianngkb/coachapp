import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

async function debugSignup() {
  console.log('🔧 Debugging signup issue...')

  // Test environment variables
  console.log('Environment check:')
  console.log('- SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '❌ Missing')
  console.log('- SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '❌ Missing')
  console.log('- ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '❌ Missing')

  // Test admin client creation
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // Test basic connection
    console.log('\n📡 Testing database connection...')
    const { data: healthCheck, error: healthError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)

    if (healthError) {
      console.error('❌ Database connection failed:', healthError)
      return
    }

    console.log('✅ Database connection successful')

    // Test auth user creation directly
    console.log('\n👤 Testing auth user creation...')
    const testEmail = 'debug-test@example.com'
    const testPassword = 'DebugPassword123'

    // First, clean up any existing user
    try {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers.users?.find(u => u.email === testEmail)
      if (existingUser) {
        console.log('🧹 Cleaning up existing test user...')
        await supabaseAdmin.auth.admin.deleteUser(existingUser.id)
      }
    } catch (cleanupError) {
      console.log('ℹ️ No existing user to clean up')
    }

    // Try to create auth user
    const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Debug Test',
        user_type: 'student'
      }
    })

    if (authError) {
      console.error('❌ Auth user creation failed:', {
        message: authError.message,
        status: authError.status,
        code: authError.code,
        details: authError
      })
      return
    }

    console.log('✅ Auth user created successfully:', authResult.user.id)

    // Test profile creation
    console.log('\n📝 Testing profile creation...')
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authResult.user.id,
        email: testEmail,
        full_name: 'Debug Test',
        user_type: 'student',
        is_active: true,
        is_verified: true
      })

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError)
    } else {
      console.log('✅ Profile created successfully')
    }

    // Clean up
    console.log('\n🧹 Cleaning up test user...')
    await supabaseAdmin.auth.admin.deleteUser(authResult.user.id)

    console.log('✅ Signup debugging completed successfully!')

  } catch (error) {
    console.error('❌ Debug script failed:', error)
  }
}

debugSignup()