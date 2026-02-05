"use client";

import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  showAddButton: boolean;
}

export function BottomNav({
  activeTab,
  onTabChange,
  onAddClick,
  showAddButton,
}: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-2">
      <div className="relative mx-auto max-w-md">
        {/* Add Button */}
        <button
          onClick={onAddClick}
          disabled={!showAddButton}
          className={cn(
            "absolute -top-14 right-2 flex h-12 w-12 items-center justify-center rounded-full transition-all",
            showAddButton
              ? "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
              : "bg-gray-200 text-gray-400 cursor-not-allowed",
          )}
          aria-label="Add new lead"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <div className="flex items-center justify-between rounded-full bg-white shadow-lg shadow-black/10 border border-gray-100 px-1.5 py-1.5">
          {/* Today's Leads Tab */}
          <button
            onClick={() => onTabChange("today")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all",
              activeTab === "today"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <circle cx="12" cy="16" r="2" />
            </svg>
            <span>Today</span>
          </button>

          {/* All Leads Tab */}
          <button
            onClick={() => onTabChange("all")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all",
              activeTab === "all"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Leads</span>
          </button>

          {/* Follow-ups Tab */}
          <button
            onClick={() => onTabChange("followups")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all",
              activeTab === "followups"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>Follow-up</span>
          </button>

          {/* Colleges Tab */}
          <button
            onClick={() => onTabChange("colleges")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all",
              activeTab === "colleges"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18" />
              <path d="M6 18V7" />
              <path d="M10 18V7" />
              <path d="M14 18V7" />
              <path d="M18 18V7" />
              <path d="M4 7h16" />
              <path d="M12 3l8 4H4l8-4z" />
            </svg>
            <span>Colleges</span>
          </button>
        </div>
      </div>
    </div>
  );
}
