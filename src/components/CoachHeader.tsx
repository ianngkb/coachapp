"use client"

import Link from 'next/link'
import { Settings, User, ArrowLeft } from 'lucide-react'

interface CoachHeaderProps {
  title: string
  subtitle: string
  showBackButton?: boolean
  backHref?: string
  children?: React.ReactNode
}

export function CoachHeader({
  title,
  subtitle,
  showBackButton = false,
  backHref = "/coach-dashboard",
  children
}: CoachHeaderProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="base" className="h-8" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/coach-services"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Services
            </Link>
            <Link
              href="/coach-profile-edit"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">A</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link
              href={backHref}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          {children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}