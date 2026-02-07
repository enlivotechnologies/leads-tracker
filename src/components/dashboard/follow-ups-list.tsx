"use client";

import { Lead } from "@/lib/types";

interface FollowUpsListProps {
  leads: Lead[];
  onComplete: (leadId: string) => void;
  completingId?: string | null;
}

export function FollowUpsList({
  leads,
  onComplete,
  completingId,
}: FollowUpsListProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-2xl bg-slate-100 p-5 mb-4">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <p className="text-slate-600 font-medium text-base">
          No pending follow-ups
        </p>
        <p className="text-sm text-slate-400 mt-1">You’re all caught up</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {lead.collegeName}
              </p>
              <p className="text-[12px] text-slate-600 mt-0.5">
                Contact name: {lead.contactPerson || "—"}
              </p>
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="text-[12px] text-indigo-600 mt-0.5 inline-block underline-offset-2 hover:underline"
                >
                  Ph no: {lead.phone}
                </a>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                {lead.responseStatus === "CALL_LATER" ? (
                  <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                    Call Later
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                    Pending
                  </span>
                )}
                {lead.followUpDate && (
                  <span>Follow-up: {lead.followUpDate}</span>
                )}
                <span>Created: {lead.date}</span>
              </div>
              {lead.remarks && (
                <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 p-2 rounded">
                  Remarks: {lead.remarks}
                </p>
              )}
            </div>

            <button
              onClick={() => onComplete(lead.id)}
              disabled={completingId === lead.id}
              className="shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200/60 hover:opacity-95 disabled:opacity-60"
            >
              {completingId === lead.id ? "Completing..." : "Complete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
