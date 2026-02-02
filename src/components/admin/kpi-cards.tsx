"use client";

interface KpiCardsProps {
  kpis: {
    totalCalls: number;
    slotsBooked: number;
    followUpsPending: number;
    activeEmployees: number;
  };
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const cards = [
    {
      label: "Total Calls",
      value: kpis.totalCalls,
      accentColor: "bg-indigo-500",
    },
    {
      label: "Slots Booked",
      value: kpis.slotsBooked,
      accentColor: "bg-teal-500",
    },
    {
      label: "Pending Follow-ups",
      value: kpis.followUpsPending,
      accentColor: "bg-amber-500",
    },
    {
      label: "Active Employees",
      value: kpis.activeEmployees,
      accentColor: "bg-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100 relative overflow-hidden group"
        >
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 ${card.accentColor}`}
          />
          <div className="pl-2">
            <p className="text-4xl font-semibold text-slate-800 tracking-tight">
              {card.value}
            </p>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              {card.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
