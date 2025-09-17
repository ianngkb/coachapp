const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function manualCreateCities() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Connecting to Supabase with service role...');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // First, let's try to create the cities table using a direct SQL approach
    // We'll use the raw SQL through the REST API endpoint
    console.log('Creating cities table...');

    const createCitiesTableSQL = `
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

    // Use fetch to directly call the SQL API
    const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ query: createCitiesTableSQL })
    });

    if (!sqlResponse.ok) {
      console.log('SQL API not available, trying alternative approach...');

      // Alternative: Try to insert a test record to see if table exists
      const { error: testError } = await supabase
        .from('cities')
        .select('id')
        .limit(1);

      if (testError && testError.code === 'PGRST205') {
        console.error('❌ Cities table does not exist and cannot be created via API.');
        console.log('\n📋 Please manually create the cities table in your Supabase dashboard:');
        console.log('Go to: https://supabase.com/dashboard/project/rtprwnocejyhdxckuajm/editor');
        console.log('Run this SQL:');
        console.log(createCitiesTableSQL);
        return;
      }
    } else {
      console.log('✅ Cities table creation attempted via SQL API');
    }

    // Now let's insert the cities data
    console.log('Inserting cities data...');

    // Kuala Lumpur cities
    const klCities = [
      { name: 'Kuala Lumpur City Centre (KLCC)', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: true, display_order: 1 },
      { name: 'Bukit Bintang', state: 'Kuala Lumpur', district: 'Bukit Bintang', is_popular: true, display_order: 2 },
      { name: 'Cheras', state: 'Kuala Lumpur', district: 'Cheras', is_popular: true, display_order: 3 },
      { name: 'Kepong', state: 'Kuala Lumpur', district: 'Kepong', is_popular: true, display_order: 4 },
      { name: 'Setiawangsa', state: 'Kuala Lumpur', district: 'Setiawangsa', is_popular: true, display_order: 5 },
      { name: 'Wangsa Maju', state: 'Kuala Lumpur', district: 'Wangsa Maju', is_popular: true, display_order: 6 },
      { name: 'Batu Caves', state: 'Kuala Lumpur', district: 'Batu', is_popular: true, display_order: 8 },
      { name: 'Sentul', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: true, display_order: 13 },
      { name: 'Mont Kiara', state: 'Kuala Lumpur', district: 'Segambut', is_popular: true, display_order: 14 },
      { name: 'Bangsar', state: 'Kuala Lumpur', district: 'Lembah Pantai', is_popular: true, display_order: 15 }
    ];

    // Selangor cities
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
      { name: 'Port Klang', state: 'Selangor', district: 'Klang', is_popular: true, display_order: 20 },
      { name: 'Subang', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 21 },
      { name: 'USJ (UEP Subang Jaya)', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 22 },
      { name: 'Ara Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 23 },
      { name: 'Kota Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 24 },
      { name: 'Mutiara Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 25 },
      { name: 'Bandar Utama', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 26 },
      { name: 'Sunway', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 28 }
    ];

    // Insert all cities
    const allCities = [...klCities, ...selangorCities];

    console.log(`Inserting ${allCities.length} cities...`);

    const { data: insertedData, error: insertError } = await supabase
      .from('cities')
      .insert(allCities)
      .select();

    if (insertError) {
      console.error('Error inserting cities:', insertError);

      // If table doesn't exist, show manual creation instructions
      if (insertError.code === 'PGRST205') {
        console.log('\n📋 The cities table does not exist. Please create it manually:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/rtprwnocejyhdxckuajm/editor');
        console.log('2. Run this SQL to create the table:');
        console.log('\n' + createCitiesTableSQL);
        console.log('\n3. Then re-run this script to insert the cities data.');
        return;
      }
    } else {
      console.log(`✅ Successfully inserted ${insertedData?.length || 0} cities`);
    }

    // Test the queries
    console.log('\nTesting city queries...');

    const { data: klCitiesData, error: klError } = await supabase
      .from('cities')
      .select('name, state, is_popular')
      .eq('state', 'Kuala Lumpur')
      .order('is_popular', { ascending: false })
      .order('display_order', { ascending: true });

    if (klError) {
      console.error('KL query error:', klError);
    } else {
      console.log(`✅ Kuala Lumpur: ${klCitiesData?.length || 0} cities`);
      console.log('  Popular cities:', klCitiesData?.filter(c => c.is_popular).slice(0, 5).map(c => c.name));
    }

    const { data: selangorCitiesData, error: selangorError } = await supabase
      .from('cities')
      .select('name, state, is_popular')
      .eq('state', 'Selangor')
      .order('is_popular', { ascending: false })
      .order('display_order', { ascending: true });

    if (selangorError) {
      console.error('Selangor query error:', selangorError);
    } else {
      console.log(`✅ Selangor: ${selangorCitiesData?.length || 0} cities`);
      console.log('  Popular cities:', selangorCitiesData?.filter(c => c.is_popular).slice(0, 5).map(c => c.name));
    }

    console.log('\n🎉 Setup complete! Refresh your browser to see the cities in the dropdown.');

  } catch (err) {
    console.error('Error:', err);
  }
}

manualCreateCities();