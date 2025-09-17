"use client"

import { useState, useEffect } from 'react'
import { Calendar, Users, Clock, CheckCircle, XCircle, Search, ChevronDown, RotateCcw, MessageSquare, Plus, Switch, Settings, User } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// Types for database data
interface Session {
  id: string
  student_name: string
  service_name: string
  sport_name: string
  session_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  location_name: string
  status: string
  total_price_myr: number
  student_notes?: string
  booking_reference: string
}

interface Stats {
  thisWeek: number
  totalSessions: number
  activeStudents: number
  weeklyEarnings: number
}

type TabType = 'sessions' | 'schedule' | 'blocked'

// Format time for display
const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':')
  return `${hours}:${minutes}`
}

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-MY', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const HeaderStats = ({ stats, loading }: { stats: Stats; loading: boolean }) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <div>
            <p className="text-sm text-gray-600">This Week</p>
            <p className="text-2xl font-semibold">
              {loading ? '...' : stats.thisWeek}
            </p>
            <p className="text-xs text-gray-500">Booked sessions</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-600" />
          <div>
            <p className="text-sm text-gray-600">Students</p>
            <p className="text-2xl font-semibold">
              {loading ? '...' : stats.activeStudents}
            </p>
            <p className="text-xs text-gray-500">Active students</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

const TabNavigation = ({ activeTab, onTabChange }: {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}) => (
  <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
    <button
      onClick={() => onTabChange('sessions')}
      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
        activeTab === 'sessions'
          ? 'bg-black text-white'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <Users className="w-4 h-4 inline mr-2" />
      Sessions
    </button>
    <button
      onClick={() => onTabChange('schedule')}
      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
        activeTab === 'schedule'
          ? 'bg-black text-white'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <Clock className="w-4 h-4 inline mr-2" />
      Schedule
    </button>
    <button
      onClick={() => onTabChange('blocked')}
      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
        activeTab === 'blocked'
          ? 'bg-black text-white'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <XCircle className="w-4 h-4 inline mr-2" />
      Blocked
    </button>
  </div>
)

const SessionCard = ({ session }: { session: Session }) => {
  const getStatusIcon = () => {
    switch (session.status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-blue-600" />
    }
  }

  const getStatusColor = () => {
    switch (session.status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50'
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  const studentInitials = session.student_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">{studentInitials}</span>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-gray-900">{session.student_name}</h3>
                <p className="text-sm text-gray-600">{session.service_name} · {session.sport_name}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                  {session.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(session.session_date)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatTime(session.start_time)} ({session.duration_minutes}min)
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">RM{session.total_price_myr}</p>
                <p className="text-sm text-gray-600">{session.location_name}</p>
              </div>
            </div>

            {session.student_notes && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700">{session.student_notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">#{session.booking_reference}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 px-3">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Message
                </Button>
                {session.status === 'confirmed' && (
                  <Button size="sm" variant="outline" className="h-8 px-3">
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const EmptyState = ({ type }: { type: string }) => (
  <div className="text-center py-12">
    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No {type} found</h3>
    <p className="text-gray-600 mb-4">
      {type === 'sessions'
        ? "You don't have any sessions scheduled yet."
        : "Your schedule is flexible right now."}
    </p>
  </div>
)

const LoadingState = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((n) => (
      <Card key={n} className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

export default function CoachDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('sessions')
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<Stats>({
    thisWeek: 0,
    totalSessions: 0,
    activeStudents: 0,
    weeklyEarnings: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const user = await getCurrentUser()
      if (!user) {
        setError('Please sign in to view your dashboard')
        return
      }
      setCurrentUser(user)

      // Load sessions and stats
      await Promise.all([
        loadSessions(user.id),
        loadStats(user.id)
      ])
    } catch (err: any) {
      console.error('Error initializing dashboard:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const loadSessions = async (coachId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          student_id,
          session_date,
          start_time,
          end_time,
          duration_minutes,
          status,
          total_price_myr,
          student_notes,
          booking_reference,
          users!bookings_student_id_fkey (first_name, last_name),
          coach_services!inner (service_name, sports!inner (name)),
          courts (name)
        `)
        .eq('coach_id', coachId)
        .order('session_date', { ascending: false })
        .order('start_time', { ascending: false })

      if (error) throw error

      const formattedSessions: Session[] = (data || []).map(booking => ({
        id: booking.id,
        student_name: `${booking.users?.first_name || ''} ${booking.users?.last_name || ''}`.trim() || 'Unknown Student',
        service_name: booking.coach_services?.service_name || 'Unknown Service',
        sport_name: booking.coach_services?.sports?.name || 'Unknown Sport',
        session_date: booking.session_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        duration_minutes: booking.duration_minutes,
        location_name: booking.courts?.name || 'Unknown Location',
        status: booking.status,
        total_price_myr: booking.total_price_myr,
        student_notes: booking.student_notes,
        booking_reference: booking.booking_reference
      }))

      setSessions(formattedSessions)
    } catch (err: any) {
      console.error('Error loading sessions:', err)
      throw err
    }
  }

  const loadStats = async (coachId: string) => {
    try {
      // Get this week's sessions
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6)

      const { data: weekSessions, error: weekError } = await supabase
        .from('bookings')
        .select('*')
        .eq('coach_id', coachId)
        .gte('session_date', startOfWeek.toISOString().split('T')[0])
        .lte('session_date', endOfWeek.toISOString().split('T')[0])

      if (weekError) throw weekError

      // Get total sessions
      const { data: totalSessions, error: totalError } = await supabase
        .from('bookings')
        .select('*')
        .eq('coach_id', coachId)

      if (totalError) throw totalError

      // Get unique students
      const { data: students, error: studentsError } = await supabase
        .from('bookings')
        .select('student_id')
        .eq('coach_id', coachId)
        .eq('status', 'completed')

      if (studentsError) throw studentsError

      const uniqueStudents = new Set(students?.map(s => s.student_id) || []).size

      setStats({
        thisWeek: weekSessions?.length || 0,
        totalSessions: totalSessions?.length || 0,
        activeStudents: uniqueStudents,
        weeklyEarnings: weekSessions?.reduce((sum, session) => sum + session.total_price_myr, 0) || 0
      })
    } catch (err: any) {
      console.error('Error loading stats:', err)
      throw err
    }
  }

  const filteredSessions = sessions.filter(session => {
    switch (activeTab) {
      case 'sessions':
        return ['confirmed', 'completed'].includes(session.status)
      case 'schedule':
        return session.status === 'confirmed'
      case 'blocked':
        return session.status === 'cancelled'
      default:
        return true
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Coach Dashboard</h1>
              <p className="text-sm text-gray-600">
                {`${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'Loading...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/coach-services">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Services
              </Button>
            </Link>
            <Link href="/coach-profile-edit">
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        {/* Stats */}
        <HeaderStats stats={stats} loading={loading} />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="text-center">
              <h3 className="text-red-900 font-semibold mb-2">Error Loading Dashboard</h3>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <Button
                onClick={initializeData}
                className="bg-red-600 text-white hover:bg-red-700"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-xl p-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search sessions..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <ChevronDown className="w-4 h-4 mr-1" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={initializeData}
              disabled={loading}
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Session List */}
          {loading ? (
            <LoadingState />
          ) : filteredSessions.length === 0 ? (
            <EmptyState type={activeTab} />
          ) : (
            <div>
              {filteredSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}