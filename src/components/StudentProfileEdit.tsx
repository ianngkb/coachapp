'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Camera, Save, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'

export const StudentProfileEdit = () => {
  const [formData, setFormData] = useState({
    fullName: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    mobileNumber: '+60 12-345 6789',
    age: '28'
  })

  const [hasChanges, setHasChanges] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSaveChanges = () => {
    console.log('Saving changes:', formData)
    setHasChanges(false)
  }

  const handlePhotoChange = () => {
    console.log('Change photo clicked')
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
          className={`bg-black text-white hover:bg-gray-800 ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!hasChanges}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="px-6 py-4 space-y-8">
        {/* Profile Photo Section */}
        <Card className="p-6 bg-gray-50 border-0">
          <div className="flex items-center gap-4">
            <Camera className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-black">Profile Photo</h2>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Profile photo" />
              <AvatarFallback className="bg-gray-200 text-gray-600">
                {formData.fullName.split(' ').map(n => n[0]).join('')}
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
            </div>
          </div>
        </Card>

        {/* Basic Information Section */}
        <Card className="p-6 bg-gray-50 border-0">
          <h2 className="text-lg font-semibold text-black mb-6">Basic Information</h2>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name *
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="mt-1 bg-white border-gray-200 focus:border-gray-400 focus:ring-0"
                required
              />
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
                <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-gray-400 focus:ring-0"
                  placeholder="+60 12-345 6789"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Required – This will be shared with coaches when you book sessions
              </p>
            </div>

            {/* Age */}
            <div>
              <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="mt-1 bg-white border-gray-200 focus:border-gray-400 focus:ring-0"
                min="1"
                max="120"
              />
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
                <AvatarImage src="/placeholder-avatar.jpg" alt="Profile preview" />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                  {formData.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-black">{formData.fullName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Age {formData.age}</span>
                  <span>•</span>
                  <span>{formData.mobileNumber}</span>
                </div>
              </div>
            </div>
          </Card>
        </Card>
      </div>
    </div>
  )
}