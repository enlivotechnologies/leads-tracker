"use client";

import { Users, FileText, Clock, Calendar } from "lucide-react";

type TabType = "employees" | "leads" | "followups" | "slots";

interface AdminTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "employees", label: "Employees", icon: Users },
    { id: "leads", label: "Leads", icon: FileText },
    { id: "followups", label: "Follow-ups", icon: Clock },
    { id: "slots", label: "Slots", icon: Calendar },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
