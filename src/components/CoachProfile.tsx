"use client"

import { ArrowLeft, Star, Clock, MapPin, Dumbbell, Brain, Check, User, ChevronLeft, ChevronRight, MessageSquare, Calendar, Phone } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Button } from './ui/button'

// New state management imports
import { useCoachProfile, useCourts } from '@/hooks/queries/useCoaches'
import { useCreateBooking } from '@/hooks/queries/useBookings'
import { useBookingStore } from '@/store/booking-store'
import { useUIStore } from '@/store/ui-store'
import { useAuth } from '@/hooks/useAuth'

interface CoachProfileProps {
  coachId?: string
}

// Helper function to get full name from user object
const getFullName = (user: { first_name?: string; last_name?: string }): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }
  return user.first_name || user.last_name || 'Unknown User'
}

function getUserName(user: { first_name?: string; last_name?: string } | null) {
  if (!user) return 'Unknown User'
  return `${user.first_name || ''} ${user.last_name || ''}`.trim()
}

const CoachProfile = ({ coachId = "john.coach@example.com" }: CoachProfileProps) => {
  const router = useRouter()
  const { user: currentUser } = useAuth()

  // TanStack Query hooks
  const { data: coachData, isLoading, error, refetch } = useCoachProfile(coachId)
  const { data: courts } = useCourts()

  // Booking mutation
  const createBookingMutation = useCreateBooking()

  // Zustand stores
  const {
    selectedService,
    selectedDate,
    selectedTime,
    selectedCourt,
    notes,
    startBookingFlow,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setSelectedCourt,
    setNotes,
    clearBookingFlow,
    getBookingData,
  } = useBookingStore()

  const {
    isBookingModalOpen,
    openBookingModal,
    closeBookingModal,
  } = useUIStore()

  // Local state for UI
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [studentPhone, setStudentPhone] = useState("")

  // Mock available times - in production this would come from the coach's availability rules
  const mockAvailableTimes = {
    "Mon, Jan 15": ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM", "4:00 PM"],
    "Tue, Jan 16": ["9:00 AM", "10:30 AM", "4:00 PM"],
    "Wed, Jan 17": ["9:00 AM", "2:00 PM", "3:30 PM"],
    "Thu, Jan 18": ["10:30 AM", "2:00 PM", "4:00 PM"],
    "Fri, Jan 19": ["9:00 AM", "3:30 PM"],
    "Sat, Jan 20": ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM", "4:00 PM"],
    "Sun, Jan 21": ["2:00 PM", "3:30 PM"]
  }

  // New booking handlers using state management
  const handleServiceSelect = (service: any, index: number) => {
    if (!coachData?.profile?.user_id) return

    // Start the booking flow
    startBookingFlow(coachData.profile.user_id)
    setSelectedService(service)
    openBookingModal()
  }

  const handleCreateBooking = async () => {
    if (!currentUser?.id) {
      alert('Please log in to book a session')
      return
    }

    const bookingData = getBookingData()
    if (!bookingData) {
      alert('Please complete all booking fields')
      return
    }

    try {
      await createBookingMutation.mutateAsync({
        ...bookingData,
        student_id: currentUser.id,
      })

      alert('Booking created successfully!')
      closeBookingModal()
      clearBookingFlow()
    } catch (error) {
      console.error('Booking error:', error)
      alert(error instanceof Error ? error.message : 'Failed to create booking')
    }
  }

  // Helper functions for booking (keeping these for compatibility)
  const getAvailableTimesForDate = () => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, 'E, MMM d')
    return mockAvailableTimes[dateKey] || []
  }

  // Helper function to convert 12-hour to 24-hour format
  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ')
    let [hours, minutes] = time.split(':')
    if (hours === '12') {
      hours = modifier === 'AM' ? '00' : '12'
    } else {
      hours = modifier === 'AM' ? hours.padStart(2, '0') : String(parseInt(hours) + 12)
    }
    return `${hours}:${minutes}:00`
  }

  // Helper function to add minutes to time string
  const addMinutesToTime = (timeStr: string, minutesToAdd: number): string => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + minutesToAdd
    const newHours = Math.floor(totalMinutes / 60)
    const newMinutes = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:00`
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 0 })
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i)
      return {
        date,
        dayName: format(date, 'E'),
        dayNumber: format(date, 'd'),
        fullDate: format(date, 'E, MMM d')
      }
    })
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coach profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!coachData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Coach Not Found</h2>
          <p className="text-gray-600">The coach profile you're looking for doesn't exist or is not available.</p>
        </div>
      </div>
    )
  }

  const { profile, services, reviews, courts: coachCourts, ratingStats } = coachData

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="base" className="h-8" />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Coach Overview */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.users.profile_image_url || undefined} alt={getFullName(profile.users)} />
            <AvatarFallback>
              <User className="w-12 h-12 text-gray-600" />
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                {`${profile.users.first_name || ''} ${profile.users.last_name || ''}`.trim()}
              </h1>
              {profile.users.is_verified && <Check className="w-5 h-5 text-blue-500" />}
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{ratingStats.average_rating.toFixed(1)}</span>
                <span>({ratingStats.total_reviews} reviews)</span>
              </div>
              {profile.years_experience && (
                <span>{profile.years_experience} years experience</span>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {profile.specializations.map((specialization, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                  {specialization}
                </span>
              ))}
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-gray-700 max-w-2xl leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Services */}
        {services.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Services</h2>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Clock className="w-5 h-5 text-gray-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{service.service_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{service.duration_minutes} min</span>
                          <span>{service.sports.name}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{service.description}</p>
                        {service.skill_levels.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs text-gray-500">Skill levels:</span>
                            {service.skill_levels.map((level) => (
                              <span key={level} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                {level}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-gray-900">RM{service.price_myr}</span>
                      <button
                        onClick={() => handleServiceSelect(service, index)}
                        className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Courts */}
        {courts && courts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Locations</h2>
            <div className="grid grid-cols-2 gap-3">
              {courts?.slice(0, 6).map((court) => (
                <div key={court.id} className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                  <MapPin className="w-3 h-3" />
                  {court.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Times Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Available Times</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-sm font-medium">
                {format(currentWeek, 'MMM d')} - {format(addDays(startOfWeek(currentWeek, { weekStartsOn: 0 }), 6), 'MMM d')}
              </div>
              <button
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {getWeekDays().map((day, index) => {
                const hasAvailableSlots = mockAvailableTimes[day.fullDate]?.length > 0
                return (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-600 mb-1">{day.dayName}</div>
                    <div className={`text-xs p-2 rounded ${
                      hasAvailableSlots
                        ? 'bg-green-100 text-green-800 font-medium'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {day.dayNumber}
                    </div>
                    {hasAvailableSlots && (
                      <div className="text-xs text-green-600 mt-1">
                        {mockAvailableTimes[day.fullDate].length} slots
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Certifications */}
        {profile.certifications.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
            <ul className="space-y-2">
              {profile.certifications.map((cert, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-semibold">{ratingStats.average_rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-600">({ratingStats.total_reviews} reviews)</span>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingStats.rating_distribution[stars.toString()] || 0
                const percentage = ratingStats.total_reviews > 0 ? (count / ratingStats.total_reviews) * 100 : 0
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm">{stars}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-4">{count}</span>
                  </div>
                )
              })}
            </div>

            {/* Recent Reviews */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={review.users?.profile_image_url || undefined} />
                        <AvatarFallback>
                          <span className="text-xs font-medium text-gray-700">
                            {review.is_anonymous ? 'A' : getFullName(review.users).split(' ').map(n => n[0]).join('') || '?'}
                          </span>
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-gray-900">
                            {review.is_anonymous ? 'Anonymous User' : getFullName(review.users)}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        {review.review_text && (
                          <p className="text-sm text-gray-700 leading-relaxed">{review.review_text}</p>
                        )}
                        {review.coach_response && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">Coach Response</span>
                            </div>
                            <p className="text-sm text-gray-700">{review.coach_response}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingModalOpen} onOpenChange={closeBookingModal}>
        <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedService ? selectedService.service_name : 'Book Session'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Service Details */}
            {selectedService && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{selectedService.service_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{selectedService.duration_minutes} min</span>
                      <span>{selectedService.sports?.name}</span>
                    </div>
                  </div>
                  <div className="text-lg font-medium text-gray-900">
                    RM{selectedService.price_myr}
                  </div>
                </div>
              </div>
            )}

            {/* Location Selection */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Select Location</h3>
              <div className="grid grid-cols-1 gap-2">
                {courts?.slice(0, 6).map((court) => (
                  <button
                    key={court.id}
                    onClick={() => setSelectedCourt(court)}
                    className={`p-3 rounded-lg text-sm border transition-colors text-left ${
                      selectedCourt?.id === court.id
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{court.name}</div>
                        <div className="text-xs opacity-80">{court.city}, {court.state}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Select Date</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-sm text-gray-600 min-w-[100px] text-center">
                    {format(currentWeek, 'MMM d')} - {format(addDays(startOfWeek(currentWeek, { weekStartsOn: 0 }), 6), 'MMM d')}
                  </div>
                  <button
                    onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {getWeekDays().map((day, index) => {
                  const hasAvailableSlots = mockAvailableTimes[day.fullDate]?.length > 0
                  const isSelected = selectedDate && format(selectedDate, 'E, MMM d') === day.fullDate
                  return (
                    <button
                      key={index}
                      onClick={() => hasAvailableSlots && setSelectedDate(day.date)}
                      disabled={!hasAvailableSlots}
                      className={`p-2 rounded-lg text-center transition-colors ${
                        isSelected
                          ? 'bg-black text-white'
                          : hasAvailableSlots
                          ? 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-xs">{day.dayName}</div>
                      <div className="text-sm font-medium">{day.dayNumber}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Select Time</h3>
                <div className="grid grid-cols-3 gap-2">
                  {getAvailableTimesForDate().map((time, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        selectedTime === time
                          ? 'bg-black text-white'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="+60 12-345-6789"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes for Coach (Optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific goals, injuries, or requirements..."
                    rows={3}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Book Session Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleCreateBooking}
                disabled={!selectedService || !selectedDate || !selectedTime || !selectedCourt || createBookingMutation.isPending}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {createBookingMutation.isPending ? 'Creating Booking...' : 'Book Session'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CoachProfile