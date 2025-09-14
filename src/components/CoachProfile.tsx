"use client"

import { ArrowLeft, Star, Clock, MapPin, Dumbbell, Brain, Check, User, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const CoachProfile = () => {
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const coachData = {
    name: "Sarah Chen",
    avatar: "/api/placeholder/150/150",
    rating: 4.9,
    reviewCount: 127,
    experience: "8 years experience",
    tags: ["Tennis", "Fitness", "Mental Coaching"],
    bio: "Professional tennis coach with 8+ years experience coaching players from beginner to advanced levels. Former national player with expertise in technique refinement, mental game, and competitive strategy. I believe in personalized coaching that adapts to each student's learning style and goals.",
    services: [
      {
        title: "Individual Tennis Lesson",
        icon: Clock,
        duration: "60 min",
        mode: "Physical",
        description: "One-on-one coaching focusing on technique, strategy, and match play",
        price: "RM80"
      },
      {
        title: "Fitness & Conditioning",
        icon: Dumbbell,
        duration: "45 min",
        mode: "Online/Physical",
        description: "Tennis-specific fitness training to improve agility, strength, and endurance",
        price: "RM60"
      },
      {
        title: "Strategy Session",
        icon: Brain,
        duration: "30 min",
        mode: "Online",
        description: "Online session focusing on match strategy and mental game",
        price: "RM40"
      }
    ],
    preferredCourts: [
      "Base Pickle and Padel",
      "KLCC Tennis Center",
      "Bangsar Sports Complex",
      "Mont Kiara Country Club",
      "91 Pickle",
      "Pickle Park"
    ],
    certifications: [
      "PTR Certified Professional",
      "Mental Performance Coach",
      "First Aid Certified"
    ],
    locations: ["Central Singapore", "Online"],
    ratingBreakdown: [
      { stars: 5, count: 3 },
      { stars: 4, count: 2 },
      { stars: 3, count: 0 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 }
    ],
    availableTimes: {
      "Mon, Jan 15": ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM", "4:00 PM"],
      "Tue, Jan 16": ["9:00 AM", "10:30 AM", "4:00 PM"],
      "Wed, Jan 17": ["9:00 AM", "2:00 PM", "3:30 PM"],
      "Thu, Jan 18": ["10:30 AM", "2:00 PM", "4:00 PM"],
      "Fri, Jan 19": ["9:00 AM", "3:30 PM"],
      "Sat, Jan 20": ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM", "4:00 PM"],
      "Sun, Jan 21": ["2:00 PM", "3:30 PM"]
    },
    recentReviews: [
      {
        user: "Alex Johnson",
        avatar: "AJ",
        rating: 5,
        date: "Jan 15, 2024",
        text: "Sarah is an amazing tennis coach! She helped me improve my serve technique significantly in just a few sessions. Her approach is very encouraging and she explains everything clearly.",
        tag: "Individual Tennis Lesson"
      },
      {
        user: "Maria Rodriguez",
        avatar: "MR",
        rating: 5,
        date: "Jan 12, 2024",
        text: "Excellent coaching! Very professional and patient. The fitness training really helped improve my game.",
        tag: "Fitness & Conditioning"
      },
      {
        user: "John Smith",
        avatar: "JS",
        rating: 4,
        date: "Jan 10, 2024",
        text: "Great strategy session. Sarah provided valuable insights that helped me win my last tournament match.",
        tag: "Strategy Session"
      },
      {
        user: "Lisa Chen",
        avatar: "LC",
        rating: 5,
        date: "Jan 8, 2024",
        text: "Highly recommend Sarah's coaching. Her technical knowledge and teaching style are excellent.",
        tag: "Individual Tennis Lesson"
      },
      {
        user: "David Wong",
        avatar: "DW",
        rating: 4,
        date: "Jan 5, 2024",
        text: "Good session overall. Learned a lot about mental preparation for matches.",
        tag: "Strategy Session"
      }
    ]
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

  const handleServiceSelect = (index: number) => {
    setSelectedService(index)
    setIsBookingOpen(true)
  }

  const handleDateSelect = (date: Date, fullDate: string) => {
    setSelectedDate(date)
    // Reset selected time when date changes
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location)
  }

  const getAvailableTimesForDate = () => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, 'E, MMM d')
    return coachData.availableTimes[dateKey] || []
  }

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
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-gray-600" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">{coachData.name}</h1>
              <Check className="w-5 h-5 text-blue-500" />
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{coachData.rating}</span>
                <span>({coachData.reviewCount} reviews)</span>
              </div>
              <span>{coachData.experience}</span>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {coachData.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-700 max-w-2xl leading-relaxed">
            {coachData.bio}
          </p>
        </div>

        {/* Services */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Services</h2>
          <div className="space-y-4">
            {coachData.services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <IconComponent className="w-5 h-5 text-gray-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{service.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{service.duration}</span>
                          <span>{service.mode}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-medium text-gray-900">{service.price}</span>
                      <button
                        onClick={() => handleServiceSelect(index)}
                        className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Preferred Courts */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Locations</h2>
          <div className="grid grid-cols-2 gap-3">
            {coachData.preferredCourts.map((court, index) => (
              <div key={index} className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                <MapPin className="w-3 h-3" />
                {court}
              </div>
            ))}
          </div>
        </div>

        {/* Available Times Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Available Times</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            {/* Week Navigation */}
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

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2">
              {getWeekDays().map((day, index) => {
                const hasAvailableSlots = coachData.availableTimes[day.fullDate]?.length > 0
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
                        {coachData.availableTimes[day.fullDate].length} slots
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
          <ul className="space-y-2">
            {coachData.certifications.map((cert, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                {cert}
              </li>
            ))}
          </ul>
        </div>

        {/* Locations */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Locations</h2>
          <div className="flex gap-2">
            {coachData.locations.map((location, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {location}
              </span>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-semibold">{coachData.rating}</span>
              </div>
              <span className="text-sm text-gray-600">({coachData.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {coachData.ratingBreakdown.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm">{item.stars}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${(item.count / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-4">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
          <div className="space-y-4">
            {coachData.recentReviews.map((review, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {review.avatar}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-gray-900">{review.user}</h4>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                        {review.tag}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              {selectedService !== null ? coachData.services[selectedService].title : 'Book Session'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Service Details */}
            {selectedService !== null && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{coachData.services[selectedService].title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{coachData.services[selectedService].duration}</span>
                      <span>{coachData.services[selectedService].mode}</span>
                    </div>
                  </div>
                  <div className="text-lg font-medium text-gray-900">
                    {coachData.services[selectedService].price}
                  </div>
                </div>
              </div>
            )}

            {/* Location Selection */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Select Location</h3>
              <div className="grid grid-cols-2 gap-2">
                {coachData.preferredCourts.slice(0, 6).map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(location)}
                    className={`p-2 rounded-lg text-xs border transition-colors ${
                      selectedLocation === location
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {location}
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
                  const hasAvailableSlots = coachData.availableTimes[day.fullDate]?.length > 0
                  const isSelected = selectedDate && format(selectedDate, 'E, MMM d') === day.fullDate
                  return (
                    <button
                      key={index}
                      onClick={() => hasAvailableSlots && handleDateSelect(day.date, day.fullDate)}
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
                      onClick={() => handleTimeSelect(time)}
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

            {/* Book Session Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                disabled={!selectedService || !selectedDate || !selectedTime || !selectedLocation}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Book Session
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CoachProfile