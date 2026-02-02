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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">Upcoming Slots</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {slots.length} slots scheduled
        </p>
      </div>

      {slots.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-slate-500">No upcoming slots</p>
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          {sortedDates.map((date) => (
            <div key={date}>
              {/* Date Header */}
              <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100 sticky top-0">
                <span className="font-medium text-slate-800">
                  {formatDate(date)}
                </span>
                <span className="text-sm text-slate-500 ml-2">
                  ({groupedSlots[date].length} slot
                  {groupedSlots[date].length !== 1 ? "s" : ""})
                </span>
              </div>

              {/* Slots for this date */}
              <div className="divide-y divide-slate-100">
                {groupedSlots[date].map((slot) => (
                  <div key={slot.id} className="px-5 py-4">
                    <div className="flex items-start gap-4">
                      {/* Time Badge */}
                      <div className="w-16 text-center flex-shrink-0">
                        {slot.slotTime ? (
                          <div className="bg-teal-100 rounded-xl py-2.5 px-2">
                            <span className="text-sm font-semibold text-teal-700">
                              {slot.slotTime}
                            </span>
                          </div>
                        ) : (
                          <div className="bg-slate-100 rounded-xl py-2.5 px-2">
                            <span className="text-sm text-slate-500">TBD</span>
                          </div>
                        )}
                      </div>

                      {/* Slot Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-800 truncate">
                          {slot.collegeName}
                        </h3>
                        <p className="text-sm text-slate-600 mt-0.5">
                          {slot.contactPerson}
                        </p>
                        <a
                          href={`tel:${slot.phoneNumber}`}
                          className="text-sm text-indigo-600 mt-0.5 inline-block"
                        >
                          {slot.phoneNumber}
                        </a>
                        <p className="text-xs text-slate-500 mt-1">
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
