"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { LeadFormValues } from "@/lib/validations";

// Helper function to parse date string as local date
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export async function getEmployee() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  return employee;
}

export async function getOrCreateEmployee() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  let employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  if (!employee) {
    // Create employee record if it doesn't exist
    employee = await prisma.employee.create({
      data: {
        userId: user.id,
        email: user.email!,
        name:
          user.user_metadata?.name || user.email?.split("@")[0] || "Employee",
      },
    });
  }

  return employee;
}

// Helper to check if a date string is today
function isTodayDate(dateStr: string): boolean {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;
  return dateStr === todayStr;
}

export async function getLeadsByDate(date: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  if (!employee) {
    return [];
  }

  const targetDate = parseLocalDate(date);
  const isToday = isTodayDate(date);

  // For today: show all leads
  // For past dates: show only completed leads (INTERESTED or NOT_INTERESTED)
  const whereClause = isToday
    ? {
        employeeId: employee.id,
        date: targetDate,
      }
    : {
        employeeId: employee.id,
        date: targetDate,
        OR: [
          { responseStatus: "INTERESTED" },
          { responseStatus: "NOT_INTERESTED" },
        ],
      };

  const leads = await prisma.lead.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
  });

  return leads.map((lead) => ({
    ...lead,
    date: lead.date.toISOString().split("T")[0],
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));
}

export async function getFollowUpLeads() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  if (!employee) {
    return [];
  }

  const leads = await prisma.lead.findMany({
    where: {
      employeeId: employee.id,
      responseStatus: "CALL_LATER",
    },
    orderBy: {
      date: "desc",
    },
  });

  return leads.map((lead) => ({
    ...lead,
    date: lead.date.toISOString().split("T")[0],
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));
}

export async function getCompletedLeads() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  if (!employee) {
    return [];
  }

  const leads = await prisma.lead.findMany({
    where: {
      employeeId: employee.id,
      OR: [
        { responseStatus: "INTERESTED" },
        { responseStatus: "NOT_INTERESTED" },
      ],
    },
    orderBy: {
      date: "desc",
    },
    take: 50,
  });

  return leads.map((lead) => ({
    ...lead,
    date: lead.date.toISOString().split("T")[0],
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));
}

export async function getAllEmployeeLeads() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  if (!employee) {
    return [];
  }

  const leads = await prisma.lead.findMany({
    where: {
      employeeId: employee.id,
    },
    orderBy: {
      date: "desc",
    },
    take: 100,
  });

  return leads.map((lead) => ({
    ...lead,
    date: lead.date.toISOString().split("T")[0],
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));
}

export async function createLead(data: LeadFormValues, dateString: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const leadDate = parseLocalDate(dateString);

  const lead = await prisma.lead.create({
    data: {
      employeeId: employee.id,
      date: leadDate,
      collegeName: data.collegeName,
      location: data.location || null,
      contactPerson: data.contactPerson || null,
      designation: data.designation || null,
      phone: data.phone || null,
      callType: data.callType,
      slotRequested: data.slotRequested,
      slotDate: data.slotDate ? parseLocalDate(data.slotDate) : null,
      responseStatus: data.responseStatus,
      remarks: data.remarks || null,
    },
  });

  revalidatePath("/dashboard");

  return {
    ...lead,
    date: lead.date.toISOString().split("T")[0],
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

export async function updateLead(id: string, data: Partial<LeadFormValues>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  // Verify the lead belongs to this employee
  const existingLead = await prisma.lead.findFirst({
    where: {
      id,
      employeeId: employee.id,
    },
  });

  if (!existingLead) {
    throw new Error("Lead not found");
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
      slotDate: data.slotDate ? parseLocalDate(data.slotDate) : null,
      responseStatus: data.responseStatus,
      remarks: data.remarks || null,
    },
  });

  revalidatePath("/dashboard");

  return {
    ...lead,
    date: lead.date.toISOString().split("T")[0],
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}
