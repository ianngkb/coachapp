const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigration() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('URL:', supabaseUrl);
    console.log('Key length:', serviceRoleKey ? serviceRoleKey.length : 'undefined');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Execute the migration manually
    console.log('Adding first_name and last_name columns...');

    // Step 1: Add columns
    const { error: addColsError } = await supabase.rpc('sql', {
      query: `
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name = 'users' AND column_name = 'first_name') THEN
                ALTER TABLE users ADD COLUMN first_name TEXT;
            END IF;

            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                          WHERE table_name = 'users' AND column_name = 'last_name') THEN
                ALTER TABLE users ADD COLUMN last_name TEXT;
            END IF;
        END $$;
      `
    });

    if (addColsError) {
      console.error('Error adding columns:', addColsError);
      return;
    }

    console.log('Columns added successfully');

    // Step 2: Migrate data
    const { error: migrateError } = await supabase.rpc('sql', {
      query: `
        UPDATE users
        SET
          first_name = CASE
            WHEN full_name ~ '\\s' THEN TRIM(split_part(full_name, ' ', 1))
            ELSE full_name
          END,
          last_name = CASE
            WHEN full_name ~ '\\s' THEN TRIM(regexp_replace(full_name, '^[^\\s]+\\s', ''))
            ELSE ''
          END
        WHERE first_name IS NULL OR last_name IS NULL;
      `
    });

    if (migrateError) {
      console.error('Error migrating data:', migrateError);
      return;
    }

    console.log('Data migrated successfully');

    // Step 3: Set NOT NULL
    const { error: notNullError } = await supabase.rpc('sql', {
      query: `
        ALTER TABLE users
        ALTER COLUMN first_name SET NOT NULL,
        ALTER COLUMN last_name SET NOT NULL;
      `
    });

    if (notNullError) {
      console.error('Error setting NOT NULL:', notNullError);
      return;
    }

    console.log('NOT NULL constraints added');

    // Test the changes
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('first_name, last_name, full_name, phone_number')
      .limit(3);

    if (queryError) {
      console.error('Query error:', queryError);
    } else {
      console.log('Sample users after migration:');
      console.log(users);
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

applyMigration();