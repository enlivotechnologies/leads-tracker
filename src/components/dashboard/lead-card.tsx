'use client'

import { Lead } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeadCardProps {
  lead: Lead
  onClick?: () => void
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'INTERESTED':
        return 'interested'
      case 'CALL_LATER':
        return 'callLater'
      case 'NOT_INTERESTED':
        return 'notInterested'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'INTERESTED':
        return 'Interested'
      case 'CALL_LATER':
        return 'Call Later'
      case 'NOT_INTERESTED':
        return 'Not Interested'
      default:
        return status
    }
  }

  const getCallTypeLabel = (type: string) => {
    return type === 'FOLLOW_UP' ? 'Follow-up' : 'First Call'
  }

  return (
    <Card 
      className={cn(
        'transition-all active:scale-[0.98]',
        onClick && 'cursor-pointer hover:shadow-md'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-tight">
            {lead.collegeName}
          </CardTitle>
          <Badge variant={getStatusVariant(lead.responseStatus)}>
            {getStatusLabel(lead.responseStatus)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {lead.location && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            <span>{lead.location}</span>
          </div>
        )}
        
        <div className="flex items-center gap-3 flex-wrap">
          {lead.callType === 'FOLLOW_UP' && (
            <Badge variant="followUp" className="text-[10px]">
              {getCallTypeLabel(lead.callType)}
            </Badge>
          )}
          
          {lead.slotDate && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Slot: {new Date(lead.slotDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}</span>
            </div>
          )}
          
          {lead.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="h-3 w-3" />
              <span>{lead.phone}</span>
            </div>
          )}
        </div>

        {lead.contactPerson && (
          <p className="text-sm text-gray-600">
            Contact: {lead.contactPerson}
            {lead.designation && ` (${lead.designation.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())})`}
          </p>
        )}

        {lead.remarks && (
          <p className="text-sm text-gray-500 italic line-clamp-2">
            "{lead.remarks}"
          </p>
        )}
      </CardContent>
    </Card>
  )
}
