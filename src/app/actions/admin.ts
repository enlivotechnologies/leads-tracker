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

  const [totalCalls, slotsBooked, totalDeals, totalUsers] =
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

      // Total leads (all time)
      prisma.lead.count(),

      // Total users (employees) in database
      prisma.employee.count(),
    ]);

  // Follow-ups pending (all time, not completed) - same logic as getPendingFollowUps
  const followUpsPending = await prisma.lead.count({
    where: {
      OR: [
        // Leads with explicit follow-up date that are not done
        {
          followUpDate: { not: null },
          followUpDone: false,
        },
        // Leads with CALL_LATER status (need follow-up even without explicit date)
        {
          responseStatus: "CALL_LATER",
          followUpDone: false,
        },
      ],
      // Exclude leads that already have a slot booked
      AND: [{ OR: [{ slotDate: null }, { slotRequested: false }] }],
    },
  });

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
        select: {
          slotRequested: true,
          slotDate: true,
          responseStatus: true,
          followUpDate: true,
          followUpDone: true,
        },
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
      (l: any) => l.followUpDate && !l.followUpDone,
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

  const createdDate = new Date(employee.createdAt);
  createdDate.setHours(0, 0, 0, 0);

  const baseDate = date ? parseLocalDate(date) : new Date();
  baseDate.setHours(0, 0, 0, 0);
  if (baseDate.getTime() < createdDate.getTime()) {
    baseDate.setTime(createdDate.getTime());
  }
  const previousDate = new Date(baseDate);
  previousDate.setDate(previousDate.getDate() - 1);

  const dateFilter = [baseDate];
  if (previousDate.getTime() >= createdDate.getTime()) {
    dateFilter.push(previousDate);
  }

  const toKey = (d: Date) => d.toISOString().split("T")[0];
  const baseKey = toKey(baseDate);
  const prevKey = toKey(previousDate);

  const countForDate = async (target: Date) => {
    const [calls, slots, followUps] = await prisma.$transaction([
      prisma.lead.count({ where: { employeeId, date: target } }),
      prisma.lead.count({
        where: {
          employeeId,
          date: target,
          slotRequested: true,
          slotDate: { not: null },
        },
      }),
      prisma.lead.count({
        where: {
          employeeId,
          date: target,
          followUpDate: { not: null },
          followUpDone: false,
        },
      }),
    ]);

    return { calls, slots, followUps };
  };

  const dailyStats: {
    date: string;
    calls: number;
    slots: number;
    followUps: number;
  }[] = [];
  const baseStats = await countForDate(baseDate);
  dailyStats.push({ date: baseKey, ...baseStats });

  if (previousDate.getTime() >= createdDate.getTime()) {
    const prevStats = await countForDate(previousDate);
    dailyStats.push({ date: prevKey, ...prevStats });
  }

  const totals = dailyStats.reduce(
    (acc, row) => {
      acc.calls += row.calls;
      acc.slots += row.slots;
      acc.followUps += row.followUps;
      return acc;
    },
    { calls: 0, slots: 0, followUps: 0 },
  );

  const interestedCount = await prisma.lead.count({
    where: {
      employeeId,
      date: { in: dateFilter },
      responseStatus: "INTERESTED",
    },
  });

  return {
    employee: {
      ...employee,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    },
    stats: {
      totalCalls: totals.calls,
      totalSlots: totals.slots,
      interestedCount,
      followUpCount: totals.followUps,
      conversionRate: 0,
    },
    dailyStats,
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
    followUpDate: lead.followUpDate?.toISOString().split("T")[0] || null,
    followUpDone: lead.followUpDone,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));
}

// Get pending follow-ups
export async function getPendingFollowUps() {
  const leads = await prisma.lead.findMany({
    where: {
      // Include leads that need follow-up:
      // 1. Has followUpDate set and not completed, OR
      // 2. Response status is CALL_LATER (needs follow-up regardless of followUpDate)
      OR: [
        // Leads with explicit follow-up date that are not done
        {
          followUpDate: { not: null },
          followUpDone: false,
        },
        // Leads with CALL_LATER status (need follow-up even without explicit date)
        {
          responseStatus: "CALL_LATER",
          followUpDone: false,
        },
      ],
      // Exclude leads that already have a slot booked
      AND: [{ OR: [{ slotDate: null }, { slotRequested: false }] }],
    },
    select: {
      id: true,
      collegeName: true,
      contactPerson: true,
      phone: true,
      responseStatus: true,
      remarks: true,
      date: true,
      followUpDate: true,
      employee: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  return leads.map((lead: any) => ({
    ...lead,
    contactPerson: lead.contactPerson ?? "",
    phoneNumber: lead.phone ?? "",
    date: lead.date.toISOString().split("T")[0],
    followUpDate: lead.followUpDate?.toISOString().split("T")[0] || null,
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
    select: {
      id: true,
      collegeName: true,
      contactPerson: true,
      phone: true,
      slotDate: true,
      employee: { select: { name: true } },
    },
    orderBy: { slotDate: "asc" },
  });

  return leads.map((lead: any) => ({
    ...lead,
    contactPerson: lead.contactPerson ?? "",
    phoneNumber: lead.phone ?? "",
    slotTime: null, // slotTime field not yet in schema
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
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
