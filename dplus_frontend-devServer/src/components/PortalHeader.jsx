import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const formatTimezoneLabel = (value) =>
  value
    .split("/")
    .map((part) => part.replace(/_/g, " "))
    .join(" / ");

const getTimezoneOptions = () => {
  const supported =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : timezoneFallbacks;

  const ordered = [...timezoneFallbacks, ...supported.filter((value) => !timezoneFallbacks.includes(value))];

  return ordered.map((value) => ({
    value,
    name: timezoneNameMap[value] || formatTimezoneLabel(value),
    aliases:
      value === "Asia/Kolkata"
        ? ["india", "indian", "kolkata", "ist", "asia kolkata"]
        : [],
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

const PROFILE_STORAGE_KEY = "dy2-profile";
const ACTIVE_ITEM_STORAGE_KEY = "dy2-sidebar-active";
const OPEN_CATEGORY_STORAGE_KEY = "dy2-sidebar-open";

const safeParse = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const readProfile = () => {
  const savedProfile = safeParse(localStorage.getItem(PROFILE_STORAGE_KEY), {});
  const savedUser = safeParse(localStorage.getItem("user"), {});
  const fullName =
    savedProfile.fullName ||
    [savedUser.firstname, savedUser.lastname].filter(Boolean).join(" ").trim() ||
    savedUser.username ||
    "Datayog User";

  return {
    fullName,
    username: savedProfile.username || savedUser.username || "admin",
    title: savedProfile.title || savedUser.rolename || "ADMIN",
    avatar: savedProfile.avatar || savedUser.profileImage || "",
  };
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

const PortalHeader = ({ isSidebarOpen, onSidebarToggle }) => {
  const navigate = useNavigate();
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
  const selectedTimezone =
    timezoneOptions.current.find((timezone) => timezone.value === selectedTz) || timezoneOptions.current[0];
  const selectedTimezoneCode = getDynamicTimezoneCode(
    selectedTz,
    selectedTimezone?.code || "UTC",
    currentTime
  );
  const dateStr = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: selectedTz,
    })
      .format(currentTime)
      .toUpperCase();

  const timeStr = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: selectedTz,
  }).format(currentTime);
  const displayName = profile.fullName || profile.username;
  const displayRole = String(profile.title || "ADMIN").toUpperCase();
  const profileImage = profile.avatar || "/user.png";
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
    navigate("/login");
  };

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-[linear-gradient(90deg,#09001A_0%,#0A1240_42%,#071224_100%)] px-4 py-3 backdrop-blur-3xl sm:px-6 lg:relative">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center lg:w-[290px]">
            <Link
              to="/home"
              onClick={() => {
                localStorage.setItem(ACTIVE_ITEM_STORAGE_KEY, "Dashboard");
                localStorage.removeItem(OPEN_CATEGORY_STORAGE_KEY);
                window.dispatchEvent(new Event("dy2-sidebar-updated"));
              }}
              className="flex items-center gap-3 sm:gap-4 cursor-pointer group focus:outline-none"
            >
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-[#F26522] blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <img src="/logo.png" alt="Logo" className="h-8 sm:h-9 lg:h-10 w-auto relative z-10 drop-shadow-lg" />
              </div>
              <span className="hidden sm:flex text-[24px] lg:text-[30px] font-extrabold tracking-[0.02em] leading-none">
                <span className="text-white">DATA</span>
                <span className="text-[#F26522]">YOG</span>
              </span>
            </Link>
          </div>

          <div className="hidden lg:block absolute left-[277px] top-1/2 h-12 w-px -translate-y-1/2 bg-white/10" />

          <button
            type="button"
            onClick={onSidebarToggle}
            className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-gray-300 transition-all duration-300 hover:border-[#F26522]/40 hover:bg-[#F26522]/10 hover:text-[#F26522] focus:outline-none"
            aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-[18px] w-[18px]" />
            ) : (
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            )}
          </button>

          <div className="relative hidden lg:block lg:flex-shrink-0">
            <button
              onClick={() => toggleDropdown("timezone")}
              className={`flex items-center gap-3 rounded-[8px] px-3 py-1.5 transition-all focus:outline-none group ${
                activeDropdown === "timezone"
                  ? "border border-[#F26522]/50 bg-[#F26522]/10 shadow-[0_0_15px_rgba(242,101,34,0.15)]"
                  : "border border-white/10 bg-white/5 hover:bg-[#F26522]/10 hover:border-[#F26522]/50"
              }`}
            >
              <CalendarDays className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${activeDropdown === "timezone" ? "text-[#F26522]" : "text-gray-300 group-hover:text-[#F26522]"}`} />
              <div className="flex flex-col text-left">
                <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">{dateStr}</span>
                <span className="text-[10px] sm:text-xs text-white font-mono font-medium">
                  {timeStr} <span className="text-[#F26522] font-bold font-mono ml-1">{selectedTimezoneCode}</span>
                </span>
              </div>
            </button>

            {activeDropdown === "timezone" && (
              <div className="absolute top-full left-0 mt-3 w-[25rem] bg-[#0B101E]/95 backdrop-blur-3xl border border-[#F26522]/30 rounded-[12px] shadow-[0_8px_32px_0_rgba(242,101,34,0.15)] z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 text-[#F26522]">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-semibold">Select Timezone</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(null)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-all hover:border-[#F26522]/40 hover:bg-[#F26522]/10 hover:text-[#F26522]"
                    aria-label="Close timezone selector"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <Search className="h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      value={timezoneQuery}
                      onChange={(event) => setTimezoneQuery(event.target.value)}
                      placeholder="Search timezone..."
                      className="ml-2 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                    />
                  </div>
                </div>
                <div className="max-h-80 space-y-1 overflow-y-auto px-2 pb-3">
                  {filteredTimezones.map((tz) => (
                    <button
                      key={tz.value}
                      onClick={() => {
                        setSelectedTz(tz.value);
                        setActiveDropdown(null);
                        setTimezoneQuery("");
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-200 hover:bg-[#F26522]/10 hover:text-[#F26522] rounded-lg transition-colors group"
                    >
                      <div className="min-w-0 text-left">
                        <span className="block truncate font-medium">{tz.name}</span>
                        <span className="block truncate text-[11px] text-white/35">{tz.value}</span>
                      </div>
                      <span className="ml-3 text-xs text-[#F26522] font-semibold opacity-80">{tz.code}</span>
                    </button>
                  ))}
                  {filteredTimezones.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-white/40">No timezone found.</div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-5">
          <div
            className={`hidden lg:flex items-center space-x-2 px-4 py-1.5 rounded-[8px] border transition-colors duration-500 cursor-default ${currentNotif.theme.bg} ${currentNotif.theme.border}`}
            style={{ fontFamily: '"DatayogQuantico", Arial, Helvetica, sans-serif' }}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentNotif.theme.dot}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${currentNotif.theme.dot} ${currentNotif.theme.shadow}`} />
            </span>
            <span className={`text-xs font-medium w-48 truncate transition-colors duration-500 ${currentNotif.theme.text}`}>
              {currentNotif.text}
            </span>
          </div>

          <button
            onClick={() => {
              setIsServerModalOpen(true);
              setActiveDropdown(null);
            }}
            className="relative p-2 rounded-[8px] bg-white/5 border border-white/10 text-gray-300 hover:text-[#F26522] hover:border-[#F26522]/50 hover:bg-[#F26522]/10 transition-all duration-300 group focus:outline-none"
          >
            <Radio className="h-[18px] w-[18px] group-hover:scale-110 group-hover:animate-pulse transition-transform" />
          </button>

          <Link
            to="/notifications"
            className="relative flex items-center justify-center p-2 rounded-[8px] bg-white/5 border border-white/10 text-gray-300 hover:text-[#F26522] hover:border-[#F26522]/50 hover:bg-[#F26522]/10 transition-all duration-300 group focus:outline-none"
          >
            <Bell className="h-[18px] w-[18px] relative z-10 group-hover:scale-110 transition-transform" />
            <span className={`absolute -top-[2px] -right-[2px] h-2 w-2 rounded-full animate-pulse transition-colors duration-500 ${currentNotif.theme.dot} ${currentNotif.theme.shadow}`} />
          </Link>

          <div className="relative">
            <button
              onClick={() => toggleDropdown("profile")}
              className={`flex items-center space-x-2 sm:space-x-3 p-1.5 sm:pr-3 rounded-[8px] border transition-all duration-300 focus:outline-none group ${
                activeDropdown === "profile"
                  ? "bg-[#F26522]/10 border-[#F26522]/50 shadow-[0_0_15px_rgba(242,101,34,0.15)]"
                  : "bg-white/5 border-white/10 hover:bg-[#F26522]/10 hover:border-[#F26522]/50"
              }`}
            >
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-[6px] overflow-hidden border border-white/20 group-hover:border-[#F26522]/50 transition-colors flex-shrink-0">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0B101E&color=F26522`;
                  }}
                />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">{displayName}</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 tracking-wider">{displayRole}</span>
              </div>
              <ChevronDown className={`hidden sm:block h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 ${activeDropdown === "profile" ? "rotate-180 text-[#F26522]" : "text-gray-400 group-hover:text-[#F26522]"}`} />
            </button>

            {activeDropdown === "profile" && (
              <div className="absolute right-0 mt-3 w-64 bg-[#0B101E]/95 backdrop-blur-3xl border border-[#F26522]/30 rounded-[12px] shadow-[0_8px_32px_0_rgba(242,101,34,0.15)] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2 space-y-1 mt-2">
                  <Link to="/profile" onClick={() => setActiveDropdown(null)} className="flex items-center px-3 py-2.5 text-sm text-gray-200 hover:bg-[#F26522]/10 hover:text-[#F26522] rounded-lg transition-colors group focus:outline-none">
                    <User className="h-[18px] w-[18px] mr-3 text-gray-400 group-hover:text-[#F26522] group-hover:scale-110 transition-all" /> Profile
                  </Link>
                  <Link to="/notifications" onClick={() => setActiveDropdown(null)} className="flex items-center px-3 py-2.5 text-sm text-gray-200 hover:bg-[#F26522]/10 hover:text-[#F26522] rounded-lg transition-colors group focus:outline-none">
                    <Bell className="h-[18px] w-[18px] mr-3 text-gray-400 group-hover:text-[#F26522] group-hover:scale-110 transition-all" /> Notifications
                  </Link>
                  <Link to="/nexa" onClick={() => setActiveDropdown(null)} className="flex items-center px-3 py-2.5 text-sm text-gray-200 hover:bg-[#F26522]/10 hover:text-[#F26522] rounded-lg transition-colors group focus:outline-none">
                    <Sparkles className="h-[18px] w-[18px] mr-3 text-gray-400 group-hover:text-[#F26522] group-hover:scale-110 transition-all" /> Nexa AI
                  </Link>
                </div>

                <div className="border-t border-white/10 my-2" />

                <div className="px-2 pb-2">
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors group focus:outline-none"
                  >
                    <LogOut className="h-[18px] w-[18px] mr-3 text-red-400 group-hover:text-red-300 group-hover:scale-110 transition-all" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#FFF5F0] border-2 border-red-600/20 rounded-2xl shadow-[0_20px_60px_rgba(220,38,38,0.3)] w-full max-w-sm p-6 text-center transform transition-all scale-100">
            <div className="mx-auto w-14 h-14 bg-red-100 border-2 border-red-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-sm text-gray-600 mb-6 font-medium">Are you sure you want to log out of Datayog?</p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-[8px] border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-bold focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-[8px] bg-red-600 text-white hover:bg-red-700 shadow-md transition-all text-sm font-bold focus:outline-none"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-[#0B101E]/90 backdrop-blur-3xl border border-[#F26522]/30 rounded-2xl shadow-[0_0_40px_rgba(242,101,34,0.1)] w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#F26522]/20 rounded-[8px] border border-[#F26522]/30">
                  <Activity className="w-5 h-5 text-[#F26522] animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-white tracking-wide">Live Infrastructure Analytics</h2>
                  <p className="text-[10px] sm:text-xs text-purple-400 flex items-center gap-1"><Wifi className="w-3 h-3 text-green-400" /> Datacenter Alpha-01</p>
                </div>
              </div>
              <button
                onClick={() => setIsServerModalOpen(false)}
                className="text-gray-400 hover:text-[#F26522] hover:bg-[#F26522]/10 p-1.5 rounded-[8px] transition-colors group focus:outline-none"
              >
                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#F26522]/40 transition-colors relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F26522]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center space-x-2 text-white group-hover:text-white transition-colors">
                    <Cpu className="w-4 sm:w-5 h-4 sm:h-5 text-[#F26522]" />
                    <span className="text-xs sm:text-sm font-medium">Cluster CPU Load</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-bold text-white group-hover:text-[#F26522] transition-colors">68%</span>
                    <p className="text-[9px] sm:text-[10px] text-green-400 flex items-center justify-end"><span className="w-1 h-1 bg-green-400 rounded-full mr-1 animate-pulse" />Stable</p>
                  </div>
                </div>
                <div className="h-12 sm:h-16 w-full flex items-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {[40, 55, 45, 70, 60, 80, 65, 75, 68].map((height, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-[#F26522]/60 to-purple-500/80 rounded-t-sm transition-all duration-500 hover:bg-[#F26522]" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#F26522]/40 transition-colors relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center space-x-2 text-white group-hover:text-white transition-colors">
                    <Server className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400 group-hover:text-[#F26522] transition-colors" />
                    <span className="text-xs sm:text-sm font-medium">Memory Usage</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-bold text-white">12.4 <span className="text-xs sm:text-sm text-gray-400 group-hover:text-purple-300 transition-colors">/ 16 GB</span></span>
                  </div>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2 sm:h-3 overflow-hidden shadow-inner mb-2 border border-white/5">
                  <div className="bg-gradient-to-r from-purple-500 to-[#F26522] h-full rounded-full shadow-[0_0_10px_rgba(242,101,34,0.5)] relative">
                    <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -translate-x-full" />
                  </div>
                </div>
                <div className="flex justify-between text-[9px] sm:text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
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
};

export default PortalHeader;
