"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Map,
  BarChart2,
  LayoutDashboard,
  Settings,
  Database,
  Bell,
  Wrench,
  HardDrive,
  ChevronDown,
  PanelLeftOpen,
  Network,
  Layers,
  MessageSquare,
  Cpu,
  Terminal,
  MapPin,
  X,
} from "lucide-react";

const sidebarMenu = [
  { title: "Dashboard", type: "link", icon: LayoutDashboard, route: "/home" },
  { title: "Topology Layer", type: "link", icon: Network },
  { title: "Layer View", type: "dropdown", icon: Layers, children: ["Cell Layer"] },
  { title: "DataPlus Analytics Pro", type: "dropdown", icon: BarChart2, children: ["Site Analytics", "Site Pro Rules", "Cell Analytics", "Cell Pro Rules", "KPI Check Rules", "Pro Rules Management"] },
  { title: "Insights Engine", type: "dropdown", icon: Activity, children: ["Core Dashboards", "MSS Dashboard", "UGW Dashboard", "MGW Dashboard", "RAN Dashboards", "Worst Cells Dashboard", "4G Dashboard", "5G Dashboard", "Network Dashboard"] },
  { title: "Discussions", type: "link", icon: MessageSquare },
  { title: "GIS Engine", type: "link", icon: Map, route: "/gis-engine" },
  { title: "Configuration Management", type: "dropdown", icon: Settings, children: ["Parameter Audit", "Neighbour Audit", "Daily Parameter Audit"] },
  { title: "iSON", type: "link", icon: Cpu },
  { title: "Custom Query", type: "dropdown", icon: Database, children: ["DB Config", "Advanced Query Builder", "Run Query", "Saved Query List"] },
  { title: "xAlerts", type: "dropdown", icon: Bell, children: ["Configure Scheduler", "Alert Scheduler"] },
  { title: "CX/IX Support", type: "dropdown", icon: Wrench, children: ["Scripting", "Parameter Audit", "DB Update"] },
  { title: "Network Inventory", type: "dropdown", icon: HardDrive, children: ["Site Database", "Auto Discovery"] },
  { title: "Nokia Tool Management Query", type: "link", icon: Terminal },
  { title: "Map Settings", type: "link", icon: MapPin },
];

const ACTIVE_ITEM_STORAGE_KEY = "dy2-sidebar-active";
const OPEN_CATEGORY_STORAGE_KEY = "dy2-sidebar-open";

export default function PortalSidebar({ sidebarOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(() => (typeof window !== "undefined" ? localStorage.getItem(OPEN_CATEGORY_STORAGE_KEY) : null));
  const [activeItem, setActiveItem] = useState(() => (typeof window !== "undefined" ? localStorage.getItem(ACTIVE_ITEM_STORAGE_KEY) || "Dashboard" : "Dashboard"));
  const isCompactViewport = typeof window !== "undefined" && window.innerWidth < 1024;
  const menu = useMemo(() => sidebarMenu, []);
  const mobileVisible = isMobileOpen && isCompactViewport;

  useEffect(() => {
    const matchedRouteItem = menu.find((item) => item.type === "link" && item.route === pathname);
    if (matchedRouteItem) {
      setActiveItem(matchedRouteItem.title);
      setOpenCategory(null);
      return;
    }

    if (pathname === "/" || pathname === "/home") {
      setActiveItem(localStorage.getItem(ACTIVE_ITEM_STORAGE_KEY) || "Dashboard");
      setOpenCategory(localStorage.getItem(OPEN_CATEGORY_STORAGE_KEY));
      return;
    }

    if (pathname === "/profile") {
      setActiveItem("");
      setOpenCategory(null);
      return;
    }

    setActiveItem("");
    setOpenCategory(null);
  }, [pathname, menu]);

  useEffect(() => {
    const syncSidebarState = () => {
      const matchedRouteItem = menu.find((item) => item.type === "link" && item.route === pathname);
      if (matchedRouteItem) {
        setActiveItem(matchedRouteItem.title);
        setOpenCategory(null);
        return;
      }

      if (pathname === "/" || pathname === "/home") {
        setActiveItem(localStorage.getItem(ACTIVE_ITEM_STORAGE_KEY) || "Dashboard");
        setOpenCategory(localStorage.getItem(OPEN_CATEGORY_STORAGE_KEY));
      }
    };

    window.addEventListener("storage", syncSidebarState);
    window.addEventListener("dy2-sidebar-updated", syncSidebarState);

    return () => {
      window.removeEventListener("storage", syncSidebarState);
      window.removeEventListener("dy2-sidebar-updated", syncSidebarState);
    };
  }, [pathname, menu]);

  const closeMobileIfNeeded = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const handleLink = (item) => {
    const targetRoute = item.route || "/home";
    localStorage.setItem(ACTIVE_ITEM_STORAGE_KEY, item.title);
    localStorage.removeItem(OPEN_CATEGORY_STORAGE_KEY);
    window.dispatchEvent(new Event("dy2-sidebar-updated"));
    setActiveItem(item.title);
    setOpenCategory(null);
    router.push(targetRoute);
    closeMobileIfNeeded();
  };

  const handleDropdown = (title) => {
    const nextOpen = openCategory === title ? null : title;
    localStorage.setItem(ACTIVE_ITEM_STORAGE_KEY, title);
    if (nextOpen) {
      localStorage.setItem(OPEN_CATEGORY_STORAGE_KEY, nextOpen);
    } else {
      localStorage.removeItem(OPEN_CATEGORY_STORAGE_KEY);
    }
    window.dispatchEvent(new Event("dy2-sidebar-updated"));
    setActiveItem(title);
    setOpenCategory(nextOpen);
    router.push("/home");
    closeMobileIfNeeded();
  };

  const handleChild = (parentTitle, childTitle) => {
    localStorage.setItem(ACTIVE_ITEM_STORAGE_KEY, childTitle);
    localStorage.setItem(OPEN_CATEGORY_STORAGE_KEY, parentTitle);
    window.dispatchEvent(new Event("dy2-sidebar-updated"));
    setActiveItem(childTitle);
    setOpenCategory(parentTitle);
    router.push("/home");
    closeMobileIfNeeded();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#0B1730] text-white shadow-lg lg:hidden"
        aria-label="Open Sidebar"
      >
        <PanelLeftOpen className="h-5 w-5" />
      </button>

      <div
        onClick={() => setIsMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          mobileVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-50 h-screen overflow-hidden
          bg-[linear-gradient(180deg,#09001A_0%,#0A1240_38%,#071224_100%)] text-white
          transition-all duration-300 ease-in-out
          lg:sticky lg:top-0 lg:z-20 lg:h-full lg:min-h-0 lg:self-start lg:translate-x-0 lg:rounded-none
          ${sidebarOpen ? "w-[290px]" : "w-[88px]"}
          ${mobileVisible ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex h-full min-h-0 flex-col items-stretch">
          <div
            className={`flex items-center px-2 py-0 ${
              sidebarOpen ? "justify-end min-h-[12px]" : "justify-center min-h-[12px]"
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="inline-flex rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition-all duration-200 hover:border-[#F26522]/40 hover:bg-[#F26522]/10 hover:text-[#F26522] lg:hidden"
                aria-label="Close Sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="sidebar-scroll flex-1 min-h-0 overflow-y-scroll overflow-x-hidden px-0 pb-3 pt-0 pr-4 lg:pr-4">
            <ul className="space-y-1.5">
              {menu.map((item) => {
                const Icon = item.icon;
                const isDropdownOpen = openCategory === item.title;
                const hasActiveChild = Array.isArray(item.children) && item.children.includes(activeItem);
                const isActive =
                  activeItem === item.title || isDropdownOpen || hasActiveChild;

                if (item.type === "link") {
                  return (
                    <li key={item.title}>
                      <button
                        type="button"
                        onClick={() => handleLink(item)}
                        title={!sidebarOpen ? item.title : undefined}
                        className={`
                          group flex w-full items-center rounded-xl border transition-all duration-200
                          ${sidebarOpen ? "justify-start gap-3 px-3 py-3 ml-2 mr-3" : "justify-center px-2 py-3 ml-2 mr-3"}
                          ${
                            isActive
                              ? "border-[#F26522]/40 bg-[rgba(43,19,37,0.88)] text-white shadow-[inset_0_0_0_1px_rgba(242,101,34,0.1)]"
                              : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white"
                          }
                        `}
                      >
                        <Icon
                          className={`h-5 w-5 shrink-0 transition-all duration-200 ${
                            isActive ? "text-[#F26522]" : "text-white/75 group-hover:text-[#F26522]"
                          }`}
                        />
                        {sidebarOpen ? (
                          <span className="min-w-0 flex-1 truncate text-left text-[14px] font-medium tracking-[0.01em]">
                            {item.title}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={item.title} className="rounded-xl">
                    <div
                      className={`
                        group flex w-full items-center rounded-xl border transition-all duration-200
                        ${sidebarOpen ? "justify-between px-3 py-3 ml-2 mr-3" : "justify-center px-2 py-3 ml-2 mr-3"}
                        ${
                          isActive
                            ? "border-[#F26522]/40 bg-[rgba(43,19,37,0.88)] text-white shadow-[inset_0_0_0_1px_rgba(242,101,34,0.1)]"
                            : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >
                      <button
                        type="button"
                        onClick={() => handleDropdown(item.title)}
                        title={!sidebarOpen ? item.title : undefined}
                        className={`flex min-w-0 flex-1 items-center ${sidebarOpen ? "gap-3 text-left" : "justify-center"}`}
                      >
                        <Icon
                          className={`h-5 w-5 shrink-0 transition-all duration-200 ${
                            isActive ? "text-[#F26522]" : "text-white/75 group-hover:text-[#F26522]"
                          }`}
                        />
                        {sidebarOpen ? (
                          <span className="min-w-0 flex-1 truncate text-left text-[14px] font-medium tracking-[0.01em]">
                            {item.title}
                          </span>
                        ) : null}
                      </button>

                      {sidebarOpen ? (
                        <button
                          type="button"
                          onClick={() => setOpenCategory((prev) => (prev === item.title ? null : item.title))}
                          aria-label={isDropdownOpen ? `Collapse ${item.title}` : `Expand ${item.title}`}
                          className="ml-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/45 transition-all duration-200 hover:bg-white/5 hover:text-white/80"
                        >
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                              isDropdownOpen ? "rotate-180 text-[#F26522]" : "text-white/45 group-hover:text-white/80"
                            }`}
                          />
                        </button>
                      ) : null}
                    </div>

                    {sidebarOpen && isDropdownOpen && item.children ? (
                      <div className="ml-4 mt-2 border-l border-white/10 pl-3">
                        <div className="space-y-1">
                          {item.children.map((child) => (
                            <button
                              key={child}
                              type="button"
                              onClick={() => handleChild(item.title, child)}
                              className={`
                                block w-full rounded-lg px-3 py-2 text-left text-[12.5px] transition-all duration-200
                                ${
                                  activeItem === child
                                    ? "bg-white/8 text-white"
                                    : "text-white/55 hover:bg-white/5 hover:pl-4 hover:text-white"
                                }
                              `}
                            >
                              {child}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <div className="h-3" />
          </div>
        </div>
      </aside>
    </>
  );
}
