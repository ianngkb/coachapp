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

// GET /api/coach-profiles - List coach profiles (public directory)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const isAvailable = searchParams.get('is_available')
    const isFeatured = searchParams.get('is_featured')
    const listingStatus = searchParams.get('listing_status') || 'active'
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('👥 Fetching coach profiles with filters:', { email, isAvailable, isFeatured, listingStatus, limit })

    let query = supabaseAdmin
      .from('coach_profiles')
      .select(`
        *,
        user:user_id(id, first_name, last_name, email, phone_number, location_state, location_city, profile_image_url)
      `)
      .eq('listing_status', listingStatus)
      .order('is_featured', { ascending: false })
      .order('rating_average', { ascending: false })
      .limit(limit)

    // If searching by email, find user first then get their coach profile
    if (email) {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .eq('user_type', 'coach')
        .single()

      if (userError || !user) {
        return NextResponse.json({ profiles: [] })
      }

      query = query.eq('user_id', user.id)
    }

    if (isAvailable !== null) {
      query = query.eq('is_available', isAvailable === 'true')
    }
    if (isFeatured !== null) {
      query = query.eq('is_featured', isFeatured === 'true')
    }

    const { data: profiles, error } = await query

    if (error) {
      console.error('❌ Error fetching coach profiles:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Retrieved ${profiles?.length || 0} coach profiles`)
    return NextResponse.json({ profiles })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// POST /api/coach-profiles - Create new coach profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      business_name,
      bio,
      years_experience,
      certifications,
      specializations,
      languages_spoken,
      whatsapp_number,
      instagram_handle,
      website_url
    } = body

    console.log('👨‍🏫 Creating coach profile for user:', user_id)

    // Validate required fields
    if (!user_id || !bio) {
      return NextResponse.json({
        error: 'Missing required fields: user_id, bio'
      }, { status: 400 })
    }

    // Verify user exists and is a coach
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, user_type, first_name, last_name, email')
      .eq('id', user_id)
      .eq('user_type', 'coach')
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'Coach user not found' }, { status: 404 })
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('coach_profiles')
      .select('user_id')
      .eq('user_id', user_id)
      .single()

    if (existingProfile) {
      return NextResponse.json({
        error: 'Coach profile already exists for this user'
      }, { status: 400 })
    }

    // Create coach profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('coach_profiles')
      .insert({
        user_id,
        business_name: business_name || null,
        bio,
        years_experience: years_experience || 0,
        certifications: certifications || [],
        specializations: specializations || [],
        languages_spoken: languages_spoken || ['English'],
        whatsapp_number: whatsapp_number || null,
        instagram_handle: instagram_handle || null,
        website_url: website_url || null,
        is_available: true,
        listing_status: 'active'
      })
      .select(`
        *,
        user:user_id(id, first_name, last_name, email, phone_number)
      `)
      .single()

    if (profileError) {
      console.error('❌ Error creating coach profile:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    console.log(`✅ Coach profile created successfully for: ${user.first_name} ${user.last_name}`)
    return NextResponse.json({
      message: 'Coach profile created successfully',
      profile
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}