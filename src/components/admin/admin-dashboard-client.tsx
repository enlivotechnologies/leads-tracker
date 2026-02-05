"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "./admin-header";
import { KpiCards } from "./kpi-cards";
import { AdminTabs } from "./admin-tabs";
import { EmployeeTable } from "./employee-table";
import { LeadsPanel } from "./leads-panel";
import { FollowUpsPanel } from "./follow-ups-panel";
import { SlotsPanel } from "./slots-panel";
import { AdminDateSelector } from "./admin-date-selector";
import {
  getPendingFollowUps,
  getEmployeePerformance,
} from "@/app/actions/admin";

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
    followUpDate: string | null;
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
  const [followUps, setFollowUps] = useState(pendingFollowUps);
  const [teamRows, setTeamRows] = useState(employeePerformance);

  useEffect(() => {
    setFollowUps(pendingFollowUps);
  }, [pendingFollowUps]);

  useEffect(() => {
    setTeamRows(employeePerformance);
  }, [employeePerformance]);

  useEffect(() => {
    if (activeTab !== "followups") return;

    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const latest = await getPendingFollowUps();
        if (isMounted) setFollowUps(latest);
      } catch (error) {
        console.error("Failed to refresh follow-ups:", error);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 8000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchLatest();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", fetchLatest);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", fetchLatest);
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "employees") return;

    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const latest = await getEmployeePerformance(selectedDate);
        if (isMounted) setTeamRows(latest);
      } catch (error) {
        console.error("Failed to refresh team:", error);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 8000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchLatest();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", fetchLatest);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", fetchLatest);
    };
  }, [activeTab, selectedDate]);

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
              employees={teamRows}
              allEmployees={allEmployees}
              selectedDate={selectedDate}
            />
          )}
          {activeTab === "leads" && (
            <LeadsPanel employees={allEmployees} selectedDate={selectedDate} />
          )}
          {activeTab === "followups" && (
            <FollowUpsPanel followUps={followUps} />
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
