const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function createCitiesTable() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Connecting to Supabase...');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // First, check if cities table already exists
    const { data: existingCities, error: checkError } = await supabase
      .from('cities')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ Cities table already exists! Checking data...');

      // Check if we have cities data
      const { data: cities, error: countError } = await supabase
        .from('cities')
        .select('*', { count: 'exact' });

      if (!countError && cities && cities.length > 0) {
        console.log(`✅ Found ${cities.length} cities in database`);

        // Test KL cities
        const klCities = cities.filter(c => c.state === 'Kuala Lumpur');
        console.log(`  - Kuala Lumpur: ${klCities.length} cities`);
        console.log(`    Popular KL cities: ${klCities.filter(c => c.is_popular).slice(0, 5).map(c => c.name).join(', ')}`);

        // Test Selangor cities
        const selangorCities = cities.filter(c => c.state === 'Selangor');
        console.log(`  - Selangor: ${selangorCities.length} cities`);
        console.log(`    Popular Selangor cities: ${selangorCities.filter(c => c.is_popular).slice(0, 5).map(c => c.name).join(', ')}`);

        console.log('🎉 Cities table is ready! Your dropdown should now work.');
        return;
      }
    }

    console.log('Creating cities table and data...');

    // Create the table using raw SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.cities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        state TEXT NOT NULL CHECK (state IN ('Kuala Lumpur', 'Selangor')),
        district TEXT,
        is_popular BOOLEAN DEFAULT FALSE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_cities_state ON public.cities(state);
      CREATE INDEX IF NOT EXISTS idx_cities_popular ON public.cities(is_popular, display_order);
    `;

    // Insert all the cities data
    const klCities = [
      { name: 'Kuala Lumpur City Centre (KLCC)', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: true, display_order: 1 },
      { name: 'Bukit Bintang', state: 'Kuala Lumpur', district: 'Bukit Bintang', is_popular: true, display_order: 2 },
      { name: 'Cheras', state: 'Kuala Lumpur', district: 'Cheras', is_popular: true, display_order: 3 },
      { name: 'Kepong', state: 'Kuala Lumpur', district: 'Kepong', is_popular: true, display_order: 4 },
      { name: 'Setiawangsa', state: 'Kuala Lumpur', district: 'Setiawangsa', is_popular: true, display_order: 5 },
      { name: 'Wangsa Maju', state: 'Kuala Lumpur', district: 'Wangsa Maju', is_popular: true, display_order: 6 },
      { name: 'Titiwangsa', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: false, display_order: 7 },
      { name: 'Batu Caves', state: 'Kuala Lumpur', district: 'Batu', is_popular: true, display_order: 8 },
      { name: 'Segambut', state: 'Kuala Lumpur', district: 'Segambut', is_popular: false, display_order: 9 },
      { name: 'Lembah Pantai', state: 'Kuala Lumpur', district: 'Lembah Pantai', is_popular: false, display_order: 10 },
      { name: 'Seputeh', state: 'Kuala Lumpur', district: 'Seputeh', is_popular: false, display_order: 11 },
      { name: 'Bandar Tun Razak', state: 'Kuala Lumpur', district: 'Bandar Tun Razak', is_popular: false, display_order: 12 },
      { name: 'Sentul', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: true, display_order: 13 },
      { name: 'Mont Kiara', state: 'Kuala Lumpur', district: 'Segambut', is_popular: true, display_order: 14 },
      { name: 'Bangsar', state: 'Kuala Lumpur', district: 'Lembah Pantai', is_popular: true, display_order: 15 }
    ];

    const selangorCities = [
      { name: 'Shah Alam', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 1 },
      { name: 'Petaling Jaya', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 2 },
      { name: 'Subang Jaya', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 3 },
      { name: 'Klang', state: 'Selangor', district: 'Klang', is_popular: true, display_order: 4 },
      { name: 'Kajang', state: 'Selangor', district: 'Hulu Langat', is_popular: true, display_order: 5 },
      { name: 'Ampang', state: 'Selangor', district: 'Hulu Langat', is_popular: true, display_order: 6 },
      { name: 'Selayang', state: 'Selangor', district: 'Gombak', is_popular: true, display_order: 7 },
      { name: 'Rawang', state: 'Selangor', district: 'Gombak', is_popular: true, display_order: 8 },
      { name: 'Puchong', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 9 },
      { name: 'Seri Kembangan', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 10 },
      { name: 'Bangi', state: 'Selangor', district: 'Hulu Langat', is_popular: true, display_order: 11 },
      { name: 'Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 12 },
      { name: 'Cyberjaya', state: 'Selangor', district: 'Sepang', is_popular: true, display_order: 13 },
      { name: 'Putrajaya', state: 'Selangor', district: 'Sepang', is_popular: true, display_order: 14 },
      { name: 'Sepang', state: 'Selangor', district: 'Sepang', is_popular: false, display_order: 15 },
      { name: 'Kuala Langat', state: 'Selangor', district: 'Kuala Langat', is_popular: false, display_order: 16 },
      { name: 'Kuala Selangor', state: 'Selangor', district: 'Kuala Selangor', is_popular: false, display_order: 17 },
      { name: 'Sabak Bernam', state: 'Selangor', district: 'Sabak Bernam', is_popular: false, display_order: 18 },
      { name: 'Hulu Selangor', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 19 },
      { name: 'Port Klang', state: 'Selangor', district: 'Klang', is_popular: true, display_order: 20 },
      { name: 'Subang', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 21 },
      { name: 'USJ (UEP Subang Jaya)', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 22 },
      { name: 'Ara Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 23 },
      { name: 'Kota Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 24 },
      { name: 'Mutiara Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 25 },
      { name: 'Bandar Utama', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 26 },
      { name: 'SS2', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 27 },
      { name: 'Sunway', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 28 },
      { name: 'Cheras (Selangor)', state: 'Selangor', district: 'Hulu Langat', is_popular: true, display_order: 29 },
      { name: 'Balakong', state: 'Selangor', district: 'Hulu Langat', is_popular: false, display_order: 30 }
    ];

    const allCities = [...klCities, ...selangorCities];

    // Try to insert cities using upsert
    console.log(`Inserting ${allCities.length} cities...`);

    const { data: insertedData, error: insertError } = await supabase
      .from('cities')
      .upsert(allCities, { onConflict: 'name,state' })
      .select();

    if (insertError) {
      // Try creating table first if it doesn't exist
      console.log('Cities table may not exist. Attempting to create...');
      console.error('Insert error details:', insertError);

      if (insertError.code === 'PGRST205') {
        console.log('\n📋 The cities table does not exist in your database.');
        console.log('Please manually create the cities table:');
        console.log('1. Go to your Supabase dashboard SQL editor');
        console.log('2. Run the following SQL:');
        console.log('\n' + createTableSQL);
        console.log('\n3. Then re-run this script to insert the cities data.');
      }
      return;
    }

    console.log(`✅ Successfully created/updated ${insertedData?.length || allCities.length} cities`);

    // Test the queries
    console.log('\nTesting city queries...');

    const { data: klTestData, error: klTestError } = await supabase
      .from('cities')
      .select('name, state, is_popular')
      .eq('state', 'Kuala Lumpur')
      .order('is_popular', { ascending: false })
      .order('display_order', { ascending: true });

    if (klTestError) {
      console.error('KL query error:', klTestError);
    } else {
      console.log(`✅ Kuala Lumpur: ${klTestData?.length || 0} cities`);
      const popularKL = klTestData?.filter(c => c.is_popular).slice(0, 5).map(c => c.name) || [];
      console.log('  Popular cities:', popularKL.join(', '));
    }

    const { data: selangorTestData, error: selangorTestError } = await supabase
      .from('cities')
      .select('name, state, is_popular')
      .eq('state', 'Selangor')
      .order('is_popular', { ascending: false })
      .order('display_order', { ascending: true });

    if (selangorTestError) {
      console.error('Selangor query error:', selangorTestError);
    } else {
      console.log(`✅ Selangor: ${selangorTestData?.length || 0} cities`);
      const popularSelangor = selangorTestData?.filter(c => c.is_popular).slice(0, 5).map(c => c.name) || [];
      console.log('  Popular cities:', popularSelangor.join(', '));
    }

    console.log('\n🎉 Cities setup complete! Refresh your browser to see the cities in the dropdown.');

  } catch (err) {
    console.error('Error:', err.message);
    console.log('\nIf the cities table does not exist, please manually create it in your Supabase dashboard.');
  }
}

createCitiesTable();