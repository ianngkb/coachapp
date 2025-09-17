import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

async function fixConstraint() {
  console.log('🔧 Fixing foreign key constraint issue...')

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
    // Execute SQL to remove foreign key constraints
    console.log('🗑️ Removing foreign key constraints on users table...')

    const { data: result, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Remove foreign key constraint on users.id if it exists
        DO $$
        DECLARE
            r RECORD;
        BEGIN
            FOR r IN
                SELECT conname
                FROM pg_constraint
                WHERE confrelid = (SELECT oid FROM pg_class WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth'))
                AND conrelid = (SELECT oid FROM pg_class WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
            LOOP
                EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS ' || r.conname;
                RAISE NOTICE 'Dropped foreign key constraint: %', r.conname;
            END LOOP;
        END $$;

        -- Also try common constraint names
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS fk_users_auth_id;
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_auth_id_fkey;
      `
    })

    if (error) {
      console.error('❌ SQL execution failed, trying direct approach...')

      // Try a more direct approach
      const queries = [
        'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey',
        'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS fk_users_auth_id',
        'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_auth_id_fkey'
      ]

      for (const query of queries) {
        try {
          const { error: queryError } = await supabaseAdmin.rpc('exec_sql', { sql: query })
          if (queryError) {
            console.log(`⚠️ Query failed (might not exist): ${query}`)
          } else {
            console.log(`✅ Executed: ${query}`)
          }
        } catch (e) {
          console.log(`ℹ️ Query might not be needed: ${query}`)
        }
      }
    } else {
      console.log('✅ Foreign key constraints processed')
    }

    // Test inserting a user now
    console.log('🧪 Testing user insertion after constraint fix...')
    const { v4: uuidv4 } = await import('uuid')
    const testUserId = uuidv4()

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: testUserId,
        email: 'test-constraint@example.com',
        full_name: 'Test User',
        user_type: 'student',
        is_active: true,
        is_verified: true
      })

    if (insertError) {
      console.error('❌ Test insertion still failed:', insertError)
    } else {
      console.log('✅ Test insertion successful!')

      // Clean up test user
      await supabaseAdmin.from('users').delete().eq('id', testUserId)
      console.log('🧹 Cleaned up test user')
    }

  } catch (error) {
    console.error('❌ Fix constraint failed:', error)
  }
}

fixConstraint()