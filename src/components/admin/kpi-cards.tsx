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
    },
    {
      label: "Slots Booked",
      value: kpis.slotsBooked,
    },
    {
      label: "Pending Follow-ups",
      value: kpis.followUpsPending,
    },
    {
      label: "Active Employees",
      value: kpis.activeEmployees,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl px-5 py-6 border border-slate-200"
        >
          <p className="text-4xl font-semibold text-slate-700 tracking-tight">
            {card.value}
          </p>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}
