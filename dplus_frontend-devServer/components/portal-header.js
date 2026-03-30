"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Radio,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Search,
  User,
  Sparkles,
  LogOut,
  Activity,
  Server,
  Cpu,
  X,
  CalendarDays,
  Globe,
  Wifi,
} from "lucide-react";
import { readProfile } from "../lib/portal-auth";

const liveNotifications = [
  { id: 1, text: "System running optimally", type: "success", theme: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", dot: "bg-green-500", shadow: "shadow-green-500/50" } },
  { id: 2, text: "High latency on Node-04", type: "warning", theme: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", dot: "bg-orange-500", shadow: "shadow-orange-500/50" } },
  { id: 3, text: "Server CPU critical (>90%)", type: "danger", theme: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-500", shadow: "shadow-red-500/50" } },
];

const timezoneFallbacks = [
  "UTC",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const timezoneCodeMap = {
  UTC: "UTC",
  "Asia/Kolkata": "IST",
  "Asia/Dubai": "GST",
  "Asia/Singapore": "SGT",
  "Asia/Tokyo": "JST",
  "Europe/London": "GMT",
  "Europe/Paris": "CET",
  "Europe/Berlin": "CET",
  "America/New_York": "EST",
  "America/Chicago": "CST",
  "America/Denver": "MST",
  "America/Los_Angeles": "PST",
  "America/Toronto": "EST",
  "Australia/Sydney": "AEST",
  "Pacific/Auckland": "NZST",
};

const timezoneNameMap = {
  "Asia/Kolkata": "IST - India Standard Time",
  UTC: "Universal Time Coordinated",
  "Asia/Dubai": "Gulf Standard Time",
  "Asia/Singapore": "Singapore Standard Time",
  "Asia/Tokyo": "Japan Standard Time",
  "Europe/London": "Greenwich Mean Time",
  "Europe/Paris": "Central European Time",
  "Europe/Berlin": "Central European Time",
  "America/New_York": "Eastern Standard Time",
  "America/Chicago": "Central Standard Time",
  "America/Denver": "Mountain Standard Time",
  "America/Los_Angeles": "Pacific Standard Time",
  "America/Toronto": "Eastern Standard Time",
  "Australia/Sydney": "Australian Eastern Time",
  "Pacific/Auckland": "New Zealand Standard Time",
};

const PROFILE_STORAGE_KEY = "dy2-profile";
const ACTIVE_ITEM_STORAGE_KEY = "dy2-sidebar-active";
const OPEN_CATEGORY_STORAGE_KEY = "dy2-sidebar-open";

const formatTimezoneLabel = (value) =>
  value
    .split("/")
    .map((part) => part.replace(/_/g, " "))
    .join(" / ");

const getTimezoneOptions = () => {
  const supported = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : timezoneFallbacks;
  const ordered = [...timezoneFallbacks, ...supported.filter((value) => !timezoneFallbacks.includes(value))];
  return ordered.map((value) => ({
    value,
    name: timezoneNameMap[value] || formatTimezoneLabel(value),
    aliases: value === "Asia/Kolkata" ? ["india", "indian", "kolkata", "ist", "asia kolkata"] : [],
    code:
      timezoneCodeMap[value] ||
      value
        .split("/")
        .at(-1)
        .replace(/[^A-Za-z]/g, "")
        .slice(0, 4)
        .toUpperCase(),
  }));
};

const getDynamicTimezoneCode = (timeZone, fallbackCode, currentDate) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(currentDate);
    const derived = parts.find((part) => part.type === "timeZoneName")?.value?.trim();
    if (!derived) return fallbackCode;
    if (timeZone === "Asia/Kolkata" && derived.startsWith("GMT")) return "IST";
    return derived;
  } catch {
    return fallbackCode;
  }
};

export default function PortalHeader({ isSidebarOpen, onSidebarToggle }) {
  const router = useRouter();
  const timezoneOptions = useRef(getTimezoneOptions());
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notifIndex, setNotifIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [selectedTz, setSelectedTz] = useState("Asia/Kolkata");
  const [timezoneQuery, setTimezoneQuery] = useState("");
  const [profile, setProfile] = useState(() => readProfile());
  const headerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    const notifInterval = setInterval(() => {
      setNotifIndex((prev) => (prev + 1) % liveNotifications.length);
    }, 4000);
    return () => {
      clearInterval(clockInterval);
      clearInterval(notifInterval);
    };
  }, []);

  useEffect(() => {
    const syncProfile = () => setProfile(readProfile());
    window.addEventListener("storage", syncProfile);
    window.addEventListener("dy2-profile-updated", syncProfile);
    return () => {
      window.removeEventListener("storage", syncProfile);
      window.removeEventListener("dy2-profile-updated", syncProfile);
    };
  }, []);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
    if (dropdownName === "timezone" && activeDropdown !== "timezone") {
      setTimezoneQuery("");
    }
  };

  const currentNotif = liveNotifications[notifIndex];
  const selectedTimezone = timezoneOptions.current.find((timezone) => timezone.value === selectedTz) || timezoneOptions.current[0];
  const selectedTimezoneCode = getDynamicTimezoneCode(selectedTz, selectedTimezone?.code || "UTC", currentTime);
  const dateStr = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: selectedTz,
  }).format(currentTime).toUpperCase();
  const timeStr = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: selectedTz,
  }).format(currentTime);
  const displayName = profile?.fullName || profile?.username || "Datayog User";
  const displayRole = String(profile?.title || "ADMIN").toUpperCase();
  const profileImage = profile?.avatar || "/user.png";
  const filteredTimezones = timezoneOptions.current.filter((timezone) => {
    const query = timezoneQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      timezone.name.toLowerCase().includes(query) ||
      timezone.code.toLowerCase().includes(query) ||
      timezone.value.toLowerCase().includes(query) ||
      timezone.aliases?.some((alias) => alias.includes(query))
    );
  });

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("authenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("permission");
    localStorage.removeItem("pageName");
    localStorage.removeItem("config");
    setIsLogoutModalOpen(false);
    router.replace("/login");
  };

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-40 flex h-[78px] shrink-0 items-center justify-between border-b border-white/5 bg-[linear-gradient(90deg,#09001A_0%,#0A1240_42%,#071224_100%)] px-4 py-3 backdrop-blur-3xl sm:px-6 lg:relative">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center lg:w-[290px]">
            <Link
              href="/home"
              onClick={() => {
                localStorage.setItem(ACTIVE_ITEM_STORAGE_KEY, "Dashboard");
                localStorage.removeItem(OPEN_CATEGORY_STORAGE_KEY);
                window.dispatchEvent(new Event("dy2-sidebar-updated"));
              }}
              className="flex cursor-pointer items-center gap-3 group focus:outline-none sm:gap-4"
            >
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-[#F26522] blur-lg opacity-20 transition-opacity duration-500 group-hover:opacity-40" />
                <img src="/logo.png" alt="Logo" className="relative z-10 h-8 w-auto drop-shadow-lg sm:h-9 lg:h-10" />
              </div>
              <span className="hidden text-[24px] font-extrabold leading-none tracking-[0.02em] sm:flex lg:text-[30px]">
                <span className="text-white">DATA</span>
                <span className="text-[#F26522]">YOG</span>
              </span>
            </Link>
          </div>

          <div className="absolute left-[277px] top-1/2 hidden h-12 w-px -translate-y-1/2 bg-white/10 lg:block" />

          <button
            type="button"
            onClick={onSidebarToggle}
            className="hidden h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-gray-300 transition-all duration-300 hover:border-[#F26522]/40 hover:bg-[#F26522]/10 hover:text-[#F26522] focus:outline-none lg:inline-flex"
            aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose className="h-[18px] w-[18px]" /> : <PanelLeftOpen className="h-[18px] w-[18px]" />}
          </button>

          <div className="relative hidden lg:block lg:flex-shrink-0">
            <button
              onClick={() => toggleDropdown("timezone")}
              className={`group flex items-center gap-3 rounded-[8px] px-3 py-1.5 transition-all focus:outline-none ${
                activeDropdown === "timezone"
                  ? "border border-[#F26522]/50 bg-[#F26522]/10 shadow-[0_0_15px_rgba(242,101,34,0.15)]"
                  : "border border-white/10 bg-white/5 hover:bg-[#F26522]/10 hover:border-[#F26522]/50"
              }`}
            >
              <CalendarDays className={`h-4 w-4 transition-all duration-300 group-hover:scale-110 ${activeDropdown === "timezone" ? "text-[#F26522]" : "text-gray-300 group-hover:text-[#F26522]"}`} />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 sm:text-[10px]">{dateStr}</span>
                <span className="font-mono text-[10px] font-medium text-white sm:text-xs">
                  {timeStr} <span className="ml-1 font-mono font-bold text-[#F26522]">{selectedTimezoneCode}</span>
                </span>
              </div>
            </button>

            {activeDropdown === "timezone" && (
              <div className="absolute left-0 top-full z-50 mt-3 w-[25rem] animate-in slide-in-from-top-2 overflow-hidden rounded-[12px] border border-[#F26522]/30 bg-[#0B101E]/95 shadow-[0_8px_32px_0_rgba(242,101,34,0.15)] backdrop-blur-3xl">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 text-[#F26522]">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs font-semibold">Select Timezone</span>
                  </div>
                  <button type="button" onClick={() => setActiveDropdown(null)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-all hover:border-[#F26522]/40 hover:bg-[#F26522]/10 hover:text-[#F26522]" aria-label="Close timezone selector">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <Search className="h-4 w-4 text-white/40" />
                    <input type="text" value={timezoneQuery} onChange={(event) => setTimezoneQuery(event.target.value)} placeholder="Search timezone..." className="ml-2 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25" />
                  </div>
                </div>
                <div className="max-h-80 space-y-1 overflow-y-auto px-2 pb-3">
                  {filteredTimezones.map((tz) => (
                    <button key={tz.value} onClick={() => { setSelectedTz(tz.value); setActiveDropdown(null); setTimezoneQuery(""); }} className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-200 transition-colors hover:bg-[#F26522]/10 hover:text-[#F26522]">
                      <div className="min-w-0 text-left">
                        <span className="block truncate font-medium">{tz.name}</span>
                        <span className="block truncate text-[11px] text-white/35">{tz.value}</span>
                      </div>
                      <span className="ml-3 text-xs font-semibold text-[#F26522] opacity-80">{tz.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-5">
          <div className={`hidden cursor-default items-center space-x-2 rounded-[8px] border px-4 py-1.5 transition-colors duration-500 lg:flex ${currentNotif.theme.bg} ${currentNotif.theme.border}`}>
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${currentNotif.theme.dot}`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${currentNotif.theme.dot} ${currentNotif.theme.shadow}`} />
            </span>
            <span className={`w-48 truncate text-xs font-medium transition-colors duration-500 ${currentNotif.theme.text}`}>{currentNotif.text}</span>
          </div>

          <button onClick={() => { setIsServerModalOpen(true); setActiveDropdown(null); }} className="group relative rounded-[8px] border border-white/10 bg-white/5 p-2 text-gray-300 transition-all duration-300 hover:border-[#F26522]/50 hover:bg-[#F26522]/10 hover:text-[#F26522] focus:outline-none">
            <Radio className="h-[18px] w-[18px] transition-transform group-hover:scale-110 group-hover:animate-pulse" />
          </button>

          <button className="group relative flex items-center justify-center rounded-[8px] border border-white/10 bg-white/5 p-2 text-gray-300 transition-all duration-300 hover:border-[#F26522]/50 hover:bg-[#F26522]/10 hover:text-[#F26522] focus:outline-none">
            <Bell className="relative z-10 h-[18px] w-[18px] transition-transform group-hover:scale-110" />
            <span className={`absolute -right-[2px] -top-[2px] h-2 w-2 animate-pulse rounded-full transition-colors duration-500 ${currentNotif.theme.dot} ${currentNotif.theme.shadow}`} />
          </button>

          <div className="relative">
            <button onClick={() => toggleDropdown("profile")} className={`group flex items-center space-x-2 rounded-[8px] border p-1.5 transition-all duration-300 focus:outline-none sm:space-x-3 sm:pr-3 ${activeDropdown === "profile" ? "border-[#F26522]/50 bg-[#F26522]/10 shadow-[0_0_15px_rgba(242,101,34,0.15)]" : "border-white/10 bg-white/5 hover:border-[#F26522]/50 hover:bg-[#F26522]/10"}`}>
              <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-[6px] border border-white/20 transition-colors group-hover:border-[#F26522]/50 sm:h-8 sm:w-8">
                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0B101E&color=F26522`; }} />
              </div>
              <div className="hidden flex-col text-left sm:flex">
                <span className="text-[11px] font-bold leading-tight text-white sm:text-xs">{displayName}</span>
                <span className="text-[8px] font-bold tracking-wider text-gray-400 sm:text-[9px]">{displayRole}</span>
              </div>
              <ChevronDown className={`hidden h-3 w-3 transition-transform duration-300 sm:block sm:h-4 sm:w-4 ${activeDropdown === "profile" ? "rotate-180 text-[#F26522]" : "text-gray-400 group-hover:text-[#F26522]"}`} />
            </button>

            {activeDropdown === "profile" && (
              <div className="absolute right-0 z-50 mt-3 w-64 animate-in slide-in-from-top-2 rounded-[12px] border border-[#F26522]/30 bg-[#0B101E]/95 py-2 shadow-[0_8px_32px_0_rgba(242,101,34,0.15)] backdrop-blur-3xl">
                <div className="mt-2 space-y-1 px-2">
                  <Link href="/profile" onClick={() => setActiveDropdown(null)} className="group flex items-center rounded-lg px-3 py-2.5 text-sm text-gray-200 transition-colors hover:bg-[#F26522]/10 hover:text-[#F26522] focus:outline-none">
                    <User className="mr-3 h-[18px] w-[18px] text-gray-400 transition-all group-hover:scale-110 group-hover:text-[#F26522]" /> Profile
                  </Link>
                  <Link href="/home" onClick={() => setActiveDropdown(null)} className="group flex items-center rounded-lg px-3 py-2.5 text-sm text-gray-200 transition-colors hover:bg-[#F26522]/10 hover:text-[#F26522] focus:outline-none">
                    <Bell className="mr-3 h-[18px] w-[18px] text-gray-400 transition-all group-hover:scale-110 group-hover:text-[#F26522]" /> Notifications
                  </Link>
                  <Link href="/home" onClick={() => setActiveDropdown(null)} className="group flex items-center rounded-lg px-3 py-2.5 text-sm text-gray-200 transition-colors hover:bg-[#F26522]/10 hover:text-[#F26522] focus:outline-none">
                    <Sparkles className="mr-3 h-[18px] w-[18px] text-gray-400 transition-all group-hover:scale-110 group-hover:text-[#F26522]" /> Nexa AI
                  </Link>
                </div>
                <div className="my-2 border-t border-white/10" />
                <div className="px-2 pb-2">
                  <button onClick={() => { setActiveDropdown(null); setIsLogoutModalOpen(true); }} className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 focus:outline-none">
                    <LogOut className="mr-3 h-[18px] w-[18px] text-red-400 transition-all group-hover:scale-110 group-hover:text-red-300" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border-2 border-red-600/20 bg-[#FFF5F0] p-6 text-center shadow-[0_20px_60px_rgba(220,38,38,0.3)]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-200 bg-red-100 shadow-sm">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-2 text-xl font-extrabold text-gray-900">Confirm Logout</h3>
            <p className="mb-6 text-sm font-medium text-gray-600">Are you sure you want to log out of Datayog?</p>
            <div className="flex gap-3">
              <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 rounded-[8px] border-2 border-gray-300 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none">Cancel</button>
              <button onClick={handleLogout} className="flex-1 rounded-[8px] bg-red-600 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-red-700 focus:outline-none">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}

      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[#F26522]/30 bg-[#0B101E]/90 shadow-[0_0_40px_rgba(242,101,34,0.1)] backdrop-blur-3xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-[8px] border border-[#F26522]/30 bg-[#F26522]/20 p-2">
                  <Activity className="h-5 w-5 animate-pulse text-[#F26522]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold tracking-wide text-white sm:text-lg">Live Infrastructure Analytics</h2>
                  <p className="flex items-center gap-1 text-[10px] text-purple-400 sm:text-xs"><Wifi className="h-3 w-3 text-green-400" /> Datacenter Alpha-01</p>
                </div>
              </div>
              <button onClick={() => setIsServerModalOpen(false)} className="group rounded-[8px] p-1.5 text-gray-400 transition-colors hover:bg-[#F26522]/10 hover:text-[#F26522] focus:outline-none">
                <X className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6">
              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-[#F26522]/40 sm:p-5">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F26522]/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10 mb-4 flex items-start justify-between">
                  <div className="flex items-center space-x-2 text-white transition-colors group-hover:text-white">
                    <Cpu className="h-4 w-4 text-[#F26522] sm:h-5 sm:w-5" />
                    <span className="text-xs font-medium sm:text-sm">Cluster CPU Load</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white transition-colors group-hover:text-[#F26522] sm:text-xl">68%</span>
                    <p className="flex items-center justify-end text-[9px] text-green-400 sm:text-[10px]"><span className="mr-1 h-1 w-1 animate-pulse rounded-full bg-green-400" />Stable</p>
                  </div>
                </div>
                <div className="flex h-12 w-full items-end gap-1 opacity-80 transition-opacity group-hover:opacity-100 sm:h-16">
                  {[40, 55, 45, 70, 60, 80, 65, 75, 68].map((height, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#F26522]/60 to-purple-500/80 transition-all duration-500 hover:bg-[#F26522]" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-[#F26522]/40 sm:p-5">
                <div className="relative z-10 mb-4 flex items-start justify-between">
                  <div className="flex items-center space-x-2 text-white transition-colors group-hover:text-white">
                    <Server className="h-4 w-4 text-purple-400 transition-colors group-hover:text-[#F26522] sm:h-5 sm:w-5" />
                    <span className="text-xs font-medium sm:text-sm">Memory Usage</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white sm:text-xl">12.4 <span className="text-xs text-gray-400 transition-colors group-hover:text-purple-300 sm:text-sm">/ 16 GB</span></span>
                  </div>
                </div>
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full border border-white/5 bg-black/50 shadow-inner sm:h-3">
                  <div className="relative h-full rounded-full bg-gradient-to-r from-purple-500 to-[#F26522] shadow-[0_0_10px_rgba(242,101,34,0.5)]">
                    <div className="absolute inset-0 w-full -translate-x-full animate-[shimmer_2s_infinite] bg-white/20" />
                  </div>
                </div>
                <div className="flex justify-between text-[9px] text-gray-500 transition-colors group-hover:text-gray-400 sm:text-[10px]">
                  <span>Swap: 1.2GB</span>
                  <span>Cached: 4.1GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
