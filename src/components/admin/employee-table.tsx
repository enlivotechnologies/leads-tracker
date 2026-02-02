"use client";

import { useState } from "react";
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

function ChevronRightIcon({ className }: { className?: string }) {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function EmployeeTable({ employees, selectedDate }: EmployeeTableProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Employee Performance
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Click on an employee to view details
          </p>
        </div>

        {employees.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">No activity recorded for this date</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-base">
                      {emp.name}
                    </p>
                    <p className="text-sm text-slate-500">{emp.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-base font-semibold text-slate-700">
                      {emp.calls} calls
                    </span>
                    <span className="text-sm text-teal-600 font-medium">
                      {emp.slots} slots
                    </span>
                  </div>

                  <ChevronRightIcon className="w-5 h-5 text-slate-400" />
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
