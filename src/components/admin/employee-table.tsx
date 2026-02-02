"use client";

import { useState } from "react";
import { Phone, Calendar, TrendingUp, ChevronRight } from "lucide-react";
import { EmployeeDetailModal } from "./employee-detail-modal";

interface EmployeeTableProps {
  employees: {
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
  selectedDate: string;
}

export function EmployeeTable({ employees, selectedDate }: EmployeeTableProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Employee Performance</h2>
          <p className="text-xs text-slate-500">
            Click on an employee to view details
          </p>
        </div>

        {employees.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">No activity recorded for this date</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{emp.name}</p>
                    <p className="text-xs text-slate-500">{emp.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">{emp.calls}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <span className="font-medium">{emp.slots}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">{emp.interestedRate}%</span>
                    </div>
                  </div>

                  <div className="sm:hidden flex flex-col items-end gap-0.5">
                    <span className="text-sm font-medium text-slate-900">
                      {emp.calls} calls
                    </span>
                    <span className="text-xs text-teal-600">
                      {emp.slots} slots
                    </span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedEmployee && (
        <EmployeeDetailModal
          employeeId={selectedEmployee}
          selectedDate={selectedDate}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </>
  );
}
