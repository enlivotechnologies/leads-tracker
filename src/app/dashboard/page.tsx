import { redirect } from 'next/navigation'
import { getOrCreateEmployee, getLeadsByDate } from '@/app/actions/leads'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { getDateString } from '@/lib/utils'

export default async function DashboardPage() {
  const employee = await getOrCreateEmployee().catch(() => null)

  if (!employee) {
    redirect('/login')
  }

  // Get today's leads
  const today = new Date()
  const todayString = getDateString(today)
  const initialLeads = await getLeadsByDate(todayString)

  return (
    <DashboardClient 
      employeeName={employee.name} 
      initialLeads={initialLeads}
    />
  )
}
