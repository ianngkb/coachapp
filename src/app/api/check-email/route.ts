import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('🔍 Checking email exists:', email)

    // Use service role client to bypass RLS for user lookup
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

    // Check if email exists in users table
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    console.log('📊 Query result:', { data, error })

    const exists = !!data && !error
    console.log('✅ Email exists:', exists)

    return NextResponse.json({ exists })
  } catch (error) {
    console.error('❌ Check email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}