"use client";

import { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "INTERESTED":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      case "CALL_LATER":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      case "NOT_INTERESTED":
        return "bg-red-50 text-red-500 border border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "INTERESTED":
        return "Interested";
      case "CALL_LATER":
        return "Call Later";
      case "NOT_INTERESTED":
        return "Not Interested";
      default:
        return status;
    }
  };

  const formatSlotDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 shadow-sm border border-gray-100",
        "transition-all duration-200",
        onClick &&
          "cursor-pointer hover:shadow-md hover:border-gray-200 active:scale-[0.98]",
      )}
      onClick={onClick}
    >
      {/* Header - Name & Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {lead.collegeName}
        </h3>
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
            getStatusStyles(lead.responseStatus),
          )}
        >
          {getStatusLabel(lead.responseStatus)}
        </span>
      </div>

      {/* Location */}
      {lead.location && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{lead.location}</span>
        </div>
      )}

      {/* Slot Date & Phone */}
      {(lead.slotDate || lead.phone) && (
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          {lead.slotDate && (
            <div className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Slot: {formatSlotDate(lead.slotDate)}</span>
            </div>
          )}

          {lead.phone && (
            <div className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{lead.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Contact Person */}
      {lead.contactPerson && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="text-gray-500">Contact:</span>{" "}
          <span className="font-medium">{lead.contactPerson}</span>
          {lead.designation && (
            <span className="text-gray-500">
              {" "}
              (
              {lead.designation
                .replace("_", " ")
                .split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
                )
                .join(" ")}
              )
            </span>
          )}
        </p>
      )}

      {/* Remarks */}
      {lead.remarks && (
        <p className="text-sm text-gray-400 italic leading-relaxed line-clamp-2">
          "{lead.remarks}"
        </p>
      )}

      {/* Call Type Badge for Follow-ups */}
      {lead.callType === "FOLLOW_UP" && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Follow-up
          </span>
        </div>
      )}
    </div>
  );
}
