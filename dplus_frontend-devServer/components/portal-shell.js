"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PortalHeader from "./portal-header";
import PortalSidebar from "./portal-sidebar";
import { isAuthenticated, readUser } from "../lib/portal-auth";

export default function PortalShell({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !readUser()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#09001A_0%,#0A1240_38%,#071224_100%)] text-white">
        Loading...
      </div>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden flex-col bg-[linear-gradient(180deg,#09001A_0%,#0A1240_38%,#071224_100%)] text-white">
      <PortalHeader isSidebarOpen={sidebarOpen} onSidebarToggle={() => setSidebarOpen((value) => !value)} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <PortalSidebar sidebarOpen={sidebarOpen} />
        <div className="flex min-h-0 flex-1 overflow-hidden border border-white/10 border-l border-l-white/10 bg-[linear-gradient(180deg,#0C1931_0%,#0B1730_100%)] shadow-[-1px_0_0_rgba(255,255,255,0.06)]">
          <section className="min-w-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#09001A_0%,#0A1240_38%,#071224_100%)]">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
