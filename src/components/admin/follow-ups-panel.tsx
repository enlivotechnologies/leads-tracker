"use client";

import { useState } from "react";
import { Phone, Clock, CheckCircle } from "lucide-react";
import { markFollowUpDone } from "@/app/actions/admin";

interface FollowUpsPanelProps {
  followUps: {
    id: string;
    collegeName: string;
    contactPerson: string;
    phoneNumber: string;
    responseStatus: string;
    remarks: string | null;
    date: string;
    employee: { name: string };
  }[];
}

export function FollowUpsPanel({
  followUps: initialFollowUps,
}: FollowUpsPanelProps) {
  const [followUps, setFollowUps] = useState(initialFollowUps);
  const [completing, setCompleting] = useState<string | null>(null);

  const handleMarkDone = async (leadId: string) => {
    setCompleting(leadId);
    await markFollowUpDone(leadId);
    setFollowUps((prev) => prev.filter((f) => f.id !== leadId));
    setCompleting(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">Pending Follow-ups</h2>
        <p className="text-xs text-slate-500">
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
            <div key={lead.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">
                    {lead.collegeName}
                  </h3>
                  <p className="text-sm text-slate-600">{lead.contactPerson}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={`tel:${lead.phoneNumber}`}
                      className="flex items-center gap-1 text-xs text-indigo-600"
                    >
                      <Phone className="w-3 h-3" />
                      {lead.phoneNumber}
                    </a>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    By {lead.employee.name} • {lead.date}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                  <button
                    onClick={() => handleMarkDone(lead.id)}
                    disabled={completing === lead.id}
                    className="text-xs px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 transition-colors disabled:opacity-50"
                  >
                    {completing === lead.id ? "Marking..." : "Mark Done"}
                  </button>
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
    </div>
  );
}
