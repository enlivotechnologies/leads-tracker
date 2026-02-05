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
    totalDeals: number;
    totalUsers?: number;
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
    "employees" | "leads" | "followups" | "slots" | "users"
  >("employees");

  return (
    <div className="min-h-screen bg-white">
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
          {activeTab === "users" && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  Users Available
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {allEmployees.length} users
                </p>
              </div>

              {allEmployees.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No users found
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {allEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="px-5 py-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{emp.name}</p>
                        <p className="text-sm text-slate-500">{emp.email}</p>
                      </div>
                      <div className="text-sm font-medium text-slate-600">
                        Leads: {emp.totalLeads}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
