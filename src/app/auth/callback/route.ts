import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      console.log('🔐 Processing email verification callback with code')

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Email verification error:', error)
        // Redirect to error page or signin with error message
        return NextResponse.redirect(
          new URL(`/signin?error=verification_failed&message=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }

      if (data.user) {
        console.log('✅ Email verified successfully for user:', data.user.id)

        // Update user verification status in our custom users table
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

        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            is_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id)

        if (updateError) {
          console.error('❌ Error updating user verification status:', updateError)
          // Don't fail the verification, just log the error
        } else {
          console.log('✅ User verification status updated in database')
        }

        // Redirect to dashboard (homepage) on successful verification
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      }
    } catch (error) {
      console.error('❌ Callback processing error:', error)
      return NextResponse.redirect(
        new URL(`/signin?error=verification_failed&message=An unexpected error occurred`, requestUrl.origin)
      )
    }
  }

  // If no code or verification failed, redirect to signin
  console.log('❌ No verification code found in callback')
  return NextResponse.redirect(
    new URL('/signin?error=verification_failed&message=Invalid verification link', requestUrl.origin)
  )
}