import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// GET /api/bookings - List bookings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')
    const coachId = searchParams.get('coach_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('📋 Fetching bookings with filters:', { studentId, coachId, status, limit })

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        student:student_id(id, first_name, last_name, email, phone_number),
        coach:coach_id(id, first_name, last_name, email),
        service:service_id(service_name, duration_minutes, price_myr),
        court:court_id(name, address, city)
      `)
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit)

    if (studentId) {
      query = query.eq('student_id', studentId)
    }
    if (coachId) {
      query = query.eq('coach_id', coachId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: bookings, error } = await query

    if (error) {
      console.error('❌ Error fetching bookings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Retrieved ${bookings?.length || 0} bookings`)
    return NextResponse.json({ bookings })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      student_id,
      coach_id,
      service_id,
      court_id,
      session_date,
      start_time,
      duration_minutes,
      student_phone,
      student_notes
    } = body

    console.log('📝 Creating booking:', { student_id, coach_id, service_id, session_date, start_time })

    // Validate required fields
    if (!student_id || !coach_id || !service_id || !court_id || !session_date || !start_time || !duration_minutes) {
      return NextResponse.json({
        error: 'Missing required fields: student_id, coach_id, service_id, court_id, session_date, start_time, duration_minutes'
      }, { status: 400 })
    }

    // Get service details for pricing
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('coach_services')
      .select('*')
      .eq('id', service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Calculate end time
    const startDateTime = new Date(`${session_date}T${start_time}`)
    const endDateTime = new Date(startDateTime.getTime() + duration_minutes * 60000)
    const end_time = endDateTime.toTimeString().slice(0, 8)

    // Check for booking conflicts
    const { data: conflictingBookings, error: conflictError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('coach_id', coach_id)
      .eq('session_date', session_date)
      .eq('status', 'confirmed')
      .or(`start_time.lte.${start_time},start_time.lt.${end_time}`)
      .or(`end_time.gt.${start_time},end_time.gte.${end_time}`)

    if (conflictError) {
      console.error('❌ Error checking conflicts:', conflictError)
      return NextResponse.json({ error: 'Error checking booking conflicts' }, { status: 500 })
    }

    if (conflictingBookings && conflictingBookings.length > 0) {
      return NextResponse.json({
        error: 'Time slot is already booked for this coach'
      }, { status: 409 })
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        student_id,
        coach_id,
        service_id,
        court_id,
        session_date,
        start_time,
        end_time,
        duration_minutes,
        service_price_myr: service.price_myr,
        travel_fee_myr: 0.00,
        total_price_myr: service.price_myr,
        status: 'pending',
        student_phone,
        student_notes
      })
      .select(`
        *,
        student:student_id(id, first_name, last_name, email),
        coach:coach_id(id, first_name, last_name, email),
        service:service_id(service_name, duration_minutes),
        court:court_id(name, address, city)
      `)
      .single()

    if (bookingError) {
      console.error('❌ Error creating booking:', bookingError)
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }

    console.log(`✅ Booking created successfully: ${booking.booking_reference}`)
    return NextResponse.json({
      message: 'Booking created successfully',
      booking
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}