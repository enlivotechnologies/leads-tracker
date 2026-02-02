"use client";

import { Calendar, Clock, User, Phone, Building } from "lucide-react";

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
    if (dateStr === "No Date") return dateStr;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) {
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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">Upcoming Slots</h2>
        <p className="text-xs text-slate-500">{slots.length} slots scheduled</p>
      </div>

      {slots.length === 0 ? (
        <div className="p-8 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">No upcoming slots</p>
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          {sortedDates.map((date) => (
            <div key={date}>
              {/* Date Header */}
              <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 sticky top-0">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-slate-900">
                    {formatDate(date)}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({groupedSlots[date].length} slot
                    {groupedSlots[date].length !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              {/* Slots for this date */}
              <div className="divide-y divide-slate-100">
                {groupedSlots[date].map((slot) => (
                  <div key={slot.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Time Badge */}
                      <div className="w-16 text-center flex-shrink-0">
                        {slot.slotTime ? (
                          <div className="bg-teal-100 rounded-lg py-2 px-1">
                            <Clock className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                            <span className="text-xs font-medium text-teal-700">
                              {slot.slotTime}
                            </span>
                          </div>
                        ) : (
                          <div className="bg-slate-100 rounded-lg py-2 px-1">
                            <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                            <span className="text-xs text-slate-500">TBD</span>
                          </div>
                        )}
                      </div>

                      {/* Slot Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          <h3 className="font-medium text-slate-900 truncate">
                            {slot.collegeName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {slot.contactPerson}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <a
                            href={`tel:${slot.phoneNumber}`}
                            className="text-sm text-indigo-600"
                          >
                            {slot.phoneNumber}
                          </a>
                        </div>
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
