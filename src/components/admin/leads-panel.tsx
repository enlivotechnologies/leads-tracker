"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Calendar, X } from "lucide-react";
import { getLeadsWithFilters } from "@/app/actions/admin";

interface LeadsPanelProps {
  employees: {
    id: string;
    name: string;
  }[];
  selectedDate: string;
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
  adminRemarks: string | null;
  employee: { name: string; email: string };
}

export function LeadsPanel({ employees, selectedDate }: LeadsPanelProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    dateFrom: selectedDate,
    dateTo: selectedDate,
    employeeId: "",
    status: "",
    slotBooked: "",
  });

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    const result = await getLeadsWithFilters(filters);
    setLeads(result);
    setLoading(false);
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    loadLeads();
  };

  const filteredLeads = leads.filter((lead) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      lead.collegeName.toLowerCase().includes(searchLower) ||
      lead.contactPerson.toLowerCase().includes(searchLower) ||
      lead.phoneNumber.includes(search) ||
      lead.employee.name.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "INTERESTED":
        return "bg-emerald-100 text-emerald-700";
      case "NOT_INTERESTED":
        return "bg-red-100 text-red-700";
      case "CALL_LATER":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg"
            />
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <Filter className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-8 text-center text-slate-500">No leads found</div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900">
                      {lead.collegeName}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    {lead.contactPerson} • {lead.phoneNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    By {lead.employee.name} on {lead.date}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lead.responseStatus)}`}
                  >
                    {lead.responseStatus.replace("_", " ")}
                  </span>
                  {lead.slotDate && (
                    <span className="text-xs text-teal-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {lead.slotDate}
                    </span>
                  )}
                </div>
              </div>

              {lead.remarks && (
                <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                  {lead.remarks}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />

          <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Employee
                </label>
                <select
                  value={filters.employeeId}
                  onChange={(e) =>
                    setFilters({ ...filters, employeeId: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="INTERESTED">Interested</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                  <option value="CALL_LATER">Call Later</option>
                  <option value="NOT_REACHABLE">Not Reachable</option>
                  <option value="WRONG_NUMBER">Wrong Number</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Slot Booked
                </label>
                <select
                  value={filters.slotBooked}
                  onChange={(e) =>
                    setFilters({ ...filters, slotBooked: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <button
                onClick={handleApplyFilters}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
