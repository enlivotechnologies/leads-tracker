"use client";

import { useState, useEffect } from "react";
import { getEmployeeDetail } from "@/app/actions/admin";

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
}

interface EmployeeDetail {
  employee: {
    id: string;
    name: string;
    email: string;
  };
  stats: {
    totalCalls: number;
    totalSlots: number;
    interestedCount: number;
    followUpCount: number;
    conversionRate: number;
  };
  dailyStats: {
    date: string;
    calls: number;
    slots: number;
    followUps: number;
  }[];
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function EmployeeDetailModal({
  employeeId,
  selectedDate,
  onClose,
}: EmployeeDetailModalProps) {
  const [data, setData] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [employeeId, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    const result = await getEmployeeDetail(employeeId, selectedDate);
    setData(result);
    setLoading(false);
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

  // Format date to DD-MMM format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return `${day}-${month}`;
  };

  const getDayLabel = (dateStr: string) => formatDate(dateStr);

  const orderedStats = data
    ? [...data.dailyStats].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-2xl max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {data?.employee.name || "Loading..."}
            </h2>
            <p className="text-sm text-slate-500">{data?.employee.email}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : data ? (
          <>
            {/* Stats Table */}
            <div className="px-5 py-4 border-b border-slate-100">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-500 font-medium">
                    <th className="text-left pb-3">Person</th>
                    <th className="text-center pb-3">Day</th>
                    <th className="text-center pb-3">Calls</th>
                    <th className="text-center pb-3">Booked</th>
                    <th className="text-center pb-3">Follow up</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedStats.map((row) => (
                    <tr key={row.date} className="text-sm">
                      <td className="text-left font-medium text-slate-800">
                        {data.employee.name}
                      </td>
                      <td className="text-center text-slate-600">
                        {getDayLabel(row.date)}
                      </td>
                      <td className="text-center font-semibold text-slate-800">
                        {row.calls}
                      </td>
                      <td className="text-center font-semibold text-teal-600">
                        {row.slots}
                      </td>
                      <td className="text-center font-semibold text-amber-600">
                        {row.followUps}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
