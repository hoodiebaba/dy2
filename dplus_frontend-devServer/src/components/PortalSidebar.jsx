import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, PanelLeftOpen, X } from "lucide-react";
import { portalMenu } from "./portalMenu";

function pathMatches(pathname, href) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PortalSidebar({
  isSidebarOpen,
  isMobileOpen,
  onMobileClose,
}) {
  const location = useLocation();
  const [openCategory, setOpenCategory] = useState("Insights Engine");

  const currentMenu = useMemo(() => portalMenu, []);

  useEffect(() => {
    const matched = currentMenu.find(
      (item) =>
        pathMatches(location.pathname, item.href) ||
        item.children?.some((child) => pathMatches(location.pathname, child.href))
    );

    if (matched?.type === "dropdown") {
      setOpenCategory(matched.title);
    }
  }, [currentMenu, location.pathname]);

  return (
    <>
      <div
        onClick={onMobileClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 overflow-hidden bg-[linear-gradient(180deg,#09001A_0%,#0A1240_38%,#071224_100%)] text-white transition-all duration-300 ease-in-out
          lg:sticky lg:top-0 lg:z-20 lg:h-full lg:min-h-0 lg:self-start lg:translate-x-0
          ${isSidebarOpen ? "w-[290px]" : "w-[88px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className={`flex min-h-[60px] items-center px-3 ${isSidebarOpen ? "justify-between" : "justify-center"}`}>
            {isSidebarOpen ? (
              <div className="flex items-center gap-3 px-2">
                <img src="/logo.png" alt="Datayog" className="h-8 w-auto" />
                <span className="text-sm font-semibold tracking-[0.18em] text-white/80">
                  NAVIGATION
                </span>
              </div>
            ) : (
              <img src="/logo.png" alt="Datayog" className="h-8 w-auto" />
            )}

            <button
              type="button"
              onClick={onMobileClose}
              className="inline-flex rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition-all duration-200 hover:border-[#F26522]/40 hover:bg-[#F26522]/10 hover:text-[#F26522] lg:hidden"
              aria-label="Close Sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!isSidebarOpen ? (
            <div className="hidden justify-center pb-3 lg:flex">
              <div className="h-px w-8 bg-white/10" />
            </div>
          ) : null}

          <div className="sidebar-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-4 pr-2">
            <div className="space-y-1.5">
              {currentMenu.map((item) => {
                const Icon = item.icon;
                const isLinkActive =
                  pathMatches(location.pathname, item.href) ||
                  item.children?.some((child) => pathMatches(location.pathname, child.href));

                if (item.type === "link") {
                  return (
                    <Link
                      key={item.title}
                      to={item.href || "#"}
                      title={!isSidebarOpen ? item.title : undefined}
                      onClick={onMobileClose}
                      className={`
                        group mx-3 flex items-center rounded-xl border transition-all duration-200
                        ${isSidebarOpen ? "gap-3 px-3 py-3" : "justify-center px-2 py-3"}
                        ${
                          isLinkActive
                            ? "border-[#F26522]/30 bg-[#F26522]/12 text-white shadow-[inset_0_0_0_1px_rgba(242,101,34,0.08)]"
                            : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {isSidebarOpen ? (
                        <span className="truncate text-[15px] font-medium">{item.title}</span>
                      ) : null}
                    </Link>
                  );
                }

                const isOpen = openCategory === item.title;

                return (
                  <div key={item.title} className="mx-3">
                    <button
                      type="button"
                      title={!isSidebarOpen ? item.title : undefined}
                      onClick={() => setOpenCategory((current) => (current === item.title ? "" : item.title))}
                      className={`
                        group flex w-full items-center rounded-xl border transition-all duration-200
                        ${isSidebarOpen ? "gap-3 px-3 py-3" : "justify-center px-2 py-3"}
                        ${
                          isLinkActive
                            ? "border-[#F26522]/30 bg-[#F26522]/12 text-white shadow-[inset_0_0_0_1px_rgba(242,101,34,0.08)]"
                            : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {isSidebarOpen ? (
                        <>
                          <span className="flex-1 truncate text-left text-[15px] font-medium">
                            {item.title}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </>
                      ) : null}
                    </button>

                    {isSidebarOpen && isOpen ? (
                      <div className="mt-1 space-y-1 rounded-xl border border-white/5 bg-black/10 p-2">
                        {item.children?.map((child) => {
                          const isChildActive = pathMatches(location.pathname, child.href);

                          return (
                            <Link
                              key={child.href}
                              to={child.href}
                              onClick={onMobileClose}
                              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                                isChildActive
                                  ? "bg-[#F26522]/12 text-white"
                                  : "text-white/65 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              {child.title}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {!isSidebarOpen ? (
            <div className="hidden justify-center px-3 pb-4 lg:flex">
              <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70">
                <PanelLeftOpen className="h-4 w-4" />
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
