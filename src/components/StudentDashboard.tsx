"use client"

import { useState } from "react"
import Link from 'next/link'
import { Calendar, Clock, MapPin, CalendarPlus, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SessionDetails {
  id: string
  title: string
  coach: string
  coachAvatar: string
  date: string
  duration: string
  location: string
  price: string
  status: "upcoming" | "past"
}

const mockSessions: SessionDetails[] = [
  {
    id: "1",
    title: "Individual Tennis Lesson",
    coach: "Sarah Chen",
    coachAvatar: "",
    date: "Sat, Jan 20 at 2:00 PM",
    duration: "60 minutes",
    location: "Kuala Lumpur Tennis Centre",
    price: "RM80",
    status: "upcoming"
  },
  {
    id: "2",
    title: "Group Badminton Training",
    coach: "Ahmad Rahman",
    coachAvatar: "",
    date: "Fri, Jan 12 at 4:00 PM",
    duration: "90 minutes",
    location: "Shah Alam Sports Complex",
    price: "RM60",
    status: "past"
  },
  {
    id: "3",
    title: "Swimming Technique Session",
    coach: "Lisa Wong",
    coachAvatar: "",
    date: "Wed, Jan 10 at 6:00 PM",
    duration: "45 minutes",
    location: "Olympic Sports Centre",
    price: "RM70",
    status: "past"
  }
]

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")

  const filteredSessions = mockSessions.filter(session => session.status === activeTab)

  const handleAddToCalendar = (session: SessionDetails) => {
    // Calendar export functionality
    const event = {
      title: `${session.title} with ${session.coach}`,
      start: session.date,
      duration: session.duration,
      location: session.location
    }
    console.log("Adding to calendar:", event)
    // In a real implementation, this would generate an .ics file
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="base" className="h-8" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">My Sessions</h1>
          </div>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        </div>
        <p className="text-sm text-gray-700">Manage your bookings here</p>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "upcoming"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "past"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Session Cards */}
      <div className="px-6 space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No {activeTab} sessions found</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                {/* Coach Avatar */}
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarImage src={session.coachAvatar} alt={session.coach} />
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
                    {session.coach.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Session Title and Coach */}
                  <h3 className="text-md font-semibold text-gray-900 mb-1">
                    {session.title}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    with {session.coach}
                  </p>

                  {/* Session Details */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {session.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {session.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {session.location}
                    </div>
                  </div>

                  {/* Actions and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {session.status === "upcoming" && (
                        <button
                          onClick={() => handleAddToCalendar(session)}
                          className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          <CalendarPlus className="w-4 h-4 mr-1" />
                          Add to Calendar
                        </button>
                      )}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black text-white">
                        {session.status === "upcoming" ? "Upcoming" : "Completed"}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {session.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Browse Coaches CTA */}
      {filteredSessions.length === 0 && (
        <div className="px-6 mt-8">
          <button className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Browse Coaches
          </button>
        </div>
      )}
    </div>
  )
}