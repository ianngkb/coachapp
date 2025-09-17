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

// GET /api/coach-profiles/[id] - Get specific coach profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('👨‍🏫 Fetching coach profile:', id)

    // Fetch the coach's profile with their user details
    const { data: profile, error } = await supabaseAdmin
      .from('coach_profiles')
      .select(`
        *,
        user:user_id(id, first_name, last_name, email, phone_number, profile_image_url)
      `)
      .eq('user_id', id)
      .single()

    if (error) {
      console.error('❌ Error fetching coach profile:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 })
    }

    console.log(`✅ Retrieved coach profile: ${profile.user?.first_name} ${profile.user?.last_name}`)
    return NextResponse.json(profile)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// PUT /api/coach-profiles/[id] - Update coach profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    console.log('🔄 Updating coach profile:', id)

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('coach_profiles')
      .select('*')
      .eq('user_id', id)
      .single()

    if (checkError || !existingProfile) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 })
    }

    // Prepare update data (only include provided fields)
    const updateData: any = {}
    const allowedFields = [
      'business_name', 'bio', 'years_experience', 'certifications',
      'specializations', 'languages_spoken', 'is_available', 'listing_status',
      'whatsapp_number', 'instagram_handle', 'website_url'
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

    // Update the coach's profile and user data
    const { data: profile, error: updateError } = await supabaseAdmin
      .from('coach_profiles')
      .update(updateData)
      .eq('user_id', id)
      .select(`
        *,
        user:user_id(id, first_name, last_name, email, phone_number)
      `)
      .single()

    if (updateError) {
      console.error('❌ Error updating coach profile:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log(`✅ Coach profile updated successfully: ${profile.user?.first_name} ${profile.user?.last_name}`)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// DELETE /api/coach-profiles/[id] - Deactivate coach profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('🗑️ Deactivating coach profile:', id)

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('coach_profiles')
      .select('*')
      .eq('user_id', id)
      .single()

    if (checkError || !existingProfile) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 })
    }

    // Check if coach has any active bookings
    const { data: activeBookings, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('coach_id', id)
      .in('status', ['pending', 'confirmed'])

    if (bookingError) {
      console.error('❌ Error checking active bookings:', bookingError)
      return NextResponse.json({ error: 'Error checking active bookings' }, { status: 500 })
    }

    if (activeBookings && activeBookings.length > 0) {
      return NextResponse.json({
        error: 'Cannot deactivate profile with active bookings. Please cancel or complete all bookings first.'
      }, { status: 400 })
    }

    // Deactivate profile instead of hard delete
    const { data: profile, error: updateError } = await supabaseAdmin
      .from('coach_profiles')
      .update({ listing_status: 'inactive' })
      .eq('user_id', id)
      .select(`
        *,
        user:user_id(id, first_name, last_name, email)
      `)
      .single()

    if (updateError) {
      console.error('❌ Error deactivating coach profile:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log(`✅ Coach profile deactivated successfully: ${profile.user?.first_name} ${profile.user?.last_name}`)
    return NextResponse.json({ message: 'Coach profile deactivated' })
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}