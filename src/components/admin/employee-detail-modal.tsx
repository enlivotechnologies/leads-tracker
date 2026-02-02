"use client";

import { useState, useEffect } from "react";
import {
  X,
  Phone,
  Calendar,
  TrendingUp,
  Flag,
  MessageSquare,
} from "lucide-react";
import {
  getEmployeeDetail,
  flagLead,
  addAdminRemarks,
} from "@/app/actions/admin";

interface EmployeeDetailModalProps {
  employeeId: string;
  selectedDate: string;
  onClose: () => void;
}

interface Lead {
  id: string;
  collegeName: string;
  contactPerson: string;
  phoneNumber: string;
  responseStatus: string;
  remarks: string | null;
  slotRequested: boolean;
  slotDate: string | null;
  slotTime: string | null;
  date: string;
  isFlagged: boolean;
  adminRemarks: string | null;
}

interface EmployeeDetail {
  employee: {
    id: string;
    name: string;
    email: string;
  };
  leads: Lead[];
  stats: {
    totalCalls: number;
    totalSlots: number;
    interestedCount: number;
    followUpCount: number;
    conversionRate: number;
  };
}

export function EmployeeDetailModal({
  employeeId,
  selectedDate,
  onClose,
}: EmployeeDetailModalProps) {
  const [data, setData] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [remarksLeadId, setRemarksLeadId] = useState<string | null>(null);
  const [remarksText, setRemarksText] = useState("");

  useEffect(() => {
    loadData();
  }, [employeeId, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    const result = await getEmployeeDetail(employeeId, selectedDate);
    setData(result);
    setLoading(false);
  };

  const handleFlag = async (leadId: string, flag: boolean) => {
    await flagLead(leadId, flag);
    loadData();
  };

  const handleAddRemarks = async () => {
    if (!remarksLeadId || !remarksText.trim()) return;
    await addAdminRemarks(remarksLeadId, remarksText);
    setRemarksLeadId(null);
    setRemarksText("");
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "INTERESTED":
        return "bg-emerald-100 text-emerald-700";
      case "NOT_INTERESTED":
        return "bg-red-100 text-red-700";
      case "CALL_LATER":
        return "bg-amber-100 text-amber-700";
      case "NOT_REACHABLE":
        return "bg-slate-100 text-slate-700";
      case "WRONG_NUMBER":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {data?.employee.name || "Loading..."}
            </h2>
            <p className="text-sm text-slate-500">{data?.employee.email}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : data ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 p-4 border-b border-slate-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Phone className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-lg">
                    {data.stats.totalCalls}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Calls</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-lg">
                    {data.stats.totalSlots}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Slots</p>
              </div>
              <div className="text-center">
                <span className="font-bold text-lg text-teal-600">
                  {data.stats.interestedCount}
                </span>
                <p className="text-xs text-slate-500">Interested</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-lg">
                    {data.stats.conversionRate}%
                  </span>
                </div>
                <p className="text-xs text-slate-500">Rate</p>
              </div>
            </div>

            {/* Leads List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {data.leads.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  No leads for this date
                </p>
              ) : (
                data.leads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`bg-slate-50 rounded-lg p-3 border ${lead.isFlagged ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">
                          {lead.collegeName}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {lead.contactPerson}
                        </p>
                        <p className="text-xs text-slate-500">
                          {lead.phoneNumber}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lead.responseStatus)}`}
                      >
                        {lead.responseStatus.replace("_", " ")}
                      </span>
                    </div>

                    {lead.slotRequested && lead.slotDate && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                        <Calendar className="w-3 h-3" />
                        Slot: {lead.slotDate}{" "}
                        {lead.slotTime && `at ${lead.slotTime}`}
                      </div>
                    )}

                    {lead.remarks && (
                      <p className="mt-2 text-xs text-slate-600 bg-white p-2 rounded">
                        {lead.remarks}
                      </p>
                    )}

                    {lead.adminRemarks && (
                      <p className="mt-2 text-xs text-indigo-600 bg-indigo-50 p-2 rounded">
                        Admin: {lead.adminRemarks}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleFlag(lead.id, !lead.isFlagged)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          lead.isFlagged
                            ? "bg-red-100 text-red-600"
                            : "bg-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600"
                        }`}
                      >
                        <Flag className="w-3 h-3" />
                        {lead.isFlagged ? "Flagged" : "Flag"}
                      </button>
                      <button
                        onClick={() => {
                          setRemarksLeadId(lead.id);
                          setRemarksText(lead.adminRemarks || "");
                        }}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Remark
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Remarks Modal */}
            {remarksLeadId && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-4 w-full max-w-sm">
                  <h3 className="font-semibold mb-3">Add Admin Remarks</h3>
                  <textarea
                    value={remarksText}
                    onChange={(e) => setRemarksText(e.target.value)}
                    placeholder="Enter your remarks..."
                    className="w-full p-3 border rounded-lg text-sm h-24 resize-none"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setRemarksLeadId(null)}
                      className="flex-1 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddRemarks}
                      className="flex-1 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-slate-500">
            Employee not found
          </div>
        )}
      </div>
    </div>
  );
}
