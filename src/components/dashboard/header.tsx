'use client'

import { LogOut } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { formatFullDate } from '@/lib/utils'

interface DashboardHeaderProps {
  employeeName: string
}

export function DashboardHeader({ employeeName }: DashboardHeaderProps) {
  const today = new Date()
  const firstName = employeeName.split(' ')[0]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Hey, {firstName} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">CSR Outreach – Today</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatFullDate(today)}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
