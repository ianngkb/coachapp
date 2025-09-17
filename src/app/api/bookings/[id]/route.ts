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

// GET /api/bookings/[id] - Get specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('📋 Fetching booking:', id)

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        student:student_id(id, first_name, last_name, email, phone_number),
        coach:coach_id(id, first_name, last_name, email),
        service:service_id(service_name, duration_minutes, price_myr),
        court:court_id(name, address, city, state)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Error fetching booking:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    console.log(`✅ Retrieved booking: ${booking.booking_reference}`)
    return NextResponse.json({ booking })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// PUT /api/bookings/[id] - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, coach_notes, cancellation_reason } = body

    console.log('🔄 Updating booking:', id, { status, coach_notes })

    // Check if booking exists
    const { data: existingBooking, error: checkError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (checkError || !existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (status !== undefined) {
      updateData.status = status

      // Set timestamps based on status
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString()
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString()
        updateData.cancellation_reason = cancellation_reason || 'No reason provided'
      }
    }

    if (coach_notes !== undefined) {
      updateData.coach_notes = coach_notes
    }

    // Update booking
    const { data: booking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        student:student_id(id, first_name, last_name, email),
        coach:coach_id(id, first_name, last_name, email),
        service:service_id(service_name, duration_minutes),
        court:court_id(name, address, city)
      `)
      .single()

    if (updateError) {
      console.error('❌ Error updating booking:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log(`✅ Booking updated successfully: ${booking.booking_reference}`)
    return NextResponse.json({
      message: 'Booking updated successfully',
      booking
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// DELETE /api/bookings/[id] - Cancel/Delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason') || 'Deleted by user'

    console.log('🗑️ Cancelling booking:', id)

    // Check if booking exists
    const { data: existingBooking, error: checkError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (checkError || !existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if booking can be cancelled
    if (existingBooking.status === 'completed') {
      return NextResponse.json({
        error: 'Cannot cancel completed bookings'
      }, { status: 400 })
    }

    // Mark as cancelled instead of deleting
    const { data: booking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('❌ Error cancelling booking:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log(`✅ Booking cancelled successfully: ${booking.booking_reference}`)
    return NextResponse.json({
      message: 'Booking cancelled successfully',
      booking
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}