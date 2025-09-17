const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyCitiesMigration() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Connecting to Supabase...');
    console.log('URL:', supabaseUrl);
    console.log('Key length:', serviceRoleKey ? serviceRoleKey.length : 'undefined');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20240916140000_add_cities_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying cities migration...');

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      const { error } = await supabase.rpc('exec', {
        sql: statement + ';'
      });

      if (error) {
        console.error(`Error in statement ${i + 1}:`, error);

        // Continue with other statements even if one fails
        continue;
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('Migration completed. Testing cities query...');

    // Test the cities table
    const { data: cities, error: queryError } = await supabase
      .from('cities')
      .select('*')
      .eq('state', 'Kuala Lumpur')
      .limit(5);

    if (queryError) {
      console.error('Query error:', queryError);
    } else {
      console.log('✅ Cities table working! Sample KL cities:');
      cities.forEach(city => {
        console.log(`  - ${city.name} (${city.state})`);
      });
    }

    // Test Selangor cities
    const { data: selangorCities, error: selangorError } = await supabase
      .from('cities')
      .select('*')
      .eq('state', 'Selangor')
      .limit(5);

    if (selangorError) {
      console.error('Selangor query error:', selangorError);
    } else {
      console.log('✅ Sample Selangor cities:');
      selangorCities.forEach(city => {
        console.log(`  - ${city.name} (${city.state})`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

applyCitiesMigration();