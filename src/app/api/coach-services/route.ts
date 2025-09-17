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

// GET /api/coach-services - List coach services with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coachId = searchParams.get('coach_id')
    const sportId = searchParams.get('sport_id')
    const isActive = searchParams.get('is_active')
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('🏃 Fetching coach services with filters:', { coachId, sportId, isActive, limit })

    let query = supabaseAdmin
      .from('coach_services')
      .select(`
        *,
        coach:coach_id(id, first_name, last_name, email),
        sport:sport_id(*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (coachId) {
      query = query.eq('coach_id', coachId)
    }
    if (sportId) {
      query = query.eq('sport_id', sportId)
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: services, error } = await query

    if (error) {
      console.error('❌ Error fetching coach services:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Retrieved ${services?.length || 0} coach services`)
    return NextResponse.json({ services })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// POST /api/coach-services - Create new coach service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      coach_id,
      sport_id,
      service_name,
      description,
      duration_minutes,
      price_myr,
      max_participants,
      skill_levels,
      included_equipment,
      location_types,
      buffer_time_before,
      buffer_time_after,
      min_advance_booking_hours,
      max_advance_booking_days,
      cancellation_policy
    } = body

    console.log('🆕 Creating coach service:', { coach_id, service_name, sport_id })

    // Validate required fields
    if (!coach_id || !sport_id || !service_name || !description || !duration_minutes || !price_myr) {
      return NextResponse.json({
        error: 'Missing required fields: coach_id, sport_id, service_name, description, duration_minutes, price_myr'
      }, { status: 400 })
    }

    // Verify coach exists
    const { data: coach, error: coachError } = await supabaseAdmin
      .from('users')
      .select('id, user_type')
      .eq('id', coach_id)
      .eq('user_type', 'coach')
      .single()

    if (coachError || !coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 })
    }

    // Verify sport exists
    const { data: sport, error: sportError } = await supabaseAdmin
      .from('sports')
      .select('id, name')
      .eq('id', sport_id)
      .single()

    if (sportError || !sport) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 })
    }

    // Create service
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('coach_services')
      .insert({
        coach_id,
        sport_id,
        service_name,
        description,
        duration_minutes,
        price_myr,
        max_participants: max_participants || 1,
        skill_levels: skill_levels || [],
        included_equipment: included_equipment || [],
        location_types: location_types || [],
        buffer_time_before: buffer_time_before || 0,
        buffer_time_after: buffer_time_after || 0,
        min_advance_booking_hours: min_advance_booking_hours || 2,
        max_advance_booking_days: max_advance_booking_days || 30,
        cancellation_policy: cancellation_policy || 'Standard cancellation policy',
        is_active: true
      })
      .select(`
        *,
        coach:coach_id(id, first_name, last_name, email),
        sport:sport_id(*)
      `)
      .single()

    if (serviceError) {
      console.error('❌ Error creating coach service:', serviceError)
      return NextResponse.json({ error: serviceError.message }, { status: 500 })
    }

    console.log(`✅ Coach service created successfully: ${service.service_name}`)
    return NextResponse.json({
      message: 'Coach service created successfully',
      service
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}