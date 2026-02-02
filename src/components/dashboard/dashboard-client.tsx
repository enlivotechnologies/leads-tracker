'use client'

import { useState, useEffect, useCallback } from 'react'
import { Lead } from '@/lib/types'
import { LeadFormValues } from '@/lib/validations'
import { getDateString, isPastDate, isToday } from '@/lib/utils'
import { DashboardHeader } from '@/components/dashboard/header'
import { DateSelector } from '@/components/dashboard/date-selector'
import { LeadsList } from '@/components/dashboard/leads-list'
import { AddLeadForm } from '@/components/dashboard/add-lead-form'
import { FloatingActionButton } from '@/components/dashboard/floating-action-button'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading'
import { 
  getLeadsByDate, 
  getFollowUpLeads, 
  getCompletedLeads, 
  createLead 
} from '@/app/actions/leads'

interface DashboardClientProps {
  employeeName: string
  initialLeads: Lead[]
}

export function DashboardClient({ employeeName, initialLeads }: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState('today')
  const [isAddingLead, setIsAddingLead] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [todayLeads, setTodayLeads] = useState<Lead[]>(initialLeads)
  const [followUpLeads, setFollowUpLeads] = useState<Lead[]>([])
  const [completedLeads, setCompletedLeads] = useState<Lead[]>([])

  const isPast = isPastDate(selectedDate)
  const canAddLead = isToday(selectedDate) && !isPast

  const fetchLeadsForDate = useCallback(async (date: Date) => {
    setIsLoading(true)
    try {
      const dateString = getDateString(date)
      const leads = await getLeadsByDate(dateString)
      setTodayLeads(leads)
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchFollowUps = useCallback(async () => {
    setIsLoading(true)
    try {
      const leads = await getFollowUpLeads()
      setFollowUpLeads(leads)
    } catch (error) {
      console.error('Error fetching follow-ups:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchCompleted = useCallback(async () => {
    setIsLoading(true)
    try {
      const leads = await getCompletedLeads()
      setCompletedLeads(leads)
    } catch (error) {
      console.error('Error fetching completed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch leads when date or tab changes
  useEffect(() => {
    if (activeTab === 'today') {
      fetchLeadsForDate(selectedDate)
    } else if (activeTab === 'followups') {
      fetchFollowUps()
    } else if (activeTab === 'completed') {
      fetchCompleted()
    }
  }, [selectedDate, activeTab, fetchLeadsForDate, fetchFollowUps, fetchCompleted])

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    setActiveTab('today')
  }

  const handleAddLead = async (data: LeadFormValues) => {
    try {
      const newLead = await createLead(data)
      setTodayLeads((prev) => [newLead, ...prev])
      setIsAddingLead(false)
    } catch (error) {
      console.error('Error creating lead:', error)
      alert('Failed to save lead. Please try again.')
    }
  }

  const getEmptyMessage = () => {
    if (activeTab === 'followups') {
      return 'No follow-ups pending'
    }
    if (activeTab === 'completed') {
      return 'No completed leads yet'
    }
    return isPast ? 'No leads recorded for this date' : 'No leads yet'
  }

  const getEmptySubMessage = () => {
    if (activeTab === 'today' && canAddLead) {
      return 'Tap + to add your first lead'
    }
    return undefined
  }

  const getCurrentLeads = () => {
    switch (activeTab) {
      case 'followups':
        return followUpLeads
      case 'completed':
        return completedLeads
      default:
        return todayLeads
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader employeeName={employeeName} />

      <main className="px-5 py-4 pb-24">
        {/* Date Selector */}
        <div className="mb-4">
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </div>

        {/* Past Date Notice */}
        {isPast && activeTab === 'today' && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
            📅 Viewing past date (read-only)
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="today">Today's Leads</TabsTrigger>
            <TabsTrigger value="followups">Follow-ups</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Leads List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <LeadsList
            leads={getCurrentLeads()}
            emptyMessage={getEmptyMessage()}
            emptySubMessage={getEmptySubMessage()}
          />
        )}
      </main>

      {/* Floating Action Button - Only show for today */}
      {canAddLead && (
        <FloatingActionButton onClick={() => setIsAddingLead(true)} />
      )}

      {/* Add Lead Bottom Sheet */}
      <BottomSheet
        isOpen={isAddingLead}
        onClose={() => setIsAddingLead(false)}
        title="Add New Lead"
      >
        <AddLeadForm
          onSubmit={handleAddLead}
          onCancel={() => setIsAddingLead(false)}
        />
      </BottomSheet>
    </div>
  )
}
