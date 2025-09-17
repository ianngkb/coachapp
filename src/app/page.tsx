'use client';

import { Search, Filter, RefreshCw, Star, Clock, MapPin, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

type Coach = {
  user_id: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  location_city: string;
  location_state: string | null;
  bio: string | null;
  specializations: string[];
  experience_years: number | null;
  rating_average: number | null;
  rating_count: number;
  total_sessions: number;
  hourly_rate_myr: number | null;
  is_available: boolean;
  listing_status: string;
};

const CoachCard = ({ coach }: { coach: Coach }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
    {/* Header Row */}
    <div className="flex items-start gap-3 mb-3">
      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
        <img
          src={coach.profile_image_url || `https://i.pravatar.cc/80?u=${coach.user_id}`}
          alt={`${coach.first_name} ${coach.last_name}`}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{`${coach.first_name} ${coach.last_name}`}</h3>
        <p className="text-sm text-gray-500">{coach.location_city}</p>
      </div>

      <Link href={`/coach-profile?id=${coach.user_id}`} className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
        View Profile
      </Link>
    </div>

    {/* Specializations Chips */}
    <div className="flex flex-wrap gap-2 mb-3">
      {coach.specializations.map((skill, index) => (
        <span key={index} className="bg-gray-100 text-black px-3 py-1 rounded-full text-xs font-medium">
          {skill}
        </span>
      ))}
    </div>

    {/* Experience and Price */}
    <div className="flex flex-wrap gap-2 mb-4">
      {coach.experience_years && (
        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs">
          {coach.experience_years} years experience
        </span>
      )}
      {coach.hourly_rate_myr && (
        <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs">
          From RM{coach.hourly_rate_myr}/hour
        </span>
      )}
    </div>

    {/* Bio */}
    {coach.bio && (
      <p className="text-sm text-gray-800 mb-4 line-clamp-3">{coach.bio}</p>
    )}

    {/* Sessions Completed */}
    <div className="flex items-center gap-2 mb-2 text-sm text-gray-800">
      <Clock className="w-4 h-4" />
      <span>{coach.total_sessions} sessions completed</span>
    </div>

    {/* Location */}
    <div className="flex items-center gap-2 text-sm text-gray-800">
      <MapPin className="w-4 h-4" />
      <span>
        {coach.location_city && coach.location_state
          ? `${coach.location_city}, ${coach.location_state}`
          : coach.location_state || 'Malaysia'
        }
      </span>
    </div>
  </div>
);

export default function Home() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchCoaches();
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check if user is a coach or student
        const { data: coachData } = await supabase
          .from('coach_profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (coachData) {
          setUserRole('coach');
        } else {
          const { data: studentData } = await supabase
            .from('student_profiles')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

          if (studentData) {
            setUserRole('student');
          } else {
            setUserRole('unknown');
          }
        }
      }
    } catch (err) {
      console.error('Error checking user:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('coach_directory')
        .select('*')
        .eq('listing_status', 'active')
        .eq('is_available', true)
        .order('rating_average', { ascending: false, nullsFirst: false });

      if (error) throw error;

      setCoaches(data || []);
    } catch (err: any) {
      console.error('Error fetching coaches:', err);
      setError(err.message || 'Failed to load coaches');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 h-14 md:h-16">
        <div className="mx-auto px-3 md:px-6 max-w-7xl h-full flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="base" className="h-8 md:h-10" />
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 text-gray-700" />
              </button>
            ) : (
              <Link href="/signin" className="hover:text-gray-900 transition-colors">
                <User className="w-5 h-5 text-gray-700" />
              </Link>
            )}
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

            {/* Current User Info */}
            {user && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-xs font-semibold text-blue-900 mb-1">Currently logged in as:</div>
                <div className="text-sm font-mono text-blue-800 mb-1">{user.email}</div>
                <div className="inline-flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    userRole === 'coach'
                      ? 'bg-purple-100 text-purple-700'
                      : userRole === 'student'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {userRole === 'coach' ? '👨‍🏫 Coach' : userRole === 'student' ? '🎯 Student' : '❓ Unknown Role'}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {!user && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800 mb-2">Not logged in - using guest view</div>
                <Link href="/signin" className="text-xs text-blue-600 hover:text-blue-800 underline">
                  Sign in to test user features
                </Link>
              </div>
            )}
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
                <div className="grid grid-cols-3 gap-2">
                  <Link href="/coach-profile" className="block border border-purple-600 text-purple-600 text-center py-2 rounded-lg text-xs font-semibold hover:bg-purple-50 transition-colors">
                    Profile
                  </Link>
                  <Link href="/coach-profile-edit" className="block border border-purple-600 text-purple-600 text-center py-2 rounded-lg text-xs font-semibold hover:bg-purple-50 transition-colors">
                    Edit
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
            <p className="text-sm text-gray-600">
              {loading ? "Loading..." : `${coaches.length} coaches available`}
            </p>
          </div>
          <button
            onClick={fetchCoaches}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="text-center">
              <h3 className="text-red-900 font-semibold mb-2">Error Loading Coaches</h3>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <button
                onClick={fetchCoaches}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="space-y-4 md:space-y-6 pb-8">
            {[1, 2].map((n) => (
              <div key={n} className="bg-gray-100 rounded-2xl p-4 md:p-5 animate-pulse">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded mb-2 w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Coach Cards */}
        {!loading && !error && (
          <div className="space-y-4 md:space-y-6 pb-8">
            {coaches.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Coaches Available</h3>
                <p className="text-gray-600">Check back later for available coaches.</p>
              </div>
            ) : (
              coaches.map((coach) => (
                <CoachCard key={coach.user_id} coach={coach} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
