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

// GET /api/courts - List all courts/venues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const isFeatured = searchParams.get('is_featured')
    const sport = searchParams.get('sport')

    console.log('🏟️ Fetching courts with filters:', { city, state, isFeatured, sport })

    let query = supabaseAdmin
      .from('courts')
      .select('*')
      .eq('is_active', true)
      // .order('is_featured', { ascending: false }) // is_featured column doesn't exist
      .order('name', { ascending: true })

    if (city) {
      query = query.eq('city', city)
    }
    if (state) {
      query = query.eq('state', state)
    }
    // Note: is_featured column doesn't exist in current schema, commenting out
    // if (isFeatured !== null) {
    //   query = query.eq('is_featured', isFeatured === 'true')
    // }
    if (sport) {
      query = query.contains('supported_sports', [sport])
    }

    const { data: courts, error } = await query

    if (error) {
      console.error('❌ Error fetching courts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Retrieved ${courts?.length || 0} courts`)
    return NextResponse.json({ courts })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}