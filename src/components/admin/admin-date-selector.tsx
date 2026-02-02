"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface AdminDateSelectorProps {
  selectedDate: string;
}

export function AdminDateSelector({ selectedDate }: AdminDateSelectorProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setToday(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);

  // Parse selected date
  const [selectedYear, selectedMonth, selectedDay] = selectedDate
    .split("-")
    .map(Number);
  const selected = new Date(selectedYear, selectedMonth - 1, selectedDay);

  // Generate dates: 30 days before and up to today
  const generateDates = () => {
    if (!today) {
      // Fallback to selected date based range
      const dates = [];
      for (let i = -30; i <= 7; i++) {
        const date = new Date(selected);
        date.setDate(selected.getDate() + i);
        dates.push(date);
      }
      return dates;
    }

    const dates = [];
    for (let i = -30; i <= 0; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const allDates = generateDates();

  // Scroll to selected date on mount
  useEffect(() => {
    if (scrollRef.current && mounted) {
      const selectedElement = scrollRef.current.querySelector(
        '[data-selected="true"]',
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [mounted]);

  const navigateToDate = (date: Date) => {
    // Don't allow future dates
    if (today && date > today) return;

    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    router.push(`/admin?date=${dateStr}`);
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const isSelectedDate = (date: Date) => {
    return date.getTime() === selected.getTime();
  };

  const isToday = (date: Date) => {
    if (!today) return false;
    return date.getTime() === today.getTime();
  };

  const isFuture = (date: Date) => {
    if (!today) return false;
    return date > today;
  };

  return (
    <div className="mb-6 w-full overflow-hidden">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allDates.map((date, index) => {
          const isSelected = isSelectedDate(date);
          const future = isFuture(date);
          const isTodayDate = isToday(date);

          return (
            <button
              key={index}
              data-selected={isSelected}
              onClick={() => navigateToDate(date)}
              disabled={future}
              className={`
                flex flex-col items-center justify-center min-w-[56px] py-2 px-3 rounded-xl transition-all snap-center
                ${
                  isSelected
                    ? "bg-blue-500 text-white"
                    : future
                      ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <span className="text-[10px] uppercase font-medium opacity-70">
                {formatDayName(date)}
              </span>
              <span
                className={`text-lg font-semibold ${
                  isTodayDate && !isSelected ? "text-blue-500" : ""
                }`}
              >
                {date.getDate()}
              </span>
              {isTodayDate && (
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    isSelected ? "bg-white" : "bg-blue-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
