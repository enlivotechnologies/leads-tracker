"use client";

import { Clock, CheckCircle } from "lucide-react";

interface FollowUpsPanelProps {
  followUps: {
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
}

export function FollowUpsPanel({
  followUps: initialFollowUps,
}: FollowUpsPanelProps) {
  const followUps = initialFollowUps;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">
          Pending Follow-ups
        </h2>
        <p className="text-[11px] text-slate-500">
          {followUps.length} leads need follow-up
        </p>
      </div>

      {followUps.length === 0 ? (
        <div className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-teal-500 mx-auto mb-2" />
          <p className="text-slate-600">All follow-ups completed!</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
          {followUps.map((lead) => (
            <div key={lead.id} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-900">
                    {lead.collegeName}
                  </h3>
                  <p className="text-[12px] text-slate-600">
                    Contact name: {lead.contactPerson || "—"}
                  </p>
                  <div className="mt-0.5">
                    <a
                      href={`tel:${lead.phoneNumber}`}
                      className="text-[11px] text-indigo-600 underline-offset-2 hover:underline"
                    >
                      Ph no: {lead.phoneNumber}
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Created by: {lead.employee.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Follow-up by: {lead.employee.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Follow-up date: {lead.followUpDate || "—"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Created on: {lead.date}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                </div>
              </div>

              {lead.remarks && (
                <p className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
                  {lead.remarks}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
