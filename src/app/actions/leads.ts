"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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
  const whereClause: any = {
    employeeId: employee.id,
    date: targetDate,
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
    followUpDate: lead.followUpDate?.toISOString().split("T")[0] || null,
    followUpDone: lead.followUpDone,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));
}

export async function getCollegeCallSummary() {
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

  const grouped = await prisma.lead.groupBy({
    by: ["collegeName", "location"],
    where: { employeeId: employee.id },
    _count: { _all: true },
    orderBy: {
      _count: {
        collegeName: "desc",
      },
    },
  });

  return grouped.map((item) => ({
    collegeName: item.collegeName,
    location: item.location ?? "",
    count: item._count._all,
  }));
}

export async function checkCollegeAvailability(collegeName: string) {
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

  const existingLead = await prisma.lead.findFirst({
    where: {
      collegeName: {
        equals: collegeName.trim(),
        mode: "insensitive",
      },
      employeeId: { not: employee.id },
    },
    select: { id: true },
  });

  return { available: !existingLead };
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
      // Include leads that need follow-up:
      // 1. Has followUpDate set and not completed, OR
      // 2. Response status is CALL_LATER (needs follow-up even without explicit date)
      OR: [
        { followUpDate: { not: null }, followUpDone: false },
        { responseStatus: "CALL_LATER", followUpDone: false },
      ],
      // Exclude leads that already have a slot booked
      AND: [{ OR: [{ slotDate: null }, { slotRequested: false }] }],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return leads.map((lead) => ({
    ...lead,
    date: lead.date.toISOString().split("T")[0],
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
    followUpDate: lead.followUpDate?.toISOString().split("T")[0] || null,
    followUpDone: lead.followUpDone,
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
    followUpDate: lead.followUpDate?.toISOString().split("T")[0] || null,
    followUpDone: lead.followUpDone,
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
    followUpDate: lead.followUpDate?.toISOString().split("T")[0] || null,
    followUpDone: lead.followUpDone,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));
}

export async function markFollowUpCompleted(leadId: string) {
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

  const result = await prisma.lead.updateMany({
    where: { id: leadId, employeeId: employee.id },
    data: { followUpDone: true },
  });

  if (result.count === 0) {
    throw new Error("Lead not found");
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return { success: true };
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

  const existingLead = await prisma.lead.findFirst({
    where: {
      collegeName: {
        equals: data.collegeName.trim(),
        mode: "insensitive",
      },
      employeeId: { not: employee.id },
    },
    select: { id: true },
  });

  if (existingLead) {
    throw new Error("College already contacted by another employee");
  }

  const leadDate = parseLocalDate(dateString);

  let lead;
  try {
    lead = await prisma.lead.create({
      data: {
        employeeId: employee.id,
        date: leadDate,
        collegeName: data.collegeName.trim(),
        location: data.location || null,
        contactPerson: data.contactPerson || null,
        designation: data.designation || null,
        phone: data.phone || null,
        callType: data.callType,
        slotRequested: data.slotRequested,
        slotDate: data.slotDate ? parseLocalDate(data.slotDate) : null,
        followUpDate: data.followUpDate
          ? parseLocalDate(data.followUpDate)
          : null,
        responseStatus: data.responseStatus,
        remarks: data.remarks || null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new Error("Unable to save lead. Please check all fields.");
    }
    throw error;
  }

  revalidatePath("/dashboard");

  return {
    ...lead,
    date: lead.date.toISOString().split("T")[0],
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
    followUpDate: lead.followUpDate?.toISOString().split("T")[0] || null,
    followUpDone: lead.followUpDone,
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
      followUpDate: data.followUpDate
        ? parseLocalDate(data.followUpDate)
        : null,
      responseStatus: data.responseStatus,
      remarks: data.remarks || null,
    },
  });

  revalidatePath("/dashboard");

  return {
    ...lead,
    date: lead.date.toISOString().split("T")[0],
    slotDate: lead.slotDate?.toISOString().split("T")[0] || null,
    followUpDate: lead.followUpDate?.toISOString().split("T")[0] || null,
    followUpDone: lead.followUpDone,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}
