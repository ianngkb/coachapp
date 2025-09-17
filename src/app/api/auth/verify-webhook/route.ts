import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key
function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Webhook received for email verification')

    // Parse the webhook payload
    const payload = await request.json()
    console.log('📋 Webhook payload:', payload)

    // Validate webhook signature (optional but recommended)
    // const signature = request.headers.get('authorization')
    // if (!isValidSignature(payload, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    // Extract relevant data from the webhook
    const { type, record } = payload

    // Only process user confirmation events
    if (type !== 'USER' || !record?.email_confirmed_at) {
      console.log('ℹ️ Ignoring non-confirmation webhook:', type)
      return NextResponse.json({ message: 'Webhook ignored' })
    }

    const { id: userId, email, email_confirmed_at } = record

    if (!userId || !email || !email_confirmed_at) {
      console.log('❌ Missing required fields in webhook payload')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('✅ Processing email confirmation for:', { userId, email })

    // Create Supabase admin client
    const supabaseAdmin = createSupabaseAdmin()

    // Call the verification function
    const { error: verifyError } = await supabaseAdmin
      .rpc('verify_user_email', {
        user_id: userId,
        user_email: email
      })

    if (verifyError) {
      console.error('❌ Error verifying user email:', verifyError)
      return NextResponse.json(
        { error: 'Failed to verify user email' },
        { status: 500 }
      )
    }

    console.log('✅ User email verified successfully:', email)

    return NextResponse.json({
      message: 'Email verified successfully',
      userId,
      email
    })

  } catch (error) {
    console.error('💥 Webhook verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: Add signature validation function
// function isValidSignature(payload: any, signature: string | null): boolean {
//   if (!signature) return false
//
//   const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET
//   if (!webhookSecret) return false
//
//   // Implement HMAC signature validation
//   // This is specific to your webhook configuration
//   return true
// }