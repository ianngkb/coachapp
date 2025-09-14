"use client"

import React, { useState } from "react"
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
  ChevronDown
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CoachHeader } from "./CoachHeader"

interface Service {
  id: string
  title: string
  tag: string
  description: string
  duration: number
  type: string
  price: number
  maxStudents: number
}

const mockServices: Service[] = [
  {
    id: "1",
    title: "Individual Tennis Lesson",
    tag: "Individual",
    description: "One-on-one coaching focusing on technique, strategy, and match play",
    duration: 60,
    type: "In-Person Only",
    price: 80,
    maxStudents: 1
  },
  {
    id: "2",
    title: "Fitness & Conditioning",
    tag: "Fitness",
    description: "Tennis-specific fitness training to improve agility, strength, and endurance",
    duration: 45,
    type: "Online & In-Person",
    price: 60,
    maxStudents: 4
  },
  {
    id: "3",
    title: "Strategy Session",
    tag: "Strategy",
    description: "Online session focusing on match strategy and mental game",
    duration: 30,
    type: "Online Only",
    price: 40,
    maxStudents: 1
  }
]

export function CoachServicesManager() {
  const [services, setServices] = useState<Service[]>(mockServices)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newService, setNewService] = useState({
    title: "",
    category: "",
    duration: "",
    price: "",
    type: "",
    maxStudents: "",
    description: ""
  })

  const handleAddService = () => {
    if (!newService.title || !newService.category || !newService.duration || !newService.price) {
      return
    }

    const service: Service = {
      id: Date.now().toString(),
      title: newService.title,
      tag: newService.category,
      description: newService.description,
      duration: parseInt(newService.duration),
      type: newService.type,
      price: parseInt(newService.price),
      maxStudents: parseInt(newService.maxStudents) || 1
    }

    setServices([...services, service])
    setNewService({
      title: "",
      category: "",
      duration: "",
      price: "",
      type: "",
      maxStudents: "",
      description: ""
    })
    setIsAddModalOpen(false)
  }

  const handleDeleteService = (id: string) => {
    setServices(services.filter(service => service.id !== id))
  }

  const getTypeIcon = (type: string) => {
    if (type === "Online Only" || type === "Online & In-Person") {
      return <Monitor className="w-4 h-4" />
    }
    return <MapPin className="w-4 h-4" />
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

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <Tags className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <select
                      value={newService.category}
                      onChange={(e) => setNewService({...newService, category: e.target.value})}
                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none"
                    >
                      <option value="">Select category</option>
                      <option value="Individual">Individual</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Strategy">Strategy</option>
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
                  <div className="relative">
                    <Monitor className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <select
                      value={newService.type}
                      onChange={(e) => setNewService({...newService, type: e.target.value})}
                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none"
                    >
                      <option value="">Select type</option>
                      <option value="In-Person Only">In-Person Only</option>
                      <option value="Online & In-Person">Online & In-Person</option>
                      <option value="Online Only">Online Only</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
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

      {/* Services List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {services.map((service) => (
          <div key={service.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{service.title}</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                    {service.tag}
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
                {service.duration} minutes
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                RM{service.price}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {getTypeIcon(service.type)}
                {service.type}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                Max {service.maxStudents} student{service.maxStudents !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}