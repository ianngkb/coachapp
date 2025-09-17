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

// GET /api/coach-services/[id] - Get specific coach service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('🏃 Fetching coach service:', id)

    const { data: service, error } = await supabaseAdmin
      .from('coach_services')
      .select(`
        *,
        coach:coach_id(id, first_name, last_name, email),
        sport:sport_id(id, name, description, icon, equipment_required)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Error fetching coach service:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!service) {
      return NextResponse.json({ error: 'Coach service not found' }, { status: 404 })
    }

    console.log(`✅ Retrieved coach service: ${service.service_name}`)
    return NextResponse.json({ service })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// PUT /api/coach-services/[id] - Update coach service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    console.log('🔄 Updating coach service:', id)

    // Check if service exists
    const { data: existingService, error: checkError } = await supabaseAdmin
      .from('coach_services')
      .select('*')
      .eq('id', id)
      .single()

    if (checkError || !existingService) {
      return NextResponse.json({ error: 'Coach service not found' }, { status: 404 })
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {}
    const allowedFields = [
      'service_name', 'description', 'duration_minutes', 'price_myr',
      'max_participants', 'skill_levels', 'included_equipment', 'location_types',
      'buffer_time_before', 'buffer_time_after', 'min_advance_booking_hours',
      'max_advance_booking_days', 'cancellation_policy', 'is_active'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        error: 'No valid fields provided for update'
      }, { status: 400 })
    }

    // Update the service
    const { data: service, error: updateError } = await supabaseAdmin
      .from('coach_services')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        coach:coach_id(id, first_name, last_name, email),
        sport:sport_id(id, name, description)
      `)
      .single()

    if (updateError) {
      console.error('❌ Error updating coach service:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log(`✅ Coach service updated successfully: ${service.service_name}`)
    return NextResponse.json({
      message: 'Coach service updated successfully',
      service
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// DELETE /api/coach-services/[id] - Delete coach service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('🗑️ Deleting coach service:', id)

    // Check if service exists
    const { data: existingService, error: checkError } = await supabaseAdmin
      .from('coach_services')
      .select('*')
      .eq('id', id)
      .single()

    if (checkError || !existingService) {
      return NextResponse.json({ error: 'Coach service not found' }, { status: 404 })
    }

    // Check if service has any active bookings
    const { data: activeBookings, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('service_id', id)
      .in('status', ['pending', 'confirmed'])

    if (bookingError) {
      console.error('❌ Error checking active bookings:', bookingError)
      return NextResponse.json({ error: 'Error checking active bookings' }, { status: 500 })
    }

    if (activeBookings && activeBookings.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete service with active bookings. Please cancel or complete all bookings first.'
      }, { status: 400 })
    }

    // Mark as inactive instead of hard delete to preserve booking history
    const { data: service, error: updateError } = await supabaseAdmin
      .from('coach_services')
      .update({ is_active: false })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('❌ Error deactivating coach service:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log(`✅ Coach service deactivated successfully: ${service.service_name}`)
    return NextResponse.json({
      message: 'Coach service deactivated successfully',
      service
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}