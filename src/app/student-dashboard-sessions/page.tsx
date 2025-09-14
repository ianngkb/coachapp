import { Calendar, Clock, MapPin, CalendarPlus, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

const upcomingSessions = [
  {
    id: 1,
    title: "Individual Tennis Lesson",
    coach: "Sarah Chen",
    date: "Sat, Jan 20 at 2:00 PM",
    duration: "60 minutes",
    location: "Kuala Lumpur Tennis Centre",
    price: "RM80",
    status: "Upcoming",
    avatar: "/api/placeholder/48/48"
  },
  {
    id: 2,
    title: "Basketball Training",
    coach: "Marcus Johnson",
    date: "Sun, Jan 21 at 10:00 AM",
    duration: "90 minutes",
    location: "KL Sports Center",
    price: "RM120",
    status: "Upcoming",
    avatar: "/api/placeholder/48/48"
  }
];

const pastSessions = [
  {
    id: 3,
    title: "Swimming Technique",
    coach: "Lisa Wang",
    date: "Mon, Jan 15 at 6:00 PM",
    duration: "45 minutes",
    location: "Olympic Sports Complex",
    price: "RM60",
    status: "Completed",
    avatar: "/api/placeholder/48/48"
  }
];

const SessionCard = ({ session }: { session: typeof upcomingSessions[0] }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
    {/* Header with Coach Info */}
    <div className="flex items-start gap-3 mb-3">
      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
        <User className="w-6 h-6 text-gray-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-md font-semibold text-gray-900">{session.title}</h3>
        <p className="text-sm text-gray-700">with {session.coach}</p>
      </div>
      <div className="text-right">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          session.status === 'Upcoming'
            ? 'bg-black text-white'
            : 'bg-gray-300 text-gray-700'
        }`}>
          {session.status}
        </span>
        <p className="text-lg font-semibold text-gray-900 mt-1">{session.price}</p>
      </div>
    </div>

    {/* Session Details */}
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar className="w-4 h-4" />
        <span>{session.date}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>{session.duration}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span>{session.location}</span>
      </div>
    </div>

    {/* Actions */}
    {session.status === 'Upcoming' && (
      <button className="flex items-center gap-2 text-sm text-black hover:text-gray-800 transition-colors">
        <CalendarPlus className="w-4 h-4" />
        <span>Add to Calendar</span>
      </button>
    )}
  </div>
);

export default function StudentDashboardSessions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 h-14 md:h-16">
        <div className="mx-auto px-3 md:px-6 max-w-7xl h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:bg-gray-100 p-1 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div className="text-red-600 text-xl md:text-2xl font-bold lowercase">
              base
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/student-profile-edit" className="hover:text-gray-900 transition-colors">
              <User className="w-5 h-5 text-gray-700" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-6 py-4 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Sessions</h1>
          <p className="text-gray-600">Manage your bookings here</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
              Upcoming
            </button>
            <button className="text-gray-600 px-4 py-2 rounded-full text-sm font-medium hover:text-gray-900 transition-colors">
              Past
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div>
          {upcomingSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>

        {/* Empty State for Demo */}
        {upcomingSessions.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming sessions</h3>
            <p className="text-gray-600 mb-4">Book your first coaching session to get started!</p>
            <Link href="/" className="bg-black text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
              Browse Coaches
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}