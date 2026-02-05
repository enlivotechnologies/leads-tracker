"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Helper function to parse date string as local date
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Check if current user is admin
export async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  return employee?.role === "ADMIN";
}

// Get current admin
export async function getAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
  });

  if (employee?.role !== "ADMIN") return null;
  return employee;
}

// Dashboard KPIs for a specific date
export async function getDashboardKPIs(date: string) {
  const targetDate = parseLocalDate(date);

  const [totalCalls, slotsBooked, followUpsPending, totalDeals, totalUsers] =
    await prisma.$transaction([
      // Total calls made today
      prisma.lead.count({
        where: { date: targetDate },
      }),

      // Slots booked today
      prisma.lead.count({
        where: {
          date: targetDate,
          slotRequested: true,
          slotDate: { not: null },
        },
      }),

      // Follow-ups pending (all time, not completed)
      prisma.lead.count({
        where: {
          followUpDate: { not: null },
          followUpDone: false,
          OR: [{ slotDate: null }, { slotRequested: false }],
        },
      }),

      // Total leads (all time)
      prisma.lead.count(),

      // Total users (employees) in database
      prisma.employee.count(),
    ]);

  return {
    totalCalls,
    slotsBooked,
    followUpsPending,
    totalDeals,
    totalUsers,
  };
}

// Employee performance table
export async function getEmployeePerformance(date: string) {
  const targetDate = parseLocalDate(date);

  const employees = await prisma.employee.findMany({
    where: { role: "EMPLOYEE", isActive: true },
    include: {
      leads: {
        where: { date: targetDate },
      },
    },
    orderBy: { name: "asc" },
  });

  return employees.map((emp: any) => {
    const calls = emp.leads.length;
    const slots = emp.leads.filter(
      (l: any) => l.slotRequested && l.slotDate,
    ).length;
    const interested = emp.leads.filter(
      (l: any) => l.responseStatus === "INTERESTED",
    ).length;
    const followUps = emp.leads.filter(
      (l: any) => l.responseStatus === "CALL_LATER",
    ).length;
    const interestedRate =
      calls > 0 ? Math.round((interested / calls) * 100) : 0;

    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      calls,
      slots,
      followUps,
      interested,
      interestedRate,
    };
  });
}

// Get all employees summary (for admin overview)
export async function getAllEmployeesSummary() {
  const employees = await prisma.employee.findMany({
    where: { role: "EMPLOYEE", isActive: true },
    include: {
      _count: {
        select: { leads: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return employees.map((emp: any) => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    totalLeads: emp._count.leads,
    isActive: emp.isActive,
  }));
}

// Get employee detail with their leads
export async function getEmployeeDetail(employeeId: string, date?: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) return null;

  const whereClause: { employeeId: string; date?: Date } = { employeeId };
  if (date) {
    whereClause.date = parseLocalDate(date);
  }

  const leads = await prisma.lead.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Calculate stats
  const totalCalls = leads.length;
  const totalSlots = leads.filter(
    (l: any) => l.slotRequested && l.slotDate,
  ).length;
  const interestedCount = leads.filter(
    (l: any) => l.responseStatus === "INTERESTED",
  ).length;
  const followUpCount = leads.filter(
    (l: any) => l.responseStatus === "CALL_LATER" && !l.followUpDone,
  ).length;

  return {
    employee: {
      ...employee,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    },
    leads: leads.map((lead: any) => ({
      ...lead,
      date: lead.date.toISOString().split("T")[0],
      slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    })),
    stats: {
      totalCalls,
      totalSlots,
      interestedCount,
      followUpCount,
      conversionRate:
        totalCalls > 0 ? Math.round((totalSlots / totalCalls) * 100) : 0,
    },
  };
}

// Get all leads with filters
export async function getLeadsWithFilters(filters: {
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
  status?: string;
  slotBooked?: string;
  isFlagged?: boolean;
}) {
  const where: any = {};

  if (filters.dateFrom && filters.dateTo) {
    where.date = {
      gte: parseLocalDate(filters.dateFrom),
      lte: parseLocalDate(filters.dateTo),
    };
  } else if (filters.dateFrom) {
    where.date = { gte: parseLocalDate(filters.dateFrom) };
  } else if (filters.dateTo) {
    where.date = { lte: parseLocalDate(filters.dateTo) };
  }

  if (filters.employeeId) {
    where.employeeId = filters.employeeId;
  }

  if (filters.status) {
    where.responseStatus = filters.status;
  }

  if (filters.slotBooked === "yes") {
    where.slotRequested = true;
    where.slotDate = { not: null };
  } else if (filters.slotBooked === "no") {
    where.OR = [{ slotRequested: false }, { slotDate: null }];
  }

  if (filters.isFlagged) {
    where.isFlagged = true;
  }

  const leads = await prisma.lead.findMany({
    where,
    include: {
      employee: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return leads.map((lead: any) => ({
    ...lead,
    phoneNumber: lead.phone ?? "",
    date: lead.date.toISOString().split("T")[0],
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));
}

// Get pending follow-ups
export async function getPendingFollowUps() {
  const leads = await prisma.lead.findMany({
    where: {
      followUpDate: { not: null },
      followUpDone: false,
      OR: [{ slotDate: null }, { slotRequested: false }],
    },
    include: {
      employee: {
        select: { name: true },
      },
    },
    orderBy: { date: "desc" },
  });

  return leads.map((lead: any) => ({
    ...lead,
    contactPerson: lead.contactPerson ?? "",
    phoneNumber: lead.phone ?? "",
    date: lead.date.toISOString().split("T")[0],
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
    followUpDate: lead.followUpDate?.toISOString().split("T")[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));
}

// Get upcoming slots
export async function getUpcomingSlots() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const leads = await prisma.lead.findMany({
    where: {
      slotRequested: true,
      slotDate: { gte: today },
    },
    include: {
      employee: {
        select: { name: true },
      },
    },
    orderBy: { slotDate: "asc" },
  });

  return leads.map((lead: any) => ({
    ...lead,
    contactPerson: lead.contactPerson ?? "",
    phoneNumber: lead.phone ?? "",
    slotTime: null, // slotTime field not yet in schema
    date: lead.date.toISOString().split("T")[0],
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));
}

// Admin actions on leads
export async function updateLeadAdmin(
  leadId: string,
  data: {
    adminRemarks?: string;
    isFlagged?: boolean;
    followUpDone?: boolean;
  },
) {
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data,
  });

  revalidatePath("/admin");
  return lead;
}

// Mark follow-up as done
export async function markFollowUpDone(leadId: string) {
  return updateLeadAdmin(leadId, { followUpDone: true });
}

// Add admin remarks
export async function addAdminRemarks(leadId: string, remarks: string) {
  return updateLeadAdmin(leadId, { adminRemarks: remarks });
}

// Get date-wise activity report
export async function getDateWiseReport(dateFrom: string, dateTo: string) {
  const leads = await prisma.lead.findMany({
    where: {
      date: {
        gte: parseLocalDate(dateFrom),
        lte: parseLocalDate(dateTo),
      },
    },
    include: {
      employee: {
        select: { name: true },
      },
    },
    orderBy: { date: "desc" },
  });

  // Group by date and employee
  const report: Record<
    string,
    Record<string, { calls: number; slots: number; followUps: number }>
  > = {};

  leads.forEach((lead: any) => {
    const dateStr = lead.date.toISOString().split("T")[0];
    const empName = lead.employee.name;

    if (!report[dateStr]) report[dateStr] = {};
    if (!report[dateStr][empName]) {
      report[dateStr][empName] = { calls: 0, slots: 0, followUps: 0 };
    }

    report[dateStr][empName].calls++;
    if (lead.slotRequested && lead.slotDate) report[dateStr][empName].slots++;
    if (lead.responseStatus === "CALL_LATER")
      report[dateStr][empName].followUps++;
  });

  return report;
}
