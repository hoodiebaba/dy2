import React, { useState } from "react";
import { BellRing, CheckCircle, Clock, Filter, Search, Trash2 } from "lucide-react";

const initialNotifications = [
  {
    id: 1,
    title: "Server CPU critical (>90%)",
    desc: "Node Alpha is experiencing high load.",
    priority: "danger",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    date: "14 Mar 2026",
    time: "14:30",
    read: false,
  },
  {
    id: 2,
    title: "High latency on Node-04",
    desc: "Network routing delayed by 400ms.",
    priority: "warning",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    date: "14 Mar 2026",
    time: "12:15",
    read: false,
  },
  {
    id: 3,
    title: "System running optimally",
    desc: "Daily parameter audit passed.",
    priority: "success",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    date: "13 Mar 2026",
    time: "09:00",
    read: true,
  },
  {
    id: 4,
    title: "Auto-backup failed",
    desc: "Storage limit reached on Backup Server.",
    priority: "danger",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    date: "12 Mar 2026",
    time: "02:00",
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotif = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  const filteredNotifs = notifications.filter((notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(search.toLowerCase());
    const filterColor =
      filter === "red"
        ? "text-red-500"
        : filter === "orange"
          ? "text-orange-500"
          : filter === "green"
            ? "text-green-500"
            : "all";
    const matchesFilter = filter === "all" ? true : notification.color === filterColor;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col animate-in fade-in p-4 sm:p-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-wide text-white">
            <BellRing className="h-6 w-6 text-[#F26522]" /> Alert Center
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Monitor system warnings, errors, and success logs.
          </p>
        </div>

        <div className="flex w-full items-center gap-3 md:w-auto">
          <div className="flex flex-1 items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 shadow-inner transition-colors focus-within:border-[#F26522] focus-within:bg-black/40 md:w-64">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 w-full border-none bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-8 text-sm text-gray-300 shadow-inner transition-colors hover:bg-white/10 focus:border-[#F26522] focus:outline-none"
            >
              <option value="all" className="bg-[#0B101E] text-white">
                All Priorities
              </option>
              <option value="red" className="bg-[#0B101E] text-red-500">
                Critical (Red)
              </option>
              <option value="orange" className="bg-[#0B101E] text-orange-500">
                Warning (Orange)
              </option>
              <option value="green" className="bg-[#0B101E] text-green-500">
                Success (Green)
              </option>
            </select>
            <Filter className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {filteredNotifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-20 text-gray-500">
          <CheckCircle className="mb-3 h-12 w-12 opacity-20" />
          <p className="text-sm">No alerts matching your criteria.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`group flex items-start gap-4 rounded-xl border p-4 transition-all duration-300 sm:items-center ${
                notif.read
                  ? "border-white/5 bg-white/5 opacity-70 hover:opacity-100 hover:border-white/10"
                  : `${notif.bg} ${notif.border} shadow-lg`
              }`}
            >
              <div className="mt-1 flex-shrink-0 sm:mt-0">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    notif.read ? "bg-gray-500" : notif.color.replace("text-", "bg-")
                  } ${!notif.read ? "animate-pulse shadow-[0_0_8px] shadow-current" : ""}`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <h3
                    className={`truncate text-sm font-bold ${
                      notif.read ? "text-gray-300" : "text-white"
                    }`}
                  >
                    {notif.title}
                  </h3>
                  <div className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-white/5 bg-black/20 px-2 py-0.5 font-mono text-[10px] text-gray-400">
                    <Clock className="h-3 w-3" /> {notif.date}{" "}
                    <span className="text-gray-600">|</span> {notif.time}
                  </div>
                </div>
                <p className="mt-1 truncate text-sm text-gray-400">{notif.desc}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                {!notif.read ? (
                  <button
                    type="button"
                    onClick={() => markAsRead(notif.id)}
                    className="rounded-lg border border-transparent p-2 text-gray-400 transition-all hover:border-green-500/20 hover:bg-green-500/10 hover:text-green-400"
                    title="Mark as Read"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => deleteNotif(notif.id)}
                  className="rounded-lg border border-transparent p-2 text-gray-400 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
