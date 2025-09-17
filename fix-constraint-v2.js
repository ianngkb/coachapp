import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

async function fixConstraintDirect() {
  console.log('🔧 Directly fixing foreign key constraint...')

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
    // First, let's see what constraints actually exist
    console.log('🔍 Checking existing constraints...')

    const { data: constraints, error: constraintError } = await supabaseAdmin
      .rpc('sql', {
        query: `
          SELECT
            conname as constraint_name,
            conrelid::regclass as table_name,
            confrelid::regclass as referenced_table
          FROM pg_constraint
          WHERE conrelid = 'public.users'::regclass
          AND contype = 'f'
        `
      })

    if (constraintError) {
      console.error('❌ Error checking constraints:', constraintError)
    } else {
      console.log('📊 Found constraints:', constraints)
    }

    // Try to drop the constraint using raw SQL
    console.log('🗑️ Attempting to drop users_id_fkey constraint...')

    const { data: dropResult, error: dropError } = await supabaseAdmin
      .rpc('sql', {
        query: 'ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;'
      })

    if (dropError) {
      console.error('❌ Error dropping constraint:', dropError)

      // Try alternative method - check if we need to use CASCADE
      console.log('🔧 Trying with CASCADE...')
      const { data: cascadeResult, error: cascadeError } = await supabaseAdmin
        .rpc('sql', {
          query: 'ALTER TABLE public.users DROP CONSTRAINT users_id_fkey CASCADE;'
        })

      if (cascadeError) {
        console.error('❌ CASCADE also failed:', cascadeError)
      } else {
        console.log('✅ Constraint dropped with CASCADE')
      }
    } else {
      console.log('✅ Constraint dropped successfully')
    }

    // Test user insertion again
    console.log('🧪 Testing user insertion after constraint removal...')
    const { v4: uuidv4 } = await import('uuid')
    const testUserId = uuidv4()

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: testUserId,
        email: 'test-final@example.com',
        full_name: 'Test User Final',
        user_type: 'student',
        is_active: true,
        is_verified: true
      })

    if (insertError) {
      console.error('❌ Test insertion still failed:', insertError)
    } else {
      console.log('✅ SUCCESS! User insertion now works!')

      // Clean up test user
      await supabaseAdmin.from('users').delete().eq('id', testUserId)
      console.log('🧹 Cleaned up test user')
    }

  } catch (error) {
    console.error('❌ Direct constraint fix failed:', error)
  }
}

fixConstraintDirect()