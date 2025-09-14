'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CoachHeader } from './CoachHeader'
import {
  Camera,
  Save,
  Phone,
  MapPin,
  ChevronDown,
  CheckSquare,
  FileText
} from 'lucide-react'

export default function CoachProfileEdit() {
  const router = useRouter()
  const [selectedSports, setSelectedSports] = useState(['Tennis'])
  const [selectedCourts, setSelectedCourts] = useState(['Base Pickle and Padel', 'KLCC Tennis Centre'])
  const [formData, setFormData] = useState({
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    phone: '+60 12-345 6789',
    location: 'Kuala Lumpur',
    city: 'Kuala Lumpur City Centre',
    yearsExperience: '8',
    certifications: 'ITT Level 2, Fitness Training Certified',
    languages: 'English, Mandarin',
    specialties: 'Technique, Strategy, Fitness',
    bio: 'Professional tennis coach with over 8 years of experience. Specialized in technique improvement and match strategy for players of all levels.'
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveChanges = () => {
    console.log('Saving profile changes...', { formData, selectedSports, selectedCourts })
  }

  const handleBack = () => {
    router.push('/coach-profile')
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
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="/api/placeholder/80/80"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <Button variant="outline" className="mb-2">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-sm text-gray-600">Upload a professional photo (max 5MB)</p>
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1"
              />
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
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+60 XX-XXX XXXX"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Malaysian phone numbers only</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <div className="relative mt-1">
                  <select
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white appearance-none pr-8"
                  >
                    <option>Kuala Lumpur</option>
                    <option>Selangor</option>
                    <option>Penang</option>
                    <option>Johor</option>
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
                  >
                    <option>Kuala Lumpur City Centre</option>
                    <option>Bangsar</option>
                    <option>Mont Kiara</option>
                    <option>Damansara</option>
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
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
                <h3 className="font-semibold text-lg">{formData.name}</h3>
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