'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CoachHeader } from './CoachHeader'
import { supabase, type City } from '@/lib/supabase'
import { generateUserAvatar, getAvatarUrl } from '@/lib/avatar'
import { getCurrentUser } from '@/lib/auth'
import {
  Camera,
  Save,
  Phone,
  MapPin,
  ChevronDown,
  CheckSquare,
  FileText,
  AlertCircle
} from 'lucide-react'

export default function CoachProfileEdit() {
  const router = useRouter()
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [selectedCourts, setSelectedCourts] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<City[]>([])
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [coachData, setCoachData] = useState<any>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: 'Kuala Lumpur',
    city: '',
    yearsExperience: '',
    certifications: '',
    languages: '',
    specialties: '',
    bio: ''
  })

  const sportsOptions = [
    'Basketball', 'Badminton', 'Football', 'Table Tennis', 'Boxing',
    'Tennis', 'Swimming', 'Volleyball', 'Golf', 'Muay Thai'
  ]

  const courtsOptions = [
    'Base Pickle and Padel', '91 Pickle', 'Pickle Social Club', 'KL Sports Center',
    'Olympic Sports Complex', 'The Curve Sports Center', 'Mid Valley Sports Center',
    'Acadium Badminton Hall', 'SU Survanay Sports Complex', 'Utama Sports Center',
    'Bangsar Sports Complex', 'KLCC Tennis Centre'
  ]

  const handleSportToggle = (sport: string) => {
    setSelectedSports(prev =>
      prev.includes(sport)
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    )
  }

  const handleCourtToggle = (court: string) => {
    setSelectedCourts(prev =>
      prev.includes(court)
        ? prev.filter(c => c !== court)
        : [...prev, court]
    )
  }

  // Load cities based on selected state
  const loadCities = async (state: string) => {
    try {
      const { data: cities, error } = await supabase
        .from('cities')
        .select('*')
        .eq('state', state)
        .order('is_popular', { ascending: false })
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Error loading cities from database:', error)
        setAvailableCities([])
        return
      }

      setAvailableCities(cities || [])
    } catch (err) {
      console.error('Error loading cities:', err)
      setAvailableCities([])
    }
  }

  // Load user data when component mounts
  useEffect(() => {
    loadUserData()
  }, [])

  // Load cities when location changes
  useEffect(() => {
    if (formData.location) {
      loadCities(formData.location)
    }
  }, [formData.location])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current authenticated user
      const user = await getCurrentUser()
      if (!user) {
        setError('Please sign in to edit your profile')
        return
      }

      // Check if user is a coach
      if (user.user_type !== 'coach') {
        setError('Only coaches can access this page')
        return
      }

      // Get full user data from users table
      const { data: userInfo, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        setError('Failed to load user data')
        return
      }

      // Get coach profile data
      const { data: coachInfo, error: coachError } = await supabase
        .from('coach_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (coachError) {
        console.error('Error fetching coach data:', coachError)
        // Create coach profile if it doesn't exist
        const { data: newCoach, error: createError } = await supabase
          .from('coach_profiles')
          .insert({
            user_id: user.id,
            bio: 'Welcome to my coaching profile!',
            years_experience: 0,
            certifications: [],
            specializations: [],
            languages_spoken: ['English'],
            is_available: true,
            listing_status: 'active'
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating coach profile:', createError)
          setError('Failed to create coach profile')
          return
        }
        setCoachData(newCoach)
      } else {
        setCoachData(coachInfo)
      }

      setUserData(userInfo)

      // Populate form data with real user data
      setFormData({
        firstName: userInfo.first_name || '',
        lastName: userInfo.last_name || '',
        email: userInfo.email || '',
        phone: userInfo.phone_number || '',
        location: userInfo.location_state || 'Kuala Lumpur',
        city: userInfo.location_city || '',
        yearsExperience: coachInfo?.years_experience?.toString() || '0',
        certifications: Array.isArray(coachInfo?.certifications)
          ? coachInfo.certifications.join(', ')
          : coachInfo?.certifications || '',
        languages: Array.isArray(coachInfo?.languages_spoken)
          ? coachInfo.languages_spoken.join(', ')
          : coachInfo?.languages_spoken || 'English',
        specialties: Array.isArray(coachInfo?.specializations)
          ? coachInfo.specializations.join(', ')
          : coachInfo?.specializations || '',
        bio: coachInfo?.bio || ''
      })

      // Generate avatar for the user
      const defaultAvatar = getAvatarUrl(userInfo.profile_image_url, user.id, user.email, 128)
      setAvatarUrl(defaultAvatar)

    } catch (err: any) {
      console.error('Error loading user data:', err)
      setError(err.message || 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // When state changes, reset city and load new cities
    if (field === 'location') {
      setFormData(prev => ({ ...prev, [field]: value, city: '' }))
      loadCities(value)
    }
  }

  const handleSaveChanges = () => {
    console.log('Saving profile changes...', { formData, selectedSports, selectedCourts })
  }

  const handleBack = () => {
    router.push('/coach-profile')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachHeader
          title="My Profile"
          subtitle="Edit your coaching profile"
          showBackButton={true}
          backHref="/coach-dashboard"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachHeader
          title="My Profile"
          subtitle="Edit your coaching profile"
          showBackButton={true}
          backHref="/coach-dashboard"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadUserData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachHeader
        title="My Profile"
        subtitle="Edit your coaching profile"
        showBackButton={true}
        backHref="/coach-dashboard"
      >
        <Button onClick={handleSaveChanges} className="bg-black text-white hover:bg-gray-800">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </CoachHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Photo Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Profile Photo
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if avatar fails to load
                    const target = e.target as HTMLImageElement
                    target.src = generateUserAvatar('fallback-user', formData.email, 128)
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                  <span className="text-lg font-semibold">
                    {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <Button variant="outline" className="mb-2">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-sm text-gray-600">Upload a professional photo (max 5MB)</p>
              <p className="text-xs text-gray-500 mt-1">Currently using auto-generated avatar</p>
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="mt-1"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="mt-1"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="mt-1 bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <div className="relative mt-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                  +60
                </div>
                <Input
                  id="phone"
                  value={formData.phone.replace('+60 ', '').replace('+60', '')}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d-\s]/g, '');
                    handleInputChange('phone', '+60 ' + value);
                  }}
                  placeholder="12-345 6789"
                  className="pl-12"
                  maxLength={12}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Malaysian phone numbers only (e.g., +60 12-345 6789)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  State
                </Label>
                <div className="relative mt-1">
                  <select
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white appearance-none pr-8"
                  >
                    <option value="Kuala Lumpur">Kuala Lumpur</option>
                    <option value="Selangor">Selangor</option>
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <Label htmlFor="city" className="text-sm font-medium">City</Label>
                <div className="relative mt-1">
                  <select
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white appearance-none pr-8"
                    disabled={!formData.location}
                  >
                    <option value="">
                      {formData.location ? 'Select a city' : 'Select state first'}
                    </option>
                    {availableCities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {availableCities.length > 0
                    ? `${availableCities.length} cities available in ${formData.location}`
                    : formData.location
                      ? 'Loading cities...'
                      : 'Select a state to see available cities'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Professional Details</h2>

          {/* Sports Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Sports</Label>
            <p className="text-xs text-gray-600 mb-3">Select the sports you coach</p>
            <div className="grid grid-cols-2 gap-3">
              {sportsOptions.map((sport) => (
                <label key={sport} className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedSports.includes(sport)}
                      onChange={() => handleSportToggle(sport)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      selectedSports.includes(sport)
                        ? 'bg-black border-black'
                        : 'border-gray-300'
                    }`}>
                      {selectedSports.includes(sport) && (
                        <CheckSquare className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm">{sport}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Years of Experience */}
          <div className="mb-4">
            <Label htmlFor="experience" className="text-sm font-medium">Years of Experience</Label>
            <Input
              id="experience"
              type="number"
              value={formData.yearsExperience}
              onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Certifications */}
          <div className="mb-4">
            <Label htmlFor="certifications" className="text-sm font-medium">Certifications (optional)</Label>
            <Input
              id="certifications"
              value={formData.certifications}
              onChange={(e) => handleInputChange('certifications', e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Languages */}
          <div className="mb-4">
            <Label htmlFor="languages" className="text-sm font-medium">Languages (optional)</Label>
            <Input
              id="languages"
              value={formData.languages}
              onChange={(e) => handleInputChange('languages', e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Specialties */}
          <div className="mb-6">
            <Label htmlFor="specialties" className="text-sm font-medium">Specialties (optional)</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => handleInputChange('specialties', e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Preferred Courts */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Preferred Courts (optional)</Label>
            <p className="text-xs text-gray-600 mb-3">Select the courts/venues you prefer to conduct your coaching sessions</p>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {courtsOptions.map((court) => (
                <label key={court} className="flex items-center gap-2 cursor-pointer py-1">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedCourts.includes(court)}
                      onChange={() => handleCourtToggle(court)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      selectedCourts.includes(court)
                        ? 'bg-black border-black'
                        : 'border-gray-300'
                    }`}>
                      {selectedCourts.includes(court) && (
                        <CheckSquare className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm">{court}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* About Me Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            About Me
          </h2>
          <div>
            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="mt-1 min-h-24"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500</p>
          </div>
        </div>

        {/* Profile Preview Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Profile Preview</h2>
          <p className="text-sm text-gray-600 mb-4">This is how your profile will appear to students</p>

          {/* Preview Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
                <img
                  src="/api/placeholder/64/64"
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{formData.firstName} {formData.lastName}</h3>
                <p className="text-sm text-gray-600 mb-2">{formData.city}, {formData.location}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedSports.slice(0, 2).map((sport) => (
                    <span key={sport} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {sport}
                    </span>
                  ))}
                  {selectedSports.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      +{selectedSports.length - 2}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">{formData.bio}</p>
                <p className="text-sm font-medium">RM80 - 1h / {formData.yearsExperience} years experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}