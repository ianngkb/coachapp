"use client"

import { useState } from 'react'
import { Calendar, Users, Clock, CheckCircle, XCircle, Search, ChevronDown, RotateCcw, MessageSquare, Plus, Switch, Settings, User } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import Link from 'next/link'

// Mock data
const mockStats = {
  thisWeek: 12,
  activeStudents: 8
}

const mockSessions = [
  {
    id: 1,
    student: "David Kim",
    avatar: "DK",
    sport: "Tennis · Individual",
    date: "Oct 18, 2024",
    time: "10:00 (60min)",
    location: "Online",
    tag: "Strategy and mental game session",
    status: "upcoming" as const,
    price: "RM80"
  },
  {
    id: 2,
    student: "Marcus Johnson",
    avatar: "MJ",
    sport: "Tennis · Individual",
    date: "Oct 18, 2024",
    time: "14:30 (60min)",
    location: "Courts at Marina Bay",
    status: "upcoming" as const,
    price: "RM120"
  },
  {
    id: 3,
    student: "Sarah Chen",
    avatar: "SC",
    sport: "Tennis · Individual",
    date: "Oct 18, 2024",
    time: "16:00 (60min)",
    location: "Courts at Marina Bay",
    tag: "Focus on backhand technique",
    status: "upcoming" as const,
    price: "RM80"
  },
  {
    id: 4,
    student: "Emily Wong",
    avatar: "EW",
    sport: "Tennis · Individual",
    date: "Oct 14, 2024",
    time: "16:00 (60min)",
    location: "Court 5-6",
    status: "completed" as const,
    price: "RM80"
  },
  {
    id: 5,
    student: "Lisa Park",
    avatar: "LP",
    sport: "Tennis · Individual",
    date: "Oct 12, 2024",
    time: "10:00 (60min)",
    location: "Courts at Marina Bay",
    status: "cancelled" as const,
    price: "RM80"
  }
]

const mockBlockedPeriods = [
  {
    id: 1,
    title: "Family vacation",
    type: "Date range",
    dateRange: "Dec 20 – Dec 31, 2024"
  },
  {
    id: 2,
    title: "Annual checkup",
    type: "Single day",
    date: "Oct 15, 2024"
  }
]

type TabType = 'sessions' | 'schedule' | 'blocked'

const HeaderStats = () => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <div>
            <p className="text-sm text-gray-600">This Week</p>
            <p className="text-2xl font-semibold">{mockStats.thisWeek}</p>
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
            <p className="text-2xl font-semibold">{mockStats.activeStudents}</p>
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

const SessionsTab = () => {
  const upcomingSessions = mockSessions.filter(s => s.status === 'upcoming')
  const completedSessions = mockSessions.filter(s => s.status === 'completed')
  const totalEarned = mockSessions.filter(s => s.status === 'completed')
    .reduce((sum, session) => sum + parseInt(session.price.replace('RM', '')), 0)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="w-4 h-4 text-blue-500" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'upcoming': return `${baseClasses} bg-blue-100 text-blue-700`
      case 'completed': return `${baseClasses} bg-green-100 text-green-700`
      case 'cancelled': return `${baseClasses} bg-red-100 text-red-700`
      default: return baseClasses
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Booked Sessions</h2>
        <p className="text-gray-600 text-sm mb-4">Manage your upcoming and past sessions</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold text-blue-600">{upcomingSessions.length}</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold text-green-600">{completedSessions.length}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold text-gray-900">RM{totalEarned}</p>
              <p className="text-sm text-gray-600">Earned</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by student name or sport…"
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="justify-between min-w-[120px]">
              All Sessions <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="justify-between min-w-[120px]">
              <Calendar className="w-4 h-4 mr-2" />
              Filter by date <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {mockSessions.map((session) => (
          <Card key={session.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-medium text-sm">
                    {session.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{session.student}</h3>
                      <span className={getStatusBadge(session.status)}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{session.sport}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {session.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.time}
                      </span>
                      <span>{session.location}</span>
                    </div>
                    {session.tag && (
                      <p className="text-xs text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded inline-block">
                        {session.tag}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-semibold text-lg">{session.price}</span>
                  <div className="flex gap-2">
                    {session.status === 'upcoming' && (
                      <Button size="sm" variant="outline">
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reschedule
                      </Button>
                    )}
                    {(session.status === 'upcoming' || session.status === 'completed') && (
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        WhatsApp Student
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

const ScheduleTab = () => {
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Saturday', enabled: false, startTime: '', endTime: '' },
    { day: 'Sunday', enabled: false, startTime: '', endTime: '' }
  ])

  const toggleDay = (index: number) => {
    setWeeklySchedule(prev => prev.map((day, i) =>
      i === index
        ? { ...day, enabled: !day.enabled, startTime: !day.enabled ? '09:00' : '', endTime: !day.enabled ? '17:00' : '' }
        : day
    ))
  }

  const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setWeeklySchedule(prev => prev.map((day, i) =>
      i === index ? { ...day, [field]: value } : day
    ))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Google Calendar Integration</h3>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-xs text-gray-500">Last synced: 02:47 pm</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">Sync</Button>
              <Button size="sm" variant="outline">Disconnect</Button>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              Your calendar is being monitored for conflicts. Conflicting times are automatically blocked from new bookings.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <p className="font-medium text-red-800">Scheduling Conflicts Detected</p>
            </div>
            <div className="bg-white rounded p-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tennis Lesson with Sarah Chen</p>
                <p className="text-xs text-gray-600">15 Aug, 02:00 pm</p>
              </div>
              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                Conflict
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Weekly Availability</h3>
              <p className="text-sm text-gray-600">Set your available hours for each day</p>
            </div>
            <Button className="bg-black text-white">Save Changes</Button>
          </div>

          <div className="space-y-4">
            {weeklySchedule.map((day, index) => (
              <div key={day.day} className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDay(index)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      day.enabled ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        day.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="font-medium min-w-[100px]">{day.day}</span>
                </div>

                {day.enabled ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateTime(index, 'startTime', e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateTime(index, 'endTime', e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="w-3 h-3 mr-1" />
                      Add time slot
                    </Button>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const BlockedTab = () => {
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Blocked Dates</h2>
        <p className="text-gray-600 text-sm mb-6">Manage dates when you're unavailable</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Calendar Overview</h3>
            <Button className="bg-black text-white">
              <Plus className="w-4 h-4 mr-2" />
              Block Dates
            </Button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm">‹</Button>
              <h4 className="font-medium">{currentMonth}</h4>
              <Button variant="ghost" size="sm">›</Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              <div className="text-xs font-medium text-gray-500 p-2">Su</div>
              <div className="text-xs font-medium text-gray-500 p-2">Mo</div>
              <div className="text-xs font-medium text-gray-500 p-2">Tu</div>
              <div className="text-xs font-medium text-gray-500 p-2">We</div>
              <div className="text-xs font-medium text-gray-500 p-2">Th</div>
              <div className="text-xs font-medium text-gray-500 p-2">Fr</div>
              <div className="text-xs font-medium text-gray-500 p-2">Sa</div>

              {/* Generate calendar days */}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 5 // Start from appropriate day of month
                const isCurrentMonth = day > 0 && day <= 30
                const isBlocked = [15, 25, 26, 27, 28, 29, 30, 31].includes(day)

                return (
                  <div
                    key={i}
                    className={`p-2 text-sm ${
                      isCurrentMonth
                        ? isBlocked
                          ? 'bg-black text-white rounded'
                          : 'hover:bg-gray-200 cursor-pointer'
                        : 'text-gray-300'
                    }`}
                  >
                    {isCurrentMonth ? day : ''}
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              Blocked dates are shown in black
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Blocked Periods</h3>
          <div className="space-y-3">
            {mockBlockedPeriods.map((period) => (
              <div key={period.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <h4 className="font-medium">{period.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">{period.type}</span>
                      <span className="text-sm text-gray-600">
                        {period.dateRange || period.date}
                      </span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-500">
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CoachDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('sessions')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="base" className="h-8" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/coach-services"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Services
              </Link>
              <Link
                href="/coach-profile-edit"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">A</span>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Schedule</h1>
            <p className="text-gray-600">Manage your coaching business</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeaderStats />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'sessions' && <SessionsTab />}
        {activeTab === 'schedule' && <ScheduleTab />}
        {activeTab === 'blocked' && <BlockedTab />}
      </div>
    </div>
  )
}