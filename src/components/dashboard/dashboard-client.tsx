"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Lead } from "@/lib/types";
import { LeadFormValues } from "@/lib/validations";
import { getDateString, isPastDate, isToday } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { DateSelector } from "@/components/dashboard/date-selector";
import { LeadsList } from "@/components/dashboard/leads-list";
import { FollowUpsList } from "@/components/dashboard/follow-ups-list";
import { AddLeadForm } from "@/components/dashboard/add-lead-form";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  getLeadsByDate,
  getAllEmployeeLeads,
  createLead,
  getCollegeCallSummary,
  getFollowUpLeads,
  markFollowUpCompleted,
} from "@/app/actions/leads";

interface DashboardClientProps {
  employeeName: string;
  initialLeads: Lead[];
  initialDate: string;
}

export function DashboardClient({
  employeeName,
  initialLeads,
  initialDate,
}: DashboardClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("today");
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [todayLeads, setTodayLeads] = useState<Lead[]>(initialLeads);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [followUpLeads, setFollowUpLeads] = useState<Lead[]>([]);
  const [collegeCalls, setCollegeCalls] = useState<
    { collegeName: string; location: string; count: number }[]
  >([]);
  const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(
    initialDate,
  );
  const [dateLeadsCache, setDateLeadsCache] = useState<Record<string, Lead[]>>({
    [initialDate]: initialLeads,
  });
  const inFlightRef = useRef<Record<string, Promise<Lead[]>>>({});
  const [completingFollowUp, setCompletingFollowUp] = useState<string | null>(
    null,
  );

  // Initialize date from server string on mount
  useEffect(() => {
    const [year, month, day] = initialDate.split("-").map(Number);
    setSelectedDate(new Date(year, month - 1, day));
  }, [initialDate]);

  const isPast = selectedDate ? isPastDate(selectedDate) : false;
  const isTodaySelected = selectedDate ? isToday(selectedDate) : false;
  const canAddLead = isTodaySelected && activeTab === "today";

  const fetchLeadsForDate = useCallback(
    async (date: Date) => {
      const dateString = getDateString(date);
      if (dateLeadsCache[dateString]) {
        setTodayLeads(dateLeadsCache[dateString]);
        setLastFetchedDate(dateString);
        return;
      }
      if (lastFetchedDate === dateString && todayLeads.length > 0) {
        return;
      }
      try {
        if (!inFlightRef.current[dateString]) {
          inFlightRef.current[dateString] = getLeadsByDate(dateString);
        }
        const leads = await inFlightRef.current[dateString];
        setTodayLeads(leads);
        setLastFetchedDate(dateString);
        setDateLeadsCache((prev) => ({ ...prev, [dateString]: leads }));
        delete inFlightRef.current[dateString];
      } catch (error) {
        console.error("Error fetching leads:", error);
        delete inFlightRef.current[dateString];
      }
    },
    [getLeadsByDate, lastFetchedDate, todayLeads.length, dateLeadsCache],
  );

  const fetchAllLeads = useCallback(async () => {
    if (allLeads.length > 0) return;
    try {
      const leads = await getAllEmployeeLeads();
      setAllLeads(leads);
    } catch (error) {
      console.error("Error fetching all leads:", error);
    }
  }, [allLeads.length, getAllEmployeeLeads]);

  const fetchCollegeCalls = useCallback(async () => {
    if (collegeCalls.length > 0) return;
    try {
      const result = await getCollegeCallSummary();
      setCollegeCalls(result);
    } catch (error) {
      console.error("Error fetching college calls:", error);
    }
  }, [collegeCalls.length, getCollegeCallSummary]);

  const fetchFollowUps = useCallback(
    async (force = false) => {
      if (!force && followUpLeads.length > 0) return;
      try {
        const leads = await getFollowUpLeads();
        setFollowUpLeads(leads);
      } catch (error) {
        console.error("Error fetching follow-ups:", error);
      }
    },
    [followUpLeads.length, getFollowUpLeads],
  );

  // Fetch leads when tab changes
  useEffect(() => {
    if (!selectedDate) return;

    if (activeTab === "today") {
      fetchLeadsForDate(selectedDate);
    } else if (activeTab === "all") {
      fetchAllLeads();
    } else if (activeTab === "followups") {
      fetchFollowUps(true);
    } else if (activeTab === "colleges") {
      fetchCollegeCalls();
    }
  }, [
    selectedDate,
    activeTab,
    fetchLeadsForDate,
    fetchAllLeads,
    fetchFollowUps,
    fetchCollegeCalls,
  ]);

  useEffect(() => {
    if (!selectedDate) return;

    const prefetch = () => {
      fetchAllLeads();
      fetchFollowUps();
      fetchCollegeCalls();
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = (window as any).requestIdleCallback(prefetch, {
        timeout: 1200,
      });
      return () => (window as any).cancelIdleCallback?.(idleId);
    }

    const timeoutId = setTimeout(prefetch, 600);
    return () => clearTimeout(timeoutId);
  }, [selectedDate, fetchAllLeads, fetchFollowUps, fetchCollegeCalls]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setActiveTab("today");
    const dateString = getDateString(date);
    if (dateLeadsCache[dateString]) {
      setTodayLeads(dateLeadsCache[dateString]);
      setLastFetchedDate(dateString);
    }
  };

  useEffect(() => {
    if (!selectedDate) return;
    const prefetchDate = async (date: Date) => {
      const dateString = getDateString(date);
      if (dateLeadsCache[dateString]) return;
      try {
        if (!inFlightRef.current[dateString]) {
          inFlightRef.current[dateString] = getLeadsByDate(dateString);
        }
        const leads = await inFlightRef.current[dateString];
        setDateLeadsCache((prev) => ({ ...prev, [dateString]: leads }));
        delete inFlightRef.current[dateString];
      } catch {
        delete inFlightRef.current[dateString];
        // ignore prefetch errors
      }
    };

    const range: Date[] = [];
    for (let offset = -3; offset <= 3; offset += 1) {
      if (offset === 0) continue;
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + offset);
      range.push(d);
    }

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = (window as any).requestIdleCallback(() => {
        range.forEach(prefetchDate);
      });
      return () => (window as any).cancelIdleCallback?.(idleId);
    }

    const timeoutId = setTimeout(() => {
      range.forEach(prefetchDate);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedDate, getLeadsByDate, dateLeadsCache]);

  const handleAddLead = async (data: LeadFormValues) => {
    if (!selectedDate) return;

    try {
      const dateString = getDateString(selectedDate);
      const newLead = await createLead(data, dateString);
      setTodayLeads((prev) => [newLead, ...prev]);
      setToast({ message: "Lead added successfully", type: "success" });
      setIsAddingLead(false);
    } catch (error) {
      console.error("Error creating lead:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save lead. Please try again.";
      setToast({ message, type: "error" });
    }
  };

  const handleFollowUpCompleted = async (leadId: string) => {
    setCompletingFollowUp(leadId);
    try {
      await markFollowUpCompleted(leadId);
      setFollowUpLeads((prev) => prev.filter((lead) => lead.id !== leadId));
      setToast({ message: "Follow-up marked as completed", type: "success" });
    } catch (error) {
      console.error("Error completing follow-up:", error);
      setToast({
        message: "Failed to complete follow-up. Please try again.",
        type: "error",
      });
    } finally {
      setCompletingFollowUp(null);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const getEmptyMessage = () => {
    if (activeTab === "all") {
      return "No leads recorded yet";
    }
    if (activeTab === "colleges") {
      return "No colleges recorded yet";
    }
    if (activeTab === "followups") {
      return "No pending follow-ups";
    }
    if (isPast) {
      return "No leads for this date";
    }
    return "No leads yet";
  };

  const getEmptySubMessage = () => {
    if (activeTab === "today" && canAddLead) {
      return "Tap + to add your first lead";
    }
    return undefined;
  };

  const getCurrentLeads = () => {
    if (activeTab === "all") {
      return allLeads;
    }
    return todayLeads;
  };

  const getKpis = () => {
    const leads = getCurrentLeads();
    const slotsBooked = leads.filter(
      (lead) => lead.slotRequested && lead.slotDate,
    ).length;
    const notInterested = leads.filter(
      (lead) => lead.responseStatus === "NOT_INTERESTED",
    ).length;
    const followUps = leads.filter(
      (lead) => !!lead.followUpDate && !lead.slotDate && !lead.followUpDone,
    ).length;

    return {
      totalLeads: leads.length,
      slotsBooked,
      notInterested,
      followUps,
    };
  };

  const kpis = getKpis();

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader employeeName={employeeName} />

      <main className="px-5 py-4 pb-28">
        {toast && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            {toast.message}
          </div>
        )}
        {/* Date Selector - Only show for Today tab */}
        {activeTab === "today" && selectedDate && (
          <div className="mb-4">
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          </div>
        )}

        {/* KPI Cards - Today only */}
        {activeTab === "today" && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white rounded-2xl px-4 py-4 border border-slate-200">
              <p className="text-2xl font-semibold text-slate-700 tracking-tight">
                {kpis.totalLeads}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Today’s Leads
              </p>
            </div>
            <div className="bg-white rounded-2xl px-4 py-4 border border-slate-200">
              <p className="text-2xl font-semibold text-slate-700 tracking-tight">
                {kpis.slotsBooked}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Slots Booked
              </p>
            </div>
            <div className="bg-white rounded-2xl px-4 py-4 border border-slate-200">
              <p className="text-2xl font-semibold text-slate-700 tracking-tight">
                {kpis.notInterested}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Not Interested
              </p>
            </div>
            <div className="bg-white rounded-2xl px-4 py-4 border border-slate-200">
              <p className="text-2xl font-semibold text-slate-700 tracking-tight">
                {kpis.followUps}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Follow-ups
              </p>
            </div>
          </div>
        )}

        {/* All Leads Header */}
        {activeTab === "all" && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Leads</h2>
            <p className="text-sm text-gray-500">Your complete leads history</p>
          </div>
        )}

        {/* Follow-ups Header */}
        {activeTab === "followups" && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Follow-ups</h2>
            <p className="text-sm text-gray-500">
              Pending follow-ups that need action
            </p>
          </div>
        )}

        {/* Colleges Header */}
        {activeTab === "colleges" && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Colleges Called
            </h2>
            <p className="text-sm text-gray-500">
              College name, location, and total calls
            </p>
          </div>
        )}

        {/* Past Date Notice */}
        {isPast && activeTab === "today" && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
            📅 Viewing past date - showing leads for that day
          </div>
        )}

        {/* Leads List */}
        {activeTab === "colleges" ? (
          <>
            {collegeCalls.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {getEmptyMessage()}
              </div>
            ) : (
              <div className="space-y-3">
                {collegeCalls.map((college, index) => (
                  <div
                    key={`${college.collegeName}-${college.location}-${index}`}
                    className="bg-white rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {college.collegeName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {college.location || "Location not set"}
                        </p>
                      </div>
                      <div className="text-lg font-semibold text-slate-700">
                        {college.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === "followups" ? (
          <>
            <FollowUpsList
              leads={followUpLeads}
              onComplete={handleFollowUpCompleted}
              completingId={completingFollowUp}
            />
          </>
        ) : (
          <>
            <LeadsList
              leads={getCurrentLeads()}
              emptyMessage={getEmptyMessage()}
              emptySubMessage={getEmptySubMessage()}
            />
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => setIsAddingLead(true)}
        showAddButton={canAddLead}
      />

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
  );
}
