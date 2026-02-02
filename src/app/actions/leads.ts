'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { LeadFormValues } from '@/lib/validations'

export async function getEmployee() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  })

  return employee
}

export async function getOrCreateEmployee() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  let employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  })

  if (!employee) {
    // Create employee record if it doesn't exist
    employee = await prisma.employee.create({
      data: {
        userId: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Employee',
      },
    })
  }

  return employee
}

export async function getLeadsByDate(date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  })

  if (!employee) {
    return []
  }

  const leads = await prisma.lead.findMany({
    where: {
      employeeId: employee.id,
      date: new Date(date),
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return leads.map(lead => ({
    ...lead,
    date: lead.date.toISOString().split('T')[0],
    slotDate: lead.slotDate?.toISOString().split('T')[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }))
}

export async function getFollowUpLeads() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  })

  if (!employee) {
    return []
  }

  const leads = await prisma.lead.findMany({
    where: {
      employeeId: employee.id,
      responseStatus: 'CALL_LATER',
    },
    orderBy: {
      date: 'desc',
    },
  })

  return leads.map(lead => ({
    ...lead,
    date: lead.date.toISOString().split('T')[0],
    slotDate: lead.slotDate?.toISOString().split('T')[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }))
}

export async function getCompletedLeads() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  })

  if (!employee) {
    return []
  }

  const leads = await prisma.lead.findMany({
    where: {
      employeeId: employee.id,
      OR: [
        { responseStatus: 'INTERESTED' },
        { responseStatus: 'NOT_INTERESTED' },
      ],
    },
    orderBy: {
      date: 'desc',
    },
    take: 50,
  })

  return leads.map(lead => ({
    ...lead,
    date: lead.date.toISOString().split('T')[0],
    slotDate: lead.slotDate?.toISOString().split('T')[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }))
}

export async function createLead(data: LeadFormValues) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  })

  if (!employee) {
    throw new Error('Employee not found')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lead = await prisma.lead.create({
    data: {
      employeeId: employee.id,
      date: today,
      collegeName: data.collegeName,
      location: data.location || null,
      contactPerson: data.contactPerson || null,
      designation: data.designation || null,
      phone: data.phone || null,
      callType: data.callType,
      slotRequested: data.slotRequested,
      slotDate: data.slotDate ? new Date(data.slotDate) : null,
      responseStatus: data.responseStatus,
      remarks: data.remarks || null,
    },
  })

  revalidatePath('/dashboard')

  return {
    ...lead,
    date: lead.date.toISOString().split('T')[0],
    slotDate: lead.slotDate?.toISOString().split('T')[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }
}

export async function updateLead(id: string, data: Partial<LeadFormValues>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  })

  if (!employee) {
    throw new Error('Employee not found')
  }

  // Verify the lead belongs to this employee
  const existingLead = await prisma.lead.findFirst({
    where: {
      id,
      employeeId: employee.id,
    },
  })

  if (!existingLead) {
    throw new Error('Lead not found')
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      collegeName: data.collegeName,
      location: data.location || null,
      contactPerson: data.contactPerson || null,
      designation: data.designation || null,
      phone: data.phone || null,
      callType: data.callType,
      slotRequested: data.slotRequested,
      slotDate: data.slotDate ? new Date(data.slotDate) : null,
      responseStatus: data.responseStatus,
      remarks: data.remarks || null,
    },
  })

  revalidatePath('/dashboard')

  return {
    ...lead,
    date: lead.date.toISOString().split('T')[0],
    slotDate: lead.slotDate?.toISOString().split('T')[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }
}
