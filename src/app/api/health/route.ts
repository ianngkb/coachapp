import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test database connectivity
    const { data: sports, error: sportsError } = await supabase
      .from('sports')
      .select('count')
      .limit(1)

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    const { data: coaches, error: coachesError } = await supabase
      .from('coach_directory')
      .select('count')
      .limit(1)

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        sports: sportsError ? 'error' : 'connected',
        users: usersError ? 'error' : 'connected',
        coach_directory: coachesError ? 'error' : 'connected'
      },
      errors: [sportsError, usersError, coachesError].filter(Boolean)
    }

    const isHealthy = !healthStatus.errors.length
    const statusCode = isHealthy ? 200 : 500

    return NextResponse.json(healthStatus, { status: statusCode })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}