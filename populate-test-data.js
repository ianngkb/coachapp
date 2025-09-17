import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function populateTestData() {
  console.log('🌱 Populating test data...')

  try {
    // 1. Create Sports
    console.log('\n🏅 Creating sports...')
    const sportsData = [
      { name: 'Tennis', description: 'Racket sport played on a court', category: 'Racket Sports', equipment_required: ['Racket', 'Tennis balls'], typical_duration_minutes: 60, is_popular: true, display_order: 1 },
      { name: 'Swimming', description: 'Aquatic sport and exercise', category: 'Water Sports', equipment_required: ['Swimwear', 'Goggles'], typical_duration_minutes: 45, is_popular: true, display_order: 2 },
      { name: 'Basketball', description: 'Team sport played on a court', category: 'Team Sports', equipment_required: ['Basketball'], typical_duration_minutes: 90, is_popular: true, display_order: 3 },
      { name: 'Football', description: 'Team sport played with feet', category: 'Team Sports', equipment_required: ['Football', 'Boots'], typical_duration_minutes: 90, is_popular: true, display_order: 4 },
      { name: 'Badminton', description: 'Racket sport with shuttlecock', category: 'Racket Sports', equipment_required: ['Racket', 'Shuttlecock'], typical_duration_minutes: 45, is_popular: true, display_order: 5 }
    ]

    const { data: sports, error: sportsError } = await supabase
      .from('sports')
      .upsert(sportsData)
      .select()

    if (sportsError) throw sportsError
    console.log(`✅ Created ${sports.length} sports`)

    // 2. Create Courts
    console.log('\n🏟️ Creating courts...')

    // Get some cities first
    const { data: cities } = await supabase
      .from('cities')
      .select('id, name, state')
      .limit(5)

    const courtsData = [
      {
        name: 'KL Sports Complex',
        description: 'Multi-sport facility in the heart of KL',
        address: 'Jalan Sports, Kuala Lumpur',
        city_id: cities[0].id,
        supported_sports: ['Tennis', 'Basketball', 'Badminton'],
        amenities: ['Parking', 'Changing Rooms', 'Cafe'],
        operating_hours: { weekdays: '06:00-22:00', weekends: '07:00-21:00' },
        pricing_info: { hourly_rate: 50, peak_surcharge: 20 },
        is_featured: true,
        is_active: true
      },
      {
        name: 'Olympic Swimming Pool',
        description: 'Professional swimming facility',
        address: 'Jalan Aquatic, Petaling Jaya',
        city_id: cities[1].id,
        supported_sports: ['Swimming'],
        amenities: ['Parking', 'Lockers', 'Shower'],
        operating_hours: { weekdays: '05:00-23:00', weekends: '06:00-22:00' },
        pricing_info: { hourly_rate: 30, peak_surcharge: 10 },
        is_featured: true,
        is_active: true
      },
      {
        name: 'Shah Alam Tennis Centre',
        description: 'Premier tennis courts in Shah Alam',
        address: 'Seksyen 7, Shah Alam',
        city_id: cities[2].id,
        supported_sports: ['Tennis'],
        amenities: ['Parking', 'Pro Shop', 'Refreshments'],
        operating_hours: { weekdays: '06:00-22:00', weekends: '07:00-21:00' },
        pricing_info: { hourly_rate: 60, peak_surcharge: 25 },
        is_featured: false,
        is_active: true
      }
    ]

    const { data: courts, error: courtsError } = await supabase
      .from('courts')
      .upsert(courtsData)
      .select()

    if (courtsError) throw courtsError
    console.log(`✅ Created ${courts.length} courts`)

    // 3. Create Test Users
    console.log('\n👥 Creating test users...')
    const usersData = [
      {
        email: 'john.coach@example.com',
        first_name: 'John',
        last_name: 'Tan',
        user_type: 'coach',
        phone_number: '+60123456789',
        city_id: cities[0].id,
        is_verified: true,
        is_active: true
      },
      {
        email: 'sarah.coach@example.com',
        first_name: 'Sarah',
        last_name: 'Lim',
        user_type: 'coach',
        phone_number: '+60123456790',
        city_id: cities[1].id,
        is_verified: true,
        is_active: true
      },
      {
        email: 'mike.student@example.com',
        first_name: 'Mike',
        last_name: 'Wong',
        user_type: 'student',
        phone_number: '+60123456791',
        city_id: cities[0].id,
        is_verified: true,
        is_active: true
      }
    ]

    const { data: users, error: usersError } = await supabase
      .from('users')
      .upsert(usersData)
      .select()

    if (usersError) throw usersError
    console.log(`✅ Created ${users.length} users`)

    // 4. Create Coach Profiles
    console.log('\n🏆 Creating coach profiles...')
    const coachUsers = users.filter(u => u.user_type === 'coach')

    const coachProfilesData = [
      {
        user_id: coachUsers[0].id,
        business_name: 'John Tan Tennis Academy',
        bio: 'Professional tennis coach with 10+ years experience. Specialized in beginner to intermediate training.',
        tagline: 'Ace Your Game with Professional Tennis Coaching',
        short_bio: 'Former national player turned professional coach',
        years_experience: 12,
        certifications: ['ITF Level 2', 'Sports Science Degree'],
        specializations: ['Tennis Fundamentals', 'Match Strategy', 'Youth Development'],
        rating_average: 4.8,
        rating_count: 24,
        total_sessions_completed: 150,
        base_hourly_rate: 80,
        is_featured: true,
        is_available: true,
        listing_status: 'active',
        whatsapp_number: '+60123456789',
        instagram_handle: '@johntan_tennis'
      },
      {
        user_id: coachUsers[1].id,
        business_name: 'AquaFit Swimming School',
        bio: 'Certified swimming instructor helping students of all ages master water confidence and technique.',
        tagline: 'Dive into Excellence - Learn Swimming the Right Way',
        short_bio: 'Olympic training background with child-friendly approach',
        years_experience: 8,
        certifications: ['PADI Open Water', 'Swimming Australia Level 2'],
        specializations: ['Learn to Swim', 'Stroke Correction', 'Water Safety'],
        rating_average: 4.9,
        rating_count: 18,
        total_sessions_completed: 95,
        base_hourly_rate: 70,
        is_featured: true,
        is_available: true,
        listing_status: 'active',
        whatsapp_number: '+60123456790',
        website_url: 'https://aquafit.my'
      }
    ]

    const { data: coachProfiles, error: coachProfilesError } = await supabase
      .from('coach_profiles')
      .upsert(coachProfilesData)
      .select()

    if (coachProfilesError) throw coachProfilesError
    console.log(`✅ Created ${coachProfiles.length} coach profiles`)

    // 5. Create Coach-Sport Relationships
    console.log('\n🤝 Creating coach-sport relationships...')
    const tennisId = sports.find(s => s.name === 'Tennis').id
    const swimmingId = sports.find(s => s.name === 'Swimming').id
    const badmintonId = sports.find(s => s.name === 'Badminton').id

    const coachSportsData = [
      { coach_id: coachUsers[0].id, sport_id: tennisId },
      { coach_id: coachUsers[0].id, sport_id: badmintonId },
      { coach_id: coachUsers[1].id, sport_id: swimmingId }
    ]

    const { data: coachSports, error: coachSportsError } = await supabase
      .from('coach_sports')
      .upsert(coachSportsData)
      .select()

    if (coachSportsError) throw coachSportsError
    console.log(`✅ Created ${coachSports.length} coach-sport relationships`)

    // 6. Create Coach-Language Relationships
    console.log('\n🗣️ Creating coach-language relationships...')
    const coachLanguagesData = [
      { coach_id: coachUsers[0].id, language_code: 'en' },
      { coach_id: coachUsers[0].id, language_code: 'ms' },
      { coach_id: coachUsers[1].id, language_code: 'en' },
      { coach_id: coachUsers[1].id, language_code: 'zh' }
    ]

    const { data: coachLanguages, error: coachLanguagesError } = await supabase
      .from('coach_languages')
      .upsert(coachLanguagesData)
      .select()

    if (coachLanguagesError) throw coachLanguagesError
    console.log(`✅ Created ${coachLanguages.length} coach-language relationships`)

    // 7. Create Coach Services
    console.log('\n💼 Creating coach services...')
    const servicesData = [
      {
        coach_id: coachUsers[0].id,
        sport_id: tennisId,
        service_name: 'Beginner Tennis Lessons',
        description: 'Perfect for those new to tennis. Learn basic strokes, footwork, and court positioning.',
        duration_minutes: 60,
        price_myr: 80,
        max_participants: 1,
        skill_levels: ['Beginner'],
        included_equipment: ['Racket rental available'],
        location_types: ['Indoor court', 'Outdoor court'],
        min_advance_booking_hours: 4,
        max_advance_booking_days: 30,
        cancellation_policy: '24-hour cancellation required for full refund',
        is_active: true
      },
      {
        coach_id: coachUsers[0].id,
        sport_id: tennisId,
        service_name: 'Advanced Tennis Coaching',
        description: 'Intensive coaching for competitive players focusing on match tactics and advanced techniques.',
        duration_minutes: 90,
        price_myr: 120,
        max_participants: 1,
        skill_levels: ['Intermediate', 'Advanced'],
        included_equipment: ['Video analysis'],
        location_types: ['Indoor court'],
        min_advance_booking_hours: 8,
        max_advance_booking_days: 30,
        cancellation_policy: '48-hour cancellation required for full refund',
        is_active: true
      },
      {
        coach_id: coachUsers[1].id,
        sport_id: swimmingId,
        service_name: 'Learn to Swim - Adults',
        description: 'Adult swimming lessons for beginners. Build water confidence and learn basic strokes.',
        duration_minutes: 45,
        price_myr: 70,
        max_participants: 1,
        skill_levels: ['Beginner'],
        included_equipment: ['Pool access', 'Kickboard'],
        location_types: ['Swimming pool'],
        min_advance_booking_hours: 6,
        max_advance_booking_days: 21,
        cancellation_policy: '12-hour cancellation required for full refund',
        is_active: true
      }
    ]

    const { data: services, error: servicesError } = await supabase
      .from('coach_services')
      .upsert(servicesData)
      .select()

    if (servicesError) throw servicesError
    console.log(`✅ Created ${services.length} coach services`)

    // 8. Create Sample Bookings
    console.log('\n📅 Creating sample bookings...')
    const studentUser = users.find(u => u.user_type === 'student')

    const bookingsData = [
      {
        student_id: studentUser.id,
        coach_id: coachUsers[0].id,
        service_id: services[0].id,
        court_id: courts[0].id,
        session_date: '2025-01-20',
        start_time: '10:00:00',
        end_time: '11:00:00',
        duration_minutes: 60,
        service_price_myr: 80,
        travel_fee_myr: 0,
        total_price_myr: 80,
        status: 'confirmed',
        student_phone: '+60123456791',
        student_notes: 'First time playing tennis, looking forward to learning!'
      },
      {
        student_id: studentUser.id,
        coach_id: coachUsers[1].id,
        service_id: services[2].id,
        court_id: courts[1].id,
        session_date: '2025-01-22',
        start_time: '14:00:00',
        end_time: '14:45:00',
        duration_minutes: 45,
        service_price_myr: 70,
        travel_fee_myr: 0,
        total_price_myr: 70,
        status: 'pending',
        student_phone: '+60123456791',
        student_notes: 'Complete beginner, need to overcome fear of water'
      }
    ]

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .upsert(bookingsData)
      .select()

    if (bookingsError) throw bookingsError
    console.log(`✅ Created ${bookings.length} bookings`)

    console.log('\n🎉 Test data population complete!')
    console.log('\n📊 Summary:')
    console.log(`   Sports: ${sports.length}`)
    console.log(`   Courts: ${courts.length}`)
    console.log(`   Users: ${users.length}`)
    console.log(`   Coach Profiles: ${coachProfiles.length}`)
    console.log(`   Coach Services: ${services.length}`)
    console.log(`   Bookings: ${bookings.length}`)

  } catch (error) {
    console.error('❌ Error populating test data:', error)
  }
}

populateTestData()