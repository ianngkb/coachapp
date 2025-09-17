import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

async function checkSchema() {
  console.log('🔧 Checking database schema...')

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
    // Check if users table exists and its structure
    console.log('\n📋 Checking users table structure...')
    const { data: usersInfo, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(0)

    if (usersError) {
      console.error('❌ Users table error:', usersError)
    } else {
      console.log('✅ Users table exists')
    }

    // Try to get some sample data
    console.log('\n📊 Checking existing users...')
    const { data: users, error: usersFetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, user_type, is_active, is_verified')
      .limit(5)

    if (usersFetchError) {
      console.error('❌ Error fetching users:', usersFetchError)
    } else {
      console.log('📊 Found users:', users?.length || 0)
      if (users && users.length > 0) {
        users.forEach(user => {
          console.log(`  - ${user.email} (${user.user_type}) [Active: ${user.is_active}, Verified: ${user.is_verified}]`)
        })
      }
    }

    // Check coach_profiles table
    console.log('\n👨‍🏫 Checking coach_profiles table...')
    const { data: coaches, error: coachError } = await supabaseAdmin
      .from('coach_profiles')
      .select('user_id, bio, is_available, listing_status')
      .limit(5)

    if (coachError) {
      console.error('❌ Coach profiles table error:', coachError)
    } else {
      console.log('✅ Coach profiles table exists')
      console.log('📊 Found coaches:', coaches?.length || 0)
    }

    // Try to create a simple auth user to see what the actual error is
    console.log('\n🧪 Attempting minimal auth user creation...')
    const testEmail = `test-minimal-${Date.now()}@example.com`

    try {
      const { data: authResult, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: 'TestPassword123',
        email_confirm: true
      })

      if (authError) {
        console.error('❌ Auth creation error details:', {
          message: authError.message,
          status: authError.status,
          code: authError.code
        })
      } else {
        console.log('✅ Auth user created successfully:', authResult.user.id)

        // Clean up
        await supabaseAdmin.auth.admin.deleteUser(authResult.user.id)
        console.log('🧹 Test user cleaned up')
      }
    } catch (createError) {
      console.error('❌ Exception during auth creation:', createError)
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error)
  }
}

checkSchema()