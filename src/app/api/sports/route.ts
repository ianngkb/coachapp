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

// GET /api/sports - List all sports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isPopular = searchParams.get('is_popular')
    const category = searchParams.get('category')

    console.log('⚽ Fetching sports with filters:', { isPopular, category })

    let query = supabaseAdmin
      .from('sports')
      .select('*')
      .order('display_order', { ascending: true })

    if (isPopular !== null) {
      query = query.eq('is_popular', isPopular === 'true')
    }
    if (category) {
      query = query.eq('category', category)
    }

    const { data: sports, error } = await query

    if (error) {
      console.error('❌ Error fetching sports:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Retrieved ${sports?.length || 0} sports`)
    return NextResponse.json({ sports })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}