"use client"

import React, { useState, useEffect } from "react"
import {
  Plus,
  Clock,
  MapPin,
  Monitor,
  DollarSign,
  Users,
  Pencil,
  Trash2,
  X,
  Type,
  Tags,
  FileText,
  ChevronDown,
  Loader2
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CoachHeader } from "./CoachHeader"
import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth"

interface Service {
  id: string
  service_name: string
  sport_name: string
  description: string
  duration_minutes: number
  location_types: string[]
  price_myr: number
  max_participants: number
}

interface Sport {
  id: string
  name: string
  category: string
}

interface NewService {
  title: string
  sport_id: string
  duration: string
  price: string
  type: string[]
  maxStudents: string
  description: string
}

export function CoachServicesManager() {
  const [services, setServices] = useState<Service[]>([])
  const [sports, setSports] = useState<Sport[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [newService, setNewService] = useState<NewService>({
    title: "",
    sport_id: "",
    duration: "",
    price: "",
    type: [],
    maxStudents: "",
    description: ""
  })

  // Fetch coach services and sports data on component mount
  useEffect(() => {
    authenticateAndFetchData()
  }, [])

  const authenticateAndFetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get the current authenticated user
      const user = await getCurrentUser()
      if (!user) {
        setError('Please sign in to manage your services')
        return
      }

      if (user.user_type !== 'coach') {
        setError('Only coaches can manage services')
        return
      }

      setCurrentUser(user)
      await fetchData(user.id)
    } catch (err: any) {
      setError(err.message)
      console.error('Error in authentication:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async (coachId: string) => {
    try {

      // Fetch coach services with sport information
      const { data: servicesData, error: servicesError } = await supabase
        .from('coach_services')
        .select(`
          id,
          service_name,
          description,
          duration_minutes,
          price_myr,
          max_participants,
          location_types,
          sports!inner(name)
        `)
        .eq('coach_id', coachId)
        .eq('is_active', true)

      if (servicesError) throw servicesError

      // Transform data to match component interface
      const transformedServices = servicesData?.map(service => ({
        id: service.id,
        service_name: service.service_name,
        sport_name: (service.sports as any).name,
        description: service.description,
        duration_minutes: service.duration_minutes,
        location_types: service.location_types,
        price_myr: service.price_myr,
        max_participants: service.max_participants
      })) || []

      // Fetch available sports for dropdown
      const { data: sportsData, error: sportsError } = await supabase
        .from('sports')
        .select('id, name, category')
        .order('display_order', { ascending: true })

      if (sportsError) throw sportsError

      setServices(transformedServices)
      setSports(sportsData || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching data:', err)
    }
  }

  const handleAddService = async () => {
    if (!newService.title || !newService.sport_id || !newService.duration || !newService.price) {
      setError('Please fill in all required fields: Service Name, Sport, Duration, and Price')
      return
    }

    if (!currentUser) {
      setError('User not authenticated. Please refresh the page.')
      return
    }

    try {
      // Insert new service into database using authenticated user ID
      const { data, error } = await supabase
        .from('coach_services')
        .insert({
          coach_id: currentUser.id,
          sport_id: newService.sport_id,
          service_name: newService.title,
          description: newService.description,
          duration_minutes: parseInt(newService.duration),
          price_myr: parseFloat(newService.price),
          max_participants: parseInt(newService.maxStudents) || 1,
          location_types: newService.type.length > 0 ? newService.type : ['outdoor']
        })
        .select(`
          id,
          service_name,
          description,
          duration_minutes,
          price_myr,
          max_participants,
          location_types,
          sports!inner(name)
        `)
        .single()

      if (error) throw error

      // Add new service to local state
      if (data) {
        const newServiceData: Service = {
          id: data.id,
          service_name: data.service_name,
          sport_name: (data.sports as any).name,
          description: data.description,
          duration_minutes: data.duration_minutes,
          location_types: data.location_types,
          price_myr: data.price_myr,
          max_participants: data.max_participants
        }
        setServices([...services, newServiceData])
      }

      // Reset form
      setNewService({
        title: "",
        sport_id: "",
        duration: "",
        price: "",
        type: [],
        maxStudents: "",
        description: ""
      })
      setIsAddModalOpen(false)
    } catch (err: any) {
      setError(err.message)
      console.error('Error adding service:', err)
    }
  }

  const handleDeleteService = async (id: string) => {
    try {
      // Delete from database (soft delete by setting is_active to false)
      const { error } = await supabase
        .from('coach_services')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      // Remove from local state
      setServices(services.filter(service => service.id !== id))
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting service:', err)
    }
  }

  const getTypeIcon = (locationTypes: string[]) => {
    if (locationTypes.includes("online")) {
      return <Monitor className="w-4 h-4" />
    }
    return <MapPin className="w-4 h-4" />
  }

  const getTypeLabel = (locationTypes: string[]) => {
    if (locationTypes.includes("online") && locationTypes.includes("outdoor")) {
      return "Online & In-Person"
    }
    if (locationTypes.includes("online")) {
      return "Online Only"
    }
    return "In-Person Only"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachHeader title="My Services" subtitle="Manage your coaching services" showBackButton={true} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading your services...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachHeader
        title="My Services"
        subtitle="Manage your coaching services"
        showBackButton={true}
      >
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>Add New Service</DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">Create a new coaching service for your students</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Service Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name
                  </label>
                  <div className="relative">
                    <Type className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Individual Tennis Lesson"
                      value={newService.title}
                      onChange={(e) => setNewService({...newService, title: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Sport */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sport
                  </label>
                  <div className="relative">
                    <Tags className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <select
                      value={newService.sport_id}
                      onChange={(e) => setNewService({...newService, sport_id: e.target.value})}
                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none"
                    >
                      <option value="">Select sport</option>
                      {sports.map((sport) => (
                        <option key={sport.id} value={sport.id}>
                          {sport.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Duration and Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="60"
                        value={newService.duration}
                        onChange={(e) => setNewService({...newService, duration: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (RM)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="50"
                        value={newService.price}
                        onChange={(e) => setNewService({...newService, price: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newService.type.includes("outdoor")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewService({...newService, type: [...newService.type, "outdoor"]})
                          } else {
                            setNewService({...newService, type: newService.type.filter(t => t !== "outdoor")})
                          }
                        }}
                        className="mr-2 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">In-Person</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newService.type.includes("online")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewService({...newService, type: [...newService.type, "online"]})
                          } else {
                            setNewService({...newService, type: newService.type.filter(t => t !== "online")})
                          }
                        }}
                        className="mr-2 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">Online</span>
                    </label>
                  </div>
                </div>

                {/* Maximum Students */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Students
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      placeholder="1"
                      value={newService.maxStudents}
                      onChange={(e) => setNewService({...newService, maxStudents: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      placeholder="Describe what this service includes..."
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      rows={3}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddService}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Add Service
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
      </CoachHeader>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-600 mb-4">Create your first service to start accepting bookings</p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{service.service_name}</h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                      {service.sport_name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {service.duration_minutes} minutes
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  RM{service.price_myr}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {getTypeIcon(service.location_types)}
                  {getTypeLabel(service.location_types)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  Max {service.max_participants} student{service.max_participants !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}