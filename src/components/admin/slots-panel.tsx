"use client";

import { useState, useEffect } from "react";

interface SlotsPanelProps {
  slots: {
    id: string;
    collegeName: string;
    contactPerson: string;
    phoneNumber: string;
    slotDate: string | null;
    slotTime: string | null;
    employee: { name: string };
  }[];
}

export function SlotsPanel({ slots }: SlotsPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [todayDate, setTodayDate] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setTodayDate(now);
  }, []);

  // Group slots by date
  const groupedSlots: Record<string, typeof slots> = {};

  slots.forEach((slot) => {
    const date = slot.slotDate || "No Date";
    if (!groupedSlots[date]) {
      groupedSlots[date] = [];
    }
    groupedSlots[date].push(slot);
  });

  const sortedDates = Object.keys(groupedSlots).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  const formatDate = (dateStr: string) => {
    if (dateStr === "No Date" || !mounted || !todayDate) return dateStr;
    const date = new Date(dateStr);
    const tomorrow = new Date(todayDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === todayDate.getTime()) {
      return "Today";
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }
  };

  return (
    <div className="bg-white/90 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Upcoming Slots</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {slots.length} slots scheduled
        </p>
      </div>

      {slots.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-slate-500">No upcoming slots</p>
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          {sortedDates.map((date) => (
            <div key={date}>
              {/* Date Header */}
              <div className="px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 sticky top-0">
                <span className="text-sm font-semibold text-slate-800">
                  {formatDate(date)}
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  ({groupedSlots[date].length} slot
                  {groupedSlots[date].length !== 1 ? "s" : ""})
                </span>
              </div>

              {/* Slots for this date */}
              <div className="divide-y divide-slate-100">
                {groupedSlots[date].map((slot) => (
                  <div key={slot.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      {/* Time Badge */}
                      <div className="w-14 text-center flex-shrink-0">
                        {slot.slotTime ? (
                          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg py-2 px-2 border border-teal-100">
                            <span className="text-xs font-semibold text-teal-700">
                              {slot.slotTime}
                            </span>
                          </div>
                        ) : (
                          <div className="bg-slate-100 rounded-lg py-2 px-2 border border-slate-200">
                            <span className="text-[11px] text-slate-500">
                              Time TBD
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Slot Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                          {slot.collegeName}
                        </h3>
                        <p className="text-[12px] text-slate-600 mt-0.5">
                          {slot.contactPerson}
                        </p>
                        <a
                          href={`tel:${slot.phoneNumber}`}
                          className="text-[12px] text-indigo-600 mt-0.5 inline-block"
                        >
                          {slot.phoneNumber}
                        </a>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Booked by {slot.employee.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
