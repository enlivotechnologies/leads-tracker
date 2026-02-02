"use client";

import { useState } from "react";
import { AdminHeader } from "./admin-header";
import { KpiCards } from "./kpi-cards";
import { AdminTabs } from "./admin-tabs";
import { EmployeeTable } from "./employee-table";
import { LeadsPanel } from "./leads-panel";
import { FollowUpsPanel } from "./follow-ups-panel";
import { SlotsPanel } from "./slots-panel";
import { AdminDateSelector } from "./admin-date-selector";

interface AdminDashboardClientProps {
  admin: {
    id: string;
    name: string;
    email: string;
  };
  selectedDate: string;
  kpis: {
    totalCalls: number;
    slotsBooked: number;
    followUpsPending: number;
    activeEmployees: number;
  };
  employeePerformance: {
    id: string;
    name: string;
    email: string;
    calls: number;
    slots: number;
    followUps: number;
    interested: number;
    interestedRate: number;
  }[];
  allEmployees: {
    id: string;
    name: string;
    email: string;
    totalLeads: number;
    isActive: boolean;
  }[];
  pendingFollowUps: {
    id: string;
    collegeName: string;
    contactPerson: string;
    phoneNumber: string;
    responseStatus: string;
    remarks: string | null;
    date: string;
    employee: { name: string };
  }[];
  upcomingSlots: {
    id: string;
    collegeName: string;
    contactPerson: string;
    phoneNumber: string;
    slotDate: string | null;
    slotTime: string | null;
    employee: { name: string };
  }[];
}

export function AdminDashboardClient({
  admin,
  selectedDate,
  kpis,
  employeePerformance,
  allEmployees,
  pendingFollowUps,
  upcomingSlots,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<
    "employees" | "leads" | "followups" | "slots"
  >("employees");

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader admin={admin} />

      <main className="max-w-7xl mx-auto px-4 pb-6">
        {/* Week Calendar Selector */}
        <AdminDateSelector selectedDate={selectedDate} />

        {/* KPI Cards */}
        <KpiCards kpis={kpis} />

        {/* Tabs */}
        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "employees" && (
            <EmployeeTable
              employees={employeePerformance}
              allEmployees={allEmployees}
              selectedDate={selectedDate}
            />
          )}
          {activeTab === "leads" && (
            <LeadsPanel employees={allEmployees} selectedDate={selectedDate} />
          )}
          {activeTab === "followups" && (
            <FollowUpsPanel followUps={pendingFollowUps} />
          )}
          {activeTab === "slots" && <SlotsPanel slots={upcomingSlots} />}
        </div>
      </main>
    </div>
  );
}
