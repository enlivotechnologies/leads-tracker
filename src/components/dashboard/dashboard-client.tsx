"use client";

import { useState, useEffect, useCallback } from "react";
import { Lead } from "@/lib/types";
import { LeadFormValues } from "@/lib/validations";
import { getDateString, isPastDate, isToday } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { DateSelector } from "@/components/dashboard/date-selector";
import { LeadsList } from "@/components/dashboard/leads-list";
import { AddLeadForm } from "@/components/dashboard/add-lead-form";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  getLeadsByDate,
  getAllEmployeeLeads,
  createLead,
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
  const [isLoading, setIsLoading] = useState(false);

  const [todayLeads, setTodayLeads] = useState<Lead[]>(initialLeads);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);

  // Initialize date from server string on mount
  useEffect(() => {
    const [year, month, day] = initialDate.split("-").map(Number);
    setSelectedDate(new Date(year, month - 1, day));
  }, [initialDate]);

  const isPast = selectedDate ? isPastDate(selectedDate) : false;
  const isTodaySelected = selectedDate ? isToday(selectedDate) : false;
  const canAddLead = isTodaySelected && activeTab === "today";

  const fetchLeadsForDate = useCallback(async (date: Date) => {
    setIsLoading(true);
    try {
      const dateString = getDateString(date);
      const leads = await getLeadsByDate(dateString);
      setTodayLeads(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const leads = await getAllEmployeeLeads();
      setAllLeads(leads);
    } catch (error) {
      console.error("Error fetching all leads:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch leads when tab changes
  useEffect(() => {
    if (!selectedDate) return;

    if (activeTab === "today") {
      fetchLeadsForDate(selectedDate);
    } else if (activeTab === "all") {
      fetchAllLeads();
    }
  }, [selectedDate, activeTab, fetchLeadsForDate, fetchAllLeads]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setActiveTab("today");
  };

  const handleAddLead = async (data: LeadFormValues) => {
    if (!selectedDate) return;
    
    try {
      const dateString = getDateString(selectedDate);
      const newLead = await createLead(data, dateString);
      setTodayLeads((prev) => [newLead, ...prev]);
      setIsAddingLead(false);
    } catch (error) {
      console.error("Error creating lead:", error);
      alert("Failed to save lead. Please try again.");
    }
  };

  const getEmptyMessage = () => {
    if (activeTab === "all") {
      return "No leads recorded yet";
    }
    if (isPast) {
      return "No completed leads for this date";
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

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader employeeName={employeeName} />

      <main className="px-5 py-4 pb-28">
        {/* Date Selector - Only show for Today tab */}
        {activeTab === "today" && selectedDate && (
          <div className="mb-4">
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          </div>
        )}

        {/* All Leads Header */}
        {activeTab === "all" && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Leads</h2>
            <p className="text-sm text-gray-500">Your complete leads history</p>
          </div>
        )}

        {/* Past Date Notice */}
        {isPast && activeTab === "today" && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
            📅 Viewing past date - showing completed leads only
          </div>
        )}

        {/* Leads List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <LeadsList
            leads={getCurrentLeads()}
            emptyMessage={getEmptyMessage()}
            emptySubMessage={getEmptySubMessage()}
          />
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
