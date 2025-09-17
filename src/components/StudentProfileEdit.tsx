'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Camera, Save, Phone, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { supabase, type City } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { generateUserAvatar, getAvatarUrl } from '@/lib/avatar'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  user_type: 'student' | 'coach'
  first_name: string
  last_name: string
  email: string
  phone_number: string | null
  profile_image_url: string | null
  city_id: string | null
}

export const StudentProfileEdit = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    locationCity: '',
    locationState: 'Kuala Lumpur',
    preferredLanguage: 'en'
  })

  const [userData, setUserData] = useState<User | null>(null)
  const [availableCities, setAvailableCities] = useState<City[]>([])
  const [avatarUrl, setAvatarUrl] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      const user = await getCurrentUser()
      if (!user) {
        setError('Please sign in to edit your profile')
        return
      }

      // Get full user data from database
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError

      setUserData(data)
      // Populate form data from user object
      setFormData({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        mobileNumber: data.phone_number || '',
        locationCity: data.city_id ? data.city_id.split('_')[0] : '', // Assuming city_id is in format "city_name_id"
        locationState: data.city_id ? data.city_id.split('_')[1] : 'Kuala Lumpur', // Assuming city_id is in format "city_name_id"
        preferredLanguage: data.preferred_language || 'en'
      })

      // Generate avatar URL for user
      const defaultAvatar = getAvatarUrl(data.profile_image_url, data.id, data.email, 128)
      setAvatarUrl(defaultAvatar)
    } catch (err: any) {
      console.error('Error loading user data:', err)
      setError(err.message || 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  // Comprehensive alphabetically organized cities data based on official sources
  const citiesData = {
    'Kuala Lumpur': [
      // Alphabetically organized - Popular areas and official districts
      { id: '1', name: 'Ampang', state: 'Kuala Lumpur', district: 'Ampang', is_popular: true, display_order: 1, created_at: new Date().toISOString() },
      { id: '2', name: 'Bandar Tun Razak', state: 'Kuala Lumpur', district: 'Bandar Tun Razak', is_popular: false, display_order: 2, created_at: new Date().toISOString() },
      { id: '3', name: 'Bangsar', state: 'Kuala Lumpur', district: 'Lembah Pantai', is_popular: true, display_order: 3, created_at: new Date().toISOString() },
      { id: '4', name: 'Batu Caves', state: 'Kuala Lumpur', district: 'Batu', is_popular: true, display_order: 4, created_at: new Date().toISOString() },
      { id: '5', name: 'Brickfields', state: 'Kuala Lumpur', district: 'Brickfields', is_popular: true, display_order: 5, created_at: new Date().toISOString() },
      { id: '6', name: 'Bukit Bintang', state: 'Kuala Lumpur', district: 'Bukit Bintang', is_popular: true, display_order: 6, created_at: new Date().toISOString() },
      { id: '7', name: 'Bukit Jalil', state: 'Kuala Lumpur', district: 'Bukit Jalil', is_popular: true, display_order: 7, created_at: new Date().toISOString() },
      { id: '8', name: 'Cheras', state: 'Kuala Lumpur', district: 'Cheras', is_popular: true, display_order: 8, created_at: new Date().toISOString() },
      { id: '9', name: 'Chinatown', state: 'Kuala Lumpur', district: 'City Centre', is_popular: true, display_order: 9, created_at: new Date().toISOString() },
      { id: '10', name: 'Chow Kit', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: false, display_order: 10, created_at: new Date().toISOString() },
      { id: '11', name: 'Damansara Heights', state: 'Kuala Lumpur', district: 'Bukit Damansara', is_popular: true, display_order: 11, created_at: new Date().toISOString() },
      { id: '12', name: 'Desa ParkCity', state: 'Kuala Lumpur', district: 'Segambut', is_popular: true, display_order: 12, created_at: new Date().toISOString() },
      { id: '13', name: 'Jalan Imbi', state: 'Kuala Lumpur', district: 'Bukit Bintang', is_popular: false, display_order: 13, created_at: new Date().toISOString() },
      { id: '14', name: 'Jalan Tuanku Abdul Rahman', state: 'Kuala Lumpur', district: 'Chow Kit', is_popular: false, display_order: 14, created_at: new Date().toISOString() },
      { id: '15', name: 'Kampung Baru', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: false, display_order: 15, created_at: new Date().toISOString() },
      { id: '16', name: 'Kepong', state: 'Kuala Lumpur', district: 'Kepong', is_popular: true, display_order: 16, created_at: new Date().toISOString() },
      { id: '17', name: 'KLCC', state: 'Kuala Lumpur', district: 'City Centre', is_popular: true, display_order: 17, created_at: new Date().toISOString() },
      { id: '18', name: 'Lembah Pantai', state: 'Kuala Lumpur', district: 'Lembah Pantai', is_popular: false, display_order: 18, created_at: new Date().toISOString() },
      { id: '19', name: 'Mid Valley', state: 'Kuala Lumpur', district: 'Lembah Pantai', is_popular: true, display_order: 19, created_at: new Date().toISOString() },
      { id: '20', name: 'Mont Kiara', state: 'Kuala Lumpur', district: 'Segambut', is_popular: true, display_order: 20, created_at: new Date().toISOString() },
      { id: '21', name: 'Old Klang Road', state: 'Kuala Lumpur', district: 'Seputeh', is_popular: false, display_order: 21, created_at: new Date().toISOString() },
      { id: '22', name: 'Pantai', state: 'Kuala Lumpur', district: 'Lembah Pantai', is_popular: false, display_order: 22, created_at: new Date().toISOString() },
      { id: '23', name: 'Pudu', state: 'Kuala Lumpur', district: 'Bukit Bintang', is_popular: false, display_order: 23, created_at: new Date().toISOString() },
      { id: '24', name: 'Segambut', state: 'Kuala Lumpur', district: 'Segambut', is_popular: false, display_order: 24, created_at: new Date().toISOString() },
      { id: '25', name: 'Sentul', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: true, display_order: 25, created_at: new Date().toISOString() },
      { id: '26', name: 'Seputeh', state: 'Kuala Lumpur', district: 'Seputeh', is_popular: false, display_order: 26, created_at: new Date().toISOString() },
      { id: '27', name: 'Setapak', state: 'Kuala Lumpur', district: 'Wangsa Maju', is_popular: true, display_order: 27, created_at: new Date().toISOString() },
      { id: '28', name: 'Setiawangsa', state: 'Kuala Lumpur', district: 'Setiawangsa', is_popular: true, display_order: 28, created_at: new Date().toISOString() },
      { id: '29', name: 'Sri Hartamas', state: 'Kuala Lumpur', district: 'Segambut', is_popular: true, display_order: 29, created_at: new Date().toISOString() },
      { id: '30', name: 'Taman Tun Dr Ismail (TTDI)', state: 'Kuala Lumpur', district: 'Segambut', is_popular: true, display_order: 30, created_at: new Date().toISOString() },
      { id: '31', name: 'Titiwangsa', state: 'Kuala Lumpur', district: 'Titiwangsa', is_popular: false, display_order: 31, created_at: new Date().toISOString() },
      { id: '32', name: 'Wangsa Maju', state: 'Kuala Lumpur', district: 'Wangsa Maju', is_popular: true, display_order: 32, created_at: new Date().toISOString() }
    ],
    'Selangor': [
      // Alphabetically organized - Major cities, townships and districts
      { id: '33', name: 'Ampang', state: 'Selangor', district: 'Hulu Langat', is_popular: true, display_order: 1, created_at: new Date().toISOString() },
      { id: '34', name: 'Ara Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 2, created_at: new Date().toISOString() },
      { id: '35', name: 'Balakong', state: 'Selangor', district: 'Hulu Langat', is_popular: false, display_order: 3, created_at: new Date().toISOString() },
      { id: '36', name: 'Bandar Botanic', state: 'Selangor', district: 'Klang', is_popular: false, display_order: 4, created_at: new Date().toISOString() },
      { id: '37', name: 'Bandar Sunway', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 5, created_at: new Date().toISOString() },
      { id: '38', name: 'Bandar Utama', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 6, created_at: new Date().toISOString() },
      { id: '39', name: 'Bangi', state: 'Selangor', district: 'Hulu Langat', is_popular: true, display_order: 7, created_at: new Date().toISOString() },
      { id: '40', name: 'Batang Kali', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 8, created_at: new Date().toISOString() },
      { id: '41', name: 'Bukit Beruntung', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 9, created_at: new Date().toISOString() },
      { id: '42', name: 'Cheras', state: 'Selangor', district: 'Hulu Langat', is_popular: true, display_order: 10, created_at: new Date().toISOString() },
      { id: '43', name: 'Cyberjaya', state: 'Selangor', district: 'Sepang', is_popular: true, display_order: 11, created_at: new Date().toISOString() },
      { id: '44', name: 'Damansara Perdana', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 12, created_at: new Date().toISOString() },
      { id: '45', name: 'Glenmarie', state: 'Selangor', district: 'Petaling', is_popular: false, display_order: 13, created_at: new Date().toISOString() },
      { id: '46', name: 'Hulu Selangor', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 14, created_at: new Date().toISOString() },
      { id: '47', name: 'Jenjarom', state: 'Selangor', district: 'Kuala Langat', is_popular: false, display_order: 15, created_at: new Date().toISOString() },
      { id: '48', name: 'Kajang', state: 'Selangor', district: 'Hulu Langat', is_popular: true, display_order: 16, created_at: new Date().toISOString() },
      { id: '49', name: 'Kelana Jaya', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 17, created_at: new Date().toISOString() },
      { id: '50', name: 'Klang', state: 'Selangor', district: 'Klang', is_popular: true, display_order: 18, created_at: new Date().toISOString() },
      { id: '51', name: 'Kota Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 19, created_at: new Date().toISOString() },
      { id: '52', name: 'Kuala Kubu Bharu', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 20, created_at: new Date().toISOString() },
      { id: '53', name: 'Kuala Langat', state: 'Selangor', district: 'Kuala Langat', is_popular: false, display_order: 21, created_at: new Date().toISOString() },
      { id: '54', name: 'Kuala Selangor', state: 'Selangor', district: 'Kuala Selangor', is_popular: false, display_order: 22, created_at: new Date().toISOString() },
      { id: '55', name: 'Mutiara Damansara', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 23, created_at: new Date().toISOString() },
      { id: '56', name: 'Pandamaran', state: 'Selangor', district: 'Klang', is_popular: false, display_order: 24, created_at: new Date().toISOString() },
      { id: '57', name: 'Petaling Jaya', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 25, created_at: new Date().toISOString() },
      { id: '58', name: 'Port Klang', state: 'Selangor', district: 'Klang', is_popular: true, display_order: 26, created_at: new Date().toISOString() },
      { id: '59', name: 'Puchong', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 27, created_at: new Date().toISOString() },
      { id: '60', name: 'Putrajaya', state: 'Selangor', district: 'Sepang', is_popular: true, display_order: 28, created_at: new Date().toISOString() },
      { id: '61', name: 'Rawang', state: 'Selangor', district: 'Gombak', is_popular: true, display_order: 29, created_at: new Date().toISOString() },
      { id: '62', name: 'Sabak Bernam', state: 'Selangor', district: 'Sabak Bernam', is_popular: false, display_order: 30, created_at: new Date().toISOString() },
      { id: '63', name: 'Selayang', state: 'Selangor', district: 'Gombak', is_popular: true, display_order: 31, created_at: new Date().toISOString() },
      { id: '64', name: 'Semenyih', state: 'Selangor', district: 'Hulu Langat', is_popular: false, display_order: 32, created_at: new Date().toISOString() },
      { id: '65', name: 'Sepang', state: 'Selangor', district: 'Sepang', is_popular: false, display_order: 33, created_at: new Date().toISOString() },
      { id: '66', name: 'Seri Kembangan', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 34, created_at: new Date().toISOString() },
      { id: '67', name: 'Serendah', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 35, created_at: new Date().toISOString() },
      { id: '68', name: 'Shah Alam', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 36, created_at: new Date().toISOString() },
      { id: '69', name: 'SS2', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 37, created_at: new Date().toISOString() },
      { id: '70', name: 'Subang', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 38, created_at: new Date().toISOString() },
      { id: '71', name: 'Subang Jaya', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 39, created_at: new Date().toISOString() },
      { id: '72', name: 'Sunway', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 40, created_at: new Date().toISOString() },
      { id: '73', name: 'Ulu Yam', state: 'Selangor', district: 'Hulu Selangor', is_popular: false, display_order: 41, created_at: new Date().toISOString() },
      { id: '74', name: 'USJ (UEP Subang Jaya)', state: 'Selangor', district: 'Petaling', is_popular: true, display_order: 42, created_at: new Date().toISOString() }
    ]
  }

  // Load cities based on selected state
  const loadCities = async (state: string) => {
    try {
      // Try database first
      const { data: cities, error } = await supabase
        .from('cities')
        .select('*')
        .eq('state', state)
        .order('is_popular', { ascending: false })
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Error loading cities from database:', error)
        // Fallback to hardcoded data
        const fallbackCities = citiesData[state as keyof typeof citiesData] || []
        setAvailableCities(fallbackCities)
        return
      }

      setAvailableCities(cities || [])
    } catch (err) {
      console.error('Error loading cities:', err)
      // Fallback to hardcoded data
      const fallbackCities = citiesData[state as keyof typeof citiesData] || []
      setAvailableCities(fallbackCities)
    }
  }

  // Load cities when state changes
  useEffect(() => {
    if (formData.locationState) {
      loadCities(formData.locationState)
    }
  }, [formData.locationState])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    setError(null)
    setSuccessMessage(null)

    // When state changes, reset city
    if (field === 'locationState') {
      setFormData(prev => ({ ...prev, [field]: value, locationCity: '' }))
    }
  }

  const handleSaveChanges = async () => {
    if (!userData) {
      setError('No user data available')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.mobileNumber || null,
          city_id: formData.locationCity ? `${formData.locationCity}_${formData.locationState}` : null,
          preferred_language: formData.preferredLanguage,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id)
        .select('id, first_name, last_name, email, phone_number, profile_image_url, city_id, preferred_language')
        .single()

      if (error) throw error

      setHasChanges(false)
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => {
        setSuccessMessage('')
        router.push('/student-dashboard-sessions')
      }, 2000)

      // Update local user data
      setUserData(updatedUser)

    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.message || 'Failed to save profile changes')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = () => {
    console.log('Change photo clicked')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading profile...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="base" className="h-8" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-black">My Profile</h1>
            <p className="text-sm text-gray-600">Manage your personal information</p>
          </div>
        </div>
        <Button
          onClick={handleSaveChanges}
          className={`bg-black text-white hover:bg-gray-800 ${!hasChanges || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="text-red-900 font-semibold">Error</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      <div className="px-6 py-4 space-y-8">
        {/* Profile Photo Section */}
        <Card className="p-6 bg-gray-50 border-0">
          <div className="flex items-center gap-4">
            <Camera className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-black">Profile Photo</h2>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <Avatar className="w-16 h-16 border-2 border-gray-200">
              <AvatarImage
                src={avatarUrl}
                alt="Profile avatar"
                onError={(e) => {
                  // Fallback if avatar fails to load
                  const target = e.target as HTMLImageElement
                  target.src = generateUserAvatar('fallback-student', formData.email, 128)
                }}
              />
              <AvatarFallback className="bg-gray-200 text-gray-600">
                {(formData.firstName[0] || '') + (formData.lastName[0] || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button
                variant="outline"
                onClick={handlePhotoChange}
                className="mb-2"
              >
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-xs text-gray-500">Upload a profile photo (max 5MB)</p>
              <p className="text-xs text-gray-400 mt-1">Currently using auto-generated avatar</p>
            </div>
          </div>
        </Card>

        {/* Basic Information Section */}
        <Card className="p-6 bg-gray-50 border-0">
          <h2 className="text-lg font-semibold text-black mb-6">Basic Information</h2>

          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="mt-1 bg-white border-gray-200 focus:border-gray-400 focus:ring-0"
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="mt-1 bg-white border-gray-200 focus:border-gray-400 focus:ring-0"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="mt-1 bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed for security reasons
              </p>
            </div>

            {/* Mobile Number */}
            <div>
              <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700">
                Mobile Number *
              </Label>
              <div className="relative mt-1">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                  +60
                </div>
                <Input
                  id="mobileNumber"
                  value={formData.mobileNumber.replace('+60 ', '').replace('+60', '')}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d-\s]/g, '');
                    handleInputChange('mobileNumber', '+60 ' + value);
                  }}
                  className="pl-12 bg-white border-gray-200 focus:border-gray-400 focus:ring-0"
                  placeholder="12-345 6789"
                  maxLength={12}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Required – This will be shared with coaches when you book sessions
              </p>
            </div>

            {/* Location State */}
            <div>
              <Label htmlFor="locationState" className="text-sm font-medium text-gray-700">
                State *
              </Label>
              <select
                id="locationState"
                value={formData.locationState}
                onChange={(e) => handleInputChange('locationState', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
                required
              >
                <option value="Kuala Lumpur">Kuala Lumpur</option>
                <option value="Selangor">Selangor</option>
              </select>
            </div>

            {/* Location City */}
            <div>
              <Label htmlFor="locationCity" className="text-sm font-medium text-gray-700">
                City
              </Label>
              <select
                id="locationCity"
                value={formData.locationCity}
                onChange={(e) => handleInputChange('locationCity', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
                disabled={!formData.locationState}
              >
                <option value="">
                  {formData.locationState ? 'Select a city' : 'Select state first'}
                </option>
                {availableCities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {availableCities.length > 0
                  ? `${availableCities.length} cities available in ${formData.locationState}`
                  : formData.locationState
                    ? 'Loading cities...'
                    : 'Select a state to see available cities'
                }
              </p>
            </div>

            {/* Preferred Language */}
            <div>
              <Label htmlFor="preferredLanguage" className="text-sm font-medium text-gray-700">
                Preferred Language
              </Label>
              <select
                id="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none focus:ring-0"
              >
                <option value="en">English</option>
                <option value="ms">Bahasa Malaysia</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Profile Preview Section */}
        <Card className="p-6 bg-gray-50 border-0">
          <h2 className="text-lg font-semibold text-black mb-2">Profile Preview</h2>
          <p className="text-sm text-gray-600 mb-6">
            This is how your profile will appear to coaches when you book sessions
          </p>

          <Card className="p-4 bg-white border border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={avatarUrl} alt="Profile preview" />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                  {(formData.firstName[0] || '') + (formData.lastName[0] || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-black">{(formData.firstName + ' ' + formData.lastName).trim() || 'Your Name'}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{formData.locationCity && formData.locationState ? `${formData.locationCity}, ${formData.locationState}` : formData.locationState}</span>
                  {formData.mobileNumber && (
                    <>
                      <span>•</span>
                      <span>{formData.mobileNumber}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Card>
      </div>
    </div>
  )
}