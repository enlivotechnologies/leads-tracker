'use client'

import { Lead } from '@/lib/types'
import { LeadCard } from './lead-card'
import { FileX } from 'lucide-react'

interface LeadsListProps {
  leads: Lead[]
  emptyMessage?: string
  emptySubMessage?: string
}

export function LeadsList({ leads, emptyMessage = 'No leads yet', emptySubMessage }: LeadsListProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 p-4 mb-4">
          <FileX className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">{emptyMessage}</p>
        {emptySubMessage && (
          <p className="text-sm text-gray-400 mt-1">{emptySubMessage}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  )
}
