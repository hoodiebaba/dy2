import React from "react";

const statCards = [
  { label: "Active Nodes", value: "128", accent: "from-[#F26522]/25 to-transparent" },
  { label: "Critical Alerts", value: "07", accent: "from-red-500/25 to-transparent" },
  { label: "Sites Monitored", value: "342", accent: "from-cyan-500/25 to-transparent" },
  { label: "Avg Uptime", value: "99.2%", accent: "from-emerald-500/25 to-transparent" },
];

const Home = () => {
  return (
    <div className="min-h-full bg-transparent p-6 text-white lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(9,0,26,0.95)_0%,rgba(10,18,64,0.92)_52%,rgba(7,18,36,0.95)_100%)] p-6 shadow-[0_24px_80px_rgba(3,8,24,0.45)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#F26522]">Dashboard</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-[0.02em] text-white lg:text-4xl">
                Welcome to DataPlus Analytics
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/65 lg:text-base">
                Datayog-style overview shell is active. Sidebar items are available for UI flow, and the dashboard remains the default landing page.
              </p>
            </div>
            <div className="hidden rounded-2xl border border-[#F26522]/20 bg-[#F26522]/10 px-4 py-3 text-right lg:block">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">System State</p>
              <p className="mt-1 text-lg font-bold text-[#F26522]">Operational</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#081224] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.35)]"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent}`} />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{card.label}</p>
                <p className="mt-4 text-3xl font-extrabold text-white">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
