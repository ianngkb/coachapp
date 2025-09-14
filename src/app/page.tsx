import { Search, Filter, RefreshCw, Star, Clock, MapPin, User } from "lucide-react";
import Link from "next/link";

const coaches = [
  {
    id: 1,
    name: "Sarah Chen",
    rating: 4.9,
    reviewCount: 127,
    skills: ["Tennis", "Fitness"],
    facilities: ["Base Pickle and Padel", "KLCC Tennis Center", "Bangsar Sports Complex", "+1 more"],
    bio: "Professional tennis coach with 8+ years experience. Former national player specializing in technique and mental game.",
    availability: "Today 3–5pm",
    location: "Central Singapore",
    avatar: "/api/placeholder/48/48"
  },
  {
    id: 2,
    name: "Marcus Johnson",
    rating: 4.8,
    reviewCount: 93,
    skills: ["Basketball", "Fitness"],
    facilities: ["KL Sports Center", "Olympic Sports Complex", "Sunway Sports Complex"],
    bio: "Former professional basketball player turned coach. Focus on fundamentals and athletic development.",
    availability: "Tomorrow 9am",
    location: "East Singapore",
    avatar: "/api/placeholder/48/48"
  },
  {
    id: 3,
    name: "Lisa Wang",
    rating: 4.9,
    reviewCount: 156,
    skills: ["Swimming", "Triathlon"],
    facilities: ["Olympic Sports Complex", "PJ Badminton Hall", "Fitness First"],
    bio: "Olympic-level swimming coach with expertise in stroke technique and competitive training programs.",
    availability: "Today 6–8pm",
    location: "West Singapore",
    avatar: "/api/placeholder/48/48"
  },
  {
    id: 4,
    name: "David Kim",
    rating: 4.7,
    reviewCount: 84,
    skills: ["Golf", "Mental Coaching"],
    facilities: ["Tropicana Golf & Country Resort", "Gleneagles Club", "The Mines Resort & Golf Club"],
    bio: "PGA-certified golf instructor focusing on short game and course management for all skill levels.",
    availability: "Wed 2–4pm",
    location: "Online",
    avatar: "/api/placeholder/48/48"
  }
];

const CoachCard = ({ coach }: { coach: typeof coaches[0] }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
    {/* Header Row */}
    <div className="flex items-start gap-3 mb-3">
      <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-200 rounded-full flex items-center justify-center">
        <User className="w-6 h-6 md:w-7 md:h-7 text-gray-600" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{coach.name}</h3>
        <div className="flex items-center gap-1 text-sm text-gray-900">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>{coach.rating}</span>
          <span className="text-gray-600">({coach.reviewCount})</span>
        </div>
      </div>

      <Link href="/coach-profile" className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
        View Profile
      </Link>
    </div>

    {/* Skills Chips */}
    <div className="flex flex-wrap gap-2 mb-3">
      {coach.skills.map((skill, index) => (
        <span key={index} className="bg-gray-100 text-black px-3 py-1 rounded-full text-xs font-medium">
          {skill}
        </span>
      ))}
    </div>

    {/* Facilities Chips */}
    <div className="flex flex-wrap gap-2 mb-4">
      {coach.facilities.map((facility, index) => (
        <span key={index} className="bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs">
          {facility}
        </span>
      ))}
    </div>

    {/* Bio */}
    <p className="text-sm text-gray-800 mb-4 line-clamp-3">{coach.bio}</p>

    {/* Availability */}
    <div className="flex items-center gap-2 mb-2 text-sm text-gray-800">
      <Clock className="w-4 h-4" />
      <span>Available: {coach.availability}</span>
    </div>

    {/* Location */}
    <div className="flex items-center gap-2 text-sm text-gray-800">
      <MapPin className="w-4 h-4" />
      <span>{coach.location}</span>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 h-14 md:h-16">
        <div className="mx-auto px-3 md:px-6 max-w-7xl h-full flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="base" className="h-8 md:h-10" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/signin" className="hover:text-gray-900 transition-colors">
              <User className="w-5 h-5 text-gray-700" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-3 md:px-6 max-w-7xl">
        {/* Search Bar */}
        <div className="mt-3 mb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search coaches or sport"
              className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
            <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Demo Mode Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-blue-900 mb-2">🚀 Demo Mode</h2>
            <p className="text-sm text-blue-800">Test the application with different user roles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Demo */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Student Dashboard</h3>
                <p className="text-xs text-gray-600 mb-3">Browse coaches, book sessions, manage profile</p>
              </div>
              <div className="space-y-2">
                <Link href="/student-dashboard-sessions" className="block w-full bg-green-600 text-white text-center py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                  View Sessions
                </Link>
                <Link href="/student-profile-edit" className="block w-full border border-green-600 text-green-600 text-center py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors">
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Coach Demo */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Coach Dashboard</h3>
                <p className="text-xs text-gray-600 mb-3">Manage sessions, schedule, services & profile</p>
              </div>
              <div className="space-y-2">
                <Link href="/coach-dashboard" className="block w-full bg-purple-600 text-white text-center py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                  View Dashboard
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/coach-profile" className="block border border-purple-600 text-purple-600 text-center py-2 rounded-lg text-xs font-semibold hover:bg-purple-50 transition-colors">
                    Profile
                  </Link>
                  <Link href="/coach-services" className="block border border-purple-600 text-purple-600 text-center py-2 rounded-lg text-xs font-semibold hover:bg-purple-50 transition-colors">
                    Services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Available Coaches</h1>
            <p className="text-sm text-gray-600">{coaches.length} coaches available</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <RefreshCw className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Coach Cards */}
        <div className="space-y-4 md:space-y-6 pb-8">
          {coaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      </main>
    </div>
  );
}
