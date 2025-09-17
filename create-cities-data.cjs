const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const citiesData = [
    // Kuala Lumpur
    { name: 'Ampang', state: 'Kuala Lumpur', district: 'Ampang', is_popular: true, display_order: 1 },
    { name: 'Bandar Tun Razak', state: 'Kuala Lumpur', district: 'Bandar Tun Razak', is_popular: false, display_order: 2 },
    { name: 'Bangsar', state: 'Kuala Lumpur', district: 'Lembah Pantai', is_popular: true, display_order: 3 },
    { name: 'Batu Caves', state: 'Kuala Lumpur', district: 'Batu', is_popular: true, display_order: 4 },
    { name: 'Brickfields', state: 'Kuala Lumpur', district: 'Brickfields', is_popular: true, display_order: 5 },
    { name: 'Bukit Bintang', state: 'Kuala Lumpur', district: 'Bukit Bintang', is_popular: true, display_order: 6 },
    { name: 'Bukit Jalil', state: 'Kuala Lumpur', district: 'Bukit Jalil', is_popular: true, display_order: 7 },
    { name: 'Cheras', state: 'Kuala Lumpur', district: 'Cheras', is_popular: true, display_order: 8 },
    { name: 'Chinatown', state: 'Kuala Lumpur', district: 'City Centre', is_popular: true, display_order: 9 },
    { name: 'Chow Kit', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: false, display_order: 10 },
    { name: 'Damansara Heights', state: 'Kuala Lumpur', district: 'Bukit Damansara', is_popular: true, display_order: 11 },
    { name: 'Desa ParkCity', state: 'Kuala Lumpur', district: 'Segambut', is_popular: true, display_order: 12 },
    { name: 'Jalan Imbi', state: 'Kuala Lumpur', district: 'Bukit Bintang', is_popular: false, display_order: 13 },
    { name: 'Jalan Tuanku Abdul Rahman', state: 'Kuala Lumpur', district: 'Chow Kit', is_popular: false, display_order: 14 },
    { name: 'Kampung Baru', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: false, display_order: 15 },
    { name: 'Kepong', state: 'Kuala Lumpur', district: 'Kepong', is_popular: true, display_order: 16 },
    { name: 'KLCC', state: 'Kuala Lumpur', district: 'City Centre', is_popular: true, display_order: 17 },
    { name: 'Lembah Pantai', state: 'Kuala Lumpur', district: 'Lembah Pantai', is_popular: false, display_order: 18 },
    { name: 'Mid Valley', state: 'Kuala Lumpur', district: 'Lembah Pantai', is_popular: true, display_order: 19 },
    { name: 'Mont Kiara', state: 'Kuala Lumpur', district: 'Segambut', is_popular: true, display_order: 20 },
    { name: 'Old Klang Road', state: 'Kuala Lumpur', district: 'Seputeh', is_popular: false, display_order: 21 },
    { name: 'Pantai', state: 'Kuala Lumpur', district: 'Lembah Pantai', is_popular: false, display_order: 22 },
    { name: 'Pudu', state: 'Kuala Lumpur', district: 'Bukit Bintang', is_popular: false, display_order: 23 },
    { name: 'Segambut', state: 'Kuala Lumpur', district: 'Segambut', is_popular: false, display_order: 24 },
    { name: 'Sentul', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: true, display_order: 25 },
    { name: 'Seputeh', state: 'Kuala Lumpur', district: 'Seputeh', is_popular: false, display_order: 26 },
    { name: 'Setapak', state: 'Kuala Lumpur', district: 'Wangsa Maju', is_popular: true, display_order: 27 },
    { name: 'Setiawangsa', state: 'Kuala Lumpur', district: 'Setiawangsa', is_popular: true, display_order: 28 },
    { name: 'Sri Hartamas', state: 'Kuala Lumpur', district: 'Segambut', is_popular: true, display_order: 29 },
    { name: 'Taman Tun Dr Ismail (TTDI)', state: 'Kuala Lumpur', district: 'Segambut', is_popular: true, display_order: 30 },
    { name: 'Titiwangsa', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: false, display_order: 31 },
    { name: 'Wangsa Maju', state: 'Kuala Lumpur', district: 'Wangsa Maju', is_popular: true, display_order: 32 },
    // Selangor
    { name: 'Ampang', state: 'Selangor', district: 'Hulu Langat', is_popular: true, display_order: 1 },
    { name: 'Ara Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 2 },
    { name: 'Balakong', state: 'Selangor', district: 'Hulu Langat', is_popular: false, display_order: 3 },
    { name: 'Bandar Botanic', state: 'Selangor', district: 'Klang', is_popular: false, display_order: 4 },
    { name: 'Bandar Sunway', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 5 },
    { name: 'Bandar Utama', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 6 },
    { name: 'Bangi', state: 'Selangor', district: 'Hulu Langat', is_popular: true, display_order: 7 },
    { name: 'Batang Kali', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 8 },
    { name: 'Bukit Beruntung', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 9 },
    { name: 'Cheras', state: 'Selangor', district: 'Hulu Langat', is_popular: true, display_order: 10 },
    { name: 'Cyberjaya', state: 'Selangor', district: 'Sepang', is_popular: true, display_order: 11 },
    { name: 'Damansara Perdana', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 12 },
    { name: 'Glenmarie', state: 'Selangor', district: 'Petaling', is_popular: false, display_order: 13 },
    { name: 'Hulu Selangor', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 14 },
    { name: 'Jenjarom', state: 'Selangor', district: 'Kuala Langat', is_popular: false, display_order: 15 },
    { name: 'Kajang', state: 'Selangor', district: 'Hulu Langat', is_popular: true, display_order: 16 },
    { name: 'Kelana Jaya', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 17 },
    { name: 'Klang', state: 'Selangor', district: 'Klang', is_popular: true, display_order: 18 },
    { name: 'Kota Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 19 },
    { name: 'Kuala Kubu Bharu', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 20 },
    { name: 'Kuala Langat', state: 'Selangor', district: 'Kuala Langat', is_popular: false, display_order: 21 },
    { name: 'Kuala Selangor', state: 'Selangor', district: 'Kuala Selangor', is_popular: false, display_order: 22 },
    { name: 'Mutiara Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 23 },
    { name: 'Pandamaran', state: 'Selangor', district: 'Klang', is_popular: false, display_order: 24 },
    { name: 'Petaling Jaya', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 25 },
    { name: 'Port Klang', state: 'Selangor', district: 'Klang', is_popular: true, display_order: 26 },
    { name: 'Puchong', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 27 },
    { name: 'Putrajaya', state: 'Selangor', district: 'Sepang', is_popular: true, display_order: 28 },
    { name: 'Rawang', state: 'Selangor', district: 'Gombak', is_popular: true, display_order: 29 },
    { name: 'Sabak Bernam', state: 'Selangor', district: 'Sabak Bernam', is_popular: false, display_order: 30 },
    { name: 'Selayang', state: 'Selangor', district: 'Gombak', is_popular: true, display_order: 31 },
    { name: 'Semenyih', state: 'Selangor', district: 'Hulu Langat', is_popular: false, display_order: 32 },
    { name: 'Sepang', state: 'Selangor', district: 'Sepang', is_popular: false, display_order: 33 },
    { name: 'Seri Kembangan', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 34 },
    { name: 'Serendah', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 35 },
    { name: 'Shah Alam', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 36 },
    { name: 'SS2', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 37 },
    { name: 'Subang', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 38 },
    { name: 'Subang Jaya', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 39 },
    { name: 'Sunway', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 40 },
    { name: 'Ulu Yam', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 41 },
    { name: 'USJ (UEP Subang Jaya)', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 42 }
];

async function seedCities() {
    console.log('Seeding cities...');
    
    // Using upsert to prevent duplicates if the script is run again
    // It will match rows based on 'name' and 'state' and update them, or insert if they don't exist.
    const { data, error } = await supabase
        .from('cities')
        .upsert(citiesData, { onConflict: 'name,state' });

    if (error) {
        console.error('Error seeding cities:', error);
    } else {
        console.log('Successfully seeded cities:', data);
    }
}

seedCities();