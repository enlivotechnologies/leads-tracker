"use client";

import { Lead } from "@/lib/types";
import { LeadCard } from "./lead-card";

interface LeadsListProps {
  leads: Lead[];
  emptyMessage?: string;
  emptySubMessage?: string;
}

export function LeadsList({
  leads,
  emptyMessage = "No leads yet",
  emptySubMessage,
}: LeadsListProps) {
  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-2xl bg-gray-100 p-5 mb-4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium text-base">{emptyMessage}</p>
        {emptySubMessage && (
          <p className="text-sm text-gray-400 mt-1.5">{emptySubMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
