import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({
        error: 'Email address is required'
      }, { status: 400 })
    }

    console.log('📧 Resending verification email for:', email)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })

    if (error) {
      console.error('❌ Resend verification error:', error)
      return NextResponse.json({
        error: error.message
      }, { status: 400 })
    }

    console.log('✅ Verification email resent successfully')

    return NextResponse.json({
      message: 'Verification email sent successfully'
    })

  } catch (error) {
    console.error('❌ Resend verification error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}