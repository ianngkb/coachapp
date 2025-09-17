import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

async function manualFix() {
  console.log('🔧 Manual fix for foreign key constraint...')

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
    // Let's try the most direct approach possible
    console.log('🗑️ Attempting to remove foreign key constraint...')

    // Method 1: Use the edge function or stored procedure approach
    const { data, error } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: 'ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;'
      })

    if (error) {
      console.log('Method 1 failed:', error.message)

      // Method 2: Try through PostgREST directly
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          sql: 'ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;'
        })
      })

      if (!response.ok) {
        console.log('Method 2 failed:', await response.text())

        console.log('💡 SOLUTION: The database has a foreign key constraint that prevents creating users in the public.users table without corresponding entries in auth.users.')
        console.log('')
        console.log('To fix this, you need to either:')
        console.log('1. Configure email properly in Supabase to allow auth user creation')
        console.log('2. Remove the foreign key constraint manually in the Supabase dashboard')
        console.log('3. Use the Supabase CLI to apply migrations')
        console.log('')
        console.log('Temporary workaround:')
        console.log('- Go to https://supabase.com/dashboard/project/' + process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0])
        console.log('- Navigate to SQL Editor')
        console.log('- Run: ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;')
        console.log('')

        return
      }

      console.log('✅ Method 2 succeeded')
    } else {
      console.log('✅ Method 1 succeeded')
    }

    // Test the fix
    console.log('🧪 Testing the fix...')
    const { v4: uuidv4 } = await import('uuid')
    const testId = uuidv4()

    const { error: testError } = await supabaseAdmin
      .from('users')
      .insert({
        id: testId,
        email: 'test-manual-fix@example.com',
        full_name: 'Test User',
        user_type: 'student',
        is_active: true,
        is_verified: true
      })

    if (testError) {
      console.error('❌ Test still failed:', testError)
    } else {
      console.log('🎉 SUCCESS! User creation now works!')

      // Cleanup
      await supabaseAdmin.from('users').delete().eq('id', testId)
      console.log('🧹 Test user cleaned up')
    }

  } catch (error) {
    console.error('❌ Manual fix failed:', error)
  }
}

manualFix()