"use client";

import { useRouter } from "next/navigation";

interface AdminDateSelectorProps {
  selectedDate: string;
}

export function AdminDateSelector({ selectedDate }: AdminDateSelectorProps) {
  const router = useRouter();

  // Parse selected date
  const [selectedYear, selectedMonth, selectedDay] = selectedDate
    .split("-")
    .map(Number);
  const selected = new Date(selectedYear, selectedMonth - 1, selectedDay);

  // Get today's date (local)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Generate 7 days: 3 before, selected, 3 after
  const generateWeekDates = () => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(selected);
      date.setDate(selected.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = generateWeekDates();

  const navigateToDate = (date: Date) => {
    // Don't allow future dates
    if (date > today) return;

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    router.push(`/admin?date=${dateStr}`);
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const isSelectedDate = (date: Date) => {
    return date.getTime() === selected.getTime();
  };

  const isFuture = (date: Date) => {
    return date > today;
  };

  return (
    <div className="mb-6">
      {/* Day names row */}
      <div className="flex items-center justify-between px-1 mb-3">
        {weekDates.map((date, index) => {
          const isSelected = isSelectedDate(date);
          return (
            <div key={`day-${index}`} className="flex-1 text-center">
              <span
                className={`text-xs font-medium ${
                  isSelected ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {formatDayName(date)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Date circles row */}
      <div className="flex items-center justify-between px-1">
        {weekDates.map((date, index) => {
          const isSelected = isSelectedDate(date);
          const future = isFuture(date);

          return (
            <button
              key={`date-${index}`}
              onClick={() => navigateToDate(date)}
              disabled={future}
              className="flex-1 flex justify-center"
            >
              <div
                className={`
                  w-11 h-11 rounded-full flex items-center justify-center transition-all
                  ${
                    isSelected
                      ? "bg-slate-800 text-white shadow-lg"
                      : future
                        ? "bg-stone-100 text-slate-300 cursor-not-allowed"
                        : "bg-stone-100 text-slate-700 hover:bg-stone-200"
                  }
                `}
              >
                <span
                  className={`text-base font-semibold ${isSelected ? "text-white" : ""}`}
                >
                  {date.getDate()}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
