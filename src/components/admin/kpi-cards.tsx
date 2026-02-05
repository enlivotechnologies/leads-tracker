"use client";

interface KpiCardsProps {
  kpis: {
    totalCalls: number;
    slotsBooked: number;
    followUpsPending: number;
    totalDeals: number;
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
      label: "Total Leads (All Time)",
      value: kpis.totalDeals,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl px-4 py-4 border border-slate-200"
        >
          <p className="text-3xl font-semibold text-slate-700 tracking-tight">
            {card.value}
          </p>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}
